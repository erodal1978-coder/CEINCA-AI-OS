#!/usr/bin/env bash
# check.sh — validaciones de la skill (compatible 100% con Linux sin depender de bc).
#   check.sh [estatico]                                → marca desacoplada, sin URLs externas, estructura de efectos
#   check.sh matriz [overlay]                          → audita TODOS los efectos × TODOS los temas (zonas seguras + errores)
#   check.sh video <mp4> [duracion=4] [png-mitad]      → ffprobe (1080×1920 o 1920×1080, 30 fps, H.264, yuv420p, frames ±1) + PNG del frame central
#   check.sh clip <json> [mp4]                         → valida parámetros de clip.mjs y sincronía A/V ≤ 0.05s
#   check.sh reel <mp4> [reel-voz.json] [--lufs N]     → reel final: formato (1080×1920 o 1920×1080)/30 fps/H.264, A/V ≤ 0,1 s, loudness N±1,5 LUFS (default 16 → −16), sin silencios > 0,6 s;
#                                                         con el JSON: badges 1..N consecutivos y keyword exacta. Pico real > −1,0 dBTP solo avisa.
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
  # 2) familias tipográficas: toda declaración font-family debe ser var(--fx-font-display|body|mono)
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
  local validos="zoom-digital zoom-corte zoom-atras pantalla-verde lupa-zoom foco-spotlight fragmentos-shatter"
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

reel_check() {
  local mp4="" json="" obj=16
  while [ $# -gt 0 ]; do
    case "$1" in
      --lufs) obj="${2:?--lufs necesita un valor, p. ej. --lufs 14}"; shift 2 ;;
      *) if [ -z "$mp4" ]; then mp4="$1"; else json="$1"; fi; shift ;;
    esac
  done
  [ -f "$mp4" ] || { bad "no existe $mp4"; return; }
  local v a w h fps pix cod
  IFS=, read -r cod w h pix fps < <(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate -of csv=p=0 "$mp4")
  { { [ "$w" = 1080 ] && [ "$h" = 1920 ]; } || { [ "$w" = 1920 ] && [ "$h" = 1080 ]; }; } && [ "$fps" = 30/1 ] && [ "$cod" = h264 ] && [ "$pix" = yuv420p ] \
    && ok "formato $cod ${w}×${h} $fps $pix" || bad "formato: $cod ${w}x${h} $fps $pix (esperado h264 1080x1920 o 1920x1080, 30/1, yuv420p)"
  v=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$mp4"); a=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$mp4")
  awk -v v="$v" -v a="$a" 'BEGIN{d=v-a; if(d<0)d=-d; exit !(d<=0.1)}' && ok "A/V alineados (video ${v}s, audio ${a}s)" || bad "A/V desfasados: video ${v}s, audio ${a}s"
  local ebu lufs peak
  ebu=$(ffmpeg -hide_banner -nostats -i "$mp4" -af ebur128=peak=true -f null - 2>&1 | tail -n 14)
  lufs=$(echo "$ebu" | awk '/^ *I:/{print $2}' | tail -1); peak=$(echo "$ebu" | awk '/Peak:/{print $2}' | tail -1)
  awk -v l="${lufs:--99}" -v o="$obj" 'BEGIN{t=-o; exit !(l>=t-1.5 && l<=t+1.5)}' && ok "volumen ${lufs} LUFS (objetivo -${obj} ±1,5)" || bad "volumen fuera de −${obj}±1,5 LUFS: ${lufs:-?}"
  [ -n "$peak" ] && { awk -v p="$peak" 'BEGIN{exit !(p<=-1.0)}' && ok "pico real ${peak} dBFS (≤ −1,0)" || echo "⚠ pico real ${peak} dBFS > −1,0 (riesgo de recorte al recomprimir)"; }
  local sil; sil=$(ffmpeg -hide_banner -i "$mp4" -af silencedetect=n=-35dB:d=0.6 -f null - 2>&1 | grep -c silence_start)
  [ "$sil" = 0 ] && ok "sin silencios > 0,6 s" || bad "$sil silencio(s) > 0,6 s (recorta con escenas del mismo clip)"
  if [ -n "$json" ]; then
    node -e "
      const j=JSON.parse(require('fs').readFileSync('$json','utf8'));
      const b=j.escenas.map(e=>e.badge).filter(Boolean);
      const uniq=[...new Set(b)]; const okSeq=uniq.every((n,i)=>n===i+1);
      const ctb=j.escenas.filter(e=>(e.ctb||e.texto)&&/FIEBRU/.test((e.ctb||e.texto).palabra||'')).every(e=>/FIEBRU'O/.test((e.ctb||e.texto).palabra));
      console.log(okSeq?'✓ badges consecutivos 1..'+uniq.length+(j.total&&j.total!==uniq.length?' (OJO: total='+j.total+')':''):'✗ badges no consecutivos: '+uniq.join(','));
      console.log(ctb?'✓ keyword exacta con apóstrofe':'✗ keyword mal escrita (FIEBRU\'O)');
      process.exit(okSeq&&ctb&&(!j.total||j.total===uniq.length)?0:1)" || fail=1
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
