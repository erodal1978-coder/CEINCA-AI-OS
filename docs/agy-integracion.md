# Integración Agy (Antigravity/Gemini CLI) con CEINCA-AI-OS

## Corrección de premisa (13-09-2026, corregida de nuevo el mismo día)

El plan `docs/superpowers/plans/2026-09-12-reorg-agy-claude-unificado.md` (Task 12)
asumía que existía `~/.gemini/antigravity-cli/config.json` con una clave
`trustedWorkspaces`. Ese archivo exacto (`config.json`) en efecto no la tiene
— solo contiene `userSettings.remoteControlHostname`.

**Corrección real (misma sesión, verificado en vivo con una prueba real de
`agy -p` en modo no interactivo):** el mecanismo SÍ existe, pero vive en OTRO
archivo que se pasó por alto la primera vez — `~/.gemini/antigravity-cli/settings.json`:

```json
{
  "allowNonWorkspaceAccess": true,
  "enableTerminalSandbox": true,
  "permissions": { "allow": [ /* comandos y llamadas MCP específicas ya aprobadas antes */ ] },
  "trustedWorkspaces": ["/home/eduardo", "/home/eduardo/CEINCA-AI-OS"]
}
```

- `trustedWorkspaces` ya incluye `/home/eduardo` completo (!) y `CEINCA-AI-OS`
  — no `CEINCA-WORKSPACE` todavía. Agregarlo requiere editar este archivo;
  el clasificador de seguridad de Claude Code bloqueó ese cambio automático
  por tratarse de "Unauthorized Persistence" (ampliar la autonomía de otro
  agente) — Eduardo debe hacerlo él mismo o autorizarlo explícitamente.
- `permissions.allow` es un mecanismo DISTINTO y más fino: una lista de
  comandos/llamadas MCP exactas ya aprobadas una vez (ej. un `find` literal,
  `cat` a secas, 2 llamadas MCP de Canva) — no hay ninguna entrada para
  `write_file`, de ahí el hallazgo siguiente.
- **Hallazgo real y más importante que el nombre del archivo**: en modo
  headless (`agy --print`/`-p`, sin humano presente), cualquier tool que
  requiera aprobación de permiso (como `write_file`) se **autodeniega sin
  preguntar** — el CLI no tiene forma de mostrar el prompt de aprobación. Un
  intento de prueba en vivo de un `agy-task` con escritura, corrido en `-p`
  para automatizarlo, no produjo ningún output por esto exacto. Esto confirma
  que `agy-continue`/`agy-task` están bien diseñados al usar
  `--prompt-interactive` en vez de `--print`: las tareas de escritura real
  necesitan a Eduardo presente en su propia terminal para aprobar permisos
  a medida que Agy trabaja — no es automatizable de punta a punta sin él,
  por diseño de seguridad del propio Agy, no por una limitación de estos
  wrappers.

## Cómo Agy accede realmente al filesystem

- **`agy-diagnose "<tarea>"`** (solo lectura, uso normal/automático vía el hook
  de SessionStart): envuelve el binario `agy` en `bwrap` con
  `--ro-bind / /` — monta **todo el filesystem en modo solo lectura**,
  incluyendo `CEINCA-AI-OS` sin necesitar ninguna autorización adicional.
  Solo `~/.gemini` (estado propio de Agy) y un `/tmp` efímero (tmpfs) quedan
  escribibles. Agy YA puede leer `CEINCA-AI-OS` con este wrapper, hoy, sin
  cambios de config.
- **`agy-continue <ruta-proyecto>`** (toma de relevo manual, con confirmación
  explícita de Eduardo — corte eléctrico o fin de tokens de Claude): pasa
  `--add-dir "$PROJECT"` al binario `agy` real (sin sandbox de `bwrap`,
  fuera del alcance de `agy-diagnose`). **Guarda ya existente** (bug corregido
  el 12-09-2026): rechaza `PROJECT == $HOME` — `--add-dir` sobre el home
  completo hace que Agy escanee un árbol enorme, se atasque y pierda el
  prompt de relevo. Para retomar trabajo de `CEINCA-AI-OS`, invocar como
  `agy-continue /home/eduardo/CEINCA-AI-OS` (o una subcarpeta específica),
  **nunca** `agy-continue /home/eduardo`.

## Qué comparte Agy con Claude Code, y qué no

- `KNOWLEDGE/`, `RULES/`, `AGENTS/` de `CEINCA-AI-OS` son markdown puro →
  consumibles directamente por Agy en cualquiera de los dos modos de arriba,
  sin adaptación.
- `.claude/skills/` y `.claude/agents/` usan el formato de Skill/Agent de
  Claude Code → Agy (Gemini CLI) **no los interpreta nativamente** (tiene su
  propio sistema de skills en `~/.gemini/antigravity-cli/builtin/skills`,
  formato distinto). Un puente/traducción de formato queda fuera de alcance
  de esta integración — es una fase de investigación aparte, no prometer
  paridad de herramientas, solo de conocimiento en texto plano.

## Regla no negociable

**Nunca** usar `--add-dir` (ni ningún mecanismo equivalente futuro) apuntando
a `$HOME` completo. Siempre una ruta específica dentro de él —
`/home/eduardo/CEINCA-AI-OS` para este árbol de conocimiento compartido, o el
proyecto puntual que corresponda a la tarea.
