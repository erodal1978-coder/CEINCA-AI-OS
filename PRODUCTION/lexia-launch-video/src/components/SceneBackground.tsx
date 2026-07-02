import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { GOLD, NAVY, NAVY_DEEP } from '../brand';

// Fondo navy corporativo con viñeta y textura de rejilla sutil (evita el
// look de "documento legal" clásico prohibido en MONETIZATION_SCALE.md).
export const SceneBackground: React.FC<{ children: React.ReactNode; goldPulse?: boolean }> = ({
  children,
  goldPulse = false,
}) => {
  const frame = useCurrentFrame();
  const pulse = goldPulse ? interpolate(Math.sin(frame / 14), [-1, 1], [0.08, 0.22]) : 0.12;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 90% at 50% 20%, ${NAVY} 0%, ${NAVY_DEEP} 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(212,175,55,0.045) 0px, rgba(212,175,55,0.045) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, rgba(212,175,55,0.045) 0px, rgba(212,175,55,0.045) 1px, transparent 1px, transparent 64px)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at 50% 0%, rgba(212,175,55,${pulse}) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 260px 90px ${NAVY_DEEP}`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const GoldDivider: React.FC<{ width?: number }> = ({ width = 140 }) => (
  <div
    style={{
      width,
      height: 4,
      borderRadius: 4,
      background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
    }}
  />
);
