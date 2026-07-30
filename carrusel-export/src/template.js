// Genera el HTML/CSS de una lámina de carrusel "paso a paso" CEINCA.
// Fuente de verdad del diseño: SKILLS/ceinca-design/references/components.md
// (sección 1, base) + carrusel-paso-a-paso-unificado.md (secciones 2-5).
// Dimensiones: SKILLS/ceinca-design/SKILL.md → "Carrusel Instagram (formato principal)".

export const CANVAS = {
  previewWidth: 432,
  previewHeight: 576,
  deviceScaleFactor: 2.5, // 432*2.5=1080, 576*2.5=1440
};

const STYLE = `
  :root {
    --navy: #0B1D3A; --navy-mid: #132848; --navy-light: #1A3560;
    --gold: #C8A951; --gold-light: #DDB96A; --gold-dark: #A8892E;
    --white: #FFFFFF; --cream: #FAF6ED;
    --font: 'Montserrat', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; }
  body { font-family: var(--font); }

  .carousel-wrapper {
    width: ${CANVAS.previewWidth}px;
    height: ${CANVAS.previewHeight}px;
    position: relative;
    overflow: hidden;
  }

  .slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: var(--navy);
    padding: 36px 24px 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .slide.light { background: var(--cream); }
  .slide.light .headline { color: var(--navy); }
  .slide.light .subhead,
  .slide.light .body-text { color: rgba(11,29,58,0.65); }
  .slide.light .label-authority {
    color: var(--navy-mid);
    background: rgba(11,29,58,0.06);
    border-color: rgba(11,29,58,0.15);
  }
  .slide.light .footer-sub,
  .slide.light .footer-handle { color: rgba(11,29,58,0.45); }
  .slide.light .footer-logo { color: var(--gold-dark); }
  .slide.light .slide-footer { border-top-color: rgba(11,29,58,0.1); }
  .slide.light .progress-track { background: rgba(11,29,58,0.1); }
  .slide.light .highlight-box { color: var(--navy); border-color: var(--gold-dark); }

  .slide-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .label-authority {
    font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold); background: rgba(200,169,81,0.12);
    border: 1px solid rgba(200,169,81,0.3); padding: 4px 10px; border-radius: 4px;
  }

  .progress-wrap { display: flex; align-items: center; gap: 8px; }
  .progress-track { width: 70px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 999px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--gold); border-radius: 999px; }
  .progress-count { font-size: 11px; font-weight: 700; color: var(--gold); white-space: nowrap; }
  .slide.light .progress-count { color: var(--gold-dark); }

  .slide-body { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; padding: 20px 0; }
  .headline {
    font-size: 28px; font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;
    text-transform: uppercase; color: var(--white);
  }
  .headline .gold { color: var(--gold); }
  .headline .accent-italic { font-style: italic; font-weight: 800; color: var(--gold); }
  .subhead { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.75); line-height: 1.5; }

  .premium-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .premium-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.4; }
  .slide.light .premium-list li { color: rgba(11,29,58,0.8); }
  .bullet { color: var(--gold); font-weight: 900; flex-shrink: 0; margin-top: 1px; }
  .slide.light .bullet { color: var(--gold-dark); }

  .highlight-box {
    border: 1.5px solid var(--gold); border-radius: 10px; padding: 14px 16px;
    font-size: 14px; font-weight: 700; line-height: 1.4; color: var(--white); text-align: center;
  }

  .badge-urgent {
    font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    color: #FFFFFF; background: #D64545; border: 1px solid rgba(255,255,255,0.25);
    padding: 4px 10px; border-radius: 4px;
  }

  .check-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.4; }
  .check-list .check { color: #4ADE80; font-weight: 900; flex-shrink: 0; margin-top: 1px; }
  .slide.light .check-list li { color: rgba(11,29,58,0.85); }

  .gold-line { height: 2px; background: linear-gradient(90deg, var(--gold), transparent); border: none; margin: 8px 0; }

  .ctb-button {
    background: linear-gradient(135deg, #C8A951, #DDB96A);
    color: var(--navy); border: none; border-radius: 8px; padding: 14px 20px;
    font-family: var(--font); font-size: 13px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(200,169,81,0.35);
  }

  .slide-footer { display: flex; align-items: center; gap: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
  .footer-logo { font-size: 13px; font-weight: 900; color: var(--gold); letter-spacing: 0.06em; }
  .footer-sep { color: rgba(255,255,255,0.2); }
  .footer-sub { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); }
  .footer-handle { margin-left: auto; font-size: 11px; color: rgba(255,255,255,0.4); }
`;

// Escapa texto plano — el copy siempre entra como texto, nunca como HTML crudo.
function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// headline: { lines: string[], accentLineIndex?: number, accentClass?: "gold"|"accent-italic" }
function renderHeadline(headline, defaultAccentClass) {
  const accentClass = headline.accentClass || defaultAccentClass;
  return headline.lines
    .map((line, i) =>
      i === headline.accentLineIndex
        ? `<span class="${accentClass}">${esc(line)}</span>`
        : esc(line)
    )
    .join("<br>");
}

// cta: { text: string, keyword?: string } — el keyword se resalta en <strong>, todo escapado.
function renderCta(cta) {
  const escaped = esc(cta.text);
  if (!cta.keyword) return escaped;
  const escapedKeyword = esc(cta.keyword);
  return escaped.replace(escapedKeyword, `<strong>${escapedKeyword}</strong>`);
}

// urgent: true usa el badge rojo de alerta noticiosa en vez del label-authority dorado.
function renderKicker(slide) {
  const cls = slide.urgent ? "badge-urgent" : "label-authority";
  return `<span class="${cls}">${esc(slide.kicker)}</span>`;
}

// list: "check" usa el checklist con ✅ de alerta noticiosa en vez del premium-list con ▸.
function renderList(items, list) {
  if (list === "check") {
    return `<ul class="check-list">
      ${items.map((b) => `<li><span class="check">✅</span> ${esc(b)}</li>`).join("\n")}
    </ul>`;
  }
  return `<ul class="premium-list">
      ${items.map((b) => `<li><span class="bullet">▸</span> ${esc(b)}</li>`).join("\n")}
    </ul>`;
}

function renderFooter(footer) {
  return `
    <div class="slide-footer">
      <span class="footer-logo">${esc(footer.logo)}</span>
      <span class="footer-sep">|</span>
      <span class="footer-sub">${esc(footer.sub)}</span>
      <span class="footer-handle">${esc(footer.handle)}</span>
    </div>`;
}

function renderCoverOrClose(slide, footer) {
  return `
    <div class="slide">
      <div class="slide-top">
        ${renderKicker(slide)}
      </div>
      <div class="slide-body">
        <h1 class="headline">${renderHeadline(slide.headline, "gold")}</h1>
        <hr class="gold-line">
        <p class="subhead">${esc(slide.subhead)}</p>
      </div>
      ${
        slide.cta
          ? `<div class="ctb-button">${renderCta(slide.cta)} →</div>`
          : ""
      }
      ${renderFooter(footer)}
    </div>`;
}

function renderStep(slide, footer) {
  const bgClass = slide.background === "light" ? " light" : "";
  const pct = Math.round((slide.stepNumber / slide.stepTotal) * 100);
  return `
    <div class="slide${bgClass}">
      <div class="slide-top">
        ${renderKicker(slide)}
        <div class="progress-wrap">
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="progress-count">${slide.stepNumber}/${slide.stepTotal}</span>
        </div>
      </div>
      <div class="slide-body">
        <h2 class="headline">${renderHeadline(slide.headline, "accent-italic")}</h2>
        ${renderList(slide.bullets, slide.list)}
        ${
          slide.highlight
            ? `<div class="highlight-box">${esc(slide.highlight)}</div>`
            : ""
        }
      </div>
      ${renderFooter(footer)}
    </div>`;
}

export function renderSlideBody(slide, footer) {
  if (slide.type === "step") return renderStep(slide, footer);
  if (slide.type === "cover" || slide.type === "close")
    return renderCoverOrClose(slide, footer);
  throw new Error(`Tipo de slide desconocido: "${slide.type}"`);
}

export function buildSlidePage(slide, footer, fontFaceCSS) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${fontFaceCSS}\n${STYLE}</style>
</head>
<body>
  <div class="carousel-wrapper">
    ${renderSlideBody(slide, footer)}
  </div>
</body>
</html>`;
}
