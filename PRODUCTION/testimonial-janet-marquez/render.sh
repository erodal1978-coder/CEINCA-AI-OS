#!/usr/bin/env bash
# Reel/TikTok - Testimonial Dra. Janet Marquez (Bootcamp Mercantil Barinas)
#
#   ./render.sh [dir_trabajo]
#
# Requiere ffmpeg con libass, y python3 con pillow y fonttools.
# El dir de trabajo debe traer fonts/, words.json, edl.json (ver README).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
WORK="${1:-$HERE/.work}"
SRC="$REPO/assets/testimonial-janet-marquez"
OUT="$SRC"
SEGS="$WORK/segs"
mkdir -p "$SEGS"

VID="$SRC/VID_20260805_173719_112_bsl.mp4"
BROLL="$SRC/BROLLS_AGOSTO25_comprimido.mp4"
LOGO="$SRC/Logo animado ver. 3_final.mp4"
MUS="$SRC/daynigthmorning-background-inspiring-corporate-motivational-281454.mp3"

FPS=30
W=1080; H=1920

# --- Paso 0: preparacion (fuentes, subtitulos y overlays) --------------------
# Montserrat vive en carrusel-export/ de la rama main; se extrae de ahi y se
# reescriben los nombres de familia, porque los subsets web vienen rotulados
# "Montserrat Thin" en todos los pesos y libass no podria distinguirlos.
mkdir -p "$WORK/fonts"
if [ ! -f "$WORK/fonts/MontsXBold.ttf" ]; then
  echo ">> Paso 0: preparando Montserrat..."
  for w in 400 600 700 800 900; do
    git -C "$REPO" show "origin/main:carrusel-export/assets/fonts/montserrat-$w.woff2" \
      > "$WORK/m-$w.woff2"
  done
  python3 - "$WORK" <<'PY'
import sys
from fontTools.ttLib import TTFont
work = sys.argv[1]
for w, fam in {"400": "MontsReg", "600": "MontsSemi", "700": "MontsBold",
               "800": "MontsXBold", "900": "MontsBlack"}.items():
    f = TTFont(f"{work}/m-{w}.woff2"); f.flavor = None
    for rec in f["name"].names:
        if rec.nameID in (1, 3, 4, 6, 16, 17):
            v = "Regular" if rec.nameID in (2, 17) else fam
            rec.string = v.encode("utf-16-be") if rec.platformID == 3 else v.encode("latin-1")
    f.save(f"{work}/fonts/{fam}.ttf")
print("   fuentes listas")
PY
  rm -f "$WORK"/m-*.woff2
fi

cp -f "$HERE/words.json" "$HERE/edl.json" "$WORK/"
python3 "$HERE/build_overlays.py" "$WORK/fonts" "$WORK"

# --- Paso 3: segmentos con punch-in -----------------------------------------
# seg:src_in:src_out:punch_rel:base_zoom
# El zoom base alterna entre planos consecutivos para que cada corte lea como
# jump cut; el punch entra sobre la palabra de mayor peso de la frase.
# La fuente es 1440x2560, asi que hasta 1.33x no hay perdida de resolucion.
SEGMENTS=(
  "HOOK:16.96:19.80:2.16:1.00"
  "A:0.33:4.95:1.46:1.05"
  "B:5.56:10.58:1.84:1.00"
  "C:10.96:12.20:0.40:1.06"
  "D:12.90:15.70:1.98:1.00"
  "E:16.52:19.80:2.48:1.05"
  "F:19.80:23.04:1.50:1.00"
  "G:23.24:32.27:6.96:1.04"
  "H:33.02:40.00:5.53:1.00"
  "I:40.14:44.20:1.55:1.05"
)

echo ">> Paso 3: extrayendo ${#SEGMENTS[@]} segmentos con punch-in..."
CONCAT="$WORK/concat.txt"; : > "$CONCAT"
for spec in "${SEGMENTS[@]}"; do
  IFS=: read -r name a b punch base <<< "$spec"
  out="$SEGS/$name.mov"
  dur=$(python3 -c "print(round($b-$a,3))")
  if [ ! -f "$out" ]; then
    # z sube del zoom base a base+0.06 en 0.35s a partir de la palabra clave
    Z="$base+0.06*clip((on/$FPS-$punch)/0.35,0,1)"
    ffmpeg -y -v error -ss "$a" -t "$dur" -i "$VID" \
      -filter_complex "\
[0:v]fps=$FPS,scale=1440:2560,setsar=1,\
zoompan=z='$Z':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,\
format=yuv420p[v];\
[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[a]" \
      -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 15 -r $FPS \
      -c:a pcm_s16le "$out"
  fi
  echo "file '$out'" >> "$CONCAT"
  printf "   %-5s %5.2fs  zoom %s -> +0.06 @%ss\n" "$name" "$dur" "$base" "$punch"
done

# --- montaje del cuerpo ------------------------------------------------------
echo ">> Concatenando cuerpo..."
ffmpeg -y -v error -f concat -safe 0 -i "$CONCAT" \
  -c:v libx264 -preset veryfast -crf 15 -r $FPS -c:a pcm_s16le "$WORK/body.mov"
BODY=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WORK/body.mov")
echo "   cuerpo = ${BODY}s"

# --- b-roll: cortes de interrupcion (solo video, la voz sigue) --------------
# out_in:dur:src_in  -- el b-roll esta a 60fps y 760x1350, se conforma a 30fps
# y se escala/recorta a 1080x1920.
BROLLS=("9.60:1.80:46.0" "25.50:2.50:94.0" "33.60:2.50:145.0")
echo ">> Insertando ${#BROLLS[@]} cortes de b-roll..."
i=0
for spec in "${BROLLS[@]}"; do
  IFS=: read -r oin d sin <<< "$spec"
  ffmpeg -y -v error -ss "$sin" -t "$d" -i "$BROLL" \
    -vf "fps=$FPS,scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},\
eq=brightness=0.01:contrast=1.04:saturation=1.06,setsar=1,format=yuv420p" \
    -an -c:v libx264 -preset veryfast -crf 15 -r $FPS "$SEGS/br$i.mp4"
  i=$((i+1))
done

ffmpeg -y -v error -i "$WORK/body.mov" \
  -i "$SEGS/br0.mp4" -i "$SEGS/br1.mp4" -i "$SEGS/br2.mp4" \
  -filter_complex "\
[1:v]setpts=PTS-STARTPTS+9.60/TB[b0];\
[2:v]setpts=PTS-STARTPTS+25.50/TB[b1];\
[3:v]setpts=PTS-STARTPTS+33.60/TB[b2];\
[0:v][b0]overlay=0:0:enable='between(t,9.60,11.40)'[v1];\
[v1][b1]overlay=0:0:enable='between(t,25.50,28.00)'[v2];\
[v2][b2]overlay=0:0:enable='between(t,33.60,36.10)',format=yuv420p[vout]" \
  -map "[vout]" -map 0:a -c:v libx264 -preset veryfast -crf 15 -r $FPS \
  -c:a pcm_s16le "$WORK/body_broll.mov"

# --- Paso 4: overlays --------------------------------------------------------
# Rotulo 0-3s con fundido de salida a los 3.0-4.0s; tercio inferior 4.2-8.2s
# con entrada y salida de 0.4s; subtitulos karaoke quemados con libass.
echo ">> Paso 4: rotulo, tercio inferior y subtitulos..."
ffmpeg -y -v error -i "$WORK/body_broll.mov" \
  -loop 1 -framerate $FPS -t 4.0 -i "$WORK/banner_open.png" \
  -loop 1 -framerate $FPS -t 4.0 -i "$WORK/lower_third.png" \
  -filter_complex "\
[1:v]format=rgba,fade=t=in:st=0:d=0.4:alpha=1,fade=t=out:st=3.0:d=1.0:alpha=1,\
setpts=PTS-STARTPTS[bn];\
[2:v]format=rgba,fade=t=in:st=0:d=0.4:alpha=1,fade=t=out:st=3.6:d=0.4:alpha=1,\
setpts=PTS-STARTPTS+4.2/TB[lt];\
[0:v][bn]overlay=0:0:enable='between(t,0,4.0)'[v1];\
[v1][lt]overlay=0:0:enable='between(t,4.2,8.2)'[v2];\
[v2]subtitles=$WORK/subs.ass:fontsdir=$WORK/fonts,format=yuv420p[vout]" \
  -map "[vout]" -map 0:a -c:v libx264 -preset veryfast -crf 15 -r $FPS \
  -c:a pcm_s16le "$WORK/body_final.mov"

# --- Paso 5: audio -----------------------------------------------------------
# Musica normalizada a -16 LUFS y comprimida por sidechain con la voz como
# disparador: baja ~15-18 dB mientras ella habla y se recupera en los huecos.
# Fade de salida terminado antes del logo para que su SFX entre limpio.
echo ">> Paso 5: musica con ducking..."
# loudnorm en modo dinamico arrastra ~3s de lookahead: con amix duration=first
# eso truncaba la mezcla 2.9s antes de tiempo y se llevaba por delante tambien
# el audio del logo en el concat final. Las dos fuentes se normalizan en dos
# pasadas (medir -> aplicar con measured_* y linear=true), que conserva la
# duracion, y la longitud se fija ademas con apad+atrim.
measure() {   # $1=archivo  $2=prefiltro o vacio  $3=target LUFS
  ffmpeg -hide_banner -nostats -i "$1" \
    -af "${2:+$2,}loudnorm=I=$3:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
    | sed -n '/^{/,/^}/p' \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])"
}

read -r V_I V_TP V_LRA V_TH V_OF < <(measure "$WORK/body_final.mov" "" -14)
echo "   voz medida:    I=$V_I LUFS TP=$V_TP"
read -r M_I M_TP M_LRA M_TH M_OF < <(measure "$MUS" "atrim=0:$BODY" -16)
echo "   musica medida: I=$M_I LUFS TP=$M_TP"

LN_V="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$V_I:measured_TP=$V_TP:measured_LRA=$V_LRA:measured_thresh=$V_TH:offset=$V_OF:linear=true"
LN_M="loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$M_I:measured_TP=$M_TP:measured_LRA=$M_LRA:measured_thresh=$M_TH:offset=$M_OF:linear=true"

MFADE=$(python3 -c "print(round($BODY-2.0,3))")
ffmpeg -y -v error -i "$WORK/body_final.mov" -i "$MUS" \
  -filter_complex "\
[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,\
$LN_V,apad,atrim=0:$BODY,asetpts=PTS-STARTPTS,asplit=2[voz][sc];\
[1:a]atrim=0:$BODY,asetpts=PTS-STARTPTS,aresample=48000,\
$LN_M,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.42[mus];\
[mus][sc]sidechaincompress=threshold=0.03:ratio=14:attack=15:release=340:makeup=1[duck];\
[duck]afade=t=in:st=0:d=1.5,afade=t=out:st=$MFADE:d=2.0,apad,atrim=0:$BODY[musd];\
[voz][musd]amix=inputs=2:duration=longest:weights=1 1:normalize=0,\
atrim=0:$BODY,alimiter=limit=0.95[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a pcm_s16le "$WORK/body_mixed.mov"

AD=$(ffprobe -v error -select_streams a -show_entries stream=duration -of csv=p=0 "$WORK/body_mixed.mov")
echo "   mezcla: audio ${AD}s / video ${BODY}s"

# --- Paso 6: cierre con el logo animado --------------------------------------
echo ">> Paso 6: cierre con logo (audio propio intacto)..."
ffmpeg -y -v error -i "$LOGO" \
  -vf "fps=$FPS,scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,format=yuv420p" \
  -af "aresample=48000,pan=stereo|c0=c0|c1=c0,aformat=sample_fmts=fltp" \
  -c:v libx264 -preset veryfast -crf 15 -r $FPS -c:a pcm_s16le "$SEGS/logo.mov"
# El logo trae audio mono. La conversion normal a estereo reparte potencia y
# resta 3 dB por canal; con pan se duplica el canal tal cual, que es lo que
# mantiene el SFX al nivel del archivo original. No se normaliza ni se
# comprime: entra intacto y sin musica encima.

printf "file '%s'\nfile '%s'\n" "$WORK/body_mixed.mov" "$SEGS/logo.mov" > "$WORK/final.txt"

# --- Paso 7: exportacion -----------------------------------------------------
echo ">> Exportando..."
ffmpeg -y -v error -f concat -safe 0 -i "$WORK/final.txt" \
  -c:v libx264 -preset slow -profile:v high -level 4.2 \
  -b:v 10500k -minrate 8500k -maxrate 13M -bufsize 20M -pix_fmt yuv420p -r $FPS \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  "$OUT/REEL_Testimonial_Janet_Marquez.mp4"

echo ">> listo: $OUT/REEL_Testimonial_Janet_Marquez.mp4"
