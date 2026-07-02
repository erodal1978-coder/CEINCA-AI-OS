import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { TIMING } from './brand';
import { HookScene } from './scenes/HookScene';
import { EntornoScene } from './scenes/EntornoScene';
import { ProductRevealScene } from './scenes/ProductRevealScene';
import { SocialProofScene } from './scenes/SocialProofScene';
import { CTAScene } from './scenes/CTAScene';

// Pista de música local pendiente de integrar (ver README de este proyecto).
// 1. Copiar el archivo a public/audio/lexia-track.mp3
// 2. Cambiar HAS_MUSIC a true
// (El render final de Remotion falla si Audio apunta a un archivo que no
// existe, así que se controla con esta bandera en vez de detección en
// tiempo de ejecución.)
const HAS_MUSIC = false;
const MUSIC_TRACK = 'audio/lexia-track.mp3';

export const LexiaLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B1D3A' }}>
      {HAS_MUSIC && <Audio src={staticFile(MUSIC_TRACK)} volume={0.55} />}

      <Sequence from={TIMING.hook.from} durationInFrames={TIMING.hook.duration}>
        <HookScene />
      </Sequence>

      <Sequence from={TIMING.entorno.from} durationInFrames={TIMING.entorno.duration}>
        <EntornoScene />
      </Sequence>

      <Sequence from={TIMING.producto.from} durationInFrames={TIMING.producto.duration}>
        <ProductRevealScene />
      </Sequence>

      <Sequence from={TIMING.prueba.from} durationInFrames={TIMING.prueba.duration}>
        <SocialProofScene />
      </Sequence>

      <Sequence from={TIMING.cta.from} durationInFrames={TIMING.cta.duration}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
