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
- **Tercer vídeo:** Reel de la bienvenida sorpresa a Angelo (regreso de España)
  en `CLIENTS/casacampobarinas1/VIDEO_ANGELO/`. 18,0 s, 5 planos (uno por clip,
  ninguno repetido), rejilla de 90 BPM, J-cut/L-cut sobre el mariachi real,
  música original en Re mayor con hueco deliberado para ese mariachi, y placa
  de cierre con el logo animado (compuesto cuadro a cuadro en numpy). Keyword:
  **EVENTO**. Fuentes en `Videos/Assets/` (llegaron a main durante la sesión).
- **Segundo vídeo:** anuncio de hospedaje en
  `CLIENTS/casacampobarinas1/VIDEO_HOSPEDAJE/`. 21,5 s, 9 planos sobre metraje de
  7 vídeos + 3 fotos, estabilizado con vidstab, música original tropical/chill a
  100 BPM. Incluye a Daniela Deximar León (Reina del Turismo de Barinas),
  acreditada en pantalla. Keyword de embudo: **HOSPEDAJE** (requiere su propia
  automatización Meta; el bloque listo para pegar está en su README).
- **Primer entregable de vídeo del repo:** promocional de Casa & Campo Barinas
  (alquiler exclusivo para promociones, caso U.E. Roberto Moreno 2026) en
  `CLIENTS/casacampobarinas1/PROMO_VIDEO_2026/`. Montaje 9:16 de 30.9 s construido con
  ffmpeg + Python a partir de 5 clips de WhatsApp, con música original sintetizada.
  Se entregan dos versiones (MASTER con música para ads, SIN_MUSICA para audio de
  tendencia en orgánico) y los scripts de build son reproducibles.

## 3. Archivos y cambios (esta sesión)
<!-- Sobrescribir cada sesión. Usar rango de commits o `git diff --stat`, no resumen narrado. -->
Commits de la sesión: `80e1c8d..HEAD`.

```
 .../CASA_CAMPO_Promo_2026_MASTER.mp4               | Bin 0 -> 28880742 bytes
 .../CASA_CAMPO_Promo_2026_SIN_MUSICA.mp4           | Bin 0 -> 28840581 bytes
 .../CASA_CAMPO_pista_original_120bpm.mp3           | Bin 0 -> 743085 bytes
 .../PROMO_VIDEO_2026/CASA_CAMPO_portada.jpg        | Bin 0 -> 240274 bytes
 .../casacampobarinas1/PROMO_VIDEO_2026/README.md   | 225 +++++++++++++
 .../PROMO_VIDEO_2026/build/build_endcard.sh        |  38 +++
 .../PROMO_VIDEO_2026/build/build_mix.sh            |  94 ++++++
 .../PROMO_VIDEO_2026/build/build_music.py          | 364 +++++++++++++++++++++
 .../PROMO_VIDEO_2026/build/build_video.py          | 269 +++++++++++++++
 .../PROMO_VIDEO_2026/build/tp_limit.py             | 153 +++++++++
 .../CASA_CAMPO_Angelo_Bienvenida_MASTER.mp4        | Bin 0 -> 17540936 bytes
 .../CASA_CAMPO_Angelo_Bienvenida_SIN_MUSICA.mp4    | Bin 0 -> 17424375 bytes
 .../VIDEO_ANGELO/CASA_CAMPO_Angelo_portada.jpg     | Bin 0 -> 276821 bytes
 CLIENTS/casacampobarinas1/VIDEO_ANGELO/README.md   | 182 +++++++++++
 .../VIDEO_ANGELO/build/build_angelo_cta.py         | 181 ++++++++++
 .../VIDEO_ANGELO/build/build_angelo_mix.sh         | 114 +++++++
 .../VIDEO_ANGELO/build/build_angelo_music.py       | 251 ++++++++++++++
 .../VIDEO_ANGELO/build/build_angelo_video.py       | 186 +++++++++++
 .../VIDEO_ANGELO/build/tp_limit.py                 | 153 +++++++++
 .../CASA_CAMPO_Hospedaje_MASTER.mp4                | Bin 0 -> 19375777 bytes
 .../CASA_CAMPO_Hospedaje_SIN_MUSICA.mp4            | Bin 0 -> 19055973 bytes
 .../CASA_CAMPO_Hospedaje_portada.jpg               | Bin 0 -> 362197 bytes
 .../CASA_CAMPO_pista_hospedaje_100bpm.mp3          | Bin 0 -> 517293 bytes
 .../casacampobarinas1/VIDEO_HOSPEDAJE/README.md    | 238 ++++++++++++++
 .../VIDEO_HOSPEDAJE/build/build_hab_endcard.sh     |  38 +++
 .../VIDEO_HOSPEDAJE/build/build_hab_mix.sh         |  69 ++++
 .../VIDEO_HOSPEDAJE/build/build_hab_music.py       | 296 +++++++++++++++++
 .../VIDEO_HOSPEDAJE/build/build_hab_video.py       | 302 +++++++++++++++++
 .../VIDEO_HOSPEDAJE/build/tp_limit.py              | 153 +++++++++
 .../Assets/Logo IG Nuevo_20260819_130946_0000.png  | Bin 0 -> 136008 bytes
 Videos/Assets/VID-20260804-WA0100.mp4              | Bin 0 -> 14566476 bytes
 Videos/Assets/VID-20260804-WA0104.mp4              | Bin 0 -> 15681105 bytes
 Videos/Assets/VID-20260804-WA0138.mp4              | Bin 0 -> 1912424 bytes
 Videos/Assets/VID-20260804-WA0139.mp4              | Bin 0 -> 2802918 bytes
 Videos/Assets/VID-20260811-WA0150.mp4              | Bin 0 -> 1303558 bytes
 handoff.md                                         |  76 ++++-
 36 files changed, 3381 insertions(+), 1 deletion(-)
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
- Al hacer hojas de contacto con `fps=8/dur` y etiquetar con `%{eif:t*(dur/8)}`, la etiqueta NO es el tiempo real del clip: sale escalada. Lo mismo con `-ss X` + `fps=2` y etiqueta `X+t/2`, que comprime los tiempos a la mitad. Consecuencia: se eligieron mal los puntos de entrada de varios planos. Fix: extraer frames sueltos con un `-ss` explícito por frame y etiquetar con ese valor.
- `onepole_lp` con cutoff vectorial (barrido de filtro) revienta si se hace `float(np.exp(...))`. Fix: ramificar según `a.ndim`.
- El montaje del vídeo de hospedaje se probó primero con 4 fotos fijas: quedaba plano y con demasiadas tomas seguidas de la lencería de corazones. Se descartó al llegar el metraje en vídeo. También se descartó el plano de "sala de estar": la cámara apunta al techo inclinado y el sujeto queda siempre en el borde inferior, no hay encuadre rescatable ni con anclaje bajo.
- Se descartó el término "HABITACIÓN" como concepto y keyword (criterio de Alirio): no son cuartos separados sino chalet/cabaña y el cobro es por persona, así que invitaba a preguntar el precio por cuarto. Sustituido por "HOSPEDAJE" en pantalla, copy, keyword y nombre de carpeta. También se cambió "VISTA AL VERDE" por "VISTA A LA PISCINA": al salir al balcón lo primero que se ve son las piscinas.
- Crédito de talento en blanco sobre bata blanca: la sombra sola no daba contraste. Fix: `borderw=4` negro además de la sombra.
- `Videos/Assets/` estaba vacío en la copia local (sólo un .txt con la palabra "Readme"): los 5 clips de Angelo y el logo se habían subido a main durante la sesión. Fix: `git fetch origin main` + `git checkout origin/main -- "Videos/Assets/"`. Antes de dar por inexistente un archivo que el usuario dice tener, refrescar main.
- `vidstabtransform` con `smoothing` alto obliga a `optzoom` a recortar mucho y se pierde el encuadre (un abrazo quedó convertido en un primer plano de tela). Fix: bajar `smoothing` de 26 a 15.
- ffmpeg NO puede animar `scale` (evalúa `w`/`h` una sola vez), así que un logo con rebote no se puede hacer sólo con filtros. Fix: componer los frames en numpy y mandarlos a ffmpeg por tubería; el texto sí lo pone ffmpeg encima.
- Se descartó Remotion para la placa de cierre: exigía Node, el paquete y el render de Chromium para 4 s de animación. La composición directa en numpy da un resultado equivalente sin dependencias.

## 5. Próximos pasos
1. Revisar PR #4 (ui-ux-pro-max): confirmar si necesita rebase contra main.
2. Auditar el contenido real de la skill ui-ux-pro-max (de terceros) antes de mergear.
3. Revisar reglas activas en VIRAL_CONTENT_CREATOR.md, IG_AUDITOR.md, FRAMEWORK_VIRAL_V2.md.
4. Decidir si se adapta algo de la guía "Carousel Code" (@emprendeconcata) al sistema ya existente.
5. Casa & Campo: publicar el Reel y medir. Pedir material nuevo grabado en vertical 1080p
   (por Drive, NO por WhatsApp) — faltan planos de día, de comida llanera y caras en
   primer plano para una segunda versión del promocional.
6. Los `.mp4`/`.mp3` renderizados ya NO se versionan: están en `.gitignore` y los
   másteres se entregan por Drive. En el repo sólo va la receta (scripts + copy),
   que los regenera exactos desde `Videos/Assets/`. Pendiente decidir si algún día
   se purga del historial de main lo que entró con el PR #8 (~58 MB), cosa que
   exige reescribir historial y volver a clonar.
7. Casa & Campo hospedaje: crear la automatización Meta de HOSPEDAJE antes de
   publicar. NO reutilizar CHAPUZÓN/HAMACA/COROCORO: sus DM dicen "10am a 7pm",
   lo que contradice una oferta de hospedaje.
8. ~~Confirmar WiFi~~ — CONFIRMADO por el cliente, la mención se mantiene.
9. Pedir fotos/vídeo del BAÑO — es la primera pregunta de quien va a dormir fuera
   y no hay ni una toma.
10. ~~Pedir el IG de Daniela~~ — es @daniela_deximar. Ojo: su bio dice "Reina de
    la Cultura y el Turismo 2025", no "Reina del Turismo de Barinas" como se
    había puesto. Corregido en pantalla y en el copy.
11. Corregir la errata del logo: dice "El Placer de Sentirse bién", va sin tilde.
12. Confirmar el parentesco de las personas del Reel de Angelo si se quiere
    etiquetarlas en pantalla (ahora los captions no identifican a nadie).
13. Sigue pendiente material del BAÑO para el vídeo de hospedaje.
14. Los borrados de `assets/` en esta rama están OK: el cliente confirma que esa
    carpeta sólo guardaba archivos de trabajo para edición y no hacen falta.
