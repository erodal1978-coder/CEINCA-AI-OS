#!/usr/bin/env bash
# UDS - Cierre de Semestre 2026 - VERSION 2
# Corte limpio: solo montaje de fotos, sin texto ni logo encima, y una unica
# tarjeta de cierre con el logo y "Felices vacaciones.".
#
#   ./render_v2.sh [dir_trabajo]
#
# Requiere ffmpeg y python3 con pillow, numpy, scipy, fonttools y brotli.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
WORK="${1:-$HERE/.work-v2}"
SRC="$REPO/assets"
OUT="$SRC/uds-video"
FONTS="$WORK/fonts"
CLIPS="$WORK/clips"
mkdir -p "$CLIPS" "$FONTS" "$OUT"

# --- Paso 0: Montserrat (woff2 del repo -> ttf para Pillow) ------------------
python3 - "$REPO/carrusel-export/assets/fonts" "$FONTS" <<'PY'
import sys, os
from fontTools.ttLib import TTFont
src, dst = sys.argv[1], sys.argv[2]
for w in ("400", "600", "700"):
    out = f"{dst}/Montserrat-{w}.ttf"
    if os.path.exists(out):
        continue
    f = TTFont(f"{src}/montserrat-{w}.woff2")
    f.flavor = None
    f.save(out)
PY

# --- Paso 1: tratamiento del logo -------------------------------------------
# colorkey en blanco; el flood fill posterior (build_logo.py) devuelve los
# blancos interiores -- atleta y estrellas -- que el keyeado perfora.
ffmpeg -y -v error -i "$SRC/channels4_profile.jpg" \
  -vf "colorkey=color=0xFFFFFF:similarity=0.12:blend=0.02,format=rgba" \
  -frames:v 1 "$WORK/logo_keyed_raw.png"
python3 "$HERE/build_logo.py" "$WORK/logo_keyed_raw.png" \
  "$OUT/logo_final.png" "$OUT/logo_final_reverse.png" "$OUT/logo_emblem.png"

# --- Paso 3: tarjeta de cierre ----------------------------------------------
# Se usa la variante reverse: es logo_final.png completo, con el wordmark
# negro invertido a blanco para que lea sobre #0A0A0A (en v2 la tarjeta no
# lleva el nombre compuesto aparte, asi que el wordmark si hace falta).
python3 "$HERE/build_card_v2.py" "$FONTS" "$OUT/card_close_v2.png" \
  "$OUT/logo_final_reverse.png"

# --- parametros de tiempo ----------------------------------------------------
FPS=30
DUR=1.4           # duracion por foto (rango pedido: 1.3-1.5)
XF=0.4            # crossfade entre fotos
STEP=1.0          # DUR - XF: avance real por foto
CARD=4.0          # tarjeta de cierre
NF=42             # frames por clip = DUR * FPS
ZOOM=0.07         # Ken Burns 1.00x -> 1.07x
TAIL=0.5          # fundido a negro al final del montaje

mapfile -t PHOTOS < <(ls "$SRC"/IMG-*.jpg | sort)
N=${#PHOTOS[@]}
MONTAGE_DUR=$(python3 -c "print(round($DUR + ($N-1)*$STEP, 3))")
TOTAL=$(python3 -c "print(round($MONTAGE_DUR + $CARD, 3))")
AFADE_OUT=$(python3 -c "print(round($TOTAL - 2.5, 3))")
echo ">> v2 | $N fotos | montaje ${MONTAGE_DUR}s + tarjeta ${CARD}s = ${TOTAL}s"

# --- Paso 2: un clip por foto -----------------------------------------------
# Correccion de color uniforme + encuadre 1080x1920 sobre fondo desenfocado de
# la propia foto (ver README: el crop duro a 9:16 decapitaba a los docentes en
# las fotos apaisadas) + Ken Burns con direccion alternada foto a foto.
echo ">> Paso 2: generando $N clips Ken Burns de ${DUR}s..."
for i in "${!PHOTOS[@]}"; do
  out="$CLIPS/$(printf '%03d' "$i").mp4"
  [ -f "$out" ] && continue
  if (( i % 2 == 0 )); then
    Z="1.0+$ZOOM*on/$((NF-1))"          # zoom in
  else
    Z="1.0+$ZOOM-$ZOOM*on/$((NF-1))"    # zoom out
  fi
  ffmpeg -y -v error -loop 1 -framerate $FPS -t $DUR -i "${PHOTOS[$i]}" \
    -filter_complex "\
[0:v]eq=brightness=0.02:contrast=1.05:saturation=1.08,split=2[a][b];\
[a]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,\
gblur=sigma=9,eq=brightness=-0.22:saturation=0.70,scale=2160:3840[bg];\
[b]scale=2160:3840:force_original_aspect_ratio=decrease:flags=lanczos[fg];\
[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,\
zoompan=z='$Z':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=$FPS,\
format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 14 -r $FPS -an "$out"
  printf '\r   %d/%d' "$((i+1))" "$N"
done
echo ""

# --- montaje: cadena de xfade -----------------------------------------------
echo ">> Montaje con crossfades de ${XF}s..."
INPUTS=(); FC=""; PREV="0:v"
for i in "${!PHOTOS[@]}"; do
  INPUTS+=(-i "$CLIPS/$(printf '%03d' "$i").mp4")
done
for (( j=1; j<N; j++ )); do
  OFF=$(python3 -c "print(round($j*$STEP, 3))")
  LBL="x$j"
  FC+="[$PREV][$j:v]xfade=transition=fade:duration=$XF:offset=$OFF[$LBL];"
  PREV="$LBL"
done
FC="${FC%;}"
if [ ! -f "$WORK/montage.mp4" ]; then
  ffmpeg -y -v error "${INPUTS[@]}" -filter_complex "$FC" -map "[$PREV]" \
    -c:v libx264 -preset veryfast -crf 14 -r $FPS -an "$WORK/montage.mp4"
fi

# --- Paso 4: loudnorm en dos pasadas (medicion + correccion) -----------------
echo ">> Paso 4: midiendo loudness..."
MEAS=$(ffmpeg -hide_banner -nostats -i "$SRC/wavecont-inspiring-and-uplifting-corporate-206315.mp3" \
  -af "atrim=0:$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
  | sed -n '/^{/,/^}/p')
read -r M_I M_TP M_LRA M_THRESH M_OFF < <(python3 -c "
import json
d=json.loads('''$MEAS''')
print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])
")
echo "   medido: I=$M_I LUFS, TP=$M_TP dBTP, LRA=$M_LRA"

AF="atrim=0:$TOTAL,asetpts=PTS-STARTPTS,\
loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$M_I:measured_TP=$M_TP:\
measured_LRA=$M_LRA:measured_thresh=$M_THRESH:offset=$M_OFF:linear=true,\
volume=0.38,afade=t=in:st=0:d=1.5,afade=t=out:st=$AFADE_OUT:d=2.5,\
aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo"

# --- Paso 5: ensamblaje y exportacion final ---------------------------------
# El montaje cierra fundiendo a negro en sus ultimos 0.5s, de modo que la
# entrada a la tarjeta (#0A0A0A) no sea un corte duro; sobre esa base el
# conjunto logo + texto aparece con su fade-in de 0.6s.
echo ">> Paso 5: ensamblando y exportando..."
ffmpeg -y -v error \
  -i "$WORK/montage.mp4" \
  -loop 1 -framerate $FPS -t $CARD -i "$OUT/card_close_v2.png" \
  -i "$SRC/wavecont-inspiring-and-uplifting-corporate-206315.mp3" \
  -filter_complex "\
[0:v]format=yuv420p,setsar=1,\
fade=t=out:st=$(python3 -c "print(round($MONTAGE_DUR-$TAIL,3))"):d=$TAIL[mid];\
[1:v]format=yuv420p,setsar=1,fade=t=in:st=0:d=0.6[close];\
[mid][close]concat=n=2:v=1:a=0,format=yuv420p[vout];\
[2:a]$AF[aout]" \
  -map "[vout]" -map "[aout]" -t "$TOTAL" \
  -c:v libx264 -preset slow -profile:v high -level 4.2 \
  -b:v 10M -maxrate 14M -bufsize 20M -pix_fmt yuv420p -r $FPS \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  "$OUT/UDS_Cierre_Semestre_2026_v2.mp4"

echo ">> listo: $OUT/UDS_Cierre_Semestre_2026_v2.mp4"
