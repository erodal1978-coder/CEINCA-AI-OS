# handoff.md — CEINCA-AI-OS

> Memoria de continuidad entre sesiones de Claude Code.
> Al iniciar una sesión nueva: "Lee handoff.md y continúa desde los próximos pasos."
> Al cerrar una sesión: actualiza este archivo siguiendo las reglas definidas en `CLAUDE.md`.

## 1. Objetivo
Construir y mantener CEINCA-AI-OS como sistema operativo de conocimiento, agentes, marketing y producción digital de CEINCA. El núcleo actual prioriza conocimiento/estrategia, agentes y skills de Claude Code, producción audiovisual, exportación de carruseles y workflows reproducibles. Los experimentos obsoletos deben retirarse en lugar de mantenerse por inercia.

## 2. Estado actual
- Limpieza de repositorio completada y mergeada a `main` mediante PR #16, commit `d9d75a871b96721c187ca44680a1dac312392187`.
- Eliminado `ig-viral-tracker/` completo: era un MVP/artefacto de aprendizaje y ya no forma parte del sistema.
- Eliminados vídeos, audios y assets multimedia pesados que estaban almacenados temporalmente en GitHub.
- `.gitignore` endurecido para excluir secretos, cachés, builds, renders y formatos de vídeo/audio.
- `CLAUDE.md` actualizado para reflejar la arquitectura vigente y establecer política explícita de assets.
- `README.md` describe el sistema como CEINCA AI OS v2.0 y mantiene los módulos de STRATEGY, RULES, MARKETING, KNOWLEDGE, AGENTS y PRODUCTION.
- `.claude/` contiene agentes, comandos, contexts, reglas, hooks y skills vendorizados. `everything-claude-code` permanece instalado de forma selectiva; sus hooks no están activados globalmente.
- `skills-lock.json` registra skills externos y sus hashes; existen skills de everything-claude-code, superpowers, diseño/animación, Remotion y UI/UX.
- `carrusel-export/` se conserva como motor de exportación programática de carruseles.
- `video-export/` se conserva como base del motor de composición de vídeo con Remotion.
- PR #4 (`ui-ux-pro-max`) ya fue mergeado el 29-07-2026; no está pendiente de rebase.
- **PR #18 mergeado a `main`** (commit de merge `faca1249`): unifica la paleta de marca (azul/dorado) a los valores reales del logo (`#1E3A8A`/`#122A63`/`#2D4FA8` navy, `#C8A951` dorado) en `SKILLS/ceinca-design/`, `SKILLS/ceinca-ia/`, `MARKETING/`, `AGENTS/`, `PRODUCTION/`, `README.md` — antes había 4 azules distintos en conflicto. Retira el "Verde CEINCA" `#1B7A3D` legado de `FRAMEWORK_VIRAL_V2.md` a favor del dorado. Agrega `MARKETING/MANUAL_COPY_META_TIKTOK.md` (manual de copy v2.0: 4 textos Meta + 3 textos TikTok, nuevo).
- **PR #19 (`cleanup/audit-claude-agents-skills` → `main`) — Fase 1 de la auditoría de `.claude/agents/` y `.claude/skills/` ejecutada, pendiente de merge:**
  - Confirmado por lectura completa de archivo (no grep superficial): `video-export/package.json` = React 19 + Remotion + Tailwind + TypeScript real. `carrusel-export/package.json` = Node + Playwright puro, sin framework. Esto es código real que sí existe hoy en el repo.
  - **Agentes (9):**
    - 🟢 CONSERVADOS sin cambios: `planner`, `code-reviewer`.
    - 🟡 ADAPTADOS (se quitó solo su sección "(Example)" contaminada, borrado quirúrgico sin reescribir el resto): `architect`, `security-reviewer`, `refactor-cleaner`, `build-error-resolver` (`doc-updater` no necesitó cambios).
    - 🔴 ELIMINADOS (contaminación de trading/mercados/embeddings difusa en ~80% del archivo, no aislable en una sección): `e2e-runner`, `tdd-guide`. Si `carrusel-export` llega a necesitar E2E o TDD real, escribir un agente nuevo y corto desde cero en vez de rescatar estos.
  - **Skills (22):**
    - 🟢 CONSERVADAS (15): `impeccable`, `animation-vocabulary`, `review-animations`, `emil-design-eng`, `design-taste-frontend`, `apple-design`, `no-ai-slop`, `ui-ux-pro-max`, `remotion-best-practices`, `verification-before-completion`, `verification-loop`, `requesting-code-review`, `continuous-learning`, `frontend-patterns`, `coding-standards`.
    - 🟡 SIN DECISIÓN, quedan para la próxima auditoría (4): `brainstorming`, `strategic-compact`, `eval-harness`, `tdd-workflow`.
    - 🔴 ELIMINADAS (4, utilidad nula verificada — ningún flujo de CEINCA-AI-OS tiene servidor/API/analytics-DB/auth hoy): `backend-patterns`, `clickhouse-io`, `security-checklist`, `project-guidelines-example`.
  - **Decisión sobre `/tdd` y `/e2e` (misma rama):** comandos eliminados sin reemplazo — su única función era invocar los agentes ya eliminados. Corregidas las referencias residuales a `/tdd` en `.claude/commands/plan.md` y a "TDD Guide" en la plantilla de reporte de `.claude/commands/orchestrate.md`. `skills-lock.json` verificado consistente (la entrada `tdd-workflow` sigue apuntando a un skill que existe en disco, se conserva).
  - Referencias en cascada corregidas también en `.claude/rules/` y `ui-ux-pro-max`.
- **Brain Audit ejecutado (28-08-2026, diagnóstico de solo lectura, sin cambios estructurales)**: auditoría de `CLAUDE.md`, `RULES/`, `KNOWLEDGE/`, `STRATEGY/`, `MARKETING/`, `AGENTS/`, `.claude/`, `PRODUCTION/`. Reporte completo (secciones A-N + matriz) entregado al usuario en la sesión; no vive en este repo, solo el resumen de hallazgos abajo. Hallazgos principales:
  - Conflicto de datos activo: el banco corto de keywords de `MARKETING/FRAMEWORK_VIRAL_V2.md` Parte 3 contradice al banco maestro `CTB_PALABRAS_DISRUPTIVAS.md` — MAJARETE ya está asignada a LEXIA, chichicuilote/yenyen fueron retiradas por no ser venezolanismos verificados.
  - `.claude/agents/doc-updater.md` quedó mal clasificado en PR #19: tiene ~96 líneas (130-226, sección "Example Project-Specific Codemaps") de contaminación Solana/Privy/Supabase sin limpiar — mismo patrón ya limpiado quirúrgicamente en `architect`/`security-reviewer`/`refactor-cleaner`/`build-error-resolver`, sobrevivió porque su encabezado no calzaba con el patrón de búsqueda usado entonces.
  - Graveyard de hooks sin cablear y duplicado: `.claude/hooks/memory-persistence/*.sh` + `.claude/scripts/hooks/*.js` (mismo propósito, dos lenguajes) + `.claude/hooks/strategic-compact/suggest-compact.sh` es byte-idéntico a `.claude/skills/strategic-compact/suggest-compact.sh` — nada de esto está referenciado en `hooks.json`.
  - El único hook realmente activo (`impeccable`, vía `PostToolUse`) vive solo en `.claude/settings.local.json`, que **no está trackeado en git** — invisible para otra máquina o clon, y no documentado en ningún lado.
  - `.claude/rules/hooks.md` documenta hooks que no existen desde que PR #17 simplificó `hooks.json`, y no menciona ni el hook real (`impeccable`) ni el graveyard huérfano.
  - Regla obligatoria de tuteo venezolano / no-voseo (`MARKETING/SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md` §5.5, con causa raíz documentada) está enterrada en un doc de ads de LEXIA — invisible para `CONTENT_ENGINE`/`VIRAL_CONTENT_CREATOR`/`IG_AUDITOR`.
  - `.claude/rules/` (8 archivos, top-level `RULES/` es un directorio distinto) parece huérfano — nada en el repo lo referencia por ruta.
  - Triplicación de plantillas de copy entre `FRAMEWORK_VIRAL_V2.md` Partes 4-5, `VIRAL_PLAYBOOK.md` §5.1-5.4 y `MANUAL_COPY_META_TIKTOK.md` (la v2.0, ya autoridad de facto, nunca reemplazó formalmente a las anteriores).
  - Referencia rota: `SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md` cita `brief-creativo-lexia.md` 3 veces; el archivo no existe en el repo.
  - **5 vías de producción de video sin consolidar**, insumo directo para decidir el Video Engine: `video-export/` (scaffold Remotion sin usar), `carrusel-export/` (solo imágenes), `PRODUCTION/FLOW_REELS.md`+`FLOW_VIDEO_DIRECTOR_SYSTEM.md` (Flow/Veo), `PRODUCTION/OPENMONTAGE_STUDIO.md`, y un pipeline ffmpeg/Python ad-hoc de 918 líneas en `CLIENTS/casacampobarinas1/PROMO_VIDEO_2026/build/`.
  - `AGENTS/AUDITOR_IA_MARCA_PROFESIONAL/` (1.9 MB de PDF/HTML/JPG) es un entregable de cliente terminado, mal ubicado bajo `AGENTS/`.
  - Secuencia recomendada por el audit: (a) PR pequeño de bajo riesgo con las 4 correcciones de arriba con menor riesgo (hooks.md, banco de keywords, regla tuteo/voseo, `doc-updater.md`); (b) sesión de diseño (no ejecución) para decidir qué hacer con el graveyard de hooks antes de borrar nada; (c) recién después, la conversación del Video Engine.
- **PR quirúrgico del Brain Audit ejecutado (28-08-2026, rama `fix/brain-audit-surgical-p1` → `main`), sin mergear:** solo las 4 correcciones aprobadas explícitamente por el usuario (no el punchlist completo de la sección L de arriba — esa cleanup del banco de keywords de `FRAMEWORK_VIRAL_V2.md` Parte 3 NO fue aprobada esta vez, sigue pendiente).
  - `.claude/rules/hooks.md`: reescrito contra la realidad verificada — solo los 2 hooks reales de `.claude/hooks/hooks.json` (tmux, git-push reminder) más el hook local-only `impeccable` de `.claude/settings.local.json` (documentado como no trackeado/no presente en otro clon). Se retiró toda mención a Prettier/TS-check/console.log-warning/PR-logging/Stop-audit, que no existen desde PR #17.
  - Regla de tuteo venezolano/no-voseo: movida de `MARKETING/SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md` §5.5 a `RULES/ESTILO_REDACCION.md` (nuevo archivo) — significado sin cambios, ahora aplica como regla general de copy CEINCA (ya la cubre la instrucción existente de CLAUDE.md "lee RULES/ antes de reescribir cualquier documento"). La sección 5.5 original quedó como pointer, sin duplicar la tabla/contenido.
  - `.claude/agents/doc-updater.md`: eliminadas las 97 líneas (130-226) de la sección "Example Project-Specific Codemaps" — contaminación real de un stack ajeno (Next.js 15.1.4/Privy/Supabase/Redis/OpenAI/Solana/Meteora), mismo método quirúrgico de PR #19. Quedan 2 menciones genéricas sin tocar (Supabase/Prisma como ejemplo de ORM, OPENAI_API_KEY/REDIS_URL como placeholder de `.env.example`) — no son contaminación de proyecto ajeno, son ejemplos genéricos equivalentes al placeholder que ya se dejó en `code-reviewer.md`.
  - `brief-creativo-lexia.md`: **confirmado que no existe en el repo** (búsqueda exhaustiva por nombre y variantes). No se inventó reemplazo. Las 3 referencias en `SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md` quedaron anotadas inline con ⚠️ más una nota al inicio del documento explicando las 2 opciones (recuperar/recrear el brief, o retirar la referencia) — decisión pendiente del usuario.
  - Verificado: ninguno de los archivos/carpetas explícitamente excluidos (`memory-persistence/`, `scripts/hooks/`, `settings.local.json`, `brainstorming`, `strategic-compact`, `eval-harness`, `tdd-workflow`, `STRATEGY/`, `KNOWLEDGE/`, `PRODUCTION/`, `video-export/`, `carrusel-export/`) aparece en el diff.
- **PR #20 mergeado a `main`** (commit de merge `d585e77`): las 4 correcciones quirúrgicas de la fila de arriba, ya en `main`.
- **Investigación de viabilidad "CEINCA AI Video Production System" (28-08-2026, solo lectura + 1 corrección documental menor sobre `main` directo)**: reencuadre explícito del objetivo por el usuario — NO es un "Video Engine" generador de IA, es un sistema de producción asistida que trabaja con Flow/Veo (herramienta **externa**, nunca genera dentro de Claude) + material real/de cliente/banco. Hallazgos con evidencia verificada en vivo en esta máquina (no solo lectura de repo):
  - **Herramientas confirmadas instaladas**: ffmpeg 6.1.1 (con `silencedetect`/`scdet`/`loudnorm`/`ebur128`/`astats`/`sidechaincompress`/`atempo`/`xfade`/`drawtext`/`libass`/`libvidstab`), ffprobe (metadata probada en vivo sobre un archivo real), **whisper CLI en venv dedicado `~/.local/venvs/whisper`** (transcripción funcional — la generación automática de captions **SÍ es capacidad existente**, no faltante), yt-dlp 2026.06.09, Python 3.12.3 + numpy 2.5.2 + Pillow 10.2.0.
  - **Confirmado NO instalado** (no se instaló nada, solo se verificó ausencia con `python3 -c "import X"`/`command -v`): pyscenedetect, librosa, pydub, moviepy, opencv/cv2, exiftool, mediainfo, sox.
  - **`video-export/` clasificado como componente de composición** (no motor principal, no scaffold descartable) — apto para overlays/captions/motion graphics/render determinista una vez se construya de verdad; sigue siendo scaffold vacío hoy.
  - **Auditoría de documentación falsa (Fase 3 del plan del usuario)**: se buscaron activamente los 4 patrones de error definidos (Flow generando dentro de Claude, `FLOW_VIDEO_DIRECTOR_SYSTEM` tratado como agente, Casa Campo como parte del Video Engine, capacidad inexistente atribuida a una herramienta) — **ninguno encontrado**, evidencia negativa por grep.
  - **Clasificación definitiva**: `FLOW_VIDEO_DIRECTOR_SYSTEM.md`/`FLOW_REELS.md` = KNOWLEDGE (metodología de prompts, explícitamente NO agentes); `video-export/`/`carrusel-export/`/scripts ffmpeg-Python = TOOL/SCRIPT; Flow/Veo/OpenMontage = EXTERNAL TOOL; los 7 `.claude/agents/` = AGENT (ninguno de dominio audiovisual hoy); `.claude/skills/remotion-best-practices/` = SKILL; `CLIENTS/casacampobarinas1/` = CLIENT + CLIENT ASSET — no se tocó, no se convirtió en componente del sistema central.
  - Arquitectura conceptual propuesta (no implementada): Preproducción → Asset Plan → Usuario/herramientas externas → Media Ingest (con QC ligero + loop de vuelta si falta un asset) → AI Editor/Orchestrator (Claude) → ffmpeg (bajo nivel) + Remotion (composición) + Python (pegamento/análisis, no motor paralelo) → QC final → Export.
  - MVP conceptual identificado pero **NO construido**: pipeline mínimo ffprobe+whisper+ffmpeg (metadata + transcripción + corte de silencios) como primer prototipo seguro derivado de capacidades ya confirmadas — pendiente de aprobación explícita antes de escribir cualquier código.
  - Riesgo activo señalado: whisper transcribe pero no valida terminología legal/mercantil CEINCA (ej. "SAREN", "taquilla") — un caption mal transcrito podría pasar cualquier QC automático (duración/loudness correctos) sin que nada lo detecte.
  - **Corrección aplicada** (única modificación de archivo de esta sesión): `PRODUCTION/FLOW_REELS.md` recibió un banner de advertencia al inicio (no una reescritura) señalando sus 23 usos de `@Eduardo` y 2 de "hiperrealista" — en conflicto directo con las 2 reglas NO NEGOCIABLES de `FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1 §4.5/§4.6 (descubiertas por un rechazo real de política de Flow, documentado en `SAREN_TOTUMA_SCRIPT_FLOW.md`). La consolidación formal completa sigue pendiente — el usuario pidió explícitamente no hacer "reescritura grande sin necesidad" en esta fase.
- **Consolidación formal de `FLOW_REELS.md` contra `FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1 (28-08-2026, rama `docs/consolidar-flow-reels-v1.1`), sin mergear:**
  - Corregidas las 30 instancias reales del nombre propio del sujeto encontradas en una lectura completa del archivo (23 `@Eduardo` ya contadas + 7 adicionales sin el `@` — `Eduardo Rodríguez`, `@Voice: Eduardo`, "Nombrarla: 'Eduardo'" — que el banner anterior no había contado) y las 2 de "hiperrealista"/"Hiperrealista". Método: texto de prompt literal → "el sujeto"/"the subject" (según el idioma del bloque); etiquetas de tabla/encabezado → "Avatar"; instrucciones de configuración → etiqueta interna neutral (`Sujeto_CEINCA`, `@Voice:Sujeto`). Una sola excepción deliberada: "Subir foto de referencia de Eduardo como Ingredient" (línea 75) se dejó con el nombre real porque es una instrucción de workflow dirigida al humano, no texto de prompt — mismo patrón que usa el propio v1.1 en su §4bis punto 4 ("Si es Eduardo/avatar...").
  - **No se tocó `FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1** — cero cambios de metodología, tal como se pidió explícitamente.
  - Se conservó el 100% del contenido de referencia (stack técnico, método de encadenamiento de escenas, biblioteca de b-rolls, lighting setups, biblioteca de cierres/aperturas, parámetros Meta Edits, estructura NEAPS, checklist, sección de Google Maps Street View) — solo se corrigió la terminología violatoria, no se eliminó ninguna sección.
  - Se añadió una nota de terminología aclarando que "Flow Agent" es una función propia de Google Flow, no un agente de Claude Code (riesgo de confusión ya señalado en una auditoría previa).
  - **Hallazgo crítico NO corregido, pendiente de aprobación explícita**: `FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1 línea 127 ("Restricciones técnicas y control de calidad IA") dice textualmente "Mantener: hiperrealismo, calidad cinematográfica, aspecto profesional" — **contradice su propia regla NO NEGOCIABLE §4.6 dentro del mismo documento**, justo en la sección que describe el cierre técnico del prompt (donde §4.6 prohíbe explícitamente la palabra). No se tocó v1.1 por instrucción explícita del usuario de no cambiar su metodología en esta tarea — requiere una decisión separada.
  - **Hallazgo nuevo, fuera de alcance de esta tarea, NO corregido**: `SKILLS/ceinca-ia/references/frameworks.md` contiene una **tercera copia** casi idéntica de este contenido (12 instancias de `@Eduardo`/`@Voice: Eduardo`, líneas 300-505), nunca detectada en las 3 auditorías previas de esta sesión. `PRODUCTION/OPENMONTAGE_STUDIO.md` tiene 2 menciones sueltas adicionales (líneas 21, 27). Ninguno de los dos se tocó — el usuario pidió específicamente la consolidación de `FLOW_REELS.md` contra v1.1, no una limpieza global de todas las apariciones del nombre en el repo.

## 3. Archivos y cambios (esta sesión)
Commits de limpieza y documentación en `main`:
- `d9d75a871b96721c187ca44680a1dac312392187` — merge de PR #16: elimina tracker obsoleto, assets multimedia pesados y endurece `.gitignore`.
- `d6a6f3d2a6be01de60d5fe89e5d28ba244ed15f9` — actualiza `CLAUDE.md` para reflejar la arquitectura y política de assets vigentes.

Sesión PR #18 (rama `claude/unificar-marca-sobre-main`, mergeada a `main` en `faca1249`):
- `a563306` — unifica paleta de marca (azul/dorado) en 17 archivos.
- `7e4388f` — agrega `MARKETING/MANUAL_COPY_META_TIKTOK.md`.
- Auditoría de lectura de `.claude/agents/` (9 archivos) y `.claude/skills/` (22 carpetas) — ver clasificación propuesta en sección 2. Sin cambios aplicados.
- Actualización de este `handoff.md` para reflejar el estado real tras la sesión.

Sesión Brain Audit (28-08-2026, sobre `main` directo, solo lectura):
- Sin commits de auditoría — el commit `1ba89ed` en `main` fue solo para registrar los hallazgos en este `handoff.md`.

Sesión PR quirúrgico Brain Audit (28-08-2026, rama `fix/brain-audit-surgical-p1`, mergeada a `main` en `d585e77`):
- Modificados: `.claude/rules/hooks.md`, `.claude/agents/doc-updater.md`, `MARKETING/SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md`.
- Nuevo: `RULES/ESTILO_REDACCION.md`.
- Ver detalle de cada cambio en sección 2.

Sesión investigación CEINCA AI Video Production System (28-08-2026, sobre `main` directo):
- Modificado: `PRODUCTION/FLOW_REELS.md` (banner de advertencia, ver sección 2). Único cambio de archivo de la sesión.

Sesión consolidación FLOW_REELS.md (28-08-2026, rama `docs/consolidar-flow-reels-v1.1`, sin mergear):
- Modificado: `PRODUCTION/FLOW_REELS.md` (30 correcciones de terminología, ver sección 2). Único archivo modificado — `FLOW_VIDEO_DIRECTOR_SYSTEM.md` no se tocó.

## 4. Intentos fallidos
<!-- NO BORRAR NINGUNA ENTRADA DE ESTA SECCIÓN. Solo agregar. -->
<!-- Si supera ~20 líneas, mover las más antiguas a handoff-archive.md (nunca eliminar). -->
- Se descartó 21st.dev (Magic MCP) para componentes — sustituido por el MCP oficial de shadcn. Motivo: preferencia por herramienta oficial/gratuita.
- Se descartó instalar gstack completo (setup de Garry Tan) — solo se importaron selectivamente /review, /cso, /qa, /ship, /land-and-deploy como skills vendorizados. Motivo: los roles de CEO/Estratega y Diseñador de gstack redundaban con ceinca-ia y ceinca-design.
- shadcn init falló por bloqueo de ui.shadcn.com en el proxy de egreso del entorno (403). Fix: cambiar "Network access" a Custom y agregar el dominio — NO intentar editar un archivo local de config, no existe.
- Higgsfield NO sirve para música ni efectos de sonido: su `generate_audio` es sólo texto-a-voz y la propia herramienta indica rechazar peticiones de música/SFX. Fix aplicado: sintetizar la pista con numpy (`build_music.py`). No volver a intentarlo por ahí.
- `lutyuv` de ffmpeg no expone el número de frame (`N`), así que no sirve para un flash temporizado. Fix: `eq=brightness='...':eval=frame`, que sí evalúa `t` por frame.
- `crop` sólo evalúa `w`/`h` una vez; para zoom animado hay que usar `zoompan` (y sobreescalar antes para que no tiemble). Sólo `x`/`y` de `crop` se evalúan por frame — eso sí sirve para el camera shake.
- `alimiter` de ffmpeg trae `level=enabled` por defecto y renormaliza la salida a 0 dBFS, anulando el `limit`. Resultado: el máster salió a +1.9 dBFS de pico real (saturado). Fix: `level=disabled` y, sobre todo, limitador de pico real propio con sobremuestreo 4× (`tp_limit.py`).
- Texto negro sobre caja de color con `borderw` negro queda ilegible: el contorno rellena las contraformas de las letras. Fix: sin contorno cuando hay caja.
- `npx playwright install` (descarga de binarios chromium/firefox/webkit) falla en el entorno remoto CCR: proxy de egreso bloquea `cdn.playwright.dev` con 403. No reintentar en sesiones remotas — instalar los browsers desde una máquina local o dejar que lo haga GitHub Actions.
- Verificar el estado de `main`/otras ramas con `git log origin/main` sin haber corrido `git fetch --all --prune` primero da un falso "esto no existe" — el remoto puede tener commits y ramas (de PRs mergeados, de otras sesiones en paralelo) que el clon local no vio nunca. Antes de afirmar que algo "no está hecho" en el repo, correr `git fetch --all --prune` y comparar contra el ref remoto actual, no contra la caché local de `origin/main`.
- Un subagente (fork) del Brain Audit (28-08-2026) reportó en su resumen final haber editado `handoff.md` para registrar los hallazgos, pero el cambio nunca se persistió — al verificar con `git status`/`git diff` el árbol de trabajo seguía limpio. No asumir que un subagente hizo un cambio de archivo solo porque su reporte lo dice; verificar con `git status`/`git diff` antes de repetírselo al usuario.

## 5. Próximos pasos
1. **Aprobar (o ajustar) la arquitectura conceptual del CEINCA AI Video Production System** propuesta en la sesión del 28-08-2026 (ver sección 2) antes de diseñar en detalle el AI Editor/Orchestrator — nada de esto se ha construido.
2. ~~Reconciliación formal de `FLOW_REELS.md` → `FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1~~ — **hecho** en rama `docs/consolidar-flow-reels-v1.1` (28-08-2026), pendiente de aprobar/mergear el PR. Terminología corregida, contenido de referencia conservado íntegro, v1.1 sin tocar.
2b. **Decidir sobre la contradicción interna descubierta en `FLOW_VIDEO_DIRECTOR_SYSTEM.md` v1.1** (línea 127: "Mantener: hiperrealismo..." contradice su propia regla NO NEGOCIABLE §4.6) — no se tocó v1.1, requiere aprobación explícita antes de corregirlo.
2c. **Decidir qué hacer con la tercera copia duplicada** en `SKILLS/ceinca-ia/references/frameworks.md` (12 instancias de `@Eduardo`/`@Voice: Eduardo`, líneas 300-505) y las 2 menciones sueltas en `PRODUCTION/OPENMONTAGE_STUDIO.md` — descubierta durante la consolidación de esta sesión, no corregida (fuera del alcance pedido).
3. Decidir si se construye el MVP mínimo identificado (ffprobe + whisper + ffmpeg: metadata + transcripción + corte de silencios) como primer prototipo — **no construido**, requiere aprobación explícita antes de escribir código.
4. Si se avanza hacia análisis de audio más fino (detección de tempo/beat, escenas vía Python), decidir qué instalar (`librosa`/`pydub`/`pyscenedetect`) — instalar dependencias es línea roja explícita, requiere aprobación.
5. Retirar el banco corto de keywords de `FRAMEWORK_VIRAL_V2.md` Parte 3 (dejar solo el link a `CTB_PALABRAS_DISRUPTIVAS.md`) — sigue pendiente de aprobación explícita.
6. Sesión de **diseño, no ejecución**, para decidir qué hacer con el graveyard de hooks duplicados y sin cablear (`.claude/hooks/memory-persistence/*.sh` vs `.claude/scripts/hooks/*.js` vs ninguno) antes de borrar nada.
7. Decidir si `.claude/settings.local.json` (donde vive el único hook activo, `impeccable`) se versiona en git o se documenta explícitamente como configuración local intencional.
8. Retirar las plantillas de copy superadas (`FRAMEWORK_VIRAL_V2.md` Partes 4-5, `VIRAL_PLAYBOOK.md` §5.1-5.4), dejando `MANUAL_COPY_META_TIKTOK.md` como autoridad única con referencia cruzada, no borrado silencioso.
9. Decidir sobre `brief-creativo-lexia.md` (recuperar/recrear el brief, o retirar las 3 referencias de `SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md`) — ya documentado inline en el archivo, decisión pendiente del usuario.
10. Reubicar `AGENTS/AUDITOR_IA_MARCA_PROFESIONAL/` y `PRODUCTION/SAREN_TOTUMA_SCRIPT_FLOW.md` a `CLIENTS/` o una carpeta de entregables/campañas — no son sistemas reutilizables ni prompts de agente.
11. Verificar si `.claude/skills/brainstorming/` (vendorizado, 160 KB) solapa funcionalmente con la skill de plataforma `superpowers:brainstorming`.
12. Evaluar la limpieza del historial Git de binarios eliminados si `.git` (~450 MB) sigue siendo innecesariamente alto; hacerlo sólo con backup/plan de recuperación.
13. Añadir fecha de última verificación a `KNOWLEDGE/SAREN_PRACTICE.md` (riesgo de desactualización frente a nuevas circulares SAREN, ya advertido en `RULES/ANTI_HALLUCINATION.md`).
