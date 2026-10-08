# GUÍA MAESTRA DE CONOCIMIENTO Y OPERACIONES
## IA + GitHub + Claude Code + Edición de Video + Automatización Local

**Versión:** 2.0 — 8 de septiembre de 2026  
**Base:** consolidación y corrección del “Manual Definitivo de Operaciones” aportado por el usuario + verificación de documentación oficial disponible al 08/09/2026.

---

# 0. OBJETIVO DEL SISTEMA

Construir un sistema portable para trabajar con distintas IAs y herramientas de desarrollo/edición sin depender de una única aplicación.

El sistema debe permitir:

1. Mantener conocimiento permanente en un repositorio.
2. Dar contexto a distintas IAs mediante archivos estándar.
3. Trabajar con Claude Code, GitHub Copilot, Gemini y otras herramientas sin duplicar toda la información.
4. Automatizar tareas repetitivas de edición de vídeo.
5. Mantener procedimientos reproducibles y auditables.
6. Separar hechos verificados de preferencias, hipótesis y contenido experimental.
7. Evitar alucinaciones, instrucciones obsoletas y dependencia excesiva de una herramienta.
8. Mantener seguridad sobre claves, cookies, sesiones y credenciales.
9. Poder reemplazar una herramienta por otra sin destruir el sistema de conocimiento.

---

# 1. PRINCIPIO ARQUITECTÓNICO

La IA no debe ser el repositorio de conocimiento.

La arquitectura recomendada es:

```text
                     ┌──────────────────────┐
                     │   REPOSITORIO GIT     │
                     │ fuente de verdad      │
                     └──────────┬───────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
        KNOWLEDGE           PROCEDURES          CONFIG
        conocimiento         procesos          configuración
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   CAPA DE CONTEXTO    │
                    │ CLAUDE / COPILOT /    │
                    │ GEMINI / OTRAS IAs    │
                    └───────────┬───────────┘
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
               CODE          MEDIA          WEB
              scripts       edición        apps/APIs
```

## Regla principal

**La IA ejecuta; el repositorio recuerda.**

Nunca depender de que un modelo “recuerde” una regla que debe estar documentada.

---

# 2. CLASIFICACIÓN DEL CONOCIMIENTO

Todo conocimiento debe entrar en una de estas categorías.

## 2.1. FACT

Hecho verificable.

Ejemplo:

```text
FFmpeg posee el filtro loudnorm para normalización EBU R128.
Fuente: documentación oficial de FFmpeg.
```

## 2.2. RULE

Regla operativa interna.

Ejemplo:

```text
Todos los Reels CEINCA deben conservar textos críticos dentro del área segura definida por el proyecto.
```

## 2.3. STANDARD

Estándar externo.

Ejemplo:

```text
El entregable vertical principal es 1080x1920.
```

## 2.4. PREFERENCE

Preferencia creativa.

Ejemplo:

```text
CEINCA prefiere azul marino, blanco y acento dorado.
```

## 2.5. PROCEDURE

Procedimiento reproducible.

Ejemplo:

```text
1. Importar vídeo.
2. Analizar audio.
3. Transcribir.
4. Detectar palabras clave.
5. Generar lista de B-Roll.
6. Revisar.
7. Renderizar.
8. Validar.
```

## 2.6. EXPERIMENT

Hipótesis todavía no validada.

Ejemplo:

```text
Se está probando un método automático para detectar momentos de cambio visual.
No asumir que es óptimo hasta probarlo.
```

## 2.7. DEPRECATED

Información que ya no debe utilizarse.

Debe conservarse únicamente para historial.

---

# 3. ESTRUCTURA RECOMENDADA DEL REPOSITORIO

```text
project/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── .github/
│   ├── copilot-instructions.md
│   └── instructions/
│       ├── video.instructions.md
│       ├── python.instructions.md
│       ├── react.instructions.md
│       └── documentation.instructions.md
│
├── docs/
│   ├── architecture/
│   │   └── system-overview.md
│   ├── knowledge/
│   │   ├── facts.md
│   │   ├── standards.md
│   │   ├── preferences.md
│   │   └── glossary.md
│   ├── procedures/
│   │   ├── video-editing.md
│   │   ├── broll.md
│   │   ├── subtitles.md
│   │   ├── rendering.md
│   │   ├── QA.md
│   │   └── release.md
│   ├── prompts/
│   │   ├── master.md
│   │   ├── video-director.md
│   │   ├── broll-selector.md
│   │   └── code-agent.md
│   └── research/
│       ├── verified-sources.md
│       └── change-log.md
│
├── scripts/
│   ├── video/
│   │   ├── pipeline.py
│   │   ├── transcribe.py
│   │   ├── broll.py
│   │   ├── captions.py
│   │   └── render.py
│   └── qa/
│       ├── inspect_media.py
│       └── validate_export.py
│
├── config/
│   ├── project.yaml
│   ├── video.yaml
│   └── brand.yaml
│
├── media/
│   ├── raw/
│   ├── audio/
│   ├── broll/
│   ├── sfx/
│   ├── graphics/
│   ├── captions/
│   └── exports/
│
├── tests/
│   ├── fixtures/
│   └── expected/
│
└── logs/
```

---

# 4. ARCHIVOS DE INSTRUCCIONES PARA LAS IAs

## 4.1. AGENTS.md

Debe contener reglas generales para agentes que trabajen sobre el repositorio.

Ejemplo:

```md
# AGENTS.md

## Misión
Trabajar sobre este repositorio respetando su arquitectura y procedimientos.

## Fuente de verdad
Antes de inventar una regla, buscar primero en:
1. docs/knowledge/
2. docs/procedures/
3. config/
4. README.md

## Reglas
- No inventar datos.
- No modificar archivos críticos sin revisar dependencias.
- No introducir credenciales.
- No sobrescribir archivos de producción sin crear copia o commit cuando corresponda.
- Ejecutar pruebas después de cambios relevantes.
- Informar qué fue cambiado.
- Si una información externa puede haber cambiado, verificar la documentación oficial.
- No asumir que una API sigue funcionando solo porque existe en un tutorial.

## Vídeo
- Respetar resolución, relación de aspecto y zonas seguras definidas en config/video.yaml.
- No añadir elementos creativos que no estén autorizados por el procedimiento.
- Mantener continuidad visual entre escenas cuando el trabajo sea generativo.
```

## 4.2. CLAUDE.md

Debe complementar AGENTS.md con reglas específicas para Claude Code.

```md
# CLAUDE.md

Lee primero:
@AGENTS.md
@docs/architecture/system-overview.md
@docs/knowledge/facts.md
@docs/knowledge/standards.md

## Antes de actuar
1. Inspecciona la estructura del proyecto.
2. Localiza el procedimiento aplicable.
3. Verifica las herramientas disponibles.
4. Si una dependencia o API puede haber cambiado, verifica fuente oficial.
5. Propón una modificación mínima y reproducible.

## Edición de vídeo
Antes de renderizar:
- comprobar entrada;
- comprobar duración;
- comprobar resolución;
- comprobar audio;
- comprobar subtítulos;
- comprobar B-Roll;
- comprobar rutas;
- ejecutar QA.

## Prohibido
- subir secretos;
- usar cookies de terceros;
- descargar software sin verificar procedencia;
- borrar archivos originales;
- asumir que un endpoint no documentado es estable.
```

## 4.3. GEMINI.md

Debe contener la misma capa conceptual, no una copia gigantesca de todo el repositorio.

---

# 5. GITHUB: SISTEMA DE INSTRUCCIONES

GitHub Copilot soporta actualmente varios mecanismos de instrucciones: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` y archivos específicos por ruta en `.github/instructions/`. citeturn316529search1turn316529search4turn316529search8

## Recomendación

Usar:

```text
AGENTS.md
```

como capa transversal.

Y:

```text
.github/copilot-instructions.md
```

como instrucciones generales de Copilot.

Y:

```text
.github/instructions/video.instructions.md
```

para reglas exclusivas de vídeo.

No colocar todo en un único archivo gigante.

## Ejemplo de video.instructions.md

```md
---
applyTo: "**/*.{mp4,mov,mkv,py,ts,tsx,jsx}"
---

# Reglas de vídeo

- Vídeo vertical principal: 1080x1920.
- Mantener safe areas configurables desde config/video.yaml.
- No recomprimir innecesariamente fuentes.
- Preferir FFmpeg para procesamiento reproducible.
- Mantener originales intactos.
- Cada exportación debe tener nombre de versión.
- Ejecutar validación después del render.
```

---

# 6. SISTEMA ANTI-ALUCINACIÓN

Toda IA que opere sobre el proyecto debe seguir esta jerarquía:

```text
1. Evidencia del repositorio
2. Documentación oficial de la herramienta
3. Documentación oficial de la API
4. Fuente secundaria confiable
5. Conocimiento general del modelo
6. Inferencia
```

Nunca invertir este orden.

## Regla de incertidumbre

Cuando la IA no tenga evidencia:

```text
NO CONFIRMADO
```

debe ser una salida válida.

No:

```text
Probablemente funciona.
```

No:

```text
La documentación dice...
```

si no fue comprobada.

---

# 7. REGISTRO DE CAMBIOS Y VIGENCIA

Cada conocimiento externo importante debe registrar:

```yaml
id: PEXELS-API-001
topic: Pexels Video API
status: verified
last_verified: 2026-09-08
source: official
url: https://www.pexels.com/api/documentation/
notes: Video endpoints have a documented migration requirement.
```

## Estados

```text
verified
needs-review
experimental
deprecated
blocked
```

## Periodicidad sugerida

Revisar:

- APIs: cada 30-60 días.
- Modelos de IA: cada 30 días.
- Herramientas de edición: cada 60-90 días.
- Normas de plataformas: antes de una campaña importante.
- Scripts internos: después de cambios de dependencias.

---

# 8. ENTORNO LOCAL

El manual original propone FFmpeg, Git, Python, Node y dependencias de IA local. La estructura es válida, pero algunas decisiones deben actualizarse.

Claude Code documenta soporte para macOS, Ubuntu/Debian y Windows mediante WSL/Git Bash según configuración, y actualmente requiere Node.js 18+ en el flujo documentado. Anthropic además recomienda no usar `sudo npm install -g`; después de instalar es útil ejecutar `claude doctor`. citeturn716460search0turn316529search5

## Instalación base

```bash
sudo apt update
sudo apt install ffmpeg git python3-pip python3-venv curl -y
```

## Node

No fijar ciegamente Node 20 en el conocimiento permanente.

Usar una versión LTS soportada por las herramientas reales del proyecto.

## Python

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
```

Dependencias:

```bash
pip install faster-whisper edge-tts requests
```

Registrar versiones:

```bash
python --version
pip freeze > requirements-lock.txt
```

---

# 9. CLAUDE CODE: AUTENTICACIÓN Y USO

No asumir que `unset ANTHROPIC_API_KEY` significa automáticamente “usar Claude Pro”.

Claude Code ofrece autenticación mediante Claude Pro/Max y también mediante otros esquemas. La documentación oficial indica que la ruta de suscripción de Claude App con Pro o Max proporciona autenticación unificada para Claude Code y la interfaz web. citeturn716460search0

## Procedimiento

```bash
claude
```

Completar el método de autenticación disponible para la cuenta.

Diagnóstico:

```bash
claude doctor
```

Actualizar:

```bash
claude update
```

La CLI también permite continuar sesiones, usar modo plan, elegir modelos por alias y limitar herramientas/permisos. citeturn716460search1

## Regla

No documentar:

```text
Claude Pro = API gratis ilimitada
```

Eso es falso.

El costo y los límites dependen del mecanismo de acceso y del plan vigente.

---

# 10. MODO DE TRABAJO CON CLAUDE CODE

## FASE A — DESCUBRIR

```text
Inspecciona el repositorio.
No modifiques nada.
Identifica:
- arquitectura;
- archivos relevantes;
- dependencias;
- scripts;
- procedimiento aplicable;
- riesgos;
- pruebas existentes.
```

## FASE B — PLAN

```text
Crea un plan de modificación mínimo.
Indica archivos a cambiar.
Indica archivos a crear.
Indica dependencias.
Indica pruebas.
No ejecutes todavía.
```

## FASE C — EJECUTAR

```text
Ejecuta únicamente el plan aprobado.
No cambies el alcance.
Si encuentras una dependencia inesperada, detente y repórtala.
```

## FASE D — VALIDAR

```text
Ejecuta:
- lint;
- tests;
- validación de archivos;
- validación de medios;
- revisión de diff;
- revisión de rutas.
```

## FASE E — DOCUMENTAR

```text
Actualiza:
- CHANGELOG;
- procedimiento;
- configuración;
- conocimiento afectado.
```

---

# 11. PROCEDIMIENTO MAESTRO DE EDICIÓN DE VÍDEO

Este es el pipeline recomendado.

```text
RAW
 ↓
INSPECCIÓN
 ↓
PREPROCESADO
 ↓
TRANSCRIPCIÓN
 ↓
ANÁLISIS SEMÁNTICO
 ↓
PLAN DE EDICIÓN
 ↓
B-ROLL / GRÁFICOS
 ↓
SUBTÍTULOS
 ↓
AUDIO
 ↓
MONTAJE
 ↓
QA
 ↓
EXPORT
 ↓
ARCHIVO
```

La automatización no debe saltarse el paso de planificación.

---

# 12. INSPECCIÓN AUTOMÁTICA DEL MATERIAL

Antes de editar:

```bash
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

Registrar:

- duración;
- códec;
- resolución;
- FPS;
- bitrate;
- canales;
- frecuencia de muestreo;
- orientación;
- presencia de audio.

No iniciar el montaje si estos datos no están disponibles.

---

# 13. CORTE DE SILENCIOS

El manual utiliza `silenceremove`.

FFmpeg mantiene documentación oficial del filtro `loudnorm` para EBU R128 y permite normalización en una o dos pasadas. citeturn316529search10

Sin embargo, no asumir que un valor universal de -30 dB y 0,4 segundos sirve para todas las voces.

## Configuración

Debe estar en:

```yaml
silence:
  threshold_db: -30
  min_duration_sec: 0.4
```

Debe poder modificarse por proyecto.

---

# 14. NORMALIZACIÓN DE AUDIO

El manual propone:

```text
I=-14
LRA=7
TP=-1
```

FFmpeg confirma que `loudnorm` admite objetivos de integrated loudness, LRA y true peak. También soporta single-pass y double-pass. citeturn316529search10

## Regla

No declarar -14 LUFS como “valor universal obligatorio”.

Debe tratarse como:

```text
TARGET_AUDIO
```

configurable según destino.

Ejemplo:

```yaml
audio:
  loudness_target_i: -14
  loudness_target_lra: 7
  loudness_target_tp: -1
```

---

# 15. TRANSCRIPCIÓN

El sistema base puede usar:

```python
from faster_whisper import WhisperModel

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)
```

Pero el modelo debe ser configurable.

## Configuración

```yaml
transcription:
  provider: faster-whisper
  model: base
  device: cpu
  compute_type: int8
  word_timestamps: true
```

En equipos con GPU, probar configuraciones de mayor calidad.

---

# 16. ANÁLISIS SEMÁNTICO

No seleccionar B-Roll únicamente porque una palabra aparezca.

La IA debe evaluar:

```text
palabra
+
contexto de frase
+
intención
+
momento emocional
+
relevancia visual
+
duración sugerida
```

Ejemplo:

```text
No basta con detectar “empresa”.

Debe determinar:
- ¿se está hablando de registrar una empresa?
- ¿es un ejemplo?
- ¿se está usando metafóricamente?
- ¿la imagen realmente aporta?
```

---

# 17. MATRIZ DE B-ROLL

Crear:

```json
{
  "keyword": "registro mercantil",
  "start": 12.4,
  "end": 15.2,
  "reason": "refuerza visualmente el trámite",
  "source": "pexels",
  "priority": "high"
}
```

## Prioridades

```text
high
medium
low
```

No descargar B-Roll automáticamente sin registrar la fuente.

---

# 18. PEXELS: CORRECCIÓN IMPORTANTE

El manual utiliza:

```text
https://api.pexels.com/videos/search
```

La documentación actual de Pexels indica que los endpoints de vídeo bajo `/videos/` están siendo deprecados y que debe migrarse al nuevo esquema:

```text
https://api.pexels.com/v1/videos/
```

La API devuelve archivos de vídeo con dimensiones, FPS, formato y enlace. citeturn117712search4

## Regla

No dejar el endpoint antiguo incrustado en scripts nuevos.

## Procedimiento

1. Buscar vídeo.
2. Validar orientación.
3. Validar resolución.
4. Descargar.
5. Guardar metadatos.
6. Registrar URL de origen.
7. Registrar autor cuando sea posible.
8. Aplicar atribución según requisitos vigentes.

Pexels indica que el contenido está disponible gratuitamente bajo sus términos y que debe mostrarse un enlace prominente a Pexels; recomienda atribuir al fotógrafo cuando sea posible. citeturn117712search4

---

# 19. EDICIÓN CON FFMPEG

FFmpeg debe considerarse el motor de procesamiento reproducible.

Ventajas:

- automatizable;
- scriptable;
- reproducible;
- independiente de interfaz gráfica.

No debe encargarse de decisiones creativas complejas sin una capa de planificación.

---

# 20. RENDER PROGRAMÁTICO CON REMOTION

Remotion puede utilizarse cuando se necesite:

- templates;
- gráficos;
- animaciones;
- subtítulos;
- composiciones parametrizadas;
- generación de muchas piezas.

## Regla

No convertir Remotion en requisito universal.

Usar:

```text
FFmpeg → procesamiento técnico
Remotion → composición programática
CapCut/Editor visual → trabajo manual que requiera interacción visual
```

---

# 21. PROCEDIMIENTO PILOTO

Antes de automatizar un vídeo completo:

```text
1. Crear piloto de 15 segundos.
2. Validar ritmo.
3. Validar subtítulos.
4. Validar B-Roll.
5. Validar audio.
6. Validar identidad visual.
7. Aprobar.
8. Convertir parámetros en configuración general.
9. Automatizar el resto.
```

---

# 22. SUBTÍTULOS

## Flujo

```text
audio
 ↓
transcripción
 ↓
timestamps
 ↓
segmentación
 ↓
reglas de lectura
 ↓
render
```

No usar el texto íntegro como una sola línea.

## Reglas

- pocas palabras por bloque;
- lectura rápida;
- mantener sincronía;
- no tapar rostro;
- respetar safe area;
- revisar manualmente nombres propios y términos jurídicos.

---

# 23. REGLA CEINCA PARA VIDEO

Aplicar como capa de marca:

```yaml
brand:
  primary: "#1e3a8a"
  secondary: "#ffffff"
  accent: "#d4af37"
```

Preferencia:

- azul/navy;
- blanco;
- acento dorado;
- composición limpia;
- autoridad profesional.

---

# 24. FORMATOS VISUALES

Mantener una configuración centralizada:

```yaml
vertical:
  width: 1080
  height: 1920
  aspect_ratio: "9:16"

feed_4_5:
  width: 1080
  height: 1350
  aspect_ratio: "4:5"

feed_3_4:
  width: 1080
  height: 1440
  aspect_ratio: "3:4"
```

No asumir que una plataforma mantiene eternamente un único conjunto de formatos.

Meta actualmente recomienda creatividades Reels en 9:16 con audio y elementos clave dentro de la safe zone para ese placement. citeturn716460search3

---

# 25. SAFE AREAS

El manual aportado usa:

```text
0–250 px superior
1670–1920 px inferior
```

Esto debe conservarse como:

```text
CEINCA_SAFE_AREA_PRESET
```

No etiquetarlo como “estándar universal permanente”.

Las interfaces de las plataformas pueden cambiar.

## Configuración

```yaml
safe_area:
  top_px: 250
  bottom_px: 250
  left_px: 80
  right_px: 80
```

---

# 26. SISTEMA DE MICROEVENTOS

Para vídeos cortos:

```text
cada 2–3 segundos:
- cambio de plano;
- movimiento;
- palabra resaltada;
- B-Roll;
- zoom;
- gráfico;
- transición;
- cambio de encuadre.
```

Esto es una regla creativa CEINCA, no un estándar técnico universal.

---

# 27. CONTINUIDAD DE ESCENAS GENERATIVAS

Para Veo/Flow u otra IA de vídeo:

Cada escena debe contener:

```text
1. sujeto
2. entorno
3. cámara
4. iluminación
5. acción
6. continuidad
7. duración
8. audio
9. idioma
10. estilo
11. elementos prohibidos
12. frame de continuidad
```

## Continuity lock

El final de una escena debe describirse como punto de entrada de la siguiente.

---

# 28. IDIOMA Y VOZ CEINCA

Configuración de proyecto:

```yaml
language:
  locale: es-VE
  accent: venezuelan
  default_voice: male
```

Regla:

```text
No introducir inglés en texto, diálogo o voz salvo que el proyecto lo solicite expresamente.
```

---

# 29. IA GENERATIVA DE IMAGEN/VÍDEO

Separar:

```text
IA GENERATIVA
```

de:

```text
EDICIÓN DETERMINISTA
```

## Generativa

Usar para:

- imágenes;
- escenas;
- variaciones;
- fondos;
- conceptos.

## Determinista

Usar FFmpeg/Remotion para:

- texto exacto;
- logos;
- subtítulos;
- posiciones;
- colores;
- timings;
- exportación.

Nunca depender de un modelo generativo para texto legal exacto o información que deba quedar idéntica.

---

# 30. AUDIO Y VOZ

El manual propone `edge-tts`.

Debe tratarse como dependencia externa que puede cambiar disponibilidad de voces o comportamiento.

## Procedimiento

```bash
edge-tts --voice es-ES-AlvaroNeural \
  --text "Hola mundo" \
  --write-media locucion.mp3
```

Mantener la voz como variable de configuración.

```yaml
voice:
  provider: edge-tts
  voice: es-ES-AlvaroNeural
```

No asumir que una voz específica permanecerá indefinidamente.

---

# 31. MCP Y SEGURIDAD

Regla crítica:

Nunca entregar a un servicio MCP de terceros:

- cookies de sesión;
- tokens personales;
- contraseñas;
- credenciales de administrador;
- archivos `.env`;
- claves privadas.

Preferir:

```text
local MCP
```

cuando solamente se necesite acceso a archivos locales.

## Principio

```text
mínimo privilegio
```

Dar a la IA solo:

- directorios;
- comandos;
- archivos;
- servicios

que realmente necesita.

---

# 32. SECRETOS

Nunca escribir:

```text
PEXELS_API_KEY="xxxxx"
```

en Git.

Usar:

```bash
export PEXELS_API_KEY="..."
```

o un gestor seguro de secretos.

Agregar:

```text
.env
*.env
secrets/
credentials/
```

al `.gitignore`.

Crear:

```text
.env.example
```

sin credenciales reales.

---

# 33. GIT Y CONTROL DE VERSIONES

Regla mínima:

```bash
git status
git diff
git add
git commit
```

Antes de cambios grandes:

```bash
git checkout -b feat/video-pipeline
```

No trabajar directamente sobre `main` cuando el cambio tenga riesgo.

---

# 34. CHECKPOINTS

En tareas largas de Claude Code:

```text
CHECKPOINT 01
CHECKPOINT 02
CHECKPOINT 03
```

Cada checkpoint debe registrar:

```text
- objetivo;
- archivos cambiados;
- pruebas ejecutadas;
- resultado;
- pendientes;
- siguiente paso.
```

Esto facilita continuar la sesión incluso si cambia la IA.

---

# 35. ESTRUCTURA DE PROCEDIMIENTOS

Cada procedimiento debe tener:

```md
# Nombre

## Objetivo
## Entradas
## Precondiciones
## Herramientas
## Pasos
## Validaciones
## Errores frecuentes
## Salida
## Rollback
## Última verificación
## Fuente
```

---

# 36. PROCEDIMIENTO DE EDICIÓN AUTOMATIZADA

## Entrada

```text
raw/video.mp4
guion.txt
config/video.yaml
```

## Ejecución

```text
1. Inspect
2. Normalize
3. Transcribe
4. Analyze
5. Build edit plan
6. Fetch B-Roll
7. Generate captions
8. Assemble
9. Add SFX
10. Render
11. QA
12. Export
```

## Salida

```text
exports/
  video_v001.mp4
  video_v001.json
  video_v001.report.md
```

---

# 37. MANIFEST DEL PROYECTO

Crear:

```yaml
project_id: ceinca_video_001
version: 1
language: es-VE

inputs:
  source_video: media/raw/video.mp4
  script: docs/script.txt

output:
  width: 1080
  height: 1920
  fps: 30

audio:
  loudness_i: -14
  lra: 7
  true_peak: -1

branding:
  primary: "#1e3a8a"
  secondary: "#ffffff"
  accent: "#d4af37"
```

---

# 38. AGENTE DIRECTOR DE VIDEO

La IA que decide la edición debe tener una responsabilidad diferente del script que ejecuta.

## Director

Decide:

- qué cortar;
- qué enfatizar;
- qué visual necesita;
- dónde colocar B-Roll;
- cuándo cambiar plano;
- qué ritmo usar.

## Executor

Ejecuta:

- FFmpeg;
- Remotion;
- extracción;
- descarga;
- render;
- validación.

## Reviewer

Revisa:

- sincronía;
- errores;
- texto;
- audio;
- seguridad;
- branding;
- exportación.

Separar las tres funciones reduce errores.

---

# 39. PROMPT MAESTRO PARA CLAUDE CODE

```text
Actúa como ingeniero principal del repositorio.

REGLAS:
1. Lee AGENTS.md y CLAUDE.md.
2. Busca primero conocimiento y procedimientos existentes.
3. No inventes información.
4. Verifica documentación oficial cuando una API, dependencia, modelo o plataforma pueda haber cambiado.
5. No modifiques archivos originales.
6. Mantén los cambios mínimos.
7. Explica primero el plan.
8. Ejecuta las pruebas.
9. Revisa git diff.
10. Documenta los cambios.

TAREA:
[DESCRIBIR TAREA]

ENTRADAS:
[ARCHIVOS]

SALIDA ESPERADA:
[RESULTADO]

CRITERIOS DE ACEPTACIÓN:
[LISTA]

PROHIBICIONES:
[LISTA]
```

---

# 40. PROMPT DIRECTOR DE EDICIÓN

```text
Actúa como director de edición audiovisual.

Analiza:
- guion;
- transcripción;
- material original;
- identidad visual;
- objetivo del vídeo.

Produce un plan estructurado con:
1. timeline;
2. cortes;
3. cambios de plano;
4. B-Roll;
5. gráficos;
6. palabras clave;
7. subtítulos;
8. SFX;
9. música;
10. CTA/CTB;
11. safe areas;
12. continuidad.

No inventes hechos.
No agregues información no presente en el guion salvo que se marque como propuesta creativa.

Devuelve primero el plan.
No renderices hasta validar la estructura.
```

---

# 41. PROMPT DEL AGENTE QA

```text
Audita el vídeo generado.

Comprueba:
- resolución;
- relación de aspecto;
- FPS;
- duración;
- audio;
- loudness;
- clipping;
- subtítulos;
- errores ortográficos;
- sincronía;
- safe area;
- logos;
- B-Roll;
- continuidad;
- archivos faltantes;
- metadatos;
- nombre de versión.

Clasifica cada resultado como:
PASS
WARN
FAIL

No des por correcto algo que no puedas verificar.
```

---

# 42. PIPELINE DE VALIDACIÓN

Después del render:

```bash
ffprobe -v error -show_streams -show_format output.mp4
```

Después ejecutar script:

```bash
python scripts/qa/validate_export.py output.mp4
```

Resultado:

```json
{
  "status": "PASS",
  "checks": {
    "resolution": "PASS",
    "audio": "PASS",
    "duration": "PASS",
    "format": "PASS"
  }
}
```

---

# 43. WEB Y FRONTEND ANTI-SLOP

El manual utiliza:

- serif editorial;
- sans geométrica;
- fondos sobrios;
- composición asimétrica;
- padding amplio;
- CTA contrastante;
- prohibición de gradientes azul-morados;
- prohibición de glassmorphism exagerado;
- prohibición de copy vacío;
- prohibición de botones gigantes tipo píldora.

Estas reglas pueden conservarse como **preferencias de diseño CEINCA**, no como reglas universales del diseño web.

---

# 44. SISTEMA WEB REUTILIZABLE

El agente debe recibir:

```yaml
design:
  typography:
  colors:
  radius:
  spacing:
  layout:
  motion:
  components:
```

Y no depender de un prompt repetido manualmente.

---

# 45. DEV SLIDER

Si un proyecto incluye panel de exploración visual:

Debe controlar solamente variables de prueba:

```text
primaryColor
borderRadius
baseFontSize
spacingScale
```

No permitir modificar accidentalmente secretos, URLs de producción o configuración crítica.

---

# 46. USO DE MODELOS EXTERNOS

Nunca codificar una dependencia con:

```text
Gemini 1.5 Pro
```

como parte permanente del sistema.

La documentación oficial de Google actualmente muestra una familia Gemini 3 y modelos especializados, y señala que la Interactions API pasó a ser la interfaz recomendada para nuevos desarrollos a partir de junio de 2026. citeturn117712search0turn117712search1

## Regla

En el repositorio:

```yaml
model_role:
  reasoning: configurable
  fast: configurable
  multimodal: configurable
  image: configurable
  transcription: configurable
```

No fijar nombres de modelos en documentación conceptual si el nombre puede cambiar.

---

# 47. MODELOS Y FECHAS

Todo modelo externo debe registrarse como:

```yaml
provider: google
model: gemini-3.8-flash
status: stable
verified: 2026-09-08
source: official
```

Y debe existir un proceso de migración.

No construir toda la arquitectura alrededor del nombre de un modelo.

---

# 48. MATRIZ ANTI-HUMO

Para cualquier tutorial o herramienta nueva:

| Pregunta | Resultado |
|---|---|
| ¿La fuente es oficial? | Sí/No |
| ¿Tiene documentación? | Sí/No |
| ¿Hay repositorio? | Sí/No |
| ¿La licencia está clara? | Sí/No |
| ¿Es realmente gratis? | Sí/No |
| ¿Usa API de pago? | Sí/No |
| ¿Requiere GPU? | Sí/No |
| ¿Requiere cuenta? | Sí/No |
| ¿Entrega credenciales a terceros? | Sí/No |
| ¿Está activo? | Sí/No |
| ¿Fecha de última actualización? | Fecha |
| ¿Se puede reproducir? | Sí/No |

---

# 49. REGLA “OPEN SOURCE ≠ GRATIS”

Un programa puede ser:

```text
open source
```

y todavía requerir:

- GPU;
- electricidad;
- almacenamiento;
- modelos;
- APIs;
- cuotas;
- infraestructura;
- mantenimiento.

Nunca escribir:

```text
100% gratis
```

sin especificar qué costo se está evaluando.

---

# 50. REGLA “AUTOMÁTICO ≠ AUTÓNOMO”

La IA puede:

```text
procesar
clasificar
transcribir
renderizar
descargar
organizar
```

Pero la arquitectura debe preservar revisión humana para:

```text
decisiones editoriales;
contenido legal;
datos sensibles;
publicación;
branding;
mensajes comerciales;
cambios destructivos.
```

---

# 51. REGLA “LA IA NO DECIDE SOLA LA IDEA”

El procedimiento original acierta en un punto fundamental: automatizar el montaje sin definir previamente el objetivo puede producir resultados técnicamente correctos pero editorialmente malos.

Por eso debe existir siempre:

```text
IDEA
↓
GUION
↓
PLAN
↓
MONTAJE
```

No:

```text
VIDEO
↓
IA
↓
ALGO RANDOM
```

---

# 52. CHECKLIST FINAL DE VÍDEO

```text
[ ] Guion validado
[ ] Material original intacto
[ ] Audio limpio
[ ] Transcripción revisada
[ ] Cortes revisados
[ ] B-Roll relevante
[ ] SFX equilibrados
[ ] Música equilibrada
[ ] Subtítulos correctos
[ ] Safe area correcta
[ ] Branding correcto
[ ] Resolución correcta
[ ] FPS correcto
[ ] Loudness validado
[ ] Render reproducible
[ ] QA PASS
[ ] Archivo versionado
[ ] Fuente de stock registrada
```

---

# 53. CHECKLIST DE SEGURIDAD

```text
[ ] No hay API keys en Git
[ ] No hay cookies
[ ] No hay tokens de sesión
[ ] No hay contraseñas
[ ] No hay archivos .env reales
[ ] MCP con mínimo privilegio
[ ] No hay endpoints sospechosos
[ ] Dependencias verificadas
[ ] Fuentes descargadas registradas
[ ] Originales protegidos
```

---

# 54. CHECKLIST DE CAMBIO DE IA

Si mañana se cambia Claude por otra IA:

```text
1. El repositorio permanece.
2. AGENTS.md permanece.
3. Procedures permanecen.
4. Knowledge permanece.
5. Config permanece.
6. Scripts permanecen.
7. Solo cambia la capa de agente/adaptador.
```

Este es el objetivo principal de la arquitectura.

---

# 55. ADAPTADORES POR IA

Ejemplo:

```text
agents/
├── claude/
│   └── CLAUDE.md
├── gemini/
│   └── GEMINI.md
├── copilot/
│   └── copilot-instructions.md
└── generic/
    └── SYSTEM.md
```

Todos apuntan al mismo núcleo:

```text
docs/
scripts/
config/
```

---

# 56. REGLA PARA CUALQUIER NUEVA HERRAMIENTA

Antes de incorporarla:

```text
1. ¿Qué resuelve?
2. ¿Qué sustituye?
3. ¿Tiene documentación oficial?
4. ¿Tiene licencia clara?
5. ¿Tiene API?
6. ¿Puede ejecutarse localmente?
7. ¿Qué datos comparte?
8. ¿Qué credenciales requiere?
9. ¿Qué costo real tiene?
10. ¿Qué ocurre si desaparece?
```

Si no se puede responder, no debe convertirse en dependencia crítica.

---

# 57. PROCEDIMIENTO DE ACTUALIZACIÓN DEL SISTEMA

Cada revisión:

```text
RESEARCH
↓
VERIFY
↓
COMPARE
↓
UPDATE
↓
TEST
↓
DOCUMENT
↓
COMMIT
```

Nunca actualizar una herramienta solamente porque “la nueva versión parece mejor”.

---

# 58. CHANGELOG

Formato:

```md
## 2026-09-08

### Added
- arquitectura multi-IA;
- matriz de conocimiento;
- pipeline QA.

### Changed
- Pexels endpoint;
- documentación de Claude Code;
- estrategia de modelos Gemini.

### Deprecated
- endpoints anteriores;
- nombres históricos de modelos.

### Security
- reglas de secretos;
- MCP mínimo privilegio.
```

---

# 59. CORRECCIONES ESPECÍFICAS DEL MANUAL ORIGINAL

## Corrección 1 — Claude Code

Original:

```text
unset ANTHROPIC_API_KEY
```

No debe presentarse como mecanismo universal para “forzar Pro”.

Debe usarse el método de autenticación compatible con la cuenta y configuración vigente.

## Corrección 2 — Pexels

Original:

```text
/api.pexels.com/videos/search
```

Debe migrarse al esquema documentado actualmente bajo:

```text
/api.pexels.com/v1/videos/
```

## Corrección 3 — Gemini

Original:

```text
Gemini 1.5 Pro
```

Ya no debe mantenerse como referencia actual. La documentación oficial actual muestra la familia Gemini 3 y cambios de API. citeturn117712search0turn117712search1

## Corrección 4 — “gratis”

No utilizar “$0.00” como afirmación universal.

Debe especificarse:

```text
sin costo adicional de API
```

solamente cuando el flujo concreto y el plan utilizado lo permitan.

## Corrección 5 — safe zones

Los números del manual deben ser presets internos, no declararse como especificación eterna de Instagram/TikTok/Facebook.

## Corrección 6 — audio

-14 LUFS debe ser target configurable, no ley universal.

## Corrección 7 — automatización

El pipeline necesita una fase de decisión humana/IA antes del procesamiento destructivo.

---

# 60. POLÍTICA DE FUENTES

Prioridad:

```text
1. documentación oficial
2. repositorio oficial
3. especificación oficial
4. proveedor
5. comunidad
6. tutorial
```

Un vídeo de YouTube no sustituye documentación oficial para establecer una dependencia crítica.

---

# 61. POLÍTICA DE EVIDENCIA

Para cualquier afirmación importante:

```text
CLAIM
↓
SOURCE
↓
DATE VERIFIED
↓
STATUS
```

Ejemplo:

```yaml
claim: "Pexels video endpoint changed"
source: "official Pexels documentation"
verified: "2026-09-08"
status: verified
```

---

# 62. RESULTADO FINAL DEL SISTEMA

La arquitectura resultante queda:

```text
                    CEINCA AI OPERATING SYSTEM
                              │
              ┌───────────────┼────────────────┐
              │               │                │
          KNOWLEDGE       PROCEDURES        CONFIG
              │               │                │
              └───────────────┼────────────────┘
                              │
                       AGENT INSTRUCTIONS
                              │
         ┌────────────────────┼───────────────────┐
         │                    │                   │
      Claude                Gemini             Copilot
         │                    │                   │
         └────────────────────┼───────────────────┘
                              │
                       EXECUTION LAYER
                              │
          ┌───────────────────┼─────────────────┐
          │                   │                 │
        Python             FFmpeg           Remotion
          │                   │                 │
          └───────────────────┼─────────────────┘
                              │
                         MEDIA OUTPUT
                              │
                             QA
                              │
                           RELEASE
```

---

# 63. PRINCIPIO FINAL

La fortaleza del sistema no debe depender de:

- Claude;
- Gemini;
- ChatGPT;
- CapCut;
- Remotion;
- FFmpeg;
- Pexels;
- una API concreta;
- un modelo específico.

Debe depender de:

```text
BUEN CONOCIMIENTO
+
BUENAS REGLAS
+
PROCEDIMIENTOS REPRODUCIBLES
+
CONFIGURACIÓN CENTRALIZADA
+
CONTROL DE VERSIONES
+
VALIDACIÓN
```

Ese diseño permite cambiar herramientas sin perder el sistema.

---

# 64. FUENTES EXTERNAS VERIFICADAS

- Anthropic — Claude Code setup: https://docs.anthropic.com/en/docs/claude-code/getting-started
- Anthropic — Claude Code CLI: https://docs.anthropic.com/en/docs/claude-code/cli-usage
- GitHub — Custom instructions: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
- Pexels — API documentation: https://www.pexels.com/api/documentation/
- Google — Gemini API documentation: https://ai.google.dev/gemini-api/docs
- Google — Gemini models: https://ai.google.dev/gemini-api/docs/models
- FFmpeg — Filters documentation: https://ffmpeg.org/ffmpeg-filters.html
- Meta — Reels creative/safe zones: https://www.facebook.com/business/ads/facebook-instagram-reels-ads

