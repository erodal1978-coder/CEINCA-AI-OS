#!/bin/bash
# CASA & CAMPO — habitaciones: montaje final + mezcla
set -e
S=/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad
cd "$S"
mkdir -p out2

# ------------------------------------------------------------ 1. vídeo
# hab_body.mp4 (18.60 s) lo produce build_hab_video.py
ffmpeg -y -v error -i hab_body.mp4 -i seg2/99_endcard.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=18.1,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
  hab_master_noaudio.mp4

ffmpeg -y -v error -i hab_master_noaudio.mp4 \
  -c:v libx264 -preset slow -crf 21 -maxrate 10M -bufsize 14M \
  -pix_fmt yuv420p -profile:v high -level 4.1 -g 60 -an hab_final.mp4

# ------------------------------------------------------------ 2. mezclas
# Sin normalizar aquí; nivel y pico real los fija tp_limit.py (limitador de
# pico real con sobremuestreo 4x — alimiter sólo mide picos de muestra).
ffmpeg -y -v error -i hab_music.wav -i hab_sfx.wav -filter_complex "
  [0:a]volume=1.00[m];
  [1:a]volume=0.90[s];
  [m][s]amix=inputs=2:duration=first:normalize=0,
  aformat=sample_rates=48000:channel_layouts=stereo[out]" \
  -map "[out]" -c:a pcm_s16le hab_raw_master.wav

# Versión sin música: sólo efectos, para montar audio de tendencia en IG
ffmpeg -y -v error -i hab_sfx.wav -af \
  "volume=1.0,aformat=sample_rates=48000:channel_layouts=stereo" \
  -c:a pcm_s16le hab_raw_clean.wav

echo "--- normalización + limitador de pico real ---"
python3 tp_limit.py hab_raw_master.wav hab_mix_master.wav -14.0 -2.5
python3 tp_limit.py hab_raw_clean.wav  hab_mix_clean.wav  -18.0 -2.5

# ------------------------------------------------------------ 3. muxing
ffmpeg -y -v error -i hab_final.mp4 -i hab_mix_master.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out2/CASA_CAMPO_Hospedaje_MASTER.mp4

ffmpeg -y -v error -i hab_final.mp4 -i hab_mix_clean.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out2/CASA_CAMPO_Hospedaje_SIN_MUSICA.mp4

ffmpeg -y -v error -i hab_mix_master.wav -c:a libmp3lame -b:a 192k \
  out2/CASA_CAMPO_pista_hospedaje_100bpm.mp3

# Portada: el plano del anuncio
ffmpeg -y -v error -ss 3.4 -i out2/CASA_CAMPO_Hospedaje_MASTER.mp4 \
  -frames:v 1 -q:v 2 out2/CASA_CAMPO_Hospedaje_portada.jpg

# ------------------------------------------------------------ 4. control
echo ""
echo "--- entregables ---"
for f in out2/*; do
  printf "%-48s %6s  " "$(basename "$f")" "$(du -h "$f" | cut -f1)"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo ""
done
echo ""
echo "--- loudness / pico real tras AAC (debe quedar bajo 0 dBFS) ---"
for f in out2/*.mp4; do
  echo "  $(basename "$f")"
  ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null /dev/null 2>&1 \
    | grep -E "^    I:|^    Peak:"
done
