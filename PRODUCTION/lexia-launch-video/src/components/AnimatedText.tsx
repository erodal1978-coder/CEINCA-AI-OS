import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const AnimatedText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
}> = ({
  children,
  delay = 0,
  fontSize = 64,
  color = '#F7F5EF',
  fontWeight = 800,
  align = 'center',
  lineHeight = 1.15,
  letterSpacing = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delay);

  const progress = spring({ frame: local, fps, config: { damping: 200, stiffness: 210 } });
  const translateY = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
        fontWeight,
        fontSize,
        color,
        textAlign: align,
        lineHeight,
        letterSpacing,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
};
