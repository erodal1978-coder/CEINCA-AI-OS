#!/usr/bin/env bash
# build-zip.sh — empaqueta la skill para subirla como skill personalizada en claude.ai.
# Antes: npm run sync-brand (y commitear) para que themes/ y vendor/fonts/ reflejen el manual vigente.
set -euo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SKILL"
bash scripts/check.sh estatico
mkdir -p dist
OUT="$SKILL/dist/ceinca-video-fx.zip"
rm -f "$OUT"
PARENT="$(dirname "$SKILL")"
( cd "$PARENT" && zip -qr "$OUT" ceinca-video-fx \
    -x 'ceinca-video-fx/node_modules/*' 'ceinca-video-fx/.cache/*' 'ceinca-video-fx/.build/*' 'ceinca-video-fx/out/*' 'ceinca-video-fx/dist/*' \
       'ceinca-video-fx/examples/*.mp4' 'ceinca-video-fx/examples/assets/clips/*' 'ceinca-video-fx/examples/frames/*' 'ceinca-video-fx/package-lock.json' )
ls -l "$OUT" | awk '{print "✓ zip:", $9, "(" $5 " bytes)"}'
unzip -l "$OUT" | tail -1
