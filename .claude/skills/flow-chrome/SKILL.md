---
name: flow-chrome
description: Operar Google Flow desde la extensión de Chrome de Claude (flow.google.com) para generar, descargar, evaluar, encadenar y unir clips de video e imagen controlando los créditos. Usar cuando se pida generar videos o imágenes en Flow, descargar clips, unir escenas, continuar una escena con el último fotograma o evaluar clips de Flow. Borrador v0.1 (17-10-2026), medido en cuenta PRO; falta probar en cuenta gratuita.
---

# Flow desde la extensión de Chrome (CEINCA) — v0.1

Fuente completa: `PRODUCTION/FLOW_MANUAL_BASICO_AVANZADO.md` y el catálogo `03 FORMACION/CURSO FLOW/CATALOGO_FUNCIONES_FLOW.md` (CEINCA-WORKSPACE). Reglas de prompt: `PRODUCTION/FLOW_SISTEMA.md`.

## 0. Reglas de seguridad (siempre)
1. **Cada envío gasta créditos.** Antes de enviar: leer modelo y «La generación usará N créditos» y compararlos con lo esperado. Omni 1.1 Flash, 720p, 8 s, 9:16, x1 = 12. Si no coincide, **no enviar**.
2. Cantidad **x1** por defecto. x2-x4 multiplican el costo.
3. **No pulsar** la flecha del editor de clip (edición por prompt = 40 créditos) salvo orden expresa.
4. No usar Veo Quality (100) ni x2+ sin confirmación del usuario.
5. No borrar elementos de Flow ni de la papelera sin orden.
6. Las URL de los videos están firmadas: las herramientas las bloquean; **no intentar sacarlas**. Descargar desde el menú de Flow.
7. Si algo falla 2-3 veces, parar y preguntar.

## 1. Leer el estado (sin gastar)
- `javascript_tool`: abrir el chip «Video · 720p · 8 s …», leer el modelo (botón con `arrow_drop_down`) y `document.body.innerText.match(/usará\s*(\d+)\s*créditos/)`; cerrar el chip.
- Saldo: clic en la foto de perfil (arriba a la derecha): «N créditos de Google Flow».
- Los botones del popover tienen texto exacto («Fotogramas», «Ingredientes», «720p», «8 s», «x1»): hacer clic con JS por texto exacto (cuidado: el chip también termina en «x1»).

## 2. Escribir el prompt (método fiable)
- **No usar `computer.type`** en el cuadro de Flow: corrompe el inicio y el final.
- Usar `javascript_tool`:
  `el=document.querySelector('[role=textbox], textarea, [contenteditable=true]'); el.focus(); document.execCommand('selectAll'); document.execCommand('insertText',false,TEXTO);`
  y verificar `texto === TEXTO` antes de enviar.
- Enviar: botón con `arrow_forward` (si está `disabled`, no hay texto válido).
- Frase de voz: 12-15 palabras para 8 s (con 16 se corta). Prohibir de forma explícita texto/números en pantalla. Añadir «con dicción clara» para palabras técnicas.

## 3. Esperar y localizar el clip
- La tarjeta aparece a la izquierda con un %. Omni 8 s tarda ≈ 1-3 min. Si la tarjeta desaparece, la generación falló: reenviar.
- `find` para listar tarjetas (el título está en inglés, generado por Flow). **Abrir el editor con doble clic** sobre la tarjeta (un clic simple a veces no navega).
- Dentro del editor, la **tira de miniaturas** (arriba, centro) salta a otro clip sin volver a la cuadrícula; el orden es el mismo que en la cuadrícula.

## 4. Descargar
- Editor → icono de descarga → **1080p «Reescalado»** (solo suscriptores; sin suscripción: 720p «Tamaño original»). 270p = GIF.
- Tarda ≈ 35-80 s (Flow muestra «Reescalando el video…»): **un reescalado a la vez**.
- El archivo cae en la carpeta de descargas de Chrome (en este equipo, `flow-clips/` del proyecto) con nombre `<título>_<res>_<fecha>.mp4`. Esperar hasta 90 s, renombrar a `F#-C#.mp4` y verificar resolución con `ffprobe`.
- Requisito: Chrome con «Preguntar ubicación antes de descargar» **desactivado** (si no, aparece un diálogo nativo que solo una persona puede aceptar).

## 5. Evaluar un clip (siempre antes de aprobar)
`ffmpeg -vn -ac 1 -ar 16000` → Whisper `small` con marcas por palabra → comprobar: texto igual al guion, **fin de voz ≥ 0,3 s antes del final**, pronunciación (una palabra rara en la transcripción = escuchar), hoja de contacto (`fps=1/2, tile=4x1`) para ver texto no pedido, rostros, marca y anatomía.

## 6. Encadenar escenas con el último fotograma
1. Abrir el clip → clic en la regla de tiempo cerca del final (≈ 00:07:20).
2. Pasar el cursor sobre el reproductor → **Guardar fotograma** (queda como imagen del proyecto).
3. Caja de creación → chip → **Fotogramas** → ranura **Iniciar** → «Seleccionar una imagen de marco» → elegir el fotograma → escribir el prompt siguiente → verificar costo → enviar.
4. Opcional: **Finalizar** con otra imagen (transición controlada); ⇄ intercambia ranuras.

## 7. Unir clips en una escena
Editor del primer clip → `+` al final → **Agregar clip** → elegir clip (barra de recorte para cortar) → «Agregar contenido multimedia» → esperar «Creando escena…» (≈ 20 s) → **Listo**. Descargar la **escena** entrega un solo MP4 (hoy a 720p). Para 1080p: descargar cada clip a 1080p y unir con ffmpeg.

## 8. Extender
Solo clips generados con **Veo**: `+` → Extender (Veo 3.1 - Lite) → agrega +8 s. En clips Omni el botón está gris. Medir costo antes de usar.

## 9. Herramientas útiles (probar antes de prometer)
Herramientas → Plantillas: Type Overlays (texto animado), Stringout Creator (unir clips), Transition Machine, Video Resizer, Storyboard Studio. Crear herramienta no cuesta créditos.

## 10. Modo cuenta gratuita (pendiente de comprobar en otra sesión)
50 créditos/día no acumulables (el reinicio lo dispara la primera generación del día); imágenes y Agente gratis; sin reescalado 1080p/4K; horas pico 14:00-17:00 UTC pueden bloquear video. Estrategia: imágenes primero (gratis), animar solo lo aprobado, Omni 360p solo para pruebas, x1, una pieza al día.

## 11. Pendiente de esta skill
- Probar en cuenta gratuita y completar la sección 10.
- Medir costos de extender, edición, Type Overlays, Stringout Creator y reescalado.
- Automatizar el flujo completo (prompt → enviar → esperar → descargar → renombrar → evaluar → informe).
