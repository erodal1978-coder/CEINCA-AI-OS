# handoff.md — CEINCA-AI-OS

> Este archivo es la memoria de continuidad entre sesiones de Claude Code.
> Al iniciar una sesión nueva: "Lee handoff.md y continúa desde los próximos pasos."
> Al cerrar una sesión: actualiza este archivo siguiendo las reglas de cada sección (ver abajo).

## 1. Objetivo
Construir y mantener el ecosistema CEINCA-AI-OS: skills propios (ceinca-design, ceinca-ia, ceinca-systems-social-growth), sistema de carruseles unificado, e IG Viral Tracker como único proyecto en producción.

## 2. Estado actual
- Sistema de 3 formatos de carrusel (paso a paso / alerta de riesgo / alerta noticiosa) mergeado a main (commits f2255cc..6a252ef).
- carrusel-export/ (pipeline Playwright → PNG) mergeado a main (#5, #6). Hasta esta sesión solo tenía implementado el formato "paso a paso" (cover/step/close); el formato "alerta noticiosa" (badge rojo + checklist ✅) estaba documentado en references/carrusel-alerta-noticiosa.md pero no wireado al export.
- Esta sesión: se agregó soporte a "alerta noticiosa" en carrusel-export/src/template.js vía flags opcionales (`urgent` en cover/close, `list: "check"` en step) sobre los mismos 3 tipos de lámina — sin romper compatibilidad con el JSON existente. Se generó y entregó el carrusel "Legalización de título — SAREN" (10 láminas, 1080×1440). Pendiente: PR aún no abierto para esta rama (`claude/saren-legalization-carousel-pxy5mb`), solo push.
- IG Viral Tracker: MVP backend + frontend activos.
- Skills vendorizados (ui-ux-pro-max, apple-design, animation-vocabulary) en .claude/skills/, trackeados con skills-lock.json.
- PR #4 (ui-ux-pro-max) ya fue mergeado a main (visto en el log de esta sesión: `Merge pull request #4 from .../install-pages-dependencies-ivov8k`) — la entrada de "próximos pasos" de la sesión anterior sobre este PR queda obsoleta.
- Pendiente: revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md (ya cargadas en CLAUDE.md).

## 3. Archivos y cambios (esta sesión)
<!-- Sobrescribir cada sesión. Usar rango de commits o `git diff --stat`, no resumen narrado. -->
Commit 2d1d6bc (branch claude/saren-legalization-carousel-pxy5mb, pusheado a origin):
```
 carrusel-export/README.md                          |  12 +-
 carrusel-export/input/saren-legalizacion-titulo.json | 126 +++++
 carrusel-export/src/template.js                    |  39 +++--
 3 files changed, 167 insertions(+), 10 deletions(-)
```

## 4. Intentos fallidos
<!-- NO BORRAR NINGUNA ENTRADA DE ESTA SECCIÓN. Solo agregar. -->
<!-- Si supera ~20 líneas, mover las más antiguas a handoff-archive.md (nunca eliminar). -->
- Se descartó 21st.dev (Magic MCP) para componentes — sustituido por el MCP oficial de shadcn. Motivo: preferencia por herramienta oficial/gratuita.
- Se descartó instalar gstack completo (setup de Garry Tan) — solo se importaron selectivamente /review, /cso, /qa, /ship, /land-and-deploy como skills vendorizados. Motivo: los roles de CEO/Estratega y Diseñador de gstack redundaban con ceinca-ia y ceinca-design.
- shadcn init falló por bloqueo de ui.shadcn.com en el proxy de egreso del entorno (403). Fix: cambiar "Network access" a Custom y agregar el dominio — NO intentar editar un archivo local de config, no existe.

## 5. Próximos pasos
1. Auditar el contenido real de la skill ui-ux-pro-max (de terceros) ya mergeada — no se auditó formalmente antes del merge de PR #4.
2. Revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md.
3. Decidir si se adapta algo de la guía "Carousel Code" (@emprendeconcata) al sistema ya existente.
4. Si se quiere usar el carrusel SAREN en producción: abrir PR de `claude/saren-legalization-carousel-pxy5mb` a main (no se creó porque no fue pedido explícitamente), y correr `node carrusel-export/src/render.js input/saren-legalizacion-titulo.json` de nuevo si el copy cambia (el output/ no se versiona, es gitignore).
5. carrusel-export aún no tiene componente propio para la lámina de cierre triple-CTA (cta-stack) de alerta noticiosa (sección 4 de carrusel-alerta-noticiosa.md) — solo se implementó badge-urgent + check-list. Agregarlo si un futuro carrusel de alerta noticiosa necesita las 3 CTAs simultáneas en vez de una sola.
