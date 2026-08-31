import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { AnimatedText } from '../components/AnimatedText';
import { GemCard } from '../components/GemCard';
import { GoldDivider, SceneBackground } from '../components/SceneBackground';
import { GOLD, WHITE } from '../brand';

// A + P — Atención visual (cortes cada 2-3s) + Propuesta de valor.
// Beats: título LEXIA -> GEM Mercantil -> GEM LOPNNA -> 120 formatos (60+60).
export const ProductRevealScene: React.FC = () => {
  return (
    <SceneBackground goldPulse>
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <AnimatedText delay={0} fontSize={40} fontWeight={700} color="#C9D3E4">
            PRESENTAMOS
          </AnimatedText>
          <AnimatedText delay={10} fontSize={104} fontWeight={900} color={WHITE} letterSpacing={2}>
            LEXIA<span style={{ color: GOLD }}>™</span>
          </AnimatedText>
          <GoldDivider width={180} />
          <AnimatedText delay={28} fontSize={32} fontWeight={600} color="#C9D3E4">
            El sistema de inteligencia legal de CEINCA
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={90} durationInFrames={100}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <GemCard
            title={'GEM Mercantil\nCEINCA™'}
            subtitle="+20 años de práctica mercantil venezolana real"
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={190} durationInFrames={85}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <GemCard
            title={'GEM LOPNNA\nCEINCA™'}
            subtitle="+20 años de experiencia en niñez y adolescencia"
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={275} durationInFrames={85}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 20, padding: '0 70px' }}>
          <AnimatedText delay={0} fontSize={116} fontWeight={900} color={GOLD}>
            120
          </AnimatedText>
          <AnimatedText delay={14} fontSize={40} fontWeight={800} color={WHITE} lineHeight={1.2}>
            FORMATOS LEGALES EDITABLES
          </AnimatedText>
          <AnimatedText delay={27} fontSize={26} fontWeight={700} color="#C9D3E4">
            60 Mercantil + 60 LOPNNA
          </AnimatedText>
          <AnimatedText delay={40} fontSize={26} fontWeight={600} color="#C9D3E4">
            Organizados por carpetas, enviados directo a tu correo
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>
    </SceneBackground>
  );
};
