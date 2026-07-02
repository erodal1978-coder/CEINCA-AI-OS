import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD } from '../brand';

// Fotos reales de las Jornadas CEINCA (Caracas y Táchira) — public/images/jornadas/.
const PHOTOS: { src: string; rotate: number; offsetX: number }[] = [
  { src: 'jornadas/jornada-3.jpg', rotate: -7, offsetX: -150 },
  { src: 'jornadas/jornada-1.jpg', rotate: 3, offsetX: 0 },
  { src: 'jornadas/jornada-2.jpg', rotate: 8, offsetX: 150 },
];

const CARD_W = 210;
const CARD_H = 300;

export const PhotoStack: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ position: 'relative', width: '100%', height: CARD_H + 40, display: 'flex', justifyContent: 'center' }}>
      {PHOTOS.map((photo, i) => {
        const local = Math.max(0, frame - delay - i * 5);
        const progress = spring({ frame: local, fps, config: { damping: 15 } });
        const translateY = interpolate(progress, [0, 1], [50, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <div
            key={photo.src}
            style={{
              position: 'absolute',
              width: CARD_W,
              height: CARD_H,
              left: '50%',
              marginLeft: photo.offsetX - CARD_W / 2,
              transform: `rotate(${photo.rotate}deg) translateY(${translateY}px)`,
              opacity,
              zIndex: i === 1 ? 2 : 1,
              padding: 8,
              background: '#F7F5EF',
              borderRadius: 6,
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              border: `1px solid ${GOLD}`,
            }}
          >
            <Img
              src={staticFile(`images/${photo.src}`)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
            />
          </div>
        );
      })}
    </div>
  );
};
