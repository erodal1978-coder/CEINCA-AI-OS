#!/usr/bin/env node
// carrusel.mjs — carrusel de slides de VIDEO para Instagram (1080×1350, 4:5): un MP4 por slide + portadas + hoja de vista previa.
// Cada slide es un efecto con <meta name="fx-formatos"> que incluya "carrusel" (hoy: slide-interfaz, slide-cinetica).
// Uso: node scripts/carrusel.mjs carrusel.json -o <carpeta> [--motor respaldo] [--solo 3]
//   carrusel.json: { "tema": "ceinca-social", "duracion": 5, "slides": [ { "efecto": "slide-cinetica", "lineas": [...] }, ... ] }
//   El contador NN/TT se pone solo (desactívalo por slide con "contador": false). Los slides salen sin audio: la música se elige en Instagram.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { render } from './render.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const file = argv.find((a) => a.endsWith('.json'));
const outDir = opt('-o');
if (!file || !outDir) { console.error('uso: carrusel.mjs carrusel.json -o <carpeta> [--motor respaldo] [--solo N]'); process.exit(1); }
const car = JSON.parse(fs.readFileSync(file, 'utf8'));
const slides = car.slides || [];
if (!slides.length || slides.length > 20) { console.error(`✗ un carrusel lleva de 1 a 20 slides (hay ${slides.length})`); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(path.resolve(outDir), '.params-'));
const solo = opt('--solo') ? Number(opt('--solo')) : null;
const total = slides.length;

const salidas = [];
for (const [i, s] of slides.entries()) {
  const n = i + 1, nn = String(n).padStart(2, '0');
  const mp4 = path.resolve(outDir, `slide_${nn}.mp4`);
  salidas.push(mp4);
  if (solo && solo !== n) continue;
  const p = { tema: car.tema, duracion: car.duracion ?? 5, ...s, formato: 'carrusel' };
  if (p.contador === undefined) p.contador = { n, total };
  if (n === total && s.boton === undefined) p.boton = ''; // el último slide no invita a deslizar
  if (p.contador === false) delete p.contador;
  if ((p.duracion ?? 5) > 60) { console.error(`✗ slide ${nn}: Instagram corta los videos de carrusel a 60 s`); process.exit(1); }
  const pj = path.join(tmp, `slide_${nn}.json`);
  fs.writeFileSync(pj, JSON.stringify(p));
  console.error(`▶ slide ${nn}/${String(total).padStart(2, '0')} ${p.efecto}`);
  await render(pj, { salida: mp4, motor: opt('--motor') });
  // portada = frame 0 (Instagram la muestra antes de reproducir): también sirve como imagen fija si el slide se publica sin video
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', '-q:v', '2', path.resolve(outDir, `portada_${nn}.jpg`)]);
}
fs.rmSync(tmp, { recursive: true, force: true });

// hoja de vista previa: frame 0 y último frame de cada slide, en fila
const listos = salidas.filter((f) => fs.existsSync(f));
const args = ['-y', '-loglevel', 'error'];
listos.forEach((f) => args.push('-i', f));
const fc = listos.map((_, k) => `[${k}:v]trim=start_frame=0,select='eq(n\\,0)',scale=270:-1,setpts=PTS-STARTPTS[a${k}];[${k}:v]reverse,select='eq(n\\,0)',scale=270:-1,setpts=PTS-STARTPTS[b${k}];[a${k}][b${k}]vstack[c${k}]`).join(';')
  + `;${listos.map((_, k) => `[c${k}]`).join('')}hstack=inputs=${listos.length}[v]`;
if (listos.length > 1) spawnSync('ffmpeg', [...args, '-filter_complex', fc, '-map', '[v]', '-frames:v', '1', path.resolve(outDir, 'vista_previa.jpg')]);
console.log(`✓ ${listos.length} slides 1080×1350 → ${path.resolve(outDir)} (slide_NN.mp4 + portada_NN.jpg${listos.length > 1 ? ' + vista_previa.jpg' : ''})`);
