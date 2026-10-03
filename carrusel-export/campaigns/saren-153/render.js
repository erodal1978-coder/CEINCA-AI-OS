// Carrusel "153 documentos SAREN" — Estilo B (Bold Dark), 6 láminas 1080x1350.
// Uso (desde carrusel-export/): node campaigns/saren-153/render.js [outDir]
// Default outDir: <repo>/out/saren-153/  (PNGs no versionados, ver .gitignore)

import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadFontFaceCSS } from "../../src/fonts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const W = 1080;
const H = 1350;
const TOTAL = 6;
const SOURCE = "Fuente: comunicado MPPRE · 11-06-2026";
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Marca un fragmento del texto con un color de highlight (texto escapado).
const hl = (text, part, cls) => esc(text).replace(esc(part), `<span class="${cls}">${esc(part)}</span>`);

const css = (fontFaceCSS) => `
${fontFaceCSS}
:root { --black:#000; --navy:#0A1C4E; --white:#FFF; --green:#1B7A3D; --gold:#D4A843; --muted:rgba(255,255,255,.72); }
* { box-sizing:border-box; margin:0; padding:0; }
html,body { width:${W}px; height:${H}px; }
body { font-family:'Montserrat',sans-serif; color:var(--white); background:var(--black); -webkit-font-smoothing:antialiased; }
.slide { position:relative; width:${W}px; height:${H}px; padding:88px 80px 84px; display:flex; flex-direction:column; overflow:hidden; }
.slide.navy { background:var(--navy); }
.top { display:flex; justify-content:space-between; align-items:center; font-weight:600; font-size:24px; letter-spacing:.18em; }
.logo { font-weight:900; letter-spacing:.2em; }
.logo .dot { color:var(--gold); }
.count { color:var(--muted); letter-spacing:.12em; }
.body { flex:1; display:flex; flex-direction:column; justify-content:center; }
.foot { height:30px; font-weight:600; font-size:24px; color:var(--muted); letter-spacing:.04em; display:flex; justify-content:space-between; align-items:center; }
.foot .rule { width:64px; height:6px; background:var(--gold); }
h1, .big { font-weight:900; text-transform:uppercase; letter-spacing:-0.03em; line-height:.95; }
.green { color:var(--green); }
.gold { color:var(--gold); }

/* L1 */
.n153 { font-size:400px; line-height:.8; letter-spacing:-0.06em; margin-left:-14px; }
.l1a { font-size:78px; margin-top:28px; }
.l1b { font-size:58px; margin-top:56px; line-height:1; }
.l1c { font-size:112px; margin-top:6px; }
.sub { font-weight:600; font-size:36px; color:var(--muted); margin-top:44px; line-height:1.3; }

/* L2-L5 */
.title { font-size:104px; }
.title.sm { font-size:88px; }
.bar { width:96px; height:10px; background:var(--gold); margin:44px 0 40px; }
.list { list-style:none; }
.list li { display:flex; gap:28px; align-items:baseline; font-weight:600; font-size:38px; line-height:1.28; padding:24px 0; border-top:2px solid rgba(255,255,255,.14); }
.list li:last-child { border-bottom:2px solid rgba(255,255,255,.14); }
.list .idx { font-weight:900; color:var(--gold); font-size:34px; min-width:52px; letter-spacing:-0.02em; }
.list.lg li { font-size:42px; padding:30px 0; }

/* L6 */
.ctb { display:flex; flex-direction:column; gap:52px; }
.verb { font-size:84px; }
.ctb p { font-weight:600; font-size:38px; line-height:1.3; margin-top:12px; }
.cachapa { font-size:168px; color:var(--gold); letter-spacing:-0.04em; line-height:.9; margin-top:12px; }
`;

const top = (n) => `<div class="top"><span class="logo">CEINCA<span class="dot">.</span></span><span class="count">${String(n).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}</span></div>`;
const foot = (text) => `<div class="foot"><span>${esc(text)}</span><span class="rule"></span></div>`;
const list = (items, cls = "") =>
  `<ul class="list ${cls}">${items.map((t, i) => `<li><span class="idx">${String(i + 1).padStart(2, "0")}</span><span>${esc(t)}</span></li>`).join("")}</ul>`;

const listSlide = (n, title, accent, items, small = false) => `
<div class="slide">${top(n)}<div class="body">
  <h1 class="title ${small ? "sm" : ""}">${hl(title, accent, "green")}</h1>
  <div class="bar"></div>${list(items)}
</div>${foot(SOURCE)}</div>`;

const SLIDES = [
  `<div class="slide">${top(1)}<div class="body">
    <div class="big n153 gold">153</div>
    <div class="big l1a">TIPOS DE DOCUMENTOS<br>DEL SAREN</div>
    <div class="big l1b">YA SE LEGALIZAN<br>Y APOSTILLAN</div>
    <div class="big l1c green">100% EN LÍNEA</div>
    <div class="sub">Revisa si el tuyo está en la lista</div>
  </div>${foot("Desliza →")}</div>`,

  `<div class="slide">${top(2)}<div class="body">
    <h1 class="title">YA NO TE<br>ATIENDEN EN<br><span class="green">TAQUILLA</span></h1>
    <div class="bar"></div>
    ${list([
      "Desde el 11 de junio de 2026, la legalización y la apostilla de estos documentos son solo electrónicas.",
      "Las citas presenciales del SLAE para ellos quedaron sin efecto.",
      "Lo que no es competencia del SAREN sigue siendo presencial.",
    ], "lg")}
  </div><div class="foot"><span></span><span class="rule"></span></div></div>`,

  listSlide(3, "EMPRESAS Y ONG", "ONG", [
    "Actas constitutivas y de asamblea de sociedades mercantiles",
    "Expedientes de sociedades mercantiles",
    "Certificación de estados financieros",
    "Actas constitutivas y de asamblea de ONG",
    "Copias certificadas de actas (asociaciones, sociedades, fundaciones)",
  ]),

  listSlide(4, "PERSONAS Y FAMILIA", "FAMILIA", [
    "Actas de nacimiento, matrimonio y defunción, y sus copias certificadas",
    "Constancias de soltería, viudez, residencia y fe de vida",
    "Certificación de nacido vivo",
    "Justificativo de unión estable de hecho",
    "Copia certificada de título universitario (inscrito en Registro Principal)",
  ]),

  listSlide(5, "PODERES, PATRIMONIO Y TRIBUNALES", "TRIBUNALES", [
    "Poderes (notaría, registro público o mercantil)",
    "Autorizaciones de viaje para niños, niñas y adolescentes",
    "Compra-venta de bienes muebles e inmuebles",
    "Sentencias de divorcio",
    "Testamentos y liberación y cancelación de hipotecas",
  ], true),

  `<div class="slide navy">${top(6)}<div class="body ctb">
    <div><div class="big verb">GUARDA</div><p>este carrusel para cuando te pidan apostillar un documento.</p></div>
    <div><div class="big verb">COMPARTE</div><p>con ese familiar o cliente que hoy sigue buscando cita.</p></div>
    <div><div class="big verb">COMENTA</div><div class="big cachapa">CACHAPA</div><p>y te enviamos la lista oficial por categorías.</p></div>
  </div><div class="foot"><span></span><span class="rule"></span></div></div>`,
];

const page = (inner, fontCSS) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${fontCSS}</style></head><body>${inner}</body></html>`;

async function main() {
  const outDir = path.resolve(process.argv[2] || path.join(__dirname, "..", "..", "..", "out", "saren-153"));
  await mkdir(outDir, { recursive: true });
  const styles = css(await loadFontFaceCSS());
  const browser = await chromium.launch(existsSync(SANDBOX_CHROMIUM) ? { executablePath: SANDBOX_CHROMIUM } : {});
  const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

  const files = [];
  for (const [i, inner] of SLIDES.entries()) {
    await tab.setContent(page(inner, styles), { waitUntil: "load" });
    await tab.evaluate(() => document.fonts.ready);
    // QC: ningún bloque de texto puede desbordar el lienzo.
    const overflow = await tab.evaluate(() => {
      const s = document.querySelector(".slide");
      return s.scrollHeight > s.clientHeight || s.scrollWidth > s.clientWidth;
    });
    if (overflow) throw new Error(`Lámina ${i + 1}: el contenido desborda ${W}x${H}`);
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await tab.screenshot({ path: file });
    files.push(file);
    console.log(`✓ ${file}`);
  }

  // Contact sheet 3x2
  const thumbs = await Promise.all(files.map(async (f) => `data:image/png;base64,${(await readFile(f)).toString("base64")}`));
  const tw = 540, th = 675, gap = 24;
  const sw = tw * 3 + gap * 4, sh = th * 2 + gap * 3;
  await tab.setViewportSize({ width: sw, height: sh });
  await tab.setContent(`<!doctype html><html><body style="margin:0;background:#1a1a1a;display:grid;grid-template-columns:repeat(3,${tw}px);gap:${gap}px;padding:${gap}px">${thumbs.map((t) => `<img src="${t}" width="${tw}" height="${th}">`).join("")}</body></html>`, { waitUntil: "load" });
  const sheet = path.join(outDir, "contact-sheet.png");
  await tab.screenshot({ path: sheet });
  console.log(`✓ ${sheet}`);
  await browser.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
