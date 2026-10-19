#!/usr/bin/env node
// reel.mjs — varios efectos → un reel con contador NN/TT y título fijo superior.
// Uso: node scripts/reel.mjs <reel.json> [-o salida.mp4] [--motor auto|hyperframes|respaldo]
//   reel.json: { "tituloFijo": "11 efectos de video", "tema": "ceinca-social", "duracion": 4,
//                "efectos": ["portada.json", "checklist.json", ...] }   (rutas relativas al reel.json)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { render, SKILL } from './render.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const file = argv.find((a) => a.endsWith('.json'));
if (!file) { console.error('uso: reel.mjs <reel.json> [-o salida.mp4] [--motor auto|hyperframes|respaldo]'); process.exit(1); }
const reel = JSON.parse(fs.readFileSync(file, 'utf8'));
const base = path.dirname(path.resolve(file));
const out = path.resolve(opt('-o', path.join(SKILL, 'out', 'reel.mp4')));
fs.mkdirSync(path.dirname(out), { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fx-reel-'));
const total = reel.efectos.length;
const parts = [];
for (const [i, rel] of reel.efectos.entries()) {
  const part = path.join(tmp, `${String(i + 1).padStart(2, '0')}.mp4`);
  console.error(`▶ ${i + 1}/${total}  ${rel}`);
  const r = await render(path.resolve(base, rel), {
    salida: part, motor: opt('--motor'), tema: reel.tema, duracion: reel.duracion, marcaDir: opt('--marca-dir'),
    override: { contador: { n: i + 1, total }, ...(reel.tituloFijo ? { tituloFijo: reel.tituloFijo } : {}) },
  });
  parts.push(part);
}
fs.writeFileSync(path.join(tmp, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'));
const c = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', out], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
if (c.status !== 0) { console.error('✗ ffmpeg concat falló'); process.exit(1); }
console.log(`✓ reel → ${out}`);
