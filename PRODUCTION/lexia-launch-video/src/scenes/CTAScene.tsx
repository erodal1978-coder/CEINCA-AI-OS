import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText } from '../components/AnimatedText';
import { GoldDivider, SceneBackground } from '../components/SceneBackground';
import { GOLD, WHITE } from '../brand';

// S — Solución / Call to Benefit: fricción cero, palabra clave exacta.
export const CTAScene: React.FC = () => {
  return (
    <SceneBackground goldPulse>
      <Sequence from={0} durationInFrames={95}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <AnimatedText delay={0} fontSize={40} fontWeight={700} color="#8AA0C2">
            <span style={{ textDecoration: 'line-through' }}>$397</span>
          </AnimatedText>
          <AnimatedText delay={10} fontSize={132} fontWeight={900} color={GOLD}>
            $147
          </AnimatedText>
          <AnimatedText delay={26} fontSize={30} fontWeight={600} color="#C9D3E4">
            (a tasa BCV — precio de lanzamiento)
          </AnimatedText>
          <AnimatedText delay={40} fontSize={26} fontWeight={700} color={WHITE}>
            Promo extendida limitada: $97
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={95} durationInFrames={115}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 22, padding: '0 70px' }}>
          <AnimatedText delay={0} fontSize={38} fontWeight={700} color="#C9D3E4">
            COMENTA LA PALABRA
          </AnimatedText>
          <AnimatedText delay={12} fontSize={98} fontWeight={900} color={GOLD} letterSpacing={2}>
            MAJARETE
          </AnimatedText>
          <AnimatedText delay={28} fontSize={32} fontWeight={700} color={WHITE} lineHeight={1.3}>
            y te enviamos el acceso
            <br />
            automáticamente
          </AnimatedText>

          <GoldDivider />

          <AnimatedText delay={50} fontSize={42} fontWeight={900} color={WHITE}>
            LEXIA<span style={{ color: GOLD }}>™</span>
          </AnimatedText>
          <AnimatedText delay={58} fontSize={26} fontWeight={600} color="#9FB0C9">
            lexia-ceinca.vercel.app
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>
    </SceneBackground>
  );
};
