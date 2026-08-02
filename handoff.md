# handoff.md — CEINCA-AI-OS

> Este archivo es la memoria de continuidad entre sesiones de Claude Code.
> Al iniciar una sesión nueva: "Lee handoff.md y continúa desde los próximos pasos."
> Al cerrar una sesión: actualiza este archivo siguiendo las reglas de cada sección (ver abajo).

## 1. Objetivo
Construir y mantener el ecosistema CEINCA-AI-OS: skills propios (ceinca-design, ceinca-ia, ceinca-systems-social-growth), sistema de carruseles unificado, e IG Viral Tracker como único proyecto en producción.

## 2. Estado actual
- **Video UDS "Cierre de Semestre 2026", dos versiones renderizadas** en `assets/uds-video/`:
  - v1 `UDS_Cierre_Semestre_2026.mp4` (43.4 s) — con tarjeta de apertura y texto sobre los bloques 2 y 3.
  - v2 `UDS_Cierre_Semestre_2026_v2.mp4` (44.4 s) — corte limpio: montaje sin nada superpuesto y todo el texto/logo en la tarjeta final.
  Ambas 1080x1920, H.264 High, ~9.1-9.5 Mbps, 30 fps, AAC 192 kbps a 48 kHz. Pipelines reproducibles en `PRODUCTION/uds-video/render.sh` y `render_v2.sh`.
- Sistema de 3 formatos de carrusel (paso a paso / alerta de riesgo / alerta noticiosa) mergeado a main (commits f2255cc..6a252ef).
- IG Viral Tracker: MVP backend + frontend activos.
- Skills vendorizados (ui-ux-pro-max, apple-design, animation-vocabulary) en .claude/skills/, trackeados con skills-lock.json.
- PR #4 (ui-ux-pro-max) abierto, pendiente de rebase — main avanzó 3 merges desde que se abrió.
- Pendiente: revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md (ya cargadas en CLAUDE.md).

## 3. Archivos y cambios (esta sesión)
<!-- Sobrescribir cada sesión. Usar rango de commits o `git diff --stat`, no resumen narrado. -->
Rama `claude/ceinca-semester-video-zls5j5`, `git diff --stat` contra 6023f67:

```
 PRODUCTION/uds-video/README.md                |  76 ++++++++++++
 PRODUCTION/uds-video/build_cards.py           | 131 +++++++++++++++++++++
 PRODUCTION/uds-video/build_logo.py            |  78 +++++++++++++
 PRODUCTION/uds-video/render.sh                | 160 ++++++++++++++++++++++++++
 assets/uds-video                              |   1 -
 assets/uds-video/UDS_Cierre_Semestre_2026.mp4 | Bin 0 -> 52498683 bytes
 assets/uds-video/card_close.png               | Bin 0 -> 314596 bytes
 assets/uds-video/card_open.png                | Bin 0 -> 333335 bytes
 assets/uds-video/logo_emblem.png              | Bin 0 -> 195628 bytes
 assets/uds-video/logo_final.png               | Bin 0 -> 235664 bytes
 assets/uds-video/logo_final_reverse.png       | Bin 0 -> 200896 bytes
 assets/uds-video/text_block2.png              | Bin 0 -> 51558 bytes
 assets/uds-video/text_block3.png              | Bin 0 -> 20634 bytes
 13 files changed, 445 insertions(+), 1 deletion(-)
```

## 4. Intentos fallidos
<!-- NO BORRAR NINGUNA ENTRADA DE ESTA SECCIÓN. Solo agregar. -->
<!-- Si supera ~20 líneas, mover las más antiguas a handoff-archive.md (nunca eliminar). -->
- Se descartó 21st.dev (Magic MCP) para componentes — sustituido por el MCP oficial de shadcn. Motivo: preferencia por herramienta oficial/gratuita.
- Se descartó instalar gstack completo (setup de Garry Tan) — solo se importaron selectivamente /review, /cso, /qa, /ship, /land-and-deploy como skills vendorizados. Motivo: los roles de CEO/Estratega y Diseñador de gstack redundaban con ceinca-ia y ceinca-design.
- shadcn init falló por bloqueo de ui.shadcn.com en el proxy de egreso del entorno (403). Fix: cambiar "Network access" a Custom y agregar el dominio — NO intentar editar un archivo local de config, no existe.
- Video UDS: el `colorkey` de ffmpeg a secas perfora los blancos INTERIORES del logo (la figura del atleta y las estrellas del escudo), no solo el fondo. Ningún threshold lo resuelve: son el mismo blanco. Fix aplicado en `build_logo.py` — tras el colorkey, dejar transparente solo la región blanca conectada al borde (flood fill con `scipy.ndimage.label`).
- Video UDS: el crop duro a 1080x1920 pedido en el brief es inviable con este material — 30 de las 40 fotos son apaisadas y el recorte centrado conserva solo el ~34% del ancho, partiendo a los docentes. Se sustituyó por encaje del fotograma completo sobre fondo desenfocado de la propia foto. Ver PRODUCTION/uds-video/README.md.
- Video UDS: en el entorno remoto no hay ffmpeg ni fuentes Montserrat preinstaladas. `apt-get install ffmpeg` falla si no se corre `apt-get update` antes (404 en los .deb). Montserrat se obtiene convirtiendo los woff2 de `carrusel-export/assets/fonts/` a TTF con fontTools.

## 5. Próximos pasos
1. Elegir entre v1 y v2 del video UDS, y confirmar las decisiones documentadas en `PRODUCTION/uds-video/README.md` (encuadre contain vs crop; emblema vs logo completo en las tarjetas). Confirmar también si son 39 o 40 las fotos que van — hay 40 archivos distintos en `assets/`.
2. Revisar PR #4 (ui-ux-pro-max): confirmar si necesita rebase contra main.
3. Auditar el contenido real de la skill ui-ux-pro-max (de terceros) antes de mergear.
4. Revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md.
5. Decidir si se adapta algo de la guía "Carousel Code" (@emprendeconcata) al sistema ya existente.
