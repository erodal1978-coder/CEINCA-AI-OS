---
name: ceinca-video-fx
description: >-
  Efectos de video CEINCA™ y @soyeduardo.ia para Reels, TikTok, YouTube y carruseles de Instagram, generados con código (HTML/GSAP + FFmpeg, sin Remotion). 27 plantillas HTML (muro de titulares, checklist, gráfica, teléfono y chat, consola, diagrama de nodos, bento, barra de prompt, catálogo lateral, collage, órbita, rompe marco, corta y pega, karaoke y 2 slides de carrusel) y 7 efectos sobre clip (zoom digital, de corte y atrás, lupa, foco, fragmentos, pantalla verde). Formatos 9:16, 16:9 y carrusel 4:5. 3 estilos (Dark Tech, Red Glow, Ukiyo-e), temas de marca vía sync-brand, split-pip en overlay.mjs, reel-voz.mjs para reels con voz grabada, audio con SFX, doctor y check.sh. Activa con efecto de video, motion graphics, reel, pantalla verde, karaoke, zoom, carrusel animado, slides de video, split-pip o cualquier id de efecto.
---

# ceinca-video-fx — efectos de video por código (Bloques 1-6) · 9:16 · 16:9 · carrusel 4:5

Bloque 1 = 11 efectos HTML/GSAP (esta sección). Bloques 2-3 = zooms sobre clip, chroma, rompe-marco, corta-pega, karaoke y `overlay.mjs`; Bloque 4 = estilos y 7 efectos; Bloque 5 = formato horizontal, grabador de demos y comandos; Bloque 6 = bento, barra de prompt, carrusel blur, catálogo lateral, lupa, foco, fragmentos y split-pip; `reel-voz.mjs` y el módulo Carrusel al final. **Para un reel de demostración elige ~7 de los más vistosos, no todos.**

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
| `tema` | `ceinca-social` | `ceinca-social`, `ceinca-guias`, `marca-<slug>` (p. ej. `marca-soyeduardo-ia`), `cliente-<slug>` o `estilo-<nombre>` (ver Marca) |
| `formato` | `vertical` | `vertical` (alias `reel`, `1080×1920`, 9:16 Reels/TikTok) · `horizontal` (`1920×1080`, 16:9 YouTube) · `carrusel` (`1080×1350`, 4:5; solo slides) |
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
| `rompe-marco` | Sujeto que sobrepasa el borde superior de una tarjeta UI (profundidad 2.5D) | `sujeto`, `titular`, `subtitulo`, `etiqueta` |
| `corta-pega` | Efecto collage / sticker stop-motion con borde blanco y movimiento discontinuo | `sujeto`, `titular`, `subtitulo`, `etiquetas[]` |
| `subtitulos-karaoke` | Subtítulos dinámicos con resaltado sincronizado palabra por palabra | `palabras[]` (`{texto, t}`), `posicion` (`centro`\|`abajo`) |
| `bento-grid` | Cuadrícula Bento de 4 a 6 tarjetas (contador flip 3-2-1-LIVE, anillo de porcentaje, barras que crecen, métrica destacada) | `titulo`, `contador`, `porcentaje`, `barras`, `metrica`, `tarjetaExtra` |
| `barra-prompt` | Píldora de prompt con typewriter, pulsación de botón y tarjeta que emerge con línea dibujada y check | `prompt`, `boton`, `resultado` (`{titulo, pasos[], estadoFinal}`) |
| `carrusel-blur` | Tira horizontal con desplazamiento de alta velocidad con blur dinámico, frenado en seco y tarjeta destacada con check | `titulo`, `tarjetas[]`, `destacado` |
| `catalogo-lateral` | Layout de catálogo con lista lateral numerada cuya píldora activa avanza sincronizada y marco interactivo | `titulo`, `pasos[]` (`{n, titulo, detalle, icono}`) |

Íconos disponibles para `mundo-app`/`orbita`: `doc check shield chart bell chat user lock star coin clock mail pin building`.
Un `params.example.json` por efecto vive en `effects/<id>/`; versiones listas para correr en `examples/<id>.json`.

## Marca desacoplada (regla de oro)

- **Fuente única de verdad:** `../ceinca-design/references/tokens.md` (modo Social/Redes: colores, `--font-main`, pesos, radios, sombras, gradientes) y `../ceinca-design/references/editorial-guides.md` (modo Guías: paleta y tipografía principal). Esta skill **no copia ni fija** valores de marca.
- `scripts/sync-brand.mjs` los lee y genera `themes/ceinca-social.css` y `themes/ceinca-guias.css` con variables semánticas `--fx-*` (`--fx-bg`, `--fx-surface`, `--fx-text`, `--fx-accent`, `--fx-font-display`, `--fx-font-body`…) y vendoriza las fuentes desde `@fontsource/<familia>` a `vendor/fonts/`. Si la familia no existe en fontsource (o no trae el peso pedido) **falla con error claro**: nunca sustituye en silencio.
- `themes/brand.lock.json` guarda el hash del/los archivo(s) de tokens, la fecha y las familias. `render.mjs` compara el hash con el manual actual cuando el repo está presente y, si cambió, se detiene y pide correr `sync-brand`.
- Las plantillas en `effects/` y `shared/` **solo** usan `var(--fx-*)`. `bash scripts/check.sh` falla si encuentra hex/rgb/hsl/nombres de color literales, `font-family` que no sea `var(--fx-font-*)`, el nombre de una familia del lock o cualquier URL externa.
- **Clientes (clientes reales):** `themes/clientes/<cliente>.json` con el mismo esquema semántico (`colores.{bg,bg2,surface,surface2,text,textMuted,accent,accent2,accentDark,onAccent,line,danger,ok}`, `fuentes.{display,body}.{familia,pesos}`, `forma.{radius,radiusLg}`); `sync-brand` los procesa a `themes/cliente-<cliente>.css`. `sync-brand` los procesa a `themes/cliente-<cliente>.css`. Uso: `"tema": "cliente-<cliente>"`.
- **Marcas propias (de Eduardo, no son clientes):** `themes/marcas/<slug>.json` con el mismo esquema; `sync-brand` (flag `--marcas <dir>`, default `themes/marcas`) los procesa a `themes/marca-<slug>.css`. Uso: `"tema": "marca-<slug>"` o `--tema marca-<slug>`. Hoy: `marca-soyeduardo-ia` (@soyeduardo.ia: tinta/lima, Sora 800 + Manrope). `themes/clientes/` queda solo para clientes reales.
- **Estilos (Bloque 4):** `themes/estilos/<estilo>.json`, mismo esquema que los clientes más opcionales `gradBg`, `gradAccent`, `shadowCard`, `shadowAccent`, `extraCss` (CSS libre del estilo, p. ej. textura de papel) y `fuentes.mono`. `sync-brand` los emite como `themes/estilo-<estilo>.css`. Uso: `"tema": "estilo-dark-tech"`. Un estilo **no es la marca CEINCA**: es una paleta/tipografía alterna aplicable a cualquier efecto.
- **Rol `--fx-font-mono`:** rol técnico para consola/código. `tokens.md` no lo define, así que `sync-brand` usa por defecto JetBrains Mono (declarado en `DEFAULT_MONO` dentro del script, no en las plantillas) y cualquier tema JSON lo puede sobrescribir.
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
├─ themes/        ceinca-social.css · ceinca-guias.css · estilo-*.css · marca-*.css · cliente-*.css · brand.lock.json · clientes/ (json de clientes reales) · marcas/ (json de marcas propias) · estilos/
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
| `pantalla-verde` | Chroma key nativo FFmpeg: elimina fondo verde y reemplaza por color/imagen/video | `color` (default `0x00FF00`), `tolerancia`, `suavizado`, `fondo` (`{tipo,valor}`) |
| `lupa-zoom` | Lupa circular que recorre de {x1,y1} a {x2,y2} ampliando el video interno (1.8x) con anillo de acento | `origen` `{x,y}`, `destino` `{x,y}`, `escala` (default 1.8), `radio`, `colorAnillo`, `grosorAnillo` |
| `foco-spotlight` | Oscurece el resto del cuadro y deja un foco circular suave iluminando {foco.x, foco.y} | `foco` `{x,y}`, `radio` (default 260), `oscuridad` |
| `fragmentos-shatter` | Desplazamiento rápido de franjas al inicio del corte que encajan en su sitio en 0.35s | `duracionTransicion` (0.35), `franjas` (6), `desplazamiento` (240) |

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
| `clip-bloque3-verde.mp4` | 1080×1920, 30 fps, 5s, con fondo verde y audio (prueba chroma key) |

Los `clip-<efecto>.json` de `examples/` apuntan a estos clips. Para probar con un clip real del usuario, pasa la ruta absoluta en el campo `"clip"` — el clip **no** se copia al repo.

---

## Bloque 3 — Chroma Key, Siluetas 2.5D, Cutout y Subtítulos Karaoke

Completa los 18 efectos de video con técnicas avanzadas de composición, soporte de chroma key y capas sobrepuestas.

### 1. `pantalla-verde` (Chroma Key nativo con FFmpeg)
Elimina el fondo verde (`0x00FF00` o personalizado) y lo reemplaza por un color de marca (`--fx-bg`), una imagen o un video de fondo.
```bash
node scripts/clip.mjs examples/clip-pantalla-verde.json -o out/pantalla-verde.mp4
```

### 2. `rompe-marco` (Profundidad 2.5D)
Efecto donde el sujeto sobresale por encima del borde superior de una tarjeta o marco UI, mientras la parte inferior se mantiene contenida.
```bash
node scripts/render.mjs examples/rompe-marco.json -o out/rompe-marco.mp4
```

### 3. `corta-pega` (Paper Cutout / Sticker Stop-Motion)
Efecto collage donde el sujeto o elemento adquiere un contorno blanco tipo pegatina y animaciones en saltos discretos (steps estilo stop-motion).
```bash
node scripts/render.mjs examples/corta-pega.json -o out/corta-pega.mp4
```

### 4. `subtitulos-karaoke` (Subtítulos dinámicos sincronizados)
Subtítulos tipográficos de alto impacto donde cada palabra cambia a color de acento (`--fx-accent`) al alcanzar su tiempo `t`.
```bash
node scripts/render.mjs examples/subtitulos-karaoke.json -o out/karaoke.mp4
```

### 5. Composición de Overlays sobre Video (`scripts/overlay.mjs`)
Resuelve la limitación de superponer gráficos, títulos o subtítulos sobre videos grabados del usuario:
```bash
# Superponer subtítulos karaoke sobre un video grabado
node scripts/overlay.mjs --base mi-clip.mp4 --overlay examples/subtitulos-karaoke.json --key 0x122A63 -o out/final.mp4

# Layout Split-PIP (vocero abajo en tarjeta + efecto arriba + subtítulos al centro)
node scripts/overlay.mjs --base vocero.mp4 --overlay examples/bento-grid.json --layout split-pip --tema marca-soyeduardo-ia -o out/split-pip.mp4
```

---

## Bloque 4 — Estilos visuales (Video-as-Code) y 7 efectos nuevos

Origen: especificación "Video-as-Code" (vertical 9:16, 1080×1920, 30 fps, todo definido por código y renderizado cuadro a cuadro, sin editor de línea de tiempo ni modelos de difusión). Este motor ya cumple ese paradigma (HTML/CSS/SVG + GSAP → Chromium headless + FFmpeg), por eso **no hace falta Remotion** ni otro framework: se extendió esta skill en vez de crear otra.

### Concepto: estilo = tema; variación = combinar efecto × tema
Un **estilo** es un tema (`themes/estilos/*.json` → `themes/estilo-*.css`). **Cualquier efecto puede renderizarse en cualquier tema** cambiando solo `"tema"` (o `--tema`). Así un mismo guion produce versiones distintas sin tocar plantillas.

| Estilo | Tema | Look | Fuentes (vendorizadas) |
|---|---|---|---|
| A · Dark Tech UI | `estilo-dark-tech` | carbón con cuadrícula 40 px y brillos radiales de acento terracota | Anton + Poppins |
| B · Red Glow | `estilo-red-glow` | negro con carmesí, tarjetas de cristal | Poppins 800 + Playfair Display |
| C · Ukiyo-e | `estilo-ukiyo-e` | papel de arroz envejecido, textura y marco de pergamino, tintas minerales (bermellón / ocre / índigo / musgo) | Noto Serif |

Los valores de color/fuente de cada estilo viven **solo** en su JSON. Para crear otro estilo: copiar un JSON de `themes/estilos/`, ajustar, `npm run sync-brand`, `bash scripts/check.sh`.
Parámetro opcional `"orbe": true`: orbe difuso del color `--fx-accent-dark` que deriva por el fondo (lo usan los efectos nuevos; pensado para Red Glow).

### Efectos nuevos (`effects/<id>/`, ejemplos en `examples/<id>.json`)

| id | Estilo natural | Comportamiento | Parámetros |
|---|---|---|---|
| `pasos-progreso` | A | Barra de progreso segmentada que se llena por pasos + numeral gigante con contorno | `pasos[]` (`{titulo, detalle}`) |
| `consola-macos` | A | Ventana tipo macOS; los comandos se escriben (typewriter) con cursor parpadeante | `titulo`, `lineas[]` con marca: `$ ` comando · `> ` salida · `+ ` éxito · `! ` error |
| `diagrama-nodos` | A | Nodos conectados con trazos SVG que se dibujan (`stroke-dashoffset`) y un pulso que viaja por cada enlace | `titulo`, `nodos[]` (`{id, etiqueta, icono, x, y}` en %), `enlaces[]` (pares de ids; si falta se encadenan) |
| `zoom-atraves` | B | Transición "zoom-through": anillos concéntricos escalan masivamente y revelan la escena B | `a`/`b` = `{kicker, titular}` |
| `telefono-chat` | B | Teléfono 3D con burbujas de chat secuenciales y "escribiendo…" | `nombre`, `mensajes[]` (`{de: "yo"\|"ceinca", texto}`) — máx. ~6 cortos; si no caben **falla a propósito** |
| `collage-papel` | C | Piezas de papel rasgado con medios tonos, entrada stop-motion (pasos) y vibración a 6 cuadros/seg | `kicker`, `titular`, `subtitulo`, `sello` |
| `camara-continua` | C | Toma continua (one-take): la cámara sigue en vertical a una hoja que cae del cielo por la cascada hasta un río de olas *seigaiha*; cartelas y sello fijos | `cartelas[]`, `sello` |
| `garabato-vivo` + `"hervor": true` | B | Los trazos "hierven" (filtro `feTurbulence`+`feDisplacementMap`, semilla nueva cada 3 cuadros) | (opción nueva del efecto existente) |

```bash
cd .claude/skills/ceinca-video-fx && npm install   # primera vez
node scripts/render.mjs examples/pasos-progreso.json -o out/pasos.mp4
node scripts/render.mjs examples/portada.json --tema estilo-ukiyo-e -o out/portada-ukiyo.mp4     # variación: mismo efecto, otro estilo
node scripts/reel.mjs examples/reel-estilo-c-ukiyo-e.json -o out/reel-ukiyo.mp4                  # reels de muestra: reel-estilo-a-dark-tech · -b-red-glow · -c-ukiyo-e
```
Los efectos del Bloque 4 duran 5–6 s (el JSON trae `"duracion"`); `render.mjs` mantiene sus validaciones (zonas seguras, marca desacoplada, determinismo).

### Verificación rápida (nuevo)
```bash
node scripts/render.mjs examples/portada.json --tema estilo-red-glow --frame 2 -o out/prev.png   # PNG de un instante, ~3 s, sin renderizar el video
node scripts/render.mjs examples/portada.json --tema estilo-red-glow --solo-auditoria            # zonas seguras + errores de página, ~3 s
bash scripts/check.sh matriz                                                                       # TODOS los efectos × TODOS los temas (≈5 min)
```
`check.sh matriz` es el paso a correr al crear un efecto o un estilo nuevo: detecta texto fuera de zona segura y errores de plantilla en cada combinación antes de gastar tiempo en renderizar.

### Al escribir plantillas nuevas (aprendido en este bloque)
- **No midas layout antes de que carguen las fuentes.** Al correr el script la fuente real aún no se pidió y `document.fonts.ready` ya está resuelto: se mide con la fuente de respaldo y, con una tipografía más ancha, el texto salta de línea y todo se desplaza (así falló `diagrama-nodos` en Ukiyo-e). Soluciones usadas: alturas fijas para los bloques que definen el lienzo, layout por CSS en vez de medir (`collage-papel`), bordes con `%`/`calc()` (`FX.rasgado`), o esperar con `FX.afterFonts(fn)`, que fuerza la carga de las familias del tema.
- `FX.fail(msg)` declara un error de plantilla que el motor siempre reporta (código 4), incluso si ocurre dentro de una promesa (`telefono-chat` lo usa cuando los mensajes no caben).
- `FX.mejorTexto('--fx-accent-2')` elige entre `--fx-text` / `--fx-bg` / `--fx-on-accent` el color con mayor contraste (WCAG) sobre una pieza de color del tema. Úsalo cuando el fondo del texto cambie según el estilo.
- Con `justify-content:flex-end` el desborde hacia arriba **no** suma a `scrollHeight`; mide con `offsetTop`/`offsetHeight` (inmunes a transformaciones 3D).

### Qué cubre y qué no (mapeo contra la especificación original)

| Ítem de la especificación | Estado |
|---|---|
| A · barra segmentada + numeración con `-webkit-text-stroke` | ✓ `pasos-progreso` |
| A · ventana macOS con typewriter | ✓ `consola-macos` |
| A · diagrama de nodos con `stroke-dashoffset` | ✓ `diagrama-nodos` |
| A · subtítulos palabra por palabra | ✓ `subtitulos-karaoke` (existente; palabra activa en acento con *scale*; no es física de resorte real) |
| A · fondo cuadrícula + radiales **animados** | ◐ cuadrícula y radiales en el tema; los radiales son estáticos |
| B · Orbit · Frame Break · UI World · Chart Grow | ✓ `orbita` · `rompe-marco` · `mundo-app` · `grafica-crece` (existentes) |
| B · Phone Mockup con chat · Zoom-Through · Doodle Boil | ✓ `telefono-chat` · `zoom-atraves` · `garabato-vivo` + `hervor` |
| B · Headline Wall (etiquetas a -4°) · Glass Type (`background-clip:text` + destello) · Digital Zoom con contadores | ✗/◐ `muro-titulares` y `texto-cristal` cubren la idea pero **sin** la inclinación ni el texto-cristal con destello; el zoom digital existe sobre clip (`clip.mjs`), sin contador sincronizado |
| B · subtítulos serif **cursiva** | ✗ `sync-brand` solo vendoriza fuentes *normal* (el estilo usa Playfair Display recto) |
| C · textura de papel + marco de pergamino | ✓ tema `estilo-ukiyo-e` (`extraCss`) |
| C · OneTake (cámara continua) · Collage halftone | ✓ `camara-continua` · `collage-papel` (+ `corta-pega` existente) |
| C · Morphing de código HTML a trazados · p5.brush / WebGL | ✗ no implementado (requiere motor de glifos→paths y runtime Canvas/WebGL que esta skill no incluye) |
| Skills de terceros citadas (remotion-dev/skills, onetake, gbro-collage-broll, ClaudeAnimationBase, lemo-opuscar) | no se instalaron ni se verificaron sus repos; esta skill es de producción propia |

### Notas del Bloque 4
- **Color de acento del Estilo A:** la especificación pide el naranja terracota de Claude/Anthropic; aquí es solo un valor del tema `estilo-dark-tech` (cámbialo en su JSON si el contenido es de marca CEINCA).
- Ukiyo-e es un **estilo** (papel, tintas, motivos tradicionales como *seigaiha*); no reproduce ninguna obra concreta.
- Audit de zonas seguras: el texto de Anton/Noto ocupa más alto que su `line-height`; deja ~25 px de colchón arriba al diseñar títulos en la zona superior.
- Escenas con cámara o transiciones largas marcan `data-fx-skip-audit` solo en el elemento que sale de cuadro (`zoom-atraves`, escena A).

## Audio sincronizado (música + SFX)
`node scripts/audio.mjs <reel.json> <reel.mp4> [-o salida.mp4] [--bpm 120] [--sin-musica] [--sin-sfx] [--cues-json cues.json]`
- **Sincronía real, no estimada:** `render.mjs` (opción `cuesOut`) lee del timeline GSAP el instante de cada animación; `audio.mjs` las clasifica en sonidos (entrada con movimiento → whoosh, `back.out` → pop/ding, trazo SVG → dibujo, barra `scaleX` → relleno, anillos de zoom → riser, typewriter → teclas a ~22 car/s, collage `steps()` → papel) y fusiona por familia (un stagger de 3 elementos = un solo sonido). Cada corte de escena lleva un golpe grave.
- **Todo sintetizado por código** (`scripts/sfx_synth.py`, numpy, determinista): sin muestras ni licencias externas. Música Am–F–C–G a 120 bpm: 6 s = 3 compases, así cada corte cae en inicio de compás; la música baja ~5 dB bajo cada SFX. Salida AAC 48 kHz, ≈ −14 LUFS.
- **Verificado:** con SFX solos, correlación audio↔movimiento de video máxima en desfase 0 cuadros. Lección: el pico del whoosh debe coincidir con el arranque del movimiento (ataque inmediato), no con su mitad.
- Límites: el audio refleja las animaciones GSAP; efectos FFmpeg de clip (Bloque 2/3) no exponen timeline y no se sincronizan aquí. Es música de acompañamiento genérica: para pista de marca, sustituir el mix de `sfx_synth.py` o mezclar con ffmpeg.

---

## Bloque 5 — Modo Horizontal YouTube (16:9), Grabador de Demos y Flujo Editor Architect en Linux

Inspirado y adaptado de la arquitectura de flujo conversacional (`video-editor-architect`, MIT) pero ejecutado **100% sobre el motor propio `ceinca-video-fx` en Linux** (sin Remotion y respetando el estándar **`-16 LUFS`** de CEINCA / `@soyeduardo.ia`).

### 1. Formato Dual: Vertical `9:16` (`1080×1920`) y Horizontal YouTube `16:9` (`1920×1080`)
Todos los scripts (`render.mjs`, `clip.mjs`, `overlay.mjs`, `reel.mjs`, `grabar-demo.mjs` y `check.sh`) aceptan `--formato vertical|horizontal` (o `"formato": "horizontal"` en el JSON):
- **Vertical (`vertical` / `9:16`):** `1080×1920`, zonas seguras `250 px` arriba y `350 px` abajo (Reels, TikTok, Shorts).
- **Horizontal (`horizontal` / `16:9`):** `1920×1080`, zonas seguras `80 px` arriba y `90 px` abajo (videos largos de YouTube, clases de cursos, webinars y presentaciones de pantalla). En `shared/base.css`, `#root[data-formato="horizontal"]` adapta automáticamente grillas, tipografías y tarjetas al apaisado 16:9.

```bash
node scripts/render.mjs examples/diagrama-nodos.json --tema marca-soyeduardo-ia --formato horizontal -o out/nodos-yt.mp4
node scripts/clip.mjs examples/clip-zoom-corte.json --formato horizontal -o out/clip-yt.mp4
node scripts/overlay.mjs --base out/clip-yt.mp4 --overlay examples/subtitulos-karaoke.json --formato horizontal --key 0x0B0F17 -o out/final-yt.mp4
```

**Limitación verificada (integración 27-10-2026):** 6 efectos HTML **solo funcionan en vertical** y lo declaran con `<meta name="fx-formatos" content="reel">`, así que `--formato horizontal` los rechaza con un mensaje claro: `corta-pega`, `diagrama-nodos` (los nodos se salen del lienzo), `grafica-crece`, `muro-titulares`, `rompe-marco` y `telefono-chat` (en horizontal el texto cae fuera de la zona segura de 80/90 px o los mensajes no caben). Los otros 19 efectos de reel pasan la auditoría en horizontal; los 2 slides (`slide-*`) son solo carrusel/reel. Para llevar uno de los 6 a horizontal hay que rediseñar su layout en `shared/base.css` o en su plantilla y quitar la declaración.

### 2. Grabador Determinista de Demos Web/App (`scripts/grabar-demo.mjs` · comando `/grabar-demo`)
Graba cualquier URL o aplicación local a 30 fps reales en Linux, tanto en **vertical (`1080×1920`)** como en **horizontal (`1920×1080`)**:
```bash
# Demo vertical 9:16 con marco de navegador sobre fondo @soyeduardo.ia (para Reel)
node scripts/grabar-demo.mjs --url https://tu-web.com --formato vertical --modo marco --tema marca-soyeduardo-ia -o out/demo-reel.mp4

# Demo horizontal 16:9 con marco o pantalla completa (para YouTube / curso)
node scripts/grabar-demo.mjs --url https://tu-web.com --formato horizontal --modo marco --tema marca-soyeduardo-ia -o out/demo-youtube.mp4
```
- **Tres modos (`--modo`):** `pantalla` (lienzo completo `1080×1920` o `1920×1080`), `marco` (ventana con barra superior y semáforo sobre el fondo `--fx-bg` del tema) y `telefono` (mockup móvil centrado).
- **Candado de privacidad automático:** difumina cualquier `input[type="password"]` o `[data-secret]` antes de capturar cada cuadro y nunca lee ni escribe contraseñas.

### 3. Diagnóstico del Sistema en Linux (`scripts/doctor.mjs` · comando `/doctor`)
Verifica de un vistazo sistema operativo, espacio libre (≥ 5 GB), Node.js, Git, FFmpeg + filtros (`loudnorm`, `ebur128`, `colorkey`, `chromakey`, `zoompan`), Chromium headless, Python 3 + NumPy (`sfx_synth.py`), herramientas opcionales (`whisper`, `yt-dlp`), integridad de `brand.lock.json` y verificación ciega de `~/.config/ceinca-editor/.env` (reporta solo si una llave opcional está configurada o vacía, **sin leer ni imprimir jamás su valor**).

### 4. Auditoría de Entrega Final (`bash scripts/check.sh reel <mp4>`)
Verifica que el MP4 terminado cumpla resolución exacta (`1080×1920` o `1920×1080`), `30 fps`, códec `h264`, `yuv420p` y sonoridad integrada EBU R128 en **`-16.0 LUFS` (± 1.5 LU)**.

### 5. Comandos de Estudio en el Repo (`.claude/commands/` + `estilos/`)
- `/editar`: flujo guiado en **3 paradas** (Parada 1: Texto y recorte de silencios/repeticiones; Parada 2: Dirección y escaleta en `vertical` 9:16 o `horizontal` 16:9; Parada 3: Render a `-16 LUFS` y reporte **`Cumple X de Y reglas`**).
- `/ajustar`: aplica cambios puntuales generando `final-v2.mp4`, `final-v3.mp4` sin pisar la versión anterior y guarda reglas permanentes en `estilos/<id>/aprendizajes.md` y `perfil.json`.



## Reel con voz grabada (`scripts/reel-voz.mjs`)

Monta un reel donde la **voz viene de clips grabados** (p. ej. Flow con el avatar del usuario) y cada escena lleva un efecto encima. Ejemplo completo: `examples/reel-voz.example.json` (los clips no se versionan; apunta a `assets/`).

```bash
node scripts/reel-voz.mjs examples/reel-voz.example.json -o out/reel.mp4
```

Cada escena toma la **voz del tramo `[desde, hasta]` de su `fuente`** (ganancia pareja entre clips, fundidos de 40 ms solo en los empalmes, `loudnorm` a −16 LUFS al final) y puede ser:

| Campo | Qué hace |
|---|---|
| (ninguno) | clip liso, encuadre cover 1080×1920 a 30 fps |
| `fx` | efecto de `clip.mjs` (zoom, `pantalla-verde`); los tiempos son relativos al inicio de la escena |
| `html` | efecto HTML a pantalla completa (`muro-titulares`, `grafica-crece`, `rompe-marco`, `corta-pega`…); el contador sale del propio efecto |
| `overlay` | efecto HTML con `fondoClave` pegado sobre el clip (karaoke) |
| `ctb` | caja de llamado a la acción (`{palabra, linea, handle}`) dentro de la zona segura |
| `badge: N` | contador `N/total` + título fijo (PNG de `badge.mjs`) |
| `sinAuditoria` | omite la auditoría de zonas seguras (solo si el efecto se corta a mitad de animación) |
| `contenido` (sin `ventana`) | **B-roll a pantalla completa** con la voz del clip en off (recomendado para mostrar efectos): `contenido` = `{ html }` o `{ fx }` y `velocidad`; `badge` + `nombre` dibujan `NN/07 · NOMBRE` en y=`badgeY` (1450 por defecto); `"sinTituloFijo": true` quita el título fijo de arriba si choca con el del efecto (p. ej. el contador grande de grafica-crece). Los subtítulos globales se apagan solos en estas escenas: el badge hace de subtítulo |
| `ventana` + `contenido` | **locutor persistente** (desplazado 400 px) con el efecto en una ventana 1080×850 arriba; `contenido` = `{ html }` o `{ fx }` (con `clip` propio, p. ej. el clip verde) y `velocidad`; `badge` + `nombre` dibujan `NN/07 · NOMBRE`; `ventana.banda` elige qué franja del efecto se ve |
| `texto` (alias `ctb`) | caja dorada grande: `{ palabra, prefijo ("COMENTA " por defecto), linea, handle, y, entra }`; úsala para hook, dato y CTB |

**Flujo recomendado:** (1) graba/genera las escenas con la voz; (2) Whisper `small` con `word_timestamps` por clip → tiempos reales de cada palabra; (3) reparte los efectos según la palabra que se dice; (4) render; (5) contact sheet 1 fps + Whisper del master para comprobar.

**Piezas auxiliares nuevas**
- `scripts/recorte-verde.mjs <video> --t 2 -o recorte.png`: fotograma con **alfa** a partir de un fondo verde (solo FFmpeg). Úsalo como `sujeto` de `rompe-marco` y `corta-pega`.
- `pantalla-verde` acepta `"metodo": "verde-dominante"` (alfa por exceso de verde sobre rojo/azul, `umbral` 18, `rango` 40). Con prendas azul claro el `chromakey` por distancia sale moteado; este método no.
- `scripts/badge.mjs`: PNG transparente del contador o del CTB con la marca del tema.
- Parámetro `fondoClave` (p. ej. `0x00FF00`) en cualquier efecto: pinta el fondo liso para quitarlo con `chromakey` (overlay sobre clip). Añade la clase `clave` al `<body>`; `subtitulos-karaoke` la usa para pasar a caja sólida.

**Reglas aprendidas (reel FIEBRU'O, 19-10-2026)**
1. Un efecto HTML necesita **≥ 1,4 s** para leerse (`muro-titulares` ≥ 1,9 s). Si la palabra dura menos, empieza el efecto antes de decirla.
2. `subtitulos-karaoke` con `posicion: "abajo"` ya respeta la zona segura; **máx. ~6 palabras por escena** (2 líneas): parte la frase en varias escenas.
3. El badge `NN/total` debe ser **consecutivo y mostrar el efecto que dice**: no pongas un badge sobre una toma que no sea ese efecto.
4. El texto del CTB va **exacto** (`FIEBRU'O`, con apóstrofe) y dentro de la zona segura (no bajo 350 px del borde inferior).
5. Una escena de cada efecto con **la cara del usuario** (recorte real), nunca la silueta de demo (`frente-figura.png` es solo para pruebas del skill).
6. Para Flow (avatar, continuidad con último fotograma, descargas 720p/1080p) ver la skill `flow-chrome` (borrador en `CEINCA-WORKSPACE/03 FORMACION/CURSO FLOW/SKILL_flow-chrome_BORRADOR_v0.1.md`, sección 12).


### Receta "reel NEAPS-AIDA con ventana" (reel v4, 20-10-2026)
Estructura de los reels virales de CEINCA (TOTUMA, GUARAPO; `MARKETING/SISTEMA_VIRAL.md` §1.2, Mecanismo A) aplicada a un reel de efectos: **hook de urgencia** (texto grande dorado) → **contraste antes/después** → **"Guarda este video" temprano** → **checklist de efectos** (cada uno en ventana, etiqueta `NN/07 nombre`) → **dato** ("7 de 18") → **CTB en texto dorado + voz** → pedido de follow con razón de valor. Subtítulos continuos y logo fijos.
1. Genera los clips con voz (Flow + avatar), frases ≤ 13 palabras, **encuadre bajo** (sujeto en el tercio inferior); no deletrees siglas ni nombres difíciles en el prompt (FFmpeg, CEINCA): reescribe la frase.
2. **Mide la voz por energía, no por Whisper:** `node scripts/voz-ventanas.mjs clip.mp4` → `1.15-2,2.9-4.8,…`. Whisper adelanta la voz hasta ~1 s con la sala en silencio y reordena a veces las palabras del prompt: coloca los efectos según lo que de verdad se oye.
3. Corta cada clip en tramos que contengan voz (varias escenas con la misma `fuente` = jump-cut): sin pausas > 0,5 s y sin silencio inicial (`check.sh reel` lo exige).
4. `reel-voz.mjs … --guardar-base base.mp4` → Whisper sobre `base.mp4` → `subtitulos-whisper.mjs palabras.json -o karaoke.json --max 4 --ventanas "$(node scripts/voz-ventanas.mjs base.mp4)" --reemplazos '{"cloud":"Claude"}'` → añade `"subtitulos": "karaoke.json"` y `"logo": true` al JSON → `reel-voz.mjs … --desde-base base.mp4` (solo aplica las capas, sin re-renderizar escenas).
5. `bash scripts/check.sh reel reel.mp4 reel-voz.json`: formato, A/V, −16 LUFS, sin silencios, badges 1..N, keyword exacta.
Ejemplo: `examples/reel-voz.example.json`. Logo: `vendor/brand/insignia-principal.svg` (copia del manual de marca).

### Receta "reel v5: B-roll a pantalla completa + rostro libre" (20-10-2026, reemplaza la ventana)
Visto en el celular, el modo `ventana` deja la cara del locutor (y≈1114-1662) justo donde caen los subtítulos (≤1560): no hay hueco. Por eso:
1. **Efectos = B-roll a pantalla completa** (`contenido` sin `ventana`), voz en off, badge `NN/07 · nombre` como único texto. Si el efecto trae su propio título o franja y choca con el badge, vacíalo (`"titulo": ""`, `"subtitulo": ""`) o sube el badge con `badgeY` (máx. 1490).
2. **Escenas de cara: una sola capa de texto** (los subtítulos). Nada de texto dorado que repita la voz; el dorado solo para el CTB.
3. **Rostro medido, no adivinado:** `python3 scripts/rostro.py clip.mp4 desde hasta` (YuNet, `vendor/modelos/`, necesita `opencv-python` ≥4.8) da la barbilla en coordenadas 1080×1920. `reel-voz.mjs` lo usa solo: el CTB baja a barbilla + 40 px y los subtítulos se apagan en la escena si la cara invade su caja (y≥1440). Sin OpenCV sigue con las posiciones fijas.
4. **Música:** `node scripts/musica.mjs reel.mp4 pista.mp3 -o final.mp4 --caida-musica <s de la caída en la pista> --caida-reel <s del primer efecto> --sfx <cortes>`. Nivela la cama sola a `--bajo` LU bajo la voz (por defecto 9, aprobado; la v5 inicial quedó a 24 LU y no se oía), la agacha con la voz (sidechain), fundido final, whoosh sintetizado en cada corte, −16 LUFS. La caída se busca con el RMS cada 0,05 s (en Midday_Meridian: silencio 14,90-15,00 s y golpe en 15,05 s).

**Parámetros aprobados (v5, Eduardo 20-10-2026: "está perfecto") — punto de partida de los siguientes reels:**
| Pieza | Valor |
|---|---|
| Estructura (29,4 s) | gancho + contraste a cámara (6 tramos, 0-9,6 s) → 7 efectos B-roll de 1,2-1,7 s (9,6-20,6 s) → prueba a cámara → 2 CTB (palabra clave + seguir) |
| Texto en cara | solo subtítulos karaoke (`--max 4`); dorado únicamente en los CTB; CTB a barbilla + 40 px (rostro.py) |
| B-roll | `contenido` sin `ventana`, badge `NN/07 · nombre` en y=1450; gráfica con `velocidad: 2`, `titulo: ""` y `sinTituloFijo: true`; corta y pega con `subtitulo: ""` y `badgeY: 1500` |
| Música | Midday_Meridian.mp3; `--caida-musica 15.05 --caida-reel 9.62` (el golpe cae en el primer efecto); `--bajo 9` (voz −16,1 / cama ≈ −25 LUFS); fundido 1,2 s; master −16 LUFS |
| SFX | un whoosh en el arranque de cada efecto y en la vuelta a cámara: `--sfx 9.62,11.02,12.62,13.77,15.27,16.62,17.92,19.57` |
| Logo y título | `logo: true`, `tituloFijo` en el badge (vacío donde el efecto ya tiene título) |
Comandos exactos: `~/CEINCA-WORKSPACE/PRUEBA_VIDEO_FX/reel-v5/rehacer.sh`.

### En claude.ai (chat / proyecto, skill subida como zip)
Verificado por Eduardo el 20-10-2026 en el sandbox de claude.ai: Node 22.22.0, FFmpeg 6.1.1 (libx264, libass, librsvg) y Chromium 141 preinstalado en `/opt/pw-browsers/` (`chromium-1194/chrome-linux/chrome` y `chromium_headless_shell-1194/chrome-linux/headless_shell`). `findChrome()` ya busca en `/opt/pw-browsers`; si eligiera otro binario, fija `FX_CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
1. `cd` a la skill y `npm install` (npm está permitido): trae `playwright-core` y `hyperframes`. Si HyperFrames falla, `render.mjs` cae solo a la ruta de respaldo (Playwright + FFmpeg).
2. `rostro.py` necesita `pip install opencv-python-headless` (PyPI está permitido); sin él, el reel sale con posiciones fijas.
3. Aún no se ha renderizado un reel completo allí (CPU y tiempo por comando desconocidos). Prueba primero un efecto suelto (`node scripts/render.mjs examples/checklist.json --motor respaldo`) y, si se corta, renderiza el reel por escenas.

## Módulo Carrusel — slides interactivos tipo video para carruseles de Instagram (20-10-2026)
Es para **carruseles** (no reels): cada slide es un **video corto en 1080×1350 (4:5)** que se mueve al deslizar, inspirado en el formato "este carrusel se mueve" (referencia analizada: Drive `CEINCA RESPALDO/Carrousel animación cinética`, 4 estilos). Aquí están los dos que encajan con la marca y el nicho; **sketch** (dibujo a mano) queda fuera por el nicho legal y **collage** (recortes de foto) queda para una fase 2.

| Efecto | Estilo | Parámetros |
|---|---|---|
| `slide-interfaz` | Interfaz de app: ventana con barra, encuesta que un cursor marca, chips, chat que "escribe" con avatar y botón "Desliza" que el cursor pulsa. | `titulo` (con `**acento**`), `etiqueta`, `pregunta`, `opciones[]` + `elegida`, `chips[]`, `inicial`, `mensaje` (con `**acento**`, se escribe letra a letra), `boton`, `tamTitulo` (104) |
| `slide-cinetica` | Tipografía cinética: el texto es el protagonista. Líneas que entran palabra a palabra; la `**palabra acento**` cae letra a letra, se estira y queda subrayada con un trazo dorado; destellos y garabatos se dibujan en filas propias (nunca pisan el texto). | `lineas[]` (con `**acento**`), `chica[]` (índices de líneas en tamaño secundario), `boton`, `tamTitulo` (136), `decoraciones` (true) |

```bash
node scripts/carrusel.mjs examples/carrusel.example.json -o out/carrusel        # slide_NN.mp4 + portada_NN.jpg + vista_previa.jpg
node scripts/render.mjs effects/slide-cinetica/params.example.json -o out/s.mp4  # un slide suelto ("formato": "carrusel" en el JSON)
```
- **Formato:** `render.mjs` acepta `"formato": "carrusel"` (o `--formato carrusel`): 1080×1350, zonas seguras 90/90 (en carrusel la UI de Instagram no tapa el slide). Solo renderizan en carrusel los efectos que lo declaran con `<meta name="fx-formatos" content="carrusel,…">`; los demás se rechazan con un mensaje claro. Los dos slides también sirven en reel (9:16).
- **`carrusel.mjs`:** contador `NN/TT` automático (`"contador": false` lo quita), el último slide va sin "Desliza", máximo 20 slides y 60 s por slide (límites de Instagram), duración por defecto 5 s. Los slides salen **sin audio**: la música se elige al publicar en Instagram.
- **Frame 0 = portada:** Instagram muestra el primer frame antes de reproducir, así que ambas plantillas arrancan con el título ya legible (cinética: primera línea; interfaz: título + ventana) y animan el resto. `portada_NN.jpg` es ese frame (sirve también como slide fijo).
- **Copy:** un carrusel animado sigue el Mecanismo A/B de `MARKETING/SISTEMA_VIRAL.md` (slide 1 = gancho, último = CTB con keyword). La keyword va en el `mensaje` del último `slide-interfaz`.

