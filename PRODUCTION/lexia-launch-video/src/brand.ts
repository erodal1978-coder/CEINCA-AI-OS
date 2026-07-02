// Identidad visual oficial CEINCA (MARKETING/MONETIZATION_SCALE.md)
export const NAVY = '#0B1D3A';
export const NAVY_DEEP = '#060F20';
export const GOLD = '#D4AF37';
export const GOLD_LIGHT = '#F2D879';
export const WHITE = '#F7F5EF';
export const MUTED = '#9FB0C9';

export const FPS = 30;

// Estructura NEAPS (MARKETING/NEAPS_AIDA.md) — 35s totales, 1050 frames @30fps
export const TIMING = {
  hook: { from: 0, duration: 6 * FPS }, // N — Núcleo del dolor
  entorno: { from: 6 * FPS, duration: 6 * FPS }, // E — Entorno regulatorio
  producto: { from: 12 * FPS, duration: 9 * FPS }, // A+P — Atención visual / Propuesta de valor
  prueba: { from: 21 * FPS, duration: 7 * FPS }, // Prueba social + bono
  cta: { from: 28 * FPS, duration: 7 * FPS }, // S — Solución / Call to Benefit
};

export const TOTAL_DURATION = 35 * FPS; // 1050 frames
