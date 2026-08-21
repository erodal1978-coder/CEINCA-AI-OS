# handoff.md — CEINCA-AI-OS

> Este archivo es la memoria de continuidad entre sesiones de Claude Code.
> Al iniciar una sesión nueva: "Lee handoff.md y continúa desde los próximos pasos."
> Al cerrar una sesión: actualiza este archivo siguiendo las reglas de cada sección (ver abajo).

## 1. Objetivo
Construir y mantener el ecosistema CEINCA-AI-OS: skills propios (ceinca-design, ceinca-ia, ceinca-systems-social-growth), sistema de carruseles unificado, IG Viral Tracker como único proyecto en producción, y ahora WEBKIT/ como capacidad de generar landing pages para clientes de CEINCA.

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
- **NUEVO — instalado `WEBKIT/`, vendorizado desde [Hainrixz/claude-webkit](https://github.com/Hainrixz/claude-webkit) (MIT):**
  proyecto autocontenido para generar landing pages de clientes (Next.js 16 + Tailwind 4 +
  shadcn/ui). Trae su propio `CLAUDE.md` (rol "web builder" con flujo guiado de 6 fases:
  cuestionario → sistema de diseño → scaffold → build → QA/motion/SEO → deploy a Vercel) y
  21 skills bundleadas en `WEBKIT/.claude/skills/` (13 propias del repo + 8 de
  emilkowalski/skills para motion/polish, con atribución en
  `WEBKIT/.claude/skills/ATTRIBUTION.md`). Se instaló como carpeta hermana de nivel raíz
  (no mergeado dentro de `.claude/` de este repo ni de `SKILLS/`) precisamente para que su
  `CLAUDE.md` no compita con el de CEINCA-AI-OS — se activa entrando al directorio
  (`cd WEBKIT && claude`). Confirmado en esta misma sesión que Claude Code detectó y
  namespaceó automáticamente las 21 skills (`WEBKIT:<skill>` cuando colisionan con un
  skill nativo/global de mismo nombre, ej. `WEBKIT:apple-design`, `WEBKIT:ui-ux-pro-max`,
  `WEBKIT:emil-design-eng`, `WEBKIT:animation-vocabulary`). No se registró en
  `skills-lock.json` (ese archivo trackea skills individuales sueltas; WEBKIT es un
  proyecto completo vendorizado, no una skill suelta). Referenciado en el `CLAUDE.md` raíz
  (sección MÓDULOS DEL SISTEMA) y en `README.md`.
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
Commit `3bc9a69` (rama `claude/install-claude-webkit-tj4l90`, pusheada, sin PR abierto
todavía — el usuario no pidió PR):

```
git diff --stat 3bc9a69~1 3bc9a69
 CLAUDE.md                                  |    3 +-
 README.md                                  |    1 +
 WEBKIT/  (218 archivos: CLAUDE.md, docs/, .claude/skills/*21, LICENSE, README(.es).md,
           package.json, .gitignore — clon completo de Hainrixz/claude-webkit sin .git)
 218 files changed, 31327 insertions(+)
```

(listado completo de rutas: `git show --stat 3bc9a69`)

Sesión previa (referencia, ya en main): commits `56b1a98..b6fc8a5` (rama
`claude/repository-installation-wkg83q`) instalaron "everything-claude-code" — ver
`git show --stat 56b1a98` / `b6fc8a5`.

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
0. WEBKIT/ recién instalado (rama `claude/install-claude-webkit-tj4l90`, ya pusheada, sin
   PR abierto): decidir si se abre PR a main. Antes de usarlo con un cliente real, probar
   el flujo end-to-end una vez (`cd WEBKIT && claude`) para confirmar que el scaffold de
   Next.js/shadcn funciona en este entorno (proxy de egreso ya bloqueó `ui.shadcn.com` en
   una sesión anterior — puede volver a pasar aquí, mismo fix: red "Custom" + allowlist del
   dominio). También pendiente: decidir una convención para dónde viven los `site/` que
   genere (hoy caen dentro de `WEBKIT/site/`, gitignoreado — probablemente se quiera mover
   cada landing terminada a `CLIENTS/<cliente>/` en vez de dejarla suelta en WEBKIT/).
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
