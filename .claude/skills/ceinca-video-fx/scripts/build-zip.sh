#!/usr/bin/env bash
# build-zip.sh — empaqueta la skill para subirla como skill personalizada en claude.ai (Linux / macOS).
# Usa zip si está disponible o python3 (zipfile) como respaldo automático en contenedores Linux mínimos.
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SKILL"
bash scripts/check.sh estatico
mkdir -p dist
OUT="$SKILL/dist/ceinca-video-fx.zip"
rm -f "$OUT"
PARENT="$(dirname "$SKILL")"
if command -v zip >/dev/null 2>&1; then
  ( cd "$PARENT" && zip -qr "$OUT" ceinca-video-fx \
      -x 'ceinca-video-fx/node_modules/*' 'ceinca-video-fx/.cache/*' 'ceinca-video-fx/.build/*' 'ceinca-video-fx/out/*' 'ceinca-video-fx/dist/*' \
         'ceinca-video-fx/examples/*.mp4' 'ceinca-video-fx/examples/assets/clips/*' 'ceinca-video-fx/examples/frames/*' 'ceinca-video-fx/package-lock.json' )
else
  python3 - "$PARENT" "$OUT" << 'PYEOF'
import os, sys, zipfile

parent, out_path = sys.argv[1], sys.argv[2]
root_dir = os.path.join(parent, "ceinca-video-fx")
skip_prefixes = (
    "ceinca-video-fx/node_modules/",
    "ceinca-video-fx/.cache/",
    "ceinca-video-fx/.build/",
    "ceinca-video-fx/out/",
    "ceinca-video-fx/dist/",
    "ceinca-video-fx/examples/assets/clips/",
    "ceinca-video-fx/examples/frames/",
)
with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, _, filenames in os.walk(root_dir):
        for fn in sorted(filenames):
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, parent).replace("\\", "/")
            if rel.startswith(skip_prefixes):
                continue
            if rel == "ceinca-video-fx/package-lock.json":
                continue
            if rel.startswith("ceinca-video-fx/examples/") and rel.endswith(".mp4"):
                continue
            zf.write(full, rel)
PYEOF
fi
ls -l "$OUT" | awk '{print "✓ zip:", $9, "(" $5 " bytes)"}'
