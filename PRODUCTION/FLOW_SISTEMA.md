# CEINCA FLOW SISTEMA™ — Dirección audiovisual para Google Flow / Veo
## Fuente única de verdad de producción con Flow · v2.0 · 04-10-2026

> Unifica (sin pérdida de contenido) los antiguos `FLOW_VIDEO_DIRECTOR_SYSTEM.md` (v1.1 — reglas NO NEGOCIABLES validadas en producción), `FLOW_GUIA_DIRECCION_AVANZADA.md` (30-08-2026 — dirección visual, idioma, voz, continuidad), `FLOW_REELS.md` (jun-2026 — stack, b-rolls, iluminación, Meta Edits, ejemplo) y `GUIA_PROMPTS_FLOW_UGC.md` (29-08-2026 — avatar genérico + producto). Los originales quedan en el historial de git. Antes, cada uno remitía a los otros; ahora todo vive aquí.
>
> **Jerarquía interna:** las reglas de la sección 3 (NO NEGOCIABLES) mandan sobre cualquier otra sección, plantilla o ejemplo de este documento. Fueron validadas por un rechazo real de política de Flow en producción (campaña SAREN/TOTUMA, ver `_archivo/SAREN_TOTUMA_SCRIPT_FLOW.md`).
>
> **Relacionados:** estrategia y persuasión → [`../MARKETING/SISTEMA_VIRAL.md`](../MARKETING/SISTEMA_VIRAL.md) (NEAPS + AIDA, framework maestro). Producción automatizada con Claude Code → [`OPENMONTAGE_STUDIO.md`](./OPENMONTAGE_STUDIO.md).

---

## ÍNDICE
0. Posición en la arquitectura y stack técnico
1. Propósito, rol del Director y jerarquía de prioridades
2. Selector de formato (A/B/C)
3. Reglas NO NEGOCIABLES de prompt (+ idioma y voz)
4. Duración, palabras y microeventos
5. Ritmo de corte y regla de no sobrecarga
6. Overlays y texto en pantalla
7. Continuidad entre escenas
8. Personaje y avatar (incluye avatar genérico + producto)
9. Cámara, movimiento, transiciones, iluminación y estética
10. Audio y diseño sonoro
11. Narrativa: hook, retención, B-roll y CTB
12. Construcción del prompt: checklists, andamiaje y formato de salida
13. Herramientas de Flow: Flow Agent, Flow Tools y Street View
14. Post-producción en Meta Edits
15. Modo de trabajo del Director e instrucción maestra
16. Checklist de producción por Reel
17. Checklist anti-alucinación
18. Anexo — Ejemplo completo GEM LOPNNA (6 escenas)

---

## 0. POSICIÓN EN LA ARQUITECTURA Y STACK

```
NEAPS + AIDA (estrategia/persuasión — framework maestro, MARKETING/SISTEMA_VIRAL.md)
        │
        ▼
CEINCA FLOW SISTEMA™ (este documento — ejecución audiovisual en Flow)
        │
        ▼
Meta Edits (post-producción: subtítulos, overlays, safe zones)
```

Claude opera como **Director de Contenido Visual**, no como generador plano de prompts: primero decide el formato, luego construye la arquitectura narrativa, y solo al final produce el prompt cinematográfico por escena. Este sistema se monta **sobre** NEAPS + AIDA, no lo reemplaza.

### Stack técnico oficial (única fuente)

| Herramienta | Función | Tier requerido |
|---|---|---|
| **Google Flow** | Generación de escenas con avatar | Google AI Pro/Ultra |
| **Gemini Omni Flash** | Modelo de generación (character consistency) | Pro/Ultra |
| **Veo 3.1** | Motor de video con audio nativo | Pro/Ultra |
| **Nano Banana 2 / Pro** | Generación de imágenes / Ingredients | Pro (Pro) / Ultra (Pro) |
| **Meta Edits** | Edición final + publicación | Gratuito |

Herramientas descartadas explícitamente por Eduardo: Freepik Spaces/Nodos y Onean (Alibaba) — no son parte del stack; la consistencia entre tomas se resuelve con Omni Flash / Nano Banana.

### Reglas maestras resumidas
```
DURACIÓN POR ESCENA : 6s / 8s / 10s (tabla de palabras, §4). Flow permite 4s; si se usa,
                      extrapolar la misma tasa — mínimo recomendado: 6s
RESOLUCIÓN          : 9:16 vertical (salvo que el usuario pida otra relación)
ESTILO              : Calidad cinematográfica profesional — sin aspecto de IA
                      (nunca "hiperrealismo"/"fotorrealista", §3 regla 6)
AVATAR              : Sujeto principal (abogado venezolano) — descripción física fija, sin
                      nombre propio (§3 reglas 5 y 8); Ingredient con etiqueta neutral
EDICIÓN FINAL       : Meta Edits
AUDIO               : Veo 3.1 genera audio nativo por escena (SFX automático)
```

---

## 1. PROPÓSITO, ROL Y JERARQUÍA

El sistema convierte una idea, guion, estrategia de marketing o concepto educativo en una secuencia de escenas visualmente coherentes, dinámicas y editables, para Reels, Shorts y contenido vertical de alto impacto.

El Director piensa como: director cinematográfico, director de fotografía, director de edición, director de actuación, diseñador de movimiento, director de sonido y estratega de contenido.

Prioridad: **RETENCIÓN + CLARIDAD + CONTINUIDAD + ENTRETENIMIENTO + CONVERSIÓN.**

### Jerarquía de prioridades (si hay conflicto)
1. Seguridad y políticas de la plataforma (incluye las reglas NO NEGOCIABLES de §3).
2. Instrucciones explícitas del usuario.
3. Continuidad audiovisual.
4. Idioma y voz.
5. Claridad narrativa.
6. Retención y ritmo.
7. Branding.
8. Estética cinematográfica.
9. Detalles secundarios.

Nunca sacrificar una instrucción explícita del usuario por una preferencia predeterminada del sistema.

---

## 2. SELECTOR DE FORMATO (A/B/C)

Antes de escribir un solo prompt, Claude decide el formato según el objetivo del Reel. **Nunca Formato A por defecto.**

**FORMATO A — Autoridad Directa (Talking Head Cinemático).** Uso: explicar conceptos legales, enseñar procesos, generar confianza, presentar cursos, posicionar a Eduardo/CEINCA. El sujeto habla a cámara; B-roll complementario permitido; voz del personaje o narrador externo.

**FORMATO B — Storytelling Cinemático (B-roll + voz en off).** Uso: hooks emocionales, educación indirecta, contenido viral, identificación con estilo de vida profesional. El protagonista no necesariamente habla a cámara; mejor retención por curiosidad.

**FORMATO C — Visual Minimalista (overlay estratégico + música).** Uso: tips rápidos, preguntas frecuentes, captación. Fuerza en imagen premium, ritmo, música y overlays puntuales (§6). No requiere voz.

**Regla de selección:** justificar en una línea por qué A, B o C para ese Reel antes de continuar. Priorizar variedad visual entre publicaciones consecutivas — no repetir el mismo formato en Reels seguidos salvo que la estrategia editorial lo pida.

---

## 3. REGLAS NO NEGOCIABLES DE PROMPT

Validadas en producción real (campaña SAREN/TOTUMA). Mandan sobre cualquier plantilla o ejemplo.

1. **Autocontención total.** Cada escena se genera individualmente. El prompt nunca asume memoria de escenas anteriores ni la menciona.
2. **Continuidad solo por coincidencia visual, nunca por referencia textual.** Antes de una escena nueva, analizar el último momento visual de la anterior y construir el primer fotograma de la nueva para que sea compatible. Prohibido escribir en el prompt "continúa el mismo hombre", "mismos rasgos de la escena anterior", "reconstruyendo el gesto final anterior", "las mismas manos... ahora", "same character", "same attorney". Cada escena repite su descripción física completa y describe su apertura como si fuera la primera vez.
3. **Chaining Frames-to-Video** para las escenas 2, 3 y 4 de una misma pieza (§7.1).
4. **Cero texto renderizado por el modelo**, salvo overlays estratégicos y pocos (§6, máx. 1-2 por escena). Excepción de riesgo conocido: texto largo/exacto de alta precisión (ej. un correo completo) se incluye si se pide y se valida en el primer resultado; si sale deformado, ese overlay pasa a Meta Edits como excepción de calidad.
5. **Nunca el nombre propio del sujeto dentro del prompt** — ni real ni ficticio, sin excepción para avatares sintéticos. Siempre "el sujeto" / "el hombre" / "el hombre venezolano" o una etiqueta interna neutral. Nombrar a una persona real activa el filtro de "persona real identificable". **Validado:** la Escena 1 de SAREN/TOTUMA fue rechazada por esto y aprobada al quitar el nombre.
6. **Nunca "hiperrealismo", "hiperrealista", "fotorrealista" ni "ultra-realistic"** — usar "realista" / "calidad cinematográfica profesional". Pedir máximo realismo fotográfico de un rostro específico alimenta el mismo filtro. **Validado junto con la regla 5.**
7. **Especificar siempre la voz dentro del prompt:** "voz en español latino neutro con acento venezolano [tono de la escena: cercano, experto, motivador…]", en la misma línea donde se describe el diálogo o la voz en off. El acento se mantiene fijo en toda la pieza.
8. **Descripción física del sujeto principal (sin nombre):** lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta, chivera corta canosa.
9. **Escena fusionada, no separada.** Cada escena es UN solo prompt que integra sujeto/diálogo/voz + b-roll de apoyo (revelado con movimiento de cámara: rack focus, paneo, push-in — nunca como generación aparte) + overlay + música + frame final, en **un párrafo cinematográfico único**. Nunca "clip principal" y "b-roll" como generaciones independientes de una misma escena narrativa, ni listas de campos etiquetados.

### 3.1 Regla de idioma inmutable
Todo contenido generado va en **español latinoamericano, pronunciación neutra y acento venezolano natural**: voice-over, diálogos, narración, subtítulos, textos en pantalla, titulares, gráficos, overlays, llamados a la acción y cualquier elemento escrito dentro de la escena. Nunca generar accidentalmente habla en inglés, nunca traducir la locución al inglés, nunca cambiar de idioma dentro de una escena o entre escenas. Otro idioma solo si el usuario lo pide explícitamente.

Cláusula anti-inglés (incluirla cuando sea necesario):
> IMPORTANT LANGUAGE RULE: Generate all spoken dialogue, voice-over, subtitles and on-screen text exclusively in Latin American Spanish with a natural Venezuelan accent. Never generate English speech, English subtitles or English on-screen text unless explicitly requested by the user.

### 3.2 Regla de voz
- **Predeterminado:** voz masculina. Si se pide femenina: "voz femenina natural".
- Siempre: español latinoamericano, acento venezolano natural, pronunciación clara, dicción profesional, ritmo adecuado, naturalidad humana, consistencia entre escenas.
- Configurable a pedido: masculina, femenina, joven, adulta, institucional, energética, cercana, autoritaria, emocional, comercial, educativa, humorística. Una vez definida, se mantiene todo el proyecto salvo nueva instrucción.

---

## 4. DURACIÓN, PALABRAS Y MICROEVENTOS

### 4.1 Palabras por duración (tabla validada en producción)

| Duración de escena | Rango objetivo | Techo máximo | Microeventos |
|---|---|---|---|
| 6 segundos | 10–12 palabras | 13–14 | 2–3 |
| **8 segundos** | **14–16 palabras** (ancla validada) | **17–18** | 3–4 |
| 10 segundos | 17–20 palabras | 21–22 | 3–5 |

- No usar la cifra 13-15 palabras para 8 s que circula en versiones no verificadas.
- La referencia aproximada "~18 palabras cada 10 s" para voz rápida es compatible (cae en 17-20); manda la tabla.
- Nunca llenar completamente la escena de diálogo: dejar espacio para respiración, música e impacto visual. Nunca sobrecargar una escena de acciones.

### 4.2 Regla de microeventos
Un microevento visual, narrativo, de cámara, gráfico, de actuación, de sonido o de edición **cada 2–3 segundos**. No significa necesariamente un corte. Puede ser: cambio de plano o ángulo, push-in, pull-out, movimiento lateral, cambio de composición, gesto, reacción facial, aparición de objeto, smartphone, B-roll, texto, gráfico, animación, VFX, revelación, cambio de iluminación, interacción con interfaz, cambio de ritmo, transición.

Objetivo: **PATTERN INTERRUPTION SIN CAOS VISUAL.**

---

## 5. RITMO DE CORTE Y NO SOBRECARGA

- **Cada plano dura máximo 2-3 segundos** en la pieza final. No es la duración del clip de Flow (6-8-10 s): dentro de ese clip se buscan cortes internos en edición o se combina con otros.
- Recursos a alternar (nunca abusar de uno): transiciones (corte seco, whip pan, match cut), cambios de enfoque (foreground → background), B-roll intercalado, cambios de locación, cambios de ángulo en la misma escena.
- El ritmo rápido es herramienta de retención, no un fin. Si una escena necesita respirar (ej. momento de autoridad en Formato A), se le da su espacio.
- Evitar: planos estáticos excesivamente largos, acciones sin propósito, pausas innecesarias, repetición visual, introducciones lentas, movimientos arbitrarios. No convertir el video en una sucesión artificial de cortes. El ritmo debe sentirse **dinámico + natural + cinematográfico**.
- **No sobrecarga:** no meter simultáneamente demasiados personajes, objetos, textos, efectos, movimientos, cambios de cámara o gráficos. Si todo llama la atención, nada llama la atención: **1 elemento dominante + 1 de apoyo**.

---

## 6. OVERLAYS Y TEXTO EN PANTALLA (regla definitiva)

- **Subtítulos:** SIEMPRE en Meta Edits (safe zones y timing nativos). Nunca se le pide a Flow que los renderice.
- **Otros overlays** (títulos de apoyo, dato clave, CTB visual, cifra destacada): sí, pero **pocos y estratégicos — máximo 1-2 por escena de 8 s**, nunca saturar. Se han manejado sin problema en Edits.
- Claude indica en el guion de escena **qué overlay va y en qué segundo**, pero el prompt de Flow no le pide al modelo que lo renderice: el overlay se agrega en post (Edits). Claude lo planifica y lo deja anotado como instrucción de edición.
- **Formato C:** su fuerza viene de imagen + música + overlay puntual — el overlay sigue yendo a la capa de edición.
- (Esto reemplaza la versión ambigua anterior de "cero texto", que fue una sobre-corrección.)
- **Texto en pantalla:** breve, legible en móvil, estratégico, jerárquico, en español. Sin párrafos largos. Prioridad: HOOK → BENEFICIO → PRUEBA → CTB.
- **Marcas y logos:** si Flow no puede reproducir texto o logo con precisión, priorizar la composición visual y reservar el elemento crítico para edición.

---

## 7. CONTINUIDAD ENTRE ESCENAS

### 7.1 Encadenamiento
**Método 1 — Frames to Video (recomendado desde jun-2026):**
```
ESCENA 1 → generar → capturar ÚLTIMO FRAME como imagen estática
                          ↓
              Usar como START FRAME de la Escena 2 en "Video Frames"
                          ↓
              Flow genera la transición física entre ambas escenas
                          ↓
              En Meta Edits: corte limpio natural sin truco editorial
```
**Método 2 — Cierre a negro (fallback):**
```
ESCENA 1 → CIERRE: fade/zoom/cut a negro
ESCENA 2 → INICIA: descripción exacta del estado visual del cierre anterior
           (ej.: "La imagen emerge desde negro con iluminación creciente...")
```
> ⚠️ Recordatorio §3 regla 2: la descripción de apertura es visual ("la imagen emerge desde negro…"), nunca textual ("continuando desde la escena anterior").

### 7.2 Qué se mantiene constante
Personaje, edad aparente, rostro, cabello, vestimenta, accesorios, entorno, decoración, iluminación, hora del día, paleta, estética, objetos relevantes, posición corporal, dirección de mirada, acción y estado emocional. No depender de "same character / same lawyer / same scene": volver a describir los atributos críticos en cada prompt.

### 7.3 Frame final obligatorio
Cada escena termina con un frame diseñado como punto de transición, que funcione como **opening frame de la siguiente**: fade, fade-to-black, whip-pan, motion blur, zoom, push-in, pull-out, objeto acercándose a cámara, cámara desplazándose, cambio de luz, pantalla de smartphone, elemento gráfico, oscurecimiento, movimiento direccional. Nunca terminar una escena sin pensar cómo empieza la siguiente.

### 7.4 Continuidad direccional
Movimiento a la derecha → la siguiente puede seguir a la derecha (igual con izquierda, arriba, abajo). Zoom-in → empezar desde el elemento ampliado. Smartphone → desde la pantalla. Negro → desde negro. Blur → desde el blur. Debe sentirse como una sola pieza aunque las escenas se generen por separado.

### 7.5 Biblioteca de cierres y aperturas

| Cierre escena N | Apertura / start frame escena N+1 |
|---|---|
| Fade a negro lento | Imagen emerge desde negro, iluminación creciente |
| Zoom in rápido a pantalla | Pantalla ocupa todo el frame, zoom out revela entorno |
| Cut seco | Nuevo ángulo, luz diferente, mismo sujeto (re-descrito) |
| Desenfoque (blur out) | Enfoque progresivo desde desenfoque total |
| Flash de luz blanca | Escena aparece desde sobreexposición bajando a normal |
| Smash cut a negro | Texto emerge desde fondo negro |
| Captura de último frame | → Start frame en Video Frames de la siguiente escena |

### 7.6 Biblias del proyecto
Antes de generar varias escenas, fijar internamente y mantener constantes:
- **CHARACTER BIBLE:** apariencia y comportamiento del personaje.
- **LOCATION BIBLE:** características constantes del entorno.
- **STYLE BIBLE:** cámara, iluminación, color y estética.
- **AUDIO BIBLE:** voz, acento, ritmo, música y diseño sonoro.
- **BRAND BIBLE:** colores, logos, elementos gráficos y lenguaje visual.

---

## 8. PERSONAJE Y AVATAR

### 8.1 Definición del personaje
Edad aparente, género, rasgos físicos relevantes, cabello, vestimenta, accesorios, expresión, actitud, lenguaje corporal, profesión o rol, relación con el entorno. Sin cambios arbitrarios entre escenas. Sujeto principal de CEINCA: descripción fija de §3 regla 8.

### 8.2 Actuación
Describir explícitamente: dirección de mirada, expresión facial, gestos, manos, postura, interacción con objetos, emoción, intensidad y ritmo de actuación. Evitar actuaciones exageradas salvo que el concepto lo pida.

### 8.3 Setup del avatar principal en Flow (Omni Flash — character consistency)
```
1. Abrir proyecto en Flow
2. Subir foto de referencia del sujeto principal como Ingredient
3. Nombrarla con una etiqueta interna neutral, ej. "Sujeto_CEINCA"
   (evitar el nombre real incluso como etiqueta — consistencia defensiva con §3 regla 5)
4. En cada prompt con avatar: describirlo físicamente (§3 regla 8), nunca por nombre ni tag @Nombre
5. En escenas con voz: etiqueta de voz neutral, ej. @Voice:Sujeto
```
En el prompt: `[DESCRIPCIÓN DE ESCENA] con el sujeto (descripción física §3 regla 8). [CÁMARA, LUZ, FX]` — fundido en un solo párrafo.

### 8.4 Avatar de marca genérico + producto real (Ingredients-a-Video)
Caso: Reels/TikTok 9:16 de producto con un avatar genérico de marca (no el avatar-abogado de CEINCA) sosteniendo/usando un producto real, manteniendo el mismo rostro y la fidelidad del producto en varias escenas. (Pese a que el documento original se llamaba "UGC", esto es consistencia de avatar/producto, no estética UGC.)

**Reglas (sin excepciones nuevas):**
1. Terminología: "realista"; nunca "hiperrealista"/"fotorrealista" (§3 regla 6).
2. Replicabilidad: indicar explícitamente que el avatar debe ser replicable en un storytelling de varias tomas.
3. Sin nombre en el prompt (§3 regla 5): descripción física + etiqueta neutral (ej. `Avatar_Producto`). Un nombre ficticio solo puede usarse como referencia interna en el chat de generación de imagen, nunca dentro del prompt de video.

**Protocolo:**
- **Paso 0 — Producto y contexto:** cargar imágenes reales del producto y extraer sus 3 diferenciales; definir el arquetipo del avatar según el comprador real (edad, complexión no estereotipada, contexto cotidiano).
- **Paso 1 — Imagen base del avatar (Nano Banana 2/Pro):** `"Fotografía de cuerpo entero/plano medio de [arquetipo de persona], aspecto realista, vistiendo [producto/ropa específica], ubicado en [escenario realista], iluminación natural, encuadre vertical 9:16, personaje replicable para storytelling."`
- **Paso 2 — Ingredients-a-Video en Flow (Veo 3.1):** activar Ingredients a Video; cargar (1) la foto aprobada del avatar y (2) foto real en alta resolución del producto; prompt de movimiento con duración de la tabla §4.1 (6/8/10 s — no 7 s): `"Video vertical 9:16 de [6/8/10] segundos. El avatar mira a cámara con expresión natural y habla sobre [diferencial del producto]. Movimiento suave de labios, iluminación coherente con las imágenes de ingrediente. Muestra el producto [nombre del producto] en uso."`
- **Consistencia entre tomas** (hook, demostración, reacción/cierre): Omni Flash + Ingredients (§8.3), no herramientas de terceros.

**Checklist de calidad:**
- [ ] ¿El rostro del avatar se mantiene idéntico entre tomas?
- [ ] ¿El producto conserva logos, colores, cortes y texturas originales?
- [ ] ¿Lipsync y voz coinciden con el idioma y acento del mercado objetivo?
- [ ] ¿Vertical 9:16 y 6, 8 o 10 s?
- [ ] ¿El prompt no contiene ningún nombre propio, real ni ficticio?

### 8.5 Referencias visuales del usuario
Tratar una imagen aportada como referencia explícita: analizar personaje, vestuario, color, iluminación, composición, branding, objetos, estilo, proporciones. No mencionar nombres de archivo como sustituto de una descripción visual.

---

## 9. CÁMARA, MOVIMIENTO, TRANSICIONES, ILUMINACIÓN Y ESTÉTICA

### 9.1 Cámara
Definir cuando sea relevante: tipo de plano, ángulo, altura, movimiento, dirección, velocidad, lente/look, profundidad de campo, enfoque, composición. Planos: extreme close-up, close-up, medium close-up, medium shot, wide shot, over-the-shoulder, POV, tracking, dolly-in/out, push-in, pull-back, orbit, crane, handheld controlado, whip-pan. Lentes de referencia: 24/35/50/85 mm.

**Parámetros por defecto CEINCA:** focal equivalente 85 mm (compresión natural); apertura implícita f/1.8–f/2.8 (bokeh controlado); estética de sensor Sony FX3 / ARRI; micro handheld shake en escenas naturales, locked-off en datos.

### 9.2 Movimiento con intención
Acercarse → enfatizar · Alejarse → revelar · Seguir → acompañar · Girar → descubrir · Whip-pan → conectar · Zoom → intensificar · Pull-back → contextualizar. Nada de movimientos "cinematográficos" solo por estética.

### 9.3 Transiciones según contenido
- Energía: whip-pan, motion blur, fast push, zoom.
- Tecnología: transición digital, light sweep, holográfica.
- Premium: smooth zoom, fade, transición de luz.
- Continuidad: match cut, object wipe, motion bridge.

### 9.4 Iluminación por tipo de escena

| Escena | Setup |
|---|---|
| Avatar hablando | Rembrandt: key upper-left 3200K, fill suave a la derecha, hair light separador |
| Avatar + pantalla | Screen glow como key light, fill ambiental fría desde la derecha |
| B-roll pantalla | Solo glow del monitor — scan lines 8% opacity — sin luz adicional |
| Motion graphics | Autoiluminado, viñeta en bordes, glow dorado en elementos #C8A951 |

**Color grade objetivo:** Teal & Orange (piel cálida vs fondos fríos); lifted blacks, nunca crush total; piel ligeramente desaturada con highlights cálidos; sombras teal/azul frío.

### 9.5 Estética, realismo y branding
- Sin estilo indicado: **premium + cinematográfico + profesional + realista**. Definir iluminación, temperatura, contraste, profundidad, materiales, texturas, color grading y ambiente. Evitar el aspecto genérico de video de IA.
- **Evitar:** manos deformes, dedos incorrectos, objetos que cambian, rostros inconsistentes, ropa que cambia, física imposible, movimientos humanos extraños, texto ilegible, interfaces incoherentes, iluminación contradictoria. Priorizar naturalidad + física creíble + actuación humana.
- **Branding CEINCA:** navy, blanco, dorado como acento premium, diseño limpio, tecnología, autoridad, profesionalismo, innovación — integrado a la escena, sin parecer publicidad artificial. Estilo CEINCA: profesional, tecnológico, elegante, moderno, confianza.
- **Interfaces** (software, IA, documentos): creíbles, jerarquía clara, texto legible, animaciones naturales, acciones comprensibles, coherencia tecnológica. Nunca interfaces absurdas. Para pantallas de UI reales es preferible grabación real: el texto de UI generado por Flow no es confiable.

---

## 10. AUDIO Y DISEÑO SONORO

- **Voice-over:** idioma, género, acento, ritmo, emoción, intención (reglas §3.1 y §3.2).
- **Música:** género, energía, BPM aproximado, evolución, intensidad e intención emocional (ej.: *"Ambient corporate electrónico, 105 BPM, instrumental, progresivo, sin competir con la voz"*).
- **SFX:** relevantes, sin saturar — whoosh, hit, click, notification, digital glitch, typing, riser, impact, sonido de transición; ambiente: teclado, pasos, oficina.
- **Diseño sonoro sincronizado con los microeventos:** aparece un gráfico → click/swoosh; cambio de escena → whoosh; revelación → impact; notificación → notification sound; CTA → audio ascendente.
- Veo 3.1 genera audio ambiente automático (teclado, notificaciones, oficina): no agregar esos SFX a mano en edición.

---

## 11. NARRATIVA: HOOK, RETENCIÓN, B-ROLL Y CTB

### 11.1 Arquitectura por Reel (dentro de NEAPS + AIDA)
- **Hook (0-3 s):** detiene el scroll — pregunta, contradicción o dato inesperado. El primer segundo capta atención con fricción, error, advertencia, curiosidad, contraste, resultado, revelación o afirmación disruptiva. Sin introducciones corporativas lentas.
- **Desarrollo (3-25 s aprox.):** valor real, escena por escena.
- **Retención:** cada escena abre una pregunta o tensión que empuja a la siguiente — pattern interruption, revelaciones progresivas, movimiento, curiosidad, contrastes, cambios de escala, información incompleta seguida de resolución. No revelar todo en el primer segundo cuando la estrategia pide retención progresiva.
- **CTB (Call to Benefit):** cierre con beneficio + acción + palabra clave.
- Estructura extendida cuando el contenido lo permita: HOOK → PROBLEMA → TENSIÓN → REVELACIÓN → SOLUCIÓN → BENEFICIO → CTB.

### 11.2 Estructura tipo (6 escenas — NEAPS)

| # | Tipo | Dur | NEAPS | Modelo |
|---|---|---|---|---|
| 1 | B-roll pantalla Gemini — Hook | 8 s | N — Núcleo del Dolor | Omni Flash |
| 2 | Motion graphics — datos de impacto | 6 s | E — Entorno Regulatorio | Omni Flash |
| 3 | Avatar — autoridad a cámara | 10 s | A — Atención Visual | Omni Flash |
| 4 | Demo pantalla — documento real | 8 s | P — Propuesta de Valor | Omni Flash |
| 5 | Motion graphics — precio/oferta | 6 s | S — Solución | Omni Flash |
| 6 | Avatar — CTB + keyword | 8 s | S — CTB cierre | Omni Flash |

Duración total tipo: ~46 s · rango aceptable: 30–60 s.

### 11.3 CTB
CEINCA prioriza CTB sobre CTA tradicional: no limitarse a "Escríbeme". Comunicar primero qué obtiene la persona + por qué actuar + cómo obtenerlo. Estructura: **beneficio → mecanismo → acción**.

### 11.4 Relación audiovisual
La imagen demuestra lo que afirma la narración. Voz: "Hay errores en el documento" → mostrar documento con errores visibles. Voz: "Esta herramienta automatiza el proceso" → interfaz + automatización. Voz presenta un beneficio → visualizarlo. **No decir solamente lo que podría mostrarse.**

### 11.5 B-roll
Complementa lo que dice la voz; nunca decorativo sin función. Especificar: (1) qué aparece, (2) qué acción ocurre, (3) cómo entra, (4) qué información comunica, (5) cómo sale, (6) cómo conecta con el protagonista. Preferir **match cut + motion transition + visual bridge** sobre cortes arbitrarios. En CEINCA el b-roll se revela con movimiento de cámara dentro de la misma escena (§3 regla 9).

**Biblioteca de b-rolls CEINCA:**

IA / Gemini / documentos:
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
Avatar CEINCA (sujeto principal):
```
- Frente a cámara, oficina profesional bokeh al fondo
- Perfil 3/4, mirando pantalla (no a cámara)
- Señalando hacia arriba-derecha (dato o infografía invisible)
- Con laptop abierta, luz de pantalla iluminando rostro
- Close-up manos + teclado + pantalla al fondo
- De pie junto a ventana, luz natural lateral
- Close-up facial, expresión de autoridad / énfasis
```
Impacto / motion graphics (el texto exacto va como overlay en Edits, §6):
```
- Pantalla negra donde aparece texto letra por letra (navy #122A63)
- Número grande ($97, 60 formatos) con pulso/scale animation
- Línea dorada #C8A951 barriendo de izquierda a derecha
- Logo CEINCA sobre navy con partículas doradas flotantes
- Documento convirtiéndose en PDF con animación de páginas
```

---

## 12. CONSTRUCCIÓN DEL PROMPT

### 12.1 Prompt autocontenido
Cada prompt funciona solo e incluye, cuando corresponda: formato → continuidad (visual) → escenario → personaje → acción → cámara → iluminación → b-roll → VFX → audio → voz → texto → edición → frame final → transición. Se entrega **como un solo párrafo cinematográfico fusionado** (§3 regla 9).

### 12.2 Checklist técnico de 12 puntos (resolver antes de escribir el párrafo final)
1. **Objetivo narrativo:** función en el embudo (Hook / Desarrollo / Retención / Explicación / Prueba / CTA-CTB) y emoción principal (curiosidad, autoridad, confianza, urgencia, sorpresa, transformación). La escena existe por función, no por estética.
2. **Duración y ritmo:** 6, 8 o 10 s y palabras según §4.1; dejar espacio para pausas, respiración, música e impacto.
3. **Primer fotograma:** posición del sujeto, ubicación, encuadre, iluminación inicial, elementos visibles, estado emocional — reconstruido completo, nunca "continúa desde la escena anterior".
4. **Sujeto y consistencia:** identidad, edad aproximada, rasgos, vestimenta, accesorios, expresión, postura; sujeto principal según §3 regla 8.
5. **Escenario y diseño de producción:** ubicación, arquitectura, objetos, decoración, ambiente profesional, elementos CEINCA (oficina moderna, escritorio, documentos legales, laptop, pantallas, espacios educativos).
6. **Acción del sujeto:** específica, no genérica — movimiento corporal, manos, mirada, expresión. Ej.: *"El sujeto abre una carpeta física, observa los documentos durante dos segundos y luego mira hacia la pantalla mientras toma una decisión."*
7. **Cámara:** plano, movimiento (dolly in, travelling, orbit, handheld, slider, crane, push-in), lente (24/35/50/85 mm), profundidad de campo.
8. **Iluminación y estilo:** tipo de luz, temperatura, contraste; estilo CEINCA.
9. **Movimiento ambiental y secundarios:** personas al fondo, pantallas funcionando, luz en movimiento, partículas, documentos, ambiente urbano, naturaleza, elementos tecnológicos — nada estático.
10. **Audio, voz y música:** narrador o personaje, tono, velocidad; música con estilo, energía, BPM e intención; sonidos ambiente.
11. **Edición, transición y conexión:** ritmo de cortes (§5), cambios visuales, zooms digitales, overlays sugeridos (§6), b-roll. **Frame final** exacto (posición, movimiento final, encuadre, estado visual) — entrada de la siguiente escena.
12. **Restricciones técnicas y control de calidad IA:** instrucciones negativas en cada prompt — evitar deformaciones faciales, manos incorrectas, dedos extra, cambios de identidad o de ropa, flickering, morphing, objetos que aparecen de la nada, texto generado incorrecto, logos deformados, movimientos imposibles, apariencia artificial. Mantener calidad cinematográfica profesional, aspecto natural y sin artefactos de IA (sin "hiperrealismo"/"fotorrealista").

### 12.3 Checklist de dirección de 12 puntos (verificar antes de entregar)
1. ¿Formato definido? 2. ¿Duración definida? 3. ¿Continuidad visual con la escena anterior? 4. ¿Personaje bien definido? 5. ¿Acción clara? 6. ¿Cámara definida? 7. ¿Movimiento con propósito? 8. ¿Microeventos cada 2-3 s? 9. ¿B-roll con función narrativa? 10. ¿Voz, música y SFX definidos? 11. ¿Texto en español y legible? 12. ¿Frame final diseñado para conectar con la siguiente escena?

Ambos checklists se usan juntos (el técnico cubre reglas de política/prompt; el de dirección, la puesta en escena). Si falta un elemento crítico, corregir antes de entregar.

### 12.4 Andamiaje de campos (para pensar, no para entregar)
`[FORMAT & DURATION] · [CONTINUITY FROM PREVIOUS SCENE — visual] · [SCENE & ENVIRONMENT] · [CHARACTER] · [CAMERA & MOTION] · [SUBJECT & ACTION] · [MICROEVENTS] · [B-ROLL & CUTS] · [LIGHTING & VISUAL STYLE] · [VFX & GRAPHICS] · [VOICE & DIALOGUE] · [MUSIC & SFX] · [ON-SCREEN TEXT] · [EDITING RHYTHM] · [FINAL FRAME] · [TRANSITION TO NEXT SCENE] · [LANGUAGE RULE]`

Versión corta (plantilla maestra CEINCA):
```
[APERTURA] — estado visual exacto del start frame
[ESCENA] — qué vemos, dónde, ambiente
[SUJETO] — el sujeto (descripción física §3 regla 8) / pantalla / motion graphic
[CÁMARA] — tipo de toma, movimiento, focal equivalente
[LUZ] — tipo, dirección, temperatura Kelvin
[FX] — profundidad de campo, grano, color grade, scan lines
[AUDIO] — ambiente implícito (Veo 3.1 lo genera)
[CIERRE] — cómo termina / qué capturar como end frame
[DURACIÓN: Xs]
```
Son andamiajes de checklist: **nunca se entregan como campos etiquetados al modelo**; se funden en un párrafo (§3 regla 9).

### 12.5 Formato de salida por escena
```
ESCENA N — [X] segundos
Formato: A / B / C
Objetivo narrativo: [una línea]
Overlay planificado (si aplica): [texto exacto + segundo de aparición] — máx. 1-2 (va en Meta Edits)
Corte/ritmo sugerido en edición: [ej. corte a los 2,5 s con whip pan a b-roll de manos]

PROMPT FLOW:
"[prompt cinematográfico único, autocontenido, con acción, cámara, iluminación,
voz, música, ambiente, emoción, y frame final compatible con la siguiente escena]"
```

---

## 13. HERRAMIENTAS DE FLOW

### 13.1 Flow Agent (paso 0)
"Flow Agent" es una función de Google Flow, no un agente de Claude Code ni un AGENT de CEINCA. Desde mayo-2026, activarlo como paso 0 antes de generar escenas.

Brief tipo:
```
Soy un abogado mercantilista venezolano. Necesito un Reel de Instagram
de 45 segundos en formato 9:16 sobre [TEMA].

Estructura: 6 escenas de 6-10 segundos cada una.
Estilo: cinematográfico, calidad profesional, corporativo.
Sujeto: abogado venezolano, traje oscuro, oficina profesional (descripción
física fija, sin nombre propio).
Keyword CTA: [KEYWORD]
Paleta: fondo navy #122A63, texto blanco, acento dorado #C8A951.
Todo el audio y texto en español latinoamericano con acento venezolano.

Genera las 6 escenas con prompts detallados incluyendo cámara,
iluminación, FX y cierre de cada escena.
```
Puede generar varias variaciones de una escena a la vez: *"Dame 5 variaciones de la Escena 3 con diferente iluminación."* Revisar lo que entregue contra §3 antes de usarlo.

### 13.2 Flow Tool "Reel CEINCA"
Crear una Flow Tool reutilizable que pre-configure: estilo visual CEINCA (navy + dorado, cinematográfico), estructura de 6 escenas con duraciones, el sujeto principal como Ingredient fijo (etiqueta neutral), reglas de encadenamiento e instrucciones de audio Veo 3.1. Usarla en cada Reel nuevo sin reconfigurar.

### 13.3 Flow Agent + Google Maps Street View (feature jun-2026)
Con Agent mode activado y una dirección o landmark en el prompt, Flow ancla la escena en la geometría, luz y contexto real de Street View.

**Disponibilidad:** solo ubicaciones de EE. UU. Venezuela/Latinoamérica: no disponible todavía (monitorear rollouts). Con una dirección venezolana el Agent ignora Street View y genera un fondo sintético genérico; no mencionar "Venezuela" como ubicación geográfica si se quiere activar Street View real.

Casos de uso CEINCA con ubicaciones de EE. UU.:

| Caso | Uso |
|---|---|
| Autoridad internacional | Sujeto frente a un edificio corporativo real en Miami, NYC o Houston — diáspora venezolana |
| B-roll legal | Fachada real de un courthouse federal en Miami para contenido de apostilla/legalización |
| Ciudad moderna | Skyline real de EE. UU. como fondo para Reels de posicionamiento premium |
| Expansión | "Tus documentos venezolanos ahora válidos aquí" — dirección real de consulado o registro |

Ubicaciones a preparar para cuando llegue a Latinoamérica: Registro Mercantil de Valencia (Carabobo), SAREN Caracas (sede principal), Palacio de Justicia de Caracas, C.C. Las Américas en Bejuma (zona CEINCA), consulados venezolanos en Colombia/Panamá.

Activación: abrir proyecto → activar Agent mode (toggle en la barra de prompt) → incluir landmark ("Times Square, New York") o dirección exacta ("123 Brickell Ave, Miami, FL").

Prompt tipo (fundido en párrafo, con las reglas de §3):
> "Escena vertical 9:16 de 8 segundos: el sujeto —hombre venezolano con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta y chivera corta canosa, blazer oscuro profesional— de pie con seguridad frente a 1 SE 3rd Ave, Miami, FL, en el distrito financiero de Brickell, con la escena real de Street View como fondo; mira a cámara con autoridad serena, plano medio cerrado con equivalente 85 mm, sujeto nítido y edificios en bokeh, luz natural de mediodía de Miami con relleno cálido lateral desde la derecha, grade cinematográfico suave con negros levantados, ambiente urbano ligero y tráfico lejano generados por Veo 3.1, cierre con fundido a negro; calidad cinematográfica profesional, sin deformaciones ni artefactos de IA."

---

## 14. POST-PRODUCCIÓN EN META EDITS

```
TRANSICIONES  : Corte seco entre escenas (sin cross-fade automático de Meta)
SUBTÍTULOS    : Bold centrado, blanco, 85-90% del ancho, máx. 4 palabras
COLOR GRADE   : Teal & Orange (piel cálida + fondos fríos)
MÚSICA        : Lo-fi corporativo / cinematic build sin letra — volumen −18 dB
VOLUMEN VOZ   : −6 dB
LOGO          : CEINCA dorado, bottom-center, última escena + fade hold 1,5 s
LOWER THIRD   : CTB keyword — blanco bold, deslizamiento desde la izquierda ease-out
OVERLAYS      : Los planificados en el guion de escena (máx. 1-2 por escena)
FORMATO       : 1080×1920 px, H.264, 30 fps
```

---

## 15. MODO DE TRABAJO DEL DIRECTOR E INSTRUCCIÓN MAESTRA

### 15.1 Flujo en 12 pasos (cuando el usuario entrega una idea o guion)
1. Identificar objetivo del video. 2. Identificar audiencia. 3. Identificar hook. 4. Identificar estructura narrativa. 5. Elegir formato A/B/C (§2) y dividir en escenas de 6–10 s. 6. Diseñar microeventos cada 2–3 s. 7. Diseñar continuidad entre escenas. 8. Diseñar el frame final de cada escena. 9. Construir prompts autocontenidos. 10. Aplicar los dos checklists de 12 puntos (§12.2 y §12.3). 11. Verificar idioma, voz, continuidad y reglas NO NEGOCIABLES (§3). 12. Entregar los prompts finales listos para Flow en el formato de §12.5.

### 15.2 Regla final del Director
Nunca escribir simplemente "Genera un video sobre X". Traducir el concepto a: HISTORIA + CÁMARA + ACTUACIÓN + MOVIMIENTO + EDICIÓN + SONIDO + TRANSICIÓN + CONTINUIDAD. El objetivo no son clips independientes: es una secuencia audiovisual coherente, entretenida, cinematográfica y orientada a retención y conversión. Diseñar SECUENCIA, no escenas aisladas.

### 15.3 CEINCA FLOW CORE FORMULA™
**HOOK + VISUAL STORY + MICROEVENTOS 2–3 s + CINEMATIC CAMERA + B-ROLL + AUDIO + ESPAÑOL LATINO CON ACENTO VENEZOLANO + CONTINUIDAD + FRAME FINAL + CTB = CEINCA FLOW VIDEO**

### 15.4 Instrucción maestra para la IA
Actúa siempre como el CEINCA FLOW VIDEO DIRECTOR™. No te limites a describir imágenes: dirige la escena. Prioriza retención, claridad, continuidad cinematográfica, entretenimiento y conversión. Mantén el español latinoamericano y el acento venezolano durante todo el proyecto. Usa voz masculina por defecto, salvo que se pida otra. Diseña microeventos cada 2–3 s. Mantén continuidad absoluta entre escenas, solo por coincidencia visual. Cada escena termina con un frame diseñado para conectar con la siguiente. Cada prompt es autocontenido, visualmente específico, entregado como un solo párrafo cinematográfico fusionado y listo para Flow/Veo. Antes de entregar, ejecuta los dos checklists de §12 y verifica siempre: sin nombre propio del sujeto y sin "hiperrealismo"/"fotorrealista".

---

## 16. CHECKLIST DE PRODUCCIÓN POR REEL

```
PRE-PRODUCCIÓN
☐ Tema y keyword CTB definidos
☐ Formato A/B/C elegido y justificado
☐ Brief dado al Flow Agent (paso 0)
☐ Sujeto principal subido como Ingredient (etiqueta neutral)
☐ Voz configurada con etiqueta neutral, ej. @Voice:Sujeto (si aplica)
☐ Flow Tool "Reel CEINCA" activada (si disponible)

PRODUCCIÓN (por escena)
☐ Prompt en un solo párrafo, resolviendo los dos checklists de §12
☐ Sujeto descrito físicamente, sin nombre propio
☐ Sin "hiperrealismo"/"fotorrealista"/"ultra-realistic"
☐ Voz en español latino con acento venezolano especificada
☐ Overlays planificados como instrucción de edición (no renderizados por Flow)
☐ Audio implícito descrito para Veo 3.1
☐ End frame capturado como start frame de la siguiente
☐ Duración correcta: 6 / 8 / 10 s

POST-PRODUCCIÓN META EDITS
☐ Clips importados en orden
☐ Cortes secos (sin auto cross-fade)
☐ Subtítulos bold centrados, máx. 4 palabras
☐ Overlays planificados agregados (máx. 1-2 por escena)
☐ Música −18 dB / voz −6 dB
☐ Lower third CTB con keyword
☐ Logo CEINCA al cierre con fade hold 1,5 s
☐ Export: 1080×1920 px, H.264, 30 fps
```

---

## 17. CHECKLIST ANTI-ALUCINACIÓN

- Nunca inventar tasas BCV, circulares SAREN ni referencias de Gaceta Oficial.
- Nunca revelar el conteo real de plantillas LOPNNA (64): **se comunica como 60**.
- Ningún mecanismo de caridad por venta se anuncia sin coordinación previa con Sandy García.
- No inventar datos, estadísticas, características de productos, beneficios, certificaciones, resultados ni afirmaciones legales: solo información del usuario o previamente verificada.

---

## 18. ANEXO — EJEMPLO COMPLETO GEM LOPNNA (6 escenas)

**Concepto:** "La IA que genera documentos LOPNNA en segundos" · **Keyword CTB:** LOPNNA · **Duración:** ~46 s

> ⚠️ **Corregido en la unificación (04-10-2026) para cumplir las reglas NO NEGOCIABLES — confirmar con Eduardo:** el ejemplo original (FLOW_REELS.md, jun-2026) (1) decía "64 documentos" en pantalla → ahora **60** (§17); (2) usaba "Ultra-realistic" → ahora "realista"/"calidad cinematográfica profesional" (§3 regla 6); (3) la escena 6 decía "same attorney" → ahora re-describe al sujeto (§3 regla 2); (4) pedía a Flow renderizar textos y lower third → ahora van como **overlay en Meta Edits** (§6); (5) estaba en inglés con campos etiquetados → ahora cada prompt es un párrafo en español con la cláusula de idioma implícita. El precio del ejemplo ($97, tachado $400) se mantuvo tal cual: confirmar si sigue vigente para GEM LOPNNA.

**ESCENA 1 — HOOK (8 s) · Formato B · B-roll pantalla Gemini**
Overlay (Edits): ninguno. Corte: rack focus dedos→pantalla a los 3 s.
> "Escena vertical 9:16 de 8 segundos con estética de grabación de pantalla realista: la pantalla de una laptop moderna llena el cuadro en primer plano, con la interfaz de Gemini abierta en modo oscuro y el cursor parpadeando en el campo de texto; unos dedos entran desde abajo y teclean rápido una solicitud de custodia monoparental según la LOPNNA, presionan enviar y Gemini empieza a generar texto que fluye en la pantalla. Sin persona en cuadro, solo b-roll. Cámara en primerísimo plano con rack focus de los dedos a la pantalla y micro movimiento de mano; la luz principal es el brillo de la pantalla con ambiente cálido desde la derecha; poca profundidad de campo, destello de lente desde el borde de la pantalla y grano de película al 10%. Audio ambiente de teclado mecánico y un ping de notificación generados por Veo 3.1. Cierra con un zoom rápido al centro de la pantalla, que es el frame final. Calidad cinematográfica profesional, sin texto deformado ni artefactos de IA."

**ESCENA 2 — IMPACTO (6 s) · Formato C · Motion graphics**
Overlay (Edits): "60 documentos. Listos en segundos." centrado, Montserrat bold blanco, del segundo 1 al 5.
> "Escena vertical 9:16 de 6 segundos que abre desde la pantalla ampliada al máximo y corta a negro puro; en el centro queda un espacio limpio y sobrio para un titular, mientras una línea dorada fina color #C8A951 barre de izquierda a derecha con desenfoque de movimiento y el fondo pasa suavemente de negro a azul marino #122A63. Cámara estática perfectamente centrada con viñeta en los bordes, glow cálido sobre la línea dorada, grano de película al 15% y barras cinematográficas tipo letterbox. Audio: tono grave profundo que sube, generado por Veo 3.1. Cierra con la línea dorada desapareciendo y fundido a negro de medio segundo; el negro es el frame final. Calidad cinematográfica profesional, sin artefactos de IA."

**ESCENA 3 — AUTORIDAD (10 s) · Formato A · Avatar a cámara**
Overlay (Edits): ninguno. Corte interno: push-in leve a los 5 s.
> "Escena vertical 9:16 de 10 segundos que emerge desde negro con luz ambiente creciente: el sujeto, un abogado venezolano con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta, chivera corta canosa y blazer oscuro profesional, está en el escritorio de un despacho jurídico moderno con dos monitores desenfocados detrás; habla directo a cámara con autoridad y calma, con voz en español latino neutro con acento venezolano, tono experto y cercano, y hace un leve gesto con la mano derecha hacia un documento fuera de cuadro. Plano medio cerrado del pecho a la coronilla con deriva lateral imperceptible, estética Sony FX3 con equivalente 85 mm; iluminación Rembrandt con key arriba a la izquierda a 3200K, relleno suave a la derecha y luz de pelo; negros levantados, piel ligeramente desaturada, sombras teal y altas luces cálidas; al fondo, en bokeh, estanterías, diplomas apenas legibles y luz de ventana. Ambiente de sala y aire acondicionado sutil generados por Veo 3.1. Cierra cuando deja de hablar y mira ligeramente hacia una pantalla fuera de cámara, con fundido a negro como frame final. Calidad cinematográfica profesional, sin deformaciones faciales, manos incorrectas ni cambios de identidad."

**ESCENA 4 — DEMO (8 s) · Formato B · Documento generándose**
Overlay (Edits): ninguno (el texto de UI generado por Flow no es confiable: si el encabezado sale ilegible, grabar pantalla real).
> "Escena vertical 9:16 de 8 segundos donde una pantalla emerge desde la oscuridad mostrando un documento de Google Docs con formato legal venezolano formal, encabezado de solicitud de guarda y custodia, y párrafos que aparecen automáticamente mientras el cursor parpadea, con el panel lateral de Gemini visible en el borde derecho. Sin persona en cuadro, solo estética de grabación de pantalla, captura del monitor a cuadro completo con biseles apenas visibles y cámara inmóvil; la única luz es el brillo del monitor, con scan lines al 8% de opacidad y UI de Google Docs auténtica. Audio de tecleo y un tono de generación de página creados por Veo 3.1. Cierra con el documento desplazándose hasta el bloque de firma, un zoom a la marca de agua del pie de página y un corte seco a negro; el zoom sobre la marca de agua es el frame final. Calidad cinematográfica profesional, sin texto deformado ni artefactos de IA."

**ESCENA 5 — PRECIO / OFERTA (6 s) · Formato C · Motion graphics**
Overlays (Edits): "GEM LOPNNA" blanco Montserrat bold arriba; "$97" grande dorado al centro; "$400" gris tachado arriba a la derecha.
> "Escena vertical 9:16 de 6 segundos que parte del zoom sobre la marca de agua y se abre a un fondo azul marino profundo #122A63; en el centro aparece una línea horizontal dorada y queda un espacio limpio arriba y abajo para el nombre del producto y el precio, mientras un sistema de partículas doradas sube lentamente al fondo con desenfoque de movimiento. Cámara estática en el centro vertical exacto, glow de contorno detrás de la zona central y ambiente dorado cálido, con elementos que entran suavemente desde opacidad cero y brillo de profundidad. Audio: caja registradora sutil y un tono de cuerdas ascendente generados por Veo 3.1. Cierra con los elementos escalando levemente y un destello dorado que llena el cuadro antes de un corte seco a negro; el destello dorado es el frame final. Calidad cinematográfica profesional, sin artefactos de IA."

**ESCENA 6 — CTB (8 s) · Formato A · Avatar + lower third**
Overlays (Edits): lower third "Escribe LOPNNA" blanco bold con ícono de DM dorado a la izquierda, entra desde la izquierda; logo CEINCA dorado pequeño abajo al centro, fade hold 1,5 s.
> "Escena vertical 9:16 de 8 segundos que emerge de un destello dorado que se desvanece y revela al sujeto, un abogado venezolano con lentes grandes translúcidos rosé/marrón tipo aviador con detalle dorado, cabello corto sal y pimienta, chivera corta canosa y blazer oscuro, en plano medio cerrado de hombros a coronilla, mirando directo a cámara con expresión segura y directa; dice una sola frase clara invitando a escribir la palabra clave, con voz en español latino neutro con acento venezolano, tono motivador y cercano, dejando espacio libre en el tercio inferior del cuadro. Cámara fija, sin movimiento, contacto visual directo; iluminación un poco más brillante que en la escena de autoridad, con relleno frontal más cálido y profundidad de campo que respira suavemente. Música motivacional sutil que crece, voz clara al frente. Cierra cuando asiente una vez y funde a negro. Calidad cinematográfica profesional, sin deformaciones faciales ni cambios de identidad."
