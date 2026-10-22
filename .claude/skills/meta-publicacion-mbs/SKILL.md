---
name: meta-publicacion-mbs
description: Publicar y programar historias, y actualizar el perfil de la fanpage (foto, portada, presentación, enlaces, contacto) en Meta Business Suite / Facebook manejando Chrome (extensión claude-in-chrome). v0.1. Usar cuando Eduardo pida subir o programar historias de Instagram/Facebook, poner música a historias desde la PC, cambiar foto de perfil o portada de una página, o actualizar sus datos. Para automatizaciones de comentarios → DM usar meta-automatizaciones-mbs.
---

# Meta Business Suite — historias y perfil de la página desde Chrome (v0.1)

**Estado:** BORRADOR v0.1, verificado el 22-10-2026 en el activo **Digital Mentor** (`asset_id=495170807021061`, `business_id=929779867921268`; página de Facebook `id=61571952909104`, Instagram @soyeduardo.ia): 9 historias programadas en 4 tandas, foto de perfil, portada, presentación, enlace y medio social de la página. Nada de lo de abajo está probado en otro activo.

## Reglas
- Publicar, programar y cambiar el perfil son acciones **hacia afuera**: solo con orden explícita de Eduardo para esa pieza. El clasificador de permisos de Claude Code **puede bloquear el clic final** ("Compartir"); si pasa, dejar todo listo y pedirle a Eduardo que pulse él. "Programar" sí pasó (22-10).
- **No publicar todo de golpe:** programar por tandas (p. ej. una destacada por día).
- **Cambio de nombre de la página:** nunca sin un sí explícito (Meta lo revisa y limita los cambios).
- Si Facebook ofrece "¿Crear una publicación?" tras editar el perfil: **no publicar**.
- Contraseñas: nunca. Si pide login, lo hace Eduardo.

## Truco base: subir archivos sin el diálogo del sistema
Meta crea el `<input type=file>` **en el momento del clic y sin insertarlo en el DOM**, así que `find`/`file_upload` no lo ven y el clic abre el selector nativo (invisible para Claude). Solución: interceptar `HTMLInputElement.prototype.click` **antes** de pulsar el botón de subir:
```js
window.__origClick=HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click=function(){ if(this.type==='file'){
  this.setAttribute('aria-label','subir-capturado');
  this.style.cssText='display:block;position:fixed;top:0;left:0;width:200px;height:40px;z-index:99999';
  if(!this.isConnected) document.body.appendChild(this); window.__capt=this; return;}
  return window.__origClick.call(this);};
```
Luego: clic en "Agregar foto/video" (o "Subir foto") → `find` "file input labeled subir-capturado" → `file_upload` con las rutas → **restaurar** (`HTMLInputElement.prototype.click=window.__origClick` y ocultar `__capt`). Límite de `file_upload`: 10 MB por llamada.
Si antes se abrió por error el selector nativo, avisar a Eduardo para que lo cierre con "Cancelar".

## Historias (Instagram + Facebook a la vez)
Ruta: `https://business.facebook.com/latest/story_composer/?asset_id=…&business_id=…`
1. "Compartir en" ya trae la página + la cuenta de IG. Hasta **10 imágenes o videos** por tanda.
2. **Música:** el compositor web **no tiene biblioteca de música** (solo la app móvil). Se entrega cada tarjeta como **video MP4 1080×1920** con la música dentro (ffmpeg): ~6,4 s por historia, zoom suave 3,5 %, pista del banco general cortada en continuo y con `afade` de entrada en la primera y de salida en la última de cada tanda, −3 dB (≈ −15 LUFS). Receta: `CEINCA-WORKSPACE/SOY_EDUARDO_IA/HISTORIAS/` (ver handoff 22-10).
3. Subir con el truco base; esperar a que todas muestren `0:06 s` (`(innerText.match(/0:06 s/g)||[]).length`). El orden de la lista = orden de subida; comprobarlo con `zoom` sobre las miniaturas.
4. Vista previa: pestañas "Historia de Facebook / de Instagram".
5. **Programar:** botón segmentado "Programar" → aparecen fecha y hora **por separado para Facebook e Instagram** (hay que poner las dos).
   - La hora es la del navegador (America/Caracas). El valor por defecto es "ahora + 2 h".
   - Hora: clic en el segmento de horas → escribir `19`; clic en minutos → `00` (escribir en el campo, no `form_input`).
   - Fecha: clic en el campo abre un calendario; clic en el día. El calendario aparece arriba o abajo según el espacio: hacer captura antes de pulsar el día.
   - Truco de coordenadas: tras subir, desplazar la página al final; los campos quedan en filas fijas (FB y≈311, IG y≈391 con ventana 1366×585).
   - "Momentos de más actividad" sugiere horas con datos de 7 días; con pocos seguidores no es fiable (22-10 sugería 3–7 a. m.).
6. Botón "Programar" (abajo a la derecha) → Meta lleva al Planificador y muestra "Se programó correctamente la publicación de tu historia".
7. Verificar en el Planificador (`/latest/content_calendar`): cada historia aparece por plataforma a su hora.
8. Para limpiar un borrador con medios ya subidos: botones "Eliminar" de cada fila (de abajo hacia arriba; los `ref` cambian al borrar).

## Perfil de la página (Facebook, nueva experiencia de páginas)
1. Abrir `https://www.facebook.com/profile.php?id=<id página>` → botón **"Cambiar"** para actuar como la página.
2. **Portada:** "Editar foto de portada" → "Subir foto" → truco base → "Guardar cambios". Medida usada: **1640×624**, contenido clave entre x≈265 y x≈1375 (el móvil recorta los lados) y lejos de la esquina inferior izquierda (foto de perfil).
3. **Foto de perfil:** clic en la foto → "Elegir foto del perfil" → "Subir foto" → truco base → "Guardar" (descripción vacía).
4. **Presentación** (máx. 255): pestaña Información → "Editar presentación" → `ctrl+a`, `BackSpace`, escribir → Guardar.
5. **Enlaces** (hasta 10): Información → Enlaces → descripción + URL → Guardar.
6. **Medios sociales:** el usuario de un enlace existente es de **solo lectura**: Eliminar la fila y "Agregar enlace de medio social" con el usuario nuevo → Guardar.
7. Al terminar, volver al perfil personal si Eduardo lo necesita (menú de la foto arriba a la derecha).

## Material para el curso "Meta profesional desde el MBS" (CEINCA)
Cada sección de esta skill es una lección grabable: historias con música sin el celular, programación por tandas, portada que no se recorta en móvil, perfil coherente IG ↔ Facebook. Bitácora y temario: `CEINCA-WORKSPACE/03 FORMACION/CURSO META MBS/`.
