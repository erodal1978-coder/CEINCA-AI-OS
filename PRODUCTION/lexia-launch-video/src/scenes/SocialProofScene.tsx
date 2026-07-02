import React from 'react';
import { AbsoluteFill } from 'remotion';
import { AnimatedText } from '../components/AnimatedText';
import { AvatarCluster } from '../components/AvatarCluster';
import { GoldDivider, SceneBackground } from '../components/SceneBackground';
import { GOLD, WHITE } from '../brand';

export const SocialProofScene: React.FC = () => {
  return (
    <SceneBackground>
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 70px',
          gap: 30,
        }}
      >
        <AvatarCluster delay={0} />

        <AnimatedText delay={20} fontSize={38} fontWeight={700} color="#C9D3E4" lineHeight={1.3}>
          Construido sobre la práctica real de CEINCA
          <br />
          con empresarios y abogados venezolanos.
        </AnimatedText>

        <GoldDivider />

        <div
          style={{
            marginTop: 10,
            padding: '30px 40px',
            borderRadius: 24,
            border: `1.5px solid ${GOLD}`,
            background: 'rgba(212,175,55,0.08)',
            textAlign: 'center',
          }}
        >
          <AnimatedText delay={55} fontSize={30} fontWeight={800} color={GOLD}>
            BONO DE LANZAMIENTO
          </AnimatedText>
          <AnimatedText delay={65} fontSize={30} fontWeight={700} color={WHITE} lineHeight={1.3}>
            Los primeros 15 compradores reciben
            <br />
            asesoría 1:1 de 45 min por Meet
          </AnimatedText>
        </div>
      </AbsoluteFill>
    </SceneBackground>
  );
};
