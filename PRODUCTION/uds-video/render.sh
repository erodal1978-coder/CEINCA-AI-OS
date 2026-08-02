#!/usr/bin/env bash
# UDS - Cierre de Semestre 2026
# Render completo: logo -> clips Ken Burns -> montaje con crossfades ->
# tarjetas + texto -> audio normalizado -> MP4 1080x1920.
#
#   ./render.sh [dir_trabajo]
#
# Requiere ffmpeg y python3 con pillow, numpy, scipy, fonttools y brotli.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
WORK="${1:-$HERE/.work}"
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

# --- Paso 3a: tarjetas y placas de texto ------------------------------------
python3 "$HERE/build_cards.py" "$FONTS" "$OUT" "$OUT/logo_emblem.png"

# --- parametros de tiempo ----------------------------------------------------
FPS=30
DUR=1.3           # duracion por foto
XF=0.4            # crossfade entre fotos
STEP=0.9          # DUR - XF: avance real por foto
CARD=3.5          # tarjetas de apertura y cierre
NF=39             # frames por clip = DUR * FPS
ZOOM=0.07         # Ken Burns 1.00x -> 1.07x

mapfile -t PHOTOS < <(ls "$SRC"/IMG-*.jpg | sort)
N=${#PHOTOS[@]}
MONTAGE_DUR=$(python3 -c "print(round($DUR + ($N-1)*$STEP, 3))")
TOTAL=$(python3 -c "print(round($CARD*2 + $MONTAGE_DUR, 3))")
echo ">> $N fotos | montaje ${MONTAGE_DUR}s | total ${TOTAL}s"

# --- Paso 2: un clip por foto -----------------------------------------------
# Correccion de color uniforme + encuadre 1080x1920 sobre fondo desenfocado de
# la propia foto (ver README: el crop duro a 9:16 decapitaba a los docentes en
# las fotos apaisadas) + Ken Burns con direccion alternada foto a foto.
echo ">> Paso 2: generando $N clips Ken Burns..."
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
ffmpeg -y -v error "${INPUTS[@]}" -filter_complex "$FC" -map "[$PREV]" \
  -c:v libx264 -preset veryfast -crf 14 -r $FPS -an "$WORK/montage.mp4"

# --- Paso 3: tarjetas + placas de texto sobre el montaje ---------------------
# Momentos (tiempo del video final, tarjeta de apertura incluida):
#   bloque 2 -> arranca en un corte de foto, 4s de permanencia
#   bloque 3 -> "Felices vacaciones." 3s, cerrando antes de la tarjeta final
B2_IN=$(python3 -c "print(round($CARD + 15*$STEP, 3))")
B3_IN=$(python3 -c "print(round($CARD + 36*$STEP, 3))")
CLOSE_IN=$(python3 -c "print(round($CARD + $MONTAGE_DUR, 3))")
AFADE_OUT=$(python3 -c "print(round($TOTAL - 2.5, 3))")
echo ">> Paso 3: texto bloque2 @${B2_IN}s (4s) | bloque3 @${B3_IN}s (3s) | cierre @${CLOSE_IN}s"

# --- Paso 4: loudnorm en dos pasadas (medicion + correccion) -----------------
echo ">> Paso 4: midiendo loudness..."
MEAS=$(ffmpeg -hide_banner -nostats -i "$SRC/wavecont-inspiring-and-uplifting-corporate-206315.mp3" \
  -af "atrim=0:$TOTAL,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
  | sed -n '/^{/,/^}/p')
read -r M_I M_TP M_LRA M_THRESH M_OFF < <(python3 -c "
import json,sys
d=json.loads('''$MEAS''')
print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])
")
echo "   medido: I=$M_I LUFS, TP=$M_TP dBTP, LRA=$M_LRA"

AF="atrim=0:$TOTAL,asetpts=PTS-STARTPTS,\
loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$M_I:measured_TP=$M_TP:\
measured_LRA=$M_LRA:measured_thresh=$M_THRESH:offset=$M_OFF:linear=true,\
volume=0.32,afade=t=in:st=0:d=1.5,afade=t=out:st=$AFADE_OUT:d=2.5,\
aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo"

# --- Paso 5: ensamblaje y exportacion final ---------------------------------
echo ">> Paso 5: ensamblando y exportando..."
ffmpeg -y -v error \
  -loop 1 -framerate $FPS -t $CARD -i "$OUT/card_open.png" \
  -i "$WORK/montage.mp4" \
  -loop 1 -framerate $FPS -t $CARD -i "$OUT/card_close.png" \
  -loop 1 -framerate $FPS -t 4 -i "$OUT/text_block2.png" \
  -loop 1 -framerate $FPS -t 3 -i "$OUT/text_block3.png" \
  -i "$SRC/wavecont-inspiring-and-uplifting-corporate-206315.mp3" \
  -filter_complex "\
[0:v]format=yuv420p,setsar=1,fade=t=in:st=0:d=0.5[open];\
[2:v]format=yuv420p,setsar=1,fade=t=out:st=$(python3 -c "print($CARD-0.6)"):d=0.6[close];\
[1:v]format=yuv420p,setsar=1[mid];\
[open][mid][close]concat=n=3:v=1:a=0[base];\
[3:v]format=rgba,fade=t=in:st=0:d=0.5:alpha=1,fade=t=out:st=3.5:d=0.5:alpha=1,\
setpts=PTS-STARTPTS+$B2_IN/TB[t2];\
[4:v]format=rgba,fade=t=in:st=0:d=0.5:alpha=1,fade=t=out:st=2.5:d=0.5:alpha=1,\
setpts=PTS-STARTPTS+$B3_IN/TB[t3];\
[base][t2]overlay=0:0:enable='between(t,$B2_IN,$(python3 -c "print(round($B2_IN+4,3))"))'[v2];\
[v2][t3]overlay=0:0:enable='between(t,$B3_IN,$(python3 -c "print(round($B3_IN+3,3))"))',\
format=yuv420p[vout];\
[5:a]$AF[aout]" \
  -map "[vout]" -map "[aout]" -t "$TOTAL" \
  -c:v libx264 -preset slow -profile:v high -level 4.2 \
  -b:v 10M -maxrate 14M -bufsize 20M -pix_fmt yuv420p -r $FPS \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
  "$OUT/UDS_Cierre_Semestre_2026.mp4"

echo ">> listo: $OUT/UDS_Cierre_Semestre_2026.mp4"
