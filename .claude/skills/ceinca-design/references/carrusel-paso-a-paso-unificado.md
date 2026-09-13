# CEINCA — Estructura Unificada de Carrusel "Paso a Paso"

**Reemplaza/extiende:** el componente base en `references/components.md` (sección 1).
**Combina:** el sistema Navy/Gold/Montserrat ya existente + el swipe file `swipe-file-carrusel-pasos.md`.
**Cuándo usar esta plantilla específica:** contenido tipo "cómo hacer X en N pasos" — lanzamiento de cursos por nicho, Diplomado AJ, tutoriales de Claude. Para alertas/urgencia tipo "riesgo oculto" sigue usando el formato original de 5 láminas de `components.md`, no este.

---

## 1. Regla de largo (decide esto ANTES de escribir el guion)

| Temperatura de audiencia | Láminas | Ejemplo de uso CEINCA |
|---|---|---|
| Fría/tibia (feed de gente que no te conoce) | **7-9** (portada + 5-7 pasos + cierre) | Lanzamiento cursos "[Nicho] + IA", primer contacto con Diplomado AJ |
| Caliente (ya te sigue, ya vio Stories previas) | 10-11 | Contenido para seguidores recurrentes de @ceinca.mercantil |

**Prueba antes de fijar el número:** cada lámina debe pararse sola — si alguien ve solo esa lámina, ¿le queda un aprendizaje completo? Si necesitas 2 láminas para explicar 1 paso, el paso está mal cortado; no agregues láminas, corta mejor el paso.

---

## 2. Anatomía de lámina (unificada)

Cada lámina de paso lleva, en este orden:

1. **`label-authority`** (ya existe) — kicker superior izquierdo: `PASO N` en vez del texto de alerta original
2. **Indicador de progreso doble** (nuevo — ver CSS abajo): barra de progreso horizontal + `N/TOTAL` en texto, reemplaza el `slide-num` de solo texto
3. **Headline** (ya existe, Montserrat black/uppercase) — la palabra clave del paso va en `.gold` + `italic` (simula el contraste serif/sans del swipe file sin salir de Montserrat, para no romper la identidad tipográfica de CEINCA)
4. **`premium-list`** (ya existe) — máximo 3 bullets, una acción por bullet
5. **`highlight-box`** (**nuevo componente**, no existía) — recuadro con borde gold, sin relleno, con LA frase de mayor impacto del paso (máx. 2 líneas) — es lo que el swipe file aportó y que CEINCA no tenía
6. **`slide-footer`** (ya existe) — logo + sub + handle, sin cambios

## 3. Alternancia de fondo (nuevo — usa colores YA existentes en tokens.md, no se inventan)

- **Fondo Navy** (`--navy`, ya existente) → pasos de **acción mecánica** (instalar, configurar, ejecutar)
- **Fondo Cream** (`--cream`, ya existente en tokens pero sin uso en carruseles hasta ahora) → pasos de **criterio/estrategia** (por qué, cuándo, decisión)

Esto rompe la monotonía visual de 7-9 láminas seguidas del mismo color — igual que en el swipe file, pero con la paleta CEINCA, nunca con el naranja/crema del original.

## 4. Cierre (sin cambios de fondo, solo de contenido)

Se mantiene el `ctb-button` existente ("Escribe **[PALABRA]** por DM") — es la misma mecánica de captura que ya usan con BLINDAJE y MAJARETE. No hace falta inventar nada nuevo aquí.

---

## 5. CSS/HTML — bloques nuevos para agregar a `components.md`

Agregar estas clases al `<style>` del carrusel base (no reemplazan nada, se suman):

```css
/* === LÁMINA CLARA (alternancia) === */
.slide.light {
  background: var(--cream);
}
.slide.light .headline { color: var(--navy); }
.slide.light .subhead,
.slide.light .body-text { color: rgba(18,42,99,0.65); }
.slide.light .label-authority {
  color: var(--navy-mid);
  background: rgba(18,42,99,0.06);
  border-color: rgba(18,42,99,0.15);
}
.slide.light .footer-sub,
.slide.light .footer-handle { color: rgba(18,42,99,0.45); }
.slide.light .footer-logo { color: var(--gold-dark); }
.slide.light .slide-footer { border-top-color: rgba(18,42,99,0.1); }
.slide.light .progress-track { background: rgba(18,42,99,0.1); }

/* === INDICADOR DE PROGRESO (barra + contador) === */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-track {
  width: 70px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--gold);
  border-radius: 999px;
}
.progress-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--gold);
  white-space: nowrap;
}
.slide.light .progress-count { color: var(--gold-dark); }

/* === RECUADRO DE HIGHLIGHT (nuevo, el aporte clave del swipe file) === */
.highlight-box {
  border: 1.5px solid var(--gold);
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--white);
  text-align: center;
}
.slide.light .highlight-box {
  color: var(--navy);
  border-color: var(--gold-dark);
}

/* === HEADLINE con acento itálico (contraste tipográfico sin cambiar fuente) === */
.headline .accent-italic {
  font-style: italic;
  font-weight: 800;
  color: var(--gold);
}
```

Ejemplo de lámina de paso completa (patrón a repetir):

```html
<!-- SLIDE: PASO N -->
<div class="slide light">  <!-- quitar "light" para versión navy -->
  <div class="slide-top">
    <span class="label-authority">PASO 3</span>
    <div class="progress-wrap">
      <div class="progress-track"><div class="progress-fill" style="width:33%"></div></div>
      <span class="progress-count">3/9</span>
    </div>
  </div>
  <div class="slide-body">
    <h2 class="headline">CREÁ TU<br><span class="accent-italic">Proyecto en Claude</span></h2>
    <ul class="premium-list">
      <li><span class="bullet">▸</span> Abrí Claude.ai y creá un Proyecto nuevo</li>
      <li><span class="bullet">▸</span> Nombralo con el nombre del cliente o curso</li>
      <li><span class="bullet">▸</span> Subí ahí tus instrucciones fijas</li>
    </ul>
    <div class="highlight-box">Un Proyecto por cliente. Nunca mezcles el contexto de dos negocios distintos.</div>
  </div>
  <div class="slide-footer">
    <span class="footer-logo">CEINCA</span>
    <span class="footer-sep">|</span>
    <span class="footer-sub">Mercantil + IA</span>
    <span class="footer-handle">@ceinca.mercantil</span>
  </div>
</div>
```

---

## 6. Checklist antes de producir el carrusel

- [ ] Decidí el largo según temperatura de audiencia (tabla sección 1)
- [ ] Cada lámina se sostiene sola (prueba de la sección 1)
- [ ] Alterné navy/cream para que no sean todas iguales
- [ ] Cada lámina de paso tiene su `highlight-box` con UNA sola frase
- [ ] La palabra clave del cierre está definida y la automatización de DM está lista antes de publicar
