# Video Editor MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the two-phase Video Editor MVP pipeline inside `media-mvp/` — `plan_video.py` (Director) drafts an edit plan (EDL) from a recorded narration + optional footage, and `process_video.py` (Workers→Ensamblador→QC) resolves B-roll, assembles the final video with `ffmpeg`, and runs automatic QC.

**Architecture:** Two CLI scripts (`plan_video.py`, `process_video.py`) built on four new pure-function modules (`edl.py`, `broll.py`, `qc.py`, `assemble.py`), reusing `analyze.py`'s existing transcription/metadata functions. No Claude Code subagents, no LLM calls inside the scripts — the EDL is built algorithmically from whisper's transcript segments and duration proportions. Approval between phases happens in the chat (Claude reads `plan.md`, writes `approved_plan.json`), not via an interactive terminal prompt.

**Tech Stack:** Python 3 stdlib only (`argparse`, `json`, `subprocess`, `urllib`, `re`) + `ffmpeg`/`ffprobe` CLI + `whisper` CLI (via `analyze.py`) + Pexels/Pixabay HTTP APIs (keys in `media-mvp/.env`, gitignored). No pytest — asserts + a tiny custom runner, same pattern as `media-mvp/test_regressions.py`.

**Spec:** `docs/superpowers/specs/2026-08-31-video-editor-mvp-design.md`

## Global Constraints

- v1 render engine is 100% `ffmpeg` — Remotion (`video-export/`) is explicitly out of scope.
- Narration is always pre-recorded audio provided by the user — no TTS in v1.
- Google Flow/Veo is never invoked from this pipeline — knowledge-only, external tool.
- No automatic music search/generation — the Director only proposes a mood/genre string; the user supplies the actual file.
- B-roll candidate selection is automatic (first result meeting duration + orientation) — no multi-candidate browsing UI.
- Plan approval is mediated by Claude in the chat, never an interactive terminal prompt — decisions are written directly into `approved_plan.json`.
- Every failure is explicit — no silent fallback, no "assume it's fine" (same convention as `analyze.py`): missing API key is fatal, unresolved B-roll stays `unresolved` (never substituted), `ffmpeg` failure is `sys.exit(1)` with real stderr, QC findings are `⚠️ WARN`, never silent.
- Testing: no pytest. Pure EDL/QC/assemble/broll functions get asserts + a custom runner (same shape as `test_regressions.py`). CLI orchestration scripts (`plan_video.py`, `process_video.py`) are validated by a real end-to-end run, not unit tests, matching `analyze.py`'s own `main()`.
- `media-mvp/.env` (gitignored) holds `PEXELS_API_KEY` and `PIXABAY_API_KEY` — already loaded on this machine from a prior session.
- All new script outputs live under `media-mvp/output/<project>/` (already gitignored).

---

## File Structure

- Create: `media-mvp/edl.py` — pure EDL construction: parse whisper's SRT, split duration into NEAPS/AIDA phase windows, chunk phases into shots, assign footage vs. B-roll, generate search keywords, propose music mood, render `plan.md`.
- Create: `media-mvp/test_edl.py` — tests for `edl.py`.
- Create: `media-mvp/broll.py` — Pexels/Pixabay search clients, candidate selection, download, per-shot resolution worker.
- Create: `media-mvp/test_broll.py` — tests for `broll.py` (network calls injected as fakes, no real HTTP).
- Create: `media-mvp/qc.py` — final-video QC checks (duration, resolution, captions presence, audio level) + report formatting.
- Create: `media-mvp/test_qc.py` — tests for `qc.py`.
- Create: `media-mvp/assemble.py` — `ffmpeg` command builders (trim, concat, subtitle burn, text plates, audio mix) + a fatal-on-failure runner.
- Create: `media-mvp/test_assemble.py` — tests for `assemble.py` (command-list construction only, no real `ffmpeg` invocation).
- Create: `media-mvp/plan_video.py` — Fase 1 CLI (Director): orchestrates `analyze.py` + `edl.py`, writes `plan.json`/`plan.md`/`captions.srt`.
- Create: `media-mvp/process_video.py` — Fase 2 CLI (Workers→Ensamblador→QC): reads `approved_plan.json`, resolves shots, assembles `final.mp4`, runs QC.
- Modify: `media-mvp/README.md` — document the two new scripts, the EDL schema, and known limitations (final task).
- Modify: `CLAUDE.md` — one-line update to the `media-mvp/` module description (final task).

---

### Task 1: `edl.py` — parse whisper's SRT into transcript segments

**Files:**
- Create: `media-mvp/edl.py`
- Create: `media-mvp/test_edl.py`

**Interfaces:**
- Produces: `edl.parse_srt_segments(srt_path: str) -> list[dict]`, each dict `{"start": float, "end": float, "text": str}`, sorted by `start`.

- [ ] **Step 1: Write the failing test**

Create `media-mvp/test_edl.py`:

```python
#!/usr/bin/env python3
"""
Tests para media-mvp/edl.py. Sin pytest — mismo patrón que
test_regressions.py: asserts simples + runner propio, sin invocar
ffmpeg/whisper/APIs reales.

Uso: python3 media-mvp/test_edl.py
"""

import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import edl  # noqa: E402


def _tmpdir():
    return tempfile.mkdtemp(prefix="media_mvp_edl_test_")


def test_parse_srt_segments_basic():
    d = _tmpdir()
    try:
        srt_path = os.path.join(d, "captions.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(
                "1\n00:00:00,000 --> 00:00:04,000\nYa puedes apostillar tu titulo\n\n"
                "2\n00:00:04,500 --> 00:00:08,000\nEntra al portal del SAREN\n\n"
            )
        segments = edl.parse_srt_segments(srt_path)
        assert len(segments) == 2, f"esperaba 2 segmentos, dio {len(segments)}"
        assert segments[0]["start"] == 0.0
        assert segments[0]["end"] == 4.0
        assert "apostillar" in segments[0]["text"]
        assert segments[1]["start"] == 4.5
    finally:
        shutil.rmtree(d)


def test_parse_srt_segments_ignores_blank_blocks():
    d = _tmpdir()
    try:
        srt_path = os.path.join(d, "captions.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write("1\n00:00:00,000 --> 00:00:01,000\nHola\n\n\n\n")
        segments = edl.parse_srt_segments(srt_path)
        assert len(segments) == 1, f"esperaba 1 segmento, dio {len(segments)}"
    finally:
        shutil.rmtree(d)


TESTS = [
    test_parse_srt_segments_basic,
    test_parse_srt_segments_ignores_blank_blocks,
]


def main():
    failures = []
    for test in TESTS:
        name = test.__name__
        try:
            test()
            print(f"PASS  {name}")
        except AssertionError as e:
            print(f"FAIL  {name}: {e}")
            failures.append(name)
        except Exception as e:
            print(f"ERROR {name}: {type(e).__name__}: {e}")
            failures.append(name)
    print()
    if failures:
        print(f"{len(failures)}/{len(TESTS)} tests fallaron: {', '.join(failures)}")
        sys.exit(1)
    print(f"{len(TESTS)}/{len(TESTS)} tests OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_edl.py`
Expected: `ModuleNotFoundError: No module named 'edl'` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `media-mvp/edl.py`:

```python
#!/usr/bin/env python3
"""
Funciones puras para construir el EDL (plan de edición) del Video Editor
MVP: parseo de transcripción, fases NEAPS/AIDA, chunking en planos,
asignación de footage/B-roll, keywords de búsqueda y renderizado de
plan.md. Sin efectos de lado (sin ffmpeg/whisper/HTTP reales) — eso vive
en plan_video.py, broll.py y process_video.py.
"""

import re

RE_SRT_TIME = re.compile(
    r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})"
)


def _srt_timestamp_to_seconds(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0


def parse_srt_segments(srt_path):
    """Parsea un .srt (formato de whisper: número de secuencia + timestamp +
    texto, separados por líneas en blanco) a una lista de segmentos
    [{"start": float, "end": float, "text": str}], ordenada por tiempo."""
    with open(srt_path, encoding="utf-8") as f:
        content = f.read()

    segments = []
    for block in content.strip().split("\n\n"):
        lines = [line for line in block.strip().split("\n") if line.strip()]
        if len(lines) < 2:
            continue

        has_seq_number = not RE_SRT_TIME.search(lines[0])
        time_line = lines[1] if has_seq_number else lines[0]
        text_start = 2 if has_seq_number else 1

        m = RE_SRT_TIME.search(time_line)
        if not m:
            continue

        start = _srt_timestamp_to_seconds(*m.groups()[0:4])
        end = _srt_timestamp_to_seconds(*m.groups()[4:8])
        text = " ".join(lines[text_start:]).strip()
        if text:
            segments.append({"start": round(start, 3), "end": round(end, 3), "text": text})

    return sorted(segments, key=lambda s: s["start"])
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_edl.py`
Expected: `2/2 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add edl.py test_edl.py
git commit -m "feat: parsear transcripción SRT en edl.py"
```

---

### Task 2: `edl.py` — fases NEAPS/AIDA a partir de la duración total

**Files:**
- Modify: `media-mvp/edl.py`
- Modify: `media-mvp/test_edl.py`

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces: `edl.PHASE_ORDER: list[str]`, `edl.PHASE_PROPORTIONS: dict[str, float]`, `edl.build_phase_windows(duration_s: float) -> list[dict]` con `{"phase": str, "start_s": float, "end_s": float}` por fase, en orden, cubriendo `[0, duration_s]` sin huecos.

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_edl.py` (antes de la lista `TESTS`):

```python
def test_build_phase_windows_covers_full_duration_in_order():
    windows = edl.build_phase_windows(47.0)
    assert windows[0]["start_s"] == 0.0
    assert windows[-1]["end_s"] == 47.0
    assert [w["phase"] for w in windows] == edl.PHASE_ORDER
    for i in range(len(windows) - 1):
        assert windows[i]["end_s"] == windows[i + 1]["start_s"], (
            f"hueco entre fase {i} y {i+1}"
        )


def test_build_phase_windows_proportions_sum_to_one():
    assert abs(sum(edl.PHASE_PROPORTIONS.values()) - 1.0) < 1e-9
```

Y añadir ambas funciones a la lista `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_edl.py`
Expected: `AttributeError: module 'edl' has no attribute 'build_phase_windows'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/edl.py`:

```python
# Fases narrativas NEAPS/AIDA (ver spec sección 3.2) y su proporción por
# defecto de la duración total. Derivadas del desglose plano-por-plano de
# reference/viral_video_standards.md (hook ~13%, contexto/autoridad ~10%,
# solución ~43% -el bloque de mayor duración, paso a paso-, prueba social
# ~7-10%, cierre ~13-18%). Suman 1.0 exactamente.
PHASE_ORDER = ["hook", "problema", "autoridad", "solucion", "prueba_social", "cierre"]

PHASE_PROPORTIONS = {
    "hook": 0.12,
    "problema": 0.10,
    "autoridad": 0.10,
    "solucion": 0.40,
    "prueba_social": 0.10,
    "cierre": 0.18,
}


def build_phase_windows(duration_s):
    """Reparte la duración total entre las 6 fases NEAPS/AIDA según
    PHASE_PROPORTIONS. La última fase absorbe el redondeo para que el
    total cubra exactamente [0, duration_s] sin huecos."""
    windows = []
    cursor = 0.0
    for i, phase in enumerate(PHASE_ORDER):
        is_last = i == len(PHASE_ORDER) - 1
        end = duration_s if is_last else round(cursor + duration_s * PHASE_PROPORTIONS[phase], 3)
        windows.append({"phase": phase, "start_s": round(cursor, 3), "end_s": end})
        cursor = end
    return windows
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_edl.py`
Expected: `4/4 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add edl.py test_edl.py
git commit -m "feat: fases NEAPS/AIDA por duracion en edl.py"
```

---

### Task 3: `edl.py` — keyword de búsqueda de B-roll a partir del subtítulo

**Files:**
- Modify: `media-mvp/edl.py`
- Modify: `media-mvp/test_edl.py`

**Interfaces:**
- Produces: `edl.STOPWORDS_ES: set[str]`, `edl.PHASE_GENERIC_KEYWORD: dict[str, str]` (una entrada por cada fase en `PHASE_ORDER`), `edl.generate_broll_keyword(subtitle_text: str, phase: str, max_words: int = 6) -> str`.

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_edl.py`:

```python
def test_generate_broll_keyword_strips_stopwords():
    kw = edl.generate_broll_keyword("el usuario entra al portal del SAREN", "solucion")
    assert "usuario" in kw
    assert "portal" in kw
    assert f" el " not in f" {kw} "


def test_generate_broll_keyword_falls_back_to_phase_generic():
    kw = edl.generate_broll_keyword("", "cierre")
    assert kw == edl.PHASE_GENERIC_KEYWORD["cierre"]
```

Y añadir ambas a `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_edl.py`
Expected: `AttributeError: module 'edl' has no attribute 'generate_broll_keyword'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/edl.py`:

```python
STOPWORDS_ES = {
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al",
    "a", "en", "y", "o", "que", "con", "por", "para", "es", "son", "tu",
    "su", "sus", "lo", "se", "no", "si", "ya", "te", "le", "les", "este",
    "esta", "estos", "estas", "como", "más", "mas", "muy", "pero", "porque",
    "cuando", "donde", "desde", "hasta", "sobre", "sin", "entre", "hay",
    "fue", "ser", "estar", "tener", "hacer", "puede", "puedes", "todo",
    "toda", "todos", "todas", "nos", "les",
}

# Keyword de respaldo por fase cuando el tramo no tiene texto de locución
# propio (ej. cae en un hueco de silencio de la transcripción).
PHASE_GENERIC_KEYWORD = {
    "hook": "persona sorprendida mirando celular",
    "problema": "persona preocupada revisando documentos",
    "autoridad": "oficina profesional escritorio computadora",
    "solucion": "manos escribiendo en laptop tramite digital",
    "prueba_social": "persona sonriendo satisfecha documento en mano",
    "cierre": "persona hablando a camara cierre",
}

RE_WORD = re.compile(r"[a-záéíóúñü]+")


def generate_broll_keyword(subtitle_text, phase, max_words=6):
    """Genera un keyword de búsqueda de B-roll a partir de las palabras de
    contenido (no vacías) del subtítulo del plano. Si no hay texto de
    locución para ese plano, cae al keyword genérico de la fase."""
    words = RE_WORD.findall(subtitle_text.lower())
    content_words = [w for w in words if len(w) > 3 and w not in STOPWORDS_ES]
    if not content_words:
        return PHASE_GENERIC_KEYWORD[phase]
    return " ".join(content_words[:max_words])
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_edl.py`
Expected: `6/6 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add edl.py test_edl.py
git commit -m "feat: generar keyword de broll desde subtitulo en edl.py"
```

---

### Task 4: `edl.py` — construir los planos (shots) del EDL

**Files:**
- Modify: `media-mvp/edl.py`
- Modify: `media-mvp/test_edl.py`

**Interfaces:**
- Consumes: `build_phase_windows()` (Task 2), `generate_broll_keyword()` (Task 3).
- Produces: `edl.build_shots(phase_windows: list[dict], transcript_segments: list[dict], footage_map: dict | None = None) -> list[dict]`. Cada shot: `{"id": int, "phase": str, "start_s": float, "end_s": float, "duration_s": float, "source_type": "footage_provided"|"broll_needed", "broll_keyword": str|None, "source_decision": None, "source_path": str|None, "source_offset_s": float, "subtitle_text": str, "is_breather": bool}`. `footage_map` es `{phase: {"path": str, "duration_s": float}}`.

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_edl.py`:

```python
def test_build_shots_respects_positive_duration():
    windows = edl.build_phase_windows(47.0)
    shots = edl.build_shots(windows, transcript_segments=[])
    assert len(shots) > 0
    for shot in shots:
        assert shot["duration_s"] > 0


def test_build_shots_marks_one_breather_before_cierre():
    windows = edl.build_phase_windows(47.0)
    shots = edl.build_shots(windows, transcript_segments=[])
    breathers = [s for s in shots if s["is_breather"]]
    assert len(breathers) == 1, f"esperaba 1 respiro, dio {len(breathers)}"
    assert breathers[0]["phase"] == "prueba_social"


def test_build_shots_uses_footage_before_broll():
    windows = edl.build_phase_windows(47.0)
    footage_map = {"hook": {"path": "/tmp/hook.mp4", "duration_s": 10.0}}
    shots = edl.build_shots(windows, transcript_segments=[], footage_map=footage_map)
    hook_shots = [s for s in shots if s["phase"] == "hook"]
    assert all(s["source_type"] == "footage_provided" for s in hook_shots)
    assert all(s["source_path"] == "/tmp/hook.mp4" for s in hook_shots)


def test_build_shots_falls_back_to_broll_when_footage_runs_out():
    windows = edl.build_phase_windows(47.0)
    footage_map = {"hook": {"path": "/tmp/hook.mp4", "duration_s": 1.0}}
    shots = edl.build_shots(windows, transcript_segments=[], footage_map=footage_map)
    hook_shots = [s for s in shots if s["phase"] == "hook"]
    assert any(s["source_type"] == "broll_needed" for s in hook_shots), (
        "con solo 1s de footage para una fase mas larga, algun plano debe caer a broll"
    )


def test_build_shots_assigns_subtitle_text_from_overlapping_segments():
    windows = edl.build_phase_windows(47.0)
    segments = [{"start": 0.0, "end": 4.0, "text": "Ya puedes apostillar tu titulo"}]
    shots = edl.build_shots(windows, transcript_segments=segments)
    assert "apostillar" in shots[0]["subtitle_text"]


def test_build_shots_footage_offsets_advance_sequentially():
    windows = edl.build_phase_windows(47.0)
    footage_map = {"hook": {"path": "/tmp/hook.mp4", "duration_s": 10.0}}
    shots = edl.build_shots(windows, transcript_segments=[], footage_map=footage_map)
    hook_shots = [s for s in shots if s["phase"] == "hook"]
    offsets = [s["source_offset_s"] for s in hook_shots]
    assert offsets == sorted(offsets), "los offsets dentro del mismo clip deben avanzar"
    assert offsets[0] == 0.0
```

Y añadir las seis a `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_edl.py`
Expected: `AttributeError: module 'edl' has no attribute 'build_shots'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/edl.py`:

```python
# Estándares de ritmo (reference/viral_video_standards.md sección 7): cortes
# cada 2-4s, ~3s en promedio. No se fuerzan estrictamente en fases muy
# cortas (ver Límites conocidos en README.md) — se documenta como
# aproximación, no como garantía dura.
MIN_SHOT_S = 2.0
MAX_SHOT_S = 4.0
TARGET_SHOT_S = 3.0


def _chunk_phase(start_s, end_s):
    """Divide una ventana de fase en tramos (start, end) de ~TARGET_SHOT_S,
    repartiendo el sobrante de forma pareja en vez de dejar un último tramo
    desproporcionado."""
    span = round(end_s - start_s, 3)
    if span <= 0:
        return []
    n_shots = max(1, round(span / TARGET_SHOT_S))
    shot_len = span / n_shots
    spans = []
    cursor = start_s
    for i in range(n_shots):
        is_last = i == n_shots - 1
        shot_end = end_s if is_last else round(cursor + shot_len, 3)
        spans.append((round(cursor, 3), shot_end))
        cursor = shot_end
    return spans


def _flag_breather_shot(shots):
    """Marca como plano de respiro el último plano de 'prueba_social'
    (justo antes del cierre — ver spec sección 3.2). Si esa fase no
    produjo ningún plano (fase muy corta), usa el primero de 'cierre'."""
    prueba_social_shots = [s for s in shots if s["phase"] == "prueba_social"]
    if prueba_social_shots:
        prueba_social_shots[-1]["is_breather"] = True
        return
    cierre_shots = [s for s in shots if s["phase"] == "cierre"]
    if cierre_shots:
        cierre_shots[0]["is_breather"] = True


def build_shots(phase_windows, transcript_segments, footage_map=None):
    """Construye la lista ordenada de planos del EDL borrador: chunkea cada
    fase en tramos de ritmo, decide footage propio vs. B-roll consumiendo
    footage_map en orden dentro de cada fase, y asigna el subtítulo de cada
    tramo a partir de los segmentos de transcripción que lo solapan."""
    footage_map = footage_map or {}
    shots = []
    shot_id = 1

    for window in phase_windows:
        phase = window["phase"]
        footage = footage_map.get(phase)
        footage_remaining = footage["duration_s"] if footage else 0.0

        for span_start, span_end in _chunk_phase(window["start_s"], window["end_s"]):
            span_dur = round(span_end - span_start, 3)
            overlapping = [
                seg for seg in transcript_segments
                if seg["start"] < span_end and seg["end"] > span_start
            ]
            subtitle_text = " ".join(seg["text"] for seg in overlapping).strip()

            if footage and footage_remaining >= span_dur:
                source_type = "footage_provided"
                broll_keyword = None
                source_path = footage["path"]
                source_offset_s = round(footage["duration_s"] - footage_remaining, 3)
                footage_remaining = round(footage_remaining - span_dur, 3)
            else:
                source_type = "broll_needed"
                broll_keyword = generate_broll_keyword(subtitle_text, phase)
                source_path = None
                source_offset_s = 0.0

            shots.append({
                "id": shot_id,
                "phase": phase,
                "start_s": span_start,
                "end_s": span_end,
                "duration_s": span_dur,
                "source_type": source_type,
                "broll_keyword": broll_keyword,
                "source_decision": None,
                "source_path": source_path,
                "source_offset_s": source_offset_s,
                "subtitle_text": subtitle_text,
                "is_breather": False,
            })
            shot_id += 1

    _flag_breather_shot(shots)
    return shots
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_edl.py`
Expected: `10/10 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add edl.py test_edl.py
git commit -m "feat: construir planos del EDL en edl.py"
```

---

### Task 5: `edl.py` — dirección de música + ensamblado del EDL completo

**Files:**
- Modify: `media-mvp/edl.py`
- Modify: `media-mvp/test_edl.py`

**Interfaces:**
- Consumes: `build_phase_windows()` (Task 2), `build_shots()` (Task 4).
- Produces: `edl.DEFAULT_MUSIC_MOOD: str`, `edl.propose_music_direction(brief_text: str) -> str`, `edl.build_edl(project_name: str, brief_text: str, narration_path: str, captions_srt_path: str, transcript_segments: list[dict], duration_s: float, footage_map: dict | None = None) -> dict` con claves `project, brief, narration_path, captions_srt_path, duration_s, music_direction, music_path, shots`.

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_edl.py`:

```python
def test_propose_music_direction_default():
    mood = edl.propose_music_direction("Un video sobre apostilla de titulos")
    assert mood == edl.DEFAULT_MUSIC_MOOD


def test_propose_music_direction_matches_brief_keyword():
    mood = edl.propose_music_direction("Necesito un video urgente para hoy")
    assert mood == edl.MUSIC_MOOD_BY_BRIEF_KEYWORD["urgente"]


def test_build_edl_shape():
    segments = [{"start": 0.0, "end": 4.0, "text": "hola"}]
    result = edl.build_edl(
        "test-project", "brief corto", "/tmp/narracion.wav", "/tmp/captions.srt",
        segments, 47.0,
    )
    assert result["project"] == "test-project"
    assert result["narration_path"] == "/tmp/narracion.wav"
    assert result["captions_srt_path"] == "/tmp/captions.srt"
    assert result["duration_s"] == 47.0
    assert result["music_path"] is None
    assert len(result["shots"]) > 0
    assert "music_direction" in result
```

Y añadir las tres a `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_edl.py`
Expected: `AttributeError: module 'edl' has no attribute 'propose_music_direction'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/edl.py`:

```python
MUSIC_MOOD_BY_BRIEF_KEYWORD = {
    "urgente": "electrónico energético, tempo alto, percusión marcada",
    "legal": "instrumental corporativo, ritmo moderado, sin voces",
    "emotivo": "piano/cuerdas suaves, tempo lento",
}

# Mood por defecto derivado del análisis real en reference/viral_video_standards.md
# sección 6: pista rítmica instrumental moderna continua.
DEFAULT_MUSIC_MOOD = "instrumental moderno, ritmo medio, sin voces"


def propose_music_direction(brief_text):
    """Propone un mood/género de música a partir de palabras clave simples
    del brief. Nunca busca ni genera el archivo — eso lo aporta el usuario
    (ver spec sección 1, fuera de alcance de v1)."""
    brief_lower = brief_text.lower()
    for keyword, mood in MUSIC_MOOD_BY_BRIEF_KEYWORD.items():
        if keyword in brief_lower:
            return mood
    return DEFAULT_MUSIC_MOOD


def build_edl(project_name, brief_text, narration_path, captions_srt_path,
               transcript_segments, duration_s, footage_map=None):
    """Ensambla el EDL borrador completo: fases -> planos -> plan.json.
    music_path queda en None -- lo llena Claude en la fase de aprobación
    (approved_plan.json), igual que source_decision de cada plano."""
    phase_windows = build_phase_windows(duration_s)
    shots = build_shots(phase_windows, transcript_segments, footage_map)
    return {
        "project": project_name,
        "brief": brief_text,
        "narration_path": narration_path,
        "captions_srt_path": captions_srt_path,
        "duration_s": duration_s,
        "music_direction": propose_music_direction(brief_text),
        "music_path": None,
        "shots": shots,
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_edl.py`
Expected: `13/13 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add edl.py test_edl.py
git commit -m "feat: proponer musica y ensamblar EDL completo en edl.py"
```

---

### Task 6: `edl.py` — renderizar `plan.md` legible

**Files:**
- Modify: `media-mvp/edl.py`
- Modify: `media-mvp/test_edl.py`

**Interfaces:**
- Consumes: `build_edl()` (Task 5).
- Produces: `edl.render_plan_markdown(edl_dict: dict) -> str`.

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_edl.py`:

```python
def test_render_plan_markdown_flags_unresolved_broll():
    result = edl.build_edl(
        "test-project", "brief", "/tmp/n.wav", "/tmp/c.srt", [], 20.0,
    )
    md = edl.render_plan_markdown(result)
    assert "Plan de edición" in md
    assert "Huecos de B-roll a resolver" in md
    assert "test-project" in md


def test_render_plan_markdown_shows_footage_when_provided():
    footage_map = {"hook": {"path": "/tmp/hook.mp4", "duration_s": 10.0}}
    result = edl.build_edl(
        "test-project", "brief", "/tmp/n.wav", "/tmp/c.srt", [], 20.0, footage_map,
    )
    md = edl.render_plan_markdown(result)
    assert "/tmp/hook.mp4" in md
```

Y añadir ambas a `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_edl.py`
Expected: `AttributeError: module 'edl' has no attribute 'render_plan_markdown'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/edl.py`:

```python
def render_plan_markdown(edl_dict):
    """Versión legible del EDL para presentar en el chat durante la
    aprobación (spec sección 3, 'Aprobación'). Nunca se lee por código —
    solo por el usuario/Claude."""
    lines = [
        f"# Plan de edición — {edl_dict['project']}",
        "",
        f"**Brief:** {edl_dict['brief']}",
        f"**Duración total:** {edl_dict['duration_s']:.1f}s",
        f"**Dirección de música propuesta:** {edl_dict['music_direction']}",
        "",
        "## Planos",
        "",
        "| # | Fase | Inicio | Fin | Dur | Fuente | Subtítulo / Keyword B-roll | Respiro |",
        "|---|---|---|---|---|---|---|---|",
    ]

    unresolved_count = 0
    for shot in edl_dict["shots"]:
        if shot["source_type"] == "footage_provided":
            fuente = f"footage propio ({shot['source_path']})"
            texto = shot["subtitle_text"] or "—"
        else:
            fuente = "**FALTA B-ROLL**"
            texto = f"keyword sugerido: `{shot['broll_keyword']}`"
            unresolved_count += 1
        breather = "🌬️" if shot["is_breather"] else ""
        lines.append(
            f"| {shot['id']} | {shot['phase']} | {shot['start_s']:.1f}s | "
            f"{shot['end_s']:.1f}s | {shot['duration_s']:.1f}s | {fuente} | "
            f"{texto} | {breather} |"
        )

    lines += [
        "",
        f"## Huecos de B-roll a resolver: {unresolved_count}",
        "",
        "Por cada hueco, decide: `user_provides` (subes el archivo) o "
        "`agent_searches` (Pexels/Pixabay con el keyword sugerido). Confirma "
        "también el archivo de música o si se resuelve manualmente después.",
    ]
    return "\n".join(lines)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_edl.py`
Expected: `15/15 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add edl.py test_edl.py
git commit -m "feat: renderizar plan.md legible en edl.py"
```

---

### Task 7: `broll.py` — selección de candidato y parseo de resultados Pexels/Pixabay

**Files:**
- Create: `media-mvp/broll.py`
- Create: `media-mvp/test_broll.py`

**Interfaces:**
- Produces: `broll.choose_best_candidate(candidates: list[dict], min_duration_s: float) -> dict | None` (candidato: `{"id","duration_s","width","height","download_url"}`), `broll._pexels_candidates(raw_json: dict) -> list[dict]`, `broll._pixabay_candidates(raw_json: dict) -> list[dict]`.

- [ ] **Step 1: Write the failing test**

Crear `media-mvp/test_broll.py`:

```python
#!/usr/bin/env python3
"""
Tests para media-mvp/broll.py. Sin pytest, sin red real — las funciones de
red (search_pexels/search_pixabay/download_asset) se inyectan como fakes.

Uso: python3 media-mvp/test_broll.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import broll  # noqa: E402


def test_choose_best_candidate_picks_first_valid():
    candidates = [
        {"id": "a", "duration_s": 1.0, "width": 1080, "height": 1920, "download_url": "u1"},
        {"id": "b", "duration_s": 5.0, "width": 1080, "height": 1920, "download_url": "u2"},
        {"id": "c", "duration_s": 6.0, "width": 1920, "height": 1080, "download_url": "u3"},
    ]
    best = broll.choose_best_candidate(candidates, min_duration_s=3.0)
    assert best is not None
    assert best["id"] == "b", f"esperaba 'b' (primero valido: dur>=3, vertical), dio {best['id']}"


def test_choose_best_candidate_returns_none_when_nothing_qualifies():
    candidates = [
        {"id": "a", "duration_s": 1.0, "width": 1080, "height": 1920, "download_url": "u1"},
        {"id": "b", "duration_s": 6.0, "width": 1920, "height": 1080, "download_url": "u2"},
    ]
    best = broll.choose_best_candidate(candidates, min_duration_s=3.0)
    assert best is None


def test_pexels_candidates_parses_video_files():
    raw = {
        "videos": [
            {
                "id": 123,
                "duration": 8,
                "video_files": [
                    {"link": "low.mp4", "width": 480, "height": 852},
                    {"link": "high.mp4", "width": 1080, "height": 1920},
                ],
            }
        ]
    }
    candidates = broll._pexels_candidates(raw)
    assert len(candidates) == 1
    assert candidates[0]["id"] == "pexels:123"
    assert candidates[0]["download_url"] == "high.mp4"
    assert candidates[0]["width"] == 1080


def test_pixabay_candidates_parses_hits():
    raw = {
        "hits": [
            {
                "id": 456,
                "duration": 10,
                "videos": {"large": {"url": "l.mp4", "width": 1280, "height": 720}},
            }
        ]
    }
    candidates = broll._pixabay_candidates(raw)
    assert len(candidates) == 1
    assert candidates[0]["id"] == "pixabay:456"
    assert candidates[0]["download_url"] == "l.mp4"


TESTS = [
    test_choose_best_candidate_picks_first_valid,
    test_choose_best_candidate_returns_none_when_nothing_qualifies,
    test_pexels_candidates_parses_video_files,
    test_pixabay_candidates_parses_hits,
]


def main():
    failures = []
    for test in TESTS:
        name = test.__name__
        try:
            test()
            print(f"PASS  {name}")
        except AssertionError as e:
            print(f"FAIL  {name}: {e}")
            failures.append(name)
        except Exception as e:
            print(f"ERROR {name}: {type(e).__name__}: {e}")
            failures.append(name)
    print()
    if failures:
        print(f"{len(failures)}/{len(TESTS)} tests fallaron: {', '.join(failures)}")
        sys.exit(1)
    print(f"{len(TESTS)}/{len(TESTS)} tests OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_broll.py`
Expected: `ModuleNotFoundError: No module named 'broll'`

- [ ] **Step 3: Write minimal implementation**

Crear `media-mvp/broll.py`:

```python
#!/usr/bin/env python3
"""
Cliente de búsqueda de B-roll (Pexels/Pixabay), selección de candidato y
descarga. Las funciones de red aceptan un fetch_fn/download_fn inyectable
para poder testear sin llamadas HTTP reales (ver test_broll.py).
"""

import json
import os
import sys
import urllib.parse
import urllib.request

PEXELS_SEARCH_URL = "https://api.pexels.com/videos/search"
PIXABAY_SEARCH_URL = "https://pixabay.com/api/videos/"


def choose_best_candidate(candidates, min_duration_s):
    """Elige el primer candidato que cumpla duración mínima y orientación
    vertical (height > width). None si ninguno cumple — nunca se sustituye
    con algo que no cumple criterio (spec sección 5)."""
    for c in candidates:
        if c["duration_s"] < min_duration_s:
            continue
        if c["height"] <= c["width"]:
            continue
        return c
    return None


def _pexels_candidates(raw_json):
    candidates = []
    for video in raw_json.get("videos", []):
        files = [f for f in video.get("video_files", []) if f.get("link")]
        if not files:
            continue
        best_file = max(files, key=lambda f: f.get("width", 0))
        candidates.append({
            "id": f"pexels:{video['id']}",
            "duration_s": float(video.get("duration", 0)),
            "width": best_file.get("width", 0),
            "height": best_file.get("height", 0),
            "download_url": best_file["link"],
        })
    return candidates


def _pixabay_candidates(raw_json):
    candidates = []
    for hit in raw_json.get("hits", []):
        videos = hit.get("videos", {})
        best = videos.get("large") or videos.get("medium") or videos.get("small")
        if not best:
            continue
        candidates.append({
            "id": f"pixabay:{hit['id']}",
            "duration_s": float(hit.get("duration", 0)),
            "width": best.get("width", 0),
            "height": best.get("height", 0),
            "download_url": best.get("url"),
        })
    return candidates
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_broll.py`
Expected: `4/4 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add broll.py test_broll.py
git commit -m "feat: seleccion de candidato broll y parseo pexels/pixabay"
```

---

### Task 8: `broll.py` — búsqueda HTTP, descarga y worker de resolución por plano

**Files:**
- Modify: `media-mvp/broll.py`
- Modify: `media-mvp/test_broll.py`

**Interfaces:**
- Consumes: `choose_best_candidate()`, `_pexels_candidates()`, `_pixabay_candidates()` (Task 7).
- Produces: `broll._http_get_json(url, headers=None, timeout=15) -> dict`, `broll.search_pexels(keyword, api_key, fetch_fn=_http_get_json) -> list[dict]`, `broll.search_pixabay(keyword, api_key, fetch_fn=_http_get_json) -> list[dict]`, `broll.download_asset(download_url, dest_path) -> str`, `broll.resolve_broll_worker(shot: dict, pexels_key: str, pixabay_key: str, output_dir: str, search_pexels_fn=search_pexels, search_pixabay_fn=search_pixabay, download_fn=download_asset) -> dict` (muta y devuelve `shot`, con `source_path` resuelto o `None` si `unresolved`).

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_broll.py`:

```python
def test_search_pexels_fatal_without_api_key():
    raised = False
    try:
        broll.search_pexels("oficina", api_key=None)
    except SystemExit:
        raised = True
    assert raised, "esperaba SystemExit sin PEXELS_API_KEY"


def test_search_pexels_uses_injected_fetch_fn():
    def fake_fetch(url, headers=None, timeout=15):
        assert "oficina" in url
        return {"videos": [{"id": 1, "duration": 5, "video_files": [
            {"link": "x.mp4", "width": 1080, "height": 1920}
        ]}]}

    candidates = broll.search_pexels("oficina", api_key="fake-key", fetch_fn=fake_fetch)
    assert len(candidates) == 1
    assert candidates[0]["id"] == "pexels:1"


def test_resolve_broll_worker_marks_unresolved_when_nothing_found():
    shot = {"id": 7, "broll_keyword": "algo muy raro", "duration_s": 3.0, "source_path": None}

    def no_results_pexels(keyword, api_key):
        return []

    def no_results_pixabay(keyword, api_key):
        return []

    result = broll.resolve_broll_worker(
        shot, "pk", "pxk", "/tmp",
        search_pexels_fn=no_results_pexels, search_pixabay_fn=no_results_pixabay,
    )
    assert result["source_path"] is None


def test_resolve_broll_worker_downloads_first_valid_pexels_result():
    shot = {"id": 8, "broll_keyword": "oficina", "duration_s": 3.0, "source_path": None,
            "source_offset_s": 0.0}
    downloaded = {}

    def fake_pexels(keyword, api_key):
        return [{"id": "pexels:9", "duration_s": 5.0, "width": 1080, "height": 1920,
                  "download_url": "http://example.com/clip.mp4"}]

    def fake_download(url, dest_path):
        downloaded["url"] = url
        downloaded["dest_path"] = dest_path
        return dest_path

    result = broll.resolve_broll_worker(
        shot, "pk", "pxk", "/tmp/proyecto",
        search_pexels_fn=fake_pexels, download_fn=fake_download,
    )
    assert result["source_path"] == downloaded["dest_path"]
    assert downloaded["url"] == "http://example.com/clip.mp4"
    assert "shot8" in downloaded["dest_path"]
```

Y añadir las cuatro a `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_broll.py`
Expected: `AttributeError: module 'broll' has no attribute 'search_pexels'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/broll.py`:

```python
def _http_get_json(url, headers=None, timeout=15):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_pexels(keyword, api_key, fetch_fn=_http_get_json):
    if not api_key:
        print("ERROR: PEXELS_API_KEY no configurada.", file=sys.stderr)
        sys.exit(1)
    url = f"{PEXELS_SEARCH_URL}?{urllib.parse.urlencode({'query': keyword, 'orientation': 'portrait', 'per_page': 15})}"
    try:
        raw = fetch_fn(url, headers={"Authorization": api_key})
    except Exception as e:
        print(f"ERROR: búsqueda en Pexels falló para '{keyword}': {e}", file=sys.stderr)
        return []
    return _pexels_candidates(raw)


def search_pixabay(keyword, api_key, fetch_fn=_http_get_json):
    if not api_key:
        print("ERROR: PIXABAY_API_KEY no configurada.", file=sys.stderr)
        sys.exit(1)
    params = {"key": api_key, "q": keyword, "video_type": "film", "per_page": 15}
    url = f"{PIXABAY_SEARCH_URL}?{urllib.parse.urlencode(params)}"
    try:
        raw = fetch_fn(url)
    except Exception as e:
        print(f"ERROR: búsqueda en Pixabay falló para '{keyword}': {e}", file=sys.stderr)
        return []
    return _pixabay_candidates(raw)


def download_asset(download_url, dest_path):
    req = urllib.request.Request(download_url)
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest_path, "wb") as f:
        f.write(resp.read())
    return dest_path


def resolve_broll_worker(shot, pexels_key, pixabay_key, output_dir,
                          search_pexels_fn=search_pexels, search_pixabay_fn=search_pixabay,
                          download_fn=download_asset):
    """Resuelve un plano 'agent_searches': busca en Pexels, si no hay
    resultado válido intenta Pixabay, descarga el primero que cumpla
    duración/orientación. Si ninguno cumple, deja source_path en None
    ('unresolved') — nunca sustituye con algo que no cumple criterio."""
    keyword = shot["broll_keyword"]
    candidates = search_pexels_fn(keyword, pexels_key)
    best = choose_best_candidate(candidates, shot["duration_s"])
    source = "pexels"

    if best is None:
        candidates = search_pixabay_fn(keyword, pixabay_key)
        best = choose_best_candidate(candidates, shot["duration_s"])
        source = "pixabay"

    if best is None:
        shot["source_path"] = None
        return shot

    dest = os.path.join(output_dir, f"broll_shot{shot['id']}_{source}.mp4")
    download_fn(best["download_url"], dest)
    shot["source_path"] = dest
    shot["source_offset_s"] = 0.0
    return shot
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_broll.py`
Expected: `8/8 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add broll.py test_broll.py
git commit -m "feat: busqueda http y worker de resolucion de broll"
```

---

### Task 9: `qc.py` — checks puros de duración, resolución, captions y audio

**Files:**
- Create: `media-mvp/qc.py`
- Create: `media-mvp/test_qc.py`

**Interfaces:**
- Produces: `qc.check_duration(actual_duration_s, expected_duration_s, tolerance_s=1.5) -> dict`, `qc.check_resolution(width, height, expected_w=1080, expected_h=1920) -> dict`, `qc.check_captions_present(captions_srt_path) -> dict`, `qc.check_audio_levels(mean_volume_db) -> dict`. Cada uno devuelve `{"status": "OK"|"WARN", ...}`.

- [ ] **Step 1: Write the failing test**

Crear `media-mvp/test_qc.py`:

```python
#!/usr/bin/env python3
"""
Tests para media-mvp/qc.py. Sin pytest, sin ffmpeg/ffprobe reales — solo
las funciones de verificación puras.

Uso: python3 media-mvp/test_qc.py
"""

import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qc  # noqa: E402


def _tmpdir():
    return tempfile.mkdtemp(prefix="media_mvp_qc_test_")


def test_check_duration_within_tolerance_is_ok():
    result = qc.check_duration(actual_duration_s=30.2, expected_duration_s=30.0)
    assert result["status"] == "OK"


def test_check_duration_outside_tolerance_is_warn():
    result = qc.check_duration(actual_duration_s=35.0, expected_duration_s=30.0)
    assert result["status"] == "WARN"


def test_check_resolution_matches_is_ok():
    result = qc.check_resolution(1080, 1920)
    assert result["status"] == "OK"


def test_check_resolution_mismatch_is_warn():
    result = qc.check_resolution(1920, 1080)
    assert result["status"] == "WARN"


def test_check_captions_present_missing_file_is_warn():
    d = _tmpdir()
    try:
        result = qc.check_captions_present(os.path.join(d, "no-existe.srt"))
        assert result["status"] == "WARN"
    finally:
        shutil.rmtree(d)


def test_check_captions_present_nonempty_file_is_ok():
    d = _tmpdir()
    try:
        path = os.path.join(d, "captions.srt")
        with open(path, "w", encoding="utf-8") as f:
            f.write("1\n00:00:00,000 --> 00:00:01,000\nHola\n\n")
        result = qc.check_captions_present(path)
        assert result["status"] == "OK"
    finally:
        shutil.rmtree(d)


def test_check_audio_levels_in_range_is_ok():
    result = qc.check_audio_levels(-15.0)
    assert result["status"] == "OK"


def test_check_audio_levels_too_quiet_is_warn():
    result = qc.check_audio_levels(-40.0)
    assert result["status"] == "WARN"


def test_check_audio_levels_unmeasurable_is_warn():
    result = qc.check_audio_levels(None)
    assert result["status"] == "WARN"


TESTS = [
    test_check_duration_within_tolerance_is_ok,
    test_check_duration_outside_tolerance_is_warn,
    test_check_resolution_matches_is_ok,
    test_check_resolution_mismatch_is_warn,
    test_check_captions_present_missing_file_is_warn,
    test_check_captions_present_nonempty_file_is_ok,
    test_check_audio_levels_in_range_is_ok,
    test_check_audio_levels_too_quiet_is_warn,
    test_check_audio_levels_unmeasurable_is_warn,
]


def main():
    failures = []
    for test in TESTS:
        name = test.__name__
        try:
            test()
            print(f"PASS  {name}")
        except AssertionError as e:
            print(f"FAIL  {name}: {e}")
            failures.append(name)
        except Exception as e:
            print(f"ERROR {name}: {type(e).__name__}: {e}")
            failures.append(name)
    print()
    if failures:
        print(f"{len(failures)}/{len(TESTS)} tests fallaron: {', '.join(failures)}")
        sys.exit(1)
    print(f"{len(TESTS)}/{len(TESTS)} tests OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_qc.py`
Expected: `ModuleNotFoundError: No module named 'qc'`

- [ ] **Step 3: Write minimal implementation**

Crear `media-mvp/qc.py`:

```python
#!/usr/bin/env python3
"""
QC automático del final.mp4: duración, resolución, presencia de captions y
nivel de audio. Cada check devuelve OK/WARN explícito, nunca falla en
silencio (spec sección 5) — un WARN no bloquea la entrega del .mp4.
"""

import os
import re
import subprocess

DEFAULT_DURATION_TOLERANCE_S = 1.5
EXPECTED_WIDTH = 1080
EXPECTED_HEIGHT = 1920

# Rango aproximado de mean_volume (ffmpeg volumedetect) esperado en el
# máster final ya mezclado (voz + música con ducking). Es una medición
# aproximada, no LUFS real -- ver "Límites conocidos" en README.md.
AUDIO_MEAN_VOLUME_MIN_DB = -23.0
AUDIO_MEAN_VOLUME_MAX_DB = -8.0

RE_MEAN_VOLUME = re.compile(r"mean_volume:\s*(-?[\d.]+)\s*dB")


def check_duration(actual_duration_s, expected_duration_s, tolerance_s=DEFAULT_DURATION_TOLERANCE_S):
    diff = abs(actual_duration_s - expected_duration_s)
    status = "OK" if diff <= tolerance_s else "WARN"
    message = "" if status == "OK" else f"diferencia de {diff:.1f}s excede tolerancia de {tolerance_s}s"
    return {"status": status, "actual_s": actual_duration_s, "expected_s": expected_duration_s,
            "diff_s": round(diff, 2), "message": message}


def check_resolution(width, height, expected_w=EXPECTED_WIDTH, expected_h=EXPECTED_HEIGHT):
    status = "OK" if (width == expected_w and height == expected_h) else "WARN"
    message = "" if status == "OK" else f"se esperaba {expected_w}x{expected_h}, salió {width}x{height}"
    return {"status": status, "actual": f"{width}x{height}",
            "expected": f"{expected_w}x{expected_h}", "message": message}


def check_captions_present(captions_srt_path):
    if not os.path.isfile(captions_srt_path):
        return {"status": "WARN", "message": "captions.srt no encontrado"}
    content = open(captions_srt_path, encoding="utf-8").read().strip()
    status = "OK" if content else "WARN"
    message = "" if content else "captions.srt está vacío"
    return {"status": status, "message": message}


def check_audio_levels(mean_volume_db):
    if mean_volume_db is None:
        return {"status": "WARN", "message": "no se pudo medir el nivel de audio"}
    in_range = AUDIO_MEAN_VOLUME_MIN_DB <= mean_volume_db <= AUDIO_MEAN_VOLUME_MAX_DB
    status = "OK" if in_range else "WARN"
    message = "" if in_range else (
        f"nivel fuera de rango esperado ({mean_volume_db:.1f}dB, esperado "
        f"{AUDIO_MEAN_VOLUME_MIN_DB} a {AUDIO_MEAN_VOLUME_MAX_DB}dB)"
    )
    return {"status": status, "mean_volume_db": mean_volume_db, "message": message}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_qc.py`
Expected: `9/9 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add qc.py test_qc.py
git commit -m "feat: checks de QC puros para el video final"
```

---

### Task 10: `qc.py` — medición real (ffprobe/ffmpeg), `run_qc` y reporte formateado

**Files:**
- Modify: `media-mvp/qc.py`
- Modify: `media-mvp/test_qc.py`

**Interfaces:**
- Consumes: `check_duration`, `check_resolution`, `check_captions_present`, `check_audio_levels` (Task 9).
- Produces: `qc.probe_duration_and_resolution(video_path) -> dict | None`, `qc.measure_audio_level(video_path) -> float | None`, `qc.run_qc(final_path, captions_srt_path, expected_duration_s) -> dict`, `qc.format_qc_report(report: dict) -> str`.

- [ ] **Step 1: Write the failing test**

Añadir a `media-mvp/test_qc.py`:

```python
def test_format_qc_report_flags_warn_visibly():
    report = {
        "duration": {"status": "OK", "message": ""},
        "resolution": {"status": "WARN", "message": "se esperaba 1080x1920, salió 1920x1080"},
        "captions": {"status": "OK", "message": ""},
        "audio": {"status": "OK", "message": ""},
    }
    text = qc.format_qc_report(report)
    assert "resolution" in text
    assert "WARN" in text
    assert "se esperaba 1080x1920" in text


def test_format_qc_report_fatal_short_circuits():
    report = {"status": "FATAL", "message": "ffprobe no pudo leer 'x.mp4'"}
    text = qc.format_qc_report(report)
    assert "FATAL" in text
    assert "x.mp4" in text
```

Y añadir ambas a `TESTS`.

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_qc.py`
Expected: `AttributeError: module 'qc' has no attribute 'format_qc_report'`

- [ ] **Step 3: Write minimal implementation**

Añadir a `media-mvp/qc.py`:

```python
import json


def probe_duration_and_resolution(video_path):
    cmd = [
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", video_path,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        return None
    raw = json.loads(r.stdout)
    fmt = raw.get("format", {})
    video_stream = next((s for s in raw.get("streams", []) if s.get("codec_type") == "video"), None)
    return {
        "duration_s": float(fmt.get("duration", 0.0)),
        "width": video_stream.get("width") if video_stream else None,
        "height": video_stream.get("height") if video_stream else None,
    }


def measure_audio_level(video_path):
    # volumedetect imprime a nivel 'info', no 'error' — nunca usar -v error
    # aquí (mismo hallazgo documentado en analyze.py/handoff.md).
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", video_path,
        "-af", "volumedetect", "-f", "null", "-",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    m = RE_MEAN_VOLUME.search(r.stderr)
    return float(m.group(1)) if m else None


def run_qc(final_path, captions_srt_path, expected_duration_s):
    probe = probe_duration_and_resolution(final_path)
    if probe is None:
        return {"status": "FATAL", "message": f"ffprobe no pudo leer '{final_path}'"}

    return {
        "duration": check_duration(probe["duration_s"], expected_duration_s),
        "resolution": check_resolution(probe["width"], probe["height"]),
        "captions": check_captions_present(captions_srt_path),
        "audio": check_audio_levels(measure_audio_level(final_path)),
    }


def format_qc_report(report):
    if report.get("status") == "FATAL":
        return f"QC  FATAL — {report['message']}"

    lines = ["--- QC final ---"]
    for name, check in report.items():
        flag = "OK" if check["status"] == "OK" else "⚠️  WARN"
        extra = f" — {check['message']}" if check.get("message") else ""
        lines.append(f"{name:12s} {flag}{extra}")
    return "\n".join(lines)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_qc.py`
Expected: `11/11 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add qc.py test_qc.py
git commit -m "feat: medicion real y reporte de QC formateado"
```

---

### Task 11: `assemble.py` — construcción de comandos ffmpeg (trim, concat, subtítulos, placas, mezcla de audio)

**Files:**
- Create: `media-mvp/assemble.py`
- Create: `media-mvp/test_assemble.py`

**Interfaces:**
- Produces: `assemble.build_trim_command(source_path, source_offset_s, duration_s, dest_path, width=1080, height=1920, fps=30) -> list[str]`, `assemble.build_concat_command(shot_clip_paths, concat_list_path, dest_path) -> list[str]`, `assemble.build_subtitle_command(video_path, srt_path, dest_path, style=...) -> list[str]`, `assemble.build_text_plates_command(video_path, shots, dest_path, fontfile=...) -> list[str] | None` (None si no hay planos hook/cierre con texto), `assemble.build_audio_mix_command(video_path, narration_path, music_path, dest_path, duck_db=-19) -> list[str]`, `assemble.build_narration_only_command(video_path, narration_path, dest_path) -> list[str]`.

- [ ] **Step 1: Write the failing test**

Crear `media-mvp/test_assemble.py`:

```python
#!/usr/bin/env python3
"""
Tests para media-mvp/assemble.py. Sin pytest, sin invocar ffmpeg real —
solo se valida la forma de los comandos construidos (listas de argv).

Uso: python3 media-mvp/test_assemble.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import assemble  # noqa: E402


def test_build_trim_command_includes_offset_and_duration():
    cmd = assemble.build_trim_command("/src/clip.mp4", 2.5, 3.0, "/out/shot1.mp4")
    assert cmd[0] == "ffmpeg"
    assert "-ss" in cmd and cmd[cmd.index("-ss") + 1] == "2.5"
    assert "-t" in cmd and cmd[cmd.index("-t") + 1] == "3.0"
    assert cmd[-1] == "/out/shot1.mp4"
    assert "-an" in cmd, "los planos individuales no deben traer audio propio"


def test_build_concat_command_writes_list_file(tmp_path=None):
    import tempfile
    d = tempfile.mkdtemp(prefix="media_mvp_assemble_test_")
    try:
        list_path = os.path.join(d, "concat.txt")
        cmd = assemble.build_concat_command(["/out/shot1.mp4", "/out/shot2.mp4"], list_path, "/out/concat.mp4")
        assert os.path.isfile(list_path)
        content = open(list_path).read()
        assert "/out/shot1.mp4" in content
        assert "/out/shot2.mp4" in content
        assert cmd[-1] == "/out/concat.mp4"
        assert "-f" in cmd and cmd[cmd.index("-f") + 1] == "concat"
    finally:
        import shutil
        shutil.rmtree(d)


def test_build_subtitle_command_references_srt_path():
    cmd = assemble.build_subtitle_command("/out/concat.mp4", "/out/captions.srt", "/out/subtitled.mp4")
    vf = cmd[cmd.index("-vf") + 1]
    assert "/out/captions.srt" in vf
    assert "subtitles=" in vf


def test_build_text_plates_command_none_when_no_hook_or_cierre_text():
    shots = [{"phase": "solucion", "subtitle_text": "algo", "start_s": 0, "end_s": 3}]
    cmd = assemble.build_text_plates_command("/out/x.mp4", shots, "/out/y.mp4")
    assert cmd is None


def test_build_text_plates_command_builds_drawtext_for_hook():
    shots = [{"phase": "hook", "subtitle_text": "ya puedes apostillar", "start_s": 0.0, "end_s": 4.0}]
    cmd = assemble.build_text_plates_command("/out/x.mp4", shots, "/out/y.mp4")
    assert cmd is not None
    vf = cmd[cmd.index("-vf") + 1]
    assert "drawtext" in vf
    assert "YA PUEDES APOSTILLAR" in vf
    assert "between(t,0.0,4.0)" in vf


def test_build_audio_mix_command_maps_video_and_mixed_audio():
    cmd = assemble.build_audio_mix_command("/out/video.mp4", "/in/narr.wav", "/in/music.mp3", "/out/final.mp4")
    assert "-map" in cmd
    assert "2:v" in cmd
    assert "[aout]" in cmd
    assert cmd[-1] == "/out/final.mp4"


def test_build_narration_only_command_maps_video_and_narration():
    cmd = assemble.build_narration_only_command("/out/video.mp4", "/in/narr.wav", "/out/final.mp4")
    assert "0:v" in cmd
    assert "1:a" in cmd
    assert cmd[-1] == "/out/final.mp4"


TESTS = [
    test_build_trim_command_includes_offset_and_duration,
    test_build_concat_command_writes_list_file,
    test_build_subtitle_command_references_srt_path,
    test_build_text_plates_command_none_when_no_hook_or_cierre_text,
    test_build_text_plates_command_builds_drawtext_for_hook,
    test_build_audio_mix_command_maps_video_and_mixed_audio,
    test_build_narration_only_command_maps_video_and_narration,
]


def main():
    failures = []
    for test in TESTS:
        name = test.__name__
        try:
            test()
            print(f"PASS  {name}")
        except AssertionError as e:
            print(f"FAIL  {name}: {e}")
            failures.append(name)
        except Exception as e:
            print(f"ERROR {name}: {type(e).__name__}: {e}")
            failures.append(name)
    print()
    if failures:
        print(f"{len(failures)}/{len(TESTS)} tests fallaron: {', '.join(failures)}")
        sys.exit(1)
    print(f"{len(TESTS)}/{len(TESTS)} tests OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 media-mvp/test_assemble.py`
Expected: `ModuleNotFoundError: No module named 'assemble'`

- [ ] **Step 3: Write minimal implementation**

Crear `media-mvp/assemble.py`:

```python
#!/usr/bin/env python3
"""
Construcción de comandos ffmpeg para el ensamblador (spec sección 3, Fase
2 punto 2): recorte por plano, concatenación (hard cuts), quemado de
subtítulos, placas de texto (hook/CTA) y mezcla de audio con ducking.
Cada build_*_command() devuelve solo la lista de argv — quien la ejecuta
es run_ffmpeg() (Task 12).
"""

import os
import subprocess
import sys

TARGET_WIDTH = 1080
TARGET_HEIGHT = 1920
TARGET_FPS = 30

# Punto medio del rango -18/-20dB documentado en
# reference/viral_video_standards.md sección 6.
MUSIC_DUCK_DB = -19

DEFAULT_SUBTITLE_STYLE = (
    "FontName=Montserrat,FontSize=16,PrimaryColour=&H00FFFFFF,"
    "BorderStyle=1,Outline=2,Alignment=2,MarginV=180"
)
DEFAULT_PLATE_FONTFILE = "/usr/share/fonts/truetype/montserrat/Montserrat-Bold.ttf"


def build_trim_command(source_path, source_offset_s, duration_s, dest_path,
                        width=TARGET_WIDTH, height=TARGET_HEIGHT, fps=TARGET_FPS):
    """Recorta un tramo de source_path y lo normaliza a la resolución/fps
    objetivo (crop-to-fill 9:16, sin distorsión, sin audio propio)."""
    vf = (
        f"scale={width}:{height}:force_original_aspect_ratio=increase,"
        f"crop={width}:{height},fps={fps}"
    )
    return [
        "ffmpeg", "-y", "-ss", str(source_offset_s), "-i", source_path,
        "-t", str(duration_s), "-vf", vf, "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        dest_path,
    ]


def build_concat_command(shot_clip_paths, concat_list_path, dest_path):
    """Concatena clips ya normalizados (mismo códec/resolución/fps) vía el
    demuxer concat de ffmpeg — únicamente hard cuts, sin transiciones."""
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for path in shot_clip_paths:
            f.write(f"file '{os.path.abspath(path)}'\n")
    return [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list_path, "-c", "copy", dest_path,
    ]


def build_subtitle_command(video_path, srt_path, dest_path, style=DEFAULT_SUBTITLE_STYLE):
    """Quema subtítulos en tercio inferior sin ocluir el rostro (MarginV
    alto) vía libass — mismo patrón validado en CLIENTS/casacampobarinas1."""
    vf = f"subtitles={srt_path}:force_style='{style}'"
    return [
        "ffmpeg", "-y", "-i", video_path, "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-an",
        dest_path,
    ]


def build_text_plates_command(video_path, shots, dest_path, fontfile=DEFAULT_PLATE_FONTFILE):
    """Superpone placas de texto grandes durante los planos de fase 'hook'
    y 'cierre' (gancho y CTA), además de los subtítulos normales. None si
    no hay ningún plano de esas fases con texto -- el caller usa video_path
    tal cual en ese caso."""
    plate_shots = [s for s in shots if s["phase"] in ("hook", "cierre") and s["subtitle_text"]]
    if not plate_shots:
        return None

    filters = []
    for shot in plate_shots:
        text = shot["subtitle_text"].upper().replace(":", r"\:").replace("'", r"\'")
        filters.append(
            f"drawtext=fontfile={fontfile}:text='{text}':fontcolor=white:fontsize=54:"
            f"box=1:boxcolor=black@0.55:boxborderw=20:x=(w-text_w)/2:y=h*0.72:"
            f"enable='between(t,{shot['start_s']},{shot['end_s']})'"
        )
    vf = ",".join(filters)
    return [
        "ffmpeg", "-y", "-i", video_path, "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "copy",
        dest_path,
    ]


def build_audio_mix_command(video_path, narration_path, music_path, dest_path, duck_db=MUSIC_DUCK_DB):
    """Mezcla narración + música con ducking (sidechaincompress disparado
    por la voz) y adjunta el resultado al video ya editado/subtitulado."""
    filter_complex = (
        "[0:a]asplit=2[voice_out][voice_sc];"
        "[1:a][voice_sc]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=300[music_ducked_raw];"
        f"[music_ducked_raw]volume={duck_db}dB[music_ducked];"
        "[voice_out][music_ducked]amix=inputs=2:duration=first:dropout_transition=0[aout]"
    )
    return [
        "ffmpeg", "-y",
        "-i", narration_path, "-i", music_path, "-i", video_path,
        "-filter_complex", filter_complex,
        "-map", "2:v", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        dest_path,
    ]


def build_narration_only_command(video_path, narration_path, dest_path):
    """Cuando el usuario todavía no confirmó el archivo de música (spec
    sección 3: 'o confirmación de que se resolverá manualmente después'),
    entrega el video con solo la narración, sin mezcla ni ducking."""
    return [
        "ffmpeg", "-y", "-i", video_path, "-i", narration_path,
        "-map", "0:v", "-map", "1:a",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        dest_path,
    ]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 media-mvp/test_assemble.py`
Expected: `7/7 tests OK`

- [ ] **Step 5: Commit**

```bash
cd media-mvp
git add assemble.py test_assemble.py
git commit -m "feat: construir comandos ffmpeg del ensamblador"
```

---

### Task 12: `assemble.py` — runner de ffmpeg con fallo explícito

**Files:**
- Modify: `media-mvp/assemble.py`

**Interfaces:**
- Consumes: nada nuevo — envoltorio de ejecución para los comandos de Task 11.
- Produces: `assemble.run_ffmpeg(cmd: list[str], step_name: str) -> None` (fatal `sys.exit(1)` con el stderr real si `ffmpeg` falla, mismo patrón que `detect_silences()` en `analyze.py`).

No hay función pura nueva que testear aquí (es un wrapper de subprocess con efecto de lado real) — se valida en el smoke test end-to-end de Task 15, igual que `run_whisper()`/`detect_silences()` de `analyze.py` no tienen test unitario propio.

- [ ] **Step 1: Write the implementation**

Añadir a `media-mvp/assemble.py`:

```python
def run_ffmpeg(cmd, step_name):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"ERROR: ffmpeg falló en el paso '{step_name}':", file=sys.stderr)
        print(r.stderr, file=sys.stderr)
        sys.exit(1)
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `python3 media-mvp/test_assemble.py`
Expected: `7/7 tests OK` (sin cambios — este paso no añade funciones puras nuevas).

- [ ] **Step 3: Commit**

```bash
cd media-mvp
git add assemble.py
git commit -m "feat: runner de ffmpeg con fallo explicito"
```

---

### Task 13: `plan_video.py` — CLI Fase 1 (Director)

**Files:**
- Create: `media-mvp/plan_video.py`
- Modify: `media-mvp/analyze.py:1-1` (ningún cambio de código — se reutiliza tal cual vía import; se anota aquí solo porque `plan_video.py` depende de sus funciones)

**Interfaces:**
- Consumes: `analyze.probe_metadata()`, `analyze.run_whisper()` (ya existentes en `analyze.py`), `edl.parse_srt_segments()`, `edl.build_edl()`, `edl.render_plan_markdown()`, `edl.PHASE_ORDER`.
- Produces: script CLI `plan_video.py <narration_path> <project_name> [--brief TEXT] [--footage FASE=RUTA ...] [--whisper-model MODEL] [--lang LANG] [--output-dir DIR]`. Escribe `output/<project>/plan.json`, `output/<project>/plan.md`, `output/<project>/captions.srt`.

- [ ] **Step 1: Write the implementation**

Crear `media-mvp/plan_video.py`:

```python
#!/usr/bin/env python3
"""
Fase 1 (Director) del Video Editor MVP: transcribe la narración, arma el
EDL borrador (plan.json) aplicando fases NEAPS/AIDA + estándares de
reference/viral_video_standards.md, y escribe plan.md para presentar en
el chat. No ensambla nada — eso es process_video.py (Fase 2).

Uso: plan_video.py <narration_path> <project_name> [--brief TEXT]
     [--footage FASE=RUTA ...] [--whisper-model MODEL] [--lang LANG]
     [--output-dir DIR]

Fases válidas para --footage: hook, problema, autoridad, solucion,
prueba_social, cierre.
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402
import edl  # noqa: E402


def parse_args(argv):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("narration_path", help="Ruta al audio de la narración ya grabada.")
    parser.add_argument("project_name", help="Nombre del proyecto (carpeta bajo output/).")
    parser.add_argument("--brief", default="", help="Brief corto describiendo el video.")
    parser.add_argument("--footage", action="append", default=[], metavar="FASE=RUTA",
                         help="Footage propio para una fase (repetible), ej. hook=/ruta/clip.mp4")
    parser.add_argument("--whisper-model", default="base")
    parser.add_argument("--lang", default="es")
    parser.add_argument("--output-dir", default=None)
    return parser.parse_args(argv)


def _build_footage_map(footage_args):
    footage_map = {}
    for entry in footage_args:
        if "=" not in entry:
            print(f"ERROR: --footage debe ser FASE=RUTA, recibí '{entry}'.", file=sys.stderr)
            sys.exit(1)
        phase, path = entry.split("=", 1)
        if phase not in edl.PHASE_ORDER:
            print(f"ERROR: fase '{phase}' inválida. Válidas: {', '.join(edl.PHASE_ORDER)}.", file=sys.stderr)
            sys.exit(1)
        if not os.path.isfile(path):
            print(f"ERROR: no existe el archivo de footage '{path}' (fase '{phase}').", file=sys.stderr)
            sys.exit(1)
        duration_s = analyze.probe_metadata(path)["duration_s"]
        footage_map[phase] = {"path": path, "duration_s": duration_s}
    return footage_map


def main():
    args = parse_args(sys.argv[1:])

    if not os.path.isfile(args.narration_path):
        print(f"ERROR: no existe el archivo de narración '{args.narration_path}'.", file=sys.stderr)
        sys.exit(1)

    output_dir = args.output_dir or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "output", args.project_name
    )
    os.makedirs(output_dir, exist_ok=True)

    footage_map = _build_footage_map(args.footage)

    print("[1/3] metadata de la narración (ffprobe)...")
    narration_meta = analyze.probe_metadata(args.narration_path)
    duration_s = narration_meta["duration_s"]
    print(f"  ok  duración {duration_s:.2f}s")

    print(f"[2/3] transcripción (whisper, modelo={args.whisper_model}, idioma={args.lang})...")
    captions_srt_path = analyze.run_whisper(args.narration_path, output_dir, args.whisper_model, args.lang)
    transcript_segments = edl.parse_srt_segments(captions_srt_path)
    print(f"  ok  {len(transcript_segments)} segmentos -> captions.srt")

    print("[3/3] construyendo EDL borrador...")
    edl_dict = edl.build_edl(
        args.project_name, args.brief, args.narration_path, captions_srt_path,
        transcript_segments, duration_s, footage_map,
    )
    plan_json_path = os.path.join(output_dir, "plan.json")
    plan_md_path = os.path.join(output_dir, "plan.md")
    with open(plan_json_path, "w", encoding="utf-8") as f:
        json.dump(edl_dict, f, indent=2, ensure_ascii=False)
    with open(plan_md_path, "w", encoding="utf-8") as f:
        f.write(edl.render_plan_markdown(edl_dict))

    unresolved = sum(1 for s in edl_dict["shots"] if s["source_type"] == "broll_needed")
    print(f"  ok  {len(edl_dict['shots'])} planos, {unresolved} huecos de B-roll -> plan.json, plan.md")
    print()
    print(f"Plan escrito en: {plan_json_path}")
    print("Siguiente paso: revisar plan.md en el chat y escribir approved_plan.json con las decisiones.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Smoke test manual (no unit test — es integración real, mismo criterio que `analyze.py`'s `main()`)**

Run:
```bash
cd media-mvp
python3 plan_video.py test_rapido.mp4 smoke-test-plan --brief "video de prueba" --output-dir /tmp/smoke-test-plan
```
Expected: termina sin traceback, imprime "Plan escrito en: ...", y `/tmp/smoke-test-plan/plan.json` + `/tmp/smoke-test-plan/plan.md` + `/tmp/smoke-test-plan/captions.srt` existen. Abrir `plan.md` y confirmar que la tabla de planos tiene filas y que "Huecos de B-roll a resolver" refleja un número > 0 (no se pasó `--footage`, así que todo debe caer a `broll_needed`).

- [ ] **Step 3: Commit**

```bash
cd media-mvp
git add plan_video.py
git commit -m "feat: CLI plan_video.py (Fase 1 - Director)"
```

---

### Task 14: `process_video.py` — CLI Fase 2 (Workers → Ensamblador → QC)

**Files:**
- Create: `media-mvp/process_video.py`

**Interfaces:**
- Consumes: `analyze.probe_metadata()`, `broll.resolve_broll_worker()`, `qc.run_qc()`, `qc.format_qc_report()`, `assemble.build_trim_command()`, `assemble.build_concat_command()`, `assemble.build_subtitle_command()`, `assemble.build_text_plates_command()`, `assemble.build_audio_mix_command()`, `assemble.build_narration_only_command()`, `assemble.run_ffmpeg()`.
- Produces: script CLI `process_video.py <approved_plan_path>`. Lee `PEXELS_API_KEY`/`PIXABAY_API_KEY` desde `media-mvp/.env` (mismo mecanismo simple que ya usa el resto del módulo — variables de entorno). Escribe `output/<project>/resolved_plan.json` y `output/<project>/final.mp4`.

- [ ] **Step 1: Write the implementation**

Crear `media-mvp/process_video.py`:

```python
#!/usr/bin/env python3
"""
Fase 2 (Workers -> Ensamblador -> QC) del Video Editor MVP: resuelve cada
plano 'agent_searches' con broll.py, valida los 'user_provides', ensambla
el video final con ffmpeg (assemble.py) y corre QC automático (qc.py).

Uso: process_video.py <approved_plan_path>

approved_plan.json debe traer, además del esquema de plan.json:
  - "source_decision" resuelto ("user_provides"|"agent_searches") en cada
    plano con source_type == "broll_needed" (y "source_path" ya apuntando
    al archivo si es "user_provides").
  - "music_path": ruta al archivo de música, o null si se resuelve después.

Requiere PEXELS_API_KEY y PIXABAY_API_KEY en el entorno (cargadas desde
media-mvp/.env) si hay algún plano "agent_searches".
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402
import assemble  # noqa: E402
import broll  # noqa: E402
import qc  # noqa: E402


def _load_env_file(env_path):
    """Carga media-mvp/.env sin dependencias externas (no hay python-dotenv
    en el stack) -- mismo formato simple KEY=VALUE por línea."""
    if not os.path.isfile(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def _resolve_shots(shots, output_dir):
    pexels_key = os.environ.get("PEXELS_API_KEY")
    pixabay_key = os.environ.get("PIXABAY_API_KEY")

    for shot in shots:
        if shot["source_type"] == "footage_provided":
            if not os.path.isfile(shot["source_path"]):
                print(f"ERROR: footage propio '{shot['source_path']}' del plano {shot['id']} ya no existe.",
                      file=sys.stderr)
                sys.exit(1)
            continue

        if shot["source_decision"] == "user_provides":
            if not shot.get("source_path") or not os.path.isfile(shot["source_path"]):
                print(f"ERROR: plano {shot['id']} marcado 'user_provides' pero source_path no existe.",
                      file=sys.stderr)
                sys.exit(1)
            actual_duration = analyze.probe_metadata(shot["source_path"])["duration_s"]
            if actual_duration < shot["duration_s"]:
                print(f"  ⚠️  plano {shot['id']}: el asset subido dura {actual_duration:.1f}s, "
                      f"se necesitaban {shot['duration_s']:.1f}s -- se recorta lo disponible.")
            continue

        if shot["source_decision"] == "agent_searches":
            print(f"  buscando B-roll para plano {shot['id']} ('{shot['broll_keyword']}')...")
            broll.resolve_broll_worker(shot, pexels_key, pixabay_key, output_dir)
            if shot["source_path"] is None:
                print(f"  ⚠️  plano {shot['id']}: sin resultado válido en Pexels/Pixabay -> unresolved")
            continue

        print(f"ERROR: plano {shot['id']} no tiene source_decision resuelto "
              f"('user_provides'/'agent_searches'). Revisa approved_plan.json.", file=sys.stderr)
        sys.exit(1)


def _assemble_final(edl_dict, output_dir):
    shots = edl_dict["shots"]
    shots_dir = os.path.join(output_dir, "shots")
    os.makedirs(shots_dir, exist_ok=True)

    shot_clip_paths = []
    for shot in shots:
        dest = os.path.join(shots_dir, f"shot{shot['id']}.mp4")
        cmd = assemble.build_trim_command(shot["source_path"], shot["source_offset_s"], shot["duration_s"], dest)
        assemble.run_ffmpeg(cmd, f"recorte plano {shot['id']}")
        shot_clip_paths.append(dest)

    concat_list_path = os.path.join(output_dir, "concat_list.txt")
    concat_path = os.path.join(output_dir, "_concat.mp4")
    assemble.run_ffmpeg(
        assemble.build_concat_command(shot_clip_paths, concat_list_path, concat_path), "concatenación"
    )

    subtitled_path = os.path.join(output_dir, "_subtitled.mp4")
    assemble.run_ffmpeg(
        assemble.build_subtitle_command(concat_path, edl_dict["captions_srt_path"], subtitled_path),
        "quemado de subtítulos",
    )

    plates_cmd = assemble.build_text_plates_command(subtitled_path, shots, os.path.join(output_dir, "_plated.mp4"))
    if plates_cmd is None:
        plated_path = subtitled_path
    else:
        plated_path = os.path.join(output_dir, "_plated.mp4")
        assemble.run_ffmpeg(plates_cmd, "placas de texto")

    final_path = os.path.join(output_dir, "final.mp4")
    if edl_dict.get("music_path"):
        assemble.run_ffmpeg(
            assemble.build_audio_mix_command(plated_path, edl_dict["narration_path"], edl_dict["music_path"], final_path),
            "mezcla de audio con música",
        )
    else:
        print("  ⚠️  sin música confirmada (music_path es null) -- entregando con solo narración.")
        assemble.run_ffmpeg(
            assemble.build_narration_only_command(plated_path, edl_dict["narration_path"], final_path),
            "mezcla de audio (solo narración)",
        )

    return final_path


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    approved_plan_path = sys.argv[1]
    if not os.path.isfile(approved_plan_path):
        print(f"ERROR: no existe '{approved_plan_path}'.", file=sys.stderr)
        sys.exit(1)

    _load_env_file(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

    with open(approved_plan_path, encoding="utf-8") as f:
        edl_dict = json.load(f)

    output_dir = os.path.dirname(os.path.abspath(approved_plan_path))

    print("[1/3] resolviendo planos (Workers)...")
    _resolve_shots(edl_dict["shots"], output_dir)

    unresolved = [s["id"] for s in edl_dict["shots"] if s["source_path"] is None]
    if unresolved:
        print(f"ERROR: {len(unresolved)} plano(s) sin resolver: {unresolved}.", file=sys.stderr)
        print("Sube el asset que falta o cambia la decisión en approved_plan.json y vuelve a correr.",
              file=sys.stderr)
        sys.exit(1)

    resolved_plan_path = os.path.join(output_dir, "resolved_plan.json")
    with open(resolved_plan_path, "w", encoding="utf-8") as f:
        json.dump(edl_dict, f, indent=2, ensure_ascii=False)
    print(f"  ok  todos los planos resueltos -> {resolved_plan_path}")

    print("[2/3] ensamblando video final (ffmpeg)...")
    final_path = _assemble_final(edl_dict, output_dir)
    print(f"  ok  {final_path}")

    print("[3/3] QC automático...")
    report = qc.run_qc(final_path, edl_dict["captions_srt_path"], edl_dict["duration_s"])
    print(qc.format_qc_report(report))

    print()
    print(f"Entregado: {final_path}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Smoke test manual — se corre junto al end-to-end de Task 15**

No hay unit test aquí (integración real de ffmpeg/red, mismo criterio que `analyze.py`'s `main()`). Se valida completo en Task 15.

- [ ] **Step 3: Commit**

```bash
cd media-mvp
git add process_video.py
git commit -m "feat: CLI process_video.py (Fase 2 - Workers/Ensamblador/QC)"
```

---

### Task 15: Validación end-to-end real + documentación

**Files:**
- Modify: `media-mvp/README.md`
- Modify: `CLAUDE.md:1-1` (línea del módulo `media-mvp/` bajo MÓDULOS DEL SISTEMA)

**Interfaces:** ninguna nueva — esta tarea valida el pipeline completo con un caso real y cierra la spec (sección 6: "Validar con al menos un caso real end-to-end... antes de dar el MVP por funcional").

- [ ] **Step 1: Correr todos los tests unitarios juntos**

Run:
```bash
cd media-mvp
python3 test_regressions.py && python3 test_edl.py && python3 test_broll.py && python3 test_qc.py && python3 test_assemble.py
```
Expected: los 5 archivos terminan en `N/N tests OK`, código de salida 0.

- [ ] **Step 2: Caso real — narración + footage propio + B-roll de Pexels/Pixabay**

Usar un audio/video real ya disponible en la máquina (ej. uno de los clips de `~/Descargas/` usados en la revisión de PR #22, o grabar una narración corta nueva de ~20-30s). Ejecutar la Fase 1:

```bash
cd media-mvp
python3 plan_video.py <narracion_real> proyecto-e2e --brief "<brief real>" --output-dir output/proyecto-e2e
```

Revisar `output/proyecto-e2e/plan.md` manualmente (o pedirle a Claude que lo lea y lo presente en el chat, como especifica la sección 3 de la spec). Confirmar que:
- El número de planos y sus duraciones son razonables (2-4s típico).
- Los keywords de B-roll sugeridos tienen sentido para el contenido real de cada tramo.
- Exactamente un plano trae `is_breather: true`.

- [ ] **Step 3: Escribir `approved_plan.json` a mano (simulando la aprobación mediada por Claude)**

Copiar `plan.json` a `approved_plan.json` en la misma carpeta, y editar manualmente:
- Cada plano `broll_needed`: `"source_decision": "agent_searches"` (para probar el worker de Pexels/Pixabay real) en al menos uno, y `"source_decision": "user_provides"` + `"source_path": "<ruta a un clip real>"` en al menos otro (para probar ambas rutas del Worker).
- `"music_path": null` (probar la ruta sin música primero, más simple).

- [ ] **Step 4: Correr la Fase 2**

```bash
cd media-mvp
python3 process_video.py output/proyecto-e2e/approved_plan.json
```
Expected: termina sin traceback, imprime el reporte de QC (`--- QC final ---` con 4 líneas OK/WARN) y la ruta final. Verificar con `ffprobe output/proyecto-e2e/final.mp4` que el archivo realmente existe, mide ~la duración esperada, y es 1080x1920.

- [ ] **Step 5: Corregir cualquier fallo real encontrado**

Si algo falla (nombre de filtro ffmpeg inválido en esta versión instalada, fuente no encontrada por `drawtext`, límites de la API de Pexels/Pixabay, etc.), corregir el código correspondiente en `assemble.py`/`broll.py`/`process_video.py`, re-ejecutar sus tests unitarios, y repetir el caso real hasta que `final.mp4` se entregue correctamente. Documentar cualquier hallazgo nuevo (igual que los ya registrados en `handoff.md` sección 4) — no se anota aquí de antemano porque no se puede predecir sin ejecutar.

- [ ] **Step 6: Actualizar `media-mvp/README.md`**

Añadir una sección nueva `## Video Editor MVP (plan_video.py / process_video.py)` documentando: el flujo de dos fases, el esquema de `plan.json`/`approved_plan.json`, cómo se invoca cada script, el mecanismo de aprobación mediado por Claude, y cualquier límite conocido descubierto en el Step 5 (mismo estilo que las secciones "Rendimiento"/"Límites conocidos" ya existentes para `analyze.py`).

- [ ] **Step 7: Actualizar `CLAUDE.md`**

Cambiar la línea de `media-mvp/` bajo `MÓDULOS DEL SISTEMA` de "Prototipo mínimo de análisis audiovisual..." a algo que incluya también el Video Editor MVP, ej.: `media-mvp/` — Análisis audiovisual (ffprobe/whisper/silencios) + Video Editor MVP de dos fases (plan_video.py/process_video.py: EDL borrador → aprobación en chat → ensamblaje ffmpeg + QC).

- [ ] **Step 8: Commit final**

```bash
cd /home/eduardo/CEINCA-AI-OS
git add media-mvp/README.md CLAUDE.md
git commit -m "docs: documentar Video Editor MVP validado end-to-end"
```

---

## Self-Review Notes

- **Cobertura de la spec:** input (narración/footage/brief) → Task 13; fases NEAPS/AIDA + estándares de ritmo/B-roll → Tasks 2-4; aprobación mediada por Claude → documentado en Task 13's output y Task 15 Step 3 (no es código, es un paso manual/de chat, tal como especifica la spec); Workers (B-roll + validación user_provides) → Tasks 7-8 y `process_video.py::_resolve_shots`; Ensamblador → Task 11-12 y `process_video.py::_assemble_final`; QC → Tasks 9-10; manejo de fallos explícito → cada `sys.exit(1)` en `broll.py`/`assemble.py`/`process_video.py`; testing sin pytest → Tasks 1-11; validación end-to-end real → Task 15.
- **Extensión de esquema deliberada:** el EDL de este plan añade `source_offset_s` (necesario para recortar múltiples planos de un mismo clip de footage propio) y usa `source_path is None` como única señal de "unresolved" (en vez de un campo `resolution_status` separado) — más simple que lo insinuado en la spec, sin contradecir su nota de que "el esquema evoluciona... solo completando campos".
- **Consistencia de tipos:** el diccionario de shot mantiene las mismas claves desde `build_shots()` (Task 4) hasta `process_video.py` (Task 14) — verificado que `source_path`, `source_offset_s`, `broll_keyword`, `source_decision` se leen/escriben con los mismos nombres en `edl.py`, `broll.py`, `assemble.py` y `process_video.py`.
