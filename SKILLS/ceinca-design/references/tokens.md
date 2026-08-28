# CEINCA Design Tokens — Referencia Completa

## CSS Variables (copiar en todo proyecto)

```css
:root {
  /* === COLORES === */
  --navy:          #122A63;
  --navy-mid:      #1E3A8A;
  --navy-light:    #2D4FA8;
  --gold:          #C8A951;
  --gold-dark:     #A8892E;
  --gold-light:    #DDB96A;
  --white:         #FFFFFF;
  --cream:         #FAF6ED;
  --carbon:        #1C1C1E;
  --gray-soft:     #94A3B8;
  --alert-red:     #D64545;

  /* === GRADIENTES === */
  --grad-gold:     linear-gradient(135deg, #C8A951 0%, #DDB96A 50%, #A8892E 100%);
  --grad-navy:     linear-gradient(180deg, #122A63 0%, #1E3A8A 100%);
  --grad-overlay:  linear-gradient(180deg, rgba(18,42,99,0) 0%, rgba(18,42,99,0.95) 100%);
  --grad-hero:     linear-gradient(135deg, #122A63 0%, #2D4FA8 100%);

  /* === TIPOGRAFÍA === */
  --font-main:     'Montserrat', -apple-system, sans-serif;
  --fw-regular:    400;
  --fw-semibold:   600;
  --fw-bold:       700;
  --fw-extrabold:  800;
  --fw-black:      900;

  /* Escala de tamaños */
  --text-xs:    11px;
  --text-sm:    13px;
  --text-base:  16px;
  --text-md:    18px;
  --text-lg:    22px;
  --text-xl:    28px;
  --text-2xl:   36px;
  --text-3xl:   48px;
  --text-4xl:   64px;
  --text-hero:  80px;

  /* === ESPACIADO === */
  --space-xs:    8px;
  --space-sm:   16px;
  --space-md:   24px;
  --space-lg:   32px;
  --space-xl:   48px;
  --space-2xl:  64px;
  --space-3xl:  96px;

  /* === BORDES === */
  --radius-none:  0px;
  --radius-sm:    4px;
  --radius-md:    8px;
  --radius-lg:    12px;
  --radius-xl:    20px;
  --radius-pill:  999px;

  /* === SOMBRAS === */
  --shadow-sm:    0 2px 8px rgba(0,0,0,0.12);
  --shadow-md:    0 4px 24px rgba(0,0,0,0.18);
  --shadow-lg:    0 8px 40px rgba(0,0,0,0.28);
  --shadow-gold:  0 4px 20px rgba(200,169,81,0.30);
  --shadow-navy:  0 4px 20px rgba(18,42,99,0.40);
  --shadow-inner: inset 0 1px 0 rgba(255,255,255,0.08);

  /* === TRANSICIONES === */
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-slow:   400ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Escala Tipográfica por Contexto

### Carrusel 1080×1440px

| Elemento         | Tamaño | Peso     | Color          |
|-----------------|--------|----------|----------------|
| Número de slide  | 13px   | SemiBold | gold 60%       |
| Label/etiqueta   | 12px   | Bold 700 | gold           |
| Headline         | 52-72px| ExtraBold| white          |
| Sub-headline     | 24-32px| SemiBold | white 85%      |
| Cuerpo           | 18-22px| Regular  | white 75%      |
| Footer brand     | 14px   | SemiBold | white 60%      |
| Número grande    | 96-120px| Black   | gold           |

### Landing Page / HTML

| Elemento         | Tamaño | Peso     |
|-----------------|--------|----------|
| H1 Hero          | 48-72px| ExtraBold|
| H2 Sección       | 32-40px| ExtraBold|
| H3 Subsección    | 24px   | Bold     |
| Eyebrow/Label    | 12px   | Bold+UC  |
| Body texto       | 16-18px| Regular  |
| Caption          | 13px   | Regular  |
| Button           | 14-16px| Bold     |

## Combinaciones de Color Seguras (Contraste AA+)

| Texto      | Fondo       | Ratio | Estado |
|-----------|-------------|-------|--------|
| #FFFFFF   | #122A63     | 16:1  | ✅ AAA  |
| #FFFFFF   | #1E3A8A     | 13:1  | ✅ AAA  |
| #C8A951   | #122A63     | 7.2:1 | ✅ AA  |
| #122A63   | #FAF6ED     | 15:1  | ✅ AAA  |
| #122A63   | #C8A951     | 7.2:1 | ✅ AA  |
| #1C1C1E   | #FAF6ED     | 17:1  | ✅ AAA  |

⚠️ EVITAR: Blanco sobre dorado (ratio 1.5:1 — ilegible)

## Animaciones Estándar

```css
/* Entrada suave de slide/card */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Pulse dorado para CTA */
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,81,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(200,169,81,0); }
}

/* Shimmer para elementos de carga */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Uso recomendado: */
.slide { animation: fadeInUp 0.4s var(--transition-slow); }
.ctb-button { animation: goldPulse 2s infinite; }
```
