# SISTEMA_VIRAL_ORGANICO_Y_ADS_LEXIA.md

**Versión:** 1.0
**Fecha:** Julio 2026
**Alcance:** Sistema de contenido viral orgánico (Instagram) + estrategia de Meta Ads de conversión, aplicados al lanzamiento de LEXIA™.

> ⚠️ **Referencia rota pendiente de decisión:** este documento cita `brief-creativo-lexia.md` 3 veces (guion del reel ángulo IA, estructura/estilo de la landing, copy del carrusel). Ese archivo no existe en el repositorio (verificado en el Brain Audit del 28-08-2026, confirmado de nuevo aquí — no se encontró con ningún nombre/ruta similar). No se inventó contenido de reemplazo. Decidir: (a) el brief nunca se subió y hay que recuperarlo/recrearlo, o (b) la referencia es obsoleta y debe retirarse.

---

## 1. Los 2 mecanismos virales orgánicos comprobados

Análisis de 5 posts virales reales de @ceinca.mercantil (oct 2025 – jul 2026), con métricas de Windsor.ai. Existen **2 arquitecturas narrativas distintas**, no una sola fórmula:

### Mecanismo A — "Solución" (optimizado para leads)
Usado en: Apostilla (carrusel, 79,986 alcance / 134,315 views), Apostilla01 (reel + carrusel), Totuma (reel, 35,887 alcance / 50,838 views).

Estructura:
1. **Hook de urgencia/noticia** ("🚨 ÚLTIMA HORA", "🚨 ATENCIÓN")
2. **Contraste antes/después** (fila y gestores → desde el teléfono)
3. **Checklist visual de 3-5 pasos** con ✅
4. **CTA de guardar + compartir** antes del CTA de conversión
5. **Keyword de conversión** simple (APOSTILLA, APOSTILLA01, TOTUMA) → DM automatizado
6. **Gate de seguir**: "si no nos sigues, la plataforma no nos deja enviarte el mensaje" — mecanismo de crecimiento de seguidores integrado al lead magnet

### Mecanismo B — "Alarma/Opinión" (optimizado para alcance puro)
Usado en: "Las PYMES desaparecen del SAREN" (18 oct 2025, reel, 24,956 alcance).

Estructura:
1. **Noticia de última hora** con tono de incertidumbre (no de solución)
2. **Pregunta abierta** ("¿Qué significa esto para los emprendedores?")
3. **CTA de opinión** ("Comenta tu opinión 👇") — sin keyword, sin DM

**Regla de decisión:** Mecanismo A cuando el objetivo es generar contactos/leads calificados. Mecanismo B cuando el objetivo es alcance/crecimiento de seguidores puro.

### Regla del gate de "seguir"
- **Orgánico: mantener.** Es el mecanismo de crecimiento de seguidores más efectivo comprobado.
- **Ads: NO incluir la frase explícita.** Motivos: (1) fricción innecesaria en tráfico ya pagado, (2) riesgo de política de Meta por parecido a *incentivized follow / engagement bait*.

---

## 2. Estructura narrativa a nivel de frame (análisis Claude Code + ffmpeg)

De 3 reels analizados frame a frame:

| Variante | Ritmo de corte | Tono | Uso recomendado |
|---|---|---|---|
| Venta rápida (video_1) | ~3.4s/corte | Urgente, directo | Ofertas de bajo precio / tiempo limitado |
| Autoridad (video_3, "Totuma") | ~5.3s/corte | Pausado, profesional | Productos de mayor precio (ej. LEXIA, $97) |
| Viralidad pura (video_2) | Bloque de planteamiento largo (19.8s) | Sin keyword, solo opinión | Mecanismo B |

Hallazgo clave: **"Guarda este video" funciona mejor colocado temprano** (dentro del planteamiento del problema), no al cierre.

Arquitectura de carrusel (6 slides fija): Hook → Requisito → Novedad → Pago/Acción → Resultado → Cierre con doble CTA (guardar+compartir / comentar keyword).

---

## 3. Perfil de rendimiento de Meta Ads (datos reales, cuenta CEINCA CP)

### A nivel de campaña
- Objetivo **Interacción/Mensajes** supera consistentemente a **Ventas** (Ventas: CTR 1.14-1.34%; Interacción: CTR 2-5.6%+).
- Campaña de mejor rendimiento histórico: **III Jornada - DM Instagram** (jul 2025), CTR 4.61%, CPC $0.049, 607 mensajes + 150 comentarios con solo $74.61 de inversión.
- Gastar más en un solo anuncio sin refrescar el creativo cae en rendimientos decrecientes (los 2 anuncios más caros de la historia de la cuenta, $27 y $20, tuvieron CTR mediocre: 3.5% y 1.76%).

### A nivel de anuncio individual (dentro de campañas)
- **Video > Post estático > Carrusel**, siempre, en CTR.
- **El ángulo "IA" es el de mayor conversión histórico**: "Anuncio 011 - video IA" (III Jornada) — 7.89% CTR, el más alto registrado, y uno de los 2 únicos anuncios con leads/registros reales (no solo mensajes).
- **Eduardo hablando a cámara funciona**: "Video Eduardo" (III Jornada) — 5.0% CTR.
- **Testimonio real funciona, pero no es el ángulo más fuerte por sí solo**: CTR 4.70%.
- El único anuncio con conversión de venta real en todo el historial: "Anuncio 002 - Post 2" (Jornada Telegram), con leads + `messaging_order_created`.

---

## 4. Algoritmo Meta 2026 (Andromeda) — implicaciones estructurales

Desde oct. 2025, el algoritmo de Meta pasó de segmentación manual (intereses/lookalikes) a **lectura del creativo como señal de targeting**. Implicaciones:
- Repetir el mismo video con textos distintos ahora perjudica la cuenta (sube CPM).
- Estructura recomendada: pocos ad sets, **muchos creativos genuinamente distintos** por ad set (benchmark grande: 15-50+; en cuentas de bajo presupuesto como CEINCA, 4-8 es más realista).
- 90% del inventario de Meta es vertical (9:16) — todo el material debe ser vertical.
- Advantage+ (ASC) es el formato dominante sobre campañas manuales.
- Se requiere Pixel + CAPI con buena Event Match Quality.
- Benchmark oficial de "50 conversiones/semana para salir de aprendizaje" está pensado para cuentas de $100-300/día — **no aplica literalmente a cuentas de $3-10/día como CEINCA**; la señal de "mensaje" (más barata que "compra") compensa parcialmente esta limitación de escala.

---

## 5. Aplicación concreta: campaña de lanzamiento LEXIA™

- **Objetivo:** Interacción/Mensajes.
- **Presupuesto:** $3/día, 1 solo ad set (limitación real del cliente).
- **Estructura de creativos (4-6, priorizados por el perfil de rendimiento arriba):**
  1. Reel ángulo "IA" (mayor CTR histórico) — guion completo en `brief-creativo-lexia.md` (⚠️ archivo no existe en el repo, ver nota al inicio).
  2. Video Eduardo hablando a cámara (formato ya probado).
  3. Testimonio Isabel Sánchez (menciona IA explícitamente — cruce perfecto con el hallazgo #2).
  4. Testimonio Grecia Vera (pull-quote "vale la pena la inversión" — pendiente corte del CTA ajeno "ESTRATEGIA360").
  5. Carrusel adaptado de la arquitectura Apostilla (6 slides).
  6. *(opcional)* Imagen estática del hero de la landing.
- **Sin el gate de "sígueme"** en ningún creativo de ads (ver regla en sección 1).
- **Landing de destino:** lexia-ceinca.vercel.app (estructura y estilo documentados en `brief-creativo-lexia.md` — ⚠️ no existe en el repo, ver nota al inicio — y en el propio repositorio de la landing).

---

## 5.5 Regla de estilo de redacción

Regla de tuteo venezolano / no-voseo — ahora vive en `RULES/ESTILO_REDACCION.md` porque aplica a todo contenido escrito de CEINCA, no solo a LEXIA. Ver ese archivo para la tabla de corrección y la causa raíz del error.

---

## 6. Pendientes operativos (al momento de este commit)

- [ ] Corte de video Grecia Vera: eliminar CTA "Comenta ESTRATEGIA360" (a partir del segundo 22.5 del original).
- [ ] Grabación de reel LEXIA siguiendo storyboard (b-roll de pantallas: grabación real, NO generado con Flow — el texto de UI no es confiable con Flow).
- [ ] Diseño de carrusel en Canva usando el copy de `brief-creativo-lexia.md` (⚠️ archivo no existe en el repo, ver nota al inicio).
- [ ] Deploy final de la landing actualizada a Vercel (pendiente por volumen de assets — requiere `vercel --prod` desde CLI local).
- [ ] Revisar TODO el contenido ya generado (landing, PDFs de Canva, copies de ads) buscando residuos de voseo ("accedés", "escribís", etc.) y corregir a tuteo venezolano — ver regla en `RULES/ESTILO_REDACCION.md`.
