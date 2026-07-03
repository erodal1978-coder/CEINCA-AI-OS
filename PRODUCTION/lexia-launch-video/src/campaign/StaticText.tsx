import React from 'react';

const FONT = '"Arial Black", "Helvetica Neue", Arial, sans-serif';

// Texto estático (sin animación) para piezas de campaña (post/carrusel).
// Usa la misma familia tipográfica que el video para consistencia visual.
export const StaticText: React.FC<{
  children: React.ReactNode;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
}> = ({
  children,
  fontSize = 40,
  color = '#F7F5EF',
  fontWeight = 800,
  align = 'center',
  lineHeight = 1.15,
  letterSpacing = 0,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight,
      fontSize,
      color,
      textAlign: align,
      lineHeight,
      letterSpacing,
    }}
  >
    {children}
  </div>
);
