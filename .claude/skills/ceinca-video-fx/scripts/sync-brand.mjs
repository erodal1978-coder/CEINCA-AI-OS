#!/usr/bin/env node
// sync-brand: tokens del manual de marca → temas CSS (--fx-*) + fuentes vendorizadas.
// Única fuente de verdad: ceinca-design/references/tokens.md (modo Social/Redes)
// y editorial-guides.md (modo Guías). Aquí NO se fija ningún valor de marca:
// solo se declara qué token cumple qué rol semántico.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_TOKENS = path.resolve(SKILL, '../ceinca-design/references/tokens.md');
const REPO_GUIAS = path.resolve(SKILL, '../ceinca-design/references/editorial-guides.md');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--help')) {
  console.log(`sync-brand [--tokens <md>] [--guias <md|ninguno>] [--out <dir>] [--clientes <dir>] [--estilos <dir>]
  --tokens    tokens modo Social (default: ${path.relative(process.cwd(), REPO_TOKENS)})
  --guias     editorial-guides modo Guías, o "ninguno" (default: ${path.relative(process.cwd(), REPO_GUIAS)})
  --out       raíz de salida con themes/ y vendor/fonts/ (default: la skill). Con --out distinto
              no se escribe brand.lock.json (es una corrida de prueba).`);
  process.exit(0);
}
const TOKENS = path.resolve(opt('tokens', REPO_TOKENS));
const GUIAS_ARG = opt('guias', REPO_GUIAS);
const GUIAS = GUIAS_ARG === 'ninguno' ? null : path.resolve(GUIAS_ARG);
const OUT = path.resolve(opt('out', SKILL));
const CLIENTES = path.resolve(opt('clientes', path.join(SKILL, 'themes/clientes')));
const ESTILOS = path.resolve(opt('estilos', path.join(SKILL, 'themes/estilos')));
// Rol técnico (bloques de código/consola). No es marca CEINCA: tokens.md no lo define, por eso vive aquí
// como valor por defecto y cualquier tema JSON puede sobrescribirlo con fuentes.mono.
const DEFAULT_MONO = { familia: 'JetBrains Mono', pesos: [400, 700] };
const IS_DEFAULT_OUT = OUT === SKILL;

const fail = (m) => { console.error(`✗ sync-brand: ${m}`); process.exit(1); };
const read = (p) => { if (!fs.existsSync(p)) fail(`no existe el archivo de tokens: ${p}`); return fs.readFileSync(p, 'utf8'); };
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// ---------- utilidades de color (solo derivan sombras/rgb de tokens ya leídos) ----------
const hex2rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h); if (!m) fail(`color no es #RRGGBB: ${h}`); const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbList = (h) => hex2rgb(h).join(', ');

// ---------- lectura Social: bloque :root de tokens.md ----------
function parseRootVars(md) {
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(md);
  if (!block) fail('tokens.md: no encontré el bloque ":root { ... }"');
  const vars = {};
  for (const m of block[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) vars[m[1]] = m[2].trim();
  return vars;
}
const need = (vars, k, src) => { if (!(k in vars)) fail(`${src}: falta el token ${k}`); return vars[k]; };
const firstFamily = (stack) => { const m = /^\s*['"]?([^'",]+)['"]?/.exec(stack); return m[1].trim(); };

function socialTheme(md) {
  const v = parseRootVars(md);
  const t = (k) => need(v, k, 'tokens.md');
  const famMain = firstFamily(t('--font-main'));
  const w = (k) => parseInt(t(k), 10);
  return {
    nombre: 'ceinca-social',
    colores: {
      bg: t('--navy'), bg2: t('--navy-mid'), surface: t('--navy-mid'), surface2: t('--navy-light'),
      text: t('--white'), textMuted: t('--gray-soft'),
      accent: t('--gold'), accent2: t('--gold-light'), accentDark: t('--gold-dark'),
      onAccent: t('--navy'), line: t('--navy-light'), danger: t('--alert-red'),
      ok: t('--gold'), // tokens.md no define color de éxito: el acento cumple ese rol
    },
    fuentes: {
      display: { familia: famMain, pesos: [w('--fw-extrabold')] },
      body: { familia: famMain, pesos: [w('--fw-regular'), w('--fw-semibold'), w('--fw-bold')] },
    },
    pesos: { display: w('--fw-extrabold'), strong: w('--fw-semibold'), body: w('--fw-regular') },
    gradAccent: t('--grad-gold'), gradBg: t('--grad-navy'),
    radius: t('--radius-lg'), radiusLg: t('--radius-xl'),
    shadowCard: t('--shadow-md'), shadowAccent: t('--shadow-gold'),
  };
}

// ---------- lectura Guías: editorial-guides.md ----------
function guiasTheme(md) {
  const sec = /##\s+Paleta\s+—\s+Modo Guías[\s\S]*?```([\s\S]*?)```/.exec(md);
  if (!sec) fail('editorial-guides.md: no encontré "Paleta — Modo Guías"');
  const pal = {};
  for (const m of sec[1].matchAll(/^\s+([^\s#][^#\n]*?)\s{2,}(#[0-9A-Fa-f]{6})/gm)) pal[m[1].trim()] = m[2];
  const c = (label) => { if (!pal[label]) fail(`editorial-guides.md: falta el color "${label}"`); return pal[label]; };
  const fam = /\*\*Principal:\*\*\s*([A-Za-z0-9 ]+?)\s*[(—]/.exec(md);
  const wts = /\*\*Principal:\*\*[^\n]*pesos\s+([0-9/]+)/.exec(md);
  if (!fam || !wts) fail('editorial-guides.md: no pude leer la tipografía principal y sus pesos');
  const pesos = wts[1].split('/').map(Number);
  const accent = c('Azul CEINCA'), text = c('Gris Oscuro');
  return {
    nombre: 'ceinca-guias',
    colores: {
      bg: c('Azul Muy Claro'), bg2: c('Blanco'), surface: c('Blanco'), surface2: c('Gris Claro'),
      text, textMuted: c('Gris Medio'),
      accent, accent2: c('Azul Claro'), accentDark: c('Azul Oscuro'),
      onAccent: c('Blanco'), line: c('Gris Claro'), danger: c('Error'), ok: c('Éxito'),
    },
    fuentes: {
      display: { familia: fam[1].trim(), pesos: [Math.max(...pesos)] },
      body: { familia: fam[1].trim(), pesos: pesos.filter((p) => p < Math.max(...pesos)) },
    },
    pesos: { display: Math.max(...pesos), strong: pesos.includes(600) ? 600 : pesos[1], body: Math.min(...pesos) },
    derive: true,
    radius: '12px', radiusLg: '20px',
  };
}

// ---------- clientes y estilos: json con el mismo esquema semántico ----------
// Opcionales: fuentes.mono, gradBg, gradAccent, shadowCard, shadowAccent, extraCss (CSS libre del estilo, p. ej. textura de papel).
function temaJson(file, prefijo) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const k of ['bg', 'bg2', 'surface', 'surface2', 'text', 'textMuted', 'accent', 'accent2', 'accentDark', 'onAccent', 'line', 'danger', 'ok'])
    if (!j.colores?.[k]) fail(`${path.basename(file)}: falta colores.${k}`);
  if (!j.fuentes?.display?.familia || !j.fuentes?.body?.familia) fail(`${path.basename(file)}: faltan fuentes.display/body`);
  const wd = Math.max(...j.fuentes.display.pesos), wb = Math.min(...j.fuentes.body.pesos);
  return {
    nombre: `${prefijo}-${path.basename(file, '.json')}`,
    colores: j.colores, fuentes: j.fuentes, derive: true,
    pesos: { display: wd, strong: j.fuentes.body.pesos.find((p) => p > wb) ?? wb, body: wb },
    radius: j.forma?.radius ?? '12px', radiusLg: j.forma?.radiusLg ?? '20px',
    gradBg: j.gradBg, gradAccent: j.gradAccent, shadowCard: j.shadowCard, shadowAccent: j.shadowAccent, extraCss: j.extraCss,
  };
}

// ---------- fuentes: @fontsource/<familia> ----------
const slug = (f) => f.toLowerCase().trim().replace(/\s+/g, '-');
function fontsourceDir(familia) {
  const pkg = `@fontsource/${slug(familia)}`;
  const candidates = [path.join(SKILL, 'node_modules', pkg), path.join(SKILL, '.cache/fontsource/node_modules', pkg)];
  for (const d of candidates) if (fs.existsSync(path.join(d, 'package.json'))) return d;
  const cache = path.join(SKILL, '.cache/fontsource');
  fs.mkdirSync(cache, { recursive: true });
  try {
    execFileSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', '--prefix', cache, pkg], { stdio: 'pipe' });
  } catch (e) {
    const msg = String(e.stderr || e.message);
    if (/404|E404|not found/i.test(msg)) fail(`la familia "${familia}" no existe en fontsource (paquete ${pkg} no encontrado). No se usa fuente de reemplazo: corrige la familia en los tokens.`);
    fail(`no pude instalar ${pkg}: ${msg.split('\n')[0]}`);
  }
  return path.join(cache, 'node_modules', pkg);
}
const fontsVendored = new Map(); // familia → Set(pesos)
function vendorFont(familia, peso) {
  const dir = fontsourceDir(familia);
  const file = `${slug(familia)}-latin-${peso}-normal.woff2`;
  const src = path.join(dir, 'files', file);
  if (!fs.existsSync(src)) fail(`la familia "${familia}" existe en fontsource pero no trae el peso ${peso} (latin, normal). No se sustituye el peso.`);
  const dst = path.join(OUT, 'vendor/fonts', file);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  const lic = path.join(dir, 'LICENSE');
  if (fs.existsSync(lic)) fs.copyFileSync(lic, path.join(OUT, 'vendor/fonts', `${slug(familia)}.LICENSE`));
  if (!fontsVendored.has(familia)) fontsVendored.set(familia, new Set());
  fontsVendored.get(familia).add(peso);
  return file;
}

// ---------- emisión del tema ----------
function emit(th) {
  const faces = [];
  const seen = new Set();
  th.fuentes.mono = th.fuentes.mono ?? DEFAULT_MONO;
  for (const rol of ['display', 'body', 'mono']) {
    for (const p of th.fuentes[rol].pesos) {
      const key = `${th.fuentes[rol].familia}|${p}`;
      if (seen.has(key)) continue; seen.add(key);
      const file = vendorFont(th.fuentes[rol].familia, p);
      faces.push(`@font-face { font-family: '${th.fuentes[rol].familia}'; font-style: normal; font-weight: ${p}; font-display: block; src: url('../vendor/fonts/${file}') format('woff2'); }`);
    }
  }
  const c = th.colores;
  const shadowCard = th.shadowCard ?? `0 4px 24px rgba(${rgbList(c.text)}, 0.18)`;
  const shadowAccent = th.shadowAccent ?? `0 4px 20px rgba(${rgbList(c.accent)}, 0.30)`;
  const gradAccent = th.gradAccent ?? `linear-gradient(135deg, ${c.accent} 0%, ${c.accent2} 100%)`;
  const gradBg = th.gradBg ?? `linear-gradient(180deg, ${c.bg} 0%, ${c.bg2} 100%)`;
  const fam = (r) => `'${th.fuentes[r].familia}', sans-serif`;
  const css = `/* GENERADO por scripts/sync-brand.mjs — no editar a mano. Tema: ${th.nombre} */
${faces.join('\n')}
:root {
  --fx-bg: ${c.bg}; --fx-bg-2: ${c.bg2}; --fx-surface: ${c.surface}; --fx-surface-2: ${c.surface2};
  --fx-text: ${c.text}; --fx-text-muted: ${c.textMuted};
  --fx-accent: ${c.accent}; --fx-accent-2: ${c.accent2}; --fx-accent-dark: ${c.accentDark};
  --fx-on-accent: ${c.onAccent}; --fx-line: ${c.line}; --fx-danger: ${c.danger}; --fx-ok: ${c.ok};
  --fx-bg-rgb: ${rgbList(c.bg)}; --fx-surface-rgb: ${rgbList(c.surface)}; --fx-text-rgb: ${rgbList(c.text)};
  --fx-accent-rgb: ${rgbList(c.accent)}; --fx-line-rgb: ${rgbList(c.line)};
  --fx-font-display: ${fam('display')}; --fx-font-body: ${fam('body')}; --fx-font-mono: ${th.fuentes.mono.familia.includes(',') ? th.fuentes.mono.familia : `'${th.fuentes.mono.familia}', monospace`};
  --fx-fw-display: ${th.pesos.display}; --fx-fw-strong: ${th.pesos.strong}; --fx-fw-body: ${th.pesos.body};
  --fx-grad-accent: ${gradAccent}; --fx-grad-bg: ${gradBg};
  --fx-radius: ${th.radius}; --fx-radius-lg: ${th.radiusLg};
  --fx-shadow-card: ${shadowCard}; --fx-shadow-accent: ${shadowAccent};
}
${th.extraCss ? th.extraCss + '\n' : ''}`;
  fs.mkdirSync(path.join(OUT, 'themes'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'themes', `${th.nombre}.css`), css);
  console.log(`✓ tema ${th.nombre}  (${[...new Set([th.fuentes.display.familia, th.fuentes.body.familia])].join(', ')})`);
}

// ---------- main ----------
const tokensBuf = Buffer.from(read(TOKENS));
const temas = [socialTheme(tokensBuf.toString('utf8'))];
let guiasBuf = null;
if (GUIAS) { guiasBuf = Buffer.from(read(GUIAS)); temas.push(guiasTheme(guiasBuf.toString('utf8'))); }
if (fs.existsSync(CLIENTES)) for (const f of fs.readdirSync(CLIENTES).filter((x) => x.endsWith('.json')).sort()) temas.push(temaJson(path.join(CLIENTES, f), 'cliente'));
if (fs.existsSync(ESTILOS)) for (const f of fs.readdirSync(ESTILOS).filter((x) => x.endsWith('.json')).sort()) temas.push(temaJson(path.join(ESTILOS, f), 'estilo'));
temas.forEach(emit);

if (IS_DEFAULT_OUT) {
  const rel = (p) => path.relative(SKILL, p).split(path.sep).join('/');
  const lock = {
    aviso: 'GENERADO por sync-brand. Si cambia el manual de marca: npm run sync-brand, commitear y regenerar el zip.',
    fecha: new Date().toISOString(),
    tokens: { archivo: rel(TOKENS), sha256: sha(tokensBuf) },
    guias: guiasBuf ? { archivo: rel(GUIAS), sha256: sha(guiasBuf) } : null,
    familias: Object.fromEntries([...fontsVendored].map(([f, s]) => [f, [...s].sort((a, b) => a - b)])),
    temas: temas.map((t) => t.nombre),
  };
  fs.writeFileSync(path.join(SKILL, 'themes/brand.lock.json'), JSON.stringify(lock, null, 2) + '\n');
  console.log('✓ themes/brand.lock.json');
}
