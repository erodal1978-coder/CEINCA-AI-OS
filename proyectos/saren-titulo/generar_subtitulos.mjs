import { chromium } from '/home/eduardo/CEINCA-AI-OS/.claude/skills/ceinca-video-fx/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const FONTS = '/home/eduardo/CEINCA-AI-OS/.claude/skills/ceinca-video-fx/vendor/fonts';
const CHROME = '/home/eduardo/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT_DIR = '/tmp/saren/subtitulos';
fs.mkdirSync(OUT_DIR, { recursive: true });

const frases = [
  {
    id: 'sub_01',
    desde: 0.0,
    hasta: 4.8,
    html: `Si tienes un <span class="gold">título universitario</span> y necesitas <span class="gold">legalizarlo</span> ante el <span class="gold">SAREN</span>,`
  },
  {
    id: 'sub_02',
    desde: 4.9,
    hasta: 7.7,
    html: `el trámite es <span class="gold">100% en línea</span>.`
  },
  {
    id: 'sub_03',
    desde: 8.0,
    hasta: 10.5,
    html: `Ingresas al <span class="gold">portal oficial del SAREN</span>,`
  },
  {
    id: 'sub_04',
    desde: 10.6,
    hasta: 15.6,
    html: `seleccionas <span class="gold">Registro Principal</span> y marcas <span class="gold">Copias Certificadas</span>.`
  },
  {
    id: 'sub_05',
    desde: 16.0,
    hasta: 20.3,
    html: `Cargas los <span class="gold">datos de tu universidad</span>,`
  },
  {
    id: 'sub_06',
    desde: 20.4,
    hasta: 23.6,
    html: `adjuntas el <span class="gold">título en PDF</span> y el sistema valida los requisitos.`
  },
  {
    id: 'sub_07',
    desde: 24.0,
    hasta: 27.2,
    html: `El sistema genera tu <span class="gold">planilla PUB</span>.`
  },
  {
    id: 'sub_08',
    desde: 27.3,
    hasta: 31.6,
    html: `Pagas la <span class="gold">tasa oficial en línea</span> y esperas <span class="gold">3 a 5 días</span>.`
  },
  {
    id: 'sub_09',
    desde: 32.0,
    hasta: 35.6,
    html: `Comenta la palabra <span class="gold-badge">CORONAR</span> 👇`
  },
  {
    id: 'sub_10',
    desde: 35.7,
    hasta: 39.7,
    html: `y te enviamos al privado la <span class="gold">guía oficial paso a paso</span>.`
  }
];

const css = `
@font-face {
  font-family: 'Manrope';
  font-weight: 700;
  src: url('file://${FONTS}/manrope-latin-700-normal.woff2');
}
@font-face {
  font-family: 'Manrope';
  font-weight: 800;
  src: url('file://${FONTS}/manrope-latin-800-normal.woff2');
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 1080px;
  height: 1920px;
  background: transparent;
  overflow: hidden;
  font-family: 'Manrope', sans-serif;
}
.sub-container {
  position: absolute;
  left: 60px;
  top: 915px;
  width: 960px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 30px;
}
.sub-pill {
  background: rgba(18, 42, 99, 0.92);
  border: 1.5px solid rgba(200, 169, 81, 0.45);
  border-radius: 20px;
  padding: 14px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}
.sub-text {
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.gold {
  color: #C8A951;
  font-weight: 800;
}
.gold-badge {
  background: #C8A951;
  color: #122A63;
  padding: 4px 16px;
  border-radius: 10px;
  font-weight: 800;
  display: inline-block;
  letter-spacing: 0.03em;
}
`;

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

for (const f of frases) {
  const htmlContent = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body>
  <div class="sub-container">
    <div class="sub-pill">
      <div class="sub-text">${f.html}</div>
    </div>
  </div>
</body>
</html>`;

  const htmlPath = path.join(OUT_DIR, `${f.id}.html`);
  fs.writeFileSync(htmlPath, htmlContent);
  await page.goto(`file://${htmlPath}`);
  await page.evaluate(() => document.fonts.ready);
  const pngPath = path.join(OUT_DIR, `${f.id}.png`);
  await page.screenshot({ path: pngPath, omitBackground: true });
  console.log(`Generated: ${pngPath}`);
}

await browser.close();

// Guardar metadata de tiempos para ffmpeg
fs.writeFileSync(path.join(OUT_DIR, 'tiempos.json'), JSON.stringify(frases, null, 2));
console.log('Todos los subtítulos generados con éxito.');
