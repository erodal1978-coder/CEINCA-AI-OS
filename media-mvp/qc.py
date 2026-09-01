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
    with open(captions_srt_path, encoding="utf-8") as f:
        content = f.read().strip()
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
