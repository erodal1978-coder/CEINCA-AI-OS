# MÓDULO PRODUCCIÓN CINEMATOGRÁFICA — GOOGLE FLOW + META EDITS
## CEINCA AI OS v2.0 | Sistema de Reels con Avatar IA

> ⚠️ **Documento desactualizado en 2 reglas técnicas — fuente de verdad vigente: `PRODUCTION/FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1.** Este documento contiene 23 usos de `@Eduardo` (nombre propio dentro de prompts de ejemplo) y 2 usos de "hiperrealista" — exactamente las 2 reglas "NO NEGOCIABLES" §4.5 y §4.6 de v1.1, descubiertas por un **rechazo real de política de Flow** documentado en `SAREN_TOTUMA_SCRIPT_FLOW.md` (nunca usar el nombre propio del sujeto en el prompt; nunca usar "hiperrealismo"/"fotorrealista"). No usar los prompts de este documento como plantilla literal sin aplicar esas 2 correcciones. El resto del contenido (biblioteca de b-rolls, lighting setups, parámetros de Meta Edits, stack técnico) sigue siendo referencia válida — pendiente de consolidación formal hacia v1.1 (ver `handoff.md`).

---

## ⚙️ STACK TÉCNICO OFICIAL

| Herramienta | Función | Tier requerido |
|---|---|---|
| **Google Flow** | Generación de escenas con avatar | Google AI Pro/Ultra |
| **Gemini Omni Flash** | Modelo de generación (character consistency) | Pro/Ultra |
| **Veo 3.1** | Motor de video con audio nativo | Pro/Ultra |
| **Nano Banana 2 / Pro** | Generación de imágenes / Ingredients | Pro (Pro) / Ultra (Pro) |
| **Meta Edits** | Edición final + publicación | Gratuito |

---

## 📐 REGLAS MAESTRAS DEL SISTEMA

```
DURACIÓN POR ESCENA : 4s / 6s / 8s / 10s (límite técnico Flow + Omni)
RESOLUCIÓN          : 9:16 (vertical Reel)
ESTILO              : Hiperrealista — sin aspecto IA generado
AVATAR              : Eduardo Rodríguez — Soul entrenado en Google Flow
                      Guardar como Ingredient fijo y referenciar con @Eduardo
EDICIÓN FINAL       : Meta Edits (herramienta nativa de Meta)
AUDIO               : Veo 3.1 genera audio nativo por escena (SFX automático)
```

---

## 🔴 REGLA DE ENCADENAMIENTO DE ESCENAS (ACTUALIZADA — Flow Frames to Video)

### Método 1 — FRAMES TO VIDEO (recomendado desde jun 2026)
```
ESCENA 1 → generar → capturar ÚLTIMO FRAME como imagen estática
                          ↓
              Usar como START FRAME de la Escena 2 en "Video Frames"
                          ↓
              Flow genera la transición física entre ambas escenas
                          ↓
              En Meta Edits: corte limpio natural sin truco editorial
```

### Método 2 — CIERRE A NEGRO (fallback cuando Frames to Video no aplica)
```
ESCENA 1 → CIERRE: fade/zoom/cut a negro
ESCENA 2 → INICIA: descripción exacta del estado visual del cierre anterior
           (ej: "La imagen emerge desde negro con iluminación creciente...")
```

> ⚠️ PROHIBIDO en prompts: "continuando desde la escena anterior" /
> "Eduardo sigue señalando" — cada escena es una toma nueva e independiente.

---

## 🎭 CONFIGURACIÓN DE AVATAR (Omni Flash — Character Consistency)

Con Gemini Omni Flash, el avatar se mantiene consistente entre escenas
si se referencia correctamente como Ingredient.

### Setup obligatorio al iniciar cada proyecto:
```
1. Abrir proyecto en Flow
2. Subir foto de referencia de Eduardo como Ingredient
3. Nombrarla: "Eduardo" 
4. En cada prompt de escena que incluya avatar: añadir @Eduardo
5. En escenas con voz: añadir @Voice: Eduardo (si tienes voz configurada)
```

### En el prompt de escena con avatar:
```
[DESCRIPCIÓN DE ESCENA] featuring @Eduardo.
[DETALLES DE CÁMARA, LUZ, FX]
```

---

## 🤖 FLOW AGENT — USO PARA REELS CEINCA

Desde mayo 2026, activar Flow Agent como PASO 0 antes de generar escenas.

### Brief tipo para el Agent:
```
Soy un abogado mercantilista venezolano. Necesito un Reel de Instagram 
de 45 segundos en formato 9:16 sobre [TEMA].

Estructura: 6 escenas de 4-10 segundos cada una.
Estilo: cinematográfico, hiperrealista, corporativo.
Avatar: @Eduardo (abogado venezolano, traje oscuro, oficina profesional).
Keyword CTA: [KEYWORD]
Paleta: fondo navy #122A63, texto blanco, acento dorado #C8A951.

Genera las 6 escenas con prompts detallados incluyendo cámara, 
iluminación, FX y cierre de cada escena.
```

El Agent puede generar múltiples variaciones de una escena a la vez:
*"Dame 5 variaciones de la Escena 3 con diferente iluminación."*

---

## 🛠️ FLOW TOOLS — HERRAMIENTA REUTILIZABLE CEINCA

Crear una Flow Tool personalizada "Reel CEINCA" que pre-configure:
- Estilo visual CEINCA (navy + dorado, cinematográfico)
- Estructura de 6 escenas con duraciones
- Referencia a @Eduardo como Ingredient fijo
- Reglas de encadenamiento entre escenas
- Instrucciones de audio Veo 3.1

Usar esta Tool en cada nuevo Reel sin reconfigurar desde cero.

---

## 🖥️ BIBLIOTECA DE B-ROLLS CEINCA

### Escenas de IA / Gemini / Documentos:
```
- Pantalla Gemini modo oscuro — texto generándose en tiempo real (UI real)
- Cursor sobre documento Word / Google Docs con formato legal venezolano
- Pantalla dividida: PDF LOPNNA/Mercantil (izq) / Gemini generando (der)
- Manos sobre teclado, reflejos de pantalla en lentes (close-up)
- Primer plano pantalla: texto legal apareciendo letra por letra
- Dashboard Google Workspace, navegación fluida entre documentos
- Notificación Gemini completando tarea — UI real de Google
- Terminal con texto legal en efecto typewriter
```

> 💡 Con Veo 3.1: estas escenas generan audio automático (teclado,
> notificaciones, ambiente de oficina). No agregar SFX manualmente en edición.

### Escenas de Eduardo — Avatar @Eduardo:
```
- Frente a cámara, oficina profesional bokeh al fondo
- Perfil 3/4, mirando pantalla (no a cámara)
- Señalando hacia arriba-derecha (dato o infografía invisible)
- Con laptop abierta, luz de pantalla iluminando rostro
- Close-up manos + teclado + pantalla al fondo
- De pie junto a ventana, luz natural lateral
- Close-up facial, expresión de autoridad / énfasis
```

### Escenas de impacto / motion graphics:
```
- Texto en pantalla negro — aparece letra por letra (navy #122A63)
- Número grande ($97, 64 formatos) con pulso/scale animation
- Línea dorada #C8A951 barriendo de izquierda a derecha
- Logo CEINCA sobre navy con partículas doradas flotantes
- Documento convirtiéndose en PDF con animación de páginas
```

---

## 📝 PLANTILLA MAESTRA DE PROMPT PARA FLOW

```
[APERTURA] — estado visual exacto desde cierre anterior / start frame
[ESCENA] — qué vemos, dónde, ambiente
[SUJETO] — @Eduardo / pantalla / texto / motion graphic
[CÁMARA] — tipo de toma, movimiento, focal equivalente
[LUZ] — tipo, dirección, temperatura Kelvin
[FX] — profundidad de campo, grano, color grade, scan lines
[AUDIO] — ambiente implícito (Veo 3.1 lo genera automático)
[CIERRE] — descripción exacta de cómo termina / qué capturar como end frame
[DURACIÓN: Xs]
```

---

## 🎬 ESTRUCTURA NARRATIVA TIPO (6 escenas — NEAPS)

| # | Tipo | Dur | NEAPS | Modelo |
|---|---|---|---|---|
| 1 | B-Roll pantalla Gemini — Hook | 8s | N — Núcleo del Dolor | Omni Flash |
| 2 | Motion graphics — datos impacto | 6s | E — Entorno Regulatorio | Omni Flash |
| 3 | @Eduardo — autoridad a cámara | 10s | A — Atención Visual | Omni Flash |
| 4 | Demo pantalla — documento real | 8s | P — Propuesta de Valor | Omni Flash |
| 5 | Motion graphics — precio/oferta | 6s | S — Solución | Omni Flash |
| 6 | @Eduardo — CTB + keyword | 8s | S — CTB cierre | Omni Flash |

**Duración total tipo:** ~46s | **Rango aceptable:** 30s–60s

---

## 💡 LIGHTING SETUPS POR TIPO DE ESCENA

| Escena | Setup de iluminación |
|---|---|
| @Eduardo hablando | Rembrandt: key upper-left 3200K, fill soft right, hair light separador |
| @Eduardo + pantalla | Screen glow como key light, fill ambiental fría desde derecha |
| B-Roll pantalla | Solo monitor glow — scan lines 8% opacity — sin luz adicional |
| Motion graphics | Self-illuminated, vignette edges, glow dorado en elementos #C8A951 |

**Color grade objetivo (todas las escenas):**
- Estilo Teal & Orange (contraste piel caliente vs fondos fríos)
- Lifted blacks — nunca crush total
- Skin: ligeramente desaturado, highlights cálidos
- Shadows: teal / azul frío

**Parámetros de cámara:**
- Focal equivalente preferido: 85mm (compresión natural)
- Apertura implícita: f/1.8–f/2.8 (bokeh controlado)
- Sensor aesthetic: Sony FX3 / ARRI look
- Micro handheld shake en escenas naturales — locked-off en datos

---

## 🔗 BIBLIOTECA DE CIERRES Y APERTURAS

| Cierre Escena N | Apertura / Start Frame Escena N+1 |
|---|---|
| Fade a negro lento | Imagen emerge desde negro, iluminación creciente |
| Zoom in rápido a pantalla | Pantalla ocupa todo el frame, zoom out revela entorno |
| Cut seco (corte de cámara) | Nuevo ángulo, luz diferente, mismo sujeto |
| Desenfoque (blur out) | Enfoque progresivo desde desenfoque total |
| Flash de luz blanca | Escena aparece desde sobreexposición bajando a normal |
| Smash cut a negro | Texto emerge desde fondo negro |
| Captura de último frame | → Usar como Start Frame en Video Frames de la siguiente escena |

---

## ⚙️ PARÁMETROS META EDITS (post-producción)

```
TRANSICIONES  : Cut seco entre escenas (sin cross-fade automático de Meta)
SUBTÍTULOS    : Bold centrado, blanco, 85-90% ancho de frame, máx 4 palabras
COLOR GRADE   : Teal & Orange (contraste piel + fondos fríos)
MÚSICA        : Lo-fi corporativo / cinematic build sin letra — volumen: -18dB
VOLUMEN VOZ   : -6dB
LOGO          : CEINCA dorado, bottom-center, última escena + fade hold 1.5s
LOWER THIRD   : CTB keyword — blanco Bold, deslizamiento desde izquierda ease-out
FORMATO       : 1080×1920px, H.264, 30fps
```

---

## 📦 EJEMPLO COMPLETO — GEM LOPNNA (6 escenas listas para Flow)

**Concepto:** "La IA que genera documentos LOPNNA en segundos"
**Keyword CTB:** LOPNNA | **Duración:** ~46s

---

### ESCENA 1 — HOOK (8s) | B-Roll pantalla Gemini
```
PROMPT FLOW:
Ultra-realistic screen recording aesthetic. Modern laptop screen fills 
the frame close-up. Gemini AI interface open — dark mode, Google's actual 
UI, Gemini logo top-left. Typing cursor blinks in prompt field. Fingers 
enter frame from below typing rapidly. Text appears: "Genera una solicitud 
de custodia monoparental según LOPNNA Venezuela." Send button clicked. 
Gemini begins generating — text streams onto screen.

@Eduardo not in frame — B-Roll only.
CAMERA: Extreme close-up, rack focus fingers→screen, micro handheld shake.
LIGHT: Screen glow as primary light, warm ambient from right.
FX: Shallow DOF, lens flare from screen edge, film grain 10%.
AUDIO: Mechanical keyboard clicks, system notification ping (auto Veo 3.1).
CLOSE: Rapid zoom into screen center — CAPTURE THIS FRAME as end frame.
       End frame = Start Frame for Scene 2.
DURATION: 8s
```

---

### ESCENA 2 — IMPACTO (6s) | Motion graphics
```
PROMPT FLOW:
[START FRAME: end frame from Scene 1 — screen zoomed in]
Zoom continues briefly then CUTS to pure black. Single white text fades 
in centered — bold Montserrat: "64 documentos. Listos en segundos." 
Numbers pulse with subtle scale. Thin gold line #C8A951 sweeps left to 
right beneath text. Background transitions from black to navy #122A63.

CAMERA: Static, perfectly centered, vignette edges.
LIGHT: Self-illuminated white text, warm glow on gold line.
FX: Film grain 15%, cinematic letterbox bars, gold line has motion blur.
AUDIO: Subtle deep bass tone rising (auto Veo 3.1).
CLOSE: Text fades, gold line disappears — FADE TO BLACK 0.5s.
       CAPTURE last frame (black) as end frame.
DURATION: 6s
```

---

### ESCENA 3 — AUTORIDAD @Eduardo (10s) | Avatar a cámara
```
PROMPT FLOW:
[START FRAME: black from Scene 2 end]
Scene opens from black with rising ambient light. @Eduardo: Venezuelan 
male attorney, professional dark blazer, at modern real law office desk. 
Two monitors behind him slightly out of focus. Speaks directly to camera 
with authority and calm confidence. Slight right-hand gesture toward 
off-screen document.

CAMERA: Medium close-up chest to crown. Imperceptible left-right drift.
        Sony FX3 aesthetic, 85mm equivalent focal length.
LIGHT: Rembrandt — key upper-left 3200K, soft fill right, hair light.
FX: Lifted blacks, desaturated skin, teal shadows, warm highlights.
    Background bokeh: bookshelves, diplomas barely readable, window light.
AUDIO: Room tone, subtle HVAC ambient (auto Veo 3.1).
CLOSE: He stops speaking, looks slightly off-camera toward screen — 
       FADE TO BLACK. CAPTURE last frame as end frame.
DURATION: 10s
```

---

### ESCENA 4 — DEMO PANTALLA (8s) | Documento generándose
```
PROMPT FLOW:
[START FRAME: black from Scene 3 end → screen emerges from dark]
Ultra-realistic Google Docs document on screen. Header reads: 
"SOLICITUD DE GUARDA Y CUSTODIA — LOPNNA" in formal Venezuelan legal 
format. Text being generated in real-time — cursor blinks as paragraphs 
appear automatically. Gemini side panel visible on right edge.

No @Eduardo in frame — screen recording aesthetic only.
CAMERA: Full-frame monitor capture — bezels barely visible. No movement.
LIGHT: Only monitor glow — realistic.
FX: Scan lines 8% opacity, micro cursor blink, authentic Google Docs UI.
AUDIO: Typing sounds, page generation tone (auto Veo 3.1).
CLOSE: Document scrolls down to signature block — ZOOM IN to 
       "GEM LOPNNA" watermark in footer — SMASH CUT TO BLACK.
       CAPTURE last frame (zoom on watermark) as end frame.
DURATION: 8s
```

---

### ESCENA 5 — PRECIO / OFERTA (6s) | Motion graphics
```
PROMPT FLOW:
[START FRAME: watermark zoom from Scene 4 → pulls back to navy]
Scene settles on deep navy background #122A63. Center frame: gold 
horizontal line appears, then "GEM LOPNNA" white bold Montserrat above. 
Below: "$97" large gold text, struck-through "$400" gray upper-right. 
Gold particle system drifts upward slowly in background.

CAMERA: Static, perfect vertical center.
LIGHT: Rim glow behind text, warm gold ambient.
FX: Text ease-in from opacity 0, gold particles motion blur, 
    depth glow behind elements.
AUDIO: Cash register sound subtle, rising string tone (auto Veo 3.1).
CLOSE: Elements scale up slightly — gold flash fills frame — 
       HARD CUT TO BLACK. CAPTURE gold flash frame as end frame.
DURATION: 6s
```

---

### ESCENA 6 — CTA CIERRE (8s) | @Eduardo + Lower Third
```
PROMPT FLOW:
[START FRAME: gold flash from Scene 5 fading to reveal @Eduardo]
@Eduardo: same attorney, medium close-up shoulders to crown, looks 
directly into camera. Confident, direct expression. Speaks one clear 
sentence. Lower-third overlay: "Escribe LOPNNA" white Bold, gold DM 
icon left. CEINCA logo bottom-center, small, gold on navy #122A63.

CAMERA: Locked off. No movement. Direct eye contact.
LIGHT: Slightly brighter than Scene 3 — frontal fill warmer tone.
FX: Lower-third slides in from left ease-out, breathing DOF.
    @Voice: Eduardo (voice consistency).
AUDIO: Motivational subtle music swell, voice clear -6dB (auto Veo 3.1).
CLOSE: He nods once — FADE TO BLACK — CEINCA logo holds 1.5s.
DURATION: 8s
```

---

## 📋 CHECKLIST DE PRODUCCIÓN POR REEL

```
PRE-PRODUCCIÓN
☐ Tema y keyword CTB definidos
☐ Brief dado al Flow Agent (paso 0)
☐ @Eduardo subido como Ingredient en el proyecto
☐ Voz configurada como @Voice: Eduardo (si aplica)
☐ Flow Tool "Reel CEINCA" activada (si disponible)

PRODUCCIÓN (por escena)
☐ Prompt completo con todos los campos de plantilla
☐ @Eduardo referenciado en escenas con avatar
☐ Audio implícito descrito para Veo 3.1
☐ End frame capturado para usar como Start Frame siguiente
☐ Duración correcta: 4s / 6s / 8s / 10s

POST-PRODUCCIÓN META EDITS
☐ Clips importados en orden
☐ Cortes secos (sin auto cross-fade)
☐ Subtítulos Bold centrados, máx 4 palabras
☐ Música -18dB / Voz -6dB
☐ Lower third CTB con keyword
☐ Logo CEINCA al cierre con fade hold 1.5s
☐ Export: 1080×1920px, H.264, 30fps
```

---

*Módulo creado: junio 2026 | Basado en Google Flow changelog hasta 10/06/2026*
*Actualizar cuando Flow lance nuevas features: Omni Frames to Video, audio inputs, iOS app Flow*

---

## 🗺️ FLOW AGENT + GOOGLE MAPS STREET VIEW (nueva feature — jun 2026)

### ¿Qué hace?
El Flow Agent ahora puede generar imágenes y videos anclados en ubicaciones
reales de Google Maps Street View. Al activar Agent mode y mencionar una
dirección o landmark en el prompt, Flow usa la geometría, iluminación y
contexto visual real de ese lugar como base de la escena.

**Disponibilidad actual:** Global — SOLO ubicaciones de EE.UU. por ahora.
Latinoamérica/Venezuela: NO disponible todavía. Monitorear futuros rollouts.

---

### ANÁLISIS DE IMPACTO PARA CEINCA

#### ❌ NO aplicable ahora (Venezuela no cubierta)
- Escenas en Caracas, Bejuma, registros venezolanos → sin Street View aún
- No usar con direcciones venezolanas — el modelo no tiene esos datos

#### ✅ SÍ aplicable — Casos de uso CEINCA con ubicaciones US

| Caso de uso | Cómo usarlo |
|---|---|
| **Escena de autoridad internacional** | @Eduardo frente a un edificio corporativo real en Miami, NYC o Houston — mercado venezolano en diaspora |
| **B-Roll de contexto legal** | Fachada real de un courthouse federal en Miami para contenido sobre apostilla/legalización internacional |
| **Escena de ciudad moderna** | Skyline real de una ciudad US como fondo cinematográfico para Reels de posicionamiento premium |
| **Contexto de expansión** | "Tus documentos venezolanos ahora válidos aquí" — escena en dirección real de consulado o registro |

#### 🔮 Cuando llegue a Latinoamérica (preparar prompts ya)
```
Ubicaciones CEINCA prioritarias para cuando esté disponible:
- Registro Mercantil de Valencia, Carabobo
- SAREN Caracas (sede principal)
- Palacio de Justicia de Caracas
- Centro Comercial Las Américas, Bejuma (zona CEINCA)
- Consulados venezolanos en Colombia/Panamá
```

---

### CÓMO ACTIVAR ESTA FEATURE EN FLOW

```
1. Abrir proyecto en Flow
2. Activar Agent mode (toggle en la barra de prompt)
3. En el prompt incluir:
   - Nombre de landmark: "Times Square, New York"
   - O dirección exacta: "123 Brickell Ave, Miami, FL"
4. Flow consulta Street View y ancla la escena en ese lugar real
```

### PROMPT TIPO — Escena con Street View (uso diaspora venezolana)

```
PROMPT FLOW (Agent mode activado):
@Eduardo standing confidently in front of 1 SE 3rd Ave, Miami, FL —
Brickell financial district. Real street-level scene from Google Maps
Street View as background. He wears a dark professional blazer.
He looks directly at camera with calm authority.

CAMERA: Medium close-up, 85mm equivalent, @Eduardo sharp, Brickell
building bokeh background.
LIGHT: Natural midday Miami sun, warm side fill from right.
FX: Slight cinematic grade, lifted blacks.
AUDIO: Light urban ambient, distant traffic (auto Veo 3.1).
CLOSE: FADE TO BLACK.
DURATION: 8s
```

---

### LIMITACIÓN IMPORTANTE A INCLUIR EN PROMPTS

```
⚠️ Esta feature solo funciona con ubicaciones de EE.UU.
   Si usas una dirección venezolana o latinoamericana, el Agent
   ignorará Street View y generará un fondo sintético genérico.
   No mencionar en el prompt "Venezuela" como ubicación geográfica
   si el objetivo es activar Street View real.
```

---

*Feature documentada: junio 2026 — Rollout global solo US locations*
*Actualizar cuando Google extienda Street View grounding a Latinoamérica*
