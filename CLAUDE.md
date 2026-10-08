# CLAUDE.md - CEINCA AI OS v2.0 OPERATIONAL CORE
# Asistente de Desarrollo Autónomo para Eduardo Rodríguez

## REGLAS DE COMPORTAMIENTO LOCAL
* Operas directo en el sistema de archivos de Linux Mint.
* Lee los módulos de `STRATEGY/` y `RULES/` antes de reescribir cualquier documento.
* Mantén un tono técnico y formal de alta ingeniería internamente en los archivos, pero hiper-persuasivo y viral cuando generes salidas para redes sociales.

## SISTEMA DE CONTENIDO VIRAL
* Para generar contenido para Instagram, consulta SIEMPRE:
  - `MARKETING/SISTEMA_VIRAL.md` — Fuente única de viralidad: NEAPS, mecanismos virales comprobados, hooks, guiones, estructura y estilos de carrusel, CTB, keywords, copy, automatización Meta, Meta Ads y checklist
  - `MARKETING/CTB_PALABRAS_DISRUPTIVAS.md` (keywords) y `MARKETING/MANUAL_COPY_META_TIKTOK.md` (textos)
  - `AGENTS/VIRAL_CONTENT_CREATOR.md` — Agente completo de generación de paquetes de contenido
* Cada post DEBE incluir: keyword disruptiva (una palabra = un recurso; se puede **reciclar** en el mismo tema con otro ángulo, y entonces no se crea una automatización nueva: solo se añade el post a la existente), CTB triple, copy estructurado, comentario fijado y automatización Meta activa.
* Proyecto de carruseles y posts: `MARKETING/PROYECTO_CARRUSELES/` (instrucciones + banco). Las mismas versiones se suben a Drive y a los proyectos de IA.
* Objetivo: Dominar el nicho mercantil/legal en Instagram LATAM.

## MÓDULOS DEL SISTEMA
* `.claude/skills/` — Skills CEINCA de Claude Code: `ceinca-design` (sistema visual), `ceinca-ia` (gemelo digital / copy / consultoría), `meta-ads-andromeda-expert`, `remotion-best-practices`, `no-ai-slop`. Las skills genéricas de diseño (impeccable, ui-ux-pro-max, etc.) están instaladas a nivel de Claude, no aquí.
* `AGENTS/` — Agentes especializados (AUDITOR_MERCANTIL, CONTENT_ENGINE, VIRAL_CONTENT_CREATOR, IG_AUDITOR).
* `KNOWLEDGE/` — Base de conocimiento técnico (SAREN, reconversiones, práctica mercantil).
* `MARKETING/` — Frameworks de contenido, copy, monetización y estrategia de ads.
* `MARKETING/COMPETENCIA/` — Base de conocimiento viva de competidores rastreados en la Biblioteca de Anuncios de Meta (nicho mercantil/legal/contable): un archivo por competidor con sus anuncios, ángulos y patrones. Ver `INDICE.md` de esa carpeta.
* `RULES/` — Anti-alucinación, estilo de redacción, razonamiento legal y política de evidencia.
* `STRATEGY/` — Audiencia y core del negocio.
* `PRODUCTION/` — Sistemas y workflows de producción audiovisual (Google Flow, OpenMontage).
* `docs/historico/` — Planes y specs de sesiones pasadas (solo referencia).

**Este repo es la FUENTE DE LA VERDAD de CEINCA para cualquier IA** (decisión de Eduardo, 04-10-2026): solo conocimiento reutilizable — manuales, reglas, workflows, prompts, skills. Nada de documentos de clientes, respaldos, entregables, archivos de webs ni herramientas de código:
* Documentación de trabajo y entregables → `~/CEINCA-WORKSPACE` (respaldo en Drive `CEINCA RESPALDO`).
* Herramientas de código (movidas el 04-10-2026): `~/repos/media-mvp`, `~/repos/video-export`, `~/repos/carrusel-export`, `~/repos/lexia-launch-video`, `~/repos/WEBKIT`.
* Respaldo de este repo: GitHub + copia en Drive `CEINCA RESPALDO/06 TECNOLOGIA/CEINCA-AI-OS`.

## POLÍTICA DE ASSETS
* GitHub es para código, conocimiento, configuración, prompts, documentación y fuentes pequeñas necesarias para reproducibilidad.
* NO almacenar vídeos, audios, renders ni archivos multimedia pesados en Git salvo excepción explícita.
* Los archivos temporales de edición deben vivir fuera del repositorio y entrar únicamente como inputs de trabajo cuando sea necesario.
* Los outputs finales deben almacenarse en el sistema de distribución/almacenamiento correspondiente, no como binarios pesados versionados en Git.

## PROTOCOLO DE CIERRE DE SESIÓN (handoff.md)

Al final de CADA sesión de trabajo en este repo, sin excepción y sin que el usuario lo pida explícitamente,
actualiza `handoff.md` en la raíz del proyecto siguiendo estas reglas:

- Secciones 1, 2, 3 y 5 (Objetivo, Estado actual, Archivos y cambios, Próximos pasos): se sobrescriben con el estado real al cierre.
- Sección 3 (Archivos y cambios): lista el rango de commits de esta sesión o el output de `git diff --stat`. Nunca un resumen narrado que pueda desalinearse del código real.
- Sección 4 (Intentos fallidos): SOLO se agrega. Nunca se reescribe ni se resume una entrada existente.
  Si la sección supera ~20 líneas, mueve las entradas más antiguas a `handoff-archive.md` (nunca las elimines).

Al inicio de una sesión nueva, si el usuario dice "lee handoff.md y continúa", lee el archivo completo
antes de proponer cualquier siguiente paso.
