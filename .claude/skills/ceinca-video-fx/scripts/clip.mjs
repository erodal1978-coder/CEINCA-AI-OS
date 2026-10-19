#!/usr/bin/env node
// clip.mjs — Bloque 2: zoom digital, zoom de corte y zoom hacia atrás sobre clip grabado.
// Solo FFmpeg + Node. Sin Chromium, sin HyperFrames, sin dependencias npm.
// Uso: node scripts/clip.mjs <params.json> [-o <salida.mp4>]
// Imprime un JSON de resumen por stdout. Los errores van a stderr + exit 1.
import fs   from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── utilidades ──────────────────────────────────────────────────────────────

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
function warn(msg) { console.error(`⚠ ${msg}`); }

/** Resuelve la ruta del clip: relativa al JSON, al cwd o a la skill. */
function resolveClip(raw, jsonDir) {
  for (const base of [jsonDir, process.cwd(), SKILL]) {
    const p = path.resolve(base, raw);
    if (fs.existsSync(p)) return p;
  }
  die(`clip no encontrado: "${raw}" (buscado relativo al JSON, al cwd y a la skill)`);
}

/** Ejecuta ffprobe y devuelve metadatos del clip. */
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

/** Verifica que el audio no cambie de duración tras la recompresión. */
function checkAudioDuration(outPath, durVideoSec) {
  const r = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'a:0',
    '-show_entries', 'stream=duration',
    '-of', 'default=nw=1', outPath
  ]);
  if (r.status !== 0) return; // sin audio → ok
  const raw = r.stdout.toString().trim();
  if (!raw || raw === 'N/A') return;
  const durAudio = parseFloat(raw);
  const diff = Math.abs(durAudio - durVideoSec);
  const tolerancia = 1 / 30 + 0.01; // 1 frame + margen
  if (diff > tolerancia) warn(`duración de audio (${durAudio.toFixed(3)}s) difiere de video (${durVideoSec.toFixed(3)}s) en ${diff.toFixed(3)}s`);
}

// ── validaciones ─────────────────────────────────────────────────────────────

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

// ── construcción de filtros ffmpeg ───────────────────────────────────────────

/**
 * Construye el encuadre vertical 1080×1920 desde un clip de cualquier tamaño.
 * "cubrir": escala para cubrir 1080×1920 y recorta (cover). foco mueve el recorte.
 */
function buildEncuadreFilter(w, h, foco = { x: 0.5, y: 0.5 }) {
  // Factor de escala necesario para cubrir 1080×1920
  const scaleW = 1080 / w;
  const scaleH = 1920 / h;
  const scale  = Math.max(scaleW, scaleH);
  const sw = Math.round(w * scale);
  const sh = Math.round(h * scale);

  // Recorte centrado según foco (valores en px del frame escalado)
  const cropX = Math.round((sw - 1080) * foco.x);
  const cropY = Math.round((sh - 1920) * foco.y);

  // Si ya es 1080×1920 exacto, no necesitamos scale ni crop
  if (sw === 1080 && sh === 1920) return 'scale=1080:1920:flags=lanczos';
  // Si no hay recorte necesario (exactamente la relación correcta)
  if (sw === 1080) return `scale=1080:1920:flags=lanczos`;
  if (sh === 1920) return `scale=${sw}:1920:flags=lanczos,crop=1080:1920:${cropX}:0`;
  return `scale=${sw}:${sh}:flags=lanczos,crop=1080:1920:${cropX}:${cropY}`;
}

/**
 * Curva de interpolación (expresión ffmpeg para in_time normalizado 0→1).
 * zoom-digital usa: z va de 1 a escala; zoom-atras usa: z va de escalaInicial a 1.
 */
function curvaExpr(curva, desde, hasta, zInicio, zFin) {
  // t normalizado [0,1] dentro del intervalo [desde, hasta]
  const dur = hasta - desde;
  const tNorm = dur > 0 ? `clip((in_time-${desde})/${dur},0,1)` : '0';
  let lerp;
  switch (curva) {
    case 'lineal': lerp = tNorm; break;
    case 'salida': lerp = `(1-(1-${tNorm})*(1-${tNorm}))`; break;
    case 'suave':  // smoothstep
    default:       lerp = `(${tNorm}*${tNorm}*(3-2*${tNorm}))`; break;
  }
  // z = zInicio + (zFin - zInicio) * lerp, mantenido fuera del intervalo
  if (desde > 0) {
    // antes del inicio: zInicio; dentro: interpola; después: zFin
    return `if(lt(in_time,${desde}),${zInicio},if(gt(in_time,${hasta}),${zFin},${zInicio}+(${zFin}-${zInicio})*(${lerp})))`;
  }
  return `${zInicio}+(${zFin}-${zInicio})*(${lerp})`;
}

/**
 * Construye el filtro zoompan supersampleado (×2, lanczos) para zoom continuo.
 * La entrada ya debe estar en 1080×1920 (post-encuadre).
 */
function buildZoomFilter(zExpr, fx, fy) {
  // Supersampleo ×2: escala a 2160×3840, luego zoompan sobre ese tamaño
  // La expresión de x/y usa iw/ih del frame supersampleado (2160×3840).
  // foco (fx, fy) en fracción 0–1 del encuadre.
  return [
    'scale=2160:3840:flags=lanczos',
    `zoompan=z='${zExpr}':x='(iw-iw/zoom)*${fx}':y='(ih-ih/zoom)*${fy}':d=1:fps=30:s=1080x1920`,
  ].join(',');
}

// ── aviso de zoom máximo vs. resolución nativa ────────────────────────────────

function avisoResolucion(escalaMax, w, h, outW = 1080, outH = 1920) {
  // Resolución nativa del clip en el frame de salida (post-encuadre cover)
  const scaleW = outW / w;
  const scaleH = outH / h;
  const scale  = Math.max(scaleW, scaleH);
  // Con zoom de escalaMax, cada pixel de salida viene de (nativeScale / escalaMax) píxeles del original
  // Si escalaMax > escalaRelativa (la escala real que ya hace el cover), estamos ampliando
  const escalaRelativa = scale;
  if (escalaMax > escalaRelativa + 0.001) {
    return `zoom máximo (${escalaMax}×) supera la resolución nativa del clip (factor real de encuadre: ${escalaRelativa.toFixed(2)}×) — posible pérdida de nitidez`;
  }
  return null;
}

// ── efectos ───────────────────────────────────────────────────────────────────

/**
 * zoom-digital: acercamiento continuo suave hacia foco.
 */
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

/**
 * zoom-atras: empieza cerrado, se abre hasta escala 1.
 */
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

/**
 * zoom-corte: saltos instantáneos en los tiempos de cortes[].
 * Se implementa como una expresión if() anidada.
 * NO usa zoompan (el cambio debe ocurrir en un solo frame).
 * Usa scale + crop estáticos por segmento unidos con concat.
 */
function buildZoomCorte(p, meta, clipPath, outPath, audio) {
  const cortes = p.cortes;
  validateCortes(cortes);
  const foco = p.foco ?? { x: 0.5, y: 0.5 };

  // Validar que todos los tiempos caen dentro de la duración
  for (const c of cortes) {
    if (c.t < 0 || c.t >= meta.duracion) die(`cortes[].t=${c.t} fuera de la duración del clip (${meta.duracion}s)`);
    if (c.foco) validateFoco(c.foco);
  }

  // Construir segmentos: [0, t0) → escala1, [t0, t1) → escala2, ...
  const segs = [];
  let prevT = 0;
  for (let i = 0; i <= cortes.length; i++) {
    const t    = i < cortes.length ? cortes[i].t : meta.duracion;
    // La escala del segmento actual viene del corte i (o 1 si no hay corte previo)
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

/**
 * pantalla-verde: chroma key en FFmpeg.
 * Sustituye el color de fondo (por defecto 0x00FF00) por un fondo especificado.
 */
function buildPantallaVerde(p, meta) {
  let colorKey = p.color ?? '0x00FF00';
  if (colorKey === 'verde') colorKey = '0x00FF00';
  if (colorKey.startsWith('#')) colorKey = '0x' + colorKey.slice(1);
  const tolerancia = Number(p.tolerancia ?? 0.25);
  const suavizado  = Number(p.suavizado  ?? 0.05);
  const foco       = p.foco ?? { x: 0.5, y: 0.5 };
  validateFoco(foco);
  return { colorKey, tolerancia, suavizado, fondo: p.fondo, foco };
}

// ── render principal ──────────────────────────────────────────────────────────

function renderZoomContinuo(clipPath, params, meta, outPath, zoomData) {
  const { zExpr, fx, fy, escalaMax } = zoomData;
  const audio = params.audio !== false;

  const foco = params.foco ?? { x: 0.5, y: 0.5 };
  const encuadre = buildEncuadreFilter(meta.width, meta.height, foco);
  const zoompan  = buildZoomFilter(zExpr, fx, fy);

  // Recorte de duración si se especificó
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

  return { escalaMax, aviso: avisoResolucion(escalaMax, meta.width, meta.height) };
}

function renderZoomCorte(clipPath, params, meta, outPath, cortesData) {
  const { segs } = cortesData;
  const audio = params.audio !== false;
  const foco  = params.foco ?? { x: 0.5, y: 0.5 };

  const recorte = params.recorte;
  const clipDesde = recorte?.desde ?? 0;
  const clipHasta = recorte?.hasta ?? meta.duracion;

  // Filtro para segmento: encuadre cover + scale/crop con la escala del corte
  function segFilter(seg) {
    const enc = buildEncuadreFilter(meta.width, meta.height, seg.foco);
    if (seg.escala === 1) {
      return `${enc},fps=30,setsar=1`;
    }
    // crop centrado en foco después del encuadre 1080×1920
    const cw = Math.round(1080 / seg.escala);
    const ch = Math.round(1920 / seg.escala);
    const cx = Math.round((1080 - cw) * seg.foco.x);
    const cy = Math.round((1920 - ch) * seg.foco.y);
    return `${enc},fps=30,crop=${cw}:${ch}:${cx}:${cy},scale=1080:1920:flags=lanczos,setsar=1`;
  }

  // Recortamos el clip completo primero y luego filtramos por segmento con trim + setpts
  // Usamos un filtro complejo con split + trim por segmento + concat
  const filterParts = [];
  let prevInput = '[0:v]';
  const audioEnabled = audio;

  // Construimos el filtro complejo (video + audio si procede)
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
  // Concat
  const segLabels  = segs.map((_, i) => `[seg${i}]`).join('');
  const asegLabels = segs.map((_, i) => `[aseg${i}]`).join('');
  const concatInputs = audioEnabled
    ? segs.map((_, i) => `[seg${i}][aseg${i}]`).join('')
    : segLabels;
  const concatFilter = audioEnabled
    ? `${concatInputs}concat=n=${segs.length}:v=1:a=1[v][a]`
    : `${segLabels}concat=n=${segs.length}:v=1:a=0[v]`;
  fComplejo.push(concatFilter);

  const fcStr = fComplejo.join(';');

  const args = [
    '-y', '-loglevel', 'error',
    '-i', clipPath,
    '-filter_complex', fcStr,
    '-map', '[v]',
    ...(audioEnabled ? ['-map', '[a]'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'fast',
    ...(audioEnabled ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']),
    outPath
  ];

  const r = spawnSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.status !== 0) die(`ffmpeg falló:\n${r.stderr.toString().trim()}`);

  const escalaMax = Math.max(...segs.map(s => s.escala));
  return { escalaMax, aviso: avisoResolucion(escalaMax, meta.width, meta.height) };
}

function renderPantallaVerde(clipPath, params, meta, outPath, chromaData) {
  const { colorKey, tolerancia, suavizado, fondo, foco } = chromaData;
  const audio = params.audio !== false;

  const encuadre = buildEncuadreFilter(meta.width, meta.height, foco);
  const recorte = params.recorte;
  const duracion = recorte ? (recorte.hasta - recorte.desde) : meta.duracion;
  const ssArgs = recorte ? ['-ss', String(recorte.desde)] : [];
  const tArgs  = recorte ? ['-t',  String(duracion)] : [];

  let bgInputArgs = [];
  let bgFilter = '[1:v]scale=1080:1920:flags=lanczos,setsar=1[bg]';

  if (!fondo || (typeof fondo === 'string' && (fondo.startsWith('#') || fondo.startsWith('0x'))) || fondo.tipo === 'color') {
    let col = typeof fondo === 'string' ? fondo : (fondo?.valor ?? '0x122A63');
    if (col.startsWith('#')) col = '0x' + col.slice(1);
    bgInputArgs = ['-f', 'lavfi', '-i', `color=c=${col}:s=1080x1920:d=${duracion}:r=30`];
    bgFilter = '[1:v]fps=30,setsar=1[bg]';
  } else {
    const rawFondo = typeof fondo === 'string' ? fondo : (fondo.valor || fondo.clip || fondo.imagen);
    const resolvedFondo = resolveClip(rawFondo, path.dirname(params.__jsonPath || process.cwd()));
    bgInputArgs = ['-i', resolvedFondo];
    bgFilter = '[1:v]scale=1080:1920:flags=lanczos,fps=30,setsar=1[bg]';
  }

  const fc = [
    `[0:v]${encuadre},fps=30,setsar=1,chromakey=color=${colorKey}:similarity=${tolerancia}:blend=${suavizado}[fg]`,
    bgFilter,
    `[bg][fg]overlay=0:0[v]`
  ].join(';');

  const args = [
    '-y', '-loglevel', 'error',
    ...ssArgs, '-i', clipPath, ...tArgs,
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

  return { escalaMax: 1, aviso: null, metodo: 'ffmpeg-chromakey' };
}

// ── ffprobe de la salida ──────────────────────────────────────────────────────

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

// ── main ──────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
if (!argv[0]) die('uso: node scripts/clip.mjs <params.json> [-o <salida.mp4>]');

const jsonPath = path.resolve(argv[0]);
if (!fs.existsSync(jsonPath)) die(`no existe: ${jsonPath}`);
const params = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
params.__jsonPath = jsonPath;

// Parámetro -o
const oIdx = argv.indexOf('-o');
const outPath = oIdx !== -1 ? path.resolve(argv[oIdx + 1]) : path.resolve('out', `${params.efecto ?? 'clip'}.mp4`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

// Validaciones globales
if (!params.efecto) die('falta "efecto" en params.json');
if (!params.clip)   die('falta "clip" en params.json (ruta al mp4/mov)');
const efectosValidos = ['zoom-digital', 'zoom-corte', 'zoom-atras', 'pantalla-verde'];
if (!efectosValidos.includes(params.efecto)) die(`"efecto" debe ser uno de: ${efectosValidos.join(', ')}`);

const jsonDir  = path.dirname(jsonPath);
const clipPath = resolveClip(params.clip, jsonDir);
const meta     = probeClip(clipPath);

// Recorte
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

// Duración efectiva de salida
const duracion = params.recorte
  ? params.recorte.hasta - params.recorte.desde
  : meta.duracion;

if (params.efecto === 'zoom-digital') {
  const zoomData = buildZoomDigital(params, { ...meta, duracion });
  zoomResult = renderZoomContinuo(clipPath, params, meta, outPath, zoomData);
} else if (params.efecto === 'zoom-atras') {
  const zoomData = buildZoomAtras(params, { ...meta, duracion });
  zoomResult = renderZoomContinuo(clipPath, params, meta, outPath, zoomData);
} else if (params.efecto === 'zoom-corte') {
  const cortesData = buildZoomCorte(params, { ...meta, duracion }, clipPath, outPath, audio);
  zoomResult = renderZoomCorte(clipPath, params, meta, outPath, cortesData);
} else if (params.efecto === 'pantalla-verde') {
  const chromaData = buildPantallaVerde(params, { ...meta, duracion });
  zoomResult = renderPantallaVerde(clipPath, params, meta, outPath, chromaData);
}

if (audio) checkAudioDuration(outPath, duracion);

// JSON de resumen (stdout)
const out = probeOut(outPath);
const resumen = {
  efecto: params.efecto,
  metodo: zoomResult?.metodo ?? 'ffmpeg-zoompan-x2',
  ancho:  out.ancho  ?? 1080,
  alto:   out.alto   ?? 1920,
  fps:    out.fps    ?? '30/1',
  codec:  out.codec  ?? 'h264',
  pix_fmt: out.pix_fmt ?? 'yuv420p',
  frames: out.frames ?? Math.round(duracion * 30),
  duracion: out.duracion ?? duracion,
  audio,
  ...(zoomResult?.aviso ? { aviso: zoomResult.aviso } : {}),
};
console.log(JSON.stringify(resumen, null, 2));

