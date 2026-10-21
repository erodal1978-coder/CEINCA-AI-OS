# Banco de SFX y música — @soyeduardo.ia
**Versión 0.1 · 21-10-2026 · borrador**
Los audios **no viven en el repo** (política de assets): están en `CEINCA-WORKSPACE/DIGITAL_MENTOR/SFX/`. Aquí solo el índice, la procedencia y la licencia de cada sonido.

## 0. Procedencia y límites
- **Fuente de los 15 SFX:** sintetizados en local con ffmpeg 6.1.1 (`aevalsrc`, `anoisesrc`, filtros), sin muestras de terceros ni servicios externos. Receta reproducible: `CEINCA-WORKSPACE/DIGITAL_MENTOR/SFX/make_sfx.sh` (se regenera con `bash make_sfx.sh`).
- **Licencia de los SFX:** propios del titular de la cuenta; no hay material de terceros. Sin restricciones conocidas de uso.
- **Formato medido:** WAV 48 kHz estéreo 16-bit, pico a −3 dBFS en todos (medido con `astats`).
- **Límite:** los sonidos se midieron (duración, pico) pero **no se escucharon**. Revisar de oído antes de usarlos en una pieza.

## 1. Índice
| N.º | Archivo | Duración | Uso |
|---|---|---|---|
| 01 | `01_whoosh_corto.wav` | 0,55 s | Transición entre planos |
| 02 | `02_whoosh_largo.wav` | 1,10 s | Cambio de bloque o de escena |
| 03 | `03_swipe.wav` | 0,30 s | Entrada de texto o tarjeta |
| 04 | `04_pop_ui.wav` | 0,18 s | Aparece un elemento de interfaz |
| 05 | `05_click.wav` | 0,05 s | Selección o botón |
| 06 | `06_tecla.wav` | 0,06 s | Escritura de un prompt (repetir) |
| 07 | `07_ding_exito.wav` | 1,00 s | Resultado correcto |
| 08 | `08_notificacion.wav` | 0,60 s | Llega un mensaje o DM |
| 09 | `09_riser.wav` | 2,00 s | Tensión antes de revelar |
| 10 | `10_impacto.wav` | 1,00 s | Revelar la palabra clave |
| 11 | `11_sub_drop.wav` | 1,30 s | Caída grave tras el riser |
| 12 | `12_glitch.wav` | 0,35 s | Corte digital breve |
| 13 | `13_sello.wav` | 0,40 s | Estampa del sello "LO HIZO LA IA" |
| 14 | `14_ping_lima.wav` | 1,08 s | Acento de la palabra en lima |
| 15 | `15_cierre_acorde.wav` | 1,20 s | Remate sobre la tarjeta final |

## 2. Pista musical
| Pista | Duración | Origen | Licencia |
|---|---|---|---|
| `PRUEBA_VIDEO_FX/musica/Midday_Meridian.mp3` | 57,9 s | Llegó tras un prompt escrito para Gemini (`reel-v4/PROMPT_MUSICA_GEMINI.md`). **Generador y archivo original: NO CONFIRMADOS** (el mp3 no trae etiquetas). | **NO CONFIRMADA.** Hay que registrar el generador y sus términos de uso. Hasta entonces, no usarla en piezas publicadas de esta cuenta. |

## 3. Reglas de uso (propuesta)
- Un SFX por evento visual; no apilar más de dos a la vez.
- Los SFX van por debajo de la voz; el balance fino se hace en el montaje (todos comparten el mismo pico).
- El sonido 14 acompaña a la palabra clave en lima; el 13, al sello; el 15, a la tarjeta final.
