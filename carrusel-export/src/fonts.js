// Empaqueta Montserrat como @font-face con data: URIs locales
// (carrusel-export/assets/fonts/*.woff2). Evita depender de fonts.googleapis.com
// en tiempo de render: el Chromium de este sandbox no logra completar la
// conexión TLS a Google Fonts a través del proxy de salida (net::ERR_CONNECTION_RESET
// incluso con el proxy configurado), así que el export queda auto-contenido.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, "..", "assets", "fonts");
const WEIGHTS = [400, 600, 700, 800, 900];

export async function loadFontFaceCSS() {
  const faces = await Promise.all(
    WEIGHTS.map(async (weight) => {
      const bytes = await readFile(path.join(FONTS_DIR, `montserrat-${weight}.woff2`));
      const b64 = bytes.toString("base64");
      return `
  @font-face {
    font-family: 'Montserrat';
    font-style: normal;
    font-weight: ${weight};
    font-display: block;
    src: url(data:font/woff2;base64,${b64}) format('woff2');
  }`;
    })
  );
  return faces.join("\n");
}
