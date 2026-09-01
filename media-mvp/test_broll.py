#!/usr/bin/env python3
"""
Tests para media-mvp/broll.py. Sin pytest, sin red real — las funciones de
red (search_pexels/search_pixabay/download_asset) se inyectan como fakes.

Uso: python3 media-mvp/test_broll.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import broll  # noqa: E402


def test_choose_best_candidate_picks_first_valid():
    candidates = [
        {"id": "a", "duration_s": 1.0, "width": 1080, "height": 1920, "download_url": "u1"},
        {"id": "b", "duration_s": 5.0, "width": 1080, "height": 1920, "download_url": "u2"},
        {"id": "c", "duration_s": 6.0, "width": 1920, "height": 1080, "download_url": "u3"},
    ]
    best = broll.choose_best_candidate(candidates, min_duration_s=3.0)
    assert best is not None
    assert best["id"] == "b", f"esperaba 'b' (primero valido: dur>=3, vertical), dio {best['id']}"


def test_choose_best_candidate_returns_none_when_nothing_qualifies():
    candidates = [
        {"id": "a", "duration_s": 1.0, "width": 1080, "height": 1920, "download_url": "u1"},
        {"id": "b", "duration_s": 6.0, "width": 1920, "height": 1080, "download_url": "u2"},
    ]
    best = broll.choose_best_candidate(candidates, min_duration_s=3.0)
    assert best is None


def test_pexels_candidates_parses_video_files():
    raw = {
        "videos": [
            {
                "id": 123,
                "duration": 8,
                "video_files": [
                    {"link": "low.mp4", "width": 480, "height": 852},
                    {"link": "high.mp4", "width": 1080, "height": 1920},
                ],
            }
        ]
    }
    candidates = broll._pexels_candidates(raw)
    assert len(candidates) == 1
    assert candidates[0]["id"] == "pexels:123"
    assert candidates[0]["download_url"] == "high.mp4"
    assert candidates[0]["width"] == 1080


def test_pixabay_candidates_parses_hits():
    raw = {
        "hits": [
            {
                "id": 456,
                "duration": 10,
                "videos": {"large": {"url": "l.mp4", "width": 1280, "height": 720}},
            }
        ]
    }
    candidates = broll._pixabay_candidates(raw)
    assert len(candidates) == 1
    assert candidates[0]["id"] == "pixabay:456"
    assert candidates[0]["download_url"] == "l.mp4"


TESTS = [
    test_choose_best_candidate_picks_first_valid,
    test_choose_best_candidate_returns_none_when_nothing_qualifies,
    test_pexels_candidates_parses_video_files,
    test_pixabay_candidates_parses_hits,
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
