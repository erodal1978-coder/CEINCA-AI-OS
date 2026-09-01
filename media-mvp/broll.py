#!/usr/bin/env python3
"""
Cliente de búsqueda de B-roll (Pexels/Pixabay), selección de candidato y
descarga. Las funciones de red aceptan un fetch_fn/download_fn inyectable
para poder testear sin llamadas HTTP reales (ver test_broll.py).
"""

import json
import os
import sys
import urllib.parse
import urllib.request

PEXELS_SEARCH_URL = "https://api.pexels.com/videos/search"
PIXABAY_SEARCH_URL = "https://pixabay.com/api/videos/"


def choose_best_candidate(candidates, min_duration_s):
    """Elige el primer candidato que cumpla duración mínima y orientación
    vertical (height > width). None si ninguno cumple — nunca se sustituye
    con algo que no cumple criterio (spec sección 5)."""
    for c in candidates:
        if c["duration_s"] < min_duration_s:
            continue
        if c["height"] <= c["width"]:
            continue
        return c
    return None


def _pexels_candidates(raw_json):
    candidates = []
    for video in raw_json.get("videos", []):
        files = [f for f in video.get("video_files", []) if f.get("link")]
        if not files:
            continue
        best_file = max(files, key=lambda f: f.get("width", 0))
        candidates.append({
            "id": f"pexels:{video['id']}",
            "duration_s": float(video.get("duration", 0)),
            "width": best_file.get("width", 0),
            "height": best_file.get("height", 0),
            "download_url": best_file["link"],
        })
    return candidates


def _pixabay_candidates(raw_json):
    candidates = []
    for hit in raw_json.get("hits", []):
        videos = hit.get("videos", {})
        best = videos.get("large") or videos.get("medium") or videos.get("small")
        if not best:
            continue
        candidates.append({
            "id": f"pixabay:{hit['id']}",
            "duration_s": float(hit.get("duration", 0)),
            "width": best.get("width", 0),
            "height": best.get("height", 0),
            "download_url": best.get("url"),
        })
    return candidates
