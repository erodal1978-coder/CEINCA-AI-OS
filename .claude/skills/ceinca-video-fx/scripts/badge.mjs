#!/usr/bin/env node
// badge.mjs — PNG transparente 1080×1920 con el badge de marca para pegar sobre un clip (mismo estilo que contador/tituloFijo).
// Uso:
//   node scripts/badge.mjs --n 3 --total 7 [--titulo "7 efectos de video"] -o out/badge.png        (contador NN/TT + título)
//   node scripts/badge.mjs --ctb "FIEBRU'O" --linea "TE ENVÍO EL ZIP" [--handle @ceinca.mercantil] -o out/ctb.png   (llamado a la acción)
// Todo el color y la tipografía salen de themes/<tema>.css (variables --fx-*); la caja CTB queda dentro de la zona segura.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SKILL, findChrome } from './render.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const out = path.resolve(opt('-o', path.join(SKILL, 'out', 'badge.png')));
const tema = opt('--tema', 'ceinca-social');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const themeCss = path.join(SKILL, 'themes', `${tema}.css`);
if (!fs.existsSync(themeCss)) { console.error(`✗ tema inexistente: ${tema}`); process.exit(1); }

let body;
if (opt('--ctb')) {
  const handle = opt('--handle', '');
  body = `<div class="ctb"><div class="k">COMENTA ${esc(opt('--ctb'))}</div><div class="l">${esc(opt('--linea', ''))}</div>${handle ? `<div class="h">${esc(handle)}</div>` : ''}</div>`;
} else {
  const n = Number(opt('--n')), total = Number(opt('--total'));
  if (!n || !total) { console.error('✗ indica --n y --total, o --ctb'); process.exit(1); }
  const c = String(n).padStart(2, '0') + '/' + String(total).padStart(2, '0');
  body = `<div class="fx-overlay"><div class="fx-fixed-title">${esc(opt('--titulo', ''))}</div><div class="fx-counter">${c}</div></div>`;
}
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${pathToFileURL(themeCss).href}"><link rel="stylesheet" href="${pathToFileURL(path.join(SKILL, 'shared/base.css')).href}">
<style>
html,body{background:transparent!important} #root{background:transparent!important}
.fx-fixed-title{background:rgba(var(--fx-bg-rgb),.78);padding:10px 24px;border-radius:999px;max-width:760px}
.ctb{position:absolute;left:60px;right:60px;top:1230px;display:flex;flex-direction:column;gap:14px;align-items:stretch;text-align:center}
.k{font-family:var(--fx-font-display);font-weight:var(--fx-fw-display);font-size:58px;letter-spacing:.02em;padding:22px 20px;border-radius:var(--fx-radius);background:var(--fx-accent);color:var(--fx-on-accent)}
.l{font-family:var(--fx-font-display);font-weight:var(--fx-fw-strong);font-size:32px;padding:18px 20px;border-radius:var(--fx-radius);background:rgba(var(--fx-bg-rgb),.88);color:var(--fx-text)}
.h{font-family:var(--fx-font-body);font-weight:var(--fx-fw-strong);font-size:28px;color:var(--fx-text)}
</style></head><body><div id="root">${body}</div></body></html>`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fx-badge-'));
const file = path.join(tmp, 'badge.html'); fs.writeFileSync(file, html);
let pw; for (const s of [path.join(SKILL, 'node_modules/playwright-core/index.mjs'), 'playwright-core']) { try { pw = await import(s.startsWith('/') ? pathToFileURL(s).href : s); break; } catch { /* siguiente */ } }
const exe = findChrome();
if (!pw || !exe) { console.error('✗ falta playwright-core o Chromium (npm install; FX_CHROME=/ruta)'); process.exit(1); }
const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--force-color-profile=srgb'] });
const page = await (await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
fs.mkdirSync(path.dirname(out), { recursive: true });
await page.screenshot({ path: out, omitBackground: true });
await browser.close(); fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✓ badge → ${out}`);
