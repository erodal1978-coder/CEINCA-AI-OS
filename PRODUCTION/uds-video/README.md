# UDS — Cierre de Semestre 2026 (video vertical)

Pipeline de render del video institucional de fin de semestre de la Universidad
Deportiva del Sur. Sin voz en off: el mensaje va en texto sobre pantalla.

## Dos versiones

| | v1 (`render.sh`) | v2 (`render_v2.sh`) |
|---|---|---|
| Tarjeta de apertura | sí, 3.5 s | no |
| Texto sobre las fotos | sí, bloques 2 y 3 | **no**, montaje limpio |
| Duración por foto | 1.3 s | 1.4 s |
| Tarjeta de cierre | 3.5 s, logo solo | 4 s, logo 30% + "Felices vacaciones." |
| Volumen de música | 32% | 38% |
| Total | 43.4 s | 44.4 s |
| Salida | `UDS_Cierre_Semestre_2026.mp4` | `UDS_Cierre_Semestre_2026_v2.mp4` |

v2 es el corte limpio: las fotos corren sin nada superpuesto y todo el
texto y el logo se concentran en la tarjeta final.

## Uso

```bash
bash PRODUCTION/uds-video/render.sh          # v1
bash PRODUCTION/uds-video/render_v2.sh       # v2
```

Dependencias: `ffmpeg`, y `python3` con `pillow numpy scipy fonttools brotli`.
El script es idempotente: reutiliza los clips ya generados en `<dir_trabajo>/clips`.

## Entradas

| Archivo | Uso |
|---|---|
| `assets/IMG-20260801-WA*.jpg` | 40 fotos del montaje (orden alfabético) |
| `assets/channels4_profile.jpg` | Logo sobre fondo blanco |
| `assets/wavecont-...-206315.mp3` | Música de fondo |
| `carrusel-export/assets/fonts/montserrat-*.woff2` | Tipografía (se convierte a TTF) |

## Salidas — `assets/uds-video/`

| Archivo | Descripción |
|---|---|
| `UDS_Cierre_Semestre_2026.mp4` | Entregable v1 |
| `UDS_Cierre_Semestre_2026_v2.mp4` | Entregable v2 |
| `card_close_v2.png` | Tarjeta de cierre de v2 |
| `logo_final.png` | Logo completo, keyeado y recortado al bounding box |
| `logo_final_reverse.png` | Igual, con el wordmark invertido a blanco |
| `logo_emblem.png` | Solo antorcha + escudo (el que se usa en las tarjetas) |
| `card_open.png`, `card_close.png` | Tarjetas de apertura y cierre |
| `text_block2.png`, `text_block3.png` | Placas de texto con franja al 45% |

## Línea de tiempo v1 (43.4 s)

| Desde | Hasta | Contenido |
|---|---|---|
| 0.0 | 3.5 | Tarjeta de apertura: logo 35% + títulos |
| 3.5 | 39.9 | Montaje: 40 fotos × 1.3 s, crossfade 0.4 s |
| 17.0 | 21.0 | Bloque 2 — agradecimiento del Rectorado (4 s) |
| 35.9 | 38.9 | Bloque 3 — "Felices vacaciones." (3 s) |
| 39.9 | 43.4 | Tarjeta de cierre: logo, sin texto |

Bloques de fotos: 1 → fotos 1-13, 2 → 14-26, 3 → 27-40. Cada foto avanza 0.9 s
(1.3 s de duración menos 0.4 s de solape), así que el texto del bloque 2 entra
justo en un corte y cubre unos 4-5 cambios de foto.

Especificación de salida: 1080×1920, H.264 High, 9.5 Mbps, 30 fps, AAC 192 kbps
a 48 kHz, `+faststart`.

## Línea de tiempo v2 (44.4 s)

| Desde | Hasta | Contenido |
|---|---|---|
| 0.0 | 40.4 | Montaje: 40 fotos × 1.4 s, crossfade 0.4 s, sin nada superpuesto |
| 39.9 | 40.4 | El montaje funde a negro, para no cortar en seco contra la tarjeta |
| 40.4 | 44.4 | Tarjeta de cierre: logo 30% + "Felices vacaciones.", fade-in 0.6 s |

El video termina sostenido sobre la tarjeta, sin fundido a negro final: el
último fotograma es el logo. La música sí cierra con su fade-out de 2.5 s.

## Dos decisiones que se apartan del brief

**1. Encuadre de las fotos: contain sobre fondo desenfocado, no crop duro.**
El brief pedía «crop a 1080x1920 … sin recortar elementos críticos». Las dos
condiciones son incompatibles con este material: 30 de las 40 fotos son
apaisadas (3:2 o 16:9), y un recorte centrado a 9:16 conserva solo el ~34%
central del ancho — parte a la mitad a los docentes en las fotos de grupo. Se
optó por encajar el fotograma completo sobre una versión desenfocada y
oscurecida de la propia foto, que es lo que respeta el requisito de fondo
(no perder elementos críticos) y además uniforma el montaje.

**2. En las tarjetas de v1 se usa `logo_emblem.png`, no `logo_final.png`.**
`logo_final.png` se genera tal como pide el Paso 1 (logo completo, keyeado,
recortado al bounding box). Pero el logo incluye su propio wordmark
«UNIVERSIDAD DEPORTIVA DEL SUR» en negro, que a 378 px de ancho queda en unos
15 px de alto, se ve rasterizado por los artefactos JPEG del original, es
ilegible sobre el fondo #0A0A0A y duplica el título en Montserrat que la propia
tarjeta compone justo debajo. Las tarjetas de v1 usan solo el emblema.

En **v2 no aplica**: su tarjeta de cierre no lleva el nombre compuesto aparte,
solo "Felices vacaciones.", así que el wordmark del logo sí hace falta para
identificar a la institución. Usa `logo_final_reverse.png` — el logo completo
con el wordmark invertido a blanco para que lea sobre #0A0A0A.

## Nota sobre el conteo de fotos

El brief menciona 39 fotos; en `assets/` hay **40** `IMG-20260801-WA*.jpg`, todas
distintas (verificado por hash). Se usaron las 40. El script toma cuantas
encuentre y recalcula duración y bloques, así que borrar una y volver a correr
ajusta el video solo.
