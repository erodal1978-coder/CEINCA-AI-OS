import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AnimatedText } from '../components/AnimatedText';
import { GoldDivider, SceneBackground } from '../components/SceneBackground';
import { GOLD, WHITE } from '../brand';

// E — Entorno regulatorio: posicionamiento correcto de LEXIA.
// No es "documentos en segundos" genérico — es precisión real.
export const EntornoScene: React.FC = () => {
  return (
    <SceneBackground>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 90px',
          gap: 36,
        }}
      >
        <AnimatedText delay={0} fontSize={46} fontWeight={700} color="#C9D3E4" lineHeight={1.25}>
          Hay herramientas que prometen
          <br />
          <span style={{ color: WHITE, fontWeight: 800 }}>“documentos en segundos”.</span>
        </AnimatedText>

        <GoldDivider />

        <AnimatedText delay={45} fontSize={58} fontWeight={900} color={GOLD} lineHeight={1.15}>
          LO QUE IMPORTA ES QUE LOS
          <br />
          TRIBUNALES Y REGISTROS
          <br />
          LO ACEPTEN.
        </AnimatedText>
      </AbsoluteFill>
    </SceneBackground>
  );
};
