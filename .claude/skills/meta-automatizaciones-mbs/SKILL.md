---
name: meta-automatizaciones-mbs
description: Crear y editar automatizaciones nativas de Meta Business Suite (Bandeja de entrada → Automatizaciones) manejando Chrome. v0.2 cubre solo "Respuesta a comentario" (comentario con palabra clave → DM + respuesta pública). Usar cuando Eduardo pida crear la automatización de una keyword/CTB para Instagram y Facebook, o actualizar su texto.
---

# Meta Business Suite — Automatizaciones nativas (v0.2)

**Estado: BORRADOR v0.2 (22-10-2026). Construida con una sola automatización (GOLEM, @soyeduardo.ia / activo Digital Mentor, creada y editada el 21-10-2026). Eduardo indica que funciona; la prueba con un comentario real desde otra cuenta no está registrada. Lo que dependa de cómo llega el DM real (saltos de línea, carpeta de destino) sigue NO VERIFICADO.**

Alcance v0.1: solo plantilla **Respuesta a comentario**. Se ampliará con: palabras clave personalizadas, información de contacto, mensajes sin responder, respuesta/mensaje automático.

## Principios (método CEINCA)
- Se usa el **automatizador nativo de Meta** (sin ManyChat ni terceros, sin pagos).
- Toda publicación de IG sale también en **Facebook en paralelo** → la automatización se crea con **Messenger + Instagram marcados**. No desmarcar Messenger "porque solo publicamos en IG".
- **Candado:** la automatización se crea ANTES de publicar y se prueba justo después con un comentario con la palabra.
- Una palabra = un recurso (ver `MARKETING/SOYEDUARDO_IA/CTB_KEYWORDS_SOYEDUARDO_IA.md`; palabra en minúsculas, ≥5 letras).
- Textos aprobados por Eduardo: no reescribir en el momento. Largos con `verificar_largos.py` (DM ≤1000, respuesta ≤500, contados en UTF-16).
- Con contraseña/login: pedir a Eduardo. Nunca manejar credenciales. No leer DMs de terceros.
- Crear la automatización requiere orden explícita de Eduardo para esa palabra (es configuración persistente). Guardar y activar = parte de esa orden; probar con comentario real solo tras publicar.

## Ruta
1. Meta Business Suite → activo correcto (ej. Digital Mentor, `asset_id=495170807021061`, `business_id=929779867921268`) → Bandeja de entrada → Automatizaciones.
2. Crear automatización → **"Respuesta a comentario"** (`automation_template=comment_to_inbox_v2`).
   - NO usar "Automatización personalizada": solo ofrece Messenger.
3. Campos: Nombre · Canal (Messenger + Instagram) · palabras clave (hasta 10) · Mensaje privado (≤1000) · multimedia (opcional) · Respuesta al comentario (≤500, un solo texto).

## Trampas aprendidas (UI de Meta)
- **Nombre:** se escribe con `type` normal. Si queda vacío al agregar la keyword, Meta lo reemplaza por "golem": revisar y re-escribir el Nombre al final (triple clic + type).
- **Keyword:** escribir y **hacer clic en la sugerencia desplegable**; Enter solo no crea la etiqueta.
- **Los dos mensajes son Draft.js (`contenteditable`)**: `form_input` no funciona; `execCommand('insertText')` con texto largo **cuelga la página** (formulario en blanco). Funciona despachar un evento `paste` sintético:
  ```js
  window.__paste=(i,t)=>{const e=document.querySelectorAll('[contenteditable="true"]')[i];e.focus();
  const d=new DataTransfer();d.setData('text/plain',t);
  e.dispatchEvent(new ClipboardEvent('paste',{clipboardData:d,bubbles:true,cancelable:true}));
  return e.innerText.length}
  ```
  Índice 0 = Mensaje privado, 1 = Respuesta al comentario.
- El paste **no reemplaza** la selección: para limpiar un campo, clic dentro → `ctrl+a` → `BackSpace` (teclas reales) y luego pegar. Nunca `execCommand('delete')` en bucle.
- **No reintentar recargando** a cada fallo; esperar. Recargar vacía el formulario.
- **Para cambiar un texto ya guardado:** no editar a trozos. Borrar el campo entero (clic → `ctrl+a` → `BackSpace`) y reconstruirlo **por bloques**: pegar hasta el punto del chip, insertar el chip, pegar el resto.
- **Messenger:** marcarlo y **guardar**; confirmarlo después en la columna **Canal** de la lista (dos íconos). Un cambio sin guardar se pierde sin aviso (pasó el 21-10).
- La lista de automatizaciones tarda en mostrar la nueva: recargar la página para verla; "Guardada. Es posible que los cambios tarden en aplicarse".
- Al re-editar una automatización guardada (botón Editar, URL con `automation_id=`), el botón Guardar solo se activa tras un cambio.

- **(22-10, SOLDADURA)** Con la página lenta, `type` pierde letras al azar (y la «D» tras «P»). Para el **Nombre**, usar el setter nativo: `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'…'); i.dispatchEvent(new Event('input',{bubbles:true}))` y comprobar el contador «N/100».
- **(22-10)** La lista antepone «Respuesta a comentario - » al nombre: no escribir ese prefijo en el Nombre.
- **(22-10)** Si `Page.captureScreenshot` no responde (ventana minimizada), todo se puede hacer con `find` + clics por `ref` + `javascript_tool` leyendo `innerText` y los contadores. URL directa del formulario: `.../latest/inbox/automated_responses?business_id=…&asset_id=…&automation_template=comment_to_inbox_v2`.

## Personalización con nombre del destinatario
- En **Mensaje privado**, el botón ✨ ("Personaliza tu mensaje") abre un diálogo con campos: Nombre / Apellido / Nombre completo del destinatario, Nombre y enlace de la página, teléfono, correo. Elegir "Nombre del destinatario" → **Agregar**: se inserta una etiqueta (chip) en el cursor.
- Procedimiento: pegar el texto hasta el punto del nombre ("👋 ¡Hola, "), insertar el chip con ✨, y pegar el resto ("! Gracias por…"). El cursor queda después del chip.
- **Meta mete un espacio después del chip** ("¡Hola, Eduardo !"). Solución aplicada: poner el chip **al final de una frase y antes de un emoji**: `👋 ¡Hola! Gracias por comentar GOLEM, [nombre] 🎉`.
- Al reabrir un mensaje guardado, el editor muestra una **"{" pegada al chip**: es solo cómo Meta dibuja el campo, no sale en la vista previa. Si aparece una "{" suelta **en la vista previa**, sí es basura: reconstruir el campo.
- **La Respuesta pública NO tiene botón de personalizar**: va con saludo genérico ("¡Hola!").
- Las variantes B/C de respuesta pública no caben en la automatización (un solo texto): se usan a mano en la Golden Hour.

## Checklist
1. Palabra aprobada en el banco CTB y textos aprobados (DM + respuesta A).
2. Crear con la ruta de arriba; Messenger + Instagram; keyword en minúsculas.
3. Pegar DM con chip de nombre; pegar respuesta pública; Nombre real.
4. Verificar con captura: contadores (DM <1000, respuesta <500), canales y **la vista previa del panel derecho**, que es la prueba antes de publicar (decisión de Eduardo: "avanzar es el lema"; no hace falta comentario de prueba para dar por buena la configuración). La vista previa junta los saltos de línea en un bloque: el texto guardado sí los conserva.
5. Guardar; recargar la lista; confirmar Estado **activado** y columna Canal con ambos íconos.
6. Registrar en `CTB_KEYWORDS_SOYEDUARDO_IA.md` (tabla de uso) y en `handoff.md`.
7. Tras publicar: comentar la palabra desde otra cuenta; verificar DM (nombre, espacio antes de "!") y respuesta pública. Solo entonces subir la skill de v0.1 a v0.2 "verificada".

## Textos que ya funcionan (reutilizables)
- Cierre del DM con razón para seguir, honesto: `🔔 Sígueme en @soyeduardo.ia: si no, mis próximos recursos pueden caer en mensajes no deseados.` ("pueden": no está verificado a qué carpeta llega el DM de quien no sigue; "mensajes no deseados" porque la gente no entiende "solicitudes"). No afirmar "no te llegarán".

## Material para el curso de Meta (CEINCA)
Punto de dolor a enseñar: "sin pagar ManyChat" → automatizador nativo del MBS. Esta skill es la base del módulo; documentar con capturas cada plantilla al ampliarla.
