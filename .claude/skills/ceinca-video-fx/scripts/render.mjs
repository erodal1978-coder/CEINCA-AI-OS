#!/usr/bin/env node
// render.mjs — params.json → MP4 (1080×1920 vertical 9:16 o 1920×1080 horizontal 16:9, 30 fps, H.264, yuv420p).
// Ruta 1: HyperFrames CLI (composición HTML con timeline GSAP pausado en window.__timelines).
// Ruta 2 (respaldo): mismo timeline, seek frame a frame + captura Playwright + unión con FFmpeg.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;
const argv = process.argv.slice(2);

function usage() {
  console.log(`Uso: node scripts/render.mjs <params.json> [opciones]
  -o, --salida <mp4>        archivo de salida (default: out/<efecto>-<tema>.mp4)
  --formato <vertical|horizontal>  9:16 (1080×1920, default) o 16:9 YouTube (1920×1080)
  --motor <auto|hyperframes|respaldo>   (default: auto → HyperFrames y, si falla, respaldo)
  --duracion <seg>          sobreescribe la duración (default 4)
  --tema <nombre>           sobreescribe el tema (default: params.tema o ceinca-social)
  --marca-dir <dir>         raíz alterna con themes/ y vendor/fonts/ (pruebas de cambio de marca)
  --zona-arriba <px> --zona-abajo <px>   zonas seguras (default 250/350 en vertical, 80/90 en horizontal)
  --sin-auditoria           no auditar texto fuera de zonas seguras
  --con-overlay             añade título fijo + contador de prueba (como en reel.mjs): valida el layout con la zona superior reducida
  --frame <seg>             guarda un PNG de ese instante (-o <png>) sin renderizar el video: vista previa rápida de efecto × tema
  --solo-auditoria          audita (zonas seguras, errores de página) y sale sin renderizar: valida una combinación efecto × tema en segundos
  --ignorar-lock            renderiza aunque brand.lock.json no coincida con el manual
  --conservar               no borra el directorio temporal de composición`);
}

const opt = (names, d) => { for (const n of names) { const i = argv.indexOf(n); if (i >= 0) return argv[i + 1]; } return d; };
const flag = (n) => argv.includes(n);

export const log = (...a) => console.error(...a);
const die = (code, m) => { console.error(`✗ ${m}`); process.exit(code); };

export function dimsForFormato(fmt) {
  const isH = fmt === 'horizontal' || fmt === '16:9';
  return { formato: isH ? 'horizontal' : 'vertical', isHoriz: isH, W: isH ? 1920 : 1080, H: isH ? 1080 : 1920 };
}

/* ---------- lock de marca ---------- */
function checkLock(marcaDir) {
  if (marcaDir) return; // corrida de prueba con marca alterna
  const lockFile = path.join(SKILL, 'themes/brand.lock.json');
  if (!fs.existsSync(lockFile)) die(3, 'falta themes/brand.lock.json. Corre: npm run sync-brand');
  const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  const stale = [];
  for (const k of ['tokens', 'guias']) {
    if (!lock[k]) continue;
    const f = path.resolve(SKILL, lock[k].archivo);
    if (!fs.existsSync(f)) continue; // el repo no está presente (zip en claude.ai): se usa la instantánea
    const h = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
    if (h !== lock[k].sha256) stale.push(lock[k].archivo);
  }
  if (stale.length && !flag('--ignorar-lock'))
    die(3, `el manual de marca cambió desde el último sync (${stale.join(', ')}).\n  Corre primero:  npm run sync-brand   (en .claude/skills/ceinca-video-fx), commitea y vuelve a generar el zip.\n  (o --ignorar-lock para forzar con la instantánea actual)`);
}

/* ---------- medidas de assets (sincrónicas para la plantilla) ---------- */
function probeAsset(file) {
  const ext = path.extname(file).toLowerCase();
  const buf = fs.readFileSync(file);
  if (ext === '.svg') {
    const t = buf.toString('utf8'); const wv = /<svg[^>]*\swidth="([\d.]+)/.exec(t), hv = /<svg[^>]*\sheight="([\d.]+)/.exec(t), vb = /viewBox="[\d.\s-]*?([\d.]+)[\s,]+([\d.]+)"/.exec(t);
    if (wv && hv) return [Number(wv[1]), Number(hv[1]), 0];
    if (vb) return [Number(vb[1]), Number(vb[2]), 0];
  }
  if (ext === '.png') return [buf.readUInt32BE(16), buf.readUInt32BE(20), 0];
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration', '-of', 'json', file], { encoding: 'utf8' });
  const st = JSON.parse(r.stdout || '{}').streams?.[0];
  if (!st) die(2, `no pude medir el asset: ${file}`);
  return [st.width, st.height, Number(st.duration || 0)];
}

/* ---------- preparación de la composición ---------- */
function stage(params, opts) {
  const efecto = params.efecto;
  const srcDir = path.join(SKILL, 'effects', efecto);
  if (!fs.existsSync(path.join(srcDir, 'index.html'))) die(2, `efecto desconocido: "${efecto}". Disponibles: ${fs.readdirSync(path.join(SKILL, 'effects')).join(', ')}`);
  const marca = opts.marcaDir ? path.resolve(opts.marcaDir) : SKILL;
  const themeFile = path.join(marca, 'themes', `${opts.tema}.css`);
  if (!fs.existsSync(themeFile)) die(2, `tema inexistente: ${themeFile}. Corre sync-brand o revisa "tema".`);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `fx-${efecto}-`));
  const cp = (a, b) => { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.cpSync(a, b, { recursive: true }); };
  cp(path.join(SKILL, 'shared'), path.join(dir, 'shared'));
  cp(path.join(SKILL, 'vendor/gsap'), path.join(dir, 'vendor/gsap'));
  if (fs.existsSync(path.join(marca, 'vendor/fonts'))) cp(path.join(marca, 'vendor/fonts'), path.join(dir, 'vendor/fonts'));
  fs.writeFileSync(path.join(dir, 'theme.css'), fs.readFileSync(themeFile, 'utf8').replaceAll('../vendor/', 'vendor/'));

  const baseDirs = [opts.paramsDir, process.cwd(), SKILL];
  const assets = new Map();
  const walk = (v) => {
    if (typeof v === 'string' && /\.(png|jpe?g|svg|webp|gif|mp4|webm)$/i.test(v)) {
      const cand = path.isAbsolute(v) ? [v] : baseDirs.map((b) => path.resolve(b, v));
      const found = cand.find((c) => fs.existsSync(c));
      if (!found) die(2, `asset no encontrado: ${v} (busqué en ${cand.join(' | ')})`);
      if (!assets.has(found)) assets.set(found, `assets/${String(assets.size).padStart(2, '0')}-${path.basename(found)}`);
      return assets.get(found);
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  const resolved = walk(params);
  for (const [abs, rel] of assets) cp(abs, path.join(dir, rel));
  resolved.__assets = [...assets.values()];
  resolved.__dims = Object.fromEntries([...assets].map(([abs, rel]) => [rel, probeAsset(abs)]));

  const { W, H, isHoriz } = opts.dims;
  let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
  html = html.replace(/(data-composition-id="root"[^>]*?data-duration=")[^"]*(")/, `$1${opts.duracion}$2`);
  html = html.replace(/width=1080,\s*height=1920/, `width=${W}, height=${H}`);
  html = html.replace(/data-width="1080"\s+data-height="1920"/, `data-width="${W}" data-height="${H}"${isHoriz ? ' data-formato="horizontal"' : ''}`);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  fs.writeFileSync(path.join(dir, 'params.js'), `window.__FX_PARAMS__ = ${JSON.stringify(resolved)};\n`);

  const prep = path.join(srcDir, 'prepare.mjs');
  return { dir, prep: fs.existsSync(prep) ? prep : null, resolved };
}

/* ---------- Chrome ---------- */
export function findChrome() {
  const cands = [
    process.env.FX_CHROME,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable'
  ];
  const globRoots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers', path.join(os.homedir(), '.cache/ms-playwright'), path.join(os.homedir(), '.cache/hyperframes/chrome')].filter(Boolean);
  for (const root of globRoots) {
    if (!fs.existsSync(root)) continue;
    const stack = [root]; let depth = 0;
    while (stack.length && depth < 4000) {
      const d = stack.pop(); depth++;
      let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
      for (const e of ents) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) stack.push(p);
        else if (/^(headless_shell|chrome-headless-shell|chrome|chromium)$/.test(e.name)) cands.push(p);
      }
    }
  }
  for (const c of cands) { try { if (c && fs.statSync(c).isFile()) { fs.accessSync(c, fs.constants.X_OK); return c; } } catch { /* siguiente */ } }
  return null;
}

export async function loadPlaywright() {
  for (const spec of [path.join(SKILL, 'node_modules/playwright-core/index.mjs'), 'playwright-core', 'playwright']) {
    try { return await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec); } catch { /* siguiente */ }
  }
  return null;
}

async function openPage(dir, zona, pw, dims) {
  const exe = findChrome();
  if (!exe) throw new Error('no encontré Chromium/Chrome headless (define FX_CHROME=/ruta/al/binario)');
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text'] });
  const ctx = await browser.newContext({ viewport: { width: dims.W, height: dims.H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('request', (r) => { if (!/^(file|data|blob):/.test(r.url())) errs.push(`REQUEST EXTERNO: ${r.url()}`); });
  await page.goto(pathToFileURL(path.join(dir, 'index.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  try { await page.waitForFunction(() => !!(window.__timelines && window.__timelines.root), null, { timeout: 15000, polling: 100 }); }
  catch (e) { await browser.close(); throw new Error(`la composición no registró window.__timelines.root. Errores de página: ${errs.join(' | ') || '(ninguno)'}`); }
  errs.push(...await page.evaluate(() => window.__fxErrors || []));
  return { browser, page, errs };
}
const seek = (page, t) => page.evaluate((tt) => { const tl = window.__timelines.root; tl.pause(); tl.seek(tt, false); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);

/* ---------- auditoría de zonas seguras ---------- */
async function auditar(dir, zona, duracion, pw, dims) {
  const { browser, page, errs } = await openPage(dir, zona, pw, dims);
  const fallas = [];
  try {
    for (const frac of [0.5, 0.97]) {
      await seek(page, duracion * frac);
      const r = await page.evaluate(({ top, bottom, W, H }) => {
        const out = [];
        const walker = document.createTreeWalker(document.getElementById('root'), NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const txt = n.textContent.trim(); if (!txt) continue;
          const e = n.parentElement; const cs = getComputedStyle(e);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          let op = 1; for (let x = e; x && x !== document.body; x = x.parentElement) op *= parseFloat(getComputedStyle(x).opacity);
          if (op < 0.5 || e.closest('[data-fx-skip-audit]')) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const b of rg.getClientRects()) {
            if (b.width < 1) continue;
            if (b.top < top - 14 || b.bottom > H - bottom + 14 || b.left < 20 || b.right > W - 20)
              out.push(`"${txt.slice(0, 40)}" y=${Math.round(b.top)}..${Math.round(b.bottom)} x=${Math.round(b.left)}..${Math.round(b.right)}`);
          }
        }
        return out;
      }, { top: zona.arriba, bottom: zona.abajo, W: dims.W, H: dims.H });
      fallas.push(...r);
    }
  } finally { await browser.close(); }
  return { fallas: [...new Set(fallas)], errs };
}

/* ---------- ruta 2: respaldo ---------- */
async function renderRespaldo(dir, out, zona, duracion, pw, dims) {
  const { browser, page, errs } = await openPage(dir, zona, pw, dims);
  const frames = Math.round(duracion * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-vf', `scale=${dims.W}:${dims.H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => { ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg salió con ${c}`)))); ff.stdin.on('error', () => {}); });
  try {
    for (let f = 0; f < frames; f++) {
      await seek(page, f / FPS);
      const png = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await done;
  } finally { await browser.close(); }
  return errs;
}

/* ---------- ruta 1: HyperFrames ---------- */
function hyperframesBin() {
  const local = path.join(SKILL, 'node_modules/.bin/hyperframes');
  if (fs.existsSync(local)) return [local];
  const which = spawnSync('which', ['hyperframes']);
  if (which.status === 0) return [which.stdout.toString().trim()];
  const probe = spawnSync('npx', ['--no-install', 'hyperframes', '--version'], { encoding: 'utf8' });
  return probe.status === 0 ? ['npx', '--no-install', 'hyperframes'] : null;
}
function renderHyperframes(dir, out, duracion) {
  const bin = hyperframesBin();
  if (!bin) throw new Error('HyperFrames CLI no está instalado (npm install en la skill)');
  const r = spawnSync(bin[0], [...bin.slice(1), 'render', dir, '-o', out, '--fps', String(FPS), '--quality', 'high', '--format', 'mp4', '--workers', '1', '--quiet', '--strict'],
    { encoding: 'utf8', timeout: 20 * 60_000, env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', DO_NOT_TRACK: '1' } });
  if (r.status !== 0) throw new Error(`hyperframes render falló (${r.status}): ${((r.stderr || '') + (r.stdout || '')).replace(/\x1b\[[0-9;]*m/g, '').trim().split('\n').filter(Boolean).slice(-6).join(' | ')}`);
}

function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_frames,duration', '-of', 'json', file], { encoding: 'utf8' });
  return JSON.parse(r.stdout).streams[0];
}

/* ---------- API ---------- */
export async function render(paramsFile, o = {}) {
  const params = Object.assign(JSON.parse(fs.readFileSync(paramsFile, 'utf8')), o.override || {});
  if (!params.efecto) die(2, 'params.json necesita el campo "efecto"');
  if (o.conOverlay) Object.assign(params, { tituloFijo: 'Prueba de overlay', contador: { n: 1, total: 9 } });
  const tema = o.tema ?? params.tema ?? 'ceinca-social';
  const duracion = Number(o.duracion ?? params.duracion ?? 4);
  const dims = dimsForFormato(o.formato ?? params.formato ?? 'vertical');
  const defTop = dims.isHoriz ? 80 : 250;
  const defBottom = dims.isHoriz ? 90 : 350;
  const zona = {
    arriba: Number(o.zonaArriba ?? params.zonaSegura?.arriba ?? defTop),
    abajo: Number(o.zonaAbajo ?? params.zonaSegura?.abajo ?? defBottom)
  };
  params.tema = tema; params.duracion = duracion; params.zonaSegura = zona; params.formato = dims.formato;
  checkLock(o.marcaDir);
  const out = path.resolve(o.salida ?? path.join(SKILL, 'out', `${params.efecto}-${tema}${dims.isHoriz ? '-16x9' : ''}.mp4`));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const st = stage(params, { tema, duracion, dims, marcaDir: o.marcaDir, paramsDir: path.dirname(path.resolve(paramsFile)) });
  const pw = await loadPlaywright();
  if (st.prep) {
    const extra = await (await import(pathToFileURL(st.prep).href)).default({ dir: st.dir, params: st.resolved, duracion, fps: FPS, log });
    Object.assign(st.resolved, extra || {});
    fs.writeFileSync(path.join(st.dir, 'params.js'), `window.__FX_PARAMS__ = ${JSON.stringify(st.resolved)};\n`);
  }

  let aud = null;
  if (pw && !o.sinAuditoria) {
    aud = await auditar(st.dir, zona, duracion, pw, dims);
    if (aud.errs.length) die(4, `errores en la página:\n  ${aud.errs.join('\n  ')}`);
    if (aud.fallas.length) die(5, `texto fuera de zonas seguras (${zona.arriba}px arriba / ${zona.abajo}px abajo en ${dims.W}×${dims.H}):\n  ${aud.fallas.join('\n  ')}`);
  } else if (!pw) log('⚠ playwright-core no disponible: se omite la auditoría de zonas seguras');

  if (o.cuesOut) {
    if (!pw) die(6, '--cues necesita playwright-core');
    const { browser, page, errs } = await openPage(st.dir, zona, pw, dims);
    let raw;
    try {
      raw = await page.evaluate(() => {
        const tl = window.__timelines.root;
        const num = (x) => (typeof x === 'number' ? x : null);
        return tl.getChildren(true, true, false).map((tw) => {
          const tg = tw.targets()[0];
          const dom = !!(tg && tg.nodeType === 1);
          const v = tw.vars || {}; const sa = v.startAt || {};
          return { t: tw.globalTime(0), d: tw.duration(), dom, ease: typeof v.ease === 'string' ? v.ease : '',
            props: Object.keys(v).filter((k) => !['ease', 'duration', 'delay', 'stagger', 'yoyo', 'repeat', 'startAt', 'overwrite', 'transformOrigin', 'immediateRender', 'onComplete', 'onUpdate', 'onStart'].includes(k)),
            from: Object.keys(sa), x0: num(sa.x), y0: num(sa.y), s0: num(sa.scale), o0: num(sa.opacity), s1: num(v.scale), o1: num(v.opacity), x1: num(v.x), y1: num(v.y),
            origin: String(v.transformOrigin || sa.transformOrigin || ''), repeat: num(v.repeat) || 0, stagger: num(v.stagger) || 0,
            id: dom ? (tg.id || tg.className || tg.tagName) : 'proxy' };
        }).concat([{ t: tl.duration(), d: 0, fin: true }]);
      });
    } finally { await browser.close(); }
    if (!o.conservar) fs.rmSync(st.dir, { recursive: true, force: true });
    if (errs.length) die(4, `errores en la página:\n  ${errs.join('\n  ')}`);
    fs.writeFileSync(path.resolve(o.cuesOut), JSON.stringify({ efecto: params.efecto, formato: dims.formato, duracion, tweens: raw }, null, 1));
    return { out: o.cuesOut, ruta: null };
  }
  if (o.frame != null) {
    if (!pw) die(6, '--frame necesita playwright-core');
    const png = path.resolve(o.salida ?? path.join(SKILL, 'out', `${params.efecto}-${tema}-${o.frame}s.png`));
    fs.mkdirSync(path.dirname(png), { recursive: true });
    const { browser, page, errs } = await openPage(st.dir, zona, pw, dims);
    try { await seek(page, Math.min(Number(o.frame), duracion - 1 / FPS)); await page.screenshot({ path: png, type: 'png' }); } finally { await browser.close(); }
    if (!o.conservar) fs.rmSync(st.dir, { recursive: true, force: true });
    if (errs.length) die(4, `errores en la página:\n  ${errs.join('\n  ')}`);
    console.log(JSON.stringify({ efecto: params.efecto, tema, formato: dims.formato, ancho: dims.W, alto: dims.H, frame: Number(o.frame), salida: png }));
    return { out: png, ruta: null };
  }
  if (o.soloAuditoria) {
    if (!aud) die(6, '--solo-auditoria necesita playwright-core');
    if (!o.conservar) fs.rmSync(st.dir, { recursive: true, force: true });
    console.log(JSON.stringify({ efecto: params.efecto, tema, formato: dims.formato, auditoria: 'ok' }));
    return { out: null, ruta: null };
  }
  const motor = o.motor ?? 'auto';
  let ruta = null; let aviso = null;
  if (motor !== 'respaldo') {
    try { fs.rmSync(out, { force: true }); renderHyperframes(st.dir, out, duracion); ruta = 'hyperframes'; }
    catch (e) { if (motor === 'hyperframes') die(6, e.message); aviso = e.message; log(`⚠ HyperFrames no disponible → respaldo. Motivo: ${e.message}`); }
  }
  if (!ruta) {
    if (!pw) die(6, 'sin HyperFrames ni playwright-core no hay forma de renderizar');
    const errs = await renderRespaldo(st.dir, out, zona, duracion, pw, dims);
    if (errs.length) die(4, `errores en la página:\n  ${errs.join('\n  ')}`);
    ruta = 'respaldo';
  }
  if (!o.conservar) fs.rmSync(st.dir, { recursive: true, force: true });
  const s = probe(out);
  console.log(JSON.stringify({ efecto: params.efecto, tema, formato: dims.formato, ruta, aviso, salida: out, ancho: s.width, alto: s.height, fps: s.r_frame_rate, codec: s.codec_name, pix_fmt: s.pix_fmt, frames: s.nb_frames, duracion: s.duration }));
  return { out, ruta };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = argv.find((a) => !a.startsWith('-') && a.endsWith('.json'));
  if (!file || flag('--help')) { usage(); process.exit(file ? 0 : 1); }
  await render(file, {
    salida: opt(['-o', '--salida']), formato: opt(['--formato']), motor: opt(['--motor']), duracion: opt(['--duracion']), tema: opt(['--tema']), marcaDir: opt(['--marca-dir']),
    zonaArriba: opt(['--zona-arriba']), zonaAbajo: opt(['--zona-abajo']), sinAuditoria: flag('--sin-auditoria'), soloAuditoria: flag('--solo-auditoria'), conOverlay: flag('--con-overlay'), frame: opt(['--frame']), conservar: flag('--conservar'),
  });
}
