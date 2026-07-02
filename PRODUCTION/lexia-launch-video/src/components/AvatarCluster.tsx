import React, { useState } from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { GOLD, GOLD_LIGHT, NAVY_DEEP } from '../brand';

// Slots para fotos reales de la carpeta "Jornadas" (prueba social).
// Para activarlas: copiar los archivos a public/images/jornadas/1.jpg ... 5.jpg
// Si el archivo no existe todavía, se muestra un avatar dorado de relleno
// para que el proyecto siga siendo renderizable sin los assets finales.
const SLOTS = ['jornadas/1.jpg', 'jornadas/2.jpg', 'jornadas/3.jpg', 'jornadas/4.jpg', 'jornadas/5.jpg'];

const AvatarSlot: React.FC<{ slot: string; scale: number; opacity: number; zIndex: number; marginLeft: number }> = ({
  slot,
  scale,
  opacity,
  zIndex,
  marginLeft,
}) => {
  const [failed, setFailed] = useState(false);
  const size = 130;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        marginLeft,
        border: `4px solid ${GOLD}`,
        overflow: 'hidden',
        background: `radial-gradient(circle at 35% 30%, ${GOLD_LIGHT}, ${GOLD} 70%, ${NAVY_DEEP} 100%)`,
        transform: `scale(${scale})`,
        opacity,
        zIndex,
        boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
      }}
    >
      {!failed && (
        <Img
          src={staticFile(`images/${slot}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};

export const AvatarCluster: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {SLOTS.map((slot, i) => {
        const local = Math.max(0, frame - delay - i * 4);
        const progress = spring({ frame: local, fps, config: { damping: 16 } });
        const scale = interpolate(progress, [0, 1], [0.4, 1]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <AvatarSlot
            key={slot}
            slot={slot}
            scale={scale}
            opacity={opacity}
            zIndex={SLOTS.length - i}
            marginLeft={i === 0 ? 0 : -130 * 0.28}
          />
        );
      })}
    </div>
  );
};
