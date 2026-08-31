# Video Editor MVP — Design Spec

**Fecha:** 2026-08-31
**Estado:** Aprobado por el usuario en brainstorming, pendiente de plan de implementación.
**Ubicación de implementación:** `media-mvp/` (extiende el módulo existente, no un proyecto separado).

## 1. Objetivo

Construir un MVP de edición de video **genérico** (sirve para cualquier cliente
de CEINCA, no solo para el caso TOTUMA/GUARAPO que motivó el diseño) que:

1. Recibe una narración de voz ya grabada (siempre — nunca genera voz/TTS en
   v1) y, opcionalmente, footage propio del cliente y/o clips ya producidos
   externamente en Flow.
2. Aplica una estructura narrativa (NEAPS/AIDA) y estándares de ritmo/B-roll
   extraídos de un análisis real de video viral (`reference/viral_video_standards.md`)
   para armar un **plan de edición** (EDL borrador).
3. Presenta ese plan al usuario para su aprobación explícita — en particular,
   para decidir de dónde sale cada B-roll que falte (subido por el usuario vs.
   buscado por el agente en Pexels/Pixabay) y de dónde sale la música.
4. Una vez aprobado el plan, ejecuta el ensamblaje real con `ffmpeg` y entrega
   un `.mp4` final.

### Explícitamente fuera de alcance de v1

- **Google Flow / Veo**: solo conocimiento para generar prompts externamente
  (`PRODUCTION/FLOW_VIDEO_DIRECTOR_SYSTEM.md` y afines). No se integra al
  pipeline, no se invoca desde este sistema.
- **Casa & Campo Barinas**: cliente y tema aparte, sin relación con este MVP.
- **Generación de voz (TTS)**: la narración siempre es audio ya grabado y
  provisto por el usuario.
- **Búsqueda o generación automática de música**: en v1 el agente solo
  *propone* una dirección de música (mood/género) en el plan; el usuario
  aporta el archivo. Automatizar la búsqueda/generación de música queda para
  una iteración futura (decisión explícita del usuario: "más adelante podemos
  mejorar para automatizar mejor").
- **Selección manual de candidatos de B-roll dentro de una búsqueda**: el plan
  decide la *fuente* (usuario vs. agente) por hueco; si se elige "agente", el
  agente escoge automáticamente el mejor resultado de Pexels/Pixabay que
  cumpla duración/orientación — no se presentan múltiples candidatos para
  elegir uno por uno.
- **Orquestación vía subagentes de Claude Code (Task/Agent)**: "Director →
  Workers → Ensamblador → QC" es un pipeline de funciones Python encadenadas
  en scripts CLI, no agentes separados invocados con la herramienta Agent.
  Reproducible sin IA en el loop, mismo patrón que `analyze.py` y los scripts
  `build_*.py`/`build_*.sh` de `CLIENTS/casacampobarinas1/`.
- **Composición con Remotion**: `video-export/` (scaffold Remotion) queda
  para overlays/motion graphics más sofisticados en una fase futura — v1 es
  100% `ffmpeg`, mismo stack ya probado en `media-mvp/analyze.py` y en
  `CLIENTS/casacampobarinas1/`.

## 2. Input

- **Narración de voz** (obligatoria): archivo de audio ya grabado.
- **Footage propio** (opcional): clips reales del cliente y/o producidos
  externamente en Flow (con o sin avatar) — se tratan igual, como "footage
  provisto", sin distinguir su origen dentro del pipeline.
- **Brief corto**: texto libre del usuario describiendo el video ("quiero un
  video para tal cosa") que orienta la estructura NEAPS/AIDA y el tono.

El sistema soporta desde v1 tanto el caso "narración + footage propio +
B-roll de relleno" como el caso "narración + 100% B-roll de stock" — la
mezcla se decide por proyecto, no hay un modo fijo.

## 3. Arquitectura — pipeline de dos fases

Ambas fases viven como scripts CLI dentro de `media-mvp/`, siguiendo el
patrón ya establecido por `analyze.py` (funciones puras, sin dependencias más
allá de la librería estándar + `ffmpeg`/`ffprobe`/`whisper` CLI + llamadas
HTTP a Pexels/Pixabay).

### Fase 1 — `plan_video.py` (Director)

1. Transcribe la narración (reutiliza las funciones de transcripción/
   detección de silencios ya existentes en `analyze.py`).
2. Mide duración total y estructura la línea de tiempo en fases narrativas
   (hook, problema, autoridad/contexto, solución, prueba social, cierre/CTA)
   según NEAPS/AIDA.
3. Aplica los estándares de `reference/viral_video_standards.md`: cortes cada
   2-4s, B-roll ~3s promedio sobre voz en off, 100% hard cuts (sin
   disolvencias/transiciones), un plano de respiro cerca del cierre,
   subtítulos en tercio inferior sin ocluir el rostro (máx. ~7 palabras por
   línea, bloques de 2-4 palabras), ducking de música -18 a -20dB bajo la voz.
4. Para cada tramo de la línea de tiempo, decide si hay footage propio
   disponible o si hace falta B-roll, y en ese caso genera un **keyword de
   búsqueda sugerido**.
5. Propone una dirección de música (mood/género) acorde al brief.
6. Escribe `plan.json` (EDL borrador, ver formato en sección 4) y `plan.md`
   (versión legible para presentar al usuario).

### Aprobación (mediada por Claude, no por prompt interactivo en terminal)

Claude lee `plan.md`, lo presenta en el chat (lista de planos, huecos de
B-roll con su keyword sugerido, propuesta de música) y recoge las decisiones
del usuario:

- Por cada hueco de B-roll: `user_provides` (el usuario sube el asset) o
  `agent_searches` (Pexels/Pixabay).
- Música: ruta del archivo que aporta el usuario, o confirmación de que se
  resolverá manualmente después.

Claude escribe esas decisiones en `approved_plan.json` (mismo esquema que
`plan.json`, con los huecos ya resueltos a una fuente).

### Fase 2 — `process_video.py approved_plan.json`

1. **Workers**:
   - `broll_worker`: para cada hueco `agent_searches`, consulta la API de
     Pexels y/o Pixabay con el keyword aprobado, descarga el primer resultado
     que cumpla duración mínima y orientación 9:16. Si ninguno cumple, el
     tramo queda marcado `unresolved` — no se sustituye con un resultado que
     no cumpla criterios (ver sección 5, manejo de fallos).
   - Para huecos `user_provides`, valida que el archivo exista y mida su
     duración/orientación real contra lo esperado.
2. **Ensamblador**: compone el video final con `ffmpeg` siguiendo el EDL
   resuelto — recorta/ordena clips, quema subtítulos (desde el `.srt` de la
   transcripción, estilo definido en el plan), superpone placas de texto
   (hook/CTA), mezcla y aplica ducking a la música, únicamente hard cuts.
3. **QC**: verificaciones automáticas al final — duración total dentro de
   tolerancia frente a la narración, resolución 1080×1920, niveles de audio
   (loudness/pico real, reutilizando el patrón de limitador de
   `CLIENTS/casacampobarinas1/.../tp_limit.py` si aplica), presencia de
   captions. Reporta cada check como `OK`/`⚠️ WARN`, mismo formato que el
   reporte final de `analyze.py` — nunca falla en silencio.
4. Entrega `output/<proyecto>/final.mp4`.

## 4. Formato EDL (`plan.json` / `approved_plan.json`)

Lista ordenada de "planos" (shots). Cada uno:

```json
{
  "id": 1,
  "phase": "hook",
  "start_s": 0.0,
  "end_s": 4.0,
  "duration_s": 4.0,
  "source_type": "broll_needed",
  "broll_keyword": "persona sosteniendo titulo universitario carpeta",
  "source_decision": "agent_searches",
  "source_path": null,
  "subtitle_text": "YA PUEDES APOSTILLAR TU TÍTULO",
  "is_breather": false
}
```

- `source_type`: `footage_provided` | `broll_needed`.
- `source_decision` (se llena en la fase de aprobación): `user_provides` |
  `agent_searches` | `null` (aún no decidido).
- `source_path` (se llena en fase 2, tras resolver el Worker correspondiente).
- El mismo esquema evoluciona borrador → aprobado → resuelto sin cambiar de
  forma, solo completando campos.

## 5. Manejo de fallos

Mismo criterio que `analyze.py` — todo error explícito, nada se asume:

- API key de Pexels/Pixabay ausente o inválida → fatal, mensaje claro antes
  de intentar nada más.
- Búsqueda sin resultado que cumpla duración/orientación → el tramo queda
  `unresolved` en el reporte final de fase 2, nunca se rellena con un clip
  que no cumple criterio. El usuario debe resolverlo manualmente (subir un
  asset) y volver a correr `process_video.py`.
- Fallo de `ffmpeg` en cualquier paso de ensamblaje → fatal, `sys.exit(1)`
  con el stderr real de ffmpeg.
- QC con hallazgos → `⚠️ WARN` explícito en el reporte, no bloquea la
  generación del `.mp4` pero dice exactamente qué no cumplió.

## 6. Testing

Mismo patrón que `media-mvp/test_regressions.py` (sin pytest, asserts +
runner propio):

- Funciones puras de construcción del EDL (`build_edl_from_transcript`,
  aplicación de estándares de ritmo/fases) testeables sin invocar
  `ffmpeg`/whisper/APIs reales.
- Auto-verificación al final de `process_video.py` (existe `final.mp4`,
  duración y resolución dentro de tolerancia) — mismo patrón de
  auto-verificación que `analyze.py` y los scripts `build_*.py` del repo.

## 7. Decisiones ya tomadas explícitamente (para no re-litigar en el plan de implementación)

| Decisión | Elegido |
|---|---|
| Ubicación del código | Dentro de `media-mvp/` |
| Alcance de cliente | Genérico desde v1 (CORE, no atado a TOTUMA/CEINCA) |
| Motor de render v1 | `ffmpeg` directo; Remotion queda para overlays futuros |
| Arquitectura Director/Workers/Ensamblador/QC | Pipeline de funciones Python en scripts CLI, sin subagentes Claude Code |
| Selección de B-roll dentro de una búsqueda aprobada | Automática (mejor resultado que cumpla criterios) |
| Fuente de voz/narración | Siempre audio ya grabado, provisto por el usuario — sin TTS |
| Fuente de música v1 | Propuesta por el agente (mood/género), archivo aportado por el usuario |
| Mecanismo de aprobación del plan | Mediado por Claude en el chat, no prompt interactivo en terminal |
