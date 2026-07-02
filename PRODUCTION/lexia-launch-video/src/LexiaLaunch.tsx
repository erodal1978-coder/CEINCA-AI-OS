import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { TIMING } from './brand';
import { HookScene } from './scenes/HookScene';
import { EntornoScene } from './scenes/EntornoScene';
import { ProductRevealScene } from './scenes/ProductRevealScene';
import { SocialProofScene } from './scenes/SocialProofScene';
import { CTAScene } from './scenes/CTAScene';

// Pista instrumental original generada por síntesis (sin muestras de
// terceros, sin riesgo de derechos), sincronizada al arco NEAPS del guion.
// Para reemplazarla por otra: sobrescribir public/audio/lexia-track.mp3
// (o cambiar MUSIC_TRACK) — HAS_MUSIC controla si se incluye en el render,
// ya que Remotion falla si el <Audio> apunta a un archivo inexistente.
const HAS_MUSIC = true;
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
