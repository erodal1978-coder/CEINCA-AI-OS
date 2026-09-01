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
