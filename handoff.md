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
- **PR #18 abierto** (`claude/unificar-marca-sobre-main` → `main`): unifica la paleta de marca (azul/dorado) a los valores reales del logo (`#1E3A8A`/`#122A63`/`#2D4FA8` navy, `#C8A951` dorado) en `SKILLS/ceinca-design/`, `SKILLS/ceinca-ia/`, `MARKETING/`, `AGENTS/`, `PRODUCTION/`, `README.md` — antes había 4 azules distintos en conflicto. Retira el "Verde CEINCA" `#1B7A3D` legado de `FRAMEWORK_VIRAL_V2.md` a favor del dorado. Agrega `MARKETING/MANUAL_COPY_META_TIKTOK.md` (manual de copy v2.0: 4 textos Meta + 3 textos TikTok, nuevo). Pendiente de revisión/merge del usuario.
- **Auditoría Fase 1 (`.claude/agents/` y `.claude/skills/`) — primera pasada hecha, sin ejecutar cambios.** Confirmado por lectura directa: los 9 agentes en `.claude/agents/` (architect, planner, code-reviewer, security-reviewer, refactor-cleaner, build-error-resolver, doc-updater, e2e-runner, tdd-guide) vienen de `everything-claude-code` y varios contienen ejemplos reales de otro proyecto (plataforma de trading/mercados con Supabase+Redis+embeddings) sin adaptar a CEINCA — confirma la sospecha de "contaminación conceptual". Clasificación propuesta (no aplicada):
  - 🔴 ELIMINAR: `architect`, `refactor-cleaner`, `build-error-resolver`, `e2e-runner`, `tdd-guide` — asumen código de producto activo con build/tests/arquitectura de backend, que ya no existe en este repo desde que se fue `ig-viral-tracker`.
  - 🟡 MODIFICAR (quitar ejemplos ajenos, mantener el checklist/proceso genérico): `planner`, `code-reviewer`, `security-reviewer`, `doc-updater`.
  - De las 22 skills en `.claude/skills/`: 🟢 conservar las de diseño/video/copy (`impeccable`, `animation-vocabulary`, `review-animations`, `emil-design-eng`, `design-taste-frontend`, `apple-design`, `no-ai-slop`, `ui-ux-pro-max`, `remotion-best-practices`, `verification-before-completion`, `verification-loop`, `requesting-code-review`); 🟡 evaluar (`brainstorming`, `strategic-compact`, `continuous-learning`); 🔴 candidatas a eliminar por asumir desarrollo de software activo que no existe aquí (`coding-standards`, `clickhouse-io`, `backend-patterns`, `frontend-patterns`, `tdd-workflow`, `eval-harness`, `security-checklist`, `project-guidelines-example`).
  - **No se borró nada todavía** — falta que el usuario confirme la clasificación antes de aplicar cambios estructurales (regla explícita tanto de este handoff como de la propuesta que la originó).

## 3. Archivos y cambios (esta sesión)
Commits de limpieza y documentación en `main`:
- `d9d75a871b96721c187ca44680a1dac312392187` — merge de PR #16: elimina tracker obsoleto, assets multimedia pesados y endurece `.gitignore`.
- `d6a6f3d2a6be01de60d5fe89e5d28ba244ed15f9` — actualiza `CLAUDE.md` para reflejar la arquitectura y política de assets vigentes.

Esta sesión (rama `claude/unificar-marca-sobre-main`, PR #18, sin mergear):
- `a563306` — unifica paleta de marca (azul/dorado) en 17 archivos.
- `7e4388f` — agrega `MARKETING/MANUAL_COPY_META_TIKTOK.md`.
- Auditoría de lectura de `.claude/agents/` (9 archivos) y `.claude/skills/` (22 carpetas) — ver clasificación propuesta en sección 2. Sin cambios aplicados.
- Actualización de este `handoff.md` para reflejar el estado real tras la sesión.

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

## 5. Próximos pasos
1. **Revisar y mergear (o pedir cambios en) PR #18** — unificación de paleta + manual de copy, ya construido sobre `main` limpio.
2. Confirmar (o corregir) la clasificación 🟢/🟡/🔴 de `.claude/agents/` y `.claude/skills/` de la sección 2, y sólo entonces aplicarla — eliminar los 5 agentes marcados 🔴, limpiar ejemplos ajenos de los 4 marcados 🟡, y decidir sobre las 8 skills candidatas a eliminar.
3. Revisar si `everything-claude-code` aporta valor real en este repo y conservar sólo los módulos que reduzcan trabajo o tokens.
4. Auditar `AGENTS/`, `RULES/`, `MARKETING/` y `STRATEGY/` contra `CLAUDE.md` para eliminar reglas duplicadas o contradictorias.
5. Definir arquitectura oficial de producción audiovisual: Flow/Veo para generación, FFmpeg para operaciones de edición/transformación y Remotion para composición/motion graphics cuando corresponda.
6. Revisar `carrusel-export/` y `video-export/` para convertirlos en engines claramente documentados y reproducibles.
7. Revisar `PRODUCTION/` y `CLIENTS/` para separar conocimiento/workflows de assets temporales.
8. Evaluar la limpieza del historial Git de binarios eliminados si el tamaño real del repositorio sigue siendo innecesariamente alto; hacerlo sólo después de confirmar el estado actual y con backup/plan de recuperación.
9. Crear una arquitectura objetivo de CEINCA-AI-OS antes de nuevas instalaciones o grandes refactors (propuesta recibida: agrupación conceptual CEREBRO [KNOWLEDGE/STRATEGY/RULES/MARKETING] → AGENTES [AGENTS/.claude] → FÁBRICA [PRODUCTION/carrusel-export/video-export] — evaluar antes de reestructurar carpetas físicamente).
