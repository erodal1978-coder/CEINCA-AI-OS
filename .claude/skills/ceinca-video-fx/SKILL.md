---
name: ceinca-video-fx
description: >
  Efectos de video CEINCA™ en dos bloques. Bloque 1 — 11 efectos de motion
  graphics como plantillas HTML + GSAP que se renderizan a MP4 vertical
  (1080×1920, 30 fps, H.264): muro de titulares, checklist, gráfica que crece,
  texto cristal, portada, teléfono, mundo-app 3D, órbita, garabato vivo, muro
  de videos y vértigo simulado (dolly zoom). Bloque 2 — 3 efectos de zoom FFmpeg
  sobre un clip grabado por el usuario: zoom digital (acercamiento continuo),
  zoom de corte (saltos instantáneos entre planos) y zoom hacia atrás (pull-back).
  Activa cuando el usuario pida "efecto de video", "motion graphics",
  "animación para Reel/Story", "que se dibuje el check", "gráfica animada",
  "titulares que aparecen", "mockup de teléfono animado", "zoom vértigo",
  "garabato/flecha dibujada", "reel de efectos", "video-fx",
  "zoom digital", "zoom de corte", "punch-in", "zoom hacia atrás",
  "acercamiento suave a mi clip", o mencione cualquiera de los ids de efecto.
  Los colores y tipografías del Bloque 1 salen del manual de marca (ceinca-design)
  vía sync-brand. Los efectos del Bloque 2 no dependen de la marca.
---

# ceinca-video-fx — Bloque 1 (11 efectos de solo código)

Cada efecto es una plantilla HTML + GSAP (`effects/<id>/index.html`) que recibe un `params.json` y se renderiza a MP4.
Sin CDN, sin APIs ni servicios pagos: GSAP, fuentes y plantillas viajan dentro de la skill.

## Uso rápido

```bash
cd .claude/skills/ceinca-video-fx
npm install                                   # solo la primera vez (hyperframes, playwright-core)
node scripts/render.mjs examples/checklist.json -o out/checklist.mp4
node scripts/render.mjs examples/checklist.json --tema ceinca-guias -o out/checklist-guias.mp4
node scripts/reel.mjs examples/reel-bloque1.json -o examples/reel-bloque1.mp4   # 11 efectos + contador NN/TT
bash scripts/check.sh video out/checklist.mp4 4 out/frames/checklist.png        # ffprobe + PNG del frame central
bash scripts/check.sh                          # marca desacoplada, sin URLs externas, estructura
```

`params.json` es plano: `{ "efecto": "<id>", "tema": "ceinca-social", "duracion": 4, ...parámetros del efecto }`.
Las rutas de imágenes/videos se resuelven relativas al `params.json` (también al cwd y a la skill) y se empaquetan solas.

### Parámetros globales (todos los efectos)
| Parámetro | Default | Qué hace |
|---|---|---|
| `tema` | `ceinca-social` | `ceinca-social`, `ceinca-guias` o `cliente-<nombre>` (ver Marca) |
| `duracion` | `4` | segundos por efecto |
| `zonaSegura` | `{ "arriba": 250, "abajo": 350 }` | px libres de texto clave arriba/abajo |
| `contador` | — | overlay `NN/TT`: `{ "n": 3, "total": 11 }` o texto `"03/11"` |
| `tituloFijo` | — | overlay de título fijo superior (p. ej. `"11 efectos de video"`) |
| `semilla` | `1` | semilla del único azar permitido (temblor del garabato) |

El texto admite `**acento**` para resaltar con el color de acento del tema.

## Catálogo

| id | Comportamiento | Parámetros |
|---|---|---|
| `muro-titulares` | Cuadrícula de tarjetas que entran escalonadas; la cámara empuja hacia la destacada | `titulares[]` (string u `{fuente,titulo}`), `destacado` (índice base 0 o texto exacto) |
| `checklist` | Ítems aparecen y se marcan con un check de acento dibujado por trazo | `titulo`, `items[]` |
| `grafica-crece` | Barras o línea que crecen desde los datos + contador numérico sincronizado | `tipo` (`barras`\|`linea`), `datos[]`, `etiquetas[]`, `prefijo`, `sufijo`, `titulo`, `contadorDe` (`ultimo`\|`maximo`\|`total`) |
| `texto-cristal` | Panel glassmorphism (`backdrop-filter`) sobre imagen de fondo, entrada deslizante | `texto`, `fondo` |
| `portada` | Kicker + titular grande con revelado por máscara | `kicker`, `titular`, `subtitulo` |
| `telefono` | Mockup genérico en CSS (sin marcas) con scroll de captura e inclinación 3D | `pantalla` (imagen alta), `scroll` (0–1) |
| `mundo-app` | Tarjetas/íconos de UI en anillo 3D CSS alrededor de un centro, siempre de frente | `elementos[]` (`{titulo,icono,valor}`), `centro` (texto o imagen) |
| `orbita` | Satélites orbitando un elemento central | `centro`, `satelites[]` (string u `{imagen\|icono,etiqueta}`), `vueltas` |
| `garabato-vivo` | Trazos a mano alzada (flecha, círculo, subrayado, tachado) dibujados con `stroke-dashoffset` | `base` (imagen o texto), `trazos[]` (`{tipo,x,y,w,h,color,inicio,duracion}`; x,y,w,h en % de la base; color: `accent`\|`text`\|`danger`\|`ok`) |
| `muro-videos` | Cuadrícula de clips y zoom final a uno | `clips[]` (mp4), `destacado`, `inicio[]` (segundo inicial por clip) |
| `vertigo-simulado` | Dolly zoom: el fondo se expande (la periferia más que el centro) mientras el primer plano mantiene su tamaño | `fondo`, `frente` (PNG/SVG con alfa o texto), `intensidad` |

Íconos disponibles para `mundo-app`/`orbita`: `doc check shield chart bell chat user lock star coin clock mail pin building`.
Un `params.example.json` por efecto vive en `effects/<id>/`; versiones listas para correr en `examples/<id>.json`.

## Marca desacoplada (regla de oro)

- **Fuente única de verdad:** `../ceinca-design/references/tokens.md` (modo Social/Redes: colores, `--font-main`, pesos, radios, sombras, gradientes) y `../ceinca-design/references/editorial-guides.md` (modo Guías: paleta y tipografía principal). Esta skill **no copia ni fija** valores de marca.
- `scripts/sync-brand.mjs` los lee y genera `themes/ceinca-social.css` y `themes/ceinca-guias.css` con variables semánticas `--fx-*` (`--fx-bg`, `--fx-surface`, `--fx-text`, `--fx-accent`, `--fx-font-display`, `--fx-font-body`…) y vendoriza las fuentes desde `@fontsource/<familia>` a `vendor/fonts/`. Si la familia no existe en fontsource (o no trae el peso pedido) **falla con error claro**: nunca sustituye en silencio.
- `themes/brand.lock.json` guarda el hash del/los archivo(s) de tokens, la fecha y las familias. `render.mjs` compara el hash con el manual actual cuando el repo está presente y, si cambió, se detiene y pide correr `sync-brand`.
- Las plantillas en `effects/` y `shared/` **solo** usan `var(--fx-*)`. `bash scripts/check.sh` falla si encuentra hex/rgb/hsl/nombres de color literales, `font-family` que no sea `var(--fx-font-*)`, el nombre de una familia del lock o cualquier URL externa.
- **Clientes:** `themes/clientes/<cliente>.json` con el mismo esquema semántico (`colores.{bg,bg2,surface,surface2,text,textMuted,accent,accent2,accentDark,onAccent,line,danger,ok}`, `fuentes.{display,body}.{familia,pesos}`, `forma.{radius,radiusLg}`); `sync-brand` los procesa a `themes/cliente-<cliente>.css`. Uso: `"tema": "cliente-<cliente>"`.
- Pruebas de marca alterna: `node scripts/sync-brand.mjs --tokens <md> --guias ninguno --out <dir>` genera un tema fuera de la skill (sin tocar el lock) y `render.mjs --marca-dir <dir>` lo usa.

### Cuando cambie el manual de marca
1. `cd .claude/skills/ceinca-video-fx && npm run sync-brand`
2. `bash scripts/check.sh` y revisar un render de cada tema.
3. **Commitear** `themes/` y `vendor/fonts/`.
4. **Volver a generar el zip** (`npm run zip` → `dist/ceinca-video-fx.zip`) y subirlo de nuevo a claude.ai.
   La copia subida al chat es una **instantánea**: no se actualiza sola.

## Motor de render (documentado, no asumir)

1. **HyperFrames** (`npx hyperframes render`, v0.8.173). Contrato real usado: raíz `data-composition-id="root"` con `data-width/height/duration`, timeline GSAP **pausado** registrado inline en `window.__timelines["root"]`, `--strict` (lint sin errores). Telemetría desactivada (`HYPERFRAMES_NO_TELEMETRY=1`).
2. **Respaldo** (`--motor respaldo`, también automático si HyperFrames falla o no está): el mismo timeline, `seek` frame a frame, captura con Playwright (Chromium headless) y unión con FFmpeg. Mismos parámetros de salida.

`render.mjs` imprime en su JSON final `"ruta": "hyperframes" | "respaldo"`. `--motor auto` (default) prueba HyperFrames y cae al respaldo con aviso.
Salida fija: 1080×1920, 30 fps, H.264, yuv420p. Animación determinista: sin azar sin semilla ni reloj real; el mismo JSON da el mismo video.

### Requisitos
- Claude Code (terminal/web): Node ≥ 22, FFmpeg, Chromium (el de Playwright sirve; si no lo encuentra, `FX_CHROME=/ruta/al/binario`), `npm install` una vez.
- claude.ai (skill subida como zip): el zip trae plantillas, GSAP, fuentes y temas, **no** `node_modules`. Para renderizar el chat necesita Node, FFmpeg y `playwright-core` + un Chromium; si el sandbox no los tiene o no hay red para `npm install`, usa el zip solo para generar/validar `params.json` y renderiza en Claude Code. Verifica con `node scripts/render.mjs examples/portada.json -o out/p.mp4` antes de prometer un MP4.

## Zonas seguras
Por defecto 250 px arriba y 350 px abajo (configurables). `render.mjs` **audita** el DOM en dos instantes del timeline y falla (código 5) si algún texto visible queda fuera de la zona o del ancho útil. Los overlays (contador/título) viven dentro de la zona segura y empujan el contenido hacia abajo.

## Notas técnicas que importan
- **`muro-videos` extrae los frames con FFmpeg** (`effects/muro-videos/prepare.mjs`) y compone con `<img>`: el Chromium headless usado por Playwright/HyperFrames no incluye el decodificador H.264, así que `<video>` no reproduce. Resultado idéntico en las dos rutas de render.
- Los valores animados por cálculo (contadores, órbita, frames) usan `FX.drive` (`modifiers`), no `onUpdate`, para que rendericen igual aunque el motor haga seek con eventos suprimidos.
- Al escribir plantillas nuevas: no centrar con `transform: translate(-50%,-50%)` un elemento que GSAP también anima (GSAP congela el `translate` en px con el tamaño que tenga al inicializar, y con imágenes aún sin cargar queda mal en una ruta y bien en la otra). Centra con flex y deja a GSAP solo el movimiento.
- Medidas de assets (`FX.dim`) las inyecta `render.mjs` de forma síncrona (la plantilla no espera a `onload`).
- Assets de prueba propios y procedurales (`scripts/make-assets.mjs`): SVG/PNG versionados; los clips mp4 se generan localmente y no se versionan (política de assets del repo).
- No toca `skills-lock.json` (reservado a skills de terceros).

## Estructura
```
ceinca-video-fx/
├─ SKILL.md · package.json
├─ effects/<id>/index.html + params.example.json (+ prepare.mjs en muro-videos)
├─ shared/        base.css (solo --fx-*) · fx.js (runtime: overlays, drive, rich text, íconos)
├─ themes/        ceinca-social.css · ceinca-guias.css · brand.lock.json · clientes/
├─ vendor/        gsap/ (+LICENSE.md) · fonts/ (+ licencia por familia)
├─ scripts/       sync-brand · render · reel · clip · check.sh · build-zip.sh · make-assets
└─ examples/      <id>.json · clip-zoom-*.json · reel-bloque1.json · assets/
```

---

## Bloque 2 — Efectos de zoom sobre clip grabado (FFmpeg)

Tres efectos que se aplican a un **clip mp4/mov grabado por el usuario**. No usan Chromium ni `npm install`: solo `ffmpeg` y `node`.

### Uso rápido

```bash
cd .claude/skills/ceinca-video-fx
node scripts/clip.mjs examples/clip-zoom-digital.json -o out/zoom-digital.mp4
node scripts/clip.mjs examples/clip-zoom-corte.json   -o out/zoom-corte.mp4
node scripts/clip.mjs examples/clip-zoom-atras.json   -o out/zoom-atras.mp4
bash scripts/check.sh clip examples/clip-zoom-digital.json out/zoom-digital.mp4
bash scripts/check.sh video out/zoom-digital.mp4 5 out/frames/dig-mid.png
```

`clip.mjs` imprime en stdout un JSON con: `efecto`, `metodo`, `ancho`, `alto`, `fps`, `codec`, `pix_fmt`, `frames`, `duracion`, `audio` y, si aplica, `aviso`.

### Parámetros globales (los 3 efectos)

| Parámetro | Default | Qué hace |
|---|---|---|
| `clip` | — (obligatorio) | ruta del mp4/mov (relativa al JSON, al cwd o a la skill) |
| `recorte` | clip entero | `{ "desde": s, "hasta": s }` — segmento del clip a procesar |
| `foco` | `{ "x": 0.5, "y": 0.5 }` | punto hacia el que se hace zoom, en fracción 0–1 |
| `audio` | `true` | `false` quita el audio de la salida |

**Validaciones con error explícito (sin corrección silenciosa):** `escala < 1`, `foco` fuera de [0,1], tiempos fuera de la duración del clip, `cortes[]` no ascendente.

**Aviso (no error):** si el zoom máximo supera la resolución nativa del clip, se incluye `aviso` en el JSON de salida.

### Catálogo

| efecto | Comportamiento | Parámetros propios |
|---|---|---|
| `zoom-digital` | Acercamiento continuo hacia `foco` | `escala` (default 1.3), `inicio`, `fin` (s), `curva` (`lineal`\|`suave`\|`salida`; default `suave`). Tras `fin` mantiene la escala final. |
| `zoom-corte` | Saltos instantáneos entre plano abierto y cerrado; simula dos cámaras | `cortes[]` con `{ "t": s, "escala": n, "foco"?: {x,y} }`. Cada corte se mantiene hasta el siguiente. Sin interpolación: el cambio ocurre en un solo frame. `escala: 1` = plano abierto. |
| `zoom-atras` | Empieza cerrado, se abre hasta escala 1 (pull-back) | `escalaInicial` (default 1.4), `inicio`, `fin` (s), `curva` (igual que zoom-digital). Tras `fin` queda en escala 1. |

Un `clip-<efecto>.json` de ejemplo vive en `examples/`.

### Notas técnicas

- **Motor:** `zoompan` de FFmpeg 6.1.1 con supersampleo ×2 lanczos (entrada escalada a 2160×3840 antes del filtro). Factor ×2 elegido sobre ×4 por velocidad; diferencia visual mínima en i5-3570 sin GPU.
- **Determinismo verificado:** `ffmpeg -f framemd5` da hashes idénticos en dos renders del mismo JSON (hash `c46c8e7d3de7ac3df600b10796419366` en las pruebas de referencia de 5s).
- **Encuadre cover:** si el clip no es 9:16, se escala y recorta para cubrir 1080×1920. El parámetro `foco` desplaza el recorte horizontal/vertical.
- **Normalización de fps:** se fuerza `fps=30` antes del `zoompan` — clips a 25 fps salen correctamente a 30 fps sin desfase.
- **zoom-corte** usa `trim+setpts+crop+scale+concat` por segmento (sin `zoompan`) para garantizar que el cambio ocurra en exactamente un frame.
- **Audio:** recompresión AAC 128 kbps. Diferencia de duración audio/video < 0.05s en todas las pruebas (0.0000s en zoom-digital y zoom-corte, 0.015s en zoom-atras).
- **PSNR medido:** en escala constante (z=1, frame 0) → **46.96 dB** (muy por encima del umbral de 30 dB). En puntos de escala intermedia (1.35×, frame 120) → 16.88 dB — valor bajo esperado: `zoompan` y `crop+scale` estático usan interpolaciones distintas. No es un artefacto, es la diferencia entre dos rutas matemáticamente distintas.
- Estos efectos **no** tocan `sync-brand`, `themes/` ni `brand.lock.json`. `check.sh estatico` pasa sin cambios.
- Si cambia el manual de marca, regenera el zip (ver sección Marca desacoplada) — los zooms no dependen de la marca pero el zip los incluye.

### Clips de prueba propios (`make-assets.mjs`)

`npm run make-assets` (o `node scripts/make-assets.mjs`) genera en `examples/assets/clips/` (ignorado por git):

| archivo | descripción |
|---|---|
| `clip-bloque2-v.mp4` | 1080×1920, 30 fps, 5s, con audio (caso nominal) |
| `clip-bloque2-h.mp4` | 1920×1080, 30 fps, 5s, con audio (prueba encuadre cover) |
| `clip-bloque2-25.mp4` | 1080×1920, **25 fps**, 5s, con audio (prueba normalización de fps) |

Los `clip-<efecto>.json` de `examples/` apuntan a `clip-bloque2-v.mp4`. Para probar con un clip real del usuario, pasa la ruta absoluta en el campo `"clip"` — el clip **no** se copia al repo.

### Limitaciones conocidas (bloques siguientes)

- **Overlays contador NN/TT y título fijo sobre el clip:** los overlays de `reel.mjs` viven en la capa HTML del Bloque 1 y no se aplican directamente a un mp4 existente sin un pipeline adicional (ffmpeg `drawtext` o composición con `overlay`). No implementado en Bloque 2.
- Rompe el marco, corta y pega, pantalla verde (recorte de silueta) y subtítulos karaoke con Whisper: reservados para bloques siguientes.
