#!/usr/bin/env node
// subtitulos-whisper.mjs — convierte los tiempos por palabra de Whisper en un params.json de `subtitulos-karaoke` con `paginas`
// (solo se ve la frase vigente; palabra actual resaltada). Úsalo como capa continua de un reel: reel-voz.json → "subtitulos".
// Uso: node scripts/subtitulos-whisper.mjs <palabras.json> -o <karaoke.json> [--max 5] [--excluir 21.0-26.5,...] [--reemplazos '{"cloud":"Claude"}']
//   palabras.json: [{ "w": "Hola", "t0": 0.12, "t1": 0.5 }, ...]  (tiempos globales del reel, p. ej. Whisper sobre el master sin subtítulos)
//   --max        palabras máximas por frase (default 5)
//   --excluir    rangos "desde-hasta" en s sin subtítulos (p. ej. donde el CTB ya muestra el texto)
//   --reemplazos corrige lo que Whisper oye mal (clave en minúsculas → texto)
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const src = argv.find((a) => a.endsWith('.json'));
if (!src) { console.error('uso: subtitulos-whisper.mjs <palabras.json> -o <karaoke.json> [--max 5] [--excluir a-b,c-d] [--reemplazos {...}]'); process.exit(1); }
const words = JSON.parse(fs.readFileSync(src, 'utf8'));
const max = Number(opt('--max', 5));
const excl = (opt('--excluir', '') || '').split(',').filter(Boolean).map((r) => r.split('-').map(Number));
const rep = JSON.parse(opt('--reemplazos', '{}'));
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const repN = Object.fromEntries(Object.entries(rep).map(([k, v]) => [fold(k), v]));
const clean = (w) => { const t = w.replace(/[¿¡.,;:!?"“”()]/g, ''); const r = repN[fold(t)]; return (r ?? t).toUpperCase(); };

const out = []; let cur = [];
const flush = () => {
  if (!cur.length) return;
  const desde = Math.max(0, cur[0].t0 - 0.05), hasta = cur[cur.length - 1].t1 + 0.12;
  if (!excl.some(([a, b]) => desde >= a && hasta <= b)) out.push({ desde: +desde.toFixed(2), hasta: +hasta.toFixed(2), palabras: cur.map((x) => ({ texto: clean(x.w), t: +x.t0.toFixed(2) })) });
  cur = [];
};
words.forEach((w, i) => {
  const gap = cur.length ? w.t0 - cur[cur.length - 1].t1 : 0;
  if (cur.length >= max || gap > 0.45) flush();
  cur.push(w);
  if (/[.,;:!?]$/.test(w.w) && cur.length >= 2) flush();
});
flush();
for (let i = 0; i + 1 < out.length; i++) out[i].hasta = Math.min(out[i].hasta, out[i + 1].desde); // sin solapes
const duracion = Math.ceil((words.at(-1)?.t1 ?? 0) + 0.5);
const o = path.resolve(opt('-o', 'karaoke.json'));
fs.writeFileSync(o, JSON.stringify({ efecto: 'subtitulos-karaoke', posicion: 'abajo', duracion, paginas: out }, null, 1));
console.log(`✓ ${out.length} frases → ${o}`);
