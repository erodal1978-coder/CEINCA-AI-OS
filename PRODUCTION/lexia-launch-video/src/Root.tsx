import React from 'react';
import { Composition } from 'remotion';
import { LexiaLaunch } from './LexiaLaunch';
import { TOTAL_DURATION, FPS } from './brand';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LexiaLaunch"
        component={LexiaLaunch}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
