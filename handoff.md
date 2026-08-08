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
- **NUEVO — primer entregable de vídeo del repo:** promocional de Casa & Campo Barinas
  (alquiler exclusivo para promociones, caso U.E. Roberto Moreno 2026) en
  `CLIENTS/casacampobarinas1/PROMO_VIDEO_2026/`. Montaje 9:16 de 30.9 s construido con
  ffmpeg + Python a partir de 5 clips de WhatsApp, con música original sintetizada.
  Se entregan dos versiones (MASTER con música para ads, SIN_MUSICA para audio de
  tendencia en orgánico) y los scripts de build son reproducibles.

## 3. Archivos y cambios (esta sesión)
<!-- Sobrescribir cada sesión. Usar rango de commits o `git diff --stat`, no resumen narrado. -->
`git diff --stat` de la sesión:

```
 .../CASA_CAMPO_Promo_2026_MASTER.mp4               | Bin 0 -> 28896318 bytes
 .../CASA_CAMPO_Promo_2026_SIN_MUSICA.mp4           | Bin 0 -> 28856157 bytes
 .../CASA_CAMPO_pista_original_120bpm.mp3           | Bin 0 -> 743085 bytes
 .../PROMO_VIDEO_2026/CASA_CAMPO_portada.jpg        | Bin 0 -> 240274 bytes
 .../casacampobarinas1/PROMO_VIDEO_2026/README.md   | 225 +++++++++++++
 .../PROMO_VIDEO_2026/build/build_endcard.sh        |  38 +++
 .../PROMO_VIDEO_2026/build/build_mix.sh            |  94 ++++++
 .../PROMO_VIDEO_2026/build/build_music.py          | 364 +++++++++++++++++++++
 .../PROMO_VIDEO_2026/build/build_video.py          | 266 +++++++++++++++
 .../PROMO_VIDEO_2026/build/tp_limit.py             | 153 +++++++++
 handoff.md                                         |  30 +-
 11 files changed, 1169 insertions(+), 1 deletion(-)
```

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

## 5. Próximos pasos
1. Revisar PR #4 (ui-ux-pro-max): confirmar si necesita rebase contra main.
2. Auditar el contenido real de la skill ui-ux-pro-max (de terceros) antes de mergear.
3. Revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md.
4. Decidir si se adapta algo de la guía "Carousel Code" (@emprendeconcata) al sistema ya existente.
5. Casa & Campo: publicar el Reel y medir. Pedir material nuevo grabado en vertical 1080p
   (por Drive, NO por WhatsApp) — faltan planos de día, de comida llanera y caras en
   primer plano para una segunda versión del promocional.
6. Evaluar `git-lfs` para el repo: este entregable añadió ~58 MB de binarios y CLIENTS/
   va a seguir acumulando vídeo.
