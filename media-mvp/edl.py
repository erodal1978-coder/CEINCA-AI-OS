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
