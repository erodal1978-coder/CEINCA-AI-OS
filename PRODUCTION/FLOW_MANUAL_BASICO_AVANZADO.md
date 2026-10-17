# MANUAL DE GOOGLE FLOW — Nivel básico y nivel avanzado
**CEINCA™ · Base del curso de Flow (video e imagen) y del curso de Claude con video · v0.1 · 17-10-2026**

> Cómo leer este manual
> - **[MEDIDO]** = lo vi y lo medí en la cuenta de Eduardo el 17-10-2026 (plan PRO, interfaz en español).
> - **[REPO]** = viene de `CEINCA-AI-OS/PRODUCTION/FLOW_SISTEMA.md` (fuente única de reglas de prompt).
> - **[POR CAPTURAR]** = lo documenta Eduardo con capturas (avatar, personajes, herramientas, etc.).
> - **[POR VERIFICAR]** = no lo he comprobado; no enseñarlo como cierto hasta medirlo.
> Flow cambia seguido (en esta sesión ya venía con un modelo nuevo por defecto). Antes de dar el curso, repasar cada captura.

---

# PARTE 1 · NIVEL BÁSICO

## 1.1 Qué es Flow y dónde se entra
- Estudio de IA de Google para video, imágenes y herramientas personalizadas. Entrada: `flow.google.com`, con la cuenta de Google. [MEDIDO]
- Eduardo tiene plan **PRO**; el plan trae créditos diarios. [MEDIDO]
- Trabajas dentro de un **proyecto** (en la sesión se llamó «oct 17 - 17:43»; por defecto toma la fecha y hora). Todo lo que generas queda en la cuadrícula del proyecto.

## 1.2 El tablero (menú izquierdo)
| Opción | Para qué sirve |
|---|---|
| Todos los elementos multimedia | Cuadrícula con todo lo generado (el más nuevo a la izquierda) |
| Videos | Solo videos |
| Personajes | Personajes reutilizables entre escenas [POR CAPTURAR] |
| Escenas | Escenas y secuencias [POR CAPTURAR] |
| Herramientas | Explorar herramientas: pestañas «Mis herramientas», «Comunidad» y «Plantillas» [MEDIDO] |
| Crear herramienta | Construir tu propia herramienta [POR CAPTURAR] |
| Papelera | Elementos borrados |
Arriba: buscador, filtro/orden, ayuda, configuración y la cuenta. Aviso permanente: «Flow puede cometer errores, verifica las respuestas».

## 1.3 El cuadro de creación (lo más importante)
Abajo hay una caja «¿Qué quieres crear?» con:
- **`+`** agrega ingredientes (imágenes de referencia) al prompt.
- **Agente**: asistente de Flow para planear escenas. Ver [REPO] §13.1 (usarlo como paso 0).
- **Chip de ajustes** (ejemplo: «Video · 720p · 8 s · 9:16 · x1»): al abrirlo salen todas las opciones.
- **Flecha**: enviar. Gasta créditos al instante.

### Opciones del chip [MEDIDO]
| Control | Valores |
|---|---|
| Tipo | Imagen · Video |
| Modo de video | **Fotogramas** (inicio/fin) · **Ingredientes** (referencias). Son **excluyentes**: nunca se mezclan |
| Formato | 16:9 · 9:16 (video). Imagen añade 4:3, 1:1, 3:4 |
| Modelo | Omni 1.1 Flash · Veo 3.1 Lite · Veo 3.1 Fast · Veo 3.1 Quality |
| Resolución (solo Omni) | 360p · 720p |
| Duración (solo Omni) | 4 · 6 · 8 · 10 s. Veo no muestra selector: queda en 8 s |
| Cantidad | x1 · x2 · x3 · x4 |

**Regla de cantidad:** x1 = una generación, x2 = dos, x3 = tres, x4 = cuatro. **Cada una cuesta lo mismo y se suman**: x4 cuesta cuatro veces x1. Usar x1 por defecto y subir solo para comparar variaciones.

## 1.4 Cuánto cuesta (créditos) [MEDIDO — Omni 1.1 Flash, ya sea Ingredientes o Fotogramas]
| Duración | 360p x1 | 720p x1 | 720p x2 | 720p x4 |
|---|---|---|---|---|
| 4 s | 4 | 7 | 14 | 28 |
| 6 s | 5 | 10 | 20 | 40 |
| **8 s** | 6 | **12** | 24 | 48 |
| 10 s | 7 | 15 | 30 | 60 |

Otros modelos (8 s, x1): **Veo 3.1 Lite = 10 · Veo 3.1 Fast = 20 · Veo 3.1 Quality = 100.**
Imagen (Nano Banana 2.1, x1) mostró **0 créditos** en el selector [MEDIDO; confirmar en un cobro real].
Cómo medir sin gastar: abrir el chip; abajo dice «La generación usará N créditos».
**Regla de costo del proyecto:** F1 + F2 del Dr. son 9 clips de 8 s en Omni 720p = 108 créditos, más repeticiones (cada repetición = 12).

## 1.5 Qué modelo elegir
- **Omni 1.1 Flash** (por defecto de Flow ese día): el más barato, controla duración y resolución, genera audio con voz. Elegido por Eduardo para el proyecto del Dr.
- **Veo 3.1 Fast / Lite**: alternativa con 8 s fijos; Veo Quality (100) solo para una pieza final que lo justifique.
- Veo y Omni **sí generan audio**; el icono de bocina aparece junto a cada modelo.

## 1.6 Escribir el prompt (método CEINCA) [REPO]
Prompt final = **BLOQUE BASE** (estilo y reglas) + **ESCENA** + «Frase de la voz en off: …».
Reglas fijas del sistema:
1. Prompt **autocontenido**: describe la escena desde cero, sin referirse a otros clips.
2. Especificar siempre la voz (género, idioma, acento, tono).
3. Sin nombres de personas reales; sin «hiperrealismo» ni «fotorrealista».
4. El modelo **no debe generar texto**: los textos y overlays se añaden después (ffmpeg/Remotion o Meta Edits).
5. Prohibir lo que no quieres de forma explícita («ningún número, ninguna letra, ningún símbolo escrito»).

### Cuántas palabras caben (lo que se midió) [MEDIDO]
La tabla del repo dice 14-16 palabras para 8 s. **En la práctica:**
| Palabras | Dónde terminó la voz (clip de 8 s) | Resultado |
|---|---|---|
| 12-13 | no medido (frase recortada de F1-C3, pendiente) | — |
| 14 | 6,92 s | Cómodo (1 s de margen) |
| 15 | 6,98 s | Cómodo |
| 16 | 7,52 s (F1-C1) · **7,98 s (F1-C3, se cortó la última palabra)** | Justo / se corta |
**Conclusión:** para 8 s usar **14-15 palabras como máximo**; con 16, la voz depende de la pausa que improvise el modelo. Si una frase de 16 no se puede recortar, pasar a 10 s.

## 1.7 Generar y esperar
1. Enviar con la flecha. Aparece una tarjeta con porcentaje en la cuadrícula.
2. Con Omni 8 s tardó alrededor de 1 a 3 minutos [MEDIDO, aproximado].
3. **Una generación puede desaparecer sola** (F1-C4 se perdió una vez: la tarjeta llegó a 5 % y luego no estaba). Si la tarjeta no aparece en la cuadrícula, volver a enviar y contar el costo como perdido [MEDIDO].
4. Abrir el clip (doble clic en la tarjeta) para ver el editor: reproductor, línea de tiempo, historial de versiones, caja de edición.

## 1.8 Descargar y calidad [MEDIDO]
En el editor del clip: icono de descarga (arriba a la derecha). Opciones:
| Opción | Qué es |
|---|---|
| 270p | GIF animado |
| 720p | **Tamaño original** (en pruebas: 720×1280 en 9:16) |
| 1080p | **Reescalado** (en pruebas: 1080×1920) |
| 4K | Reescalado; bloqueado, pide «Actualizar» plan |
- Los archivos bajan con nombre `<título>_<resolución>_<fecha>.mp4`. Renombrar al terminar: `F1-C1.mp4`, `F1-C2.mp4`, etc.
- **La descarga tarda 10-15 s en aparecer**; no revisar la carpeta antes.
- **Importante (causa real, medida 17-10):** si Chrome tiene activado «Preguntar dónde guardar cada archivo antes de descargarlo», aparece un cuadro **«Guardar como» nativo del sistema**, fuera de la página, que la extensión no puede ver ni pulsar: hay que hacer clic en «Guardar» a mano. **Arreglo permanente (una vez):** `chrome://settings/downloads` → desactivar «Preguntar dónde guardar cada archivo» y, en «Ubicación», elegir la carpeta del proyecto (ej. `.../ordonez-neurobienestar/flow-clips`). Con eso las descargas caen solas y Claude las recoge. Si además Chrome bloquea «descargas múltiples»: `chrome://settings/content/automaticDownloads` → «Permitir» para `https://flow.google.com`.
- Para el trabajo final conviene bajar 1080p reescalado solo de las piezas aprobadas; los borradores se revisan en 720p. [POR VERIFICAR si el reescalado a 1080p consume créditos]

## 1.9 Evaluar un clip antes de aprobarlo (checklist de 6 puntos)
1. **Audio completo:** transcribir con Whisper y comprobar que la última palabra termina antes del final del clip (margen ≥ 0,3 s).
2. **Texto en pantalla:** cero letras o números que no pediste.
3. **Marca:** paleta y estilo del cliente.
4. **Rostros:** ninguno reconocible; sin pacientes simulados (compliance de salud).
5. **Anatomía y objetos:** manos, iconos, figuras bien formados.
6. **Continuidad:** el cierre de un clip empalma con el siguiente.
Receta técnica (terminal): extraer audio a 16 kHz, correr Whisper (`small`) con marcas por palabra y generar una hoja de contacto de fotogramas con ffmpeg (`fps=1/2, tile=4x1`).

---

# PARTE 2 · NIVEL AVANZADO

## 2.1 Fotogramas vs Ingredientes [MEDIDO + REPO]
- **Ingredientes:** subes imágenes de referencia (personaje, producto, estilo) y Flow las usa como guía. Es el modo por defecto para ilustración y para mantener un personaje.
- **Fotogramas:** defines imagen de inicio y/o fin; el modelo anima entre ellos. Sirve para animar una foto real (ejemplo: foto del Dr. → movimiento sutil) o para encadenar escenas con el mismo frame.
- **Nunca se mezclan en un mismo envío.**
- Costo en Omni: igual en ambos modos (medido a 360p y 720p, 8 s).

## 2.2 Edición de clips y escenas
- Editor del clip: debajo de la línea de tiempo hay una caja «Describe cómo quieres editar este video…» con el modelo Omni 1.1 Flash. Es edición por prompt sobre el clip existente. [MEDIDO que existe; costo y límites POR VERIFICAR]
- Línea de tiempo: botón `+` al final del clip para agregar más. [POR CAPTURAR: encadenar, recortar, extender]
- Historial de versiones: botón «Mostrar historial» (arriba); muestra las versiones del clip. Un envío de edición por error puede generar una versión nueva y gastar créditos: **antes de escribir en la caja del editor, comprobar en qué pantalla estás.**
- Escenas: sección propia del tablero. [POR CAPTURAR]

## 2.3 Generación de imágenes [MEDIDO parcial]
- En el chip, cambiar a **Imagen**. Modelo visto: **Nano Banana 2.1**; formatos 16:9, 4:3, 1:1, 3:4, 9:16; x1-x4.
- Usos: referencias para Ingredientes, portadas, estáticos de anuncio, fotogramas de inicio/fin.
- Regla CEINCA de posts de IG: 3:4 (1080×1440). [memoria de proyecto]
- [POR CAPTURAR: ejemplos de prompts de imagen, edición de imagen, costos reales]

## 2.4 Personajes y avatar [POR CAPTURAR — lo documenta Eduardo]
- Sección «Personajes» del tablero. Pendiente: cómo se crea, cuántas imágenes pide, cómo se reutiliza en Ingredientes.
- Avatar de marca y consistencia de personaje: reglas en [REPO] §8 (setup §8.3 con Omni Flash; avatar genérico + producto real §8.4).
- **Regla de salud (cliente Dr. Ordóñez):** nada de avatar como si fuera el médico, ni voz sintética dando información clínica.

## 2.5 Herramientas y «Crear herramienta» [POR CAPTURAR]
- Herramientas → pestañas **Mis herramientas · Comunidad · Plantillas**; hay envío semanal de herramientas de la comunidad.
- «Crear herramienta» / «Crear nueva»: constructor de herramientas propias. Pendiente: pasos, campos, ejemplo útil (herramienta «Reel CEINCA» existe en [REPO] §13.2).

## 2.6 Flow Agent y Street View [REPO]
- Agente como paso 0, brief tipo y variaciones: §13.1.
- Agente + Google Maps Street View (jun-2026): §13.3.

## 2.7 Costos y presupuesto
- Fórmula: `costo = créditos(modelo, duración, resolución) × cantidad × (1 + tasa de repetición)`.
- Para el proyecto del Dr.: base 108 créditos (9 clips Omni 720p 8 s x1) + F3 (versión con el Dr. animado) + repeticiones; presupuestar 30-40 % extra.
- Regla: usar 360p solo para pruebas de composición (6 créditos); enviar 720p para evaluar audio y detalle.

## 2.8 Automatizar Flow con Claude en la extensión de Chrome [MEDIDO]
Lo que funciona:
- **Abrir el chip de ajustes y leer créditos** con `javascript_tool` (los botones son elementos normales: «Fotogramas», «Ingredientes», «720p», «8 s», «x1», el modelo).
- **Escribir el prompt: usar `document.execCommand('insertText', false, texto)`** sobre el cuadro de texto y verificar que sea idéntico (`s === texto`) antes de enviar. Es exacto.
- **Enviar:** hacer clic en el botón de la flecha.
- **Abrir un clip:** doble clic en la tarjeta (un clic simple a veces no navega).
- **Descargar:** icono de descarga → 720p (ver §1.8).
Lo que falla (no repetir):
- Escribir con teclado (`type`) en el cuadro: el navegador mete o pierde caracteres al inicio y al final («yllustración», «ellustración», prefijo « r », se come el «»» final).
- Hacer clic en el cuadro cuando la cuadrícula cambió: puede abrir el editor de un clip. Verificar con captura primero.
- Enviar el clip a un servidor local por `fetch` desde la página: cuelga el navegador.
- Leer la URL del video: las herramientas bloquean las URL con firma; el único camino es el diálogo de descarga de Chrome.
- La descarga necesita el permiso de Chrome (§1.8).
Lo que sigue pendiente de automatizar: un flujo único «prompt → enviar → esperar → descargar → renombrar → transcribir → informe».

## 2.9 Pipeline completo desde la terminal (Claude Code) [MEDIDO]
1. Prompts versionados en `docs/07_FLOW_PROMPTS_LISTOS.md` del cliente.
2. Envío y control de costo en Flow (§2.8).
3. Descarga → `flow-clips/F#-C#.mp4`.
4. Evaluación automática: ffmpeg + Whisper + hoja de contacto (§1.9).
5. Montaje: ffmpeg y Remotion — overlay de una palabra (Montserrat Bold, naranja ámbar, tercio inferior, entra 0,5 s y sale 7 s), subtítulos en español incrustados, fundido de audio de 0,15 s en cada unión, salida MP4 1080×1920 en `salida/`.
6. Respaldo en Drive y entrega al cliente.

## 2.10 Errores que nos pasaron (y su arreglo)
| Error | Causa | Arreglo |
|---|---|---|
| Frase de 16 palabras cortada al final | La voz ocupa casi todo el clip | 14-15 palabras o 10 s |
| Aparecieron números 1-10 en la línea de tiempo | «Sin números ni letras» no basta | «Ningún número, ninguna letra y ningún símbolo escrito, solo puntos de luz e iconos» |
| Modelo cambiado sin avisar | Se eligió Veo 3.1 Fast (20) en vez del Omni por defecto (12) | Confirmar modelo y créditos en el chip antes de enviar |
| Una generación desapareció | Fallo de Flow | Revisar la cuadrícula tras 1 min; reenviar |
| Datos clínicos no confirmados en la frase («psicólogo y nutricionista») | Se tomó de un texto borrador | Toda frase sale solo de `01_DATOS_CONFIRMADOS` |
| Figura humana sin ropa tipo maniquí (F1-C4) | El prompt dice «figura humana estilizada» | Añadir «con ropa sencilla» si la plataforma de anuncios lo exige |

---

# PARTE 3 · ESTRUCTURA PROPUESTA DE LOS DOS CURSOS

## Curso A — Flow desde cero hasta nivel profesional (video e imagen)
**Nivel 1 — Básico (≈ 4 clases)**
1. Entrar a Flow, proyecto, tablero y navegación.
2. El cuadro de creación: modelos, duración, formato, cantidad y créditos (§1.3-1.5).
3. Escribir prompts: bloque base, voz, qué no pedir; cuántas palabras caben (§1.6).
4. Generar, evaluar y descargar (§1.7-1.9). Práctica: un clip de 8 s con voz.
**Nivel 2 — Avanzado (≈ 6 clases)**
5. Fotogramas vs Ingredientes; animar una foto.
6. Editar clips y escenas; línea de tiempo.
7. Generación de imágenes con Nano Banana.
8. Personajes y avatar consistente.
9. Herramientas y «Crear herramienta».
10. Proyecto final: video de 30-40 s con overlays y subtítulos (pipeline §2.9) + presupuesto de créditos.
**Material a capturar (Eduardo):** pantallas de Personajes, Escenas, Crear herramienta, edición en línea de tiempo, avatar.

## Curso B — Claude genera video: extensión de Chrome + terminal
1. Qué hace cada pieza: Claude Code (terminal), extensión de Chrome, Flow, ffmpeg, Whisper, Remotion.
2. Manejar Flow desde la extensión: lectura de la pantalla, ajustes, inserción exacta de texto, envío (§2.8).
3. Descargas y permisos de Chrome (qué puede hacer Claude y qué requiere un clic humano).
4. Evaluación automática de clips (Whisper + hoja de contacto + checklist).
5. Montaje con ffmpeg y Remotion: overlays, subtítulos, empalmes, formatos.
6. Flujo completo de un cliente real (caso Dr. Ordóñez): del guion al MP4 aprobado, con control de costo y compliance.
7. Convertirlo en skill reutilizable (skill de Claude Code + guía en el repo).

---

# PENDIENTES DE ESTE MANUAL
- [ ] Capturas de Eduardo: Personajes, Escenas, Crear herramienta, avatar, línea de tiempo, resultado de los permisos de descarga.
- [ ] Verificar costo real de: edición por prompt, reescalado 1080p, generación de imágenes, Fotogramas con imagen de inicio.
- [ ] Medir F1-C3 (frase de 12 palabras) para completar la tabla de §1.6.
- [ ] Probar 10 s con una frase de 16 palabras.
- [ ] Pasar el contenido operativo a `CEINCA-AI-OS/PRODUCTION/` y a una skill de Chrome para Flow.
