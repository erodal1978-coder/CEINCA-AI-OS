#!/usr/bin/env node
// overlay.mjs — superpone una capa gráfica o subtítulos sobre un video base.
// Uso: node scripts/overlay.mjs --base <video.mp4> --overlay <overlay.mp4|params.json> [-o <salida.mp4>]
// Opciones:
//   --key <color>       color a transparentar en el overlay (default: ninguno si tiene alfa; 0x122A63 si viene de un tema)
//   --tolerancia <num>  tolerancia de chroma/colorkey (default: 0.18)
//   --suavizado <num>   suavizado de bordes (default: 0.05)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }

const argv = process.argv.slice(2);
const getOpt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };

const baseRaw = getOpt('--base');
const overlayRaw = getOpt('--overlay');
const outRaw = getOpt('-o') || getOpt('--salida');

if (!baseRaw || !overlayRaw) {
  die('uso: node scripts/overlay.mjs --base <video.mp4> --overlay <overlay.mp4|params.json> [-o <salida.mp4>]');
}

const basePath = path.resolve(baseRaw);
if (!fs.existsSync(basePath)) die(`no existe video base: ${basePath}`);

const overlayPath = path.resolve(overlayRaw);
if (!fs.existsSync(overlayPath)) die(`no existe overlay: ${overlayPath}`);

const outPath = outRaw ? path.resolve(outRaw) : path.resolve('out', 'overlay-result.mp4');
fs.mkdirSync(path.dirname(outPath), { recursive: true });

let overlayVideo = overlayPath;
let tempVideo = null;

// Si el overlay es un archivo JSON, lo renderizamos primero con render.mjs
if (overlayPath.endsWith('.json')) {
  tempVideo = path.join(path.dirname(outPath), `_temp_overlay_${Date.now()}.mp4`);
  const r = spawnSync('node', [
    path.join(SKILL, 'scripts/render.mjs'),
    overlayPath,
    '-o', tempVideo
  ], { stdio: 'inherit' });
  if (r.status !== 0) die('falló el renderizado del overlay JSON');
  overlayVideo = tempVideo;
}

// Configurar filtro de chroma si se especificó --key
let keyColor = getOpt('--key');
const tolerancia = getOpt('--tolerancia') || '0.20';
const suavizado = getOpt('--suavizado') || '0.05';

if (keyColor && keyColor.startsWith('#')) keyColor = '0x' + keyColor.slice(1);

let overlayFilter = '[1:v]fps=30,scale=1080:1920:flags=lanczos,setsar=1';
if (keyColor) {
  overlayFilter += `,chromakey=color=${keyColor}:similarity=${tolerancia}:blend=${suavizado}`;
}
overlayFilter += '[ov]';

const fc = [
  '[0:v]fps=30,scale=1080:1920:flags=lanczos,setsar=1[base]',
  overlayFilter,
  '[base][ov]overlay=0:0[v]'
].join(';');

const args = [
  '-y', '-loglevel', 'error',
  '-i', basePath,
  '-i', overlayVideo,
  '-filter_complex', fc,
  '-map', '[v]',
  '-map', '0:a?',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
  '-c:a', 'aac', '-b:a', '128k',
  outPath
];

const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
if (tempVideo && fs.existsSync(tempVideo)) {
  try { fs.unlinkSync(tempVideo); } catch {}
}

if (r.status !== 0) die(`ffmpeg falló en overlay:\n${r.stderr.toString().trim()}`);

console.log(JSON.stringify({
  operacion: 'overlay',
  base: path.basename(basePath),
  overlay: path.basename(overlayPath),
  salida: outPath,
  key: keyColor || 'ninguno'
}, null, 2));
