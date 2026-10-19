#!/usr/bin/env bash
# check.sh — validaciones de la skill.
#   check.sh [estatico]                         → marca desacoplada, sin URLs externas, estructura de efectos
#   check.sh video <mp4> [duracion=4] [png-mitad] → ffprobe (1080×1920, 30 fps, H.264, yuv420p, frames ±1) + PNG del frame central
set -uo pipefail
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
fail=0
bad() { echo "✗ $*" >&2; fail=1; }
ok()  { echo "✓ $*"; }

estatico() {
  local dirs=("$SKILL/effects" "$SKILL/shared")
  # 1) colores literales (hex, rgb/hsl numéricos, nombres CSS) — solo se permiten variables --fx-*
  local hits
  hits=$(grep -rnE --include='*.html' --include='*.css' --include='*.js' --include='*.mjs' \
      -e '(^|[^&A-Za-z0-9_\-])#[0-9a-fA-F]{3,8}\b' -e 'rgba?\(\s*[0-9]' -e 'hsla?\(\s*[0-9]' \
      -e ':\s*(white|black|red|blue|green|gray|grey|yellow|orange|purple|pink|gold|navy|silver)\b' "${dirs[@]}" \
      | grep -vE "getElementById|querySelector|tl\.(to|from|fromTo|set)\(\s*['\"]#|\bgsap\.set\(\s*['\"]#|\bid=\"|\burl\(#|\.mjs:.*//" \
      | grep -vE '^\S+:[0-9]+:\s*(//|\*|/\*)' ) || true
  [ -n "$hits" ] && { bad "colores literales en effects/ o shared/ (usa solo --fx-*):"; echo "$hits" >&2; } || ok "sin colores hex/rgb/hsl/nombre literales"
  # 2) familias tipográficas: toda declaración font-family debe ser var(--fx-font-*)
  hits=$(grep -rnoE --include='*.html' --include='*.css' 'font-family\s*:[^;}]*' "${dirs[@]}" | grep -vE 'font-family\s*:\s*var\(--fx-font-(display|body)\)\s*$') || true
  [ -n "$hits" ] && { bad "font-family literal (usa var(--fx-font-*)):"; echo "$hits" >&2; } || ok "sin familias tipográficas literales"
  # 3) nombres de familias vendorizadas (leídos del lock) no pueden aparecer escritos a mano
  if [ -f "$SKILL/themes/brand.lock.json" ]; then
    local fams; fams=$(node -e "const l=JSON.parse(require('fs').readFileSync('$SKILL/themes/brand.lock.json','utf8'));console.log(Object.keys(l.familias).join('\n'))")
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      hits=$(grep -rniF --include='*.html' --include='*.css' --include='*.js' "$f" "${dirs[@]}") || true
      [ -n "$hits" ] && { bad "la familia '$f' aparece escrita en effects/ o shared/:"; echo "$hits" >&2; }
    done <<< "$fams"
    ok "familias del lock no aparecen literales"
  else bad "falta themes/brand.lock.json"; fi
  # 4) nada de URLs externas en HTML/CSS/JS propios
  hits=$(grep -rnE --include='*.html' --include='*.css' --include='*.js' -e 'https?://' -e 'src="//' -e "url\\(['\"]?//" "${dirs[@]}" "$SKILL/themes"/*.css | grep -vE 'www\.w3\.org') || true
  [ -n "$hits" ] && { bad "URLs externas:"; echo "$hits" >&2; } || ok "sin URLs externas (efectos, shared, themes)"
  # 5) determinismo: nada de Math.random ni reloj real
  hits=$(grep -rnE --include='*.html' --include='*.js' 'Math\.random|Date\.now|new Date\(|performance\.now|setTimeout|setInterval' "${dirs[@]}") || true
  [ -n "$hits" ] && { bad "no determinista:"; echo "$hits" >&2; } || ok "sin Math.random / reloj real"
  # 6) estructura de cada efecto
  for d in "$SKILL"/effects/*/; do
    n=$(basename "$d")
    [ -f "$d/index.html" ] || bad "$n: falta index.html"
    [ -f "$d/params.example.json" ] || bad "$n: falta params.example.json"
    grep -q "window.__timelines\['root'\]" "$d/index.html" || bad "$n: no registra window.__timelines['root'] inline"
    grep -q 'data-composition-id="root"' "$d/index.html" || bad "$n: falta data-composition-id"
  done
  ok "estructura de $(ls -d "$SKILL"/effects/*/ | wc -l) efectos"
  # 7) zip/skill no depende de red: los vendor existen
  [ -f "$SKILL/vendor/gsap/gsap.min.js" ] && [ -f "$SKILL/vendor/gsap/LICENSE.md" ] && ok "GSAP vendorizado con licencia" || bad "falta vendor/gsap"
  ls "$SKILL"/vendor/fonts/*.woff2 >/dev/null 2>&1 && ok "fuentes vendorizadas" || bad "faltan fuentes en vendor/fonts"
}

video() {
  local f="$1" dur="${2:-4}" png="${3:-}"
  [ -f "$f" ] || { bad "no existe $f"; return; }
  local info; info=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_read_frames,duration -of default=nw=1 "$f")
  local get; get() { echo "$info" | sed -n "s/^$1=//p"; }
  local want=$(( $(printf '%.0f' "$(echo "$dur*30" | bc -l)") )) frames; frames=$(get nb_read_frames)
  local errs=0
  [ "$(get width)x$(get height)" = "1080x1920" ] || { bad "$f: resolución $(get width)x$(get height) ≠ 1080x1920"; errs=1; }
  [ "$(get r_frame_rate)" = "30/1" ] || { bad "$f: fps $(get r_frame_rate) ≠ 30"; errs=1; }
  [ "$(get codec_name)" = "h264" ] || { bad "$f: códec $(get codec_name) ≠ h264"; errs=1; }
  [ "$(get pix_fmt)" = "yuv420p" ] || { bad "$f: pix_fmt $(get pix_fmt) ≠ yuv420p"; errs=1; }
  local diff=$(( frames > want ? frames - want : want - frames ))
  [ "$diff" -le 1 ] || { bad "$f: $frames frames, esperados $want ±1"; errs=1; }
  [ "$errs" = 0 ] && ok "$(basename "$f"): 1080x1920 30fps h264 yuv420p, $frames frames (esperados $want)"
  if [ -n "$png" ]; then
    mkdir -p "$(dirname "$png")"
    ffmpeg -y -loglevel error -ss "$(echo "$dur/2" | bc -l)" -i "$f" -frames:v 1 "$png" && ok "frame central → $png"
  fi
}

clip_check() {
  local json="${1:-}" mp4="${2:-}"
  [ -f "$json" ] || { bad "no existe $json"; return; }
  # Campos obligatorios y tipo mínimo
  local efecto clip
  efecto=$(node -e "const j=JSON.parse(require('fs').readFileSync('$json','utf8'));process.stdout.write(j.efecto||'')")
  clip=$(node   -e "const j=JSON.parse(require('fs').readFileSync('$json','utf8'));process.stdout.write(j.clip||'')")
  local validos="zoom-digital zoom-corte zoom-atras"
  [[ " $validos " == *" $efecto "* ]] || bad "$json: efecto='$efecto' no es uno de: $validos"
  [ -n "$clip" ] || bad "$json: falta el campo 'clip'"
  # Validaciones adicionales por tipo
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
  # Verificación de audio si se provee MP4
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
  clip)     shift; clip_check "$@" ;;
  *) echo "uso: check.sh [estatico] | video <mp4> [dur] [png] | clip <json> [mp4]"; exit 2 ;;
esac
exit $fail
