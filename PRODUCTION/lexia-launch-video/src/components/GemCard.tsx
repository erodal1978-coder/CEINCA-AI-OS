import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_LIGHT, NAVY_DEEP, WHITE } from '../brand';

export const GemCard: React.FC<{
  title: string;
  subtitle: string;
  delay?: number;
}> = ({ title, subtitle, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const scale = spring({ frame: local, fps, config: { damping: 14, mass: 0.6 } });
  const opacity = interpolate(scale, [0, 1], [0, 1]);
  const orbPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.9, 1.06]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${interpolate(scale, [0, 1], [0.8, 1])})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        padding: '46px 54px',
        borderRadius: 32,
        background: 'linear-gradient(160deg, rgba(212,175,55,0.14), rgba(11,29,58,0.4))',
        border: `1px solid rgba(212,175,55,0.5)`,
        boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
        maxWidth: 780,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${GOLD_LIGHT}, ${GOLD} 60%, ${NAVY_DEEP} 100%)`,
          transform: `scale(${orbPulse})`,
          boxShadow: `0 0 60px 10px rgba(212,175,55,0.35)`,
        }}
      />
      <div
        style={{
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 900,
          fontSize: 46,
          color: WHITE,
          textAlign: 'center',
          lineHeight: 1.15,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          fontSize: 28,
          color: '#C9D3E4',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
