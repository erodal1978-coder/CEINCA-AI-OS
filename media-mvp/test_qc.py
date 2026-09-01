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
