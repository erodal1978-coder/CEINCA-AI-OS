import React from 'react';
import { GOLD, MUTED } from '../brand';

// Espeja la barra de stats de la landing (lexia-ceinca.vercel.app) para
// mantener el mismo lenguaje visual entre landing, video y piezas de campaña.
export const StatsRow: React.FC<{
  stats: { n: string; l: string }[];
}> = ({ stats }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      gap: 1,
      background: 'rgba(212,175,55,0.2)',
      border: '1px solid rgba(212,175,55,0.25)',
      borderRadius: 16,
      overflow: 'hidden',
    }}
  >
    {stats.map((s) => (
      <div key={s.l} style={{ background: '#132848', padding: '18px 6px', textAlign: 'center' }}>
        <div style={{ fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif', fontWeight: 900, fontSize: 30, color: GOLD, lineHeight: 1 }}>
          {s.n}
        </div>
        <div
          style={{
            fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            fontWeight: 700,
            fontSize: 12,
            color: MUTED,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginTop: 4,
            lineHeight: 1.2,
          }}
        >
          {s.l}
        </div>
      </div>
    ))}
  </div>
);
