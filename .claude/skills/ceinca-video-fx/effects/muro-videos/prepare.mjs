// prepare.mjs (muro-videos): extrae los frames de cada clip con FFmpeg y los compone la plantilla como <img>.
// Motivo medido: el Chromium headless de Playwright/HyperFrames no trae el decodificador H.264, así que un
// <video> con mp4 no reproduce ni hace seek exacto por frame. Con los frames extraídos el resultado es
// idéntico y determinista en cualquiera de las dos rutas de render.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export default async function prepare({ dir, params, duracion, fps, log }) {
  const clips = params.clips || [];
  if (!clips.length) throw new Error('muro-videos: falta "clips" (lista de mp4)');
  const N = Math.round(duracion * fps);
  const hi = typeof params.destacado === 'string' ? Math.max(0, clips.indexOf(params.destacado)) : Math.min(clips.length - 1, Number(params.destacado ?? 0));
  const dirs = [];
  clips.forEach((rel, i) => {
    const [w, h] = i === hi ? [720, 1280] : [432, 768];
    const out = path.join(dir, 'frames', `c${i}`);
    fs.mkdirSync(out, { recursive: true });
    const ss = Number(params.inicio?.[i] ?? 0);
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-stream_loop', '-1', '-ss', String(ss), '-i', path.join(dir, rel),
      '-vf', `fps=${fps},scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`, '-frames:v', String(N), '-q:v', '3', path.join(out, '%04d.jpg')], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`ffmpeg no pudo extraer frames de ${rel}: ${r.stderr}`);
    const got = fs.readdirSync(out).length;
    if (got !== N) throw new Error(`muro-videos: se esperaban ${N} frames de ${rel} y salieron ${got}`);
    dirs.push(`frames/c${i}`);
  });
  log(`  muro-videos: ${clips.length} clips → ${N} frames c/u (método: FFmpeg → secuencia JPG; <video> nativo descartado, ver SKILL.md)`);
  return { __frames: { dirs, n: N, fps, destacado: hi } };
}
