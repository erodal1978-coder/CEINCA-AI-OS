# Integración Agy (Antigravity/Gemini CLI) con CEINCA-AI-OS

## Corrección de premisa (13-09-2026)

El plan `docs/superpowers/plans/2026-09-12-reorg-agy-claude-unificado.md` (Task 12)
asumía que existía `~/.gemini/antigravity-cli/config.json` con una clave
`trustedWorkspaces` para autorizar carpetas de forma persistente. Verificado
en esta sesión que **eso no existe**: el config real vive en
`~/.gemini/config/config.json` y solo contiene `userSettings.remoteControlHostname`.
No hay ningún mecanismo de "workspace de confianza" persistente en esta
instalación de Agy — el acceso a directorios se concede **por invocación**,
vía los wrappers de `~/.local/bin/`.

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
