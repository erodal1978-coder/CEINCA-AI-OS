# Manual de producción de video — @soyeduardo.ia
**Versión 1.0 · 22-10-2026 · basado en el reel 1 (GOLEM), el único producido y publicado**
Equivale, para esta cuenta, a `CEINCA_FLOW_VIDEO_DIRECTOR_SYSTEM_v3.0` de CEINCA. **No repite** lo que ya está en: `PRODUCTION/FLOW_SISTEMA.md` (reglas de Flow), skill `ceinca-video-fx` (`SKILL.md`, sección "Reel con voz grabada") y `ESTILO_VIDEO_REFERENCIA.md` (estudio de 5 referencias). Aquí va el flujo de punta a punta y lo aprendido. Todo dato marcado con n = 1 sale de un solo reel.

## 1. Flujo de punta a punta
| Fase | Qué se hace | Herramienta | Candado |
|---|---|---|---|
| 0. Palabra y recurso | Elegir keyword aprobada del banco y el recurso que se entrega | `CTB_KEYWORDS_SOYEDUARDO_IA.md` | Sin palabra aprobada y recurso real, no se produce |
| 1. Guion | Diálogo por clip: **8 s = 14 a 16 palabras; 10 s = 17 a 20** | Claude | Afirmaciones sobre herramientas con fecha |
| 2. Fondo | Fotograma/fondo del set (reel 1: `FONDOS/Oficina_Eduardo_IA.png`) | Imagen IA | Misma luz y ropa en todo el reel |
| 3. Clips | Generar en Flow con el avatar | Flow (`FLOW_SISTEMA` §7.1, §13.4) | Ver §2 |
| 4. Evaluar clip | Transcribir y revisar cada clip | `REEL_1_GOLEM/PROMPTS/evaluar_clip.sh` (Whisper) | Rehacer solo con autorización de Eduardo |
| 5. Montaje | Jump-cuts sobre la voz, sin pausas > 0,5 s | `reel-voz.mjs` (tema `marca-soyeduardo-ia`) | — |
| 6. Subtítulos | Whisper → karaoke de 4 palabras, reemplazo "cloud" → "Claude" | `subtitulos-whisper.mjs` + `voz-ventanas.mjs` | Ver §4 |
| 7. Capas | Sello LO HIZO LA IA y tarjeta de cierre con `{ER}` | `REEL_1_GOLEM/MONTAJE/overlays.mjs` | — |
| 8. Música y SFX | Pista bajo la voz; SFX del banco general | `musica.mjs`; `CEINCA-WORKSPACE/RECURSOS_GENERALES/` | Música de uso comercial NO CONFIRMADO |
| 9. Verificación | Formato, A/V, −16 LUFS, sin silencios, keyword exacta | `check.sh reel reel.mp4 reel-voz.json` | Debe pasar |
| 10. Publicación | Copies y automatización | `MANUAL_COPY_SOYEDUARDO_IA.md`, skill `meta-automatizaciones-mbs` | Automatización **antes** de publicar |

Comandos exactos de las fases 5 a 9: `ceinca-video-fx/SKILL.md`, sección "Reel con voz grabada", pasos 3 a 5. Archivos del reel 1 como plantilla: `CEINCA-WORKSPACE/SOY_EDUARDO_IA/REEL_1_GOLEM/` (`MONTAJE/reel-voz.json`, `karaoke.json`, `overlays.mjs`; `PROMPTS/`).

## 2. Flow: reglas que importan a esta cuenta
- **Modo por escena, no por pieza:** escena con el avatar hablando → **Ingredientes** (fotograma guardado + avatar); escena sin avatar → Fotogramas (`FLOW_SISTEMA` §13.4).
- **Fotogramas no conserva la voz del avatar** (verificado el 21-10-2026; evidencia en `CEINCA-WORKSPACE/03 FORMACION/CURSO FLOW/EVIDENCIAS/`).
- **Avatar:** se nombra como "el protagonista" sin descripción física. **Personajes nuevos** (p. ej. el reel 2 de transformación) sí necesitan descripción: es una excepción a documentar en el prompt.
- **Ropa:** fijarla en el prompt ("camiseta azul clara"); en el reel 1 un clip salió con camiseta negra y hubo que rehacerlo.
- **Pronunciación:** el avatar dijo "Cloud" por Claude; se corrige en subtítulos, no en la voz.
- **Créditos (cuenta Pro, n = 1):** ~12 por clip de 8 s y ~15 por clip de 10 s; el reel 1 costó ~78 créditos más 12 de una prueba de voz. Un reel de 5 clips ronda los 60 créditos.

## 3. Especificación técnica de salida
| Dato | Objetivo | Reel 1 (medido) |
|---|---|---|
| Formato | 1080×1920, 30 fps | 1080×1920, 30 fps, HEVC |
| Duración | 25–30 s (referencias: 26,7–47,7 s) | 27,8 s |
| Loudness | **−16 LUFS** (lo exige `check.sh reel`) | −16,4 LUFS, pico real −1,3 dBFS |
| Pausas | Ninguna > 0,5 s; sin silencio inicial | OK |

No usar −14 LUFS como objetivo: las 5 referencias miden −14,1 a −14,5, pero el origen (recodificación de la plataforma o máster) está **NO CONFIRMADO**.

## 4. Mejoras obligatorias para el próximo reel (lecciones del reel 1)
1. **Subtítulos desde 0 s.** En el reel 1 empezaron en ~2,7 s: los primeros segundos, que deciden la retención, iban sin texto.
2. **Sin palabras pegadas en el resaltado.** Salieron "CREOCONTENIDO", "CARRUSELESCALENDARIO", "FREELANCERO": revisar el espaciado del karaoke.
3. **CTA visible hasta el final (≥ 3 s).** "COMENTA GOLEM" duró ~2 s antes de la tarjeta de cierre.
4. **Etiqueta con el nombre en los primeros 3 s** (regla de 7 s: quién habla, de qué trata, para quién).
5. **Más cortes.** El reel 1 tuvo 1 corte de plano (en 7,07 s) más los jump-cuts; las referencias van a 2,2–2,4 s por plano.
Estas cinco pasan a la plantilla de subtítulos de la skill (pendiente).

## 5. Sonido
- **SFX:** 15 sonidos propios, sintetizados en local, en `CEINCA-WORKSPACE/RECURSOS_GENERALES/SFX/` (índice: `BANCO_SFX.md`). Escuchar antes de usar. Para el reel 2 falta un **chasquido** sincronizado con el cambio de fondo.
- **Música:** `RECURSOS_GENERALES/MUSICA/Midday_Meridian.mp3` (generada con Gemini Pro). **Uso comercial NO CONFIRMADO**: no usar en anuncios pagados hasta revisar los términos vigentes de Google.

## 6. Marca dentro del video
- Tema `marca-soyeduardo-ia` (tinta/lima, Sora 800 + Manrope). Reglas de color y tipografía: `MANUAL_IDENTIDAD_VISUAL_SOYEDUARDO_IA.md` y `MANUAL_TIPOGRAFIA_SOYEDUARDO_IA.md`.
- `"logo": false` en `reel-voz.json`: la opción `logo` de la skill dibuja la insignia de **CEINCA**. En esta cuenta, la marca va por `overlays.mjs` (sello y cierre con `{ER}`).
- Sello LO HIZO LA IA en toda pieza de prueba.

## 7. Distribución
- Mismo video en Instagram y TikTok; Facebook en paralelo desde Instagram.
- Idea pendiente de probar: compartir el reel en historias con captura + frase de curiosidad + sticker de enlace (no reenviarlo tal cual). Que suba el alcance es una afirmación de una referencia, **no verificada**.
- Medir a 1 h, 24 h y 72 h: vistas, alcance, % de no seguidores, guardados, compartidos, comentarios con la palabra, DMs entregados y seguidores nuevos.

## 8. Checklist antes de exportar
- [ ] ¿Palabra aprobada, recurso real y automatización creada?
- [ ] ¿Diálogos dentro del rango de palabras por duración?
- [ ] ¿Misma ropa y luz en todos los clips?
- [ ] ¿Subtítulos desde 0 s, sin palabras pegadas, "Claude" bien escrito?
- [ ] ¿Nombre en pantalla en los primeros 3 s?
- [ ] ¿CTA con la palabra visible ≥ 3 s al final?
- [ ] ¿Sello LO HIZO LA IA y cierre con `{ER}`?
- [ ] ¿`check.sh reel` en verde (−16 LUFS, sin silencios)?
- [ ] ¿Música apta para el uso que se le va a dar?
