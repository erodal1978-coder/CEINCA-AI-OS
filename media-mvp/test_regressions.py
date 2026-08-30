#!/usr/bin/env python3
"""
Tests de regresión para media-mvp/analyze.py. Sin pytest (no hay convención
de testing en el repo) — asserts simples + runner que imprime PASS/FAIL y
sale con código != 0 si algo falla. Corren en milisegundos: no invocan
ffmpeg/ffprobe/whisper reales, solo las funciones puras de verificación
sobre archivos sintéticos en un directorio temporal.

Uso: python3 media-mvp/test_regressions.py
"""

import json
import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402


def _tmpdir():
    d = tempfile.mkdtemp(prefix="media_mvp_test_")
    return d


def test_bug1_empty_srt_reports_ok_not_missing():
    """Bug original: un captions.srt de 0 bytes (clip sin habla real, ej.
    tono sintético) se reportaba como 'FALTA'. Debe ser OK con 0 segmentos."""
    d = _tmpdir()
    try:
        open(os.path.join(d, "captions.srt"), "w").close()  # 0 bytes
        result = analyze.check_captions(d, has_audio=True, low_audio=False, non_silent_s=0.5)
        assert result["status"] == "OK", f"esperaba OK, dio {result['status']}"
        assert result["segments"] == 0, f"esperaba 0 segmentos, dio {result['segments']}"
    finally:
        shutil.rmtree(d)


def test_bug1_missing_srt_still_reports_missing():
    """Control: si el archivo NO existe (a diferencia de existir vacío),
    debe seguir siendo MISSING de verdad — el fix no debe volverse permisivo
    con un caso de falla real."""
    d = _tmpdir()
    try:
        result = analyze.check_captions(d, has_audio=True, low_audio=False, non_silent_s=0.5)
        assert result["status"] == "MISSING", f"esperaba MISSING, dio {result['status']}"
    finally:
        shutil.rmtree(d)


def test_bug2_silence_end_within_tolerance_is_ok():
    """Bug original: silence_end de ffmpeg (8.01088s) excedía duration_s de
    ffprobe (8.0s) por ~11ms — desfase normal contenedor/stream — y se
    marcaba como fuera de rango. Con tolerancia de 0.5s debe ser OK."""
    d = _tmpdir()
    try:
        duration_s = 8.0
        sil = {
            "noise_threshold_db": "-30dB", "min_duration_s": 0.5,
            "count": 1, "total_silence_s": 5.011,
            "intervals": [{"start": 2.99991, "end": 8.01088, "duration": 5.011}],
        }
        with open(os.path.join(d, "silences.json"), "w") as f:
            json.dump(sil, f)
        result = analyze.check_silences(d, has_audio=True, duration_s=duration_s)
        assert result["status"] == "OK", f"esperaba OK, dio {result['status']}: {result['message']}"
    finally:
        shutil.rmtree(d)


def test_bug2_silence_end_far_outside_tolerance_is_flagged():
    """Control: un desfase real y grande (no un redondeo de milisegundos)
    SÍ debe seguir marcándose — el fix no debe volverse ciego a rangos
    genuinamente rotos."""
    d = _tmpdir()
    try:
        duration_s = 8.0
        sil = {
            "noise_threshold_db": "-30dB", "min_duration_s": 0.5,
            "count": 1, "total_silence_s": 5.0,
            "intervals": [{"start": 2.0, "end": 20.0, "duration": 18.0}],  # 12s fuera de rango
        }
        with open(os.path.join(d, "silences.json"), "w") as f:
            json.dump(sil, f)
        result = analyze.check_silences(d, has_audio=True, duration_s=duration_s)
        assert result["status"] == "WARN", f"esperaba WARN, dio {result['status']}"
    finally:
        shutil.rmtree(d)


def test_low_audio_flags_empty_transcript_as_warn():
    """Hallazgo de esta sesión: un clip con nivel de audio muy bajo (ej.
    mean_volume -54dB) produce 0 segmentos de transcripción — pero eso NO
    es 'normal, sin habla', es una transcripción no confiable. Debe marcarse
    WARN, no OK."""
    d = _tmpdir()
    try:
        open(os.path.join(d, "captions.srt"), "w").close()
        result = analyze.check_captions(d, has_audio=True, low_audio=True, non_silent_s=180.0)
        assert result["status"] == "WARN", f"esperaba WARN, dio {result['status']}"
        assert "audio" in result["message"].lower()
    finally:
        shutil.rmtree(d)


def test_suspicious_silent_transcript_flags_warn_even_with_normal_audio():
    """Hallazgo de esta sesión: si el nivel de audio es normal pero igual
    hay 0 segmentos de transcripción con varios segundos de audio no-
    silencioso, es sospechoso de un fallo real de whisper — debe ser WARN,
    no la explicación tranquilizadora de 'normal si no hay habla'."""
    d = _tmpdir()
    try:
        open(os.path.join(d, "captions.srt"), "w").close()
        result = analyze.check_captions(d, has_audio=True, low_audio=False, non_silent_s=10.0)
        assert result["status"] == "WARN", f"esperaba WARN, dio {result['status']}"
    finally:
        shutil.rmtree(d)


def test_genuinely_silent_clip_with_normal_audio_level_is_ok():
    """Control: 0 segmentos + audio de nivel normal + pocos segundos no-
    silenciosos (ej. un tono corto, ver smoke test sintético) SÍ debe
    seguir siendo OK — no todo 0-segmentos es sospechoso."""
    d = _tmpdir()
    try:
        open(os.path.join(d, "captions.srt"), "w").close()
        result = analyze.check_captions(d, has_audio=True, low_audio=False, non_silent_s=0.5)
        assert result["status"] == "OK", f"esperaba OK, dio {result['status']}"
    finally:
        shutil.rmtree(d)


def test_whisper_output_missing_raises_instead_of_silent_continue():
    """Hallazgo de esta sesión: si whisper reporta éxito pero el archivo
    <stem>.srt esperado no aparece (ej. supuesto de nombrado incorrecto),
    el código original seguía sin error con captions.srt inexistente.
    finalize_whisper_output() ahora debe lanzar FileNotFoundError."""
    d = _tmpdir()
    try:
        raised = False
        try:
            analyze.finalize_whisper_output(d, "/ruta/inventada/video.mp4")
        except FileNotFoundError:
            raised = True
        assert raised, "esperaba FileNotFoundError cuando el .srt de whisper no aparece"
    finally:
        shutil.rmtree(d)


def test_whisper_output_found_renames_correctly():
    """Control: cuando el archivo SÍ aparece con el nombre que produce
    whisper, se renombra a captions.srt correctamente."""
    d = _tmpdir()
    try:
        produced = os.path.join(d, "video.srt")
        with open(produced, "w") as f:
            f.write("1\n00:00:00,000 --> 00:00:01,000\nHola\n\n")
        target = analyze.finalize_whisper_output(d, "/algún/path/video.mp4")
        assert target == os.path.join(d, "captions.srt")
        assert os.path.isfile(target)
        assert not os.path.isfile(produced)
    finally:
        shutil.rmtree(d)


TESTS = [
    test_bug1_empty_srt_reports_ok_not_missing,
    test_bug1_missing_srt_still_reports_missing,
    test_bug2_silence_end_within_tolerance_is_ok,
    test_bug2_silence_end_far_outside_tolerance_is_flagged,
    test_low_audio_flags_empty_transcript_as_warn,
    test_suspicious_silent_transcript_flags_warn_even_with_normal_audio,
    test_genuinely_silent_clip_with_normal_audio_level_is_ok,
    test_whisper_output_missing_raises_instead_of_silent_continue,
    test_whisper_output_found_renames_correctly,
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
