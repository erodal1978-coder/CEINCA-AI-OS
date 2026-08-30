#!/bin/bash
# CASA & CAMPO — Reel de Angelo: montaje final + mezcla con J-cut / L-cut
set -e
S=/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad
SRC=/home/user/CEINCA-AI-OS/Videos/Assets
cd "$S"
mkdir -p out3

# ------------------------------------------------------------ 1. vídeo
# Cuerpo (5 planos, cortes en beat) + placa de cierre, unidos con una
# disolvencia corta que cae en el beat de 14.0 s.
ffmpeg -y -v error -f concat -safe 0 -i seg3/list.txt -c copy angelo_body.mp4

ffmpeg -y -v error -i angelo_body.mp4 -i seg3/99_cta.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.4:offset=13.6,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
  angelo_nomix.mp4

ffmpeg -y -v error -i angelo_nomix.mp4 \
  -c:v libx264 -preset slow -crf 20 -maxrate 12M -bufsize 16M \
  -pix_fmt yuv420p -profile:v high -level 4.1 -g 60 -an angelo_final.mp4

# ------------------------------------------------------------ 2. audio real
# J-CUT: el mariachi entra en 4.20 s, medio segundo ANTES de su imagen (4.667),
# así el sonido "tira" del corte en vez de seguirlo.
# L-CUT: sigue sonando hasta 9.00 s, un segundo DESPUÉS de que la imagen ya
# cambió al abrazo (8.00) — el mariachi une los dos planos.
# Fuente: a139 desde 8.133 s, que es 0.467 s antes del punto de entrada de su
# plano, para que imagen y sonido queden en fase.
ffmpeg -y -v error -ss 8.133 -t 4.80 -i "$SRC/VID-20260804-WA0139.mp4" \
  -af "highpass=f=90,lowpass=f=13000,
       loudnorm=I=-17:TP=-3:LRA=11,
       afade=t=in:st=0:d=0.50,afade=t=out:st=4.00:d=0.80,
       adelay=4200|4200,
       apad=whole_dur=18,
       aformat=sample_rates=48000:channel_layouts=stereo" \
  -vn ang_mariachi.wav

# Ambiente de la multitud bajo el plano final (10.667 – 14.0)
ffmpeg -y -v error -ss 0.60 -t 3.40 -i "$SRC/VID-20260811-WA0150.mp4" \
  -af "highpass=f=250,lowpass=f=6000,
       loudnorm=I=-24:TP=-6:LRA=11,
       afade=t=in:st=0:d=0.40,afade=t=out:st=2.80:d=0.60,
       adelay=10667|10667,
       apad=whole_dur=18,
       aformat=sample_rates=48000:channel_layouts=stereo" \
  -vn ang_gentio.wav

# Ambiente del abrazo inicial: da veracidad al gancho sin tapar la música
ffmpeg -y -v error -ss 46.50 -t 2.00 -i "$SRC/VID-20260804-WA0100.mp4" \
  -af "highpass=f=300,lowpass=f=5000,
       loudnorm=I=-27:TP=-8:LRA=11,
       afade=t=in:st=0:d=0.25,afade=t=out:st=1.55:d=0.45,
       apad=whole_dur=18,
       aformat=sample_rates=48000:channel_layouts=stereo" \
  -vn ang_gancho.wav

# ------------------------------------------------------------ 3. mezcla
# Sin normalizar aquí: nivel y pico real los fija tp_limit.py.
ffmpeg -y -v error -i ang_music.wav -i ang_sfx.wav -i ang_mariachi.wav \
  -i ang_gentio.wav -i ang_gancho.wav -filter_complex "
  [0:a]volume=1.00[m];
  [1:a]volume=0.80[s];
  [2:a]volume=1.15[mar];
  [3:a]volume=0.55[amb];
  [4:a]volume=0.50[hk];
  [m][s][mar][amb][hk]amix=inputs=5:duration=first:normalize=0,
  aformat=sample_rates=48000:channel_layouts=stereo[out]" \
  -map "[out]" -t 18 -c:a pcm_s16le ang_raw_master.wav

# Versión sin música propia: conserva mariachi real, ambiente y efectos,
# para montarle audio de tendencia en Instagram.
ffmpeg -y -v error -i ang_sfx.wav -i ang_mariachi.wav -i ang_gentio.wav \
  -i ang_gancho.wav -filter_complex "
  [0:a]volume=0.50[s];
  [1:a]volume=1.25[mar];
  [2:a]volume=0.75[amb];
  [3:a]volume=0.70[hk];
  [s][mar][amb][hk]amix=inputs=4:duration=first:normalize=0,
  aformat=sample_rates=48000:channel_layouts=stereo[out]" \
  -map "[out]" -t 18 -c:a pcm_s16le ang_raw_clean.wav

echo "--- normalización + limitador de pico real ---"
python3 tp_limit.py ang_raw_master.wav ang_mix_master.wav -14.0 -2.5
python3 tp_limit.py ang_raw_clean.wav  ang_mix_clean.wav  -17.0 -2.5

# ------------------------------------------------------------ 4. muxing
ffmpeg -y -v error -i angelo_final.mp4 -i ang_mix_master.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out3/CASA_CAMPO_Angelo_Bienvenida_MASTER.mp4

ffmpeg -y -v error -i angelo_final.mp4 -i ang_mix_clean.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart -shortest \
  out3/CASA_CAMPO_Angelo_Bienvenida_SIN_MUSICA.mp4

ffmpeg -y -v error -ss 0.9 -i out3/CASA_CAMPO_Angelo_Bienvenida_MASTER.mp4 \
  -frames:v 1 -q:v 2 out3/CASA_CAMPO_Angelo_portada.jpg

# ------------------------------------------------------------ 5. control
echo ""
echo "--- entregables ---"
for f in out3/*; do
  printf "%-52s %6s  " "$(basename "$f")" "$(du -h "$f" | cut -f1)"
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo ""
done
echo ""
echo "--- loudness / pico real tras AAC ---"
for f in out3/*.mp4; do
  echo "  $(basename "$f")"
  ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null /dev/null 2>&1 \
    | grep -E "^    I:|^    Peak:"
done
