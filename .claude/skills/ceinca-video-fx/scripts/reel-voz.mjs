#!/usr/bin/env node
// reel-voz.mjs — monta un reel donde la VOZ viene de clips grabados (p. ej. Flow con el avatar) y cada escena
// puede llevar un efecto encima: clip liso, efecto FFmpeg (zoom/chroma), efecto HTML a pantalla completa
// u overlay HTML con fondo clave (karaoke) pegado sobre el clip. Reutiliza render.mjs, clip.mjs, badge.mjs.
// Uso: node scripts/reel-voz.mjs <reel-voz.json> [-o salida.mp4] [--motor auto|hyperframes|respaldo] [--guardar-base base.mp4] [--desde-base base.mp4]
//   --guardar-base guarda el montaje antes de las capas globales (subtítulos/logo); --desde-base las aplica sobre una base ya montada (sin re-renderizar escenas).
//
// reel-voz.json (rutas relativas al JSON):
// { "tema": "ceinca-social", "tituloFijo": "7 efectos de video con Claude", "total": 7,
//   "escenas": [
//     { "fuente": "clip.mp4", "desde": 0.7, "hasta": 5.8 },                                   // clip liso (voz del clip)
//     { "fuente": "clip.mp4", "desde": 0, "hasta": 1.2, "fx": { "efecto": "pantalla-verde", ... }, "badge": 4 },   // efecto clip.mjs (tiempos relativos a la escena)
//     { "fuente": "clip.mp4", "desde": 1.2, "hasta": 3.7, "html": { "efecto": "rompe-marco", ... } },            // HTML a pantalla completa; el badge sale del contador
//     { "fuente": "clip.mp4", "desde": 0, "hasta": 7.4, "overlay": { "efecto": "subtitulos-karaoke", ... }, "badge": 7 },  // overlay sobre el clip
//     { "fuente": "clip.mp4", "desde": 1, "hasta": 6, "ctb": { "palabra": "FIEBRU'O", "linea": "...", "handle": "@x" } }   // CTB dentro de zona segura
//   ] }
// "html"/"overlay"/"fx" son los mismos params.json de cada efecto (sin "clip"); `badge: N` = contador N/total.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { render, SKILL } from './render.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const file = argv.find((a) => a.endsWith('.json'));
if (!file) { console.error('uso: reel-voz.mjs <reel-voz.json> [-o salida.mp4] [--motor auto|hyperframes|respaldo]'); process.exit(1); }
const reel = JSON.parse(fs.readFileSync(file, 'utf8'));
const base = path.dirname(path.resolve(file));
const out = path.resolve(opt('-o', path.join(SKILL, 'out', 'reel-voz.mp4')));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fx-reelvoz-'));
fs.mkdirSync(path.dirname(out), { recursive: true });
const tema = reel.tema || 'ceinca-social';
const total = reel.total || reel.escenas.filter((e) => e.badge || e.html).length;
const KEY = '0x00FF00';

const die = (m) => { console.error(`✗ ${m}`); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(1); };
const run = (cmd, args, o = {}) => { const r = spawnSync(cmd, args, { encoding: 'utf8', ...o }); if (r.status !== 0) die(`${cmd} falló: ${(r.stderr || '').trim().slice(-400)}`); return r; };
const ff = (...a) => run('ffmpeg', ['-y', '-loglevel', 'error', ...a]);
const abs = (p) => path.resolve(base, p);
const writeJson = (name, obj) => { const f = path.join(tmp, name); fs.writeFileSync(f, JSON.stringify(obj)); return f; };

// Ganancia por fuente: lleva cada clip a ≈ -20 dB de volumen medio para que la voz sea pareja entre escenas.
const gain = {};
const gainOf = (src) => {
  if (!(src in gain)) {
    const r = spawnSync('ffmpeg', ['-i', src, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
    const m = /mean_volume:\s*(-?[\d.]+)/.exec(r.stderr || '');
    gain[src] = m ? Math.max(-12, Math.min(12, -20 - Number(m[1]))) : 0;
  }
  return gain[src];
};

const themeVar = (name) => { // lee un color #RRGGBB de themes/<tema>.css → 0xRRGGBB (la marca vive solo en el tema)
  const css = fs.readFileSync(path.join(SKILL, 'themes', `${tema}.css`), 'utf8');
  const m = new RegExp(`${name}:\\s*#([0-9A-Fa-f]{6})`).exec(css);
  if (!m) die(`no encontré ${name} en themes/${tema}.css`);
  return '0x' + m[1];
};

const fromBase = opt('--desde-base');
const parts = [];
for (const [i, e] of (fromBase ? [] : reel.escenas).entries()) {
  const id = String(i + 1).padStart(2, '0');
  const src = abs(e.fuente);
  if (!fs.existsSync(src)) die(`escena ${id}: no existe ${src}`);
  const dur = +(e.hasta - e.desde).toFixed(3);
  if (!(dur > 0.2)) die(`escena ${id}: "hasta" debe superar a "desde"`);
  e.ctb = e.ctb || e.texto;
  const prev = reel.escenas[i - 1], next = reel.escenas[i + 1];
  const fin = !prev || prev.fuente !== e.fuente, fout = !next || next.fuente !== e.fuente;
  console.error(`▶ ${id}/${String(reel.escenas.length).padStart(2, '0')} ${path.basename(src)} ${e.desde}–${e.hasta}s ${e.fx ? e.fx.efecto : e.html ? e.html.efecto : e.overlay ? 'overlay ' + e.overlay.efecto : e.ctb ? 'CTB' : 'liso'}`);

  // 1. segmento fuente normalizado: 1080×1920 (encuadre cover), 30 fps, AAC 48 kHz estéreo con ganancia y fundidos cortos en los empalmes
  const seg = path.join(tmp, `${id}_seg.mp4`);
  const af = [`volume=${gainOf(src).toFixed(2)}dB`, fin ? 'afade=t=in:st=0:d=0.04' : null, fout ? `afade=t=out:st=${(dur - 0.04).toFixed(3)}:d=0.04` : null].filter(Boolean).join(',');
  ff('-ss', String(e.desde), '-t', String(dur), '-i', src,
    '-vf', 'fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=yuv420p', '-af', af, '-ar', '48000', '-ac', '2',
    '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-c:a', 'aac', '-b:a', '192k', seg);

  // 2. vídeo de la escena
  let vid = seg;
  const badgePng = () => {
    const png = path.join(tmp, `${id}_badge.png`);
    run('node', [path.join(SKILL, 'scripts/badge.mjs'), '--n', String(e.badge), '--total', String(total), '--titulo', reel.tituloFijo || '', '--tema', tema, ...(e.ventana ? ['--nombre', e.nombre || '', '--top', '140', '--y', String((e.ventana.y ?? 250) + (e.ventana.h ?? 850) - 110)] : []), '-o', png], { stdio: ['ignore', 'ignore', 'inherit'] });
    return png;
  };
  if (e.ventana) { // locutor persistente abajo + efecto recortado en una ventana superior (look de la referencia)
    const V = { x: 0, y: 250, w: 1080, h: 850, desplazar: 400, ...e.ventana }; // ventana 1080×850 sobre el locutor desplazado 400 px (rostro bajo la ventana)
    const c = e.contenido || {};
    const vel = Number(c.velocidad || 1);
    const durC = +(dur * vel).toFixed(3);
    const cvid = path.join(tmp, `${id}_cv.mp4`);
    if (c.html) {
      const res = { ...c.html };
      for (const k of ['sujeto', 'fondo', 'pantalla']) if (typeof res[k] === 'string' && !path.isAbsolute(res[k])) res[k] = abs(res[k]);
      await render(writeJson(`${id}_cv.json`, res), { salida: cvid, motor: opt('--motor'), tema, duracion: durC, override: {}, sinAuditoria: !!e.sinAuditoria });
    } else if (c.fx) {
      const fxp = { ...c.fx, clip: c.fx.clip ? abs(c.fx.clip) : seg, audio: false };
      run('node', [path.join(SKILL, 'scripts/clip.mjs'), writeJson(`${id}_cv.json`, fxp), '-o', cvid], { stdio: ['ignore', 'ignore', 'inherit'] });
    } else die(`escena ${id}: "ventana" necesita contenido.html o contenido.fx`);
    const band = V.banda ?? Math.round((1920 - V.h) / 2);
    const comp = path.join(tmp, `${id}_vent.mp4`);
    ff('-f', 'lavfi', '-i', `color=c=${themeVar('--fx-bg')}:s=1080x1920:r=30:d=${dur}`, '-i', seg, '-i', cvid, '-filter_complex',
      `[1:v]setsar=1[sp];[2:v]setpts=PTS/${vel},fps=30,scale=1080:1920,setsar=1,crop=${V.w}:${V.h}:${V.x}:${band},drawbox=x=0:y=0:w=iw:h=ih:color=${themeVar('--fx-accent')}:t=6[w];[0:v][sp]overlay=0:${V.desplazar}[b];[b][w]overlay=${V.x}:${V.y},format=yuv420p[v]`,
      '-map', '[v]', '-an', '-t', String(dur), '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', comp);
    vid = comp;
  } else if (e.fx) { // efecto FFmpeg sobre el segmento (tiempos relativos al inicio de la escena)
    const pj = writeJson(`${id}_fx.json`, { ...e.fx, clip: seg, audio: false });
    const o = path.join(tmp, `${id}_fx.mp4`);
    run('node', [path.join(SKILL, 'scripts/clip.mjs'), pj, '-o', o], { stdio: ['ignore', 'ignore', 'inherit'] });
    vid = o;
  } else if (e.html) { // efecto HTML a pantalla completa (el contador lo dibuja el propio efecto)
    const pj = writeJson(`${id}_html.json`, e.html);
    const o = path.join(tmp, `${id}_html.mp4`);
    const ov = { ...(e.badge ? { contador: { n: e.badge, total } } : {}), ...(reel.tituloFijo ? { tituloFijo: reel.tituloFijo } : {}) };
    // las rutas de assets del efecto son relativas al reel: las resolvemos antes de pasar el JSON a render
    const resolved = JSON.parse(fs.readFileSync(pj, 'utf8'));
    for (const k of ['sujeto', 'fondo', 'pantalla']) if (typeof resolved[k] === 'string' && !path.isAbsolute(resolved[k])) resolved[k] = abs(resolved[k]);
    fs.writeFileSync(pj, JSON.stringify(resolved));
    await render(pj, { salida: o, motor: opt('--motor'), tema, duracion: dur, override: ov, sinAuditoria: !!e.sinAuditoria });
    vid = o;
  } else if (e.overlay) { // efecto HTML con fondo clave pegado sobre el clip
    const pj = writeJson(`${id}_ov.json`, { ...e.overlay, fondoClave: KEY });
    const o = path.join(tmp, `${id}_ov.mp4`);
    await render(pj, { salida: o, motor: opt('--motor'), tema, duracion: dur, override: {} });
    const comp = path.join(tmp, `${id}_comp.mp4`);
    ff('-i', seg, '-i', o, '-filter_complex', `[1:v]fps=30,scale=1080:1920,chromakey=color=${KEY}:similarity=0.14:blend=0.04,format=rgba,colorchannelmixer=aa=${e.overlay.opacidad ?? 0.9}[ov];[0:v][ov]overlay=0:0,format=yuv420p[v]`, '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', comp);
    vid = comp;
  }
  if ((e.fx || e.overlay || e.ventana) && e.badge) { // badge NN/TT sobre escenas que no lo dibujan solas
    const o = path.join(tmp, `${id}_b.mp4`);
    ff('-i', vid, '-i', badgePng(), '-filter_complex', '[0:v][1:v]overlay=0:0,format=yuv420p[v]', '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', o);
    vid = o;
  }
  if (e.ctb) { // llamado a la acción con entrada suave
    const png = path.join(tmp, `${id}_ctb.png`);
    run('node', [path.join(SKILL, 'scripts/badge.mjs'), '--ctb', e.ctb.palabra, '--prefijo', e.ctb.prefijo ?? 'COMENTA ', '--y', String(e.ctb.y ?? 1090), '--linea', e.ctb.linea || '', '--handle', e.ctb.handle || '', '--tema', tema, '-o', png], { stdio: ['ignore', 'ignore', 'inherit'] });
    const o = path.join(tmp, `${id}_c.mp4`);
    ff('-i', vid, '-loop', '1', '-i', png, '-filter_complex', `[1:v]format=rgba,fade=t=in:st=${e.ctb.entra ?? 0.4}:d=0.4:alpha=1[c];[0:v][c]overlay=0:0:shortest=1,format=yuv420p[v]`, '-map', '[v]', '-an', '-t', String(dur), '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', o);
    vid = o;
  }

  // 3. une el vídeo de la escena con el audio del segmento
  const scene = path.join(tmp, `${id}_scene.mp4`);
  ff('-i', vid, '-i', seg, '-map', '0:v:0', '-map', '1:a:0', '-t', String(dur), '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', scene);
  parts.push(scene);
}

if (!fromBase) fs.writeFileSync(path.join(tmp, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
const base0 = fromBase ? path.resolve(fromBase) : path.join(tmp, 'base.mp4');
if (!fromBase) ff('-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', base0);
if (opt('--guardar-base') && !fromBase) fs.copyFileSync(base0, path.resolve(opt('--guardar-base')));
const totalDur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', base0], { encoding: 'utf8' }).stdout);
// capas globales sobre todo el reel: subtítulos karaoke continuos (reel.subtitulos = params del efecto con "paginas") y logo fijo (reel.logo)
const layers = [];
if (reel.subtitulos) {
  const sp = { ...JSON.parse(fs.readFileSync(abs(reel.subtitulos), 'utf8')), fondoClave: KEY };
  const o = path.join(tmp, 'subs.mp4');
  console.error('▶ subtítulos continuos');
  await render(writeJson('subs.json', sp), { salida: o, motor: opt('--motor'), tema, duracion: +totalDur.toFixed(3), override: {}, sinAuditoria: false });
  layers.push({ file: o, key: true });
}
if (reel.logo) {
  const png = path.join(tmp, 'logo.png');
  run('node', [path.join(SKILL, 'scripts/badge.mjs'), '--solo-logo', '--tema', tema, '-o', png], { stdio: ['ignore', 'ignore', 'inherit'] });
  layers.push({ file: png, loop: true });
}
const ins = ['-i', base0]; let fc = '[0:v]null[v0]'; let last = 'v0';
layers.forEach((l, i) => { ins.push(...(l.loop ? ['-loop', '1'] : []), '-i', l.file);
  fc += `;[${i + 1}:v]${l.key ? `fps=30,scale=1080:1920,chromakey=color=${KEY}:similarity=0.14:blend=0.04,format=rgba,colorchannelmixer=aa=0.92` : 'format=rgba'}[l${i}];[${last}][l${i}]overlay=0:0:shortest=1[v${i + 1}]`; last = `v${i + 1}`; });
ff(...ins, '-filter_complex', fc, '-map', `[${last}]`, '-map', '0:a', '-t', String(totalDur), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30',
  '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out);
fs.rmSync(tmp, { recursive: true, force: true });
const p = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,duration', '-of', 'compact', out], { encoding: 'utf8' });
console.log(`✓ reel con voz → ${out}\n${p.stdout.trim()}`);
