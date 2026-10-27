# Plan: 2 reels + 1 carrusel @soyeduardo.ia con la skill como regalo
27-10-2026 · Rama `claude/soyeduardo-content-audit-ultq4l` · Base: Drive `Digital mentor / Nuevos videos analizar` + `Video_FX_Starter_Kit_sin_marca.zip` + `02_MANUAL_DE_MARCA.md` + `01_AUDITORIA_Y_ESTRATEGIA.md`

## 0. Qué verifiqué y qué no
| Pieza | Estado |
|---|---|
| `20 video effects for Claude.mp4` | **Verificado por mí**: frames (hoja de contacto) + medición de audio con ffmpeg |
| Carrusel (8 láminas WEBP) | **Verificado por mí**: visto lámina por lámina |
| `Claude Motion.mp4` (64 s) | ~~NO verificado~~ → **verificado el 27-10 (tarde)**, ver §10.7. Texto original: **NO verificado por mí**: la descarga por MCP falló (6,4 MB, conexión cerrada). Uso el análisis del 26-10 en Drive (`ANALISIS_NUEVOS_VIDEOS_Y_PROMPT_TERMINAL.md`), hecho en otra sesión. Para auditarlo yo: súbelo al chat o ponlo en `~/Descargas` |
| Música de ambos reels | **No determinable** con análisis automático (voz continua). No afirmo si hay pista |
| Los 30 "skills" del carrusel | Terceros; **no verificados**. No se replican |

## 1. Auditoría — Reel "20 video effects for Claude" (24,98 s)
- **Formato:** 720×1280, 30 fps, H.264 + AAC.
- **Diseño:** fondo gris-azulado claro con rejilla en perspectiva · título fijo arriba ("20" en azul) · lista numerada 1–20 a la izquierda (fila activa = píldora negra) · vocero en tarjeta vertical a la derecha · cierre: vocero centrado + tarjeta azul inferior (head pop-out) + píldora "Comment EFFECT" con subrayado animado.
- **Ritmo:** un efecto nuevo cada ≈1,1–1,25 s (19 efectos en ≈22 s). Los últimos ≈3 s son CTB.
- **Audio medido:** −14,1 LUFS integrado · pico real −1,7 dBFS · LRA 1,9 LU · sin silencios >0,3 s (umbral −35 dB). La voz solo dice el nombre del efecto.
- **Gancho:** no hay gancho verbal; lo hace el título fijo + Grid Dive (mosaico de caras) desde el frame 0.
- **Retención:** la lista numerada funciona como barra de progreso y bucle abierto ("¿qué es el 17?"); cambio visual cada ~1 s; el vídeo invita a rever.
- **CTB:** "Comment EFFECT" aparece solo ≈3 s al final.
- **Fallos:** (1) etiquetas de la lista ≈ ilegibles en móvil; (2) cero valor educativo en el audio → los guardados dependen solo del CTB; (3) CTB tardío; (4) usa el asterisco de Claude junto al título (el manual de Eduardo lo prohíbe en logo/@).

| Gancho | Retención | Diseño | CTB | Audio |
|---|---|---|---|---|
| 7/10 | 9/10 | 7/10 | 6/10 | n/d (solo volumen medido) |

## 2. Auditoría — Claude Motion (64 s) · según análisis previo de Drive
- Estructura: gancho 0:00–0:11 → 4 pasos (referencia visual → archivo de estilo → adjuntar estilo + bucle de auto-corrección → ajustar parámetros y exportar) → CTB "Comment APPLE".
- Layout: split-screen (vocero en tarjeta inferior y = 52–92 %, escenario de animaciones arriba y = 6–48 %, subtítulos en franja central).
- **Crítica propia:** el gancho abre con una noticia ("Anthropic acaba de lanzar…") que yo no verifiqué. No se copia. Dura 64 s: para Eduardo, ≤45 s.

## 3. Auditoría — Carrusel (8 láminas, 4:5)
- **Estructura:** portada (promesa numérica) → 6 láminas por categoría (5-5-6-5-5-4 = 30 ítems) → CTA "Comment VIDEO and I'll send you all 30 skills with their links".
- **Diseño:** fondo casi blanco, trazo tipo boceto, personaje de palitos negro + caricatura con lentes y rizos, título manuscrito con subrayado azul/naranja alternado, cada ítem = nombre en negrita + 1 línea.
- **Mecanismo:** lista curada + recurso gratis por comentario.
- **Fallos:** portada sin beneficio personal · 5–6 ítems por lámina sin jerarquía (texto pequeño en móvil) · sin señal de deslizar · sin una sola captura real · en inglés (hueco para LATAM).

| Gancho | Retención | Diseño | CTB |
|---|---|---|---|
| 6/10 | 7/10 | 7/10 | 8/10 |

## 4. Brechas con lo que ya tenemos (verificado en el zip y el repo)
1. ~~**El repo está atrasado respecto al zip**~~ **RESUELTO (27-10):** el repo de GitHub tenía 21 plantillas y el zip 25; la rama `integracion/video-fx-soyeduardo-27-10` (**PR #37**) une todas las líneas: 27 plantillas HTML (25 de reel + 2 slides de carrusel) y 7 efectos de clip, `split-pip` incluido.
2. **"Sin marca" es falso en el zip subido:** quedan `themes/marca-soyeduardo-ia.css`, `themes/cliente-eduardo-ia.css`, `themes/clientes/eduardo-ia.json`, `themes/marcas/soyeduardo-ia.json`, `brand.lock.json`, y menciones en `SKILL.md`, `scripts/overlay.mjs` y 4 `params.example.json`. `DISTRIBUCION_STARTER.md` ya avisa que hay que limpiar antes de redistribuir.
3. **"25 efectos" no está probado:** la propia nota del zip dice que contar carpetas no garantiza render. No se publica ninguna cifra hasta pasar el render (Fase 1).
4. **Faltan 8 de los 20 de la referencia:** Title Orbit 3D, Portal (overlay), Clone Room, Infinite Zoom, Cube Spin, Tile Tunnel, Phone Fan, Ribbon Wrap. No se anuncian "20 efectos".
5. **Audio:** la referencia mide −14,1 LUFS; nuestro `check.sh reel` exige −16 y el reel 1 de Eduardo midió −16,4. Decisión pendiente (§8).
6. **Exportador de carruseles** (`~/repos/carrusel-export`): quedó alineado a la paleta CEINCA (navy + Manrope). No tiene tema @soyeduardo.ia (sin verificar: no está en esta sesión).

## 5. Piezas propuestas (todas con el mismo recurso → una sola palabra reciclada, sin tocar Meta)

### Reel A — "N efectos de video hechos por Claude" (25–28 s)
- **Título fijo:** `N efectos de video hechos por Claude` + sello lima `LO HIZO LA IA` (N = cifra verificada en Fase 1).
- **Layout:** `catalogo-lateral` en 9:16 con lista **≥ 34 px** (la referencia falla aquí), clip de Eduardo/avatar a la derecha, fondo Tinta `#0B0D12`, un solo elemento lima por pantalla.
- **Gancho (0–1,2 s):** efecto #1 ya en marcha. Voz: **"Todo esto lo hizo Claude. Yo solo lo dirigí."** Variante B para test: **"Esto no lo editó nadie. Lo hizo Claude."**
- **Desarrollo:** nombre del efecto por voz cada ≈1,1 s; un SFX corto por cambio (`scripts/sfx_synth.py`); voz por encima de cualquier pista.
- **Cierre (≥3,5 s):** "Lo hizo la IA. Lo dirigí yo." → píldora lima **"Comenta [PALABRA] y te regalo la skill"**. CTB triple: Guardar → Compartir → Comentar.
- **Comentario fijado en los primeros 30 s.**

### Reel B — "Por qué los videos de Claude salen planos" (≤45 s)
- **Gancho (0–3 s):** pantalla dividida con el mismo prompt: resultado plano vs. resultado con marca. Voz: **"Mismo prompt. Una versión es plana. Te enseño por qué."**
- **Escaleta:** 3–10 s paso 1 referencia visual · 10–18 s paso 2 archivo de marca (mostrar el `soyeduardo-ia.json` real) · 18–30 s paso 3 plantilla + auditoría automática (`render.mjs --solo-auditoria`, `check.sh`) · 30–37 s paso 4 `params.json` → render · 37–44 s CTB.
- **Cierre:** "Lo hizo la IA. Lo dirigí yo." + **"Comenta [PALABRA]"** (misma palabra que Reel A).
- Solo muestro lo que corre de verdad en la skill; nada de "lanzamiento" sin fuente.

### Carrusel — "Construí N efectos de video para Claude. Te los regalo." (8 láminas, 4:5)
1. **Portada:** título en Sora 800, caricatura de Eduardo (ver §6), sello lima.
2–7. **Una categoría por lámina**, 4–5 efectos con "qué hace → para qué sirve" **y una captura real renderizada** (prueba antes que promesa):
   - Datos y UI: `bento-grid`, `grafica-crece`, `checklist`, `pasos-progreso`, `catalogo-lateral`
   - Apps y chat: `telefono`, `telefono-chat`, `barra-prompt`, `consola-macos`, `diagrama-nodos`
   - Texto: `muro-titulares`, `texto-cristal`, `portada`, `garabato-vivo`, `carrusel-blur`
   - Cámara y profundidad: `vertigo-simulado`, `zoom-atraves`, `camara-continua`, `rompe-marco`, `collage-papel`
   - Sobre tu clip (FFmpeg): `zoom-digital`, `zoom-corte`, `zoom-atras`, `lupa-zoom`, `foco-spotlight`, `fragmentos-shatter`
   - Marca y calidad: 4 temas, `sync-brand`, auditoría de zonas seguras, `check.sh` de audio
   (Lista tomada de las carpetas del zip; **se ajusta a lo que pase el render**.)
8. **CTA:** "Comenta [PALABRA]" + Guardar → Compartir → Comentar.
- **Estilo (propuesta):** trazo hueso sobre **Tinta**, no fondo blanco: es "laboratorio nocturno" y se distingue del feed. El lima va como **resaltador** (banda lima + texto Tinta, 16,4:1); sobre fondo claro el manual prohíbe lima. Tipografía solo Sora / Manrope / JetBrains Mono (no se añade una cuarta fuente manuscrita; el boceto vive en las ilustraciones).
- **Por qué no copiar los "30 skills":** Eduardo es constructor, no curador (manual §1), y la lista es de terceros sin verificar.

## 6. Imagen de Eduardo con ChatGPT
Adjunta **una foto real** como referencia (el manual lo exige) y pide variantes; elige por parecido.

**Personaje base**
```
Usa la foto adjunta como referencia exacta del rostro (no cambies rasgos, edad ni lentes). Haz una caricatura de ilustración a línea, estilo boceto de pizarra, de busto y cuerpo completo del hombre de la foto. Trazo fino color hueso #F3F0E8 sobre fondo tinta #0B0D12, sin relleno de color salvo una pequeña mancha lima #C6FF3D en un solo objeto. Tres poses en hoja de personaje: señalando hacia arriba a la derecha, sosteniendo una tarjeta de video con un icono de play, brazos cruzados con media sonrisa. Proporciones ligeramente exageradas, expresión cercana y segura. Sin texto, sin logos, sin robots.
```
**Compañero (propio, no el palito negro de la referencia)**
```
Un cursor de texto vertical "▍" color lima #C6FF3D con dos ojos pequeños y brazos de línea finos, estilo boceto, en tres poses: señalando, sosteniendo una pantalla, saludando. Trazo hueso #F3F0E8 sobre fondo tinta #0B0D12, plano, sin sombras, sin texto.
```
Después: recortar con fondo transparente y colocar sobre la plantilla (texto **siempre en post**, nunca generado por la IA de imagen).

## 7. Plan por fases (cada fase termina con criterio de aceptación)

**F0 · Decisiones de Eduardo (≈15 min)** — ver §8. *Salida:* palabra clave elegida, política de cifras, audio objetivo, video Claude Motion disponible.

**F1 · Base técnica (Claude Code, local)**
1. Traer a `.claude/skills/ceinca-video-fx` el zip actual (25 plantillas + clip + split-pip) y comparar con el repo.
2. `bash scripts/check.sh estatico` → `check.sh matriz` → render de cada efecto en vertical y horizontal.
3. Registrar **N = efectos que pasan**. Quitar de cualquier texto público lo que no pase.
*Aceptación:* tabla efecto × (render OK / zonas seguras OK) con evidencia de salida del comando.

**F2 · Starter kit regalo**
1. Copia de distribución sin identidad: ejecutar `PROMPT_ADAPTAR_MARCA.md` y buscar `eduardo`/`soyeduardo`/`CEINCA` hasta cero coincidencias (excepto aviso de licencia/autoría si Eduardo lo quiere).
2. Mantener tema neutro `estilo-dark-tech` por defecto (ya lo es en el zip).
3. Probar el zip en un entorno limpio y en el sandbox real de claude.ai (el handoff del 23-10 lo marca "no probado").
4. Bloque en el hub de Beacons (un bloque por palabra clave) + texto del DM ≤1.000 caracteres + respuestas públicas ≤500.
*Aceptación:* `unzip` limpio → una instrucción de Claude produce un MP4 con la marca de un tercero de prueba.

**F3 · Reel A**
1. Grabar/generar N clips cortos (≈1,1 s útiles cada uno) con avatar de Flow (misma ropa y luz).
2. Render de los efectos con `--tema marca-soyeduardo-ia`; montaje con `overlay.mjs`; subtítulos desde 0 s (mejora pendiente del reel 1).
3. Audio: voz + SFX; música propia solo si cumple licencia (ver §8).
*Aceptación (medir con ffmpeg):* 1080×1920 · 30 fps · subtítulos desde 0 s · CTB ≥3,5 s · LUFS dentro del objetivo elegido · pico ≤ −1 dBFS.

**F4 · Reel B** — mismas comprobaciones; el antes/después sale del propio render, no de capturas retocadas.

**F5 · Carrusel**
1. Generar personaje y compañero en ChatGPT (§6).
2. Capturas reales: `render.mjs --frame <s>` por efecto.
3. Maquetar 8 láminas 1080×1350 con tema @soyeduardo.ia (crearlo en el exportador o en HTML con la skill; hoy el exportador solo tiene paleta CEINCA).
*Aceptación:* texto legible a 360 px de ancho, ≤5 ítems por lámina, un elemento lima por lámina, cero texto generado por IA de imagen.

**F6 · Publicar y medir**
1. **Antes de publicar:** probar el comentario con la palabra desde otra cuenta y confirmar que el comentario fijado **no** dispara el DM (pendiente desde el 21-10).
2. Orden sugerido: Reel A → +2 días carrusel → +4 días Reel B. Comentario fijado en los primeros 30 s en cada pieza.
3. Medir a 1 h, 24 h y 72 h: retención a 3 s, % visto, envíos, guardados (meta ≥3 %), % de alcance a no seguidores, comentarios con la palabra, DMs entregados, seguidores nuevos. Línea base = mediana de las primeras 10 piezas propias (regla de la auditoría).
4. TikTok: mismo video, caption corto, entrega manual del recurso (envío automático sin seguir **no verificado**).

## 8. Decisiones que solo puede tomar Eduardo (estado inicial; resueltas en §10)
1. **Palabra clave** del regalo: debe ser un venezolanismo verificado, una palabra = un recurso. GOLEM ya está ligada al reel 1; el banco de @soyeduardo.ia (rama `docs/soyeduardo-ia-estilo-keywords`) sigue sin aprobar. No propongo palabras sin verificar.
2. **Cifra N:** solo la que pase F1 (el manual y la auditoría hablan de "18 efectos"; el zip tiene 25 carpetas).
3. **Audio objetivo:** −16 LUFS (norma actual del repo) o ≈ −14 (como la referencia). Mi sugerencia: probar −14 en los 2 reels y comparar retención; es hipótesis, no dato.
4. **Música:** su pista de Gemini tiene uso comercial **no confirmado** (tu propio doc del 21-10): válida para orgánico a tu riesgo; verificar términos antes de impulsar con anuncios.
5. **Fondo del carrusel:** Tinta (recomendado) o Hueso.
6. ¿Sube Claude Motion para auditarlo directamente?

## 9. Cómo se eligió esta versión
Tres versiones internas puntuadas con los mismos criterios (precisión sin inventar, accionabilidad, alineación con manual, brevedad):
- v1 plan genérico "recrear los 3 con tu marca": 6,5 (promete "20 efectos" y copia los 30 skills).
- v2 con auditoría verificada y brechas reales: 8,3 (aún sin criterios de aceptación ni decisiones).
- **v3 (esta): 9,3** — separa lo verificado de lo no verificado, define aceptación medible por fase y deja las decisiones en quien corresponde. Autoevaluación mía, no medición externa.

## 10. Actualización 27-10 (tarde)

### 10.1 Decisiones de Eduardo
| Tema | Decisión |
|---|---|
| Música Gemini | Uso comercial **confirmado** por Eduardo → se retira la cautela del §8.4 |
| Cifra en el título | "Varios" o **"+20"**. "+20" solo si ≥21 efectos pasan render con evidencia; si no, cifra exacta |
| Audio | **−14 LUFS** en los 2 reels (prueba). Perfil nuevo: LUFS −14, pico real ≤ −1,0 dBTP (la referencia 3 llega a −0,5: demasiado cerca de 0) |
| Fondo del carrusel | **Tinta** |
| Repo | Los cambios están solo en local (cortes eléctricos). El repo en GitHub está atrasado |
| Palabra clave | Reutilizable; hay que **reemplazar el archivo del Drive** que entrega el DM |

### 10.2 Tercer video verificado por mí — "30 Reels for your brand" (43,33 s)
- 720×1280, 30 fps, H.264 + AAC · **−14,3 LUFS**, pico real −0,5 dBFS · 8 láminas animadas con contador `01/08`, cremas y terracota, kicker pequeño + titular bicolor, subtítulos palabra por palabra en píldoras oscuras.
- **Arco:** promesa cuantificada → frase única → **objeción verbalizada y tachada** ("¿Reels aleatorios de IA? No.") → mecanismo → configuración → demo → oferta alternativa → CTB.
- **Qué sirve:** (a) objeción en el gancho → Reel B; (b) "carrusel animado como reel" = gemelo en video del carrusel (`reel.mjs` ya tiene contador NN/TT); (c) ninguna escena debería pasar de ≈4,5 s (la lámina 04/08 dura 10,5 s con el mismo encabezado).
- **Qué no:** es el pitch de un producto de terceros; no se replican su oferta ni su conector.

### 10.3 Contraste del análisis forense de la otra IA (`auditoria_forense_ingenieria_inversa_3_videos_ia.md`)
| Dato | Resultado de mi contraste |
|---|---|
| Duración, 720×1280, 30 fps, 8 láminas, cadencia ≈1,1 s, CTB "EFFECT" / "OOTTO" | ✅ Coincide |
| Lecho grave en "20 effects" | ✅ Plausible: en los fotogramas más silenciosos el 60 % de la energía está bajo 250 Hz. No puedo afirmar que sea música rítmica |
| **Niveles de audio** | ❌ **No coinciden.** "20 effects": ellos RMS −21,2 / pico −11,7; medí RMS −17,1 / **pico −1,7 dBFS**. "30 Reels": ellos RMS −24,3; medí −18,1 / LUFS −14,3 / pico −0,5. Se descartan sus cifras de audio |
| Stack "Remotion + MediaPipe", cómo se construye cada efecto | ⚠️ Inferencia, no hecho. Útil como hipótesis de implementación |
| HEX "extraídos" | ⚠️ Aproximados; no se usan: nuestro sistema de marca manda |
| "Drop-off 60–70 %", "miles de comentarios EFFECT", "efectos que duplicaron retención de clientes" | ❌ Sin fuente / inventado. **No se usa ninguna** (regla anti-alucinación y manual §8) |
| "Claude Motion = interfaz ficticia" | ❌ Contradicho por esta sesión: los conectores de Canva, Vercel y HyperFrames exponen `import-claude-motion-from-url`, lo que indica que existe como función. Sigo sin ver el video |

### 10.4 Lo útil que se incorpora
1. **Menú de pasos con los pasos futuros desenfocados** (bucle abierto): comprobar si `pasos-progreso` ya lo hace; si no, parametrizarlo (el doc sugiere opacidad .35 + blur 4 px: valor a probar, no dato).
2. **Los 8 efectos que faltan, separados por dificultad:** *sin recorte de persona* (deterministas en HTML/GSAP): Portal, Infinite Zoom, Cube Spin, Tile Tunnel, Phone Fan → F1b. *Con recorte de persona*: Title Orbit, Clone Room, Ribbon Wrap → diferidos (la skill no trae máscara de persona; la nota del 21-10 menciona un modelo `.onnx` en una rama local, sin verificar).
3. **Reel A cierra con 1 efecto aplicado a una pieza real** (propia o de @ceinca.mercantil, sin cifras de resultados) para cualificar al público; la referencia atrae "coleccionistas" sin caso de uso.
4. **Reel A es mixto:** columna derecha alterna efectos sobre tu cara (zooms, lupa, spotlight, shatter, rompe-marco, corta-pega, chroma, karaoke, grid) con escenas UI (bento, gráfica, teléfono, consola…). Con ≥21 pasan "+20".
5. **Opcional F7:** versión reel animado del carrusel (8 láminas, ≤4,5 s cada una, contador 01/08).

### 10.5 Repo local sin subir
No importo el zip a la copia de GitHub: chocaría con tus ramas locales (la del 21-10 menciona 25 commits sin subir). Orden: subes cuando haya luz → F1 se ejecuta sobre eso. Hasta entonces el plan no toca código.

### 10.6 Reemplazar el archivo del DM en Drive (desde el cel)
- **A (recomendada):** lo hago yo con la herramienta de Drive de esta sesión, conservando el mismo enlace. Necesito (1) el nombre o enlace del archivo que entrega el DM y (2) el zip final tras F2. Solo lo ejecuto con tu confirmación, porque cambia lo que reciben quienes comenten.
- **B (manual, no verificado desde un cel):** `drive.google.com` en el navegador del cel con "Versión para computadora" → ⋮ del archivo → *Administrar versiones* → *Subir nueva versión*. La app de Drive normalmente no ofrece esa opción.
- ⚠️ **Riesgo de coherencia:** GOLEM ya está en el reel 1. La regla del CTB exige que el DM cumpla lo que prometen **todas** las piezas de esa palabra. Si el reel 1 promete otro recurso, reemplazar el archivo rompe esa promesa; entonces conviene un bloque separado en Beacons o archivo/palabra distinta. Pregunta abierta: ¿qué promete el reel 1?

### 10.7 Claude Motion verificado + palabra clave nueva
**Claude Motion.mp4 (subido por Eduardo, verificado por mí con ffmpeg y hoja de contacto):**
- 64,1 s · 720×1280 · 30 fps · H.264 + AAC · **−14,1 LUFS** · pico real −0,7 dBFS · LRA 2,5 LU.
- Layout confirmado: escenario UI arriba, vocero en tarjeta redondeada abajo, subtítulos palabra por palabra en la franja central, palabras gigantes ("premium", "taste.") detrás de la tarjeta.
- Secuencia confirmada en pantalla: mosaico de widgets → barra de prompt con tipeo → tarjeta "plana" → widget con contador → **menú de 4 pasos que reaparece 4 veces** (≈12, 20, 33 y 49 s) con los pasos futuros desenfocados → tarjeta `house-style.md` → A/B "Make it look nice" vs "Lines that draw themselves" → botón que pasa a "✓ Published" → carrusel con desenfoque de movimiento → panel *Tweaks/Style* → exportación a MP4 → CTA "Comment APPLE".
- El panel Tweaks y el modal de exportación **se ven en pantalla**: contradice que la interfaz sea ficticia (no puedo confirmar que sea oficial). El análisis del 26-10 y el forense coinciden con lo que veo en estructura y tiempos.
- Ajuste para Reel B: el menú de pasos reaparece 4 veces en 64 s; en ≤45 s bastan 3 apariciones.

**Palabra clave (GOLEM descartada: entrega un prompt, no la skill):**
- **Recomendada: ÑAPA** (banco CTB §E, nº 66; no aparece en la tabla de uso). En venezolano es "el extra que te regalan": encaja con "te lo regalo". Riesgo: mucha gente escribe "napa" sin la ñ → configurar el disparador con ambas formas si Meta lo permite (no verificado) o elegir la alternativa.
- **Alternativa sin ñ: PALANCA** (nº 72; libre en la tabla): "la palanca para que Claude edite con tu marca".
- **Antes de elegir:** la auditoría del 20-10 citó FIEBRU'O como ejemplo de "te lo regalo → skill". Si FIEBRU'O ya existe en @soyeduardo.ia y entrega la skill, reciclarla es mejor (sin automatización nueva). La tabla del repo no incluye las palabras de @soyeduardo.ia (GOLEM tampoco está), así que Eduardo debe confirmar cuáles están activas.
- Al publicar: registrar la palabra en la tabla 1 del archivo maestro (regla 6) y subirlo a repo, Drive y proyecto de Claude. El DM entregará el enlace del zip final (F2).


> **Actualización 27-10 (noche):** la decisión de que el kit regalo lleve tu nombre (D1) se **revirtió**: el kit va sin marca ni nombre. Ver `PLAN_MAESTRO_ÑAPA` §0.1 y F2.
