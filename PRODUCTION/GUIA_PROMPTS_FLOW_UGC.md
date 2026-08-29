# Guía: Consistencia de Avatar Virtual + Producto en Flow (Ingredients-a-Video)

> ℹ️ **Documento complementario, NO fuente de verdad.** La metodología y las reglas NO NEGOCIABLES de dirección audiovisual para Flow/Veo siguen viviendo en `PRODUCTION/FLOW_VIDEO_DIRECTOR_SYSTEM.md` (v1.1) — este documento solo aporta un protocolo adicional para un caso de uso que v1.1/`FLOW_REELS.md` no cubren: **avatares virtuales de marca genéricos (no el avatar-abogado de CEINCA) sosteniendo un producto real**, usando la técnica de "Ingredients a Video" de Flow.
>
> **Origen:** localizado el 29-08-2026 en `CEINCA-WORKSPACE/CEINCA/Manuales MARCA CEINCA/guia-prompts-flow-ugc.md` (carpeta de staging del usuario, sin control de versiones). Auditado contra v1.1/`FLOW_REELS.md`, incorporado aquí ya depurado tras 2 decisiones explícitas del usuario:
>
> 1. **Nombre ficticio del avatar dentro del texto del prompt de Flow — RECHAZADO Y ELIMINADO de este documento.** El original sugería `"El personaje [Nombre] mira a cámara..."` dentro del prompt. v1.1 §4.5 (NO NEGOCIABLE, validada por un rechazo real de política de Flow en producción — ver `SAREN_TOTUMA_SCRIPT_FLOW.md`) prohíbe cualquier nombre propio dentro del prompt, sin excepción para avatares sintéticos. Se mantiene el filtro sin excepción: usar siempre descripción física + etiqueta interna neutral (mismo patrón que `FLOW_REELS.md` usa para el avatar de Eduardo).
> 2. **Freepik Spaces/Nodos y Onean (Alibaba) — RECHAZADOS Y ELIMINADOS de este documento.** Confirmado por el usuario: son herramientas genéricas de stock de la web, no parte del stack real de CEINCA (`FLOW_REELS.md` § STACK TÉCNICO OFICIAL sigue siendo la única fuente: Google Flow, Gemini Omni Flash, Veo 3.1, Nano Banana 2/Pro, Meta Edits). La fijación de consistencia entre tomas se resuelve con las herramientas ya oficiales (Omni Flash / Nano Banana), no con terceros no confirmados.
>
> **Nota honesta sobre el título:** pese a llamarse "UGC", este documento no aporta ninguna técnica de estética UGC real (cámara handheld, imperfecciones, naturalidad, testimonial, audio ambiente) — es una guía de **consistencia de avatar/producto entre escenas**, no de autenticidad UGC.

---

## Objetivo

Generar modelos y avatares virtuales de marca (no el avatar-abogado de CEINCA) consistentes en videoanuncios de producto (Reels/TikTok 9:16), manteniendo el mismo rostro del avatar y la fidelidad del producto real a lo largo de múltiples escenas y entregas.

**Cuándo usar este documento en vez de / además de `FLOW_REELS.md`:** cuando el Reel presenta un avatar de marca genérico sosteniendo/usando un producto real (no el abogado/avatar principal de CEINCA). Para el avatar-abogado, `FLOW_REELS.md` sigue siendo la referencia completa.

---

## Reglas de prompting (alineadas con v1.1 §4 — sin excepciones nuevas)

1. **Terminología:** usar siempre `realista`. **Nunca** `hiperrealista`/`fotorrealista` — mismo motivo que v1.1 §4.6: activa el filtro de "persona real identificable" en Flow.
2. **Replicabilidad:** incluir instrucción explícita de que el modelo/avatar debe ser replicable en un storytelling de varias tomas.
3. **Sin nombre propio en el prompt (regla de v1.1 §4.5, sin excepción):** el avatar se referencia por descripción física + etiqueta interna neutral (ej. `Avatar_Producto`), nunca por un nombre — ni real ni ficticio — dentro del texto que se envía a Flow. Un nombre ficticio puede usarse únicamente como referencia interna en el chat de generación de imagen (fuera del prompt de video), nunca dentro del prompt en sí.

---

## Protocolo de creación (3 pasos)

### Paso 0 — Definición del producto y contexto
- Cargar las imágenes reales del producto y extraer sus 3 diferenciales principales.
- Definir el arquetipo del avatar según el comprador real (edad, complexión no estereotipada, contexto cotidiano).

### Paso 1 — Imagen base del avatar (Nano Banana 2/Pro, ya en el stack oficial)
**Estructura del prompt base:**
> `"Fotografía de cuerpo entero/plano medio de [arquetipo de persona], aspecto realista, vistiendo [producto/ropa específica], ubicado en [escenario realista], iluminación natural, encuadre vertical 9:16, personaje replicable para storytelling."`

Sin nombre propio en el prompt (ver regla 3).

### Paso 2 — Ingredients-a-Video en Flow (Veo 3.1)
1. Activar la función **Ingredients a Video** en Flow.
2. Cargar como Ingredients: (1) la foto aprobada del avatar del Paso 1, (2) foto real en alta resolución del producto.
3. **Prompt de movimiento y guion:** duración según la tabla de v1.1 §5 (6/8/10s — no 7s, que no está en la tabla oficial). Ejemplo de estructura:
> `"Video vertical 9:16 de [6/8/10] segundos. El avatar mira a cámara con expresión natural y habla sobre [diferencial del producto]. Movimiento suave de labios, iluminación coherente con las imágenes de ingrediente. Muestra el producto [nombre del producto] en uso."`

### Consistencia entre tomas
Usar el mecanismo ya oficial de character consistency (Gemini Omni Flash + Ingredients, ver `FLOW_REELS.md` § CONFIGURACIÓN DE AVATAR) para las tomas siguientes (hook, demostración, reacción/cierre) — no herramientas de terceros sin confirmar.

---

## Checklist de calidad

- [ ] ¿El rostro del avatar se mantiene idéntico entre las diferentes tomas?
- [ ] ¿El producto real conserva sus logos, colores, cortes y texturas originales?
- [ ] ¿El movimiento de labios (*lipsync*) y la voz coinciden con el idioma y acento local del mercado objetivo?
- [ ] ¿El video está exportado en formato vertical (9:16) y dura 6, 8 o 10 segundos (tabla v1.1 §5)?
- [ ] ¿El prompt no contiene ningún nombre propio, real ni ficticio?
