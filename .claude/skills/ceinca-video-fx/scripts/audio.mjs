#!/usr/bin/env node
// audio.mjs — música + SFX sintetizados (sin archivos externos) y sincronizados con el timeline GSAP.
// Uso: node scripts/audio.mjs <reel.json> <video.mp4> [-o salida.mp4] [--bpm 120] [--sin-musica] [--sin-sfx]
// Lee los instantes reales de cada animación (render.mjs cuesOut), los clasifica en SFX y los mezcla con música
// cuyo compás cae en cada corte de escena. Duck de la música bajo los SFX. Salida AAC 48 kHz, -14 LUFS.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { render, SKILL } from './render.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const [reelFile, video] = argv.filter((a) => !a.startsWith('-') && (a.endsWith('.json') || a.endsWith('.mp4')));
if (!reelFile || !video) { console.error('uso: audio.mjs <reel.json> <video.mp4> [-o salida.mp4] [--bpm 120] [--sin-musica] [--sin-sfx]'); process.exit(1); }
const reel = JSON.parse(fs.readFileSync(reelFile, 'utf8'));
const base = path.dirname(path.resolve(reelFile));
const out = path.resolve(opt('-o', video.replace(/\.mp4$/, '-audio.mp4')));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fx-audio-'));

/* ---- clasifica tweens → eventos de sonido ---- */
function clasificar(efecto, D, tweens) {
  const ev = [];
  for (const w of tweens) {
    if (w.fin) continue;
    const entra = w.props.includes('runBackwards') ? (w.o1 === 0) : (w.o0 === 0 || w.from.includes('opacity'));
    const mueve = Math.max(Math.abs(w.x1 ?? 0), Math.abs(w.y1 ?? 0), Math.abs(w.x0 ?? 0), Math.abs(w.y0 ?? 0));
    if (w.d >= D * 0.8) continue;                                  // deriva larga / parpadeo del cursor
    if (!w.dom) { if (efecto === 'consola-macos' && w.d > 0.2) ev.push({ t: w.t, d: w.d, tipo: 'teclas' }); continue; }
    if (w.repeat) continue;                                        // puntos «escribiendo…»
    if (w.props.includes('strokeDashoffset')) { ev.push({ t: w.t, d: w.d, tipo: 'dibujo' }); continue; }
    if (w.props.includes('scaleX') && w.ease === 'none') { ev.push({ t: w.t, d: w.d, tipo: 'relleno' }); continue; }
    const s = w.s1 ?? w.s0;
    if (s !== null && s >= 10 && w.d > 0.5) { ev.push({ t: w.t, d: w.d, tipo: 'riser', f: 1 }); continue; } // anillos del zoom
    if (s !== null && s >= 2 && w.d > 0.5) { ev.push({ t: w.t, d: w.d, tipo: 'whoosh', f: 1 }); continue; }
    if (w.ease.startsWith('steps') && entra) { ev.push({ t: w.t, d: w.d, tipo: 'papel' }); continue; } // piezas de collage
    if (w.ease.startsWith('back')) { ev.push({ t: w.t, d: w.d, tipo: 'pop', f: /right/.test(w.origin) ? 0 : 1 }); continue; }
    if (w.ease.includes('.in') || !entra) continue;                // salidas: silencio
    if (w.d < 0.15) continue;
    if (mueve >= 30) ev.push({ t: w.t, d: w.d, tipo: 'whoosh', f: 0 });
    else if (entra && w.d >= 0.18) ev.push({ t: w.t, d: w.d, tipo: 'tick' });
  }
  ev.sort((a, b) => a.t - b.t);
  const VENTANA = { whoosh: 0.45, tick: 0.25, pop: 0.15, riser: 1.2, impacto: 0.2, dibujo: 0.3, relleno: 0.3, teclas: 0.1, papel: 0.12 };
  const res = [];                                                    // fusiona por familia: un stagger de 3 elementos = 1 sonido
  for (const e of ev) {
    const prev = res.findLast((r) => r.tipo === e.tipo);
    if (prev && e.t - prev.t < VENTANA[e.tipo]) { prev.d = Math.max(prev.d, e.t + e.d - prev.t); continue; }
    res.push({ ...e });
  }
  // un whoosh/tick pegado a un pop o a un riser sobra: el acento ya marca el movimiento
  for (let i = res.length - 1; i >= 0; i--) {
    if (!['whoosh', 'tick'].includes(res[i].tipo)) continue;
    const dup = res.some((r, j) => j !== i && ((['pop', 'riser'].includes(r.tipo) && Math.abs(r.t - res[i].t) < 0.12) || (res[i].tipo === 'tick' && r.tipo === 'whoosh' && Math.abs(r.t - res[i].t) < 0.3)));
    if (dup) res.splice(i, 1);
  }
  return res;
}

const cues = [];
let offset = 0;
for (const [i, rel] of reel.efectos.entries()) {
  const f = path.join(tmp, `cues-${i}.json`);
  await render(path.resolve(base, rel), { tema: reel.tema, duracion: reel.duracion, cuesOut: f, override: { contador: { n: i + 1, total: reel.efectos.length }, ...(reel.tituloFijo ? { tituloFijo: reel.tituloFijo } : {}) } });
  const c = JSON.parse(fs.readFileSync(f, 'utf8'));
  const D = c.duracion;
  const ev = clasificar(c.efecto, D, c.tweens);
  cues.push({ t: offset, d: 0.5, tipo: 'impacto', f: i === 0 ? 0 : 1 }); // golpe en cada corte de escena
  for (const e of ev) cues.push({ ...e, t: offset + e.t });
  console.error(`♪ ${c.efecto}: ${ev.length} cues`);
  offset += D;
}
const spec = { total: offset, bpm: Number(opt('--bpm', 120)), musica: !argv.includes('--sin-musica'), sfx: !argv.includes('--sin-sfx'), cues };
const specF = path.join(tmp, 'spec.json'); fs.writeFileSync(specF, JSON.stringify(spec));
const wav = path.join(tmp, 'mix.wav');
const py = spawnSync('python3', [path.join(path.dirname(fileURLToPath(import.meta.url)), 'sfx_synth.py'), specF, wav], { stdio: 'inherit' });
if (py.status !== 0) { console.error('✗ síntesis de audio falló'); process.exit(1); }
if (argv.includes('--cues-json')) fs.copyFileSync(specF, opt('--cues-json'));
const m = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.resolve(video), '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-2.5:LRA=9', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
if (m.status !== 0) { console.error('✗ ffmpeg mux falló'); process.exit(1); }
console.log(`✓ reel con audio → ${out}  (${cues.length} eventos de sonido)`);
