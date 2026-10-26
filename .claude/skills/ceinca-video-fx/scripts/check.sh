#!/usr/bin/env bash
# check.sh — validaciones de la skill (compatible 100% con Linux sin depender de bc).
#   check.sh [estatico]                                → marca desacoplada, sin URLs externas, estructura de efectos
#   check.sh matriz [overlay]                          → audita TODOS los efectos × TODOS los temas (zonas seguras + errores)
#   check.sh video <mp4> [duracion=4] [png-mitad]      → ffprobe (1080×1920 o 1920×1080, 30 fps, H.264, yuv420p, frames ±1)
#   check.sh clip <json> [mp4]                         → valida parámetros de clip.mjs y sincronía A/V ≤ 0.05s
#   check.sh reel <mp4> [json-edicion]                 → valida formato final, sincronía A/V y loudness a -16 LUFS (±1.5 LU)
set -uo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
fail=0
bad() { echo "✗ $*" >&2; fail=1; }
ok()  { echo "✓ $*"; }

estatico() {
  local dirs=("$SKILL/effects" "$SKILL/shared")
  local hits
  hits=$(grep -rnE --include='*.html' --include='*.css' --include='*.js' --include='*.mjs' \
      -e '(^|[^&A-Za-z0-9_\-])#[0-9a-fA-F]{3,8}\b' -e 'rgba?\(\s*[0-9]' -e 'hsla?\(\s*[0-9]' \
      -e ':\s*(white|black|red|blue|green|gray|grey|yellow|orange|purple|pink|gold|navy|silver)\b' "${dirs[@]}" \
      | grep -vE "getElementById|querySelector|tl\.(to|from|fromTo|set)\(\s*['\"]#|\bgsap\.set\(\s*['\"]#|\bid=\"|\burl\(#|\.mjs:.*//" \
      | grep -vE '^\S+:[0-9]+:\s*(//|\*|/\*)' ) || true
  [ -n "$hits" ] && { bad "colores literales en effects/ o shared/ (usa solo --fx-*):"; echo "$hits" >&2; } || ok "sin colores hex/rgb/hsl/nombre literales"

  hits=$(grep -rnoE --include='*.html' --include='*.css' 'font-family\s*:[^;}]*' "${dirs[@]}" | grep -vE 'font-family\s*:\s*var\(--fx-font-(display|body|mono)\)\s*$') || true
  [ -n "$hits" ] && { bad "font-family literal (usa var(--fx-font-*)):"; echo "$hits" >&2; } || ok "sin familias tipográficas literales"

  if [ -f "$SKILL/themes/brand.lock.json" ]; then
    local fams; fams=$(node -e "const l=JSON.parse(require('fs').readFileSync('$SKILL/themes/brand.lock.json','utf8'));console.log(Object.keys(l.familias).join('\n'))")
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      hits=$(grep -rniF --include='*.html' --include='*.css' --include='*.js' "$f" "${dirs[@]}") || true
      [ -n "$hits" ] && { bad "la familia '$f' aparece escrita en effects/ o shared/:"; echo "$hits" >&2; }
    done <<< "$fams"
    ok "familias del lock no aparecen literales"
  else bad "falta themes/brand.lock.json"; fi

  hits=$(grep -rnE --include='*.html' --include='*.css' --include='*.js' -e 'https?://' -e 'src="//' -e "url\\(['\"]?//" "${dirs[@]}" "$SKILL/themes"/*.css | grep -vE 'www\.w3\.org') || true
  [ -n "$hits" ] && { bad "URLs externas:"; echo "$hits" >&2; } || ok "sin URLs externas (efectos, shared, themes)"

  hits=$(grep -rnE --include='*.html' --include='*.js' 'Math\.random|Date\.now|new Date\(|performance\.now|setTimeout|setInterval' "${dirs[@]}") || true
  [ -n "$hits" ] && { bad "no determinista:"; echo "$hits" >&2; } || ok "sin Math.random / reloj real"

  for d in "$SKILL"/effects/*/; do
    n=$(basename "$d")
    [ -f "$d/index.html" ] || bad "$n: falta index.html"
    [ -f "$d/params.example.json" ] || bad "$n: falta params.example.json"
    grep -q "window.__timelines\['root'\]" "$d/index.html" || bad "$n: no registra window.__timelines['root'] inline"
    grep -q 'data-composition-id="root"' "$d/index.html" || bad "$n: falta data-composition-id"
  done
  ok "estructura de $(ls -d "$SKILL"/effects/*/ | wc -l) efectos"

  [ -f "$SKILL/vendor/gsap/gsap.min.js" ] && [ -f "$SKILL/vendor/gsap/LICENSE.md" ] && ok "GSAP vendorizado con licencia" || bad "falta vendor/gsap"
  ls "$SKILL"/vendor/fonts/*.woff2 >/dev/null 2>&1 && ok "fuentes vendorizadas" || bad "faltan fuentes en vendor/fonts"
  local dlen; dlen=$(node -e "
    const s=require('fs').readFileSync('$SKILL/SKILL.md','utf8');
    const fm=s.split('---')[1]||'';
    const m=fm.match(/description:\s*>?\s*([\s\S]*)$/);
    const txt=(m?m[1]:'').split('\n').map(l=>l.trim()).filter(Boolean).join(' ');
    process.stdout.write(String(txt.length));
  ")
  [ "$dlen" -le 1024 ] && ok "SKILL.md description <= 1024 caracteres (${dlen} chars)" || bad "SKILL.md description excede 1024 caracteres (${dlen} chars)"
}

video() {
  local f="$1" dur="${2:-4}" png="${3:-}"
  [ -f "$f" ] || { bad "no existe $f"; return; }
  local info; info=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_read_frames,duration -of default=nw=1 "$f")
  local get; get() { echo "$info" | sed -n "s/^$1=//p"; }
  local want; want=$(node -e "process.stdout.write(String(Math.round(${dur}*30)))")
  local frames; frames=$(get nb_read_frames)
  local res="$(get width)x$(get height)"
  local errs=0
  [[ "$res" = "1080x1920" || "$res" = "1920x1080" ]] || { bad "$f: resolución $res ≠ 1080x1920 ni 1920x1080"; errs=1; }
  [ "$(get r_frame_rate)" = "30/1" ] || { bad "$f: fps $(get r_frame_rate) ≠ 30"; errs=1; }
  [ "$(get codec_name)" = "h264" ] || { bad "$f: códec $(get codec_name) ≠ h264"; errs=1; }
  [ "$(get pix_fmt)" = "yuv420p" ] || { bad "$f: pix_fmt $(get pix_fmt) ≠ yuv420p"; errs=1; }
  local diff=$(( frames > want ? frames - want : want - frames ))
  [ "$diff" -le 1 ] || { bad "$f: $frames frames, esperados $want ±1"; errs=1; }
  [ "$errs" = 0 ] && ok "$(basename "$f"): $res 30fps h264 yuv420p, $frames frames (esperados $want)"
  if [ -n "$png" ]; then
    mkdir -p "$(dirname "$png")"
    local mid; mid=$(node -e "process.stdout.write(String((${dur}/2).toFixed(2)))")
    ffmpeg -y -loglevel error -ss "$mid" -i "$f" -frames:v 1 "$png" && ok "frame central → $png"
  fi
}

reel_check() {
  local f="$1"
  [ -f "$f" ] || { bad "no existe $f"; return; }
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" | head -1)
  video "$f" "$dur"
  local ebu; ebu=$(ffmpeg -nostats -i "$f" -filter_complex ebur128=peak=true -f null - 2>&1 | tail -n 18)
  local lufs; lufs=$(echo "$ebu" | awk '/I:/{print $2}' | tail -1)
  local peak; peak=$(echo "$ebu" | awk '/Peak:/{print $2}' | tail -1)
  if [ -n "$lufs" ]; then
    local ok_lufs; ok_lufs=$(node -e "const v=parseFloat('$lufs');process.stdout.write((v>=-17.6 && v<=-14.4)?'1':'0')")
    [ "$ok_lufs" = "1" ] && ok "$(basename "$f"): loudness integrada ${lufs} LUFS (objetivo -16 LUFS ±1.5) · pico ${peak} dBFS" \
                         || bad "$(basename "$f"): loudness ${lufs} LUFS fuera de rango (-16 ±1.5 LUFS)"
  else
    bad "$(basename "$f"): no se pudo medir loudness ebur128"
  fi
}

matriz() {
  local themes n=0 nbad=0 e f t out extra=""
  [ "${1:-}" = "overlay" ] && extra="--con-overlay"
  themes=$(ls "$SKILL"/themes/*.css | xargs -n1 basename | sed 's/\.css$//')
  for d in "$SKILL"/effects/*/; do
    e=$(basename "$d"); f="$SKILL/examples/$e.json"; [ -f "$f" ] || f="$d/params.example.json"
    for t in $themes; do
      if out=$(node "$SKILL/scripts/render.mjs" "$f" --tema "$t" --solo-auditoria $extra 2>&1); then n=$((n+1)); else nbad=$((nbad+1)); bad "$e × $t: $(echo "$out" | tr '\n' ' ' | cut -c1-300)"; fi
    done
  done
  [ "$nbad" = 0 ] && ok "matriz efecto × tema${extra:+ (con overlay)}: $n combinaciones sin desbordes ni errores de página"
}

clip_check() {
  local json="${1:-}" mp4="${2:-}"
  [ -f "$json" ] || { bad "no existe $json"; return; }
  local efecto clip
  efecto=$(node -e "const j=JSON.parse(require('fs').readFileSync('$json','utf8'));process.stdout.write(j.efecto||'')")
  clip=$(node   -e "const j=JSON.parse(require('fs').readFileSync('$json','utf8'));process.stdout.write(j.clip||'')")
  local validos="zoom-digital zoom-corte zoom-atras pantalla-verde"
  [[ " $validos " == *" $efecto "* ]] || bad "$json: efecto='$efecto' no es uno de: $validos"
  [ -n "$clip" ] || bad "$json: falta el campo 'clip'"
  if [ "$efecto" = "zoom-corte" ]; then
    node -e "
      const j=JSON.parse(require('fs').readFileSync('$json','utf8'));
      if (!Array.isArray(j.cortes)||j.cortes.length===0) { process.stderr.write('cortes[] falta o está vacío\n'); process.exit(1); }
      for(let i=0;i<j.cortes.length;i++){
        const c=j.cortes[i];
        if(typeof c.t!=='number')  { process.stderr.write('cortes['+i+'].t no es número\n'); process.exit(1); }
        if(typeof c.escala!=='number'||c.escala<1) { process.stderr.write('cortes['+i+'].escala debe ser ≥ 1\n'); process.exit(1); }
        if(i>0&&c.t<=j.cortes[i-1].t) { process.stderr.write('cortes[] no está en orden ascendente en ['+i+']\n'); process.exit(1); }
      }
    " 2>&1 | while IFS= read -r l; do bad "$json: $l"; done
  fi
  ok "$(basename "$json"): estructura válida (efecto=$efecto)"
  if [ -n "$mp4" ] && [ -f "$mp4" ]; then
    local dur_v dur_a
    dur_v=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$mp4" | head -1)
    dur_a=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$mp4" | head -1)
    if [ -z "$dur_a" ] || [ "$dur_a" = "N/A" ]; then
      ok "$(basename "$mp4"): sin audio (ok si audio=false)"
    else
      local diff ok_tol
      diff=$(node -e "process.stdout.write(Math.abs(${dur_v}-${dur_a}).toFixed(4))")
      ok_tol=$(node -e "process.stdout.write(${diff}<=0.05?'1':'0')")
      [ "$ok_tol" = "1" ] && ok "$(basename "$mp4"): audio=${dur_a}s video=${dur_v}s (diff=${diff}s ≤ 0.05s)" \
                           || bad "$(basename "$mp4"): audio=${dur_a}s vs video=${dur_v}s (diff=${diff}s > 0.05s)"
    fi
  fi
}

case "${1:-estatico}" in
  estatico) estatico ;;
  video)    shift; video "$@" ;;
  reel)     shift; reel_check "$@" ;;
  clip)     shift; clip_check "$@" ;;
  matriz)   shift; matriz "$@" ;;
  *) echo "uso: check.sh [estatico] | matriz [overlay] | video <mp4> [dur] [png] | reel <mp4> | clip <json> [mp4]"; exit 2 ;;
esac
exit $fail
