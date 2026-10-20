#!/usr/bin/env node
// musica.mjs — pone música y SFX bajo la voz de un reel ya montado (solo FFmpeg).
// La música se alinea por su caída: --caida-musica (s en la pista) cae en --caida-reel (s en el reel). Se agacha sola cuando hay voz
// (sidechaincompress con la voz como llave), cierra con fundido y el master queda en -16 LUFS. --sfx pone un whoosh sintetizado en cada tiempo.
// Uso: node scripts/musica.mjs <reel.mp4> <pista.mp3> -o salida.mp4 --caida-musica 15.05 --caida-reel 9.62 [--sfx 9.62,11.02,...] [--nivel -17] [--fundido 1.2]
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const [reel, pista] = argv.filter((a, i) => !a.startsWith('-') && !argv[i - 1]?.startsWith('-'));
const out = opt('-o');
if (!reel || !pista || !out) { console.error('uso: musica.mjs <reel.mp4> <pista> -o salida.mp4 --caida-musica S --caida-reel S [--sfx t1,t2] [--nivel dB] [--fundido s]'); process.exit(1); }
const probe = (f) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout);
const dur = probe(reel);
const inicio = Number(opt('--caida-musica', 0)) - Number(opt('--caida-reel', 0)); // segundo de la pista que suena en t=0 del reel
if (inicio < 0) { console.error('✗ la caída de la pista llega antes que la del reel: la pista empezaría antes de su inicio'); process.exit(1); }
if (inicio + dur > probe(pista)) { console.error('✗ la pista no alcanza a cubrir el reel desde ese punto'); process.exit(1); }
const nivel = Number(opt('--nivel', -17)); // dB de la música respecto a 0 antes del agachado
const fundido = Number(opt('--fundido', 1.2));
const sfx = (opt('--sfx', '') || '').split(',').filter(Boolean).map(Number);

const ins = ['-i', reel, '-ss', inicio.toFixed(3), '-t', dur.toFixed(3), '-i', pista];
let fc = `[0:a]aresample=48000,asplit=2[voz][llave];` +
  `[1:a]aresample=48000,volume=${nivel}dB,afade=t=in:d=0.3,afade=t=out:st=${(dur - fundido).toFixed(3)}:d=${fundido}[m];` +
  `[m][llave]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[mus]`;
const mezcla = ['[voz]', '[mus]'];
sfx.forEach((t, i) => { // whoosh: ruido rosa filtrado con subida y caída cortas, centrado en el corte
  ins.push('-f', 'lavfi', '-i', `anoisesrc=d=0.45:c=pink:r=48000:a=0.5`);
  fc += `;[${i + 2}:a]highpass=f=500,lowpass=f=7000,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.15,volume=-14dB,adelay=${Math.max(0, Math.round((t - 0.3) * 1000))}:all=1,apad[s${i}]`;
  mezcla.push(`[s${i}]`);
});
fc += `;${mezcla.join('')}amix=inputs=${mezcla.length}:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...ins, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', dur.toFixed(3), '-movflags', '+faststart', path.resolve(out)], { encoding: 'utf8' });
if (r.status !== 0) { console.error(`✗ ffmpeg: ${(r.stderr || '').slice(-500)}`); process.exit(1); }
console.log(`✓ música (pista desde ${inicio.toFixed(2)} s, ${sfx.length} SFX) → ${path.resolve(out)}`);
