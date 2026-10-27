#!/usr/bin/env node
// clip.mjs — Bloque 2: zoom digital, zoom de corte, zoom hacia atrás y pantalla verde sobre clip grabado.
// Soporta formato vertical 9:16 (1080×1920, default) y horizontal 16:9 YouTube (1920×1080).
// Solo FFmpeg + Node. Sin Chromium, sin HyperFrames, sin dependencias npm.
// Uso: node scripts/clip.mjs <params.json> [-o <salida.mp4>] [--formato vertical|horizontal]
import fs   from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
function warn(msg) { console.error(`⚠ ${msg}`); }

function resolveClip(raw, jsonDir) {
  for (const base of [jsonDir, process.cwd(), SKILL]) {
    const p = path.resolve(base, raw);
    if (fs.existsSync(p)) return p;
  }
  die(`clip no encontrado: "${raw}" (buscado relativo al JSON, al cwd y a la skill)`);
}

function probeClip(clipPath) {
  const r = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,duration,nb_frames',
    '-show_entries', 'format=duration',
    '-of', 'json', clipPath
  ]);
  if (r.status !== 0) die(`ffprobe falló en "${clipPath}": ${r.stderr.toString().trim()}`);
  const j = JSON.parse(r.stdout.toString());
  const s = j.streams[0];
  const [num, den] = (s.r_frame_rate || '30/1').split('/').map(Number);
  const fps = num / den;
  const duracion = parseFloat(s.duration ?? j.format?.duration ?? '0');
  if (!duracion) die(`no se pudo determinar la duración de "${clipPath}"`);
  return { width: parseInt(s.width), height: parseInt(s.height), fps, duracion };
}

function checkAudioDuration(outPath, durVideoSec) {
  const r = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'a:0',
    '-show_entries', 'stream=duration',
    '-of', 'default=nw=1', outPath
  ]);
  if (r.status !== 0) return;
  const raw = r.stdout.toString().trim();
  if (!raw || raw === 'N/A') return;
  const durAudio = parseFloat(raw);
  const diff = Math.abs(durAudio - durVideoSec);
  const tolerancia = 1 / 30 + 0.01;
  if (diff > tolerancia) warn(`duración de audio (${durAudio.toFixed(3)}s) difiere de video (${durVideoSec.toFixed(3)}s) en ${diff.toFixed(3)}s`);
}

function validateFoco(foco) {
  if (!foco) return;
  if (foco.x < 0 || foco.x > 1) die(`foco.x fuera de rango [0,1]: ${foco.x}`);
  if (foco.y < 0 || foco.y > 1) die(`foco.y fuera de rango [0,1]: ${foco.y}`);
}

function validateCortes(cortes) {
  if (!Array.isArray(cortes) || cortes.length === 0) die('zoom-corte requiere un array "cortes" no vacío');
  for (let i = 0; i < cortes.length; i++) {
    const c = cortes[i];
    if (typeof c.t !== 'number') die(`cortes[${i}].t debe ser un número`);
    if (typeof c.escala !== 'number' || c.escala < 1) die(`cortes[${i}].escala debe ser ≥ 1`);
    if (c.foco) validateFoco(c.foco);
    if (i > 0 && cortes[i].t <= cortes[i - 1].t) die(`cortes[] no está en orden ascendente: cortes[${i}].t=${c.t} ≤ cortes[${i - 1}].t=${cortes[i - 1].t}`);
  }
}

/**
 * Construye el encuadre (1080×1920 vertical o 1920×1080 horizontal) desde un clip de cualquier tamaño.
 */
function buildEncuadreFilter(w, h, foco = { x: 0.5, y: 0.5 }, outW = 1080, outH = 1920) {
  const scaleW = outW / w;
  const scaleH = outH / h;
  const scale  = Math.max(scaleW, scaleH);
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);

  const cropX = Math.round((sw - outW) * foco.x);
  const cropY = Math.round((sh - outH) * foco.y);

  if (sw === outW && sh === outH) return `scale=${outW}:${outH}:flags=lanczos`;
  if (sw === outW) return `scale=${outW}:${outH}:flags=lanczos`;
  if (sh === outH) return `scale=${sw}:${outH}:flags=lanczos,crop=${outW}:${outH}:${cropX}:0`;
  return `scale=${sw}:${sh}:flags=lanczos,crop=${outW}:${outH}:${cropX}:${cropY}`;
}

function curvaExpr(curva, desde, hasta, zInicio, zFin) {
  const dur = hasta - desde;
  const tNorm = dur > 0 ? `clip((in_time-${desde})/${dur},0,1)` : '0';
  let lerp;
  switch (curva) {
    case 'lineal': lerp = tNorm; break;
    case 'salida': lerp = `(1-(1-${tNorm})*(1-${tNorm}))`; break;
    case 'suave':
    default:       lerp = `(${tNorm}*${tNorm}*(3-2*${tNorm}))`; break;
  }
  if (desde > 0) {
    return `if(lt(in_time,${desde}),${zInicio},if(gt(in_time,${hasta}),${zFin},${zInicio}+(${zFin}-${zInicio})*(${lerp})))`;
  }
  return `${zInicio}+(${zFin}-${zInicio})*(${lerp})`;
}

function buildZoomFilter(zExpr, fx, fy, outW = 1080, outH = 1920) {
  return [
    `scale=${outW * 2}:${outH * 2}:flags=lanczos`,
    `zoompan=z='${zExpr}':x='(iw-iw/zoom)*${fx}':y='(ih-ih/zoom)*${fy}':d=1:fps=30:s=${outW}x${outH}`,
  ].join(',');
}

function avisoResolucion(escalaMax, w, h, outW = 1080, outH = 1920) {
  const scaleW = outW / w;
  const scaleH = outH / h;
  const escalaRelativa = Math.max(scaleW, scaleH);
  if (escalaMax > escalaRelativa + 0.001) {
    return `zoom máximo (${escalaMax}×) supera la resolución nativa del clip (factor real de encuadre: ${escalaRelativa.toFixed(2)}×) — posible pérdida de nitidez`;
  }
  return null;
}

function buildZoomDigital(p, meta) {
  const escala  = p.escala  ?? 1.3;
  const inicio  = p.inicio  ?? 0;
  const fin     = p.fin     ?? meta.duracion;
  const curva   = p.curva   ?? 'suave';
  const foco    = p.foco    ?? { x: 0.5, y: 0.5 };

  if (escala < 1) die('escala debe ser ≥ 1 (escala < 1 generaría bordes negros)');
  validateFoco(foco);
  if (inicio < 0 || inicio > meta.duracion) die(`inicio (${inicio}) fuera de la duración del clip (${meta.duracion}s)`);
  if (fin   < 0 || fin   > meta.duracion) die(`fin (${fin}) fuera de la duración del clip (${meta.duracion}s)`);
  if (inicio >= fin) die(`inicio (${inicio}) debe ser menor que fin (${fin})`);

  const zExpr = curvaExpr(curva, inicio, fin, 1, escala);
  return { zExpr, fx: foco.x, fy: foco.y, escalaMax: escala };
}

function buildZoomAtras(p, meta) {
  const escalaInicial = p.escalaInicial ?? 1.4;
  const inicio        = p.inicio        ?? 0;
  const fin           = p.fin           ?? meta.duracion;
  const curva         = p.curva         ?? 'suave';
  const foco          = p.foco          ?? { x: 0.5, y: 0.5 };

  if (escalaInicial < 1) die('escalaInicial debe ser ≥ 1');
  validateFoco(foco);
  if (inicio < 0 || inicio > meta.duracion) die(`inicio (${inicio}) fuera de la duración del clip (${meta.duracion}s)`);
  if (fin   < 0 || fin   > meta.duracion) die(`fin (${fin}) fuera de la duración del clip (${meta.duracion}s)`);
  if (inicio >= fin) die(`inicio (${inicio}) debe ser menor que fin (${fin})`);

  const zExpr = curvaExpr(curva, inicio, fin, escalaInicial, 1);
  return { zExpr, fx: foco.x, fy: foco.y, escalaMax: escalaInicial };
}

function buildZoomCorte(p, meta) {
  const cortes = p.cortes;
  validateCortes(cortes);
  const foco = p.foco ?? { x: 0.5, y: 0.5 };

  for (const c of cortes) {
    if (c.t < 0 || c.t >= meta.duracion) die(`cortes[].t=${c.t} fuera de la duración del clip (${meta.duracion}s)`);
    if (c.foco) validateFoco(c.foco);
  }

  const segs = [];
  let prevT = 0;
  for (let i = 0; i <= cortes.length; i++) {
    const t    = i < cortes.length ? cortes[i].t : meta.duracion;
    const corteActual = i > 0 ? cortes[i - 1] : null;
    const escala = corteActual?.escala ?? 1;
    const focoSeg = corteActual?.foco ?? foco;
    if (t > prevT) {
      segs.push({ desde: prevT, hasta: t, escala, foco: focoSeg });
    }
    prevT = t;
  }

  return { segs };
}

function buildPantallaVerde(p) {
  let colorKey = p.color ?? '0x00FF00';
  if (colorKey === 'verde') colorKey = '0x00FF00';
  if (colorKey.startsWith('#')) colorKey = '0x' + colorKey.slice(1);
  const tolerancia = Number(p.tolerancia ?? 0.25);
  const suavizado  = Number(p.suavizado  ?? 0.05);
  const foco       = p.foco ?? { x: 0.5, y: 0.5 };
  validateFoco(foco);
  // metodo 'verde-dominante': alfa por exceso de verde sobre rojo/azul (no motea prendas azul claro como el chromakey por distancia)
  const metodo = p.metodo ?? 'chromakey';
  const umbral = Number(p.umbral ?? 18), rango = Number(p.rango ?? 40);
  return { colorKey, tolerancia, suavizado, fondo: p.fondo, foco, metodo, umbral, rango };
}

function renderZoomContinuo(clipPath, params, meta, outPath, zoomData, outW, outH) {
  const { zExpr, fx, fy, escalaMax } = zoomData;
  const audio = params.audio !== false;
  const foco = params.foco ?? { x: 0.5, y: 0.5 };
  const encuadre = buildEncuadreFilter(meta.width, meta.height, foco, outW, outH);
  const zoompan  = buildZoomFilter(zExpr, fx, fy, outW, outH);

  const recorte = params.recorte;
  const ssArgs  = recorte ? ['-ss', String(recorte.desde)] : [];
  const tArgs   = recorte ? ['-t',  String(recorte.hasta - recorte.desde)] : [];

  const vf = [encuadre, 'fps=30', zoompan].join(',');

  const args = [
    '-y', '-loglevel', 'error',
    ...ssArgs, '-i', clipPath, ...tArgs,
    '-vf', vf,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) die(`ffmpeg falló:\n${r.stderr.toString().trim()}`);

  return { escalaMax, aviso: avisoResolucion(escalaMax, meta.width, meta.height, outW, outH) };
}

function renderZoomCorte(clipPath, params, meta, outPath, cortesData, outW, outH) {
  const { segs } = cortesData;
  const audio = params.audio !== false;
  const recorte = params.recorte;
  const clipDesde = recorte?.desde ?? 0;

  function segFilter(seg) {
    const enc = buildEncuadreFilter(meta.width, meta.height, seg.foco, outW, outH);
    if (seg.escala === 1) {
      return `${enc},fps=30,setsar=1`;
    }
    const cw = Math.round(outW / seg.escala);
    const ch = Math.round(outH / seg.escala);
    const cx = Math.round((outW - cw) * seg.foco.x);
    const cy = Math.round((outH - ch) * seg.foco.y);
    return `${enc},fps=30,crop=${cw}:${ch}:${cx}:${cy},scale=${outW}:${outH}:flags=lanczos,setsar=1`;
  }

  const audioEnabled = audio;
  const fComplejo = [];
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    const desde = seg.desde + clipDesde;
    const hasta  = seg.hasta + clipDesde;
    const dur    = hasta - desde;
    fComplejo.push(
      `[0:v]trim=start=${desde}:duration=${dur},setpts=PTS-STARTPTS,${segFilter(seg)}[seg${i}]`
    );
    if (audioEnabled) {
      fComplejo.push(
        `[0:a]atrim=start=${desde}:duration=${dur},asetpts=PTS-STARTPTS[aseg${i}]`
      );
    }
  }
  const segLabels  = segs.map((_, i) => `[seg${i}]`).join('');
  const concatInputs = audioEnabled
    ? segs.map((_, i) => `[seg${i}][aseg${i}]`).join('')
    : segLabels;
  const concatFilter = audioEnabled
    ? `${concatInputs}concat=n=${segs.length}:v=1:a=1[v][a]`
    : `${segLabels}concat=n=${segs.length}:v=1:a=0[v]`;
  fComplejo.push(concatFilter);

  const args = [
    '-y', '-loglevel', 'error',
    '-i', clipPath,
    '-filter_complex', fComplejo.join(';'),
    '-map', '[v]',
    ...(audioEnabled ? ['-map', '[a]'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audioEnabled ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) die(`ffmpeg falló:\n${r.stderr.toString().trim()}`);

  const escalaMax = Math.max(...segs.map(s => s.escala));
  return { escalaMax, aviso: avisoResolucion(escalaMax, meta.width, meta.height, outW, outH) };
}

function renderPantallaVerde(clipPath, params, meta, outPath, chromaData, outW, outH) {
  const { colorKey, tolerancia, suavizado, fondo, foco, metodo, umbral, rango } = chromaData;
  const audio = params.audio !== false;

  const encuadre = buildEncuadreFilter(meta.width, meta.height, foco, outW, outH);
  const recorte = params.recorte;
  const duracion = recorte ? (recorte.hasta - recorte.desde) : meta.duracion;
  const ssArgs = recorte ? ['-ss', String(recorte.desde)] : [];
  const tArgs  = recorte ? ['-t',  String(duracion)] : [];

  let bgInputArgs = [];
  let bgFilter = `[1:v]scale=${outW}:${outH}:flags=lanczos,setsar=1[bg]`;

  if (!fondo || (typeof fondo === 'string' && (fondo.startsWith('#') || fondo.startsWith('0x'))) || fondo.tipo === 'color') {
    let col = typeof fondo === 'string' ? fondo : (fondo?.valor ?? '0x122A63');
    if (col.startsWith('#')) col = '0x' + col.slice(1);
    bgInputArgs = ['-f', 'lavfi', '-i', `color=c=${col}:s=${outW}x${outH}:d=${duracion}:r=30`];
    bgFilter = '[1:v]fps=30,setsar=1[bg]';
  } else {
    const rawFondo = typeof fondo === 'string' ? fondo : (fondo.valor || fondo.clip || fondo.imagen);
    const resolvedFondo = resolveClip(rawFondo, path.dirname(params.__jsonPath || process.cwd()));
    bgInputArgs = ['-i', resolvedFondo];
    bgFilter = `[1:v]scale=${outW}:${outH}:flags=lanczos,fps=30,setsar=1[bg]`;
  }

  const fc = [
    metodo === 'verde-dominante'
      ? `[0:v]${encuadre},fps=30,setsar=1,format=rgba,geq=r='r(X,Y)':g='min(g(X,Y),max(r(X,Y),b(X,Y))+8)':b='b(X,Y)':a='255*clip(1-(g(X,Y)-max(r(X,Y),b(X,Y))-${umbral})/${rango},0,1)',gblur=sigma=1[fg]`
      : `[0:v]${encuadre},fps=30,setsar=1,chromakey=color=${colorKey}:similarity=${tolerancia}:blend=${suavizado}[fg]`,
    bgFilter,
    `[bg][fg]overlay=0:0[v]`
  ].join(';');

  const args = [
    '-y', '-loglevel', 'error',
    ...ssArgs, ...tArgs, '-i', clipPath,
    ...bgInputArgs,
    '-filter_complex', fc,
    '-map', '[v]',
    ...(audio ? ['-map', '0:a?'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) die(`ffmpeg falló en pantalla-verde:\n${r.stderr.toString().trim()}`);

  return { escalaMax: 1, aviso: null, metodo: metodo === 'verde-dominante' ? 'ffmpeg-verde-dominante' : 'ffmpeg-chromakey' };
}

function renderLupaZoom(clipPath, params, meta, outPath, outW, outH) {
  const audio = params.audio !== false;
  const duracion = params.recorte ? params.recorte.hasta - params.recorte.desde : meta.duracion;
  const recorte = params.recorte;
  const ssArgs = recorte ? ['-ss', String(recorte.desde)] : [];
  const tArgs = recorte ? ['-t', String(duracion)] : [];

  const origen = params.origen ?? { x: 0.35, y: 0.35 };
  const destino = params.destino ?? { x: 0.65, y: 0.65 };
  const escala = Number(params.escala ?? 1.8);
  const radio = Math.round(Number(params.radio ?? (outW > outH ? 180 : 220)));
  const diam = radio * 2;
  let ringCol = params.colorAnillo ?? '0xC6FF3D';
  if (ringCol.startsWith('0x')) ringCol = '#' + ringCol.slice(2);
  const ringWidth = Number(params.grosorAnillo ?? 8);

  const encuadre = buildEncuadreFilter(meta.width, meta.height, params.foco ?? { x: 0.5, y: 0.5 }, outW, outH);

  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diam}" height="${diam}">
    <circle cx="${radio}" cy="${radio}" r="${radio - ringWidth / 2}" fill="white" stroke="${ringCol}" stroke-width="${ringWidth}"/>
  </svg>`;
  const tmpMask = path.join(path.dirname(outPath), `_tmp_lupa_mask_${Date.now()}.svg`);
  fs.writeFileSync(tmpMask, maskSvg, 'utf8');

  const ox = Math.round(origen.x * outW);
  const oy = Math.round(origen.y * outH);
  const dx = Math.round(destino.x * outW);
  const dy = Math.round(destino.y * outH);

  const tExpr = `clip(t/${duracion},0,1)`;
  const cxExpr = `(${ox}+(${dx}-${ox})*${tExpr})`;
  const cyExpr = `(${oy}+(${dy}-${oy})*${tExpr})`;

  const cropXExpr = `clip(${cxExpr}*${escala}-${radio},0,${Math.round(outW * escala)}-${diam})`;
  const cropYExpr = `clip(${cyExpr}*${escala}-${radio},0,${Math.round(outH * escala)}-${diam})`;
  const ovXExpr = `${cxExpr}-${radio}`;
  const ovYExpr = `${cyExpr}-${radio}`;

  const fc = [
    `[0:v]${encuadre},fps=30,setsar=1,split[base][tozoom]`,
    `[tozoom]scale=${Math.round(outW * escala)}:${Math.round(outH * escala)}:flags=lanczos,crop=${diam}:${diam}:x='${cropXExpr}':y='${cropYExpr}'[patch]`,
    `[1:v]fps=30,scale=${diam}:${diam}:flags=lanczos[mask]`,
    `[patch][mask]alphamerge[lens]`,
    `[base][lens]overlay=x='${ovXExpr}':y='${ovYExpr}'[v]`
  ].join(';');

  const args = [
    '-y', '-loglevel', 'error',
    ...ssArgs, ...tArgs, '-i', clipPath,
    '-i', tmpMask,
    '-filter_complex', fc,
    '-map', '[v]',
    ...(audio ? ['-map', '0:a?'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  try { if (fs.existsSync(tmpMask)) fs.unlinkSync(tmpMask); } catch {}
  if (r.status !== 0) die(`ffmpeg falló en lupa-zoom:\n${r.stderr.toString().trim()}`);

  return { escalaMax: escala, aviso: null, metodo: 'ffmpeg-lupa-zoom' };
}

function renderFocoSpotlight(clipPath, params, meta, outPath, outW, outH) {
  const audio = params.audio !== false;
  const duracion = params.recorte ? params.recorte.hasta - params.recorte.desde : meta.duracion;
  const recorte = params.recorte;
  const ssArgs = recorte ? ['-ss', String(recorte.desde)] : [];
  const tArgs = recorte ? ['-t', String(duracion)] : [];

  const foco = params.foco ?? { x: 0.5, y: 0.4 };
  const radio = Math.round(Number(params.radio ?? (outW > outH ? 220 : 280)));
  const encuadre = buildEncuadreFilter(meta.width, meta.height, { x: 0.5, y: 0.5 }, outW, outH);

  const fxPx = Math.round(foco.x * outW);
  const fyPx = Math.round(foco.y * outH);

  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}">
    <defs>
      <radialGradient id="spot" cx="${fxPx}" cy="${fyPx}" r="${radio}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="white" stop-opacity="1"/>
        <stop offset="70%" stop-color="white" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="black" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${outW}" height="${outH}" fill="url(#spot)"/>
  </svg>`;
  const tmpMask = path.join(path.dirname(outPath), `_tmp_spot_mask_${Date.now()}.svg`);
  fs.writeFileSync(tmpMask, maskSvg, 'utf8');

  const fc = [
    `[0:v]${encuadre},fps=30,setsar=1,split[lit][todark]`,
    `[todark]eq=brightness=-0.32:contrast=0.8[dark]`,
    `[1:v]fps=30,scale=${outW}:${outH}:flags=lanczos,format=gray[mask]`,
    `[lit][dark][mask]maskedmerge[v]`
  ].join(';');

  const args = [
    '-y', '-loglevel', 'error',
    ...ssArgs, ...tArgs, '-i', clipPath,
    '-i', tmpMask,
    '-filter_complex', fc,
    '-map', '[v]',
    ...(audio ? ['-map', '0:a?'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  try { if (fs.existsSync(tmpMask)) fs.unlinkSync(tmpMask); } catch {}
  if (r.status !== 0) die(`ffmpeg falló en foco-spotlight:\n${r.stderr.toString().trim()}`);

  return { escalaMax: 1, aviso: null, metodo: 'ffmpeg-foco-spotlight' };
}

function renderFragmentosShatter(clipPath, params, meta, outPath, outW, outH) {
  const audio = params.audio !== false;
  const duracion = params.recorte ? params.recorte.hasta - params.recorte.desde : meta.duracion;
  const recorte = params.recorte;
  const ssArgs = recorte ? ['-ss', String(recorte.desde)] : [];
  const tArgs = recorte ? ['-t', String(duracion)] : [];

  const snapDur = Number(params.duracionTransicion ?? params.transicion ?? 0.35);
  const nFranjas = Math.max(2, Math.min(10, Number(params.franjas ?? 6)));
  const desp = Number(params.desplazamiento ?? (outW > outH ? 200 : 260));
  const sliceH = Math.round(outH / nFranjas);

  const encuadre = buildEncuadreFilter(meta.width, meta.height, params.foco ?? { x: 0.5, y: 0.5 }, outW, outH);

  const splits = Array.from({ length: nFranjas }, (_, i) => `[s${i}]`).join('');
  const fc = [
    `[0:v]${encuadre},fps=30,setsar=1,split=${nFranjas}${splits}`,
    `color=c=black:s=${outW}x${outH}:d=${duracion}:r=30[bg]`
  ];

  let lastLayer = '[bg]';
  for (let i = 0; i < nFranjas; i++) {
    const yPos = i * sliceH;
    const curH = (i === nFranjas - 1) ? (outH - yPos) : sliceH;
    const sgn = (i % 2 === 0) ? -1 : 1;
    fc.push(`[s${i}]crop=${outW}:${curH}:0:${yPos}[c${i}]`);

    const xExpr = `if(lt(t,${snapDur}),${sgn * desp}*pow(1-t/${snapDur},2),0)`;
    const outLayer = (i === nFranjas - 1) ? '[v]' : `[v${i}]`;
    fc.push(`${lastLayer}[c${i}]overlay=x='${xExpr}':y=${yPos}${outLayer}`);
    lastLayer = outLayer;
  }

  const args = [
    '-y', '-loglevel', 'error',
    ...ssArgs, '-i', clipPath, ...tArgs,
    '-filter_complex', fc.join(';'),
    '-map', '[v]',
    ...(audio ? ['-map', '0:a?'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) die(`ffmpeg falló en fragmentos-shatter:\n${r.stderr.toString().trim()}`);

  return { escalaMax: 1, aviso: null, metodo: 'ffmpeg-fragmentos-shatter' };
}

function probeOut(outPath) {
  const r = spawnSync('ffprobe', [
    '-v', 'error', '-count_frames',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_read_frames,duration',
    '-of', 'default=nw=1', outPath
  ]);
  if (r.status !== 0) return {};
  const lines = r.stdout.toString().split('\n');
  const get = (k) => (lines.find(l => l.startsWith(k + '=')) || '').split('=')[1] ?? '';
  return {
    codec: get('codec_name'),
    ancho: parseInt(get('width')),
    alto:  parseInt(get('height')),
    fps:   get('r_frame_rate'),
    pix_fmt: get('pix_fmt'),
    frames: parseInt(get('nb_read_frames')),
    duracion: parseFloat(get('duration')),
  };
}

const argv = process.argv.slice(2);
if (!argv[0]) die('uso: node scripts/clip.mjs <params.json> [-o <salida.mp4>] [--formato vertical|horizontal]');

const jsonPath = path.resolve(argv[0]);
if (!fs.existsSync(jsonPath)) die(`no existe: ${jsonPath}`);
const params = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
params.__jsonPath = jsonPath;

const oIdx = argv.indexOf('-o');
const outPath = oIdx !== -1 ? path.resolve(argv[oIdx + 1]) : path.resolve('out', `${params.efecto ?? 'clip'}.mp4`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const fIdx = argv.indexOf('--formato');
const fmtRaw = fIdx !== -1 ? argv[fIdx + 1] : (params.formato ?? 'vertical');
const isHoriz = fmtRaw === 'horizontal' || fmtRaw === '16:9';
const outW = isHoriz ? 1920 : 1080;
const outH = isHoriz ? 1080 : 1920;

if (!params.efecto) die('falta "efecto" en params.json');
if (!params.clip)   die('falta "clip" en params.json (ruta al mp4/mov)');
const efectosValidos = ['zoom-digital', 'zoom-corte', 'zoom-atras', 'pantalla-verde', 'lupa-zoom', 'foco-spotlight', 'fragmentos-shatter'];
if (!efectosValidos.includes(params.efecto)) die(`"efecto" debe ser uno de: ${efectosValidos.join(', ')}`);

const jsonDir  = path.dirname(jsonPath);
const clipPath = resolveClip(params.clip, jsonDir);
const meta     = probeClip(clipPath);

if (params.recorte) {
  const { desde, hasta } = params.recorte;
  if (typeof desde !== 'number' || typeof hasta !== 'number') die('recorte debe tener "desde" y "hasta" numéricos (segundos)');
  if (desde < 0 || hasta > meta.duracion) die(`recorte [${desde}, ${hasta}] fuera de la duración del clip (${meta.duracion}s)`);
  if (desde >= hasta) die(`recorte.desde (${desde}) debe ser menor que recorte.hasta (${hasta})`);
}

const foco = params.foco ?? { x: 0.5, y: 0.5 };
validateFoco(foco);

const audio = params.audio !== false;
let zoomResult;

const duracion = params.recorte
  ? params.recorte.hasta - params.recorte.desde
  : meta.duracion;

if (params.efecto === 'zoom-digital') {
  const zoomData = buildZoomDigital(params, { ...meta, duracion });
  zoomResult = renderZoomContinuo(clipPath, params, meta, outPath, zoomData, outW, outH);
} else if (params.efecto === 'zoom-atras') {
  const zoomData = buildZoomAtras(params, { ...meta, duracion });
  zoomResult = renderZoomContinuo(clipPath, params, meta, outPath, zoomData, outW, outH);
} else if (params.efecto === 'zoom-corte') {
  const cortesData = buildZoomCorte(params, { ...meta, duracion });
  zoomResult = renderZoomCorte(clipPath, params, meta, outPath, cortesData, outW, outH);
} else if (params.efecto === 'pantalla-verde') {
  const chromaData = buildPantallaVerde(params);
  zoomResult = renderPantallaVerde(clipPath, params, meta, outPath, chromaData, outW, outH);
} else if (params.efecto === 'lupa-zoom') {
  zoomResult = renderLupaZoom(clipPath, params, meta, outPath, outW, outH);
} else if (params.efecto === 'foco-spotlight') {
  zoomResult = renderFocoSpotlight(clipPath, params, meta, outPath, outW, outH);
} else if (params.efecto === 'fragmentos-shatter') {
  zoomResult = renderFragmentosShatter(clipPath, params, meta, outPath, outW, outH);
}

if (audio) checkAudioDuration(outPath, duracion);

const out = probeOut(outPath);
const resumen = {
  efecto: params.efecto,
  formato: isHoriz ? 'horizontal' : 'vertical',
  metodo: zoomResult?.metodo ?? 'ffmpeg-zoompan-x2',
  ancho:  out.ancho  ?? outW,
  alto:   out.alto   ?? outH,
  fps:    out.fps    ?? '30/1',
  codec:  out.codec  ?? 'h264',
  pix_fmt: out.pix_fmt ?? 'yuv420p',
  frames: out.frames ?? Math.round(duracion * 30),
  duracion: out.duracion ?? duracion,
  audio,
  ...(zoomResult?.aviso ? { aviso: zoomResult.aviso } : {}),
};
console.log(JSON.stringify(resumen, null, 2));
