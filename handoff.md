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
- **PR #19 abierto** (`cleanup/audit-claude-agents-skills` → `main`, basado en `main` directo, en paralelo a PR #18): ejecuta la Fase 1 de la auditoría — elimina agentes `e2e-runner`/`tdd-guide` y skills `backend-patterns`/`clickhouse-io`/`security-checklist`/`project-guidelines-example`; adapta `architect`/`security-reviewer`/`refactor-cleaner`/`build-error-resolver` quitando solo su sección "(Example)" contaminada; corrige referencias en cascada en `.claude/rules/`, `.claude/commands/orchestrate.md` y `ui-ux-pro-max`. No mergeado.
- **Decisión sobre `/tdd` y `/e2e` (misma rama, PR #19):** se eliminan sin reemplazo — no se crean comandos equivalentes. `tdd-workflow` skill, `brainstorming`, `strategic-compact` y `eval-harness` permanecen sin tocar, en categoría 🟡 pendiente de evaluación en la próxima auditoría. Se eliminaron `.claude/commands/tdd.md` y `.claude/commands/e2e.md`; se corrigieron las referencias residuales a `/tdd` en `.claude/commands/plan.md` y a "TDD Guide" en la plantilla de reporte de `.claude/commands/orchestrate.md`. `skills-lock.json` verificado consistente (la entrada `tdd-workflow` sigue apuntando a un skill que existe en disco). Orden de trabajo acordado: PR #18 → PR #19 → auditoría del cerebro → optimización de contexto → Video Engine.
- **Nota para quien mergee:** PR #18 y PR #19 modifican ambos este `handoff.md` desde el mismo punto de `main` — al mergear el segundo va a haber un conflicto trivial en este archivo, resolver combinando ambas entradas de "Estado actual", no descartar ninguna.

## 3. Archivos y cambios (esta sesión)
Commits de limpieza y documentación en `main`:
- `d9d75a871b96721c187ca44680a1dac312392187` — merge de PR #16: elimina tracker obsoleto, assets multimedia pesados y endurece `.gitignore`.
- `d6a6f3d2a6be01de60d5fe89e5d28ba244ed15f9` — actualiza `CLAUDE.md` para reflejar la arquitectura y política de assets vigentes.
- Actualización de este `handoff.md` en curso para alinear la memoria operativa con el estado real del repositorio.

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

## 5. Próximos pasos
1. Hacer auditoría de `.claude/`: distinguir claramente componentes propios de CEINCA frente a skills/agentes vendorizados y detectar duplicaciones de instrucciones.
2. Revisar si `everything-claude-code` aporta valor real en este repo y conservar sólo los módulos que reduzcan trabajo o tokens.
3. Auditar `AGENTS/`, `RULES/`, `MARKETING/` y `STRATEGY/` contra `CLAUDE.md` para eliminar reglas duplicadas o contradictorias.
4. Definir arquitectura oficial de producción audiovisual: Flow/Veo para generación, FFmpeg para operaciones de edición/transformación y Remotion para composición/motion graphics cuando corresponda.
5. Revisar `carrusel-export/` y `video-export/` para convertirlos en engines claramente documentados y reproducibles.
6. Revisar `PRODUCTION/` y `CLIENTS/` para separar conocimiento/workflows de assets temporales.
7. Evaluar la limpieza del historial Git de binarios eliminados si el tamaño real del repositorio sigue siendo innecesariamente alto; hacerlo sólo después de confirmar el estado actual y con backup/plan de recuperación.
8. Crear una arquitectura objetivo de CEINCA-AI-OS antes de nuevas instalaciones o grandes refactors.
