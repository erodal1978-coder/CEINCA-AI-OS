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


def _http_get_json(url, headers=None, timeout=15):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_pexels(keyword, api_key, fetch_fn=_http_get_json):
    if not api_key:
        print("ERROR: PEXELS_API_KEY no configurada.", file=sys.stderr)
        sys.exit(1)
    url = f"{PEXELS_SEARCH_URL}?{urllib.parse.urlencode({'query': keyword, 'orientation': 'portrait', 'per_page': 15})}"
    try:
        raw = fetch_fn(url, headers={"Authorization": api_key})
    except Exception as e:
        print(f"ERROR: búsqueda en Pexels falló para '{keyword}': {e}", file=sys.stderr)
        return []
    return _pexels_candidates(raw)


def search_pixabay(keyword, api_key, fetch_fn=_http_get_json):
    if not api_key:
        print("ERROR: PIXABAY_API_KEY no configurada.", file=sys.stderr)
        sys.exit(1)
    params = {"key": api_key, "q": keyword, "video_type": "film", "per_page": 15}
    url = f"{PIXABAY_SEARCH_URL}?{urllib.parse.urlencode(params)}"
    try:
        raw = fetch_fn(url)
    except Exception as e:
        print(f"ERROR: búsqueda en Pixabay falló para '{keyword}': {e}", file=sys.stderr)
        return []
    return _pixabay_candidates(raw)


def download_asset(download_url, dest_path):
    req = urllib.request.Request(download_url)
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest_path, "wb") as f:
        f.write(resp.read())
    return dest_path


def resolve_broll_worker(shot, pexels_key, pixabay_key, output_dir,
                          search_pexels_fn=search_pexels, search_pixabay_fn=search_pixabay,
                          download_fn=download_asset):
    """Resuelve un plano 'agent_searches': busca en Pexels, si no hay
    resultado válido intenta Pixabay, descarga el primero que cumpla
    duración/orientación. Si ninguno cumple, deja source_path en None
    ('unresolved') — nunca sustituye con algo que no cumple criterio."""
    keyword = shot["broll_keyword"]
    candidates = search_pexels_fn(keyword, pexels_key)
    best = choose_best_candidate(candidates, shot["duration_s"])
    source = "pexels"

    if best is None:
        candidates = search_pixabay_fn(keyword, pixabay_key)
        best = choose_best_candidate(candidates, shot["duration_s"])
        source = "pixabay"

    if best is None:
        shot["source_path"] = None
        return shot

    dest = os.path.join(output_dir, f"broll_shot{shot['id']}_{source}.mp4")
    download_fn(best["download_url"], dest)
    shot["source_path"] = dest
    shot["source_offset_s"] = 0.0
    return shot
