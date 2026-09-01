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
