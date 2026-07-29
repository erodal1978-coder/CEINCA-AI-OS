// Export automático a PNG del sistema de carruseles CEINCA.
// Uso: node src/render.js <input.json> [outputDir]
//
// El input es un JSON de copy (ver input/example-paso-a-paso.json) —
// el texto de cada lámina se inyecta acá por código. Este script nunca
// genera texto: solo toma el JSON ya escrito (por ceinca-ia u otra fuente)
// y lo vuelca al HTML/CSS del sistema de diseño CEINCA.

import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSlidePage, CANVAS } from "./template.js";
import { loadFontFaceCSS } from "./fonts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// En este entorno sandboxeado, Playwright no siempre encuentra el Chromium
// pre-instalado en /opt/pw-browsers vía su detección automática (mismatch de
// revisión). Si existe ese path, se usa explícito; si no, se usa el default
// de Playwright (útil fuera de este sandbox).
const SANDBOX_CHROMIUM = "/opt/pw-browsers/chromium";

function slideOutputName(slide, index) {
  const n = String(index + 1).padStart(2, "0");
  if (slide.type === "cover") return `${n}-portada.png`;
  if (slide.type === "close") return `${n}-cierre.png`;
  return `${n}-paso-${slide.stepNumber}.png`;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Uso: node src/render.js <input.json> [outputDir]");
    process.exit(1);
  }

  const raw = await readFile(path.resolve(inputPath), "utf-8");
  const data = JSON.parse(raw);

  if (!data.carouselId || !Array.isArray(data.slides) || !data.footer) {
    throw new Error(
      "El JSON debe tener carouselId (string), footer (object) y slides (array)."
    );
  }

  const outDir = path.resolve(
    process.argv[3] || path.join(__dirname, "..", "output", data.carouselId)
  );
  await mkdir(outDir, { recursive: true });

  const { existsSync } = await import("node:fs");
  const launchOptions = existsSync(SANDBOX_CHROMIUM)
    ? { executablePath: SANDBOX_CHROMIUM }
    : {};

  const fontFaceCSS = await loadFontFaceCSS();
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({
    viewport: { width: CANVAS.previewWidth, height: CANVAS.previewHeight },
    deviceScaleFactor: CANVAS.deviceScaleFactor,
  });

  for (const [index, slide] of data.slides.entries()) {
    const html = buildSlidePage(slide, data.footer, fontFaceCSS);
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const outPath = path.join(outDir, slideOutputName(slide, index));
    await page.screenshot({ path: outPath });
    console.log(`✓ ${path.relative(process.cwd(), outPath)}`);
  }

  await browser.close();
  console.log(
    `\n${data.slides.length} láminas exportadas a 1080x1440 en ${path.relative(
      process.cwd(),
      outDir
    )}/`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
