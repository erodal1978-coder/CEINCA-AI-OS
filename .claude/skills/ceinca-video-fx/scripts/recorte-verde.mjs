#!/usr/bin/env node
// recorte-verde.mjs — saca un fotograma de un video con fondo verde y lo guarda como PNG con alfa (sujeto recortado).
// Solo FFmpeg (sin rembg/torch). Sirve de `sujeto` para rompe-marco y corta-pega.
// Uso: node scripts/recorte-verde.mjs <video.mp4> [--t 2.0] [-o recorte.png] [--umbral 18] [--rango 40]
//   alfa = 1 - (verde - max(rojo, azul) - umbral) / rango  → 0 en el fondo, 1 en el sujeto; y se quita el derrame verde de los bordes.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const src = argv.find((a) => /\.(mp4|mov|webm|png|jpe?g)$/i.test(a));
if (!src || !fs.existsSync(src)) { console.error('uso: recorte-verde.mjs <video.mp4> [--t 2.0] [-o recorte.png]'); process.exit(1); }
const out = path.resolve(opt('-o', 'recorte.png'));
const u = Number(opt('--umbral', 18)), r = Number(opt('--rango', 40));
const vf = `format=rgba,geq=r='r(X,Y)':g='min(g(X,Y),max(r(X,Y),b(X,Y))+8)':b='b(X,Y)':a='255*clip(1-(g(X,Y)-max(r(X,Y),b(X,Y))-${u})/${r},0,1)',gblur=sigma=1`;
fs.mkdirSync(path.dirname(out), { recursive: true });
const p = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(opt('--t', 2)), '-i', src, '-frames:v', '1', '-vf', vf, out], { stdio: 'inherit' });
if (p.status !== 0) { console.error('✗ ffmpeg falló'); process.exit(1); }
console.log(`✓ recorte → ${out}`);
