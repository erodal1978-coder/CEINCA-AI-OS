#!/bin/bash
# CASA & CAMPO — quema los subtítulos ASS en el máster de testimonios.
#
# Se re-encoda el vídeo (quemar subtítulos obliga a ello) pero el audio se
# copia tal cual: el máster ya está en -14 LUFS con el pico real limitado y
# volver a codificarlo sólo lo degradaría.
set -e
S="${TESTI_SCRATCH:-/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad}"
cd "$S"

ASS="subs/testi.ass"
IN="out4/CASA_CAMPO_Testimonios_Promo2026.mp4"
OUT="out4/CASA_CAMPO_Testimonios_Promo2026_SUB.mp4"

[ -f "$ASS" ] || { echo "falta $ASS — corre build_testi_subs.py ass"; exit 1; }
[ -f "$IN" ]  || { echo "falta $IN — corre build_testi_mix.sh";        exit 1; }

# fontsdir es obligatorio y en ruta absoluta: Anton no está instalada en el
# sistema, y si libass no la encuentra cae a una fuente por defecto sin avisar.
# Para comprobar qué fuente eligió de verdad:
#   ffmpeg -v info ... 2>&1 | grep fontselect
ffmpeg -y -v error -i "$IN" \
  -vf "subtitles=${ASS}:fontsdir=${S}/fonts" \
  -c:v libx264 -preset slow -crf 21 -maxrate 10M -bufsize 14M \
  -pix_fmt yuv420p -profile:v high -level 4.1 -g 60 \
  -c:a copy -movflags +faststart "$OUT"

ffmpeg -y -v error -ss 1.35 -i "$OUT" -frames:v 1 -q:v 2 \
  out4/CASA_CAMPO_Testimonios_portada.jpg

echo "--- entregable ---"
ls -lh "$OUT"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height \
  -show_entries format=duration -of default=nw=1 "$OUT"
echo "--- el audio se copió sin recodificar ---"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null /dev/null 2>&1 \
  | grep -E "^    I:|^    Peak:"
