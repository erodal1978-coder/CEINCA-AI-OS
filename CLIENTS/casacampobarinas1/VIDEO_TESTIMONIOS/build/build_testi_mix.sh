#!/bin/bash
# CASA & CAMPO — Reel de testimonios: montaje + rescate de voz + mezcla
set -e
S=/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad
SRC=/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11
cd "$S"
mkdir -p out4

# ------------------------------------------------------------ 1. vídeo
# gancho + 4 testimonios (cortes en los silencios reales entre frases)
{ echo "file '$S/seg4/00_hook.mp4'"; cat seg4/list.txt; } > seg4/full.txt
ffmpeg -y -v error -f concat -safe 0 -i seg4/full.txt -c copy testi_cuerpo.mp4

ffmpeg -y -v error -i testi_cuerpo.mp4 -i seg4/99_cta.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.4:offset=26.15,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 testi_nomix.mp4

ffmpeg -y -v error -i testi_nomix.mp4 \
  -c:v libx264 -preset slow -crf 21 -maxrate 10M -bufsize 14M \
  -pix_fmt yuv420p -profile:v high -level 4.1 -g 60 -an testi_final.mp4

# ------------------------------------------------------------ 2. rescate de voz
# Los testimonios se grabaron dentro de la fiesta: la música del party estaba
# ENCIMA de la voz (entre -2.6 y -8.6 dB). La cadena corta el bajo del party,
# realza la banda de voz, reduce ruido y comprime para levantar lo que quedó.
# Resultado medido: la voz pasa a estar +5 a +20 dB por encima del bajo.
VOZ="highpass=f=180:poles=2,highpass=f=180:poles=2,
     equalizer=f=250:t=q:w=1.0:g=-6,
     equalizer=f=1800:t=q:w=1.2:g=5,
     equalizer=f=3200:t=q:w=1.4:g=4,
     afftdn=nf=-25:tn=1,
     acompressor=threshold=0.05:ratio=4:attack=8:release=180:makeup=3,
     loudnorm=I=-15:TP=-2"

# Cada tramo se coloca donde va su imagen (ver SHOTS en build_testi_video.py)
mkvoz () {  # $1 archivo  $2 ss  $3 dur  $4 posición  $5 salida
  ffmpeg -y -v error -ss "$2" -t "$3" -i "$SRC/$1" -vn -ac 2 -ar 48000 \
    -af "$VOZ,afade=t=in:st=0:d=0.06,afade=t=out:st=$(python3 -c "print(max(0,$3-0.10))"):d=0.10,
         adelay=$(python3 -c "print(int($4*1000))")|$(python3 -c "print(int($4*1000))"),
         apad=whole_dur=30.6,
         aformat=sample_rates=48000:channel_layouts=stereo" "$5"
}
mkvoz f7245811-VID20260801WA00071.mp4 0.95 1.80  2.00  voz_a.wav
mkvoz 696e3c2d-VID20260801WA01011.mp4 0.05 5.75  3.80  voz_b.wav
mkvoz 4c7effd7-VID20260801WA00091.mp4 0.90 8.05  9.55  voz_c.wav
mkvoz 25ba7d3c-VID20260801WA00101.mp4 0.50 8.95 17.60  voz_d.wav

# ------------------------------------------------------------ 3. mezcla
# La música ya viene silenciada bajo los testimonios desde el propio arreglo,
# así que aquí no hace falta ducking: no hay nada que agachar.
ffmpeg -y -v error -i testi_music.wav -i voz_a.wav -i voz_b.wav -i voz_c.wav -i voz_d.wav \
  -filter_complex "
  [0:a]volume=0.85[m];
  [1:a]volume=1.00[a];[2:a]volume=1.00[b];[3:a]volume=1.00[c];[4:a]volume=1.00[d];
  [m][a][b][c][d]amix=inputs=5:duration=first:normalize=0,
  aformat=sample_rates=48000:channel_layouts=stereo[out]" \
  -map "[out]" -t 30.55 -c:a pcm_s16le testi_raw.wav

echo "--- normalización + limitador de pico real ---"
python3 tp_limit.py testi_raw.wav testi_mix.wav -14.0 -2.5

# ------------------------------------------------------------ 4. muxing
ffmpeg -y -v error -i testi_final.mp4 -i testi_mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out4/CASA_CAMPO_Testimonios_Promo2026.mp4

ffmpeg -y -v error -ss 0.9 -i out4/CASA_CAMPO_Testimonios_Promo2026.mp4 \
  -frames:v 1 -q:v 2 out4/CASA_CAMPO_Testimonios_portada.jpg

# ------------------------------------------------------------ 5. control
echo ""
echo "--- entregables ---"
for f in out4/*; do
  printf "%-46s %6s  " "$(basename "$f")" "$(du -h "$f" | cut -f1)"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo ""
done
echo ""
echo "--- loudness / pico real tras AAC ---"
ffmpeg -hide_banner -nostats -i out4/CASA_CAMPO_Testimonios_Promo2026.mp4 \
  -af ebur128=peak=true -f null /dev/null 2>&1 | grep -E "^    I:|^    Peak:"
