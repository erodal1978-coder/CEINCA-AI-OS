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

## 0.1 Decisiones resueltas (27-10, tarde)
| # | Decisión de Eduardo |
|---|---|
| D1 | **Revisada el 27-10 (Eduardo): el kit regalo NO lleva marca ni nombre** (nada de CEINCA ni de Eduardo: ni temas, ni perfiles, ni ejemplos, ni créditos). Es una plantilla para que cada quien ponga la suya |
| D2 | **Reel A:** lo graba él, toma continua |
| D2b | **Reel B: con su avatar de Flow** (voz y rasgos ya configurados). Objetivo: mostrar el poder de la IA y vender autoridad con videos idénticos a él |
| D3 | Archivo de regalo: **`Video_Fx_Eduardo_IA.zip`** (solo como etiqueta del archivo; por dentro la skill se llama **`video-fx`** y no menciona a nadie) |
| D4 | **Sí**: el DM dice los requisitos (Claude Code, Node, FFmpeg) |
| ÑAPA | Confirmado: no se usa en otra cosa |
| Flow | Sin chivera en este reel; en el futuro la chivera **varía** (solo de vez en cuando). Avatar propio: no se describen rasgos, solo vestimenta y fondo. Imagen base de su oficina como escenario |

---

## 1. Bloqueantes (nada se publica antes de esto)
1. ~~**[E] Subir el repo local a GitHub**~~ **HECHO (27-10):** todo el trabajo local está en GitHub y las 3 líneas de la skill (Bloque 4, trabajo de AGY y módulo Carrusel/reel-voz) están unidas en la rama `integracion/video-fx-soyeduardo-27-10` (**PR #37**, sin conflictos con `main`). Hasta que el PR se mezcle, F1 en adelante se trabaja sobre esa rama.
2. **[CC] N verificado** con evidencia de render (F1).
3. **[E] Probar ÑAPA** con cuenta secundaria; comprobar que el comentario fijado **no** dispara el DM. **(Eduardo, 27-10: la prueba de ÑAPA la hace él siempre al subir el reel; no es una tarea pendiente de Claude ni se le da seguimiento.)**
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
1) Trabaja sobre la rama integracion/video-fx-soyeduardo-27-10 (PR #37): ya trae 27 plantillas HTML (incluye bento-grid, barra-prompt, carrusel-blur, catalogo-lateral y los 2 slides de carrusel), los 7 efectos de clip (zoom-digital, zoom-corte, zoom-atras, lupa-zoom, foco-spotlight, fragmentos-shatter, pantalla-verde), overlay --layout split-pip, reel-voz y musica. Comprueba con `ls .claude/skills/ceinca-video-fx/effects | wc -l` (debe dar 27) y NO importes el zip del Starter Kit.
2) node scripts/doctor.mjs y bash scripts/check.sh estatico. Informa qué falta (Node>=22, FFmpeg, Chromium).
3) Renderiza CADA efecto HTML (27) con --tema marca-soyeduardo-ia en vertical (los 25 de reel) y en horizontal solo los que lo soportan (19; corta-pega, diagrama-nodos, grafica-crece, muro-titulares, rompe-marco y telefono-chat declaran solo-vertical; los 2 slide-* son de carrusel), y CADA efecto de clip (zoom-digital, zoom-corte, zoom-atras, lupa-zoom, foco-spotlight, fragmentos-shatter, pantalla-verde) con clips de prueba. Usa node scripts/render.mjs --solo-auditoria primero y render completo después.
4) Entrega una tabla: efecto | render OK | zonas seguras OK | legible a 1,1 s (sí/no) | salida del comando. N = efectos con todo OK. No declares OK sin haberlo ejecutado.
5) Audio: check.sh reel YA acepta `--lufs N` (default 16, ±1,5; también 1920×1080) y avisa si el pico real supera −1,0 dBFS. Para los reels de ÑAPA usa `--lufs 14` y valida con un MP4 real. Si audio.mjs no deja el máster cerca de −14 (en una prueba salió −15,4), ajusta el normalizador final y documéntalo.
6) Comprueba si catalogo-lateral acepta un clip de video en el marco derecho. Si no, deja el comando ffmpeg de composición (lista izquierda + clip derecho) y pruébalo.
7) Comprueba si pasos-progreso desenfoca los pasos futuros (opacidad .35 + blur 4px). Si no, propón parámetro opcional.
```
**Aceptación:** tabla con N; `check.sh reel` pasa un MP4 real a −14 LUFS; informe sin "OK" sin evidencia.
**Regla:** si N < 21 → título "N efectos" (nada de "+20"). Si 14 ≤ N < 21 → plan B: construir de los 5 efectos sin recorte de persona que faltan (Portal, Infinite Zoom, Cube Spin, Tile Tunnel, Phone Fan) solo si Eduardo quiere insistir en "+20".

### F2 · Kit regalo + embudo ÑAPA [CC] + [E]
**[HECHO 27-10] Kit público sin marca:** `python3 .claude/skills/ceinca-video-fx/scripts/build-public-kit.py <carpeta-de-salida>` genera, a partir de la skill, el kit regalo y **falla si queda cualquier referencia** a CEINCA, Eduardo, SAREN, FIEBRU'O, sus colores o su apellido. Qué hace: quita los temas y el logo de marca (`ceinca-social`, `ceinca-guias`, `marca-soyeduardo-ia`), los perfiles `estilos/`, la bitácora personal del `SKILL.md` y los ejemplos con contenido legal/mercantil (los reescribe con ejemplos neutros de video); deja el tema `estilo-dark-tech` como predeterminado y una plantilla `themes/marcas/mi-marca.json`; **no incluye `gsap.min.js`** (su licencia no deja claro si se puede redistribuir: se instala con `npm install`); regenera `brand.lock.json`; y empaqueta.
Salida: `Video_Fx_Eduardo_IA.zip` (LEEME + `PROMPT_ADAPTAR_MARCA.md` + `claude-code/video-fx/` + `claude-ai/video-fx.zip`) y `claude-ai/video-fx.zip` suelto para subir a claude.ai.
**Verificado (kit final, 27-10):** `check.sh estatico` ✓ · `check.sh matriz` **108/108** (27 efectos × 4 temas) · `doctor.mjs` 14/14 · 89 pruebas (render real de efectos nuevos vertical y horizontal, efectos de clip, `split-pip`, carrusel, reel, audio, pantalla verde con recorte, `build-zip`); los 6 efectos solo-vertical se rechazan en 16:9 con mensaje claro · flujo «poner mi marca» (copiar `mi-marca.json` → `npm run sync-brand` → `--tema marca-mi-estudio`) ✓ · escaneo de marca en ambos zips (incluido el zip anidado): **0 referencias**.
**Pendiente:** probar `claude-ai/video-fx.zip` en el sandbox real de claude.ai (no se ha hecho) y que Eduardo lo apruebe antes de enlazarlo.
**Pruebas obligatorias**
- [ ] `unzip` en carpeta vacía → `node scripts/doctor.mjs` → render de `examples/portada.json` con `estilo-dark-tech`.
- [ ] Con `PROMPT_ADAPTAR_MARCA.md` y un **tercero de prueba** (marca inventada), el tema nuevo renderiza.
- [ ] [E] Subir el zip a claude.ai como skill y comprobar qué funciona en el chat (el handoff del 23-10 lo marca "no probado").
**[E] Drive y Beacons**
- [ ] Subir `Video_Fx_Eduardo_IA.zip` a Drive (carpeta pública con enlace; permiso "cualquiera con el enlace: lector").
- [ ] Bloque en Beacons (§5.5).
**[E] Meta (antes de publicar)**
- [ ] Automatización ÑAPA: disparador **"contiene"**; añade también la variante **"napa"** si Meta permite varias palabras (no verificado: confírmalo en tu Business Suite; si no, usa solo "ñapa" y deja el aviso «escribe ÑAPA» en el comentario fijado).
- [ ] Respuesta pública (A/B/C del §5.1) + DM (§5.1).
- [ ] Prueba con cuenta secundaria: llega el DM, el enlace abre, y el comentario fijado no dispara nada. **(Eduardo, 27-10: la prueba de ÑAPA la hace él siempre al subir el reel; no es una tarea pendiente de Claude ni se le da seguimiento.)**
**Aceptación:** grep de fugas = 0; prueba en entorno limpio OK; DM recibido en cuenta secundaria con el enlace funcionando.

### F3 · Reel A "+20 efectos hechos por Claude" · ≈30 s
**El guion final, la tabla de tiempos, la pantalla, la grabación, el montaje y las reservas están en `docs/GUION_REEL_A_FINAL_27-10-2026.md`.** Resumen: gancho 0–1,9 s · 21 efectos de 1,1 s (11 sobre ti, 10 de interfaz, alternados) · cierre 25–30 s con «Comenta ÑAPA». Toma continua real de Eduardo (3 tomas, metrónomo a 54 BPM) + 2 fotos recortadas (PNG) para `rompe-marco` y `corta-pega`.
**Aceptación:** la del §7 del guion (medida con ffmpeg y mostrando la salida).

### F4 · Reel B "Por qué los videos de Claude salen planos" · 44 s
**Fuente del vocero (D2b resuelta):** tu **avatar de Flow** (voz y rasgos ya configurados), 5 clips de 8–10 s; prompts en §4.5. Es el contraste con el Reel A: A = tú real, B = tu avatar idéntico a ti.
La voz va partida en 5 bloques que coinciden con los 5 clips de Flow (8–10 s, palabras según `FLOW_SISTEMA` §4.1), así el guion sirve igual si lo grabas tú.
| t (s) | Pantalla (split-pip: escenario arriba, tú abajo, subtítulos al centro) | Voz |
|---|---|---|
| 0–8 | Mismo prompt, dos resultados: izquierda plano · derecha con tu marca → menú de 4 pasos, paso 1 activo, los demás borrosos · `tablero_marca.png` | «Mismo prompt. Una versión es plana. Te enseño por qué. Paso uno: elige una referencia visual.» (16 palabras) |
| 8–18 | Menú paso 2 · `consola-macos` escribiendo tu `soyeduardo-ia.json` real (colores y fuentes) | «Es el punto de partida. Paso dos: conviértela en un solo archivo. Colores, tipografías y cómo se mueve todo.» (19) |
| 18–26 | Menú paso 3 · `barra-prompt`: «hazlo bonito» → plano; «un botón que pasa a un check lima» → resultado | «Paso tres: adjunta el archivo y pídele un momento concreto: un botón que pasa a check.» (16) |
| 26–36 | `render.mjs --solo-auditoria` en consola → menú paso 4 → edición de `params.json` y render | «Antes de entregártelo, una auditoría automática revisa zonas seguras y audio. Paso cuatro: cambia las palabras y exporta.» (18) |
| 36–44 | Cierre: tú al centro, píldora lima | «Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.» (14) |
Reglas: **transparencia = autoridad** (aprobado por Eduardo): al editar, **[CC] o [C] añaden** una etiqueta pequeña «avatar de IA» en la tarjeta del vocero durante los 44 s (esquina superior izquierda de la tarjeta, JetBrains Mono minúsculas, color niebla `#8B93A7` sobre grafito; **no lima**, para respetar un solo elemento lima por pantalla; dentro de la zona segura). Las etiquetas nativas de plataforma las manejas tú (TikTok detecta IA solo; en Instagram la activas); el A/B de los primeros segundos debe ser **real** (mismo prompt, con y sin archivo de marca) y sin retoques; el menú reaparece 3 veces (no 4); ninguna escena pasa de ≈4,5 s; si un paso no corre así en tu sistema, se cambia el guion, no la demo.
**Aceptación:** las mismas del Reel A + el A/B reproducible (guarda los dos prompts y salidas) + rostro, ropa, fondo y voz consistentes en los 5 clips, y sin chivera. + etiqueta «avatar de IA» visible en todo el video.

### F5.0 · Obtener los renders (carrusel + Reel A) · [CC] en tu máquina
**Antes (tú, 5 min):** crea `~/CEINCA-WORKSPACE/SOY_EDUARDO_IA/CAMPANA_NAPA_SKILL_FX/RENDERS/base/` y guarda ahí: (1) `personaje.png` (tu caricatura), (2) `cursor.png` (el compañero), (3) `toma-prueba.mp4`: **6 s tuyos hablando**, vertical 1080×1920, misma ropa y luz; sirve como base de los efectos sobre clip hasta que grabes el Reel A, (4) `yo-recorte-1.png` y `yo-recorte-2.png`: fotos tuyas de frente, **PNG con fondo transparente**, y (5) la imagen de tu oficina. Las salidas van **fuera del repo** (política de assets).
**Prompt para Claude Code** (raíz del repo local, con el tema `marca-soyeduardo-ia` disponible; si tu rama no lo tiene, usa el del zip):
```
Trabaja en .claude/skills/ceinca-video-fx. No hagas commit ni copies renders dentro del repo.
Objetivo: obtener renders de los efectos con el tema marca-soyeduardo-ia para (1) capturas PNG del carrusel y (2) MP4 de ≈1,2 s para el Reel A. Entradas en ~/CEINCA-WORKSPACE/SOY_EDUARDO_IA/CAMPANA_NAPA_SKILL_FX/RENDERS/base/. Salidas en ~/CEINCA-WORKSPACE/SOY_EDUARDO_IA/CAMPANA_NAPA_SKILL_FX/RENDERS/{frames,clips,informe}/.
0) Ejecuta node scripts/doctor.mjs (y npm install si falta). Si falta Node, FFmpeg o Chromium, dímelo y detente.
1) Efectos HTML (los 25 de effects/): para cada uno parte de examples/<id>.json (haz una COPIA temporal; no edites los ejemplos) y ejecuta, en este orden:
   a) node scripts/render.mjs <copia.json> --tema marca-soyeduardo-ia --solo-auditoria   (debe pasar)
   b) node scripts/render.mjs <copia.json> --tema marca-soyeduardo-ia --formato vertical --duracion 1.2 -o clips/<id>.mp4
   c) node scripts/render.mjs <copia.json> --tema marca-soyeduardo-ia --frame <segundo> -o frames/<id>.png   (elige tú el segundo en que el efecto se entiende mejor y anótalo)
2) Efectos sobre clip, con base/toma-prueba.mp4 (si no existe, genera uno con npm run assets y avísame): zoom-digital, zoom-corte, zoom-atras, lupa-zoom, foco-spotlight, fragmentos-shatter. Los tres primeros tienen examples/clip-*.json; para lupa-zoom, foco-spotlight y fragmentos-shatter crea el JSON con los parámetros documentados en SKILL.md. Ejecuta node scripts/clip.mjs <json> -o clips/<id>.mp4 y extrae un PNG con ffmpeg del instante más claro.
3) rompe-marco y corta-pega: usa base/yo-recorte-1.png y base/yo-recorte-2.png como "sujeto". vertigo-simulado: fondo = imagen de la oficina, frente = recorte. muro-videos: clips = toma-prueba.mp4 con distintos "inicio". Si falta algún insumo, usa el de ejemplo y marca "insumo de ejemplo" en el informe.
4) Legibilidad: de cada MP4 de 1,2 s extrae 3 fotogramas (inicio, medio, final) y di si el efecto se entiende en 1,1 s (sí/no).
5) Informe en informe/renders.md: efecto | MP4 OK | PNG OK | zonas seguras OK | legible a 1,1 s | comando exacto | segundo del PNG | error literal si falló. No marques OK sin haberlo ejecutado.
6) Al final: lista de archivos con tamaño total y cuántos efectos pasaron todo (ese es N).
```
**Qué obtienes:** `frames/<id>.png` (1080×1920; el carrusel los recorta/escala a 1080×1350 dentro de su marco), `clips/<id>.mp4` (Reel A) e `informe/renders.md` con N. Cuando grabes el Reel A, se repiten los efectos sobre clip con **esa** toma (y así las capturas del carrusel salen con tu cara real).

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
- [ ] Automatización ÑAPA activa y probada. *(la prueba la hace Eduardo al subir el reel)*
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
DM automático (≤1.000 caracteres; ajustado al paquete real: `[ENLACE]` = enlace de Drive al zip; los 27 + 7 efectos son los que pasaron render y matriz):
```
¡Hola! Aquí tienes la ñapa que te prometí 🎁

🔗 Video FX, la skill de efectos de video para Claude: [ENLACE]

Trae 27 efectos de reel + 7 que se aplican a tu propio clip, ejemplos listos y un prompt para ponerle TU marca.

Cómo empezar:
1️⃣ Descomprime el zip y lee LEEME_PRIMERO.md.
2️⃣ Claude Code: copia claude-code/video-fx a .claude/skills/ y pídele «Lee SKILL.md y corre el diagnóstico».
3️⃣ claude.ai: sube claude-ai/video-fx.zip como skill.

Necesitas Claude, Node 22+, FFmpeg y Chromium (el diagnóstico te dice qué falta).

Si algo no te corre, respóndeme este mensaje.

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

### 4.5 Reel B — prompts para Flow (tu avatar)
**Reglas aplicadas** (`PRODUCTION/FLOW_SISTEMA.md`): un párrafo único y autocontenido por clip (§3 r.1, r.9) · sin nombre propio (r.5) · "realista", nunca "hiperrealista" (r.6) · voz dentro del prompt (r.7) · texto y overlays **en post**, no en Flow (§6) · palabras por duración (§4.1: 8 s = 14–16; 10 s = 17–20) · un microevento cada 2–3 s (§4.2) · cada clip termina en una pose estable (§7.3).
**Tu avatar manda:** voz y rasgos vienen del avatar configurado, así que **no se describen rasgos**: solo vestimenta, fondo, acción y cámara.
**Chivera:** en este reel **sin chivera** (va en cada prompt y en la lista de "evitar"). Regla para futuras piezas: la chivera **varía**, solo de vez en cuando; no es parte fija del personaje. Si tu avatar la trae por defecto y Flow no obedece, usa una imagen de inicio sin chivera.
**Escenario:** tu imagen base de la oficina como referencia de lugar. Vestimenta por defecto: camisa lisa gris grafito (cámbiala si quieres, pero la misma en los 5 prompts).
**Modo en Flow:** como tu avatar y la oficina son referencias, usa **Ingredientes** (avatar + imagen de la oficina) en los 5 clips; no mezcles con Fotogramas (§13.4). Si tu imagen base **ya te incluye** en la oficina y prefieres encadenar clips, usa **Fotogramas**: cambia «El sujeto del avatar de referencia» por «El sujeto del fotograma inicial» y usa el último fotograma de cada clip como *Inicio* del siguiente. 9:16 · 720p · x1 (x2 solo en el clip 1) · escala a 1080×1920 en post.

**Clip 1 · 8 s · gancho + paso 1 (16 palabras)**
```
Formato vertical 9:16, plano medio corto de busto, la cabeza en el tercio superior del encuadre con aire por encima, en la oficina de la imagen de referencia sin cambiar su decoración ni su distribución. El sujeto del avatar de referencia, sin chivera, con camisa lisa gris grafito, mira a cámara y dice con la voz configurada del avatar, en español latino neutro con acento venezolano natural, tono cercano y didáctico: «Mismo prompt. Una versión es plana. Te enseño por qué. Paso uno: elige una referencia visual.» Microeventos: a los 2 segundos levanta la mano derecha con la palma abierta como mostrando dos opciones; a los 4 segundos un leve asentimiento mientras la cámara avanza muy despacio; a los 6 segundos levanta un dedo al decir «paso uno». Luz natural suave de la oficina de la imagen de referencia, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y el silencio de la oficina. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, chivera o barba que aparezca, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 2 · 10 s · paso 2 (19 palabras)**
```
Formato vertical 9:16, plano medio corto de busto, la cabeza en el tercio superior del encuadre con aire por encima, en la oficina de la imagen de referencia sin cambiar su decoración ni su distribución. El sujeto del avatar de referencia, sin chivera, con camisa lisa gris grafito, mira a cámara y dice con la voz configurada del avatar, en español latino neutro con acento venezolano natural, tono cercano y didáctico: «Es el punto de partida. Paso dos: conviértela en un solo archivo. Colores, tipografías y cómo se mueve todo.» Microeventos: a los 2 segundos señala hacia el frente con la palma abierta; a los 4 segundos levanta dos dedos al decir «paso dos»; a los 6 segundos junta las manos formando un rectángulo frente al pecho como un solo archivo; a los 8 segundos abre la mano despacio y la mueve en una onda suave al decir «cómo se mueve todo». Luz natural suave de la oficina de la imagen de referencia, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y el silencio de la oficina. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, chivera o barba que aparezca, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 3 · 8 s · paso 3 (16 palabras)**
```
Formato vertical 9:16, plano medio corto de busto, la cabeza en el tercio superior del encuadre con aire por encima, en la oficina de la imagen de referencia sin cambiar su decoración ni su distribución. El sujeto del avatar de referencia, sin chivera, con camisa lisa gris grafito, mira a cámara y dice con la voz configurada del avatar, en español latino neutro con acento venezolano natural, tono cercano y didáctico: «Paso tres: adjunta el archivo y pídele un momento concreto: un botón que pasa a check.» Microeventos: a los 1,5 segundos levanta tres dedos; a los 3,5 segundos hace un gesto de adjuntar, como dejando algo en el aire con la mano derecha; a los 6 segundos dibuja un check en el aire con el dedo índice y asiente. Luz natural suave de la oficina de la imagen de referencia, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y el silencio de la oficina. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, chivera o barba que aparezca, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 4 · 10 s · auditoría + paso 4 (18 palabras)**
```
Formato vertical 9:16, plano medio corto de busto, la cabeza en el tercio superior del encuadre con aire por encima, en la oficina de la imagen de referencia sin cambiar su decoración ni su distribución. El sujeto del avatar de referencia, sin chivera, con camisa lisa gris grafito, mira a cámara y dice con la voz configurada del avatar, en español latino neutro con acento venezolano natural, tono cercano y didáctico: «Antes de entregártelo, una auditoría automática revisa zonas seguras y audio. Paso cuatro: cambia las palabras y exporta.» Microeventos: a los 2 segundos acerca el pulgar y el índice como midiendo algo pequeño; a los 4 segundos asiente con seguridad; a los 6 segundos levanta cuatro dedos al decir «paso cuatro»; a los 8 segundos teclea en el aire con ambas manos y termina con un asentimiento. Luz natural suave de la oficina de la imagen de referencia, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y el silencio de la oficina. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, chivera o barba que aparezca, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, manos abajo y fuera de cuadro, mirada a cámara, boca cerrada, encuadre idéntico al inicial.
```
**Clip 5 · 8 s · cierre y CTB (14 palabras)**
```
Formato vertical 9:16, plano medio corto de busto, la cabeza en el tercio superior del encuadre con aire por encima, en la oficina de la imagen de referencia sin cambiar su decoración ni su distribución. El sujeto del avatar de referencia, sin chivera, con camisa lisa gris grafito, mira a cámara y dice con la voz configurada del avatar, en español latino neutro con acento venezolano natural, tono cercano y didáctico: «Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.» Microeventos: a los 2 segundos asiente con media sonrisa; a los 3,5 segundos se señala el pecho con el pulgar al decir «lo dirigí yo»; a los 5 segundos señala hacia abajo con el dedo índice, indicando los comentarios; a los 7 segundos sonríe de frente a cámara. Luz natural suave de la oficina de la imagen de referencia, calidad cinematográfica profesional, realista, profundidad de campo baja. Sin música ni efectos de sonido, solo la voz y el silencio de la oficina. Sin texto en pantalla ni logos. Evitar deformaciones faciales, manos con dedos extra, cambios de identidad o de ropa, chivera o barba que aparezca, parpadeos de luz, morphing y movimientos imposibles. Frame final: el sujeto centrado, sonriendo a cámara, manos abajo y fuera de cuadro.
```

**Validar en el primer resultado:** pronunciación de «ÑAPA», manos sin deformar, rostro y voz iguales a tu avatar, **sin chivera**, oficina intacta. Los cambios y créditos de Flow los vigilas tú: no los planifico.
**Idea opcional (después):** un reel «¿Cuál soy yo?» con A real y B avatar lado a lado, para reforzar la autoridad.

---

## 5. Resumen de responsabilidades y orden
1. [E] F0 → 2. [CC] F1 → 3. [CC]+[E] F2 → 4. [E] graba + [CC] F3 → 5. [CC] F4 → 6. [E]+[CC] F5 → 7. [E] F6.
Yo ([C]) puedo, en esta sesión y sin tocar tu repo: preparar JSON de parámetros, ajustar los textos con las cifras reales cuando tengas N, reemplazar el archivo en Drive **con tu confirmación** (necesito el enlace/nombre del archivo y el zip final) y revisar cada pieza contra las listas de aceptación.
