# Estilo de reel de referencia — estudio de caso para @soyeduardo.ia
**Versión 0.3 · 21-10-2026 · BORRADOR sin commit, pendiente de revisión final contra `MARKETING/SISTEMA_VIRAL.md` y `RULES/`**
Cuenta: @soyeduardo.ia (antes @digitalmentor.ia). Antecedente: `handoff.md`, pendiente 2 del bloque 20-10 (tarde).

## 0. Alcance y límites (leer primero)
- **Muestra: n = 3** (§9): recap de evento, tutorial animado y demo de pantalla; tres formatos distintos de terceros. Son patrones observados, no reglas. Las §1–§8 se midieron sobre la Referencia 1.
- **Sin métricas de rendimiento** de ninguna referencia (alcance, guardados, retención; vistas y reacciones públicas **no capturadas**, ver §9.4). No sabemos si funcionó; ninguna decisión de §4 se apoya en que funcionara.
- Medido en sesión de Claude Code el 21-10-2026 con `ffprobe`, `ffmpeg` (ebur128, scene detection, silencedetect) y Whisper `small`. Whisper se equivoca en algunas frases y puede adelantar la voz hasta ~1 s: se usa para ubicar tramos, **no como cita**.
- Organizador, marca y autoría del reel: **NO CONFIRMADO**.
- Sin video, frames, nombres de personas, handles de cuentas ni citas en el repo (política de assets). Las referencias se llaman "Referencia 1/2/3"; los handles viven en `CEINCA-WORKSPACE/DIGITAL_MENTOR/REFERENCIAS_VIDEO.md`.

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
| Loudness | −14,1 LUFS | Pipeline de reel de `ceinca-video-fx`: master **−16 LUFS** (`.claude/skills/ceinca-video-fx/SKILL.md`, secciones "Reel con voz grabada" y receta "reel v5"; cabecera de `scripts/musica.mjs`). Otra pieza de CEINCA se entregó a −14,1 LUFS (`handoff.md`, sesión "Reel de testimonios Casa & Campo", 29-08-2026) | Coexisten dos objetivos. El −14 es medida de esta referencia, no estándar nuestro; otras referencias descargadas también miden −14,1, así que puede ser normalización de la plataforma sobre el archivo (NO CONFIRMADO). Probar antes de cambiar. |

Nota: el PR #35 (Bloques 1–3 de `ceinca-video-fx`) está **mergeado en `main` (1f0ad36)**. Pero `reel-voz`, `musica` (master −16 LUFS), `badge`, los subtítulos de `reel-voz`, `carrusel` y los slides son **posteriores al squash** y siguen solo en la rama remota `feature/ceinca-video-fx-bloque3` (29 commits por delante de `main` al 21-10-2026). Las rutas de `SKILL.md` citadas en esta tabla corresponden a esa rama.

## 4. Qué sirve y qué no (para @soyeduardo.ia)
| Elemento | Decisión | Razón |
|---|---|---|
| Palabra grande en el primer segundo | **Adaptar** | Una palabra, no una frase. Efectos disponibles en `ceinca-video-fx` (`texto-cristal`, `subtitulos-karaoke`; en `main` desde 1f0ad36). |
| Prueba social al abrir | **Adaptar, con reserva** | Nuestra prueba es "lo hizo la IA": captura o clip del resultado. Los testimonios entran cuando existan, dentro de la destacada "Lo dicen ellos". |
| Tarjeta final con un solo CTA | **Adoptar** | Un solo CTB por pieza ya es práctica del sistema. Aquí el CTA es una palabra clave, no una reserva. |
| Mapa de LATAM | **Posponer** | Solo tiene sentido con clientes o alumnos en varios países. Hoy no hay dato que lo respalde. |
| Subtítulos pequeños sin caja | **No adoptar** | Los subtítulos de `reel-voz` con zona segura fueron aprobados por Eduardo en la v5 (20-10, `handoff.md`); el código de `reel-voz` es posterior al squash del PR #35 y no está en `main`. |
| 90 s y 2,4 s/plano | **No adoptar tal cual** | Es de resumen de evento; nuestros reels van a 15–30 s. |
| Estética globo y neón | **No adoptar** | Es de otra marca. |
| −14 LUFS | **Sin respaldo como práctica de los referentes** | El origen del −14,1 es **NO CONFIRMADO**: puede ser normalización de la plataforma, y una pieza propia de CEINCA también se entregó a −14,1 (ver §3), así que no es un valor ajeno a nuestro flujo. Prueba para cerrarlo: medir un reel propio ya publicado (descargado) contra su archivo original. No tocar `musica.mjs` hasta entonces. |

**Dependencia técnica:** sin tema propio, los efectos salen con la marca CEINCA (navy, Manrope). @soyeduardo.ia es una **marca propia** de Eduardo Rodríguez, no un cliente: su tema es `marca-soyeduardo-ia` (`.claude/skills/ceinca-video-fx/themes/marcas/soyeduardo-ia.json` → `themes/marca-soyeduardo-ia.css`, tinta/lima + Sora 800 y Manrope). Uso: `--tema marca-soyeduardo-ia`. **Estado:** commit en la rama local `feature/ceinca-video-fx-marcas` (sobre `main`), **sin push al 21-10-2026**: otra sesión o persona no lo encontraría en el remoto.

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
- **Bloqueo real:** decidir qué se entrega por DM (§9.5, idea A); de eso depende la palabra clave. Criterio: un recurso que ya exista y sea literalmente cierto (guía corta o el prompt exacto de una pieza), no la skill (exige Node, FFmpeg y Chromium, y su pipeline de reel —`reel-voz`, `musica`, `badge`— aún no está en `main`).
- **Opcionales, no cambian ninguna decisión:** medir un reel propio publicado contra su original (origen del −14,1; solo si se decide cambiar el master de `musica.mjs`, hoy congelado en −16) y capturar las métricas públicas de las 3 referencias (n = 3 de formatos distintos no indica cuál copiar; solo si cuesta pocos minutos desde el celular).
- Sonido: si interesa, analizar música/BPM/SFX en una pasada aparte.

## 9. Referencias 2 y 3 (añadidas en v0.3)
Medido con `ffprobe`, `ffmpeg` (ebur128, scene, silencedetect) y Whisper `small`; lectura visual por hoja de contactos (cada 3 s en la 2, cada 1,5 s en la 3), de modo que puede faltar texto breve en pantalla.

### 9.1 Comparativa
| Dato | Ref. 1 (recap de evento) | Ref. 2 (tutorial animado) | Ref. 3 (demo de pantalla) |
|---|---|---|---|
| Duración | 90,6 s | 47,7 s | 26,7 s |
| Formato | 720×1280, 29,97 fps | 720×1280, 30 fps | 720×1280, 30 fps |
| Cortes / ritmo | 36 cortes, 2,4 s/plano | **0 detectados**: una composición animada continua | 11 cortes (12 planos), **2,2 s/plano** |
| Voz | Testimonios | Sí: 128 palabras, 2,7 palabras/s | **Sin voz**: música y texto en pantalla (Whisper solo alucina sobre la música) |
| Loudness | −14,1 LUFS, LRA 6,1 | −14,1 LUFS, LRA 1,7 | −14,1 LUFS, LRA 7,1 |
| Pico real | −1,4 dBFS | **+2,8 dBTP** (sobre 0: defecto de limitado y recompresión, no modelo de calidad) | −1,7 dBTP |
| CTA | Reserva externa | "Comenta [palabra de marca]" + "acceso gratis" a una masterclass | "Comenta [palabra genérica]" + biblioteca "gratis" |

### 9.2 Referencia 2 — tutorial animado, sin persona en cámara
- **Estructura (tiempos de Whisper, ±1 s):** 0–4 s afirma que el propio video lo hizo una IA; 4–7 s promete enseñar a hacer uno igual en 4 pasos; ~7–36 s los 4 pasos con contador "PASO N DE 4" y barra de progreso; ~36–41 s "esto que ves es el resultado" con la línea de tiempo del editor; 41–46 s CTA: seguir y comentar una palabra clave.
- **Estilo:** fondo oscuro con naranja, tipografía condensada grande, chip naranja que resalta una palabra por subtítulo, mockup de comentario con la palabra tecleada y cierre "COMENTA [PALABRA]".
- **Regla de 7 s (§1.4):** cumple 2 de 3 (de qué trata y beneficio); **no hay quién hable** (sin cara).
- **Choque de marca:** su gancho es casi literal el concepto "Lo hizo la IA", y su CTA usa la palabra de marca que nuestro banco excluye (`CTB_KEYWORDS_SOYEDUARDO_IA.md` §1). Diferenciarse con la cara y el proceso reales.
- **Reproducibilidad:** el contador y el estilo equivalen a `badge.mjs` y los efectos de `ceinca-video-fx`; pero esa skill requiere Node, FFmpeg y Chromium, y su pipeline de reel (`reel-voz`, `badge`, `musica`) aún no está en `main`.

### 9.3 Referencia 3 — demo de pantalla con gancho de curiosidad
- **Estructura (lectura visual):** 0–~3 s gancho a cámara con advertencia ("úsala con responsabilidad"); ~3 s "guarda esto" (coincide con `SISTEMA_VIRAL` §1.3: "guarda" funciona mejor temprano); ~3–21 s demo: foto de un profesional trabajando → instrucción a una herramienta de IA → infografía; ~21–26,7 s cierre a cámara con CTA y recurso gratis.
- **Duración:** 26,7 s, dentro del hook de §9.4 de `SISTEMA_VIRAL` (15–30 s).
- **No copiable tal cual:** el texto va en voseo rioplatense (`RULES/ESTILO_REDACCION.md` exige tuteo) y su palabra clave es genérica (excluida en nuestro banco).
- **Qué hace el ejemplo (observado):** convierte una foto en una infografía promocional de salud con recomendaciones y cifras generadas por la IA. Nada de lo visto sugiere falsificación, pero el contenido de salud sin verificar **no se replica sin contrastarlo** (`RULES/ANTI_HALLUCINATION.md`, `RULES/POLITICA_EVIDENCIA_Y_HERRAMIENTAS.md`). El gancho de advertencia solo se usa si hay un riesgo real que explicar.

### 9.4 Lo que NO se sabe
- **Métricas públicas** (vistas, me gusta, comentarios, seguidores a la fecha de captura): **NO CAPTURADAS**; requieren el enlace de cada publicación. Sin ellas no se puede decir cuál funciona, y aun con ellas no sería causal.
- **Origen del −14,1 LUFS:** NO CONFIRMADO (ver §3 y §4).
- Si el "acceso gratis" de la Ref. 2 y la "biblioteca gratis" de la Ref. 3 son literalmente ciertos: no verificado.

### 9.5 Ideas para @soyeduardo.ia (ninguna se produce sin palabra aprobada y automatización probada: candado de §6)
| Idea | Qué toma | Condición |
|---|---|---|
| **A. Tutorial con cara** | Estructura de 4 pasos con contador y cierre que muestra el propio resultado; con Eduardo a cámara y su proceso real como prueba | **Decidir qué se entrega por DM** (¿zip de la skill, un prompt, una guía?). De eso depende la palabra clave. Si es la skill, avisar que exige Node, FFmpeg y Chromium. |
| **B. Demo adaptada** | Gancho de curiosidad, "guarda esto" hacia el segundo 3, demo de un resultado propio y cierre a cámara, en tuteo; ~25–30 s | Contenido verificado; sin advertencia sin riesgo real. |
| **Ritmo** | 2,2 s/plano de la Ref. 3 como guía para la parte de demo | Solo orientativo (n = 1 por formato). |
