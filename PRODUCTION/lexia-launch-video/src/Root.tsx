import React from 'react';
import { Composition } from 'remotion';
import { LexiaLaunch } from './LexiaLaunch';
import { TOTAL_DURATION, FPS } from './brand';
import {
  PostCard,
  Card1Hook,
  Card2Authority,
  Card3Mercantil,
  Card4Lopnna,
  Card5Social,
  Card6Price,
  Card7Cta,
} from './campaign/Cards';

const campaignCards: { id: string; component: React.FC }[] = [
  { id: 'LexiaPost', component: PostCard },
  { id: 'LexiaCarousel1Hook', component: Card1Hook },
  { id: 'LexiaCarousel2Authority', component: Card2Authority },
  { id: 'LexiaCarousel3Mercantil', component: Card3Mercantil },
  { id: 'LexiaCarousel4Lopnna', component: Card4Lopnna },
  { id: 'LexiaCarousel5Social', component: Card5Social },
  { id: 'LexiaCarousel6Price', component: Card6Price },
  { id: 'LexiaCarousel7Cta', component: Card7Cta },
];

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
      {campaignCards.map(({ id, component }) => (
        <Composition
          key={id}
          id={id}
          component={component}
          durationInFrames={90}
          fps={FPS}
          width={1080}
          height={1440}
        />
      ))}
    </>
  );
};
