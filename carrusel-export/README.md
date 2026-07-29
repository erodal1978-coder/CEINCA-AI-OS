# carrusel-export

Export automático a PNG del sistema de carruseles CEINCA (formato "paso a paso").
Carpeta aislada — Node + Playwright, sin relación con `ig-viral-tracker/frontend`
ni `ig-viral-tracker/backend`.

Fuente de verdad del diseño: `SKILLS/ceinca-design/references/components.md` +
`carrusel-paso-a-paso-unificado.md` + `SKILLS/ceinca-design/SKILL.md` (dimensiones).
Si el sistema de diseño cambia ahí, hay que reflejarlo en `src/template.js`.

## Uso

```bash
npm install
node src/render.js input/example-paso-a-paso.json
```

Genera PNGs a 1080×1440 (3:4) en `output/<carouselId>/`, numerados
(`01-portada.png`, `02-paso-1.png`, ..., `NN-cierre.png`).

## Formato de input (JSON)

El texto de cada lámina se inyecta por código desde este JSON — nunca se
genera dentro de la imagen. Lo produce `ceinca-ia` u otra fuente; ver
`input/example-paso-a-paso.json` para un ejemplo completo.

```jsonc
{
  "carouselId": "mi-carrusel",
  "footer": { "logo": "CEINCA", "sub": "Mercantil + IA", "handle": "@ceinca.mercantil" },
  "slides": [
    {
      "type": "cover", // o "close"
      "kicker": "DIPLOMADO AJ",
      "headline": { "lines": ["LÍNEA 1", "LÍNEA ACENTO", "LÍNEA 3"], "accentLineIndex": 1 },
      "subhead": "Texto de apoyo bajo el headline.",
      "cta": { "text": "Escribe PALABRA por DM", "keyword": "PALABRA" } // opcional
    },
    {
      "type": "step",
      "stepNumber": 1,
      "stepTotal": 3,
      "background": "navy", // o "light" — alternar para romper monotonía
      "kicker": "PASO 1",
      "headline": { "lines": ["LÍNEA NORMAL", "Línea Acento"], "accentLineIndex": 1 },
      "bullets": ["Máximo 3 bullets", "Una acción por bullet", "..."],
      "highlight": "La frase de mayor impacto del paso (máx. 2 líneas)."
    }
  ]
}
```

Todo el texto se escapa antes de insertarse en el HTML (`src/template.js` → `esc()`).
No se acepta HTML crudo desde el JSON.

## Fuentes

Montserrat (400/600/700/800/900) va empaquetada localmente en `assets/fonts/*.woff2`
e inyectada como `@font-face` con `data:` URIs (`src/fonts.js`) — el export no
depende de red. Esto fue necesario porque en el sandbox de desarrollo, Chromium
no lograba completar la conexión a `fonts.googleapis.com` a través del proxy de
salida (`net::ERR_CONNECTION_RESET`), aunque `curl` sí podía. Si en algún momento
cambian los pesos tipográficos usados en `components.md`, hay que volver a
descargar los `.woff2` correspondientes y actualizar `WEIGHTS` en `src/fonts.js`.

## Notas

- Viewport de render: 432×576 (deviceScaleFactor 2.5) = salida real 1080×1440,
  igual a `SKILL.md` → "Carrusel Instagram (formato principal)".
- Zona segura de recorte (45px top/bottom a 1080×1440): ya respetada por el
  padding del `.slide` (36px arriba, 28px abajo) + el layout centrado del
  `slide-body`; no hace falta lógica extra en el export.
- Solo implementa el formato "paso a paso" (`type: cover | step | close`). El
  formato de alerta/urgencia de 5 láminas (`components.md` sección 1 original)
  no está cubierto todavía.
