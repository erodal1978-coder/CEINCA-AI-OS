# CLAUDE.md - CEINCA AI OS v2.0 OPERATIONAL CORE
# Asistente de Desarrollo Autónomo para Eduardo Rodríguez

## REGLAS DE COMPORTAMIENTO LOCAL
* Operas directo en el sistema de archivos de Linux Mint.
* Lee los módulos de `STRATEGY/` y `RULES/` antes de reescribir cualquier documento.
* Mantén un tono técnico y formal de alta ingeniería internamente en los archivos, pero hiper-persuasivo y viral cuando generes salidas para redes sociales.

## SISTEMA DE CONTENIDO VIRAL
* Para generar contenido para Instagram, consulta SIEMPRE:
  - `MARKETING/FRAMEWORK_VIRAL_V2.md` — Estructura de slides, CTB, keywords disruptivas, automatización Meta
  - `MARKETING/VIRAL_PLAYBOOK.md` — Hooks, guiones, triggers emocionales, plantillas, ads
  - `AGENTS/VIRAL_CONTENT_CREATOR.md` — Agente completo de generación de paquetes de contenido
* Cada post DEBE incluir: keyword disruptiva única, CTB triple, copy estructurado, comentario fijado, y automatización Meta configurada.
* Objetivo: Dominar el nicho mercantil/legal en Instagram LATAM.

## MÓDULOS DEL SISTEMA
* `AGENTS/` — Agentes especializados (AUDITOR_MERCANTIL, CONTENT_ENGINE, VIRAL_CONTENT_CREATOR, IG_AUDITOR)
* `KNOWLEDGE/` — Base de conocimiento técnico (SAREN, reconversiones, práctica mercantil)
* `MARKETING/` — Frameworks de contenido, monetización, estrategia de ads
* `RULES/` — Anti-alucinación, razonamiento legal
* `STRATEGY/` — Audiencia, core del negocio
* `CLIENTS/` — Carpetas por cliente con auditorías, contenido generado y seguimiento
* `ig-viral-tracker/` — Sistema de rastreo de posts virales en Instagram con IA

## Protocolo de cierre de sesión (handoff.md)

Al final de CADA sesión de trabajo en este repo, sin excepción y sin que el usuario lo pida explícitamente,
actualiza `handoff.md` en la raíz del proyecto siguiendo estas reglas:

- Secciones 1, 2, 3 y 5 (Objetivo, Estado actual, Archivos y cambios, Próximos pasos): se sobrescriben con el estado real al cierre.
- Sección 3 (Archivos y cambios): lista el rango de commits de esta sesión o el output de `git diff --stat`. Nunca un resumen narrado que pueda desalinearse del código real.
- Sección 4 (Intentos fallidos): SOLO se agrega. Nunca se reescribe ni se resume una entrada existente.
  Si la sección supera ~20 líneas, mueve las entradas más antiguas a `handoff-archive.md` (nunca las elimines).

Al inicio de una sesión nueva, si el usuario dice "lee handoff.md y continúa", lee el archivo completo
antes de proponer cualquier siguiente paso.
