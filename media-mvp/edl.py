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
