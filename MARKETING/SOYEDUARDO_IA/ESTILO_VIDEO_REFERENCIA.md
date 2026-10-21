# Estilo de reel de referencia — estudio de caso para @soyeduardo.ia
**Versión 0.2 · 21-10-2026 · BORRADOR sin commit, pendiente de revisión final contra `MARKETING/SISTEMA_VIRAL.md` y `RULES/`**
Cuenta: @soyeduardo.ia (antes @digitalmentor.ia). Antecedente: `handoff.md`, pendiente 2 del bloque 20-10 (tarde).

## 0. Alcance y límites (leer primero)
- **Muestra: n = 1.** Un solo reel de un tercero (resumen de un evento de IA con testimonios). Es un patrón observado, no una regla.
- **Sin métricas de rendimiento** del reel (alcance, guardados, retención). No sabemos si funcionó; ninguna decisión de §4 se apoya en que funcionara.
- Medido en sesión de Claude Code el 21-10-2026 con `ffprobe`, `ffmpeg` (ebur128, scene detection, silencedetect) y Whisper `small`. Whisper se equivoca en algunas frases y puede adelantar la voz hasta ~1 s: se usa para ubicar tramos, **no como cita**.
- Organizador, marca y autoría del reel: **NO CONFIRMADO**.
- Sin video, frames, nombres de personas ni citas en el repo (política de assets).

## 1. Ficha técnica (medida)
| Dato | Valor | Método |
|---|---|---|
| Duración | 90,6 s | ffprobe |
| Formato | 720×1280, 29,97 fps, H.264 + AAC | ffprobe |
| Loudness integrada | −14,1 LUFS (LRA 6,1 LU, pico −1,4 dBFS) | ebur128 |
| Cortes reales | **36** (37 planos) | scene > 0,3: 39 detecciones − 3 del efecto de transición a la tarjeta final (86,39 / 86,49 / 86,52 s). El corte de 85,99 s es real (revisado por fotogramas: pasa de "Muchas gracias" a un plano corto del orador) |
| **Ritmo oficial** | **2,4 s por plano (promedio)**, mediana 2,0 s, mínimo 0,77 s (10,7→11,5 s), máximo 5,9 s (74,7→80,6 s) | 90,6 s ÷ 37 planos |
| Palabras habladas | 198 → **2,2 palabras/s** | Whisper; 198 ÷ 90,6 s |
| Silencios > 0,35 s | ninguno | silencedetect −35 dB |

**Nota de datos:** el umbral 0,3 puede no detectar cortes suaves, así que 2,4 s es un **techo** de la duración real del plano. No usar "2,6 s" ni "2,3 s" (salieron de conteos erróneos: "35 cortes", "39 detecciones").

### Curva de ritmo (cortes reales por tercio)
| Tramo | Cortes | Duración media del plano |
|---|---|---|
| 0–30 s | 13 | 2,1 s |
| 30–60 s | 15 | 1,9 s |
| 60–90,6 s | 8 | 3,4 s |

Lectura: el montaje acelera hasta el minuto y **afloja en el último tercio** (planos de 5–6 s en el cierre reflexivo).

### Sonido
- Medido: loudness y ausencia de silencios > 0,35 s.
- **No analizado:** si hay música de fondo, BPM, efectos de sonido y sincronía de cortes con el beat. La ausencia de silencios no prueba que haya música.

## 2. Anatomía (hoja de contactos, muestreo cada 3 s)
| Tramo | Qué hace |
|---|---|
| 0–10 s | Abre con testimonios a cámara; una **palabra grande** (brillo azul/cian) con ciudad y país. Sin presentación previa. |
| Cuerpo | Alterna: testimonio a cámara, sala llena, orador en escenario, pantalla proyectada. |
| Puntuación | **Mapa de Latinoamérica** con contorno del país resaltado en neón y su bandera, en unas 8 de 30 muestras. |
| Subtítulos | Pequeños, blancos, centrados, frase corta, sin caja. |
| Cierre | Orador, agradecimiento, **tarjeta final** (evento, fecha, lugar, botón de reserva) desde ~86,5 s. Un solo CTA. |
| Personas | Unas 6 distintas a cámara (conteo visual; los audios de testimonio pueden ser más). |

### AIDA (tiempos de Whisper, ±1 s; la clasificación es lectura de Claude Code)
| Etapa | Tramo | Qué ocurre (sin citar) |
|---|---|---|
| Atención | 0–10,6 s | Testimonios muy breves con palabra grande en pantalla. |
| Interés | 10,6–~34 s | Describen qué fue el evento y cómo se sintió. |
| Deseo | ~34–~66 s | Hablan de lo que se puede hacer con IA y del beneficio práctico (afirmaciones de terceros; no se validan aquí). |
| Convicción | ~66–85 s | Cierre reflexivo sobre "nueva forma de pensar". Planos largos. |
| Acción | 85–90,6 s | Agradecimiento y tarjeta final con un solo botón. |

## 3. Auditoría frente a nuestro sistema
| Criterio | Reel de referencia | Referencia en el repo | Lectura |
|---|---|---|---|
| Ritmo | 2,4 s/plano | `MARKETING/SISTEMA_VIRAL.md` §1.3: ~3,4 s (venta rápida), ~5,3 s (autoridad) | Más rápido que ambas. Es montaje de evento, no de una persona hablando. |
| Duración | 90,6 s | §9.4: hook 15–30 s, tutorial 60–90 s | En el techo de tutorial; larga para un hook. |
| Regla de 7 s (§1.4) | Los 7 primeros s muestran testimonios; no dice quién habla ni la promesa | §1.4 | **No cumple** el estándar de autoridad en el gancho. |
| "Guarda este video" temprano (§1.3) | No aparece | §1.3 | No se copia. |
| Palabra clave en comentarios | No hay; cierra a una reserva externa | §6, §8 | Otro modelo de conversión (evento). No aplica. |
| Loudness | −14,1 LUFS | Pipeline de reel de `ceinca-video-fx`: master **−16 LUFS** (`.claude/skills/ceinca-video-fx/SKILL.md` L237, L275, L291; `scripts/musica.mjs` L4). Otra pieza de CEINCA se entregó a −14,1 LUFS (`handoff.md` L380) | Coexisten dos objetivos. El −14 es medida de esta referencia, no estándar nuestro. Probar antes de cambiar. |

Nota: `ceinca-video-fx` (reel-voz, musica, subtítulos) vive en la rama `feature/ceinca-video-fx-bloque3`, **PR #35 abierto, sin mergear**.

## 4. Qué sirve y qué no (para @soyeduardo.ia)
| Elemento | Decisión | Razón |
|---|---|---|
| Palabra grande en el primer segundo | **Adaptar** | Una palabra, no una frase. Efectos disponibles en `ceinca-video-fx` (`texto-cristal`, `subtitulos-karaoke`; PR #35). |
| Prueba social al abrir | **Adaptar, con reserva** | Nuestra prueba es "lo hizo la IA": captura o clip del resultado. Los testimonios entran cuando existan, dentro de la destacada "Lo dicen ellos". |
| Tarjeta final con un solo CTA | **Adoptar** | Un solo CTB por pieza ya es práctica del sistema. Aquí el CTA es una palabra clave, no una reserva. |
| Mapa de LATAM | **Posponer** | Solo tiene sentido con clientes o alumnos en varios países. Hoy no hay dato que lo respalde. |
| Subtítulos pequeños sin caja | **No adoptar** | Los subtítulos de `reel-voz` con zona segura fueron aprobados por Eduardo en la v5 (20-10, `handoff.md`); el código está en el PR #35 sin mergear. |
| 90 s y 2,4 s/plano | **No adoptar tal cual** | Es de resumen de evento; nuestros reels van a 15–30 s. |
| Estética globo y neón | **No adoptar** | Es de otra marca. |
| −14 LUFS | **Probar** | Comparar con −16 en una pieza antes de tocar `musica.mjs`. |

**Dependencia técnica:** sin tema propio, los efectos salen con la marca CEINCA (navy, Manrope). Para @soyeduardo.ia ya existe el tema `cliente-eduardo-ia` (`.claude/skills/ceinca-video-fx/themes/clientes/eduardo-ia.json` y `themes/cliente-eduardo-ia.css`, tinta/lima + Sora 800, commit c596e42): usar `--tema cliente-eduardo-ia`.

**"Lo dicen ellos":** tramo de la destacada "Lo hizo la IA" de la cuenta, separado por una tarjeta divisoria, para testimonios cuando los haya. Definido en el plan de destacadas (fuera del repo: `CEINCA-WORKSPACE/DIGITAL_MENTOR/`).

## 5. Reglas de estilo propuestas (propuesta, no medidas)
1. Abrir con el resultado en el primer segundo y **una palabra grande**; decir quién habla y de qué trata antes del segundo 7 (§1.4).
2. Montaje de prueba ("Lo hizo la IA"): planos de 2–3 s para el material de demostración. El plano a cámara no se corta por ritmo. Si ese plano es el **avatar de Flow** (video generado con IA con la cara y voz de Eduardo, no una grabación), marcar la pieza como contenido de IA **si la política vigente de Meta lo exige: NO CONFIRMADO, verificar antes de publicar**.
3. Un solo elemento lima por pantalla; lima = palabra clave o sello. Fuente: `CEINCA-WORKSPACE/DIGITAL_MENTOR/02_MANUAL_DE_MARCA.md` (v0.1, fuera del repo; copia en Drive `CEINCA RESPALDO/Digital mentor `).
4. Cierre con una sola acción: **Comenta [PALABRA]**, **solo si la palabra está aprobada y su automatización existe** (§6).
5. Nada de cifras, públicos ni resultados que no se puedan mostrar o comprobar (`RULES/POLITICA_EVIDENCIA_Y_HERRAMIENTAS.md`).

## 6. CTA y banco de palabras
- Banco propio: `MARKETING/SOYEDUARDO_IA/CTB_KEYWORDS_SOYEDUARDO_IA.md` (v0.1, borrador). No reutiliza los venezolanismos de `CTB_PALABRAS_DISRUPTIVAS.md` de CEINCA.
- Sin regionalismos (audiencia LATAM), campo taller, y filtro anti-falso-disparo porque la automatización usa "contiene" (`CLAUDE.md`).
- **Candado:** ningún guion, copy ni video promete "comenta X" hasta que X esté aprobada en el banco y su automatización exista y esté probada. Hoy no existe ninguna (`handoff.md`, pendiente 4).

## 7. Contraste con la salida de Gemini
Tabla suministrada en la revisión del 21-10-2026. No se leyó el texto original de Gemini; se contrasta contra lo medido.

| Dato | Gemini | Medido | Estado |
|---|---|---|---|
| Resolución | "Alta, 1080p+" | 720×1280 | **Falso** |
| Cortes | ~42 | 36 | Sobreestima ~17 % |
| Ritmo | ~2,1 s | 2,4 s (techo) | Aproximado, algo bajo |
| Plano máximo | ~5 s | 5,9 s | Quedó corto |
| Plano mínimo | 0,8 s | 0,77 s | Coincide |
| Duración | ~1:29 | 90,6 s (1:30,6) | Casi (−1,6 s) |
| FPS | ~30 | 29,97 | Correcto |
| Mapas como transición | Sí | Sí, ~8 de 30 muestras | Correcto |
| Subtítulos con acento cian | Sí | Subtítulos blancos; palabras grandes iniciales con brillo azul/cian | **Parcial** |
| Retención 55 % / 30 % / 10–15 % | Dada | Sin datos medibles en el video | **NO CONFIRMADO** (sin fuente) |
| Rotoscopia, L-cuts, Earth Studio | Afirmados | No contrastado | **Sin verificar** |

## 8. Pendientes antes de commit
- Revisión final contra `SISTEMA_VIRAL.md` y `RULES/`; commit en rama propia (no en `main`).
- Probar −14 vs −16 LUFS en una pieza.
- Sonido: si interesa, analizar música/BPM/SFX en una pasada aparte.
