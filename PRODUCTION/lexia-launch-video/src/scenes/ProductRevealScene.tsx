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
      <Sequence from={0} durationInFrames={75}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <AnimatedText delay={0} fontSize={40} fontWeight={700} color="#C9D3E4">
            PRESENTAMOS
          </AnimatedText>
          <AnimatedText delay={8} fontSize={104} fontWeight={900} color={WHITE} letterSpacing={2}>
            LEXIA<span style={{ color: GOLD }}>™</span>
          </AnimatedText>
          <GoldDivider width={180} />
          <AnimatedText delay={22} fontSize={32} fontWeight={600} color="#C9D3E4">
            El sistema de inteligencia legal de CEINCA
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={75} durationInFrames={75}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <GemCard
            title={'GEM Mercantil\nCEINCA™'}
            subtitle="Agente entrenado en la práctica mercantil venezolana real"
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={150} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <GemCard
            title={'GEM LOPNNA\nCEINCA™'}
            subtitle="Especializado en documentos y procesos de niñez y adolescencia"
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={210} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 20, padding: '0 70px' }}>
          <AnimatedText delay={0} fontSize={116} fontWeight={900} color={GOLD}>
            120
          </AnimatedText>
          <AnimatedText delay={12} fontSize={40} fontWeight={800} color={WHITE} lineHeight={1.2}>
            FORMATOS LEGALES EDITABLES
          </AnimatedText>
          <AnimatedText delay={20} fontSize={26} fontWeight={700} color="#C9D3E4">
            60 Mercantil + 60 LOPNNA
          </AnimatedText>
          <AnimatedText delay={30} fontSize={26} fontWeight={600} color="#C9D3E4">
            Organizados por carpetas, enviados directo a tu correo
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>
    </SceneBackground>
  );
};
