#!/usr/bin/env node
/**
 * doctor.mjs — Diagnóstico del entorno Linux/macOS para CEINCA Video FX + Editor Architect
 *
 * Uso:
 *   node scripts/doctor.mjs [--json]
 *
 * Verifica:
 *   1. Sistema operativo, arquitectura y espacio libre en disco (≥ 5 GB recomendado)
 *   2. Node.js (≥ 18), npm y git
 *   3. FFmpeg y FFprobe + filtros críticos (loudnorm, ebur128, colorkey, chromakey, zoompan)
 *   4. Navegador headless (Chromium / Chrome / Playwright) para render.mjs y grabar-demo.mjs
 *   5. Python 3 + numpy + sintetizador de SFX (scripts/sfx_synth.py)
 *   6. Herramientas opcionales de flujo (/editar): Whisper local y yt-dlp
 *   7. Integridad de marca desacoplada (themes/brand.lock.json y temas instalados)
 *   8. Auditoría ciega de llaves opcionales en ~/.config/ceinca-editor/.env (o ~/.config/claude-editor/.env)
 *      NUNCA imprime ni expone el valor de ninguna clave secreta.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(__dirname, '..');
const asJson = process.argv.includes('--json');

function run(cmd, args = []) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 8000 });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
  };
}

function findChrome() {
  const envC = process.env.FX_CHROME;
  if (envC && fs.existsSync(envC)) return { path: envC, origen: 'FX_CHROME' };

  const sysCandidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
  ];
  for (const c of sysCandidates) {
    if (fs.existsSync(c)) return { path: c, origen: 'sistema' };
  }

  const home = process.env.HOME || os.homedir();
  const caches = [
    path.join(home, '.cache', 'ms-playwright'),
    '/root/.cache/ms-playwright',
    path.join(home, 'Library', 'Caches', 'ms-playwright'),
  ];
  for (const base of caches) {
    if (!fs.existsSync(base)) continue;
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith('chromium')).sort().reverse();
    for (const d of dirs) {
      for (const rel of [
        'chrome-linux/chrome',
        'chrome-linux64/chrome',
        'chrome-headless-shell-linux64/chrome-headless-shell',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      ]) {
        const p = path.join(base, d, rel);
        if (fs.existsSync(p)) return { path: p, origen: 'ms-playwright' };
      }
    }
  }
  return null;
}

const checks = [];
function addCheck(id, categoria, nombre, estado, detalle, solucion = null) {
  checks.push({ id, categoria, nombre, estado, detalle, ...(solucion ? { solucion } : {}) });
}

// 1. Sistema y Disco
const platform = `${os.type()} ${os.release()} (${process.arch})`;
const isLinux = os.platform() === 'linux';
const isMac = os.platform() === 'darwin';
addCheck(
  'os',
  'Sistema',
  'Sistema operativo',
  isLinux || isMac ? 'ok' : 'aviso',
  platform,
  isLinux || isMac ? null : 'Se recomienda Linux (Debian/Ubuntu/Arch/Fedora) o macOS.'
);

const df = run('df', ['-BM', SKILL_DIR]);
if (df.ok) {
  const lines = df.stdout.split('\n');
  const parts = (lines[1] || '').trim().split(/\s+/);
  const availMB = parseInt((parts[3] || '0').replace('M', ''), 10);
  const availGB = (availMB / 1024).toFixed(1);
  addCheck(
    'disk',
    'Sistema',
    'Espacio libre en disco',
    availMB >= 5000 ? 'ok' : availMB >= 1500 ? 'aviso' : 'error',
    `${availGB} GB disponibles`,
    availMB < 5000 ? 'Se recomiendan al menos 5 GB libres para renders temporales y caché de frames.' : null
  );
}

// 2. Node, npm, git
const nodeVer = process.versions.node;
const nodeMajor = parseInt(nodeVer.split('.')[0], 10);
addCheck(
  'node',
  'Base',
  'Node.js',
  nodeMajor >= 18 ? 'ok' : 'error',
  `v${nodeVer}`,
  nodeMajor < 18 ? 'Instala Node.js >= 18 (recomendado Node 22 o 24 LTS).' : null
);

const gitR = run('git', ['--version']);
addCheck(
  'git',
  'Base',
  'Git',
  gitR.ok ? 'ok' : 'error',
  gitR.ok ? gitR.stdout : 'No encontrado',
  gitR.ok ? null : 'sudo apt install -y git'
);

// 3. FFmpeg, FFprobe y filtros
const ffR = run('ffmpeg', ['-version']);
const fpR = run('ffprobe', ['-version']);
if (ffR.ok && fpR.ok) {
  const firstLine = ffR.stdout.split('\n')[0];
  addCheck('ffmpeg', 'Video/Audio', 'FFmpeg + FFprobe', 'ok', firstLine);

  const fltR = run('ffmpeg', ['-hide_banner', '-filters']);
  const reqFilters = ['loudnorm', 'ebur128', 'colorkey', 'chromakey', 'zoompan'];
  const missingFilters = reqFilters.filter((f) => !fltR.stdout.includes(` ${f} `));
  addCheck(
    'ffmpeg-filters',
    'Video/Audio',
    'Filtros FFmpeg (-16 LUFS, chroma, zoompan)',
    missingFilters.length === 0 ? 'ok' : 'error',
    missingFilters.length === 0
      ? `Todos activos (${reqFilters.join(', ')})`
      : `Faltan: ${missingFilters.join(', ')}`,
    missingFilters.length === 0 ? null : 'Instala el paquete completo de ffmpeg (sudo apt install -y ffmpeg).'
  );
} else {
  addCheck(
    'ffmpeg',
    'Video/Audio',
    'FFmpeg + FFprobe',
    'error',
    'No instalado',
    'sudo apt update && sudo apt install -y ffmpeg'
  );
}

// 4. Chromium + Playwright / Selenium fallback
const chrome = findChrome();
addCheck(
  'chromium',
  'Motor Render',
  'Chromium / Chrome Headless',
  chrome ? 'ok' : 'error',
  chrome ? `${chrome.path} (${chrome.origen})` : 'No se encontró binario de Chromium/Chrome',
  chrome ? null : 'sudo apt install -y chromium   o   npx playwright install chromium'
);

let hasPlaywright = false;
try {
  await import('playwright-core');
  hasPlaywright = true;
} catch {}
const pySel = run('python3', ['-c', 'import selenium; print(selenium.__version__)']);
addCheck(
  'driver-browser',
  'Motor Render',
  'Controlador de navegador (Playwright / CDP)',
  hasPlaywright ? 'ok' : pySel.ok ? 'ok' : 'aviso',
  hasPlaywright
    ? 'playwright-core instalado en node_modules'
    : pySel.ok
    ? `Respaldo Python Selenium v${pySel.stdout} activo (sin node_modules)`
    : 'playwright-core no instalado aún en node_modules',
  hasPlaywright ? null : 'Ejecuta: cd .claude/skills/ceinca-video-fx && npm install'
);

// 5. Python 3 + numpy + sfx_synth.py
const pyNumpy = run('python3', ['-c', 'import numpy; print(numpy.__version__)']);
const sfxPath = path.join(SKILL_DIR, 'scripts', 'sfx_synth.py');
addCheck(
  'sfx-synth',
  'Video/Audio',
  'Sintetizador de SFX (Python 3 + NumPy)',
  pyNumpy.ok && fs.existsSync(sfxPath) ? 'ok' : 'aviso',
  pyNumpy.ok ? `NumPy v${pyNumpy.stdout} + sfx_synth.py listo` : 'Falta python3-numpy',
  pyNumpy.ok ? null : 'sudo apt install -y python3-numpy   o   pip install numpy'
);

// 6. Herramientas de flujo (/editar): Whisper local y yt-dlp
const whisperBin =
  (process.env.EDITOR_WHISPER_BIN && fs.existsSync(process.env.EDITOR_WHISPER_BIN) && process.env.EDITOR_WHISPER_BIN) ||
  (run('which', ['whisper']).ok && run('which', ['whisper']).stdout) ||
  (run('which', ['whisper-ctranslate2']).ok && run('which', ['whisper-ctranslate2']).stdout) ||
  (run('which', ['whisper-cli']).ok && run('which', ['whisper-cli']).stdout) ||
  null;
const pyFasterWhisper = run('python3', ['-c', 'import faster_whisper; print("faster-whisper")']);
addCheck(
  'whisper',
  'Flujo /editar',
  'Transcripción local (Whisper)',
  whisperBin || pyFasterWhisper.ok ? 'ok' : 'aviso',
  whisperBin
    ? `Binario: ${whisperBin}`
    : pyFasterWhisper.ok
    ? 'Módulo Python faster-whisper disponible'
    : 'Opcional (necesario solo para transcribir crudos automáticamente en /editar)',
  whisperBin || pyFasterWhisper.ok
    ? null
    : 'pipx install openai-whisper   o   pip install faster-whisper'
);

const ytdlp = run('which', ['yt-dlp']);
addCheck(
  'yt-dlp',
  'Flujo /editar',
  'Descarga de referencias (yt-dlp)',
  ytdlp.ok ? 'ok' : 'aviso',
  ytdlp.ok ? ytdlp.stdout : 'Opcional (solo si descargas reels de referencia por URL)',
  ytdlp.ok ? null : 'sudo apt install -y yt-dlp   o   pipx install yt-dlp'
);

// 7. Marca desacoplada y formatos (9:16 + 16:9)
const lockPath = path.join(SKILL_DIR, 'themes', 'brand.lock.json');
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const temas = lock.temas || [];
  const missingCss = temas.filter((t) => !fs.existsSync(path.join(SKILL_DIR, 'themes', `${t}.css`)));
  addCheck(
    'brand-lock',
    'Marca y Formatos',
    'Temas registrados en brand.lock.json',
    missingCss.length === 0 ? 'ok' : 'error',
    `${temas.length} temas activos (${temas.join(', ')})`,
    missingCss.length === 0 ? null : `Faltan CSS: ${missingCss.join(', ')}. Ejecuta npm run sync-brand.`
  );
} else {
  addCheck('brand-lock', 'Marca y Formatos', 'brand.lock.json', 'error', 'No existe themes/brand.lock.json');
}

const baseCss = fs.readFileSync(path.join(SKILL_DIR, 'shared', 'base.css'), 'utf8');
const soportaHorizontal = baseCss.includes('data-formato="horizontal"');
addCheck(
  'formatos',
  'Marca y Formatos',
  'Soporte dual 9:16 (Vertical Reels) y 16:9 (Horizontal YouTube)',
  soportaHorizontal ? 'ok' : 'error',
  soportaHorizontal
    ? 'Activo (--formato vertical 1080x1920 | --formato horizontal 1920x1080)'
    : 'Falta soporte horizontal en shared/base.css'
);

// 8. Verificación ciega de .env (NUNCA muestra el valor de las claves)
const home = process.env.HOME || os.homedir();
const envCandidates = [
  path.join(home, '.config', 'ceinca-editor', '.env'),
  path.join(home, '.config', 'claude-editor', '.env'),
];
const envFound = envCandidates.find((p) => fs.existsSync(p));
if (envFound) {
  const raw = fs.readFileSync(envFound, 'utf8');
  const keys = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'APIFY_TOKEN'];
  const statusList = keys.map((k) => {
    const re = new RegExp(`^\\s*${k}\\s*=\\s*(\\S+)`, 'm');
    const m = raw.match(re);
    return `${k}: ${m && m[1].length > 4 ? 'configurada' : 'vacía'}`;
  });
  addCheck(
    'env-keys',
    'Seguridad (.env)',
    'Llaves opcionales (auditoría ciega)',
    'ok',
    `${path.basename(path.dirname(envFound))}/.env (${statusList.join(' · ')})`
  );
} else {
  addCheck(
    'env-keys',
    'Seguridad (.env)',
    'Llaves opcionales (~/.config/ceinca-editor/.env)',
    'ok',
    'Sin archivo .env (100% local, no se requieren APIs externas para renderizar ni editar)'
  );
}

const resumen = {
  ok: checks.filter((c) => c.estado === 'ok').length,
  avisos: checks.filter((c) => c.estado === 'aviso').length,
  errores: checks.filter((c) => c.estado === 'error').length,
  total: checks.length,
  listoParaRender: checks.filter((c) => c.estado === 'error').length === 0,
};

if (asJson) {
  console.log(JSON.stringify({ resumen, checks }, null, 2));
  process.exit(resumen.errores > 0 ? 1 : 0);
}

console.log('================================================================');
console.log('  CEINCA VIDEO FX · Diagnóstico del Sistema (/doctor en Linux)');
console.log('================================================================\n');

for (const c of checks) {
  const icon = c.estado === 'ok' ? '✓' : c.estado === 'aviso' ? '!' : '✗';
  console.log(`  [${icon}] ${c.categoria.padEnd(16)} · ${c.nombre}: ${c.detalle}`);
  if (c.solucion) {
    console.log(`      ↳ Cómo resolver: ${c.solucion}`);
  }
}

console.log('\n----------------------------------------------------------------');
console.log(
  `  Resumen: ${resumen.ok}/${resumen.total} OK · ${resumen.avisos} avisos opcionales · ${resumen.errores} errores críticos`
);
console.log('----------------------------------------------------------------');
process.exit(resumen.errores > 0 ? 1 : 0);
