# handoff.md — CEINCA-AI-OS

> Este archivo es la memoria de continuidad entre sesiones de Claude Code.
> Al iniciar una sesión nueva: "Lee handoff.md y continúa desde los próximos pasos."
> Al cerrar una sesión: actualiza este archivo siguiendo las reglas de cada sección (ver abajo).

## 1. Objetivo
Construir y mantener el ecosistema CEINCA-AI-OS: skills propios (ceinca-design, ceinca-ia, ceinca-systems-social-growth), sistema de carruseles unificado, e IG Viral Tracker como único proyecto en producción.

## 2. Estado actual
- Sistema de 3 formatos de carrusel (paso a paso / alerta de riesgo / alerta noticiosa) mergeado a main (commits f2255cc..6a252ef).
- IG Viral Tracker: MVP backend + frontend activos.
- Skills vendorizados (ui-ux-pro-max, apple-design, animation-vocabulary) en .claude/skills/, trackeados con skills-lock.json.
- PR #4 (ui-ux-pro-max) abierto, pendiente de rebase — main avanzó 3 merges desde que se abrió.
- **NUEVO — instalado "everything-claude-code" (affaan-m) a nivel de proyecto en `.claude/`:**
  9 subagentes en `.claude/agents/`, 11 slash commands en `.claude/commands/` (se eliminó
  `/code-review` por chocar con el skill nativo homónimo), 10 skills nuevos en
  `.claude/skills/` (uno de los 11 originales, `security-review`, se renombró a
  `security-checklist` por chocar con el skill nativo `security-review`; registrados en
  `skills-lock.json`), 8 docs de reglas en `.claude/rules/`, 3 contexts en `.claude/contexts/`,
  y los scripts Node.js + `hooks.json` copiados a `.claude/scripts/` y `.claude/hooks/` como
  referencia. `hooks.json` **NO** se conectó a un `settings.json` — la mayoría de sus hooks
  (prettier, tsc, bloqueo de `npm run dev`) asumen un proyecto npm/TS que este repo no es, y
  sus hooks de sesión (SessionStart/SessionEnd/PreCompact) usan `${CLAUDE_PLUGIN_ROOT}`, que
  sólo resuelve si se instala como plugin real. Queda para activación manual/selectiva.
- Pendiente: revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md (ya cargadas en CLAUDE.md).
- **NUEVO — primer entregable de vídeo del repo:** promocional de Casa & Campo Barinas
  (alquiler exclusivo para promociones, caso U.E. Roberto Moreno 2026) en
  `CLIENTS/casacampobarinas1/PROMO_VIDEO_2026/`. Montaje 9:16 de 30.9 s construido con
  ffmpeg + Python a partir de 5 clips de WhatsApp, con música original sintetizada.
  Se entregan dos versiones (MASTER con música para ads, SIN_MUSICA para audio de
  tendencia en orgánico) y los scripts de build son reproducibles.
- **NUEVO — Playwright E2E en ig-viral-tracker/frontend:** se corrió
  `npm init playwright@latest` (rama `claude/playwright-setup-qehg88`, ya pusheada,
  sin PR abierto todavía) sobre el Next.js del frontend — es el único proyecto del repo
  con una app web real que justifica pruebas E2E (carrusel-export ya usaba `playwright`
  como dependencia programática para exportar PNG, no como test runner). Quedó:
  `@playwright/test` en devDependencies, `playwright.config.ts` (TypeScript, chromium +
  firefox + webkit, `baseURL: http://localhost:3000`, `webServer` apuntando a `npm run dev`),
  workflow `.github/workflows/playwright.yml`, spec de ejemplo sin tocar, y scripts
  `test:e2e` / `test:e2e:ui` en package.json.

## 3. Archivos y cambios (esta sesión)
<!-- Sobrescribir cada sesión. Usar rango de commits o `git diff --stat`, no resumen narrado. -->
Commits `56b1a98..b6fc8a5` (rama `claude/repository-installation-wkg83q`). El segundo
commit (`b6fc8a5`) elimina `.claude/commands/code-review.md` y renombra
`.claude/skills/security-review/` -> `.claude/skills/security-checklist/` para resolver
colisiones de nombre con skills nativos detectadas después del primer commit.

`git diff --stat 56b1a98~1 56b1a98` (instalación inicial):

```
 .claude/agents/*.md (9 archivos)                    | 3257 líneas
 .claude/commands/*.md (12 archivos)                 | 1449 líneas
 .claude/contexts/*.md (3 archivos)                  |   68 líneas
 .claude/hooks/hooks.json + memory-persistence/ + strategic-compact/ | 343 líneas
 .claude/rules/*.md (8 archivos)                     |  378 líneas
 .claude/scripts/hooks/*.js + lib/*.js + setup-package-manager.js (8 archivos) | 1293 líneas
 .claude/skills/{backend-patterns,clickhouse-io,coding-standards,
   continuous-learning,eval-harness,frontend-patterns,
   project-guidelines-example,security-review,strategic-compact,
   tdd-workflow,verification-loop}/ (11 skills, 14 archivos)  | 3924 líneas
 skills-lock.json                                    |   66 líneas
 63 files changed, 10978 insertions(+)
```

(listado completo de rutas: `git show --stat 56b1a98`)

## 4. Intentos fallidos
<!-- NO BORRAR NINGUNA ENTRADA DE ESTA SECCIÓN. Solo agregar. -->
<!-- Si supera ~20 líneas, mover las más antiguas a handoff-archive.md (nunca eliminar). -->
- Se descartó 21st.dev (Magic MCP) para componentes — sustituido por el MCP oficial de shadcn. Motivo: preferencia por herramienta oficial/gratuita.
- Se descartó instalar gstack completo (setup de Garry Tan) — solo se importaron selectivamente /review, /cso, /qa, /ship, /land-and-deploy como skills vendorizados. Motivo: los roles de CEO/Estratega y Diseñador de gstack redundaban con ceinca-ia y ceinca-design.
- shadcn init falló por bloqueo de ui.shadcn.com en el proxy de egreso del entorno (403). Fix: cambiar "Network access" a Custom y agregar el dominio — NO intentar editar un archivo local de config, no existe.
- Higgsfield NO sirve para música ni efectos de sonido: su `generate_audio` es sólo texto-a-voz y la propia herramienta indica rechazar peticiones de música/SFX. Fix aplicado: sintetizar la pista con numpy (`build_music.py`). No volver a intentarlo por ahí.
- `lutyuv` de ffmpeg no expone el número de frame (`N`), así que no sirve para un flash temporizado. Fix: `eq=brightness='...':eval=frame`, que sí evalúa `t` por frame.
- `crop` sólo evalúa `w`/`h` una vez; para zoom animado hay que usar `zoompan` (y sobreescalar antes para que no tiemble). Sólo `x`/`y` de `crop` se evalúan por frame — eso sí sirve para el camera shake.
- `alimiter` de ffmpeg trae `level=enabled` por defecto y **renormaliza la salida a 0 dBFS**, anulando el `limit`. Además sólo mide picos de muestra. Resultado: el máster salió a +1.9 dBFS de pico real (saturado). Fix: `level=disabled` y, sobre todo, limitador de pico real propio con sobremuestreo 4× (`tp_limit.py`).
- Texto negro sobre caja de color con `borderw` negro queda ilegible: el contorno rellena las contraformas de las letras. Fix: sin contorno cuando hay caja.
- `npx playwright install` (descarga de binarios chromium/firefox/webkit) falla en el entorno remoto CCR: proxy de egreso bloquea `cdn.playwright.dev` con 403 ("no rule or allowlist entry allows host"). A diferencia del bloqueo de `ui.shadcn.com`, aquí no hay archivo de config local para agregar el dominio dentro de esta sesión remota. No reintentar en sesiones remotas — instalar los browsers desde una máquina local (`npx playwright install`) o dejar que lo haga el workflow de GitHub Actions ya creado (`npx playwright install --with-deps`, con red completa en el runner).

## 5. Próximos pasos
1. Revisar PR #4 (ui-ux-pro-max): confirmar si necesita rebase contra main.
2. Auditar el contenido real de la skill ui-ux-pro-max (de terceros) antes de mergear.
3. Revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md.
4. Decidir si se adapta algo de la guía "Carousel Code" (@emprendeconcata) al sistema ya existente.
5. Casa & Campo: publicar el Reel y medir. Pedir material nuevo grabado en vertical 1080p
   (por Drive, NO por WhatsApp) — faltan planos de día, de comida llanera y caras en
   primer plano para una segunda versión del promocional.
6. Evaluar `git-lfs` para el repo: este entregable añadió ~58 MB de binarios y CLIENTS/
   va a seguir acumulando vídeo.
7. Playwright (rama `claude/playwright-setup-qehg88`, ya pusheada): abrir el PR si se
   quiere mergear a main. Antes de correr tests localmente, instalar los browsers
   (`cd ig-viral-tracker/frontend && npx playwright install`) — no vienen descargados
   porque el entorno remoto donde se instaló no tiene salida a `cdn.playwright.dev`.
   Reemplazar `tests/example.spec.ts` (boilerplate que apunta a playwright.dev) por
   specs reales contra las páginas del frontend una vez haya flujos que valga la pena cubrir.
8. everything-claude-code recién instalado en `.claude/`: decidir si conviene activar
   `.claude/hooks/hooks.json` en un `settings.json` real. Tal cual está, casi todos sus
   hooks (prettier, `tsc`, bloqueo de `npm run dev`/`git push`) son para un stack npm/TS
   que este repo no tiene — sólo aplicarían a `ig-viral-tracker/frontend`, no al resto del
   repo (contenido Python/Markdown). Si se activa, hacerlo con matchers acotados a esa
   carpeta y reescribir las rutas `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/*.js` (que sólo
   resuelven si se instala como plugin real) a `.claude/scripts/hooks/*.js`.
9. ~~Revisar si `/code-review` y `/plan` chocan con skills nativos.~~ Resuelto (commit
   b6fc8a5): `/plan` no chocaba (no hay skill nativo `plan`, sólo el agente `Plan` del
   Agent tool, namespace distinto). `code-review` sí chocaba —se eliminó el command
   vendorizado, queda el skill nativo `code-review` (más completo: ReportFindings,
   --comment/--fix, niveles de esfuerzo). `security-review` (skill vendorizado) también
   chocaba con el skill nativo del mismo nombre —se renombró a `security-checklist`
   (carpeta + frontmatter + `skills-lock.json`); no hacía falta tocar ninguna otra
   referencia porque nada más lo mencionaba por nombre de skill.
