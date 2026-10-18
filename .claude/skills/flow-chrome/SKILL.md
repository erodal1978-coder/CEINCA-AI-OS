---
name: flow-chrome
description: Operar Google Flow desde la extensión de Chrome de Claude (flow.google.com) para generar, descargar, evaluar, encadenar y unir clips de video e imagen controlando los créditos. Usar cuando se pida generar videos o imágenes en Flow, descargar clips, unir escenas, continuar una escena con el último fotograma o evaluar clips de Flow. v0.2 (18-10-2026): medido en cuenta PRO y en cuenta gratuita.
---

# Flow desde la extensión de Chrome (CEINCA) — v0.2

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
Solo clips generados con **Veo Lite** de 8 s: abrir el clip (doble clic) → `+` al final de la línea de tiempo → «Extender (Veo 3.1 - Lite)» → escribir la instrucción en «¿Qué sucederá ahora?» → enviar. **Cuesta 10 créditos** (pasar el cursor por el botón de enviar para verlo), tarda ≈ 1 min y agrega ≈ 7 s con continuidad exacta; el clip queda dentro de una escena nueva. En clips **Omni, Extender sale en gris**. No cerrar el modo con la X del chip: cancela la extensión.

## 9. Herramientas (plantillas)
Herramientas → Plantillas: Type Overlays (texto animado), Stringout Creator (unir clips con tarjetas de texto), Transition Machine, Video Resizer, Storyboard Studio, etc. Al abrir una plantilla Flow crea una copia «Remix of …». **Type Overlays renderiza en el navegador sin gastar créditos** (≈ 2 min por 8 s; no cambiar de pestaña; sale a 1280×2274 con audio). Su campo de texto está en un iframe: escribir con la acción `type` de la extensión (`execCommand` no entra) y bajar el tamaño de letra en video vertical (84 px por defecto se recorta). **Crear una herramienta propia exige plan de pago.**

## 10. Modo cuenta gratuita (medido 18-10-2026)
- 50 créditos/día, no acumulables. El menú de la cuenta (avatar) muestra el saldo y la hora de reinicio (en la prueba: 11:25 a. m. hora de Venezuela; la ayuda oficial dice «desde la primera generación»: verificar). Botón «Actualizar» = plan.
- Todos los modelos se ven sin candado. Costos iguales a Pro; **imágenes (Nano Banana) = 0**; unir clips en escena = 0; extender = 10; Veo Quality (100) no alcanza (botón rojo «No tienes suficientes créditos»).
- **Descargas:** imagen 1K y 2K sí, 4K no. Video: 720p original sí; **reescalar 360p→720p, 1080p y 4K bloqueados** (por eso el final se genera directo en 720p; Veo Lite 10 < Omni 12). Escena = un MP4 sin menú de calidad. Sin marca de agua visible.
- **Políticas:** copyright de terceros → bloqueo y «No se te cobró»; «personas destacadas» en video → bloqueo con reembolso (en imagen sí las genera, no usarlas). Validar el prompt primero en imagen (0 créditos).
- Estrategia: imágenes primero (0), animar solo lo aprobado, x1, una pieza al día, planear el gasto (ejemplo de 50 créditos: 1 prueba 360p de 8 s = 6, 2 Veo Lite 720p = 20, 1 extensión = 10, 1 Omni 720p de 8 s = 12).
- Horas pico oficiales 14:00-17:00 UTC: en la prueba se generó video dentro de esa ventana sin bloqueo.

## 11. Trucos de operación de la extensión (medidos)
- Cerrar paneles **haciendo clic de nuevo** en la píldora de ajustes; evitar Escape (una vez un elemento pasó a la papelera: aparece aviso con «Deshacer»).
- Hacer clic en una tarjeta de la biblioteca la agrega como ingrediente (cambia el costo): verificar con captura antes de enviar.
- Leer el costo: `document.body.innerText.match(/usará\s*\d+/)` esperando ≈ 1 s tras el clic. Leer el saldo: abrir el menú de la cuenta y `match(/\d+ créditos de Google Flow/)`.
- `wait` de la extensión: máximo 10 s por llamada. Si el grupo de pestañas se pierde (se cerró la pestaña), `tabs_context_mcp` con `createIfEmpty: true` y volver a la URL del proyecto.
- Mover a la papelera es reversible; **no usar «Descartar»** en los avisos sin confirmar con el usuario.
- Un mensaje de error en una tarjeta indica si se cobró o no; leerlo antes de reintentar.

## 12. Pendiente de esta skill
- Medir Fotogramas Inicio+Fin, Video Resizer y Stringout renderizado; costo de la edición Omni (oficial: 40).
- Confirmar la hora real de reinicio de créditos y el reembolso tardío de los fallos.
- Automatizar el flujo completo (prompt → enviar → esperar → descargar → renombrar → evaluar → informe).
