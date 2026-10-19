#!/usr/bin/env node
// make-assets: genera los assets de prueba de examples/ (propios, procedurales, sin copyright).
// SVG/PNG pequeños se versionan; los clips mp4 se generan en examples/assets/clips/ (ignorados por git y por el zip).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findChrome } from './render.mjs';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = path.join(SKILL, 'examples/assets');
fs.mkdirSync(path.join(A, 'clips'), { recursive: true });
const w = (n, s) => fs.writeFileSync(path.join(A, n), s);
const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };

// Paleta NEUTRA de demostración (no es la marca: las plantillas no dependen de ella).
const skyline = (seed, base, hues) => {
  const r = rng(seed); let out = '';
  hues.forEach((h, layer) => {
    let x = -20; const y0 = 1500 - layer * 140;
    while (x < 1100) { const bw = 60 + r() * 110, bh = 160 + r() * 520 + layer * 40;
      out += `<rect x="${x.toFixed(0)}" y="${(y0 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${(bh + 700).toFixed(0)}" fill="${h}"/>`;
      for (let wy = y0 - bh + 30; wy < y0 - 20; wy += 46) for (let wx = x + 14; wx < x + bw - 24; wx += 30) if (r() > 0.55) out += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="14" height="22" fill="#ffe9a8" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
      x += bw + 6 + r() * 14; }
  });
  return out;
};
w('fondo-ciudad.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16213e"/><stop offset=".55" stop-color="#7a5c8e"/><stop offset="1" stop-color="#f2a65a"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#s)"/><circle cx="780" cy="720" r="150" fill="#ffd9a0" opacity=".85"/>${skyline(7, 0, ['#4a4468', '#352f52', '#221f3a', '#14122a'])}<rect y="1500" width="1080" height="420" fill="#0d0b1e"/></svg>`);

const screenRows = (() => { const r = rng(21); let s = ''; let y = 150;
  s += `<rect x="30" y="40" width="480" height="70" rx="20" fill="#e9edf5"/><circle cx="75" cy="75" r="22" fill="#9db0d6"/><rect x="110" y="62" width="200" height="16" rx="8" fill="#b8c4de"/><rect x="110" y="86" width="120" height="12" rx="6" fill="#cfd8ea"/>`;
  for (let i = 0; i < 11; i++) { const h = 150 + Math.floor(r() * 90);
    s += `<rect x="30" y="${y}" width="480" height="${h}" rx="26" fill="#ffffff"/><rect x="54" y="${y + 26}" width="${200 + Math.floor(r() * 200)}" height="22" rx="11" fill="#2b3a67"/><rect x="54" y="${y + 66}" width="400" height="14" rx="7" fill="#c9d1e6"/><rect x="54" y="${y + 92}" width="${260 + Math.floor(r() * 120)}" height="14" rx="7" fill="#dbe1f0"/><rect x="${54}" y="${y + h - 52}" width="130" height="30" rx="15" fill="${i % 3 === 0 ? '#3d6fe0' : '#e1e7f5'}"/>`;
    y += h + 22; }
  return { s, h: y + 40 }; })();
w('pantalla-app.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="${screenRows.h}" viewBox="0 0 540 ${screenRows.h}"><rect width="540" height="${screenRows.h}" fill="#f3f5fa"/>${screenRows.s}</svg>`);

const orb = (c1, c2, shape) => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/>${shape}</svg>`;
const shapes = [
  [`#5b8def`, `#1c3f94`, '<circle cx="200" cy="170" r="70" fill="#fff" opacity=".9"/><path d="M60 400c10-110 70-150 140-150s130 40 140 150z" fill="#fff" opacity=".9"/>'],
  [`#f08a5d`, `#b83b5e`, '<rect x="110" y="90" width="180" height="230" rx="18" fill="#fff" opacity=".92"/><rect x="140" y="130" width="120" height="14" rx="7" fill="#b83b5e"/><rect x="140" y="165" width="120" height="14" rx="7" fill="#e6b4c0"/><rect x="140" y="200" width="80" height="14" rx="7" fill="#e6b4c0"/>'],
  [`#6a994e`, `#2f5233`, '<path d="M80 300V150l120-70 120 70v150z" fill="#fff" opacity=".92"/><rect x="170" y="210" width="60" height="90" fill="#2f5233"/>'],
  [`#9b5de5`, `#4a1f8c`, '<circle cx="200" cy="200" r="100" fill="none" stroke="#fff" stroke-width="22" opacity=".92"/><path d="M150 205l35 35 70-80" fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>'],
  [`#f4c430`, `#c77d00`, '<circle cx="200" cy="200" r="105" fill="#fff" opacity=".92"/><path d="M200 130v140M165 165c10-18 70-22 70 10 0 36-70 16-70 52 0 30 62 30 72 6" fill="none" stroke="#c77d00" stroke-width="16" stroke-linecap="round"/>'],
  [`#2ec4b6`, `#0b6e6a`, '<rect x="90" y="250" width="40" height="70" fill="#fff" opacity=".92"/><rect x="150" y="200" width="40" height="120" fill="#fff" opacity=".92"/><rect x="210" y="150" width="40" height="170" fill="#fff" opacity=".92"/><rect x="270" y="100" width="40" height="220" fill="#fff" opacity=".92"/>'],
];
shapes.forEach(([a, b, s], i) => w(`icono-${i + 1}.svg`, orb(a, b, s)));
w('logo-demo.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a86ff"/><stop offset="1" stop-color="#8338ec"/></linearGradient></defs><rect width="500" height="500" fill="url(#g)"/><circle cx="250" cy="250" r="120" fill="none" stroke="#fff" stroke-width="34"/><circle cx="250" cy="250" r="44" fill="#fff"/></svg>`);
w('foto-fondo.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#355c7d"/><stop offset=".5" stop-color="#6c5b7b"/><stop offset="1" stop-color="#c06c84"/></linearGradient><radialGradient id="b" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#ffd5c2" stop-opacity=".9"/><stop offset="1" stop-color="#ffd5c2" stop-opacity="0"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#a)"/><rect width="1080" height="1920" fill="url(#b)"/><g opacity=".22" fill="#fff"><circle cx="880" cy="1500" r="360"/><circle cx="160" cy="1700" r="260"/><circle cx="700" cy="400" r="200"/></g></svg>`);
// Documento genérico sobre el que se garabatea (sin texto de marca).
w('base-garabato.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="960" viewBox="0 0 960 960"><rect width="960" height="960" fill="#f6f1e7"/><rect x="60" y="70" width="520" height="40" rx="10" fill="#33415c"/>${[170, 230, 290, 350, 410, 470, 530, 590].map((y, i) => `<rect x="60" y="${y}" width="${i % 3 === 2 ? 520 : 840}" height="22" rx="11" fill="#b9b3a3"/>`).join('')}<rect x="60" y="680" width="360" height="40" rx="10" fill="#33415c"/><rect x="60" y="760" width="840" height="22" rx="11" fill="#b9b3a3"/><rect x="60" y="820" width="700" height="22" rx="11" fill="#b9b3a3"/><circle cx="780" cy="260" r="80" fill="none" stroke="#33415c" stroke-width="10" opacity=".35"/></svg>`);

// PNG con alfa real (figura sobre transparente) renderizado con Chromium.
const exe = findChrome();
if (exe) {
  const pw = await import(pathToFileURL(path.join(SKILL, 'node_modules/playwright-core/index.mjs')).href);
  const b = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 700, height: 900 } });
  await pg.setContent(`<body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900"><defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset="1" stop-color="#ef476f"/></linearGradient></defs><circle cx="350" cy="260" r="170" fill="url(#t)"/><path d="M40 900c10-250 140-360 310-360s300 110 310 360z" fill="url(#t)"/><circle cx="350" cy="260" r="170" fill="none" stroke="#fff" stroke-width="14"/></svg></body>`);
  await pg.screenshot({ path: path.join(A, 'frente-figura.png'), omitBackground: true });
  await b.close();
} else console.error('⚠ sin Chromium: no se generó frente-figura.png');

// Clips de prueba (lavfi), 360×640, 30 fps, 5 s, sin audio.
const src = ['testsrc2=s=360x640:r=30:d=5', 'mandelbrot=s=360x640:r=30', 'gradients=s=360x640:r=30:d=5:speed=0.03', 'life=s=360x640:r=30:mold=10:ratio=0.1:death_color=#202040:life_color=#40e0d0', 'cellauto=s=360x640:r=30:rule=110:full=1', 'rgbtestsrc=s=360x640:r=30:d=5'];
src.forEach((s, i) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', s, '-t', '5', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '15', '-crf', '28', '-r', '30', path.join(A, 'clips', `clip-${i + 1}.mp4`)]);
  if (r.status !== 0) { console.error(`✗ clip ${i + 1}: ${r.stderr}`); process.exit(1); }
});
console.log('✓ assets de prueba en examples/assets/');
