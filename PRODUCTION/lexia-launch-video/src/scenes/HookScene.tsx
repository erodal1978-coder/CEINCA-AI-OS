import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { AnimatedText } from '../components/AnimatedText';
import { SceneBackground } from '../components/SceneBackground';
import { GOLD, WHITE } from '../brand';

// N — Núcleo del Dolor (gancho agresivo, alta fricción)
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneBackground>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 80px',
          gap: 28,
        }}
      >
        <AnimatedText delay={0} fontSize={72} fontWeight={900} color={WHITE} lineHeight={1.08}>
          HORAS BUSCANDO
          <br />
          EL FORMATO CORRECTO.
        </AnimatedText>
        <AnimatedText delay={45} fontSize={72} fontWeight={900} color={GOLD} lineHeight={1.08}>
          RIESGO DE QUE EL
          <br />
          TRIBUNAL LO RECHACE.
        </AnimatedText>
        {frame > 110 && (
          <AnimatedText delay={110} fontSize={34} fontWeight={600} color="#C9D3E4">
            Así trabaja el abogado y el empresario
            <br />
            venezolano promedio.
          </AnimatedText>
        )}
      </AbsoluteFill>
    </SceneBackground>
  );
};
