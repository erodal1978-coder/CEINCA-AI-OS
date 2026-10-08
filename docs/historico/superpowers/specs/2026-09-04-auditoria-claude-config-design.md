# Auditoría y optimización de skills, MCP, plugins y configuración de Claude Code

**Fecha:** 2026-09-04
**Alcance confirmado:** solo configuración de Claude Code (global `~/.claude` + repo `CEINCA-AI-OS/.claude`). No incluye limpieza general de disco (backups de marketplace, cachés `temp_git_*`, archivos grandes sueltos como `Antigravity.tar.gz`) — queda fuera deliberadamente por decisión del usuario.

## Contexto

Auditoría solicitada para: detectar fallos, conflictos y redundancias en skills/MCP/plugins/configuración; fusionar o eliminar lo redundante; identificar huecos e instalar/crear lo que falte para el desarrollo de CEINCA. Diagnóstico previo (ver conversación) encontró causas raíz concretas para cada problema — este documento fija las decisiones y el estado final esperado.

## Decisiones tomadas

1. **MCP/plugins rotos**: arreglar los que tengan solución simple; proponer eliminar el resto.
2. **Automatización de navegador**: consolidar en `claude-in-chrome` (uso general) + `playwright` (testing pesado); eliminar `chrome-devtools-mcp` y el skill `agent-browser` por redundantes.
3. **Repo `CEINCA-AI-OS`**: incluido en el alcance — resolver duplicados de skills y cerrar la decisión pendiente sobre `/tdd`/`/e2e`.
4. **Plugins con uso histórico = 0** (24 detectados: `frontend-design, code-review, context7, skill-creator, code-simplifier, figma, supabase, pr-review-toolkit, pyright-lsp, typescript-lsp, claude-code-setup, commit-commands, feature-dev, agent-sdk-dev, playground, mcp-server-dev, atomic-agents, netlify-skills`, etc.): **se dejan como están** — no cuestan nada si no se invocan, quedan como capacidad disponible.

## Diagnóstico y acción por componente

### MCP servers / plugins rotos

| Componente | Causa raíz confirmada | Acción |
|---|---|---|
| `github` (plugin) | Config del MCP (`.mcp.json` cacheado) usa `Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`, pero esa env var nunca se definió en el entorno. `gh` CLI sí está autenticado (`erodal1978-coder`, scopes `repo`, `read:org`, etc.) | Añadir a `~/.bashrc`: `export GITHUB_PERSONAL_ACCESS_TOKEN="$(gh auth token)"`. Verificar reconectando el MCP en una sesión nueva. |
| `telegram` (plugin) | Requiere el binario `bun`, no está en el PATH. Uso histórico = 0 (nunca invocado) | Deshabilitar el plugin (`enabledPlugins.telegram@claude-plugins-official: false` en `settings.json`). No instalar `bun` — no hay caso de uso identificado para CEINCA hoy. |
| `greptile` (plugin) | Token OAuth rechazado por el servidor (403). Uso histórico = 0 | Deshabilitar el plugin. Requeriría re-autenticación externa (greptile.com) sin beneficio claro sobre las herramientas ya disponibles (code-review, pr-review-toolkit). |
| `serena` (plugin) | Timeout de conexión. Uso histórico = 0 | Deshabilitar el plugin. Su función (búsqueda semántica de código) se solapa con `typescript-lsp`/`pyright-lsp` ya instalados. |
| `chrome-devtools-mcp` (plugin) | Timeout de conexión. Redundante con `claude-in-chrome` | Deshabilitar (ver sección de navegador). |
| `playwright` (plugin) | Timeout de conexión. Causa probable: el comando es `npx @playwright/mcp@latest` (descarga en caliente) y **los binarios de navegador de Playwright no están instalados** (`~/.cache/ms-playwright` no existe, solo existe `ms-playwright-go` que es de otra herramienta) | Ejecutar `npx --yes @playwright/mcp@latest --version` una vez para precalentar la caché de npx, y `npx --yes playwright install chromium` para instalar el binario del navegador. Verificar reconexión. Si sigue en timeout tras esto, documentar y decidir mantener deshabilitado hasta necesitarlo. |
| `notebooklm-mcp` (entrada MCP manual en `.claude.json`, no es plugin) | El binario **sí existe y responde** (`notebooklm-mcp --help` funciona); el timeout de conexión no es por binario faltante. Posible causa: primer arranque lento, o requiere autenticación/configuración adicional (credenciales de Google NotebookLM) no verificada en esta sesión | Reintentar conexión en una sesión nueva con más margen; si persiste el timeout, revisar si requiere flags de configuración (`--host`, `--path`) o credenciales, y decidir mantener o retirar la entrada de `.claude.json`. |

### Consolidación de automatización de navegador

- Mantener: `claude-in-chrome` (extensión nativa de Chrome, uso general) y `playwright` (una vez arreglado, para testing pesado/repetitivo donde el snapshot de accesibilidad en texto es más barato en tokens que las capturas de pantalla).
- Eliminar: plugin `chrome-devtools-mcp` (deshabilitar en `settings.json`) y skill `agent-browser` (`~/.claude/skills/agent-browser/`, borrar el directorio) — ambos redundantes con lo anterior. `agent-browser` tiene 8 usos históricos; documentar en el handoff que las tareas de navegador ahora van por `claude-in-chrome` o `playwright`.

### Duplicados y huérfanos en el repo `CEINCA-AI-OS`

- `.claude/skills/requesting-code-review/` y `.claude/skills/verification-before-completion/`: **idénticos byte a byte** a las versiones del plugin global `superpowers` (mismo origen `obra/superpowers`, mismo hash de contenido). Eliminar los directorios locales y sus entradas en `skills-lock.json`. Cero riesgo — no hay divergencia que preservar.
- `.claude/skills/brainstorming/`: mismo origen (`obra/superpowers`) pero es una **captura antigua** (151 líneas, sin el sistema de 3 rutas — spike/bounded/architectural — que trae la versión actual del plugin global de 250 líneas). Al tener el mismo nombre que el skill global, un skill de proyecto shadowea al global, por lo que invocar "brainstorming" sin prefijo en este repo cargaría silenciosamente la versión vieja. Eliminar el directorio local y su entrada en `skills-lock.json` para que siempre se use la versión global actualizada.
- `/tdd` y `/e2e`: **ya resuelto, no requiere cambios de código.** El commit `f036662` (28 ago) eliminó ambos comandos de forma intencional y limpia (sin referencias colgando) porque solo invocaban agentes ya borrados. El skill `tdd-workflow` que dejó pendiente de evaluación **no está huérfano**: lo referencian activamente `.claude/rules/testing.md`, `.claude/rules/git-workflow.md` y el agente `.claude/agents/build-error-resolver.md`. Se activa automáticamente por su `description` cuando aplica — no necesita un comando explícito. Acción: documentar esta conclusión en `handoff.md` para cerrar el punto pendiente de la memoria del proyecto.

### Qué agregar para CEINCA

No se identificaron herramientas nuevas necesarias — el stack de conectores ya cubre marketing (Meta Ads, Google/Windsor, AdWhispr), contenido (Canva, Higgsfield, HeyGen), y operación (Notion, Gmail, Drive, Vercel, Supermetrics). La única adición real es el **arreglo del MCP de GitHub** (arriba), que habilita gestionar directamente desde Claude los PRs #18 y #19 pendientes en `CEINCA-AI-OS`.

## Verificación

- Tras cada cambio en `settings.json`: reiniciar sesión de Claude Code y confirmar con el listado de MCP servers fallidos que `github`, `playwright` (si se logra arreglar) ya no aparecen en la lista de errores, y que `telegram`, `greptile`, `serena`, `chrome-devtools-mcp` ya no están habilitados.
- Tras borrar skills duplicados del repo: `grep -rn "brainstorming\|requesting-code-review\|verification-before-completion" .claude/` no debe mostrar referencias rotas a los directorios eliminados.
- `git diff` y `git status` limpios antes de commitear los cambios del repo.

## Documentación final

Al terminar la implementación, añadir una entrada de checkpoint en `handoff.md` resumiendo: qué se arregló, qué se eliminó y por qué, y la conclusión sobre `/tdd`/`/e2e`/`tdd-workflow`.
