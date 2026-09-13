# CEINCA Design Components — Bloques Listos para Producción

## 1. CARRUSEL HTML COMPLETO (base)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carrusel CEINCA</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #122A63; --navy-mid: #1E3A8A; --navy-light: #2D4FA8;
      --gold: #C8A951; --gold-light: #DDB96A; --gold-dark: #A8892E;
      --white: #FFFFFF; --cream: #FAF6ED;
      --font: 'Montserrat', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font);
      background: #111;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 20px;
    }

    .carousel-wrapper {
      width: 432px;  /* Preview — ratio 3:4, ×2.5 = 1080×1440 en producción */
      height: 576px;
      /* Zona segura de recorte: nada crítico (texto/logo/CTA) en los primeros/
         últimos 18px arriba y abajo (= 45px a 1080×1440). Margen por si IG
         recorta el 3:4 a 4:5 en algún contexto de feed/grid. Ver también
         "Zona segura texto" en Reel/Story (SKILL.md). */
      position: relative;
      overflow: hidden;
      border-radius: 12px;
    }

    /* === SLIDE BASE === */
    .slide {
      position: absolute;
      width: 100%;
      height: 100%;
      background: var(--navy);
      padding: 36px 24px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .slide.active {
      opacity: 1;
      transform: translateX(0);
    }
    .slide.prev {
      transform: translateX(-100%);
    }

    /* === HEADER DE SLIDE === */
    .slide-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .label-authority {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
      background: rgba(200,169,81,0.12);
      border: 1px solid rgba(200,169,81,0.3);
      padding: 4px 10px;
      border-radius: 4px;
    }
    .slide-num {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.05em;
    }

    /* === CONTENIDO PRINCIPAL === */
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
      padding: 20px 0;
    }
    .headline {
      font-size: 28px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: var(--white);
    }
    .headline .gold { color: var(--gold); }
    .subhead {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.75);
      line-height: 1.5;
    }
    .body-text {
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.65);
      line-height: 1.6;
    }

    /* === DATA HERO (número grande) === */
    .data-hero {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
    .data-number {
      font-size: 72px;
      font-weight: 900;
      color: var(--gold);
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .data-label {
      font-size: 12px;
      font-weight: 700;
      color: rgba(255,255,255,0.6);
      line-height: 1.3;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* === LISTA PREMIUM === */
    .premium-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .premium-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 13px;
      color: rgba(255,255,255,0.8);
      line-height: 1.4;
    }
    .bullet {
      color: var(--gold);
      font-weight: 900;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* === CTB BUTTON === */
    .ctb-button {
      background: linear-gradient(135deg, #C8A951, #DDB96A);
      color: var(--navy);
      border: none;
      border-radius: 8px;
      padding: 14px 20px;
      font-family: var(--font);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(200,169,81,0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ctb-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 28px rgba(200,169,81,0.5);
    }

    /* === FOOTER === */
    .slide-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .footer-logo {
      font-size: 13px;
      font-weight: 900;
      color: var(--gold);
      letter-spacing: 0.06em;
    }
    .footer-sep {
      color: rgba(255,255,255,0.2);
    }
    .footer-sub {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.4);
    }
    .footer-handle {
      margin-left: auto;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
    }

    /* === NAVEGACIÓN === */
    .nav-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .nav-btn {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 18px;
      cursor: pointer;
      transition: background 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .nav-btn:hover { background: rgba(200,169,81,0.2); }
    .dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      transition: all 0.3s;
      cursor: pointer;
    }
    .dot.active {
      background: var(--gold);
      width: 20px;
      border-radius: 3px;
    }

    /* === DIVISOR DECORATIVO === */
    .gold-line {
      height: 2px;
      background: linear-gradient(90deg, var(--gold), transparent);
      border: none;
      margin: 8px 0;
    }
  </style>
</head>
<body>

<div class="carousel-wrapper" id="carousel">

  <!-- SLIDE 1: PORTADA -->
  <div class="slide active">
    <div class="slide-top">
      <span class="label-authority">⚡ ALERTA CEINCA</span>
      <span class="slide-num">01 / 05</span>
    </div>
    <div class="slide-body">
      <h1 class="headline">TU EMPRESA<br>TIENE UN<br><span class="gold">RIESGO OCULTO</span></h1>
      <hr class="gold-line">
      <p class="subhead">El 78% de las empresas venezolanas tiene actas desactualizadas desde la última reconversión</p>
    </div>
    <div class="ctb-button">
      Escribe <strong>BLINDAJE</strong> por DM →
    </div>
    <div class="slide-footer">
      <span class="footer-logo">CEINCA</span>
      <span class="footer-sep">|</span>
      <span class="footer-sub">Mercantil + IA</span>
      <span class="footer-handle">@ceinca.mercantil</span>
    </div>
  </div>

  <!-- SLIDE 2: DATO IMPACTO -->
  <div class="slide">
    <div class="slide-top">
      <span class="label-authority">📌 DATO CLAVE</span>
      <span class="slide-num">02 / 05</span>
    </div>
    <div class="slide-body">
      <div class="data-hero">
        <span class="data-number">13</span>
        <span class="data-label">CEROS<br>ELIMINADOS</span>
      </div>
      <hr class="gold-line">
      <p class="subhead">Las tres reconversiones monetarias dejaron capitales sociales desactualizados en el 90% de las actas registradas antes de 2021</p>
    </div>
    <div class="slide-footer">
      <span class="footer-logo">CEINCA</span>
      <span class="footer-sep">|</span>
      <span class="footer-sub">Mercantil + IA</span>
      <span class="footer-handle">@ceinca.mercantil</span>
    </div>
  </div>

  <!-- SLIDE 3: LISTA DE RIESGOS -->
  <div class="slide">
    <div class="slide-top">
      <span class="label-authority">🚨 RIESGOS REALES</span>
      <span class="slide-num">03 / 05</span>
    </div>
    <div class="slide-body">
      <h2 class="headline" style="font-size:20px">SI NO ADECÚAS<br><span class="gold">TUS ESTATUTOS</span></h2>
      <ul class="premium-list">
        <li><span class="bullet">▸</span> No puedes vender ni transferir acciones</li>
        <li><span class="bullet">▸</span> El banco puede rechazar tu documentación</li>
        <li><span class="bullet">▸</span> Imposible aumentar capital social</li>
        <li><span class="bullet">▸</span> Multas y paralización en SAREN</li>
      </ul>
    </div>
    <div class="slide-footer">
      <span class="footer-logo">CEINCA</span>
      <span class="footer-sep">|</span>
      <span class="footer-sub">Mercantil + IA</span>
      <span class="footer-handle">@ceinca.mercantil</span>
    </div>
  </div>

  <!-- SLIDE 4: SOLUCIÓN -->
  <div class="slide">
    <div class="slide-top">
      <span class="label-authority">✅ SOLUCIÓN CEINCA</span>
      <span class="slide-num">04 / 05</span>
    </div>
    <div class="slide-body">
      <h2 class="headline" style="font-size:22px">BLINDAJE<br><span class="gold">SOCIETARIO</span><br>EN 3 PASOS</h2>
      <ul class="premium-list">
        <li><span class="bullet">◆</span> Auditoría de actas con IA CEINCA</li>
        <li><span class="bullet">◆</span> Adecuación de capital con validación SAREN</li>
        <li><span class="bullet">◆</span> Protocolización y entrega de blindaje total</li>
      </ul>
    </div>
    <div class="slide-footer">
      <span class="footer-logo">CEINCA</span>
      <span class="footer-sep">|</span>
      <span class="footer-sub">Mercantil + IA</span>
      <span class="footer-handle">@ceinca.mercantil</span>
    </div>
  </div>

  <!-- SLIDE 5: CIERRE CTB -->
  <div class="slide" style="background: linear-gradient(160deg, #122A63 0%, #2D4FA8 100%);">
    <div class="slide-top">
      <span class="label-authority">🔒 ACTÚA HOY</span>
      <span class="slide-num">05 / 05</span>
    </div>
    <div class="slide-body">
      <h2 class="headline" style="font-size:24px">¿TU EMPRESA<br>ESTÁ<br><span class="gold">PROTEGIDA?</span></h2>
      <p class="body-text">Primera revisión gratuita de tus actas constitutivas. Sin compromisos. Con respuesta en menos de 24 horas.</p>
    </div>
    <div class="ctb-button" style="margin-bottom:8px;">
      Escribe <strong>BLINDAJE</strong> al DM ✦
    </div>
    <div class="slide-footer">
      <span class="footer-logo">CEINCA</span>
      <span class="footer-sep">|</span>
      <span class="footer-sub">Mercantil + IA</span>
      <span class="footer-handle">@ceinca.mercantil</span>
    </div>
  </div>

</div>

<!-- CONTROLES -->
<div class="nav-controls">
  <button class="nav-btn" id="prevBtn">‹</button>
  <div class="dots" id="dots"></div>
  <button class="nav-btn" id="nextBtn">›</button>
</div>

<script>
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('dots');
  let current = 0;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goTo(i);
    dotsContainer.appendChild(dot);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    slides[current].classList.add('prev');
    setTimeout(() => slides[current].classList.remove('prev'), 400);

    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');

    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  document.getElementById('nextBtn').onclick = () => goTo(current + 1);
  document.getElementById('prevBtn').onclick = () => goTo(current - 1);

  // Swipe touch
  let touchX = 0;
  const c = document.getElementById('carousel');
  c.addEventListener('touchstart', e => touchX = e.touches[0].clientX);
  c.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });
</script>
</body>
</html>
```

---

## 2. CARD DE PRECIO / SERVICIO

```html
<div class="service-card" style="
  background: linear-gradient(135deg, #1E3A8A 0%, #2D4FA8 100%);
  border: 1px solid rgba(200,169,81,0.25);
  border-radius: 12px;
  padding: 28px 24px;
  max-width: 380px;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
">
  <div style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C8A951;margin-bottom:16px;">
    🔥 OFERTA DE LANZAMIENTO
  </div>
  <h3 style="font-size:22px;font-weight:900;color:#fff;margin-bottom:8px;line-height:1.1;">
    GEM MERCANTIL CEINCA™
  </h3>
  <p style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:20px;">
    Sistema IA especializado en derecho mercantil venezolano. Respuestas precisas en segundos.
  </p>
  <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;margin-bottom:16px;">
    <div style="display:flex;align-items:baseline;gap:12px;">
      <span style="font-size:48px;font-weight:900;color:#C8A951;line-height:1;">$97</span>
      <div>
        <div style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:line-through;">$400</div>
        <div style="font-size:11px;color:#C8A951;font-weight:700;">AHORRA $303</div>
      </div>
    </div>
  </div>
  <button style="
    width:100%;background:linear-gradient(135deg,#C8A951,#DDB96A);
    color:#122A63;border:none;border-radius:8px;padding:14px;
    font-family:'Montserrat',sans-serif;font-size:13px;font-weight:800;
    text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;
  ">
    OBTENER ACCESO AHORA →
  </button>
</div>
```

---

## 3. HERO DE LANDING PAGE

```html
<section style="
  background: linear-gradient(135deg, #122A63 0%, #2D4FA8 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  overflow: hidden;
">
  <!-- Elemento decorativo dorado -->
  <div style="
    position:absolute;top:-100px;right:-100px;
    width:400px;height:400px;
    background:radial-gradient(circle, rgba(200,169,81,0.12) 0%, transparent 70%);
    pointer-events:none;
  "></div>

  <div style="max-width:700px;text-align:center;position:relative;z-index:1;">
    <!-- Eyebrow -->
    <div style="
      display:inline-flex;align-items:center;gap:8px;
      background:rgba(200,169,81,0.1);border:1px solid rgba(200,169,81,0.3);
      border-radius:4px;padding:6px 14px;margin-bottom:28px;
    ">
      <span style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#C8A951;">
        ✦ CEINCA MERCANTIL + IA — 2026
      </span>
    </div>

    <!-- Headline -->
    <h1 style="
      font-size:clamp(36px,6vw,72px);font-weight:900;
      color:#fff;line-height:1.05;letter-spacing:-0.03em;
      text-transform:uppercase;margin-bottom:20px;
    ">
      PROTEGE TU EMPRESA<br>
      <span style="color:#C8A951;">ANTES DE QUE SEA<br>DEMASIADO TARDE</span>
    </h1>

    <!-- Sub -->
    <p style="
      font-size:clamp(16px,2vw,20px);color:rgba(255,255,255,0.7);
      line-height:1.6;margin-bottom:40px;max-width:560px;margin-left:auto;margin-right:auto;
    ">
      Auditoría de actas y estatutos con IA especializada en derecho mercantil venezolano. Detectamos riesgos en minutos, no semanas.
    </p>

    <!-- CTA -->
    <button style="
      background:linear-gradient(135deg,#C8A951,#DDB96A);
      color:#122A63;border:none;border-radius:8px;
      padding:18px 40px;font-family:'Montserrat',sans-serif;
      font-size:15px;font-weight:800;text-transform:uppercase;
      letter-spacing:0.06em;cursor:pointer;
      box-shadow:0 4px 24px rgba(200,169,81,0.4);
    ">
      AUDITAR MI EMPRESA GRATIS →
    </button>
  </div>
</section>
```

---

## 4. SEPARADOR DECORATIVO CEINCA

```html
<!-- Versión horizontal con texto -->
<div style="
  display:flex;align-items:center;gap:16px;
  margin:24px 0;font-family:'Montserrat',sans-serif;
">
  <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(200,169,81,0.5),transparent);"></div>
  <span style="font-size:10px;font-weight:800;letter-spacing:0.15em;color:#C8A951;text-transform:uppercase;">CEINCA™</span>
  <div style="flex:1;height:1px;background:linear-gradient(270deg,rgba(200,169,81,0.5),transparent);"></div>
</div>
```

---

## 5. BADGE / TAG DE ESTADO

```html
<!-- Badge riesgo alto -->
<span style="
  background:rgba(239,68,68,0.15);color:#FCA5A5;
  border:1px solid rgba(239,68,68,0.3);
  border-radius:4px;padding:3px 10px;
  font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
">⚠ RIESGO ALTO</span>

<!-- Badge riesgo bajo -->
<span style="
  background:rgba(34,197,94,0.15);color:#86EFAC;
  border:1px solid rgba(34,197,94,0.3);
  border-radius:4px;padding:3px 10px;
  font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
">✓ EN REGLA</span>

<!-- Badge acción requerida -->
<span style="
  background:rgba(200,169,81,0.15);color:#C8A951;
  border:1px solid rgba(200,169,81,0.3);
  border-radius:4px;padding:3px 10px;
  font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
">◆ ACCIÓN REQUERIDA</span>
```

---

## 6. SISTEMA UNIFICADO DE CARRUSELES — CSS NUEVO (Paso a Paso + Alerta Noticiosa)

**Origen:** `references/swipe-file-carrusel-pasos.md`, `references/carrusel-paso-a-paso-unificado.md`, `references/carrusel-alerta-noticiosa.md`.
Estas clases se SUMAN al `<style>` del carrusel base (sección 1) — no reemplazan nada existente.

```css
/* === LÁMINA CLARA (alternancia navy/cream) === */
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

/* === RECUADRO DE HIGHLIGHT (frase de mayor impacto por lámina) === */
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

/* === HEADLINE con acento itálico (contraste tipográfico sin cambiar de fuente) === */
.headline .accent-italic {
  font-style: italic;
  font-weight: 800;
  color: var(--gold);
}

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
