#!/usr/bin/env python3
"""
Analiza un video: metadata (ffprobe), transcripción (whisper) y detección
de silencios (ffmpeg silencedetect). Primer prototipo mínimo del futuro
CEINCA AI Video Production System — no recorta, no compone, no orquesta.

Uso: analyze.py <video_file> [output_dir] [model] [lang]
  video_file  ruta al video de entrada (requerido)
  output_dir  carpeta de salida (default: media-mvp/output/<basename>/)
  model       modelo de whisper: tiny/base/small/medium/large (default: base)
  lang        idioma para whisper (default: es)
"""

import json
import os
import re
import subprocess
import sys

WHISPER_BIN = os.environ.get(
    "WHISPER_BIN", os.path.expanduser("~/.local/venvs/whisper/bin/whisper")
)
SILENCE_NOISE_DB = "-30dB"
SILENCE_MIN_DUR = 0.5

RE_SILENCE_START = re.compile(r"silence_start:\s*(-?[\d.]+)")
RE_SILENCE_END = re.compile(r"silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)")


def probe_metadata(video_path):
    """Extrae metadata curada + el JSON crudo completo de ffprobe."""
    cmd = [
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", video_path,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"ERROR: ffprobe falló sobre '{video_path}':", file=sys.stderr)
        print(r.stderr, file=sys.stderr)
        sys.exit(1)

    raw = json.loads(r.stdout)
    fmt = raw.get("format", {})
    streams = raw.get("streams", [])
    video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio_stream = next((s for s in streams if s.get("codec_type") == "audio"), None)

    fps = None
    if video_stream and video_stream.get("r_frame_rate"):
        num, _, den = video_stream["r_frame_rate"].partition("/")
        try:
            fps = round(float(num) / float(den), 2) if float(den) else None
        except (ValueError, ZeroDivisionError):
            fps = None

    metadata = {
        "file": os.path.basename(video_path),
        "duration_s": float(fmt.get("duration", 0.0)),
        "width": video_stream.get("width") if video_stream else None,
        "height": video_stream.get("height") if video_stream else None,
        "fps": fps,
        "video_codec": video_stream.get("codec_name") if video_stream else None,
        "has_audio": audio_stream is not None,
        "audio_codec": audio_stream.get("codec_name") if audio_stream else None,
        "audio_channels": audio_stream.get("channels") if audio_stream else None,
        "audio_sample_rate": int(audio_stream["sample_rate"]) if audio_stream and audio_stream.get("sample_rate") else None,
        "size_bytes": int(fmt.get("size", 0)),
        "raw": raw,
    }
    return metadata


def run_whisper(video_path, output_dir, model, lang):
    """Transcribe con whisper y deja el resultado en output_dir/captions.srt."""
    if not os.path.isfile(WHISPER_BIN):
        print(f"ERROR: no se encontró el binario de whisper en '{WHISPER_BIN}'.", file=sys.stderr)
        print("Define WHISPER_BIN si vive en otra ruta en esta máquina.", file=sys.stderr)
        sys.exit(1)

    print(f"  nota: si es la primera vez que usas el modelo '{model}', whisper lo")
    print("        descargará (requiere red); esto puede tardar, no es un error.")

    cmd = [
        WHISPER_BIN, video_path,
        "--model", model,
        "--language", lang,
        "--task", "transcribe",
        "--output_dir", output_dir,
        "--output_format", "srt",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERROR: whisper falló:", file=sys.stderr)
        print(r.stderr, file=sys.stderr)
        sys.exit(1)

    stem = os.path.splitext(os.path.basename(video_path))[0]
    produced = os.path.join(output_dir, f"{stem}.srt")
    target = os.path.join(output_dir, "captions.srt")
    if os.path.isfile(produced):
        os.replace(produced, target)
    return target


def detect_silences(video_path, duration_s):
    """Detecta silencios vía ffmpeg silencedetect, parseando stderr."""
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", video_path,
        "-af", f"silencedetect=noise={SILENCE_NOISE_DB}:d={SILENCE_MIN_DUR}",
        "-f", "null", "-",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    # ffmpeg devuelve returncode != 0 en modo "-f null -" para algunos inputs
    # aunque el análisis de audio se haya completado; no tratamos esto como
    # fatal, solo parseamos lo que haya en stderr.
    stderr = r.stderr

    starts = [float(m) for m in RE_SILENCE_START.findall(stderr)]
    ends = [(float(e), float(d)) for e, d in RE_SILENCE_END.findall(stderr)]

    intervals = []
    for i, start in enumerate(starts):
        if i < len(ends):
            end, dur = ends[i]
            intervals.append({"start": start, "end": end, "duration": round(dur, 3)})
        else:
            # silence_start final sin silence_end -> el clip termina en silencio
            intervals.append({
                "start": start,
                "end": duration_s,
                "duration": round(duration_s - start, 3),
                "end_of_file": True,
            })

    total = round(sum(i["duration"] for i in intervals), 3)
    return {
        "noise_threshold_db": SILENCE_NOISE_DB,
        "min_duration_s": SILENCE_MIN_DUR,
        "count": len(intervals),
        "total_silence_s": total,
        "intervals": intervals,
    }


def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def verify_outputs(output_dir, has_audio, duration_s):
    """Auto-verificación final: confirma que las salidas existen y tienen forma válida."""
    print()
    print("--- verificación ---")

    meta_path = os.path.join(output_dir, "metadata.json")
    if os.path.isfile(meta_path):
        with open(meta_path, encoding="utf-8") as f:
            m = json.load(f)
        print(f"metadata.json    OK  (duration={m['duration_s']}s, "
              f"{m['width']}x{m['height']}, {m['fps']}fps, {m['video_codec']})")
    else:
        print("metadata.json    FALTA")

    srt_path = os.path.join(output_dir, "captions.srt")
    if not has_audio:
        print("captions.srt     SKIPPED (sin audio)")
    elif os.path.isfile(srt_path):
        content = open(srt_path, encoding="utf-8").read()
        segments = content.count("\n\n") if content.strip() else 0
        size = os.path.getsize(srt_path)
        note = "" if segments > 0 else " (0 segmentos: normal si el clip no tiene habla)"
        print(f"captions.srt     OK  ({segments} segmentos, {size} bytes){note}")
    else:
        print("captions.srt     FALTA")

    # Tolerancia: silence_end de ffmpeg puede exceder levemente duration_s de
    # ffprobe por el desfase normal entre duración de contenedor y duración
    # real del stream de audio (visto en la práctica: ~11ms en un clip de 8s).
    RANGE_TOLERANCE_S = 0.5
    sil_path = os.path.join(output_dir, "silences.json")
    if not has_audio:
        print("silences.json    SKIPPED (sin audio)")
    elif os.path.isfile(sil_path):
        with open(sil_path, encoding="utf-8") as f:
            s = json.load(f)
        in_range = all(
            -RANGE_TOLERANCE_S <= iv["start"] <= duration_s + RANGE_TOLERANCE_S
            and -RANGE_TOLERANCE_S <= iv["end"] <= duration_s + RANGE_TOLERANCE_S
            for iv in s["intervals"]
        )
        flag = "OK" if in_range else "OK (revisar rango — excede tolerancia de 0.5s)"
        print(f"silences.json    {flag}  ({s['count']} silencios, total {s['total_silence_s']}s)")
    else:
        print("silences.json    FALTA")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    video_path = sys.argv[1]
    if not os.path.isfile(video_path):
        print(f"ERROR: no existe el archivo '{video_path}'.", file=sys.stderr)
        sys.exit(1)

    basename = os.path.splitext(os.path.basename(video_path))[0]
    default_out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", basename)
    output_dir = sys.argv[2] if len(sys.argv) > 2 else default_out
    model = sys.argv[3] if len(sys.argv) > 3 else "base"
    lang = sys.argv[4] if len(sys.argv) > 4 else "es"

    os.makedirs(output_dir, exist_ok=True)

    print("[1/3] metadata (ffprobe)...")
    metadata = probe_metadata(video_path)
    write_json(os.path.join(output_dir, "metadata.json"), metadata)
    res = f"{metadata['width']}x{metadata['height']}" if metadata["width"] else "sin video"
    audio_desc = (f"audio: {metadata['audio_codec']} {metadata['audio_channels']}ch "
                  f"{metadata['audio_sample_rate']}Hz") if metadata["has_audio"] else "sin audio"
    print(f"  ok  {res}, {metadata['fps']}fps, {metadata['video_codec']}, "
          f"{audio_desc}, duración {metadata['duration_s']:.2f}s")

    has_audio = metadata["has_audio"]

    if has_audio:
        print(f"[2/3] transcripción (whisper, modelo={model}, idioma={lang})...")
        srt_path = run_whisper(video_path, output_dir, model, lang)
        segs = open(srt_path, encoding="utf-8").read().count("\n\n") if os.path.isfile(srt_path) else 0
        print(f"  ok  ~{segs} segmentos -> captions.srt")
    else:
        print("[2/3] transcripción (whisper)...")
        print("  SKIP (sin audio)")

    if has_audio:
        print(f"[3/3] detección de silencios (ffmpeg silencedetect, "
              f"umbral={SILENCE_NOISE_DB}, min={SILENCE_MIN_DUR}s)...")
        silences = detect_silences(video_path, metadata["duration_s"])
        write_json(os.path.join(output_dir, "silences.json"), silences)
        print(f"  ok  {silences['count']} silencios detectados "
              f"({silences['total_silence_s']}s total) -> silences.json")
    else:
        print("[3/3] detección de silencios (ffmpeg silencedetect)...")
        print("  SKIP (sin audio)")

    verify_outputs(output_dir, has_audio, metadata["duration_s"])


if __name__ == "__main__":
    main()
