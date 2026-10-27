# PLAN MAESTRO — 2 reels + 1 carrusel @soyeduardo.ia · regalo: la skill de efectos de video (ÑAPA)
27-10-2026 · Rama `claude/soyeduardo-content-audit-ultq4l` · Análisis de las referencias: `docs/PLAN_REELS_CARRUSEL_SKILL_27-10-2026.md` (este archivo es el plan ejecutable y lo reemplaza como guía de trabajo)

Convenciones: **[E]** = Eduardo · **[CC]** = Claude Code en tu máquina (repo local) · **[C]** = Claude en el chat/nube. `N` = cifra de efectos que **pasen render** (se rellena en F1). Todo texto entre «» o en bloques de código está listo para copiar.

---

## 0. Decisiones cerradas
| Tema | Decisión |
|---|---|
| Palabra clave | **ÑAPA** (banco CTB nº 66). Una palabra = un recurso: la skill |
| Cifra | **"+20"** solo si ≥21 efectos pasan render; si no, la cifra exacta |
| Audio | **−14 LUFS**, pico real ≤ −1,0 dBTP. Música propia (Gemini): uso comercial confirmado |
| Fondo / paleta | **Tinta `#0B0D12`**, grafito `#1A1E27`, lima `#C6FF3D` (un solo elemento lima por pantalla), hueso `#F3F0E8`. Sora 800 títulos · Manrope texto · JetBrains Mono etiquetas |
| Sello fijo | `LO HIZO LA IA` (cápsula lima, texto tinta) y cierre hablado «Lo hizo la IA. Lo dirigí yo.» |
| Prohibido | Asterisco/logo de Claude en logo o @ · cifras sin fuente · "revolucionario", "brutal" · prometer dinero · "esto lo cambia todo" |
| GOLEM | Descartada (entrega un prompt, no la skill) |

## 0.1 Decisiones que faltan (marca la tuya; mi recomendación va primero)
| # | Pregunta | Recomendación |
|---|---|---|
| D1 | ¿La skill regalo lleva tu nombre? | Sí, créditos en `LEEME` + tema **neutro** por defecto (sin tu paleta). El kit actual dice "no es producto de Eduardo": hay que cambiar esa frase |
| D2 | Fuente de voz y cara del Reel A | **Una toma continua grabada por ti** (28 s, con teleprompter). Mejor prueba de esfuerzo cero que 3–4 clips de Flow (8–10 s, cortes visibles) |
| D2b | Vocero del Reel B | Grabarlo tú (misma sesión que el A). Alternativa: 5 clips de Flow (§4.5) |
| D3 | Nombre público de la skill | `video-fx` (hoy `ceinca-video-fx`, con "ceinca" en carpeta y frontmatter) |
| D4 | ¿Qué hace la persona que no tiene Claude Code? | Aclarar en el DM que necesita Claude Code + Node + FFmpeg (ver el DM del §4.1); no prometer "un clic" |

---

## 1. Bloqueantes (nada se publica antes de esto)
1. **[E] Subir el repo local a GitHub** cuando haya luz (ramas `feat/video-fx-reel-voz-musica`, `feature/ceinca-video-fx-marcas` y la de docs). Hasta entonces yo no toco código: chocaría con 25 commits locales.
2. **[CC] N verificado** con evidencia de render (F1).
3. **[E] Probar ÑAPA** con cuenta secundaria; comprobar que el comentario fijado **no** dispara el DM.
4. **[CC] Kit público limpio** (cero menciones de marca ajena) y probado en entorno limpio (F2).

---

## 2. Fases (cada una termina con criterio de aceptación medible)

### F0 · Preparación [E] · ≈20 min
- [ ] Decide D1–D4.
- [ ] Confirma que ÑAPA no está activa en @soyeduardo.ia para otro recurso.
- [ ] Reúne: foto real de referencia (para ChatGPT), pista de música de Gemini, `tablero_marca.png` y `soyeduardo-ia.json`.
- [ ] Sube el repo local.
**Aceptación:** repo subido; D1–D4 respondidas.

### F1 · Base técnica [CC] · 1–2 sesiones
Pega este prompt en Claude Code, en la raíz del repo local:
```
Trabaja en .claude/skills/ceinca-video-fx. No hagas commit hasta mostrarme el informe.
1) Compara el zip "Video_FX_Starter_Kit_sin_marca.zip" (ruta: ~/Descargas) con la skill actual: lista archivos nuevos/distintos. Trae el Bloque 6 (bento-grid, barra-prompt, carrusel-blur, catalogo-lateral) sin sobrescribir cambios locales: usa un diff y fusiona a mano.
2) node scripts/doctor.mjs y bash scripts/check.sh estatico. Informa qué falta (Node>=22, FFmpeg, Chromium).
3) Renderiza CADA efecto HTML (25) en vertical y horizontal con --tema marca-soyeduardo-ia, y CADA efecto de clip (zoom-digital, zoom-corte, zoom-atras, lupa-zoom, foco-spotlight, fragmentos-shatter, pantalla-verde) con clips de prueba. Usa node scripts/render.mjs --solo-auditoria primero y render completo después.
4) Entrega una tabla: efecto | render OK | zonas seguras OK | legible a 1,1 s (sí/no) | salida del comando. N = efectos con todo OK. No declares OK sin haberlo ejecutado.
5) Inconsistencia de audio: scripts/audio.mjs normaliza a -14 LUFS pero scripts/check.sh reel exige -16 ±1,5 (rango -17,6..-14,4), por lo que -14,0 FALLA. Cambia check.sh a un perfil -14 ±1 LUFS y pico real <= -1,0 dBTP, conserva el perfil -16 como opción (--lufs 16) y documenta el cambio.
6) Comprueba si catalogo-lateral acepta un clip de video en el marco derecho. Si no, deja el comando ffmpeg de composición (lista izquierda + clip derecho) y pruébalo.
7) Comprueba si pasos-progreso desenfoca los pasos futuros (opacidad .35 + blur 4px). Si no, propón parámetro opcional.
```
**Aceptación:** tabla con N; `check.sh reel` pasa un MP4 real a −14 LUFS; informe sin "OK" sin evidencia.
**Regla:** si N < 21 → título "N efectos" (nada de "+20"). Si 14 ≤ N < 21 → plan B: construir de los 5 efectos sin recorte de persona que faltan (Portal, Infinite Zoom, Cube Spin, Tile Tunnel, Phone Fan) solo si Eduardo quiere insistir en "+20".

### F2 · Kit regalo + embudo ÑAPA [CC] + [E]
**[CC] construir el kit público** (script nuevo `scripts/build-public-kit.sh`, no tocar el flujo interno):
```
Crea scripts/build-public-kit.sh que copie la skill a dist/video-fx/ y: (a) renombre la carpeta y el frontmatter a "video-fx"; (b) elimine themes/marca-soyeduardo-ia.*, themes/cliente-eduardo-ia.*, themes/clientes/eduardo-ia.json, themes/marcas/soyeduardo-ia.json y reescriba brand.lock.json; (c) cambie los ejemplos que usen "marca-soyeduardo-ia" a "estilo-dark-tech"; (d) reescriba la descripción de SKILL.md sin "CEINCA" ni "@soyeduardo.ia" (<=1024 caracteres); (e) deje PROMPT_ADAPTAR_MARCA.md y LEEME en español; (f) agregue CREDITOS.md: "Creado por Eduardo Rodríguez (@soyeduardo.ia)" y licencias de GSAP y fuentes; (g) termine con: grep -ril "ceinca\|soyeduardo\|eduardo" dist/video-fx debe dar 0 coincidencias salvo CREDITOS.md; (h) genere dist/video-fx.zip sin mp4 ni node_modules.
Antes: lee vendor/gsap/LICENSE.md y dime si permite redistribuir GSAP dentro del zip. Si no está claro, NO lo redistribuyas: el kit debe instalar GSAP con npm.
```
**Pruebas obligatorias**
- [ ] `unzip` en carpeta vacía → `node scripts/doctor.mjs` → render de `examples/portada.json` con `estilo-dark-tech`.
- [ ] Con `PROMPT_ADAPTAR_MARCA.md` y un **tercero de prueba** (marca inventada), el tema nuevo renderiza.
- [ ] [E] Subir el zip a claude.ai como skill y comprobar qué funciona en el chat (el handoff del 23-10 lo marca "no probado").
**[E] Drive y Beacons**
- [ ] Subir `video-fx.zip` a Drive (carpeta pública con enlace; permiso "cualquiera con el enlace: lector").
- [ ] Bloque en Beacons (§5.5).
**[E] Meta (antes de publicar)**
- [ ] Automatización ÑAPA: disparador **"contiene"**; añade también la variante **"napa"** si Meta permite varias palabras (no verificado: confírmalo en tu Business Suite; si no, usa solo "ñapa" y deja el aviso «escribe ÑAPA» en el comentario fijado).
- [ ] Respuesta pública (A/B/C del §5.1) + DM (§5.1).
- [ ] Prueba con cuenta secundaria: llega el DM, el enlace abre, y el comentario fijado no dispara nada.
**Aceptación:** grep de fugas = 0; prueba en entorno limpio OK; DM recibido en cuenta secundaria con el enlace funcionando.

### F3 · Reel A "+20 efectos hechos por Claude" · 25–29 s
**Estructura y tiempos** (efecto cada ≈1,1 s; la lista numerada va a la izquierda, ≥34 px):
| t (s) | Pantalla | Voz |
|---|---|---|
| 0,0–1,8 | Título fijo `+20 efectos de video hechos por Claude` + sello lima. Efecto 1 ya corriendo | «Todo esto lo hizo Claude.» |
| 1,8–24,9 | 21 efectos × 1,1 s; la fila activa de la lista pasa a píldora hueso con texto tinta | Solo el nombre del efecto |
| 24,9–29,1 | Lista desaparece; tú al centro; píldora lima | «Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.» |

**Orden sugerido (se ajusta a lo que pase F1; alterna "sobre tu cara" y "escena UI" para mantener el ritmo):**
1 Muro de videos · 2 Zoom digital · 3 Bento · 4 Lupa · 5 Barra de prompt · 6 Foco · 7 Pasos con progreso · 8 Fragmentos · 9 Teléfono con chat · 10 Zoom de corte · 11 Consola · 12 Rompe marco · 13 Diagrama de nodos · 14 Corta y pega · 15 Carrusel blur · 16 Zoom atrás · 17 Gráfica que crece · 18 Vértigo · 19 Subtítulos karaoke · 20 Pantalla verde · 21 Zoom a través. Reservas: Checklist, Órbita, Mundo app, Collage de papel, Cámara continua, Muro de titulares.
Regla: si un efecto no se entiende en 1,1 s, se sustituye por una reserva. «Pantalla verde» solo si grabas la toma con fondo verde; si no, entra una reserva.

**Producción**
1. **[E]** Grabar una toma continua diciendo la lista (teleprompter). Mismo atuendo y luz que tu foto de perfil. 1080×1920, 30 fps.
2. **[CC]** Efectos sobre tu cara: `node scripts/clip.mjs <json> -o out/<id>.mp4` usando `recorte {desde, hasta}` sobre **la misma toma** para cada segmento de 1,1 s.
3. **[CC]** Escenas UI: `node scripts/render.mjs <json> --tema marca-soyeduardo-ia --formato vertical -o out/<id>.mp4` con `duracion: 1.2`.
4. **[CC]** Unir en orden, componer la lista lateral (F1.6) y el cierre. Subtítulos desde 0 s con `subtitulos-karaoke` vía `overlay.mjs`.
5. **[CC]** Audio: tu voz + música de Gemini en cama baja + un SFX corto por cambio (`scripts/audio.mjs`, `scripts/sfx_synth.py`). Voz siempre por encima. Normalizar a −14 LUFS.
6. **[CC]** Portada del reel (frame legible a 110 px): título + tu cara + sello.
**Aceptación (medir con ffmpeg/ffprobe y mostrar la salida):** 1080×1920 · 30 fps · 24–30 s · subtítulos desde 0 s · CTB ≥ 3,5 s · LUFS −14 ±1 · pico real ≤ −1,0 dBTP · nada de texto clave en zona insegura (250/350 px) · cero asterisco de Claude.
**Gancho de respaldo** (si la retención a 3 s sale baja): «Esto no lo editó nadie. Lo hizo Claude.»

### F4 · Reel B "Por qué los videos de Claude salen planos" · 44 s
**Fuente del vocero (decide D2b):** (a) **grabarlo tú** en la misma sesión del Reel A, con la misma ropa y luz (≈10 min extra, sin Flow, sin etiqueta de IA) · (b) **5 clips de Flow encadenados**, prompts en §4.5. **Recomendación: (a)**; usa (b) solo si prefieres no grabar. Ojo: en el plan anterior olvidé los prompts de Flow para este reel; ya están en §4.5.
La voz va partida en 5 bloques que coinciden con los 5 clips de Flow (8–10 s, palabras según `FLOW_SISTEMA` §4.1), así el guion sirve igual si lo grabas tú.
| t (s) | Pantalla (split-pip: escenario arriba, tú abajo, subtítulos al centro) | Voz |
|---|---|---|
| 0–8 | Mismo prompt, dos resultados: izquierda plano · derecha con tu marca → menú de 4 pasos, paso 1 activo, los demás borrosos · `tablero_marca.png` | «Mismo prompt. Una versión es plana. Te enseño por qué. Paso uno: elige una referencia visual.» (16 palabras) |
| 8–18 | Menú paso 2 · `consola-macos` escribiendo tu `soyeduardo-ia.json` real (colores y fuentes) | «Es el punto de partida. Paso dos: conviértela en un solo archivo. Colores, tipografías y cómo se mueve todo.» (19) |
| 18–26 | Menú paso 3 · `barra-prompt`: «hazlo bonito» → plano; «un botón que pasa a un check lima» → resultado | «Paso tres: adjunta el archivo y pídele un momento concreto: un botón que pasa a check.» (16) |
| 26–36 | `render.mjs --solo-auditoria` en consola → menú paso 4 → edición de `params.json` y render | «Antes de entregártelo, una auditoría automática revisa zonas seguras y audio. Paso cuatro: cambia las palabras y exporta.» (18) |
| 36–44 | Cierre: tú al centro, píldora lima | «Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.» (14) |
Reglas: el A/B de los primeros segundos debe ser **real** (mismo prompt, con y sin archivo de marca) y sin retoques; el menú reaparece 3 veces (no 4); ninguna escena pasa de ≈4,5 s; si un paso no corre así en tu sistema, se cambia el guion, no la demo.
**Aceptación:** las mismas del Reel A + el A/B reproducible (guarda los dos prompts y salidas) + si usas Flow: rostro, ropa y voz consistentes en los 5 clips.

### F5 · Carrusel "Construí +20 efectos de video para Claude. Te los regalo." · 8 láminas 1080×1350
**Assets de personaje [E]** (con tu foto de referencia; elige por parecido):
```
Usa la foto adjunta como referencia exacta del rostro (no cambies rasgos, edad ni lentes). Haz una caricatura de ilustración a línea, estilo boceto de pizarra, del hombre de la foto, busto y cuerpo completo. Trazo fino color hueso #F3F0E8 sobre fondo tinta #0B0D12, sin relleno de color salvo una pequeña mancha lima #C6FF3D en un solo objeto. Hoja de personaje con tres poses: señalando hacia arriba a la derecha, sosteniendo una tarjeta de video con un icono de play, brazos cruzados con media sonrisa. Proporciones ligeramente exageradas, expresión cercana y segura. Sin texto, sin logos, sin robots.
```
```
Un cursor de texto vertical "▍" color lima #C6FF3D con dos ojos pequeños y brazos de línea finos, estilo boceto, en tres poses: señalando, sosteniendo una pantalla, saludando. Trazo hueso #F3F0E8 sobre fondo tinta #0B0D12, plano, sin sombras, sin texto.
```
Pide fondo transparente o recórtalo. **El texto nunca lo genera la IA de imagen.**

**Maquetación [CC]:** HTML a 1080×1350 con los tokens de `soyeduardo-ia.json` + captura con Playwright. (Hoy `~/repos/carrusel-export` solo tiene la paleta CEINCA; léelo y decide si se le añade un tema o se maqueta en HTML aparte.) Cada lámina de contenido lleva **una captura real** (`render.mjs --frame <s>`).

**Copy por lámina** (la lista se ajusta a lo que pase F1; si un efecto no pasa, no aparece):
1. **Portada:** kicker `LO HIZO LA IA` · «Construí **+20 efectos de video** para Claude. Te los regalo.» · «Desliza → te muestro cada uno funcionando» · caricatura.
2. **Datos y UI:** Bento grid — métricas en cuadrícula animada · Gráfica que crece — números que se cuentan solos · Checklist — pasos que se tachan en pantalla · Pasos con progreso — tutoriales con barra de avance · Catálogo lateral — lista numerada + clip.
3. **Apps y chat:** Teléfono — tu pantalla dentro de un móvil · Chat en teléfono — conversaciones que se escriben solas · Barra de prompt — un prompt que se escribe y responde · Consola — comandos con efecto máquina de escribir · Diagrama de nodos — procesos como mapa conectado.
4. **Texto:** Muro de titulares — noticias en mosaico con foco · Texto cristal — panel de vidrio sobre imagen · Portada — titular con revelado · Garabato vivo — flechas y subrayados a mano · Carrusel blur — tarjetas veloces que frenan en seco.
5. **Cámara y profundidad:** Vértigo — el fondo se estira, tú no · Zoom a través — transición que atraviesa el cuadro · Cámara continua — una toma que baja por la escena · Rompe marco — sobresales de la tarjeta · Collage de papel — recortes en stop-motion.
6. **Sobre tu clip:** Zoom digital — acercamiento continuo · Zoom de corte — simula dos cámaras · Zoom atrás — del plano cerrado al abierto · Lupa — amplía una zona · Foco — oscurece todo menos lo importante.
7. **Más herramientas:** Fragmentos — cristal roto que encaja · Pantalla verde — cambia el fondo · Corta y pega — efecto sticker · Subtítulos karaoke — palabra por palabra · **Tu marca en un solo archivo** — colores y tipografías.
8. **CTA:** «Comenta **ÑAPA** y te mando la skill» · Guarda · Comparte · Comenta · «Lo hizo la IA. Lo dirigí yo.» · @soyeduardo.ia.
**Reglas de diseño:** fondo Tinta · trazo hueso · lima solo como resaltador (banda lima + texto tinta, contraste 16,4:1) · un elemento lima por lámina · títulos Sora 800 · ≤5 ítems por lámina · texto legible a 360 px de ancho · sin texto de IA de imagen.
**Aceptación:** 8 PNG 1080×1350; prueba de lectura a 360 px; todas las capturas son renders reales; cero asterisco de Claude.

### F6 · Publicación y medición
**Orden y cadencia:** Día 0 Reel A → Día 2 Carrusel → Día 4 Reel B. Hora: la de mayor actividad en tus Insights (no tengo dato propio). TikTok: mismo video, caption corto, entrega manual.
**Checklist de cada pieza** (del `SISTEMA_VIRAL` §11, adaptado):
- [ ] Caption con primera línea en MAYÚSCULAS + emoji, ≤5 hashtags, tuteo.
- [ ] Comentario fijado escrito **antes** y fijado en los primeros 30 s.
- [ ] Automatización ÑAPA activa y probada.
- [ ] Golden Hour: responder a mano los primeros 5–10 comentarios.
- [ ] Historia con sticker de pregunta/encuesta.
- [ ] Registrar ÑAPA en la tabla 1 de `CTB_PALABRAS_DISRUPTIVAS.md` (repo, Drive y proyecto de Claude).
**Métricas** (1 h, 24 h, 72 h): retención a 3 s, % visto, envíos, guardados (meta ≥ 3 %), % de alcance a no seguidores, comentarios «ñapa/napa», DMs entregados, seguidores nuevos, descargas del zip (si el enlace lo permite).
**Decisiones:** línea base = mediana de tus primeras 10 piezas propias. Gancho con retención a 3 s baja → republicar con el gancho de respaldo. Día 30: decidir qué pilar escalar.

### F7 (opcional) · Gemelo en video del carrusel
Las 8 láminas como reel animado con contador `01/08` (`reel.mjs`), ≤4,5 s por lámina, mismo CTB.

---

## 3. Riesgos y mitigaciones
| Riesgo | Mitigación |
|---|---|
| El zip filtra marca/identidad | `build-public-kit.sh` + grep = 0 (F2) |
| La persona no tiene Claude Code/Node/FFmpeg y se frustra | DM honesto con requisitos, `doctor.mjs`, guía en español; no prometer "un clic" |
| "napa" sin ñ no dispara | Añadir la variante o avisar en el fijado |
| Licencia de GSAP al redistribuir | Revisar `vendor/gsap/LICENSE.md`; si dudoso, el kit lo instala por npm |
| "+20" no se cumple | Regla de N (F1) |
| TikTok sin DM automático | Respuesta manual + enlace solo en bio |
| Efectos ilegibles en 1,1 s | Prueba de legibilidad (F1) y reservas |
| Referencias no son tuyas | Se replica estructura, no contenido, caras ni marca (Anthropic, Apple, Ootto) |

---

## 4. Textos listos

### 4.1 Reel A — IA
Caption Instagram:
```
🎬 +20 EFECTOS DE VIDEO. LOS HIZO CLAUDE. YO SOLO LOS DIRIGÍ.
¿Todavía editas cada zoom, cada título y cada transición a mano?
_______
Esto lo construí para mi propio trabajo y ahora te lo regalo funcionando.

✅ Efectos sobre tu cara: zooms, lupa, foco, fragmentos, rompe marco
✅ Escenas de interfaz: bento, barra de prompt, consola, teléfono con chat
✅ Subtítulos palabra por palabra
✅ Tu marca en un solo archivo: colores y tipografías

Sin editor. Sin plantillas de pago. Sin empezar de cero cada vez.

Guarda este reel 📌 para cuando quieras montar los tuyos. Compártelo 🔁 con quien edita video a mano.

¿Cuál efecto quieres que te enseñe primero?

Comenta ÑAPA
y te mando la skill: los efectos, los ejemplos y la guía para ponerle tu marca. 📲

Sígueme 👉 @soyeduardo.ia porque aquí publico cada herramienta nueva que construyo con Claude.

#Claude #IA #EdicionDeVideo #Reels #Automatizacion
```
Comentario fijado:
```
🎁 Comenta ÑAPA y te mando la skill con los efectos y la guía para ponerle tu marca. Aunque llegues tarde, comenta igual. Si no te llega el mensaje, revisa tus solicitudes de mensajes.
```
Respuestas públicas (rotar A/B/C):
```
A: Listo, te la mandé por mensaje 🎁 Revisa también tus solicitudes de mensajes.
B: ¡Ñapa en camino! Te escribí por mensaje privado. Si no la ves, revisa solicitudes.
C: Enviada ✅ Cuéntame por mensaje qué video quieres hacer primero.
```
DM automático (≤1.000 caracteres; reemplaza `[ENLACE]` y `[N]` en F2):
```
¡Hola! Aquí tienes la ñapa que te prometí 🎁

🔗 Skill de efectos de video para Claude: [ENLACE]

Trae [N] efectos, ejemplos listos para correr y una guía para ponerle TU marca.

Cómo empezar:
1️⃣ Descomprime el zip.
2️⃣ Abre Claude Code en esa carpeta y pídele: «Lee skills/video-fx/SKILL.md y corre el diagnóstico».
3️⃣ Para tu marca, pégale el contenido de PROMPT_ADAPTAR_MARCA.md.

Necesitas: Claude Code, Node 22 o superior, FFmpeg y Chromium. El diagnóstico te dice qué te falta.

Si algo no te corre, respóndeme este mensaje y lo vemos.

Lo hizo la IA. Lo dirigí yo. — Eduardo
Sígueme en @soyeduardo.ia para recibir cada herramienta nueva gratis.
```
TikTok (caption; enlace solo en la bio):
```
+20 efectos de video que hizo Claude 🎬 La skill es gratis: link en mi bio. Comenta ÑAPA y te respondo cómo usarla. #Claude #IA #EdicionDeVideo
```
TikTok — respuesta a comentario:
```
¡Ñapa! 🎁 El enlace de la skill está en mi bio. Cualquier duda con la instalación, escríbeme aquí.
```

### 4.2 Reel B — IA
Caption Instagram:
```
🎬 POR QUÉ LOS VIDEOS DE CLAUDE SALEN PLANOS (Y CÓMO LO ARREGLÉ)
¿Le pides «hazlo bonito» y te sale algo sin gracia?
_______
Mismo prompt, dos resultados. La diferencia no es el prompt: es el archivo de estilo.

✅ Paso 1: una referencia visual clara
✅ Paso 2: un solo archivo con tus colores, tus fuentes y cómo se mueve todo
✅ Paso 3: un momento concreto, no «hazlo bonito»
✅ Paso 4: cambias las palabras y exportas

Sin editor. Sin empezar de cero. Sin adivinar.

Guarda este reel 📌 para cuando hagas tu archivo de estilo. Compártelo 🔁 con quien le pide videos a Claude.

¿Qué referencia visual usarías tú?

Comenta ÑAPA
y te mando la skill con la guía para hacer tu propio archivo de marca. 📲

Sígueme 👉 @soyeduardo.ia porque aquí muestro cómo lo hago, no solo el resultado.

#Claude #IA #MotionGraphics #Reels #Automatizacion
```
Comentario fijado:
```
🎁 Comenta ÑAPA y te mando la skill con la guía para hacer tu archivo de estilo. Aunque llegues tarde, comenta igual.
```
TikTok:
```
Mismo prompt, dos resultados 🎬 El truco no es el prompt: es el archivo de estilo. Skill gratis: link en mi bio. Comenta ÑAPA. #Claude #IA #MotionGraphics
```

### 4.3 Carrusel
Caption Instagram:
```
🎁 CONSTRUÍ +20 EFECTOS DE VIDEO PARA CLAUDE. TE LOS REGALO.
¿Quieres que Claude te haga zooms, títulos, teléfonos con chat y subtítulos sin editar a mano?
_______
Aquí tienes el mapa completo, con una captura real de cada categoría.

✅ Datos y UI
✅ Apps y chat
✅ Texto
✅ Cámara y profundidad
✅ Efectos sobre tu clip
✅ Tu marca en un solo archivo

Sin editor. Sin plantillas de pago. Sin empezar de cero.

Guarda este carrusel 📌 para elegir tu primer efecto. Compártelo 🔁 con quien edita video a mano.

¿Cuál categoría quieres que te muestre en video primero?

Comenta ÑAPA
y te mando la skill con los efectos, los ejemplos y la guía para ponerle tu marca. 📲

Sígueme 👉 @soyeduardo.ia porque aquí publico cada herramienta nueva que construyo con Claude.

#Claude #IA #EdicionDeVideo #Carrusel #Automatizacion
```
Comentario fijado: el mismo del Reel A.

### 4.4 Bloque Beacons
- **Título:** «Skill de efectos de video para Claude 🎁»
- **Descripción:** «+20 efectos, ejemplos y la guía para ponerle tu marca. Gratis.»
- **Botón:** «Descargar la skill» → enlace público de Drive.
- **Nota:** «Necesitas Claude Code, Node 22+ y FFmpeg.»
- Mantén un bloque por palabra clave (ÑAPA = este).

### 4.5 Reel B — prompts para Flow (solo si eliges la opción b)
**Reglas aplicadas** (`PRODUCTION/FLOW_SISTEMA.md`): un párrafo único y autocontenido por clip (§3 r.1, r.9) · sin nombre propio (r.5) · "realista", nunca "hiperrealista" (r.6) · voz especificada en el prompt (r.7) · texto y overlays **en post**, no en Flow (§6) · modo **Fotogramas** en los 5 clips, nunca mezclado con Ingredientes (§13.4) · palabras por duración (§4.1: 8 s = 14–16; 10 s = 17–20) · un microevento cada 2–3 s (§4.2) · cada clip termina en una pose estable que sirve de *start frame* del siguiente (§7.1, §7.3).
**Flujo:** formato 9:16 · 720p · x1 (x2 solo en el clip 1) · captura el **último fotograma** de cada clip y úsalo como *Inicio* del siguiente · escala a 1080×1920 en post. Costo por clip: míralo en el panel (el documento solo registra 10 puntos por clip de 6 s, 720p, x1).
**Descripción física del sujeto:** la de `FLOW_SISTEMA` §3 r.8 (lentes aviador rosé/marrón con detalle dorado, cabello corto sal y pimienta, chivera corta canosa). **Confírmala:** viene del avatar de CEINCA; si tu look de @soyeduardo.ia cambió, ajústala en los 5 prompts.

**Fotograma inicial del clip 1** (genéralo con ChatGPT, adjuntando tu foto real; lo apruebas por parecido):
```
Usa la foto adjunta como referencia exacta del rostro (no cambies rasgos, edad ni lentes). Plano medio corto de busto de frente, sentado, la cabeza en el tercio superior del encuadre con aire por encima, manos fuera de cuadro, mirada a cámara, expresión segura y cercana con media sonrisa. Fondo liso color tinta #0B0D12. Luz principal suave desde la izquierda y un reflejo de luz color lima #C6FF3D en el borde derecho del rostro y el hombro. Camisa lisa gris grafito. Formato vertical 9:16, estilo fotografía de estudio profesional, sin texto, sin logos.
```
**Clip 1 · 8 s · gancho + paso 1 (16 palabras)**
```
Formato vertical 9:16, plano medio corto de busto en un estudio oscuro liso color tinta casi negro. El sujeto del fotograma inicial, un hombre venezolano adulto con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta y chivera corta canosa, con camisa lisa gris grafito, mira a cámara con expresión segura y cercana y dice en voz masculina en español latino neutro con acento venezolano, tono cercano y didáctico: «Mismo prompt. Una versión es plana. Te enseño por qué. Paso uno: elige una referencia visual.» Microeventos: a los 2 segundos levanta la mano derecha con la palma abierta como mostrando dos opciones; a los 4 segundos un leve asentimiento mientras la cámara avanza muy despacio; a los 6 segundos levanta un dedo al decir «paso uno». Luz lateral suave desde la izquierda con un reflejo lima en el borde derecho del rostro y el hombro, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y un silencio de estudio. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 2 · 10 s · paso 2 (19 palabras)** — *Inicio* = último fotograma del clip 1
```
Formato vertical 9:16, plano medio corto de busto en un estudio oscuro liso color tinta casi negro. El sujeto del fotograma inicial, un hombre venezolano adulto con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta y chivera corta canosa, con camisa lisa gris grafito, mira a cámara y dice en voz masculina en español latino neutro con acento venezolano, tono cercano y didáctico: «Es el punto de partida. Paso dos: conviértela en un solo archivo. Colores, tipografías y cómo se mueve todo.» Microeventos: a los 2 segundos señala hacia el frente con la palma abierta; a los 4 segundos levanta dos dedos al decir «paso dos»; a los 6 segundos junta las manos formando un rectángulo frente al pecho como un solo archivo; a los 8 segundos abre la mano despacio y la mueve en una onda suave al decir «cómo se mueve todo». Luz lateral suave desde la izquierda con un reflejo lima en el borde derecho del rostro y el hombro, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y un silencio de estudio. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 3 · 8 s · paso 3 (16 palabras)**
```
Formato vertical 9:16, plano medio corto de busto en un estudio oscuro liso color tinta casi negro. El sujeto del fotograma inicial, un hombre venezolano adulto con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta y chivera corta canosa, con camisa lisa gris grafito, mira a cámara y dice en voz masculina en español latino neutro con acento venezolano, tono cercano y didáctico: «Paso tres: adjunta el archivo y pídele un momento concreto: un botón que pasa a check.» Microeventos: a los 1,5 segundos levanta tres dedos; a los 3,5 segundos hace un gesto de adjuntar, como dejando algo en el aire con la mano derecha; a los 6 segundos dibuja un check en el aire con el dedo índice y asiente. Luz lateral suave desde la izquierda con un reflejo lima en el borde derecho del rostro y el hombro, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y un silencio de estudio. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 4 · 10 s · auditoría + paso 4 (18 palabras)**
```
Formato vertical 9:16, plano medio corto de busto en un estudio oscuro liso color tinta casi negro. El sujeto del fotograma inicial, un hombre venezolano adulto con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta y chivera corta canosa, con camisa lisa gris grafito, mira a cámara y dice en voz masculina en español latino neutro con acento venezolano, tono cercano y didáctico: «Antes de entregártelo, una auditoría automática revisa zonas seguras y audio. Paso cuatro: cambia las palabras y exporta.» Microeventos: a los 2 segundos acerca el pulgar y el índice como midiendo algo pequeño; a los 4 segundos asiente con seguridad; a los 6 segundos levanta cuatro dedos al decir «paso cuatro»; a los 8 segundos teclea en el aire con ambas manos y termina con un asentimiento. Luz lateral suave desde la izquierda con un reflejo lima en el borde derecho del rostro y el hombro, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y un silencio de estudio. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 5 · 8 s · cierre y CTB (14 palabras)**
```
Formato vertical 9:16, plano medio corto de busto en un estudio oscuro liso color tinta casi negro. El sujeto del fotograma inicial, un hombre venezolano adulto con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta y chivera corta canosa, con camisa lisa gris grafito, mira a cámara con media sonrisa y dice en voz masculina en español latino neutro con acento venezolano, tono cercano y seguro: «Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.» Microeventos: a los 2 segundos asiente con media sonrisa; a los 3,5 segundos se señala el pecho con el pulgar al decir «lo dirigí yo»; a los 5 segundos señala hacia abajo con el dedo índice, indicando los comentarios; a los 7 segundos sonríe de frente a cámara. Luz lateral suave desde la izquierda con un reflejo lima en el borde derecho del rostro y el hombro, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y un silencio de estudio. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, sonriendo a cámara, manos abajo y fuera de cuadro.
```
**Validar en el primer resultado:** acento y pronunciación («ÑAPA»), manos sin deformar, rostro igual al fotograma inicial. Si la voz no suena a ti, la alternativa es dejar el video de Flow mudo y poner tu voz grabada encima (el gesto no coincidirá con los labios: no sirve en planos cerrados).
**Antes de publicar con Flow:** revisa en Instagram y TikTok si exigen etiquetar contenido generado con IA (no lo he verificado aquí); tu cierre «Lo hizo la IA» ya va en esa línea, pero la etiqueta de la plataforma es aparte.

---

## 5. Resumen de responsabilidades y orden
1. [E] F0 → 2. [CC] F1 → 3. [CC]+[E] F2 → 4. [E] graba + [CC] F3 → 5. [CC] F4 → 6. [E]+[CC] F5 → 7. [E] F6.
Yo ([C]) puedo, en esta sesión y sin tocar tu repo: preparar JSON de parámetros, ajustar los textos con las cifras reales cuando tengas N, reemplazar el archivo en Drive **con tu confirmación** (necesito el enlace/nombre del archivo y el zip final) y revisar cada pieza contra las listas de aceptación.
