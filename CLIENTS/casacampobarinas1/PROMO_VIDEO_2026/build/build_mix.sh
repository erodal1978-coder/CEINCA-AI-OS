#!/bin/bash
# CASA & CAMPO — montaje final de vídeo + mezcla de audio
# Requiere: seg/*.mp4 (build_video.py), seg/99_endcard.mp4 (build_endcard.sh),
#           music.wav + sfx.wav (build_music.py)
set -e
S=/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad
SRC=/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11
cd "$S"
mkdir -p out

# ---------------------------------------------------------------- 1. vídeo
ffmpeg -y -v error -f concat -safe 0 -i seg/list.txt -c copy body.mp4

# Disolvencia del último plano a la placa de marca
ffmpeg -y -v error -i body.mp4 -i seg/99_endcard.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fadeblack:duration=0.5:offset=27.5,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
  video_master_noaudio.mp4

# Codificación final única; cada entregable sólo cambia la pista de audio.
ffmpeg -y -v error -i video_master_noaudio.mp4 \
  -c:v libx264 -preset slow -crf 21 -maxrate 10M -bufsize 14M \
  -pix_fmt yuv420p -profile:v high -level 4.1 -g 60 -an video_final.mp4

# ---------------------------------------------------------------- 2. ambiente
# Sonido real de la fiesta (gente, gritos, chapoteo) del clip más largo.
# Se recorta grave y agudo extremo para conservar sólo la textura de multitud
# y que la música original del clip no choque con la nueva.
ffmpeg -y -v error -ss 0.4 -t 30.9 -i "$SRC/4fd3aea0-VID20260801WA00061.mp4" \
  -af "highpass=f=800,lowpass=f=4200,
       acompressor=threshold=0.06:ratio=4:attack=25:release=280,
       volume=2.2,
       afade=t=in:st=0:d=1.2,afade=t=out:st=29.4:d=1.5,
       aformat=sample_rates=48000:channel_layouts=stereo" \
  -vn ambience.wav

# ---------------------------------------------------------------- 3. mezclas
# Se suman sin normalizar; nivel y pico real los fija tp_limit.py.
# (alimiter de ffmpeg sólo controla picos de muestra y deja pasar picos
#  inter-muestra que el AAC convierte en saturación por encima de 0 dBFS.)

# A) MASTER: música + SFX + ambiente
ffmpeg -y -v error -i music.wav -i sfx.wav -i ambience.wav -filter_complex "
  [0:a]volume=1.00[m];
  [1:a]volume=0.85[s];
  [2:a]volume=0.16[a];
  [m][s][a]amix=inputs=3:duration=first:normalize=0,
  aformat=sample_rates=48000:channel_layouts=stereo[out]" \
  -map "[out]" -c:a pcm_s16le raw_master.wav

# B) CLEAN: sin música, para montar audio de tendencia en Instagram
ffmpeg -y -v error -i sfx.wav -i ambience.wav -filter_complex "
  [0:a]volume=0.55[s];
  [1:a]volume=0.75[a];
  [s][a]amix=inputs=2:duration=first:normalize=0,
  aformat=sample_rates=48000:channel_layouts=stereo[out]" \
  -map "[out]" -c:a pcm_s16le raw_clean.wav

echo "--- normalización + limitador de pico real ---"
python3 tp_limit.py raw_master.wav mix_master.wav -14.0 -2.5
python3 tp_limit.py raw_clean.wav  mix_clean.wav  -16.0 -2.5

# ---------------------------------------------------------------- 4. muxing
ffmpeg -y -v error -i video_final.mp4 -i mix_master.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out/CASA_CAMPO_Promo_2026_MASTER.mp4

ffmpeg -y -v error -i video_final.mp4 -i mix_clean.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out/CASA_CAMPO_Promo_2026_SIN_MUSICA.mp4

ffmpeg -y -v error -i mix_master.wav -c:a libmp3lame -b:a 192k \
  out/CASA_CAMPO_pista_original_120bpm.mp3

# Portada para el feed (frame del bloque de prueba social)
ffmpeg -y -v error -ss 19.2 -i out/CASA_CAMPO_Promo_2026_MASTER.mp4 \
  -frames:v 1 -q:v 2 out/CASA_CAMPO_portada.jpg

# ---------------------------------------------------------------- 5. control
echo ""
echo "--- entregables ---"
for f in out/*; do
  printf "%-46s %6s  " "$(basename "$f")" "$(du -h "$f" | cut -f1)"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo ""
done
echo ""
echo "--- loudness / pico real tras AAC (debe quedar bajo 0 dBFS) ---"
for f in out/*.mp4; do
  echo "  $(basename "$f")"
  ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null /dev/null 2>&1 \
    | grep -E "^    I:|^    Peak:"
done
