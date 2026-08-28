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
- Sin commits — el único artefacto de esta sesión es esta actualización de `handoff.md`.

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
Orden recomendado por el Brain Audit (28-08-2026), siguiendo ENTENDER → DISEÑAR → APROBAR → EJECUTAR — nada de esto se ha ejecutado todavía, pendiente de aprobación del usuario:
1. **PR pequeño de bajo riesgo** (continuación directa de PR #19): reescribir `.claude/rules/hooks.md` contra la realidad de `hooks.json`/`settings.local.json`; retirar el banco corto de keywords de `FRAMEWORK_VIRAL_V2.md` Parte 3 (dejar solo el link a `CTB_PALABRAS_DISRUPTIVAS.md`); promover la regla de tuteo/no-voseo de `SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md` §5.5 a `RULES/` o a las fuentes obligatorias de los agentes de contenido; limpiar líneas 130-226 de `.claude/agents/doc-updater.md` (mismo método quirúrgico ya usado 4 veces en PR #19).
2. Sesión de **diseño, no ejecución**, para decidir qué hacer con el graveyard de hooks duplicados y sin cablear (`.claude/hooks/memory-persistence/*.sh` vs `.claude/scripts/hooks/*.js` vs ninguno) antes de borrar nada.
3. Decidir si `.claude/settings.local.json` (donde vive el único hook activo, `impeccable`) se versiona en git o se documenta explícitamente como configuración local intencional.
4. Retirar las plantillas de copy superadas (`FRAMEWORK_VIRAL_V2.md` Partes 4-5, `VIRAL_PLAYBOOK.md` §5.1-5.4), dejando `MANUAL_COPY_META_TIKTOK.md` como autoridad única con referencia cruzada, no borrado silencioso.
5. Arreglar o retirar la referencia rota a `brief-creativo-lexia.md` en `SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md`.
6. Reubicar `AGENTS/AUDITOR_IA_MARCA_PROFESIONAL/` y `PRODUCTION/SAREN_TOTUMA_SCRIPT_FLOW.md` a `CLIENTS/` o una carpeta de entregables/campañas — no son sistemas reutilizables ni prompts de agente.
7. Verificar si `.claude/skills/brainstorming/` (vendorizado, 160 KB) solapa funcionalmente con la skill de plataforma `superpowers:brainstorming`.
8. **Definir arquitectura oficial de producción audiovisual** — ahora con evidencia concreta de 5 vías existentes sin consolidar (`video-export/` scaffold, `carrusel-export/` solo imágenes, Flow/Veo, OpenMontage, pipeline ffmpeg/Python ad-hoc en `CLIENTS/casacampobarinas1/`). Decidir cuál(es) sobrevive(n) **antes** de construir el Video Engine, para no crear una sexta vía.
9. Evaluar la limpieza del historial Git de binarios eliminados si `.git` (~450 MB) sigue siendo innecesariamente alto; hacerlo sólo con backup/plan de recuperación.
10. Añadir fecha de última verificación a `KNOWLEDGE/SAREN_PRACTICE.md` (riesgo de desactualización frente a nuevas circulares SAREN, ya advertido en `RULES/ANTI_HALLUCINATION.md`).
