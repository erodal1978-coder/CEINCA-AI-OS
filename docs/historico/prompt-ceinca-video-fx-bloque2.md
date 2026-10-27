# PROMPT PARA CLAUDE CODE — Skill `ceinca-video-fx` (Bloque 2: 3 zooms sobre clip grabado, solo FFmpeg)

## Contexto
Repo: CEINCA-AI-OS. Este bloque **extiende** la skill existente `.claude/skills/ceinca-video-fx` (Bloque 1, PR #33). No crees otra skill. Antes de tocar nada:
1. Lee `CLAUDE.md` y `handoff.md`, y sigue su protocolo.
2. Lee `SKILL.md` y `scripts/{render,reel,check,build-zip,make-assets}` de la skill. Replica sus convenciones: JSON plano con `efecto`, resolución de rutas relativa al JSON (luego cwd, luego la skill), JSON final por stdout, códigos de error claros.
3. Comprueba que el Bloque 1 está en `main`. Si la PR #33 sigue abierta, ramifica desde `feature/ceinca-video-fx-bloque1` y apunta la PR de este bloque a esa rama (no a `main`).

Objetivo: tres efectos que se aplican a un **clip grabado por el usuario** (no a plantillas HTML): zoom digital, zoom de corte y zoom hacia atrás. Salida vertical lista para Reels/Stories, con el audio original.

## Reglas obligatorias
- **Solo FFmpeg + Node.** Sin Chromium, sin HyperFrames, sin dependencias npm nuevas, sin CDN ni APIs. Así corre igual en Claude Code y en el chat de claude.ai (si el sandbox trae `ffmpeg` y `node`).
- **Salida:** 1080×1920, 30 fps, H.264, yuv420p, audio AAC conservado y sin desfase. Duración = la del clip (o la del `recorte`). Nada de la duración fija de 4 s del Bloque 1.
- **Determinista:** el mismo JSON y el mismo clip deben dar los mismos frames (verificar con `-f framemd5` en dos corridas).
- **Sin marca:** estos efectos no llevan colores ni tipografías. No toques `sync-brand`, `themes/` ni `brand.lock.json`. `check.sh estatico` debe seguir pasando.
- **No los pongas en `effects/`:** `check.sh` exige ahí `index.html` y `window.__timelines['root']`. Usa `scripts/clip.mjs` y `examples/clip-*.json`, y añade a `check.sh` su propia validación de estructura.
- **Política de assets del repo:** ningún mp4 en Git. Los clips de prueba se generan con FFmpeg (`lavfi`) desde `scripts/make-assets.mjs` a `examples/assets/clips/` (ya ignorado). El clip real del usuario vive fuera del repo; se pasa por ruta.
- No modificar `skills-lock.json`.

## Método de FFmpeg (verificado en un prototipo, FFmpeg 6.1.1; vuelve a verificarlo en tu entorno)
- `zoompan` sobre vídeo con `d=1`, `fps=30` y entrada **supersampleada** (`scale=2×` con `lanczos` antes) funcionó: 150 frames de 150 esperados, audio conservado y `framemd5` idéntico en dos corridas. Expresiones usadas: `z='1+0.5*clip((in_time-1)/2,0,1)'`, `x='(iw-iw/zoom)*FOCO_X'`, `y='(ih-ih/zoom)*FOCO_Y'`.
- En esa build `crop` **no tiene** la opción `eval`: sus `w`/`h` se fijan al inicio, así que no sirve para zoom animado. `scale=eval=frame` + `crop` dio una salida incorrecta en el prototipo; no lo uses sin verificarlo.
- Ejecuta `ffmpeg -version` y `ffmpeg -h filter=zoompan` antes de escribir nada. No inventes opciones ni variables: usa solo las que el `-h` de tu versión liste.
- Antes de `zoompan`, normaliza a CFR 30 fps (`fps=30`), aplica el encuadre y supersamplea. Prueba ×2 y ×4 y comprueba si hay temblor de 1 px en zoom lento (compara frames consecutivos). **Reporta qué factor y qué método quedaron.**
- La recompresión del audio no debe cambiar su duración. Verifícalo con `ffprobe`.

## Parámetros globales (los 3 efectos)
| Parámetro | Default | Qué hace |
|---|---|---|
| `clip` | — (obligatorio) | ruta del mp4/mov |
| `recorte` | clip entero | `{ "desde": s, "hasta": s }` |
| `encuadre` | `cubrir` | si el clip no es 9:16, recorta a 9:16 (cover). `foco` mueve el recorte horizontal |
| `foco` | `{ "x": 0.5, "y": 0.5 }` | punto hacia el que se hace zoom, en fracción 0–1 del encuadre |
| `audio` | `true` | `false` quita el audio |

Validaciones con error claro (nada de corregir en silencio): `escala` menor que 1 (se vería borde), `foco` fuera de 0–1, tiempos fuera de la duración del clip, `cortes[]` no ascendente. Aviso (no error) en el JSON final si el zoom máximo obliga a ampliar por encima de la resolución nativa del clip.

## Los 3 efectos
1. **zoom-digital**: acercamiento suave y continuo hacia `foco`. Parámetros: `escala` (default 1.3), `inicio`, `fin` (s), `curva` (`lineal` | `suave` | `salida`; default `suave`). Tras `fin` mantiene la escala final.
2. **zoom-corte**: saltos instantáneos entre plano abierto y cerrado, para simular dos cámaras. Parámetros: `cortes[]` con `{ "t": s, "escala": n, "foco"?: {x,y} }`; cada corte se mantiene hasta el siguiente. `escala: 1` es plano abierto. Sin interpolación entre cortes: el cambio ocurre en un solo frame.
3. **zoom-atras**: empieza cerrado y se abre hasta el plano completo. Parámetros: `escalaInicial` (default 1.4), `inicio`, `fin` (s), `curva` (igual que zoom-digital). Tras `fin` queda en escala 1.

## Estructura (añadir a la skill)
```
ceinca-video-fx/
├─ scripts/clip.mjs            # params.json → MP4 (zoom-digital | zoom-corte | zoom-atras)
├─ scripts/check.sh            # extender: validación de estructura de clip-*.json y, en `video`, verificación opcional de audio
├─ scripts/make-assets.mjs     # extender: clips de prueba con lavfi (no versionados)
├─ examples/clip-zoom-digital.json · clip-zoom-corte.json · clip-zoom-atras.json
└─ SKILL.md                    # nueva sección "Efectos sobre clip grabado (FFmpeg)"
```
`clip.mjs` imprime un JSON final como `render.mjs`: `efecto`, `metodo`, `ancho`, `alto`, `fps`, `codec`, `pix_fmt`, `frames`, `duracion`, `audio`, `aviso`.

## Pruebas y criterios de aceptación
- **Clips de prueba propios (lavfi, sin copyright):** `testsrc2` + `sine`, 5 s, en tres variantes: 1080×1920 a 30 fps, 1920×1080 a 30 fps (prueba el encuadre `cubrir`) y 1080×1920 a 25 fps (prueba la normalización de fps).
- Renderiza los 3 efectos (más la variante horizontal y la de 25 fps) y pasa `check.sh video` a cada MP4: 1080×1920, 30 fps, h264, yuv420p, 150 frames ±1, audio presente y con duración igual a la del vídeo (±1 frame).
- **Verificación numérica del zoom:** extrae frames en `inicio`, a mitad y en `fin`. Compáralos con una referencia calculada con `crop`+`scale` estático de FFmpeg y reporta el PSNR de cada punto. En el prototipo, un punto de escala constante dio 34,6 dB y uno de escala intermedia 29,2 dB, porque la interpolación difiere. El objetivo es ≥ 30 dB en puntos de escala constante. Si no se cumple, reporta el valor real y por qué; no cambies el umbral para que pase.
- **zoom-corte:** el frame anterior al corte y el posterior deben mostrar escalas distintas, con el cambio en un solo frame.
- **Sin bordes negros** ni cortes del encuadre en ningún frame (revisa los PNG a mitad y a `fin`).
- **Determinismo:** dos renders del mismo JSON dan `framemd5` idénticos.
- Revisión visual de los PNG: el punto de `foco` permanece en su sitio durante el zoom.
- `bash scripts/check.sh` (estático) pasa sin cambios de comportamiento. Confirma con grep que ningún archivo nuevo referencia URLs externas ni colores hex.
- `npm run zip` → `dist/ceinca-video-fx.zip` sin mp4 ni `node_modules`.
- Prueba con un clip real si Eduardo te da una ruta, sin copiarlo al repo.

## Documentación
- `SKILL.md`: actualiza el `description` del frontmatter. Quita "No cubre zoom…" de este bloque y añade disparadores ("zoom digital", "zoom de corte", "punch-in", "zoom hacia atrás", "acercamiento suave a mi clip"). Añade la sección del catálogo con los parámetros y un ejemplo de uso por efecto. Menciona que estos efectos necesitan solo `ffmpeg` y `node`, sin `npm install`.
- `CLAUDE.md`: actualiza la línea de módulo de `ceinca-video-fx`.
- `handoff.md`: bloque fechado arriba, según el protocolo.
- Recuerda en `SKILL.md` que, si cambia el manual de marca, hay que regenerar el zip. Los zooms no dependen de la marca.

## Fuera de alcance (bloques siguientes)
- Rompe el marco, corta y pega, pantalla verde (recorte de silueta).
- Subtítulos karaoke con Whisper.
- **Overlays contador NN/TT y título fijo sobre el clip** y su integración con `reel.mjs`: esos overlays viven en la capa HTML y no se aplican a un mp4 existente sin otro pipeline. Déjalo documentado como limitación.

## Cierre
- Rama `feature/ceinca-video-fx-bloque2`, commits atómicos y PR. No mergear.
- Antes de empujar: `git fetch origin main` (clon superficial) y `git ls-remote origin feature/ceinca-video-fx-bloque2`. Si la rama ya existe en remoto, no fuerces el push: alinea tu rama local con ella.
- La PR incluye: método de FFmpeg y factor de supersampleo elegidos, resultado de `check.sh` por efecto, PSNR medido, limitaciones y peso del zip.
