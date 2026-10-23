/* fx.js — runtime común de las plantillas. Determinista: todo azar sale de una semilla y nada depende del reloj. */
(function () {
  const RAW = window.__FX_PARAMS__ || {};
  const W = 1080, H = 1920;

  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const isMedia = (s) => typeof s === 'string' && /\.(png|jpe?g|svg|webp|gif|mp4|webm)$/i.test(s);
  const isImg = (s) => typeof s === 'string' && /\.(png|jpe?g|svg|webp|gif)$/i.test(s);
  const fmt = (n, dec = 0) => { const neg = n < 0; const s = Math.abs(n).toFixed(dec); const [i, d] = s.split('.'); const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (neg ? '-' : '') + g + (d ? ',' + d : ''); };

  /* texto con **acento** → nodos seguros (sin innerHTML) */
  function setRich(el, text) {
    el.textContent = '';
    String(text ?? '').split('**').forEach((part, i) => {
      if (!part) return;
      if (i % 2) { const b = document.createElement('span'); b.className = 'fx-hl'; b.textContent = part; el.appendChild(b); }
      else el.appendChild(document.createTextNode(part));
    });
    return el;
  }
  const el = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };

  /* Íconos propios (trazo, 24×24). Nombres usados por mundo-app / orbita. */
  const ICONS = {
    doc: 'M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2.2 2.2L15.5 10',
    chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-8',
    bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 21h4',
    chat: 'M4 5h16v11H9l-5 4z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7',
    lock: 'M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2-.5-2.5-1.5 M12 6.5V8 M12 16v1.5',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
    mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
    pin: 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    building: 'M5 21V4h9v17 M14 9h5v12 M8 8h3 M8 12h3 M8 16h3 M3 21h18',
  };
  function icon(name, cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    if (cls) svg.setAttribute('class', cls);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', ICONS[name] || ICONS.star); svg.appendChild(p);
    return svg;
  }

  /* Dibuja un <path>/<polyline> con stroke-dashoffset (sin plugins). Devuelve el tween vars base. */
  function drawable(node) {
    const len = node.getTotalLength ? node.getTotalLength() : 1000;
    node.style.strokeDasharray = len + ' ' + len; node.style.strokeDashoffset = len;
    return len;
  }

  /* Tween de un valor numérico que llama fn(valor) en CADA render del timeline (también al hacer seek con
     eventos suprimidos, como hace el motor de render). Usa modifiers en vez de onUpdate a propósito. */
  function drive(tl, from, to, vars, fn, at) {
    const proxy = { v: from };
    fn(from);
    return tl.to(proxy, Object.assign({}, vars, { v: to, modifiers: { v: (x) => { fn(x); return x; } } }), at);
  }

  function init(defaults) {
    const P = Object.assign({}, defaults || {}, RAW);
    const root = document.getElementById('root');
    const D = Number(P.duracion) || 4;
    const zs = P.zonaSegura || {};
    const top = zs.arriba ?? 250, bottom = zs.abajo ?? 350;
    const hasTitle = !!P.tituloFijo, hasCounter = !!P.contador;
    root.style.setProperty('--safe-top', top + 'px');
    root.style.setProperty('--safe-bottom', bottom + 'px');
    root.style.setProperty('--content-top', (top + (hasTitle || hasCounter ? 110 : 0)) + 'px');
    if (hasTitle || hasCounter) {
      const ov = el('div', 'fx-overlay', root); ov.id = 'fx-overlay';
      el('div', 'fx-fixed-title', ov, hasTitle ? P.tituloFijo : '');
      if (hasCounter) {
        const c = typeof P.contador === 'string' ? P.contador : String(P.contador.n).padStart(2, '0') + '/' + String(P.contador.total).padStart(2, '0');
        el('div', 'fx-counter', ov, c);
      }
    }
    const tl = gsap.timeline({ paused: true });
    return { P, D, tl, root, area: document.getElementById('area'), rng: mulberry32(Number(P.semilla ?? 1)) };
  }
  /* Orbe difuso que deriva por el fondo (opt-in con "orbe": true). Sólo transform → determinista. */
  function orbe(ctx) {
    if (!ctx.P.orbe) return null;
    const o = document.createElement('div'); o.className = 'fx-orbe'; ctx.root.insertBefore(o, ctx.root.firstChild);
    ctx.tl.fromTo(o, { x: 0, y: 0, scale: 1 }, { x: 420, y: 700, scale: 1.25, duration: ctx.D, ease: 'sine.inOut' }, 0);
    return o;
  }
  /* Polígono de papel rasgado (clip-path). Sólo el ANCHO es fijo: las alturas van en % / calc(100% - Npx), así la forma no
     depende de medir el texto (que cambia cuando carga la fuente real). Usa la semilla del contexto. */
  function rasgado(rng, w, amp = 11, paso = 30, nV = 10) {
    const pts = [];
    const j = () => (rng() - 0.5) * 2 * amp;
    const f = (n) => n.toFixed(1);
    for (let x = 0; x <= w; x += paso) pts.push(f(x) + 'px ' + f(Math.max(0, j() + amp)) + 'px');
    for (let k = 1; k < nV; k++) pts.push('calc(100% - ' + f(Math.max(0, j() + amp * 0.6)) + 'px) ' + f((k * 100) / nV) + '%');
    for (let x = w; x >= 0; x -= paso) pts.push(f(x) + 'px calc(100% - ' + f(Math.max(0, j() + amp)) + 'px)');
    for (let k = nV - 1; k >= 1; k--) pts.push(f(Math.max(0, j() + amp * 0.6)) + 'px ' + f((k * 100) / nV) + '%');
    return 'polygon(' + pts.join(',') + ')';
  }
  /* Ejecuta fn cuando las fuentes REALES del tema ya cargaron. (document.fonts.ready no sirve solo: al correr el script todavía no
     se ha pedido ninguna fuente y ya está resuelto; hay que forzar la carga con fonts.load de las familias/pesos del tema.) */
  function afterFonts(fn) {
    const cs = getComputedStyle(document.getElementById('root'));
    const g = (k) => cs.getPropertyValue(k).trim();
    const loads = [g('--fx-fw-display') + ' 40px ' + g('--fx-font-display'), g('--fx-fw-strong') + ' 32px ' + g('--fx-font-body'),
      g('--fx-fw-body') + ' 32px ' + g('--fx-font-body'), '400 32px ' + g('--fx-font-mono')].map((f) => document.fonts.load(f).catch(() => null));
    Promise.all(loads).then(() => document.fonts.ready).then(fn);
  }
  /* Elige, entre colores del tema, el de mayor contraste (WCAG) sobre un fondo del tema. Devuelve "var(--fx-...)".
     Sirve para texto sobre piezas de color que cambian según el tema (p. ej. --fx-accent-2). Sólo lee variables del tema. */
  function mejorTexto(fondoVar, cands) {
    const cs = getComputedStyle(document.getElementById('root'));
    const lum = (v) => { const m = /^#?([0-9a-f]{6})$/i.exec(cs.getPropertyValue(v).trim()); if (!m) return null; const n = parseInt(m[1], 16);
      const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const lb = lum(fondoVar); let best = null, bc = -1;
    (cands || ['--fx-text', '--fx-bg', '--fx-on-accent']).forEach((v) => { const l = lum(v); if (l == null || lb == null) return;
      const k = (Math.max(l, lb) + 0.05) / (Math.min(l, lb) + 0.05); if (k > bc) { bc = k; best = v; } });
    return 'var(' + (best || '--fx-text') + ')';
  }
  /* Error de plantilla explícito: queda en window.__fxErrors (render.mjs lo lee aunque ocurra dentro de una promesa) y además lanza. */
  function fail(msg) { (window.__fxErrors = window.__fxErrors || []).push(msg); throw new Error(msg); }
  function finish(ctx) {
    ctx.tl.to({}, { duration: 0.0001 }, ctx.D - 0.0001); // fija la duración exacta del timeline
    window.__fxDuration = ctx.D;
    return ctx.tl; // la plantilla lo registra inline en window.__timelines (lo exige el lint de HyperFrames)
  }
  const dim = (src) => (RAW.__dims && RAW.__dims[src]) || null; // [ancho, alto, duración] de un asset ya reescrito
  window.FX = { drive, dim, W, H, init, finish, fail, afterFonts, mejorTexto, orbe, rasgado, setRich, el, icon, ICONS, drawable, isMedia, isImg, fmt, mulberry32 };
})();
