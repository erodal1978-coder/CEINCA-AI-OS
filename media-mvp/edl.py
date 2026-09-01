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
