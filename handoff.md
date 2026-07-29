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
- Pendiente: revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md (ya cargadas en CLAUDE.md).

## 3. Archivos y cambios (esta sesión)
<!-- Sobrescribir cada sesión. Usar rango de commits o `git diff --stat`, no resumen narrado. -->
- (pendiente de la próxima sesión de trabajo real)

## 4. Intentos fallidos
<!-- NO BORRAR NINGUNA ENTRADA DE ESTA SECCIÓN. Solo agregar. -->
<!-- Si supera ~20 líneas, mover las más antiguas a handoff-archive.md (nunca eliminar). -->
- Se descartó 21st.dev (Magic MCP) para componentes — sustituido por el MCP oficial de shadcn. Motivo: preferencia por herramienta oficial/gratuita.
- Se descartó instalar gstack completo (setup de Garry Tan) — solo se importaron selectivamente /review, /cso, /qa, /ship, /land-and-deploy como skills vendorizados. Motivo: los roles de CEO/Estratega y Diseñador de gstack redundaban con ceinca-ia y ceinca-design.
- shadcn init falló por bloqueo de ui.shadcn.com en el proxy de egreso del entorno (403). Fix: cambiar "Network access" a Custom y agregar el dominio — NO intentar editar un archivo local de config, no existe.

## 5. Próximos pasos
1. Revisar PR #4 (ui-ux-pro-max): confirmar si necesita rebase contra main.
2. Auditar el contenido real de la skill ui-ux-pro-max (de terceros) antes de mergear.
3. Revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md.
4. Decidir si se adapta algo de la guía "Carousel Code" (@emprendeconcata) al sistema ya existente.
