#!/usr/bin/env node
// Genera una portada de reel 1080×1920 con Playwright (usa playwright-core de la skill ceinca-video-fx; `npm install` allí).
// node generar.mjs --marca ceinca|soyeduardo --foto fotograma.png --l1 "[[Apostilla]]" --l2 "tu título" --sub "Desde donde vivas · en línea" --tag "COPIA CERTIFICADA" -o portada.png
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, '../../.claude/skills/ceinca-video-fx/package.json'));
const { chromium } = require('playwright-core');
const a = process.argv.slice(2), opt = (n, d = '') => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const foto = pathToFileURL(path.resolve(opt('--foto'))).href;
const qs = new URLSearchParams({ marca: opt('--marca', 'ceinca'), foto, l1: opt('--l1'), l2: opt('--l2'), sub: opt('--sub'), tag: opt('--tag') });
const out = path.resolve(opt('-o', 'portada.png'));
const chrome = ['/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => { try { return require('node:fs').existsSync(p); } catch { return false; } });
const b = await chromium.launch(chrome ? { executablePath: chrome } : {});
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(pathToFileURL(path.join(here, 'portada.html')).href + '?' + qs);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
const logo = opt('--marca', 'ceinca') === 'ceinca';
if (logo) await p.evaluate(() => { document.getElementById('logo').hidden = false; });
await p.screenshot({ path: out });
await b.close();
console.log(out);
