# CEINCA — Estructura Unificada de Carrusel "Alerta Noticiosa" (News-jacking)

**Basado en:** análisis real del carrusel viral de CEINCA — "🚨 ÚLTIMA HORA: El SAREN activó la Apostilla Digital" (2,8 mil likes, 900 comentarios, 133 compartidos; pico histórico: 127K vistas, 5.200 DMs, 3.200 guardados).
**Combina:** el componente base Navy/Gold/Montserrat de `references/components.md` + los hallazgos del análisis de esta pieza.
**Diferencia clave frente a los otros dos formatos:** este NO se programa por calendario — se **activa quando hay un evento regulatorio/institucional real** (SAREN, SENIAT, Gaceta Oficial, TSJ). Es reactivo, no evergreen.

Los 3 sistemas de carrusel de CEINCA, completos:

| Formato | Disparador | Objetivo principal |
|---|---|---|
| Paso a paso | Calendario editorial | Educar / lanzar cursos |
| Alerta de riesgo (BLINDAJE) | Calendario editorial | Conversión directa con urgencia fabricada |
| **Alerta Noticiosa** | **Evento regulatorio real** | **Alcance orgánico + autoridad + captura de leads** |

---

## 1. Disparador — cuándo SÍ se activa este formato

Se activa únicamente cuando ocurre uno de estos eventos verificables (ligado a los criterios de taquilla SAREN ya presentes en la skill `ceinca-ia`):

- [ ] Cambio de proceso o requisito en SAREN, SENIAT, Registro Mercantil o Notarías
- [ ] Nueva Gaceta Oficial con impacto directo en trámites mercantiles/civiles
- [ ] Sentencia o criterio TSJ que cambie un procedimiento conocido
- [ ] Digitalización o automatización de un trámite que antes era 100% presencial

**Regla de oro:** si la noticia no representa un ANTES (doloroso) y un DESPUÉS (alivio real, verificable), no alcanza para este formato — se queda en un post normal, no en carrusel de alerta noticiosa.

## 2. Anatomía del copy (la fórmula completa, disecada del original)

1. **Gancho de última hora:** `🚨 ÚLTIMA HORA: [organismo] [acción] [beneficio en 4-6 palabras].`
2. **Calificador + promesa:** pregunta directa a quien tiene el problema + "Esto te cambia todo" (o equivalente)
3. *(separador visual "─────")*
4. **Agitación del dolor histórico:** cómo era ANTES (filas, gestores, tiempo, dinero perdido) — cerrar con una frase corta tipo "Eso se acabó."
5. **Checklist de solución** — pasos concretos con ✅, en lenguaje de acción (verbo + objeto), 4-6 puntos máximo
6. **Refuerzo negativo-positivo:** "Sin [dolor 1]. Sin [dolor 2]. Sin [dolor 3]." + dónde/cómo se hace ahora
7. *(separador)*
8. **CTA 1 — Alcance:** "Guarda este carrusel 💾 — lo necesitarás." + "Compártelo 🔁 con alguien que [tenga el problema]"
9. **CTA 2 — Captura de lead:** "¿Tienes dudas sobre tu caso específico? Comenta **[PALABRA CLAVE]** y te orientamos sin costo y sin compromiso"
10. **CTA 3 — Seguimiento con autoridad:** "Síguenos 👉 @cuenta porque aquí publicamos [tipo de actualización] antes que nadie 🚀"
11. **Hashtags:** mezcla de marca + genéricos + long-tail (10-13 total)

**Por qué el triple CTA importa:** cada uno pide una acción DISTINTA (guardar/compartir = alcance, comentar = lead, seguir = audiencia futura) — no compiten entre sí como pedirían si fueran 3 veces el mismo llamado a la acción.

## 3. Anatomía visual de lámina (extiende el componente base, no lo reemplaza)

1. **Badge de urgencia** (nuevo, rojo — ver CSS) en vez del `label-authority` dorado: `🚨 ÚLTIMA HORA`
2. **`slide-num`** (ya existente) — sin cambios
3. **Headline** (ya existente) — el hecho noticioso en 2-3 líneas, la palabra/organismo clave en `.gold`
4. **Checklist con ✅** (nueva variante de `premium-list` — ver CSS) — un paso de la solución por lámina o agrupados 2-3 por lámina si son cortos
5. **`highlight-box`** (ya existe, del sistema paso a paso) — para el refuerzo "Sin filas. Sin gestores. Sin esperas."
6. **`slide-footer`** (ya existente) — sin cambios

## 4. Lámina de cierre (triple CTA — el componente nuevo más importante de este documento)

```html
<!-- SLIDE: CIERRE TRIPLE CTA -->
<div class="slide" style="background: linear-gradient(160deg, #122A63 0%, #2D4FA8 100%);">
  <div class="slide-top">
    <span class="badge-urgent">🔒 GUARDA ESTO</span>
    <span class="slide-num">06 / 06</span>
  </div>
  <div class="slide-body">
    <h2 class="headline" style="font-size:22px">NO DEJES QUE SE<br><span class="gold">TE OLVIDE</span></h2>
    <div class="cta-stack">
      <div class="cta-row"><span class="cta-icon">💾</span> Guarda este carrusel — lo vas a necesitar</div>
      <div class="cta-row"><span class="cta-icon">🔁</span> Compártelo con quien tenga documentos pendientes</div>
      <div class="cta-row cta-row--primary"><span class="cta-icon">💬</span> Comenta <strong>[PALABRA CLAVE]</strong> y te orientamos sin costo</div>
    </div>
  </div>
  <div class="slide-footer">
    <span class="footer-logo">CEINCA</span>
    <span class="footer-sep">|</span>
    <span class="footer-sub">Aquí lo sabes antes que nadie</span>
    <span class="footer-handle">@ceinca.mercantil</span>
  </div>
</div>
```

## 5. CSS nuevo para `components.md`

```css
/* === BADGE DE URGENCIA (alerta noticiosa) === */
.badge-urgent {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #FFFFFF;
  background: #D64545;
  border: 1px solid rgba(255,255,255,0.25);
  padding: 4px 10px;
  border-radius: 4px;
}

/* === CHECKLIST DE SOLUCIÓN (variante con check en vez de bullet) === */
.check-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.check-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  line-height: 1.4;
}
.check-list .check {
  color: #4ADE80;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 1px;
}

/* === STACK DE TRIPLE CTA (lámina de cierre) === */
.cta-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.cta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
}
.cta-row--primary {
  background: rgba(200,169,81,0.12);
  border-color: var(--gold);
  color: var(--white);
}
.cta-icon { font-size: 15px; }
```

---

## 6. Checklist de producción (antes de publicar)

- [ ] La noticia es verificable y real (nunca inventar ni exagerar un cambio regulatorio)
- [ ] Hay un ANTES doloroso y un DESPUÉS de alivio claro, en 1-2 frases cada uno
- [ ] El checklist de solución tiene pasos reales, verificados — no genéricos
- [ ] Los 3 CTA de cierre están completos: guardar/compartir, palabra clave, seguir
- [ ] La automatización de DM para la palabra clave está armada ANTES de publicar
- [ ] Se agregó a `Ver estadísticas` un seguimiento a las 48h para medir si amerita subirlo a Ads (Promocionar publicación)
