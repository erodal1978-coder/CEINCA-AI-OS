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

# Umbral de nivel de audio bajo el cual whisper/silencedetect dejan de ser
# confiables. Evidencia real (ver media-mvp/README.md "Límites conocidos"):
# clips que transcriben bien miden entre -29dB y -36dB de mean_volume; un
# clip con mean_volume de -54 a -59dB en todo su rango produjo transcripción
# de basura y silencedetect marcó ~todo el clip como silencio. -45dB deja
# margen razonable respecto a ambos extremos observados.
LOW_AUDIO_MEAN_DB = -45.0

# Si captions.srt tiene 0 segmentos pero hay más de esto en segundos de
# audio no-silencioso (y el nivel de audio es normal), es sospechoso: algo
# en la transcripción probablemente falló en vez de "no había nada que decir".
SUSPICIOUS_NON_SILENT_S = 3.0

RE_SILENCE_START = re.compile(r"silence_start:\s*(-?[\d.]+)")
RE_SILENCE_END = re.compile(r"silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)")
RE_MEAN_VOLUME = re.compile(r"mean_volume:\s*(-?[\d.]+)\s*dB")


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
        "audio_mean_volume_db": None,  # se completa en main() tras medir con volumedetect
        "size_bytes": int(fmt.get("size", 0)),
        "raw": raw,
    }
    return metadata


def measure_audio_level(video_path):
    """Mide el volumen medio (dB) del audio vía ffmpeg volumedetect.

    Igual que silencedetect, volumedetect imprime a nivel 'info' -> nunca
    usar '-v error' aquí o se pierde el log que queremos parsear.
    Devuelve None si no se pudo determinar (sin audio, fallo de ffmpeg).
    """
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", video_path,
        "-af", "volumedetect", "-f", "null", "-",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    m = RE_MEAN_VOLUME.search(r.stderr)
    return float(m.group(1)) if m else None


def finalize_whisper_output(output_dir, video_path):
    """Renombra el SRT que produce whisper a un nombre estable (captions.srt).

    Whisper nombra su salida <video_stem>.srt. Si ese archivo no aparece
    pese a que whisper reportó éxito (returncode 0), es un fallo real -
    lanza FileNotFoundError en vez de continuar en silencio con un output
    inexistente.
    """
    stem = os.path.splitext(os.path.basename(video_path))[0]
    produced = os.path.join(output_dir, f"{stem}.srt")
    target = os.path.join(output_dir, "captions.srt")
    if not os.path.isfile(produced):
        raise FileNotFoundError(
            f"whisper reportó éxito (returncode 0) pero no se encontró el "
            f"archivo esperado '{produced}'."
        )
    os.replace(produced, target)
    return target


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

    try:
        return finalize_whisper_output(output_dir, video_path)
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


def detect_silences(video_path, duration_s):
    """Detecta silencios vía ffmpeg silencedetect, parseando stderr.

    returncode != 0 se trata como fallo real de ffmpeg (input inválido,
    codec no soportado, etc.) - NO como "cero silencios encontrados". Un
    fallo silencioso aquí sería indistinguible de un clip genuinamente sin
    silencios, que es exactamente el tipo de falla silenciosa a evitar.
    """
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", video_path,
        "-af", f"silencedetect=noise={SILENCE_NOISE_DB}:d={SILENCE_MIN_DUR}",
        "-f", "null", "-",
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERROR: ffmpeg silencedetect falló:", file=sys.stderr)
        print(r.stderr, file=sys.stderr)
        sys.exit(1)

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


# ---------------------------------------------------------------------------
# Funciones de verificación puras (testeadas en test_regressions.py) — cada
# una devuelve un dict de estado, sin imprimir nada. verify_outputs() es solo
# la capa de presentación sobre estas.
# ---------------------------------------------------------------------------

def check_metadata(output_dir):
    path = os.path.join(output_dir, "metadata.json")
    if not os.path.isfile(path):
        return {"status": "MISSING"}
    with open(path, encoding="utf-8") as f:
        m = json.load(f)
    return {"status": "OK", "data": m}


def check_captions(output_dir, has_audio, low_audio, non_silent_s):
    """Regresión bug #1: un SRT vacío por ausencia de habla es un resultado
    válido (status OK, 0 segmentos), no un archivo "FALTA"."""
    path = os.path.join(output_dir, "captions.srt")
    if not has_audio:
        return {"status": "SKIPPED", "message": "sin audio"}
    if not os.path.isfile(path):
        return {"status": "MISSING", "message": ""}

    content = open(path, encoding="utf-8").read()
    segments = content.count("\n\n") if content.strip() else 0
    size = os.path.getsize(path)

    if segments > 0:
        return {"status": "OK", "segments": segments, "size": size, "message": ""}

    if low_audio:
        return {
            "status": "WARN", "segments": 0, "size": size,
            "message": "0 segmentos — nivel de audio muy bajo, transcripción no confiable",
        }
    if non_silent_s is not None and non_silent_s > SUSPICIOUS_NON_SILENT_S:
        return {
            "status": "WARN", "segments": 0, "size": size,
            "message": (f"0 segmentos pero {non_silent_s:.1f}s de audio no-silencioso "
                        f"— posible fallo de transcripción, no falta de habla"),
        }
    return {
        "status": "OK", "segments": 0, "size": size,
        "message": "0 segmentos: normal si el clip no tiene habla",
    }


def check_silences(output_dir, has_audio, duration_s, tolerance=0.5):
    """Regresión bug #2: un silence_end de ffmpeg que excede duration_s de
    ffprobe por un margen pequeño (desfase normal contenedor/stream) debe
    seguir siendo OK, no marcarse como fuera de rango."""
    path = os.path.join(output_dir, "silences.json")
    if not has_audio:
        return {"status": "SKIPPED", "message": "sin audio"}
    if not os.path.isfile(path):
        return {"status": "MISSING", "message": ""}

    with open(path, encoding="utf-8") as f:
        s = json.load(f)

    in_range = all(
        -tolerance <= iv["start"] <= duration_s + tolerance
        and -tolerance <= iv["end"] <= duration_s + tolerance
        for iv in s["intervals"]
    )
    status = "OK" if in_range else "WARN"
    message = "" if in_range else f"algún intervalo excede la tolerancia de {tolerance}s"
    return {
        "status": status, "count": s["count"], "total_s": s["total_silence_s"],
        "message": message,
    }


def verify_outputs(output_dir, has_audio, duration_s, low_audio):
    """Auto-verificación final: imprime el estado real de cada salida."""
    print()
    print("--- verificación ---")

    meta = check_metadata(output_dir)
    if meta["status"] == "OK":
        m = meta["data"]
        print(f"metadata.json    OK  (duration={m['duration_s']}s, "
              f"{m['width']}x{m['height']}, {m['fps']}fps, {m['video_codec']})")
    else:
        print("metadata.json    FALTA")

    sil = check_silences(output_dir, has_audio, duration_s)
    non_silent_s = None
    if sil["status"] in ("OK", "WARN"):
        non_silent_s = duration_s - sil["total_s"]

    caps = check_captions(output_dir, has_audio, low_audio, non_silent_s)
    if caps["status"] == "SKIPPED":
        print("captions.srt     SKIPPED (sin audio)")
    elif caps["status"] == "MISSING":
        print("captions.srt     FALTA")
    else:
        suffix = f" — {caps['message']}" if caps["message"] else ""
        flag = "OK" if caps["status"] == "OK" else "⚠️  WARN"
        print(f"captions.srt     {flag}  ({caps['segments']} segmentos, {caps['size']} bytes){suffix}")

    if sil["status"] == "SKIPPED":
        print("silences.json    SKIPPED (sin audio)")
    elif sil["status"] == "MISSING":
        print("silences.json    FALTA")
    else:
        suffix = f" — {sil['message']}" if sil["message"] else ""
        flag = "OK" if sil["status"] == "OK" else "⚠️  WARN"
        print(f"silences.json    {flag}  ({sil['count']} silencios, total {sil['total_s']}s){suffix}")

    if low_audio:
        print()
        print("⚠️  ADVERTENCIA: nivel de audio muy bajo en todo el clip — la")
        print("   transcripción y/o detección de silencios pueden no ser confiables.")
        print("   Ver 'Límites conocidos' en README.md.")


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
    has_audio = metadata["has_audio"]

    low_audio = False
    if has_audio:
        level = measure_audio_level(video_path)
        metadata["audio_mean_volume_db"] = level
        if level is not None and level < LOW_AUDIO_MEAN_DB:
            low_audio = True

    write_json(os.path.join(output_dir, "metadata.json"), metadata)
    res = f"{metadata['width']}x{metadata['height']}" if metadata["width"] else "sin video"
    audio_desc = (f"audio: {metadata['audio_codec']} {metadata['audio_channels']}ch "
                  f"{metadata['audio_sample_rate']}Hz") if has_audio else "sin audio"
    print(f"  ok  {res}, {metadata['fps']}fps, {metadata['video_codec']}, "
          f"{audio_desc}, duración {metadata['duration_s']:.2f}s")
    if low_audio:
        print(f"  ⚠️  nivel de audio muy bajo (mean_volume={metadata['audio_mean_volume_db']:.1f}dB, "
              f"umbral={LOW_AUDIO_MEAN_DB}dB) — transcripción/silencios probablemente no confiables")

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

    verify_outputs(output_dir, has_audio, metadata["duration_s"], low_audio)


if __name__ == "__main__":
    main()
