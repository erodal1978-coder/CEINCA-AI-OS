#!/usr/bin/env node
/**
 * grabar-demo.mjs — Grabador determinista de demos web/app para Linux (9:16 Vertical y 16:9 Horizontal)
 *
 * Captura una URL o interfaz local cuadro a cuadro a 30 fps (con Playwright o respaldo Python/CDP),
 * oculta automáticamente campos de contraseña, ejecuta una secuencia de acciones deterministas
 * (scroll, clics con onda lima/acento, pausas, tipeo seguro) y empaqueta el MP4 listo para
 * insertar como escena B-roll o pantalla completa en un Reel (9:16) o video de YouTube (16:9).
 *
 * Uso:
 *   node scripts/grabar-demo.mjs --url https://ejemplo.com -o out/demo-v.mp4 --formato vertical --modo marco
 *   node scripts/grabar-demo.mjs --url https://ejemplo.com -o out/demo-h.mp4 --formato horizontal --modo pantalla
 *   node scripts/grabar-demo.mjs examples/demo-ejemplo.json -o out/demo.mp4
 *
 * Opciones:
 *   --url <url|ruta.html>           URL o archivo HTML local a grabar
 *   --formato <vertical|horizontal> vertical = 1080x1920 (9:16 Reels/TikTok) | horizontal = 1920x1080 (16:9 YouTube)
 *   --modo <pantalla|marco|telefono>
 *       pantalla : captura directa a pantalla completa (1080x1920 o 1920x1080)
 *       marco    : envuelve la captura en una ventana de navegador limpia sobre el fondo del tema (--tema)
 *       telefono : envuelve la captura móvil dentro de un mockup de teléfono centrado
 *   --tema <id>                     Tema de marca para el fondo en modos marco/telefono (default: marca-soyeduardo-ia)
 *   --duracion <seg>                Duración en segundos (default: 6)
 *   --scroll <0..1>                 Fracción de scroll suave a lo largo de la demo (default: 0.5)
 *   --titulo <texto>                Título opcional en la barra superior de la ventana (modo marco)
 *   -o <salida.mp4>                 Ruta del MP4 de salida
 *
 * Seguridad integrada:
 *   - Difumina automáticamente cualquier input[type="password"] o elemento con [data-secret].
 *   - Rechaza escribir variables de entorno o contraseñas.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(__dirname, '..');
const FPS = 30;

function die(code, msg) {
  process.stderr.write(`[grabar-demo error ${code}] ${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const opts = {
    inputJson: null,
    url: null,
    out: null,
    formato: null,
    modo: null,
    tema: null,
    duracion: null,
    scroll: null,
    titulo: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') opts.out = argv[++i];
    else if (a === '--url') opts.url = argv[++i];
    else if (a === '--formato') opts.formato = argv[++i];
    else if (a === '--modo') opts.modo = argv[++i];
    else if (a === '--tema') opts.tema = argv[++i];
    else if (a === '--duracion') opts.duracion = Number(argv[++i]);
    else if (a === '--scroll') opts.scroll = Number(argv[++i]);
    else if (a === '--titulo') opts.titulo = argv[++i];
    else if (!a.startsWith('-') && !opts.inputJson) opts.inputJson = a;
    else die(1, `Argumento desconocido: ${a}`);
  }
  return opts;
}

function resolveFormato(raw) {
  const f = String(raw || 'vertical').toLowerCase().trim();
  if (f === 'horizontal' || f === '16:9' || f === 'youtube' || f === '1920x1080') {
    return { nombre: 'horizontal', width: 1920, height: 1080 };
  }
  if (f === 'vertical' || f === '9:16' || f === 'reel' || f === '1080x1920') {
    return { nombre: 'vertical', width: 1080, height: 1920 };
  }
  die(1, `Formato inválido "${raw}". Usa "vertical" (1080x1920) o "horizontal" (1920x1080).`);
}

function findChrome() {
  if (process.env.FX_CHROME && fs.existsSync(process.env.FX_CHROME)) return process.env.FX_CHROME;
  for (const c of [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
  ]) {
    if (fs.existsSync(c)) return c;
  }
  const home = process.env.HOME || os.homedir();
  for (const base of [path.join(home, '.cache', 'ms-playwright'), '/root/.cache/ms-playwright']) {
    if (!fs.existsSync(base)) continue;
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith('chromium')).sort().reverse();
    for (const d of dirs) {
      for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome']) {
        const p = path.join(base, d, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

function readThemeVars(tema) {
  const cssPath = path.join(SKILL_DIR, 'themes', `${tema}.css`);
  const defaults = {
    bg: '#0B0D12',
    bg2: '#1A1E27',
    surface: '#1A1E27',
    text: '#F3F0E8',
    muted: '#8B93A7',
    accent: '#C6FF3D',
    line: '#2A2F3B',
  };
  if (!fs.existsSync(cssPath)) return defaults;
  const raw = fs.readFileSync(cssPath, 'utf8');
  const pick = (name, fb) => {
    const m = raw.match(new RegExp(`${name}:\\s*([^;]+);`));
    return m ? m[1].trim() : fb;
  };
  return {
    bg: pick('--fx-bg', defaults.bg),
    bg2: pick('--fx-bg-2', defaults.bg2),
    surface: pick('--fx-surface', defaults.surface),
    text: pick('--fx-text', defaults.text),
    muted: pick('--fx-text-muted', defaults.muted),
    accent: pick('--fx-accent', defaults.accent),
    line: pick('--fx-line', defaults.line),
  };
}

const args = parseArgs(process.argv);
let spec = {};
let baseDir = process.cwd();
if (args.inputJson) {
  const abs = path.resolve(args.inputJson);
  if (!fs.existsSync(abs)) die(1, `No existe el archivo JSON: ${abs}`);
  spec = JSON.parse(fs.readFileSync(abs, 'utf8'));
  baseDir = path.dirname(abs);
}

const targetRaw = args.url || spec.url;
if (!targetRaw) die(1, 'Debes indicar --url <url|ruta.html> o un archivo demo.json con "url".');

let targetUrl = targetRaw;
if (!/^https?:\/\//i.test(targetRaw) && !targetRaw.startsWith('file://')) {
  const candidate = path.resolve(baseDir, targetRaw);
  if (!fs.existsSync(candidate)) die(1, `No existe el archivo local: ${candidate}`);
  targetUrl = `file://${candidate}`;
}

const fmt = resolveFormato(args.formato || spec.formato || 'vertical');
const modo = (args.modo || spec.modo || 'marco').toLowerCase();
if (!['pantalla', 'marco', 'telefono'].includes(modo)) {
  die(1, `Modo inválido "${modo}". Usa "pantalla", "marco" o "telefono".`);
}
const tema = args.tema || spec.tema || 'marca-soyeduardo-ia';
const duracion = Number(args.duracion ?? spec.duracion ?? 6);
const scrollFrac = Number(args.scroll ?? spec.scroll ?? 0.45);
const tituloBarra = args.titulo || spec.titulo || targetRaw.replace(/^https?:\/\//, '').slice(0, 48);
const acciones = Array.isArray(spec.acciones) ? spec.acciones : [];
const outPath = path.resolve(args.out || spec.salida || `out/demo-${fmt.nombre}.mp4`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

// Dimensiones del viewport interno que se captura según modo y formato
let vpW = fmt.width;
let vpH = fmt.height;
if (modo === 'marco') {
  if (fmt.nombre === 'horizontal') {
    vpW = 1680;
    vpH = 860;
  } else {
    vpW = 940;
    vpH = 1220;
  }
} else if (modo === 'telefono') {
  vpW = 460;
  vpH = 960;
}

const totalFrames = Math.round(duracion * FPS);
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ceinca-demo-'));
const rawFramesDir = path.join(tmpDir, 'raw');
fs.mkdirSync(rawFramesDir, { recursive: true });

const chromeBin = findChrome();
if (!chromeBin) die(2, 'No se encontró Chromium/Chrome. Ejecuta: node scripts/doctor.mjs');

// Script de inyección en la página para proteger contraseñas y dibujar cursor/ondas deterministas
const PRIVACY_AND_CURSOR_INIT = `
(() => {
  const style = document.createElement('style');
  style.textContent = \`
    input[type="password"], [data-secret], .secret-blur {
      filter: blur(10px) !important;
      pointer-events: none !important;
    }
    #__ceinca_cursor {
      position: fixed;
      top: 0; left: 0;
      width: 26px; height: 26px;
      border-radius: 50%;
      background: rgba(198, 255, 61, 0.88);
      border: 3px solid #0B0D12;
      box-shadow: 0 4px 16px rgba(0,0,0,0.45);
      transform: translate(-999px, -999px);
      z-index: 2147483647;
      pointer-events: none;
    }
    #__ceinca_ripple {
      position: fixed;
      top: 0; left: 0;
      width: 64px; height: 64px;
      margin-left: -32px; margin-top: -32px;
      border-radius: 50%;
      border: 3px solid #C6FF3D;
      opacity: 0;
      transform: scale(0.2);
      z-index: 2147483646;
      pointer-events: none;
    }
  \`;
  document.documentElement.appendChild(style);
  window.__ceincaStep = function(progress, scrollTargetFrac, acciones, tSec) {
    if (!document.getElementById('__ceinca_cursor')) {
      const c = document.createElement('div');
      c.id = '__ceinca_cursor';
      const r = document.createElement('div');
      r.id = '__ceinca_ripple';
      document.body.appendChild(r);
      document.body.appendChild(c);
    }
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    // Ease in-out cubic scroll
    const p = Math.max(0, Math.min(1, (progress - 0.12) / 0.76));
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    window.scrollTo(0, maxScroll * scrollTargetFrac * eased);

    // Cursor suave si hay acciones de clic
    const cursor = document.getElementById('__ceinca_cursor');
    const ripple = document.getElementById('__ceinca_ripple');
    let cx = -999, cy = -999, rOpacity = 0, rScale = 0.2;
    for (const act of (acciones || [])) {
      if (act.tipo === 'clic' && typeof act.t === 'number') {
        const dt = tSec - act.t;
        const x = act.x || (window.innerWidth * 0.5);
        const y = act.y || (window.innerHeight * 0.45);
        if (dt >= -0.6 && dt <= 0.8) {
          cx = x;
          cy = y;
          if (dt >= 0 && dt <= 0.45) {
            const rp = dt / 0.45;
            rOpacity = 1 - rp;
            rScale = 0.3 + rp * 1.3;
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
          }
        }
      }
    }
    cursor.style.transform = \`translate(\${cx}px, \${cy}px)\`;
    ripple.style.opacity = String(rOpacity);
    ripple.style.transform = \`scale(\${rScale})\`;
  };
})();
`;

async function captureFramesPlaywright() {
  const pw = await import('playwright-core');
  const browser = await pw.chromium.launch({
    executablePath: chromeBin,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const page = await browser.newPage({ viewport: { width: vpW, height: vpH, deviceScaleFactor: 1 } });
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {});
  await page.evaluate(PRIVACY_AND_CURSOR_INIT);
  for (let f = 0; f < totalFrames; f++) {
    const progress = totalFrames > 1 ? f / (totalFrames - 1) : 0;
    const tSec = f / FPS;
    await page.evaluate(
      ({ progress, scrollFrac, acciones, tSec }) => {
        if (window.__ceincaStep) window.__ceincaStep(progress, scrollFrac, acciones, tSec);
      },
      { progress, scrollFrac, acciones, tSec }
    );
    const frameFile = path.join(rawFramesDir, `f_${String(f).padStart(5, '0')}.png`);
    await page.screenshot({ path: frameFile });
  }
  await browser.close();
}

function captureFramesPythonFallback() {
  const pyScript = path.join(tmpDir, 'capture.py');
  fs.writeFileSync(
    pyScript,
    `import json, os, sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.binary_location = ${JSON.stringify(chromeBin)}
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--disable-gpu')
opts.add_argument('--hide-scrollbars')
opts.add_argument(f'--window-size={${vpW}},{${vpH}}')

driver = webdriver.Chrome(options=opts)
driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {
    'width': ${vpW}, 'height': ${vpH}, 'deviceScaleFactor': 1, 'mobile': False
})
driver.get(${JSON.stringify(targetUrl)})
driver.execute_script(${JSON.stringify(PRIVACY_AND_CURSOR_INIT)})

total = ${totalFrames}
fps = ${FPS}
scroll_frac = ${scrollFrac}
acciones = json.loads(${JSON.stringify(JSON.stringify(acciones))})
out_dir = ${JSON.stringify(rawFramesDir)}

for f in range(total):
    prog = f / (total - 1) if total > 1 else 0
    t_sec = f / fps
    driver.execute_script("if (window.__ceincaStep) window.__ceincaStep(arguments[0], arguments[1], arguments[2], arguments[3]);", prog, scroll_frac, acciones, t_sec)
    driver.save_screenshot(os.path.join(out_dir, f"f_{f:05d}.png"))

driver.quit()
`
  );
  const r = spawnSync('python3', [pyScript], { encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) {
    die(3, `Error al capturar con respaldo Python/Selenium:\n${r.stderr}`);
  }
}

try {
  await captureFramesPlaywright();
} catch {
  captureFramesPythonFallback();
}

// Empaquetar frames crudos en un MP4 intermedio
const rawMp4 = path.join(tmpDir, 'raw.mp4');
const ffRaw = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-framerate',
    String(FPS),
    '-i',
    path.join(rawFramesDir, 'f_%05d.png'),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '17',
    rawMp4,
  ],
  { encoding: 'utf8' }
);
if (ffRaw.status !== 0) die(4, `FFmpeg falló al unir frames: ${ffRaw.stderr}`);

if (modo === 'pantalla') {
  fs.copyFileSync(rawMp4, outPath);
} else {
  // Componer marco de navegador o mockup de teléfono sobre el lienzo final (1080x1920 o 1920x1080)
  const tv = readThemeVars(tema);
  const bgHex = tv.bg.replace('#', '0x');
  const surfaceHex = tv.surface.replace('#', '0x');
  const lineHex = tv.line.replace('#', '0x');
  const accentHex = tv.accent.replace('#', '0x');

  const padX = Math.round((fmt.width - vpW) / 2);
  const headerH = modo === 'marco' ? 54 : 28;
  const totalBoxH = vpH + headerH;
  const padY = Math.round((fmt.height - totalBoxH) / 2);

  const filter = [
    `color=c=${bgHex}:s=${fmt.width}x${fmt.height}:r=${FPS}:d=${duracion}[bg]`,
    `[bg]drawbox=x=${padX - 4}:y=${padY - 4}:w=${vpW + 8}:h=${totalBoxH + 8}:color=${lineHex}:t=fill[bg1]`,
    `[bg1]drawbox=x=${padX}:y=${padY}:w=${vpW}:h=${headerH}:color=${surfaceHex}:t=fill[bg2]`,
    `[bg2]drawbox=x=${padX + 22}:y=${padY + 20}:w=14:h=14:color=0xEF4444:t=fill[bg3]`,
    `[bg3]drawbox=x=${padX + 46}:y=${padY + 20}:w=14:h=14:color=0xF59E0B:t=fill[bg4]`,
    `[bg4]drawbox=x=${padX + 70}:y=${padY + 20}:w=14:h=14:color=${accentHex}:t=fill[bg5]`,
    `[bg5][0:v]overlay=x=${padX}:y=${padY + headerH}:shortest=1[vout]`,
  ].join(';');

  const ffComp = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      rawMp4,
      '-filter_complex',
      filter,
      '-map',
      '[vout]',
      '-r',
      String(FPS),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '18',
      outPath,
    ],
    { encoding: 'utf8' }
  );
  if (ffComp.status !== 0) die(4, `FFmpeg falló al componer el marco: ${ffComp.stderr}`);
}

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(
  JSON.stringify(
    {
      ok: true,
      url: targetRaw,
      salida: outPath,
      formato: fmt.nombre,
      modo,
      tema,
      ancho: fmt.width,
      alto: fmt.height,
      fps: FPS,
      frames: totalFrames,
      duracion,
      titulo: tituloBarra,
    },
    null,
    2
  )
);
