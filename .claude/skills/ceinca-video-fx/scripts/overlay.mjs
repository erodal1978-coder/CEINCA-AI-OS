#!/usr/bin/env node
// overlay.mjs — superpone una capa gráfica o subtítulos sobre un video base (vertical 1080×1920 o horizontal 1920×1080).
// Uso: node scripts/overlay.mjs --base <video.mp4> --overlay <overlay.mp4|params.json> [-o <salida.mp4>] [--formato vertical|horizontal]
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
const fmtOpt = getOpt('--formato');
const layoutOpt = getOpt('--layout');
const temaOpt = getOpt('--tema') || 'marca-soyeduardo-ia';

if (!baseRaw || !overlayRaw) {
  die('uso: node scripts/overlay.mjs --base <video.mp4> --overlay <overlay.mp4|params.json> [-o <salida.mp4>] [--formato vertical|horizontal] [--layout split-pip] [--tema <tema>]');
}

const basePath = path.resolve(baseRaw);
if (!fs.existsSync(basePath)) die(`no existe video base: ${basePath}`);

const overlayPath = path.resolve(overlayRaw);
if (!fs.existsSync(overlayPath)) die(`no existe overlay: ${overlayPath}`);

// Detectar dimensiones del video base si no se pasó --formato
const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', basePath], { encoding: 'utf8' });
const st = JSON.parse(pr.stdout || '{}').streams?.[0] || { width: 1080, height: 1920 };
const isHoriz = fmtOpt ? (fmtOpt === 'horizontal' || fmtOpt === '16:9') : (st.width > st.height);
const outW = isHoriz ? 1920 : 1080;
const outH = isHoriz ? 1080 : 1920;

const outPath = outRaw ? path.resolve(outRaw) : path.resolve('out', 'overlay-result.mp4');
fs.mkdirSync(path.dirname(outPath), { recursive: true });

let overlayVideo = overlayPath;
let tempVideo = null;

if (overlayPath.endsWith('.json')) {
  tempVideo = path.join(path.dirname(outPath), `_temp_overlay_${Date.now()}.mp4`);
  const r = spawnSync('node', [
    path.join(SKILL, 'scripts/render.mjs'),
    overlayPath,
    '--tema', temaOpt,
    '--formato', isHoriz ? 'horizontal' : 'vertical',
    '-o', tempVideo
  ], { stdio: 'inherit' });
  if (r.status !== 0) die('falló el renderizado del overlay JSON');
  overlayVideo = tempVideo;
}

if (layoutOpt === 'split-pip') {
  const durSec = parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', basePath], { encoding: 'utf8' }).stdout.trim()) || 5;

  let bgHex = '0x0B0D12'; // respaldo: Tinta del manual; normalmente se lee --fx-bg del tema
  const themeFile = path.join(SKILL, 'themes', `${temaOpt}.css`);
  if (fs.existsSync(themeFile)) {
    const cssContent = fs.readFileSync(themeFile, 'utf8');
    const m = cssContent.match(/--fx-bg:\s*#([0-9a-fA-F]{6})/);
    if (m) bgHex = '0x' + m[1];
  }

  const topW = isHoriz ? 880 : 960;
  const topH = isHoriz ? 860 : 760;
  const topX = isHoriz ? 60 : 60;
  const topY = isHoriz ? 110 : 140;

  const botW = isHoriz ? 880 : 960;
  const botH = isHoriz ? 860 : 700;
  const botX = isHoriz ? 980 : 60;
  const botY = isHoriz ? 110 : 1060;

  const maskTopSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${topW}" height="${topH}"><rect width="${topW}" height="${topH}" rx="28" fill="white"/></svg>`;
  const maskBotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${botW}" height="${botH}"><rect width="${botW}" height="${botH}" rx="28" fill="white"/></svg>`;

  const tmpMaskTop = path.join(path.dirname(outPath), `_tmp_pip_top_${Date.now()}.svg`);
  const tmpMaskBot = path.join(path.dirname(outPath), `_tmp_pip_bot_${Date.now()}.svg`);
  fs.writeFileSync(tmpMaskTop, maskTopSvg, 'utf8');
  fs.writeFileSync(tmpMaskBot, maskBotSvg, 'utf8');

  const fc = [
    `color=c=${bgHex}:s=${outW}x${outH}:d=${durSec}:r=30[bg]`,
    `[0:v]fps=30,scale=${botW}:${botH}:force_original_aspect_ratio=increase,crop=${botW}:${botH},setsar=1[bot_crop]`,
    `[2:v]fps=30,scale=${botW}:${botH}:flags=lanczos[bot_mask]`,
    `[bot_crop][bot_mask]alphamerge[pip_speaker]`,
    `[1:v]fps=30,scale=${topW}:${topH}:force_original_aspect_ratio=increase,crop=${topW}:${topH},setsar=1[top_crop]`,
    `[3:v]fps=30,scale=${topW}:${topH}:flags=lanczos[top_mask]`,
    `[top_crop][top_mask]alphamerge[pip_effect]`,
    `[bg][pip_effect]overlay=${topX}:${topY}[bg_eff]`,
    `[bg_eff][pip_speaker]overlay=${botX}:${botY}[v]`
  ].join(';');

  const args = [
    '-y', '-loglevel', 'error',
    '-i', basePath,
    '-i', overlayVideo,
    '-i', tmpMaskBot,
    '-i', tmpMaskTop,
    '-filter_complex', fc,
    '-map', '[v]',
    '-map', '0:a?',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    '-c:a', 'aac', '-b:a', '128k',
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    if (fs.existsSync(tmpMaskTop)) fs.unlinkSync(tmpMaskTop);
    if (fs.existsSync(tmpMaskBot)) fs.unlinkSync(tmpMaskBot);
    if (tempVideo && fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
  } catch {}

  if (r.status !== 0) die(`ffmpeg falló en split-pip:\n${r.stderr.toString().trim()}`);

  console.log(JSON.stringify({
    operacion: 'overlay',
    layout: 'split-pip',
    formato: isHoriz ? 'horizontal' : 'vertical',
    tema: temaOpt,
    ancho: outW,
    alto: outH,
    base: path.basename(basePath),
    overlay: path.basename(overlayPath),
    salida: outPath
  }, null, 2));
  process.exit(0);
}

let keyColor = getOpt('--key');
const tolerancia = getOpt('--tolerancia') || '0.20';
const suavizado = getOpt('--suavizado') || '0.05';

if (keyColor && keyColor.startsWith('#')) keyColor = '0x' + keyColor.slice(1);

let overlayFilter = `[1:v]fps=30,scale=${outW}:${outH}:flags=lanczos,setsar=1`;
if (keyColor) {
  overlayFilter += `,chromakey=color=${keyColor}:similarity=${tolerancia}:blend=${suavizado}`;
}
overlayFilter += '[ov]';

const fc = [
  `[0:v]fps=30,scale=${outW}:${outH}:flags=lanczos,setsar=1[base]`,
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
  formato: isHoriz ? 'horizontal' : 'vertical',
  ancho: outW,
  alto: outH,
  base: path.basename(basePath),
  overlay: path.basename(overlayPath),
  salida: outPath,
  key: keyColor || 'ninguno'
}, null, 2));
