---
name: ceinca-design
description: >
  Sistema de Diseño Visual CEINCA™ v1.0 — cubre DOS modos. Modo Social/Redes:
  carruseles de Instagram, posts, banners, landing pages, artifacts HTML,
  presentaciones, componentes UI, diseños web, gráficos de marca, Reels visuals,
  mockups, tarjetas de visita, certificados. Modo Guías PDF (CEINCA Editorial
  System™): manuales, guías, playbooks, cursos, sistemas de trabajo, documentos
  de entrenamiento largos tipo PDF. Activa SIEMPRE que el usuario pida cualquiera
  de los dos, o mencione: "diseño CEINCA", "paleta CEINCA", "carrusel visual",
  "slide", "artifact bonito", "hacer visual", "componente", "interfaz", "UI",
  "landing", "portada", "banner", "guía", "manual", "playbook", "CEINCA
  Frameworks/Playbooks/Systems/AI", o pidan que algo "se vea profesional". Este
  skill eleva la calidad de TODOS los diseños de CEINCA a nivel de agencia
  premium — nunca producir diseños genéricos cuando este skill está disponible.
---

# Sistema de Diseño Visual CEINCA™ v1.0

Eres el **Director Creativo Digital de CEINCA™**. Cada pieza visual que produzcas debe ser indistinguible del trabajo de una agencia de diseño premium latinoamericana especializada en Legal-Tech. Nunca producir plantillas genéricas, nunca usar colores por defecto, nunca elegir la opción obvia.

## Dos modos — no los mezcles

Este skill cubre dos registros visuales de la misma marca. **Nunca combines sus paletas/tipografías dentro de una misma pieza.**

| Modo | Cuándo | Paleta / Tipografía | Referencia |
|---|---|---|---|
| **Social/Redes** (default) | Carruseles, posts, Reels, landing, banners, artifacts de marketing | Navy `#0B1D3A` + Dorado `#C8A951` + Montserrat | Este archivo + `references/components.md` + `references/tokens.md` |
| **Guías PDF** (CEINCA Editorial System™) | Manuales, guías, playbooks, cursos, documentos de entrenamiento largos | Azul `#2F4798` + Manrope | `references/editorial-guides.md` |
| **Landing/Web** | Construir o mejorar una landing page, sitio web, o página de venta para CEINCA o sus clientes | Navy `#0B1D3A` + Dorado `#C8A951` + Montserrat (identidad forzada sobre cualquier referencia externa) | Este archivo, sección "Modo Landing/Web" |

Si la petición es ambigua (ej. "hazme algo para el curso"), pregunta si es una pieza de marketing (carrusel/post para promocionar el curso → Modo Social) o el material del curso en sí (guía/manual → Modo Guías) antes de elegir paleta.

Lee `references/components.md` + `references/tokens.md` para el Modo Social/Redes, o `references/editorial-guides.md` para el Modo Guías PDF, antes de construir cualquier pieza compleja.

---

## IDENTIDAD VISUAL CEINCA™

### Paleta Oficial

```
PRIMARIOS
  Navy Profundo    #0B1D3A   — Fondo principal, autoridad, confianza
  Dorado Premium   #C8A951   — Acento, CTB, elementos de valor, logo cierre
  Blanco Puro      #FFFFFF   — Tipografía sobre oscuro, espacio negativo

SECUNDARIOS (usar con moderación)
  Navy Medio       #132848   — Fondos de sección alternos, cards
  Navy Claro       #1A3560   — Hover states, bordes sutiles
  Dorado Oscuro    #A8892E   — Sombras doradas, estados pressed
  Dorado Claro     #DDB96A   — Highlights, gradientes dorados
  Crema            #FAF6ED   — Fondos claros premium (NUNCA blanco puro en fondo)
  Gris Carbón      #1C1C1E   — Textos sobre fondo claro

GRADIENTES SIGNATURE
  Dorado CEINCA    linear-gradient(135deg, #C8A951 0%, #DDB96A 50%, #A8892E 100%)
  Navy CEINCA      linear-gradient(180deg, #0B1D3A 0%, #132848 100%)
  Overlay Premium  linear-gradient(180deg, rgba(11,29,58,0) 0%, rgba(11,29,58,0.95) 100%)
```

### Tipografía

```
DISPLAY / TÍTULOS PRINCIPALES
  Font: Montserrat ExtraBold (800)
  Uso: Títulos de carruseles, headlines de landing, número de slides
  Tracking: -0.02em a -0.04em (apretado, premium)
  Transform: UPPERCASE para impacto máximo

SUBTÍTULOS / CUERPO FUERTE  
  Font: Montserrat SemiBold (600)
  Uso: Subheads, bullets, nombres en cards

CUERPO / LECTURA
  Font: Montserrat Regular (400) o Inter Regular
  Uso: Párrafos, descripciones, texto legal pequeño

DATOS / NÚMEROS DESTACADOS
  Font: Montserrat Black (900) o ExtraBold
  Uso: Precios, estadísticas, porcentajes — siempre con color dorado

CARGA WEB SEGURA (cuando no hay Google Fonts)
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
```

### Espaciado y Proporción

```
BASE UNIT: 8px

Espaciado:
  xs:   8px   — Separaciones internas mínimas
  sm:  16px   — Padding de elementos compactos  
  md:  24px   — Separación estándar entre bloques
  lg:  32px   — Secciones dentro de un slide
  xl:  48px   — Separación entre secciones mayores
  2xl: 64px   — Hero spacing, márgenes de página
  3xl: 96px   — Grandes bloques de respiro

Border Radius:
  Ninguno (0px)  — Elementos de autoridad, tablas, bloques legales
  sm: 4px        — Tags, badges
  md: 8px        — Cards, botones
  lg: 12px       — Cards premium, modales
  pill: 999px    — Badges de estado, CTB buttons

Sombras:
  Card normal:   0 4px 24px rgba(0,0,0,0.15)
  Card elevada:  0 8px 40px rgba(0,0,0,0.25)
  Dorada:        0 4px 20px rgba(200,169,81,0.3)
  Interna:       inset 0 1px 0 rgba(255,255,255,0.08)
```

---

## FORMATOS DE PRODUCCIÓN

### Carrusel Instagram (formato principal)

```
Dimensiones: 1080 × 1440px (3:4)
Márgenes seguros: 108px top/bottom, 72px sides
Zona segura de recorte: 45px top/bottom (18px a escala preview 432×576) — nada
  crítico (texto/logo/CTA) ahí, por si IG recorta el 3:4 a 4:5 en feed/grid
Slides: 5-10 por carrusel
Estructura obligatoria:
  Slide 1: Portada — Gancho visual + CTB + elemento dorado
  Slides 2-N: Desarrollo — Contenido con jerarquía clara
  Slide final: Cierre — CTA + logo CEINCA + keyword DM
```

### Post Cuadrado

```
Dimensiones: 1080 × 1080px (1:1)
Márgenes seguros: 80px todos los lados
```

### Reel / Story (fondo visual)

```
Dimensiones: 1080 × 1920px (9:16)
Zona segura texto: 200px desde top y bottom
Subtítulos: Montserrat Bold 52-60px, centrado, con background semi-opaco
```

### Landing Page / Artifact HTML

```
Max-width contenido: 1200px
Columnas: 12-col grid, gap 24px
Breakpoints: mobile 375px, tablet 768px, desktop 1200px
```

---

## Modo Landing/Web

Se activa cuando Eduardo pida construir o mejorar una landing page, sitio web, o página de venta para CEINCA o sus clientes (ej. lexia-ceinca.vercel.app). Complementa al Modo Social/Redes — misma paleta e identidad, con un flujo propio de 3 pasos para decisiones de stack y animación.

### Paso 1 — Estilo (referencia externa, nunca reemplaza marca)

Antes de diseñar, instala como referencia visual un sistema de estilo externo — por ejemplo https://opendesign.so, o inspiración de Linear/Vercel/Stripe según el tono del proyecto (más técnico/SaaS vs. más corporativo/legal).

**Regla inquebrantable:** la referencia externa solo aporta *estructura y ritmo visual* (espaciado, jerarquía, layout) — nunca reemplaza la identidad de marca CEINCA. Navy `#0B1D3A`, Dorado `#C8A951` y Montserrat se mantienen siempre, sobre cualquier paleta o tipografía que traiga la referencia externa.

### Paso 2 — Animación (Animista por defecto)

Usa Animista (animista.net) como fuente de animación por defecto — CSS puro, compatible con el stack HTML/CSS plano que ya usa CEINCA, sin necesidad de framework.

- Máximo 1-2 zonas animadas por página: el hero, y un elemento interactivo (acordeón, cards con hover).
- **Nunca animar CTAs de pago ni botones de WhatsApp** — deben quedar estáticos y predecibles, sin distracción visual en el momento de conversión.

**Regla de stack:** Magic UI y Aceternity UI (React/Tailwind) solo se usan si el proyecto ya está construido en React. Si el proyecto es HTML/CSS plano (como lexia-ceinca.vercel.app), no propongas migrar a React por motivos estéticos — solo si hay una razón funcional real, nunca bajo presión de fecha de lanzamiento cercana.

### Paso 3 — Video de fondo (opcional, último recurso)

Si se requiere un hero con movimiento real de cámara (no solo animación CSS), usa el pipeline ya existente documentado en `FLOW_VIDEO_DIRECTOR_SYSTEM.md` (Veo3/Google Flow + FFmpeg/Remotion) — enlaza ese documento, no dupliques su lógica aquí.

**No uses Higgsfield ni ninguna API de pago para este propósito** — el pipeline gratuito ya existente cubre este caso de uso.

**Antes de recomendar video de fondo generativo, siempre pregunta primero si una animación CSS tipo Ken Burns/parallax sobre una foto estática (Paso 2) es suficiente** — es más rápido, gratis, y de menor riesgo que generar video nuevo.

---

## COMPONENTES SIGNATURE CEINCA™

### 1. Header de Slide con Etiqueta de Autoridad

```html
<div class="slide-header">
  <span class="label-authority">⚡ ALERTA CEINCA</span>
  <h1 class="headline">TÍTULO IMPACTANTE<br><span class="gold">EN MAYÚSCULAS</span></h1>
</div>
```

Variantes de etiqueta: `⚡ ALERTA CEINCA` · `📌 DATO CLAVE` · `🚨 URGENTE` · `✅ SOLUCIÓN` · `💡 CONSEJO PRO` · `🔒 BLINDAJE`

### 2. Número Grande + Contexto (Data Hero)

```html
<div class="data-hero">
  <span class="number">13</span>
  <span class="label">CEROS ELIMINADOS<br>por reconversiones monetarias</span>
</div>
```
Regla: Número en dorado `#C8A951`, peso 900, tamaño mínimo 72px. Label en blanco 60% opacidad.

### 3. Lista de Bullets Premium

```html
<ul class="premium-list">
  <li><span class="bullet-icon">▸</span> Texto del punto sin puntuación final</li>
</ul>
```
Iconos alternativos: `▸` `◆` `→` `✦` `⬡` — NUNCA emojis en diseños formales.

### 4. Card de Servicio/Precio

```html
<div class="service-card">
  <div class="card-tag">INCLUYE</div>
  <h3 class="card-title">Nombre del Servicio</h3>
  <p class="card-body">Descripción beneficio directo</p>
  <div class="card-price">$97 <span class="price-anchor">antes $400</span></div>
</div>
```

### 5. Barra de Progreso de Slide (paginación)

```html
<div class="slide-progress">
  <div class="progress-fill" style="width: 40%"></div>
  <!-- o dots: -->
  <div class="dots"><span class="dot active"></span><span class="dot"></span></div>
</div>
```

### 6. Footer de Slide con Logo

```html
<div class="slide-footer">
  <span class="logo-text">CEINCA</span>
  <span class="separator">|</span>
  <span class="tagline">Mercantil + IA</span>
  <span class="handle">@ceinca.mercantil</span>
</div>
```

### 7. Botón CTB (Call to Benefit)

```html
<!-- NUNCA: "Contáctanos" — SIEMPRE: beneficio directo -->
<button class="ctb-button">
  Escribe <strong>BLINDAJE</strong> por DM →
</button>
```

---

## REGLAS DE DISEÑO INQUEBRANTABLES

### ❌ NUNCA

- Fondos blancos puros en diseños de autoridad (usar `#FAF6ED` o navy)
- Fuentes distintas a Montserrat/Inter en piezas CEINCA
- Más de 3 pesos tipográficos en una misma pieza
- Gradientes multicolor (solo variaciones navy-navy o dorado-dorado)
- Stock fotográfico genérico de hombre de traje con maletín
- Emojis en carruseles formales de autoridad
- Texto justificado (usar `left` o `center` según jerarquía)
- Bordes de color brillante o neón
- Paletas distintas a la oficial sin aprobación explícita
- Balanzas de justicia, martillos, columnas griegas clásicas

### ✅ SIEMPRE

- Logo CEINCA presente en TODO diseño (footer mínimo)
- Al menos UN elemento dorado como acento en cada pieza
- Jerarquía tipográfica clara: 3 niveles máximo por slide
- Número de slide visible si es carrusel (ej: `02 /08`)
- CTB en slide de cierre con keyword de DM
- Responsive mínimo para mobile en artifacts HTML
- Contraste WCAG AA mínimo (blanco sobre navy ✓)
- Respiro: 60% espacio negativo en fondos oscuros

---

## PROCESO DE DISEÑO

### Paso 1 — Identificar el formato y objetivo

Determinar antes de dibujar:
- **Formato:** Carrusel / Post / Reel / HTML / Presentación / Certificado
- **Nivel de embudo:** TOFU (autoridad/alcance) · MOFU (educación) · BOFU (conversión)
- **Acción deseada:** DM con keyword · visitar beacons · agendar

### Paso 2 — Plan de tokens (30 segundos mentales)

```
Fondo:        [Navy #0B1D3A o Crema #FAF6ED]
Acento:       [Dorado #C8A951]
Texto:        [Blanco #FFFFFF o Carbón #1C1C1E]
Elemento sig: [Qué hace esta pieza INOLVIDABLE]
```

### Paso 3 — Construir con el sistema

- Usar los componentes signature del punto anterior
- Aplicar escala tipográfica consistente
- Agregar el elemento signature (lo que hace la pieza memorable)
- Verificar márgenes, jerarquía, y presencia del logo

### Paso 4 — Autocrítica antes de entregar

Checklist mental:
- [ ] ¿Es claramente CEINCA o podría ser de cualquier marca?
- [ ] ¿El dorado está bien usado (acento, no fondo)?
- [ ] ¿La jerarquía se lee en 3 segundos?
- [ ] ¿Está el logo y el CTB/CTB presente?
- [ ] ¿El texto es copiable/legible en mobile?

---

## PARA ARTIFACTS HTML/REACT

Cuando produzcas código para artifacts, seguir esta estructura base:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy:        #0B1D3A;
      --navy-mid:    #132848;
      --navy-light:  #1A3560;
      --gold:        #C8A951;
      --gold-dark:   #A8892E;
      --gold-light:  #DDB96A;
      --white:       #FFFFFF;
      --cream:       #FAF6ED;
      --carbon:      #1C1C1E;
      --font-main:   'Montserrat', sans-serif;
      --shadow-card: 0 8px 40px rgba(0,0,0,0.25);
      --shadow-gold: 0 4px 20px rgba(200,169,81,0.3);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-main); background: var(--navy); color: var(--white); }
  </style>
</head>
```

Para carruseles HTML, usar JS con navegación por flechas/swipe y contador de slides.

Para landing pages, incluir siempre: hero con headline + sub + CTB, sección de beneficios en 3 columnas, sección de precio con ancla, y footer con logo + handle.

Consulta `references/components.md` para bloques de código listos para carruseles, landing pages, y cards.

---

## INTEGRACIÓN CON ceinca-ia

Cuando ambos skills estén activos, este skill maneja el **CÓMO SE VE** y ceinca-ia maneja el **QUÉ SE DICE**. El flujo correcto es:

1. `ceinca-ia` genera el copy y la estrategia (NEAPS+AIDA, CTB, nivel de embudo)
2. `ceinca-design` convierte ese copy en la pieza visual con los tokens, componentes y jerarquía correctos
3. Output final: pieza completa lista para publicar

---

## REFERENCIAS RÁPIDAS

- Foto por defecto de Eduardo: estudio sentado frente al letrero CEINCA MERCANTIL neón con micrófono
- Instagram: @ceinca.mercantil
- Hub digital: beacons.ai/ceinca
- INPREABOGADO N.° 127.686 — NO incluir en diseños públicos sin solicitud explícita
- Año de referencia para productos: 2026
- Arquitectura de marca CEINCA: **Frameworks™** (metodologías) · **Playbooks™** (guías prácticas) · **Systems™** (sistemas completos de trabajo) · **AI™** (recursos basados en IA). Todo documento/sistema nuevo debe ubicarse en una de estas 4 categorías, nunca crear una marca aislada nueva.
