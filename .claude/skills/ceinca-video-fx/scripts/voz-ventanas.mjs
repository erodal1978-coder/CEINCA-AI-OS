#!/usr/bin/env node
// voz-ventanas.mjs — ventanas reales de voz de un clip/reel por energía (RMS), no por Whisper.
// Whisper falla ±0,5-0,8 s en inicio/fin de frase (con la sala en silencio marca la voz antes de que empiece); la energía no.
// Uso: node scripts/voz-ventanas.mjs <video-o-audio> [--umbral -32] [--hueco 0.3]  → imprime "a-b,c-d" (s) y un JSON por stdout con --json
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const src = argv.find((a) => !a.startsWith('--') && !/^-?\d/.test(a));
if (!src) { console.error('uso: voz-ventanas.mjs <archivo> [--umbral -32] [--hueco 0.3] [--json]'); process.exit(1); }
const thr = Number(opt('--umbral', -32)), gap = Number(opt('--hueco', 0.3));
const r = spawnSync('ffmpeg', ['-hide_banner', '-i', src, '-vn', '-af', 'asetnsamples=n=2400,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
const v = [...r.stdout.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -99 : Number(m[1])));
const segs = []; let on = null;
v.forEach((x, i) => { const t = i * 0.05; if (x > thr && on === null) on = t; if (x <= thr && on !== null) { segs.push([on, t]); on = null; } });
if (on !== null) segs.push([on, v.length * 0.05]);
const merged = [];
for (const s of segs) { if (merged.length && s[0] - merged.at(-1)[1] < gap) merged.at(-1)[1] = s[1]; else merged.push([...s]); }
const out = merged.filter(([a, b]) => b - a > 0.15).map(([a, b]) => [+a.toFixed(2), +b.toFixed(2)]);
console.log(argv.includes('--json') ? JSON.stringify(out) : out.map(([a, b]) => `${a}-${b}`).join(','));
