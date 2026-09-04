# CEINCA-AI-OS — Antigravity

## Continuidad entre agentes

Este repositorio usa `handoff.md` como registro persistente del estado de trabajo entre sesiones y agentes.

Antes de continuar trabajo iniciado por otro agente:

1. Lee `handoff.md`.
2. Verifica el estado real del repositorio con `git status`.
3. Verifica la rama actual y los commits recientes.
4. Contrasta Git con el contenido de `handoff.md`.
5. Identifica el siguiente paso concreto pendiente.
6. No repitas tareas marcadas como completadas sin comprobarlas.
7. No reviertas cambios existentes sin evidencia.

## Reglas de ejecución

- Respeta `CLAUDE.md` cuando contenga información de arquitectura, estructura o reglas aplicables al proyecto.
- No trates la conversación de Claude Code como memoria disponible: la continuidad entre agentes se obtiene de los archivos reales, Git y `handoff.md`.
- No uses `--dangerously-skip-permissions`.
- No elimines archivos, ramas, configuración ni historial Git sin verificar primero su función.

## Cierre

Al completar una tarea:

1. Verifica el resultado real.
2. Ejecuta `git status`.
3. Revisa los cambios realizados.
4. Actualiza `handoff.md` siguiendo su estructura existente.
5. No declares completada una tarea que Git, pruebas o verificación contradigan.
