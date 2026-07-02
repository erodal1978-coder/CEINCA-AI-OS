// Identidad visual oficial CEINCA (MARKETING/MONETIZATION_SCALE.md)
export const NAVY = '#0B1D3A';
export const NAVY_DEEP = '#060F20';
export const GOLD = '#D4AF37';
export const GOLD_LIGHT = '#F2D879';
export const WHITE = '#F7F5EF';
export const MUTED = '#9FB0C9';

export const FPS = 30;

// Estructura NEAPS (MARKETING/NEAPS_AIDA.md) — 42s totales, 1260 frames @30fps
// Duraciones ampliadas frente a la v1 (35s) para dar más tiempo de lectura
// a los bloques con más texto (Entorno, reveal de 120 formatos, CTA final).
export const TIMING = {
  hook: { from: 0, duration: 7 * FPS }, // N — Núcleo del dolor
  entorno: { from: 7 * FPS, duration: 7 * FPS }, // E — Entorno regulatorio
  producto: { from: 14 * FPS, duration: 12 * FPS }, // A+P — Atención visual / Propuesta de valor
  prueba: { from: 26 * FPS, duration: 8 * FPS }, // Prueba social + bono
  cta: { from: 34 * FPS, duration: 8 * FPS }, // S — Solución / Call to Benefit
};

export const TOTAL_DURATION = 42 * FPS; // 1260 frames
