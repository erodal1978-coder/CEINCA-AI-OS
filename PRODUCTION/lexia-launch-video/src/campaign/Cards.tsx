import React from 'react';
import { AbsoluteFill } from 'remotion';
import { StaticText } from './StaticText';
import { StatsRow } from './StatChip';
import { GemCard } from '../components/GemCard';
import { PhotoStack } from '../components/PhotoStack';
import { GoldDivider, SceneBackground } from '../components/SceneBackground';
import { GOLD, WHITE, MUTED } from '../brand';

// Piezas estáticas para el post y el carrusel de Meta Ads (1080x1440, 3:4).
// Reutilizan los mismos componentes/colores/tipografía que el video
// (LexiaLaunch) para garantizar uniformidad de criterio entre creativos.

const Frame: React.FC<{ children: React.ReactNode; gap?: number; goldPulse?: boolean }> = ({
  children,
  gap = 28,
  goldPulse = false,
}) => (
  <SceneBackground goldPulse={goldPulse}>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 70px', gap }}>
      {children}
    </AbsoluteFill>
  </SceneBackground>
);

// ── POST (pieza única, resumen de la oferta) ──────────────────────────
export const PostCard: React.FC = () => (
  <Frame gap={26} goldPulse>
    <div
      style={{
        display: 'inline-block',
        background: 'rgba(212,175,55,.15)',
        border: '1px solid rgba(212,175,55,.4)',
        color: GOLD,
        fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 800,
        fontSize: 20,
        letterSpacing: 1,
        padding: '8px 20px',
        borderRadius: 20,
        textTransform: 'uppercase',
      }}
    >
      Oferta extendida · hasta el 20 de julio
    </div>
    <StaticText fontSize={72} fontWeight={900} color={WHITE}>
      LEXIA<span style={{ color: GOLD }}>™</span>
    </StaticText>
    <StaticText fontSize={30} fontWeight={600} color="#C9D3E4">
      El primer sistema de inteligencia artificial jurídica venezolana
    </StaticText>

    <div style={{ width: '100%', marginTop: 6 }}>
      <StatsRow
        stats={[
          { n: '2', l: 'Agentes IA' },
          { n: '120+', l: 'Formatos' },
          { n: '20+', l: 'Años exp.' },
          { n: '14', l: 'Carpetas' },
        ]}
      />
    </div>

    <GoldDivider />

    <StaticText fontSize={34} fontWeight={700} color="#8AA0C2">
      <span style={{ textDecoration: 'line-through' }}>$397</span>
    </StaticText>
    <StaticText fontSize={118} fontWeight={900} color={GOLD}>
      $97
    </StaticText>

    <div
      style={{
        marginTop: 8,
        background: '#25D366',
        color: WHITE,
        fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 800,
        fontSize: 30,
        padding: '20px 48px',
        borderRadius: 16,
      }}
    >
      Comenta MAJARETE
    </div>
  </Frame>
);

// ── CARD 1 — Hook (dolor) ─────────────────────────────────────────────
export const Card1Hook: React.FC = () => (
  <Frame gap={26}>
    <StaticText fontSize={68} fontWeight={900} color={WHITE} lineHeight={1.1}>
      HORAS BUSCANDO
      <br />
      EL FORMATO CORRECTO.
    </StaticText>
    <StaticText fontSize={68} fontWeight={900} color={GOLD} lineHeight={1.1}>
      RIESGO DE QUE EL
      <br />
      TRIBUNAL LO RECHACE.
    </StaticText>
    <StaticText fontSize={30} fontWeight={600} color="#C9D3E4">
      Así trabaja el abogado y el empresario
      <br />
      venezolano promedio.
    </StaticText>
  </Frame>
);

// ── CARD 2 — Autoridad (+20 años) ─────────────────────────────────────
export const Card2Authority: React.FC = () => (
  <Frame gap={32}>
    <StaticText fontSize={40} fontWeight={700} color="#C9D3E4" lineHeight={1.25}>
      Hay herramientas que prometen
      <br />
      <span style={{ color: WHITE, fontWeight: 800 }}>“documentos en segundos”.</span>
    </StaticText>
    <GoldDivider />
    <StaticText fontSize={54} fontWeight={900} color={GOLD} lineHeight={1.15}>
      LEXIA NACE DE MÁS DE
      <br />
      20 AÑOS DE PRÁCTICA
      <br />
      LEGAL REAL.
    </StaticText>
  </Frame>
);

// ── CARD 3 — Presenta LEXIA + GEM Mercantil ───────────────────────────
export const Card3Mercantil: React.FC = () => (
  <Frame gap={20}>
    <StaticText fontSize={34} fontWeight={700} color="#C9D3E4">
      PRESENTAMOS
    </StaticText>
    <StaticText fontSize={80} fontWeight={900} color={WHITE} letterSpacing={1}>
      LEXIA<span style={{ color: GOLD }}>™</span>
    </StaticText>
    <GoldDivider width={160} />
    <GemCard
      title={'GEM Mercantil\nCEINCA™'}
      subtitle="+20 años de práctica mercantil venezolana real"
    />
  </Frame>
);

// ── CARD 4 — GEM LOPNNA + 120 formatos ────────────────────────────────
export const Card4Lopnna: React.FC = () => (
  <Frame gap={26}>
    <GemCard
      title={'GEM LOPNNA\nCEINCA™'}
      subtitle="+20 años de experiencia en niñez y adolescencia"
    />
    <GoldDivider width={160} />
    <StaticText fontSize={90} fontWeight={900} color={GOLD}>
      120
    </StaticText>
    <StaticText fontSize={32} fontWeight={800} color={WHITE} lineHeight={1.2}>
      FORMATOS LEGALES EDITABLES
    </StaticText>
    <StaticText fontSize={24} fontWeight={700} color="#C9D3E4">
      60 Mercantil + 60 LOPNNA
    </StaticText>
  </Frame>
);

// ── CARD 5 — Prueba social + bono ─────────────────────────────────────
export const Card5Social: React.FC = () => (
  <Frame gap={20}>
    <PhotoStack delay={0} />
    <StaticText fontSize={32} fontWeight={700} color="#C9D3E4" lineHeight={1.3}>
      Construido sobre la práctica real de CEINCA
      <br />
      con empresarios y abogados venezolanos.
    </StaticText>
    <GoldDivider />
    <div
      style={{
        padding: '24px 32px',
        borderRadius: 20,
        border: `1.5px solid ${GOLD}`,
        background: 'rgba(212,175,55,0.08)',
        textAlign: 'center',
      }}
    >
      <StaticText fontSize={24} fontWeight={800} color={GOLD}>
        BONO DE LANZAMIENTO
      </StaticText>
      <StaticText fontSize={24} fontWeight={700} color={WHITE} lineHeight={1.3}>
        Los primeros 15 compradores reciben
        <br />
        auditoría de tu Instagram o TikTok
      </StaticText>
    </div>
  </Frame>
);

// ── CARD 6 — Precio ────────────────────────────────────────────────────
export const Card6Price: React.FC = () => (
  <Frame gap={16} goldPulse>
    <StaticText fontSize={36} fontWeight={700} color="#8AA0C2">
      <span style={{ textDecoration: 'line-through' }}>$397</span>
    </StaticText>
    <StaticText fontSize={140} fontWeight={900} color={GOLD}>
      $97
    </StaticText>
    <StaticText fontSize={28} fontWeight={700} color={WHITE}>
      Promo válida hasta el 20 de julio
    </StaticText>
    <StaticText fontSize={24} fontWeight={600} color="#C9D3E4">
      (a tasa BCV) — después vuelve a $197
    </StaticText>
  </Frame>
);

// ── CARD 7 — CTA final ─────────────────────────────────────────────────
export const Card7Cta: React.FC = () => (
  <Frame gap={22} goldPulse>
    <StaticText fontSize={36} fontWeight={700} color="#C9D3E4">
      COMENTA LA PALABRA
    </StaticText>
    <StaticText fontSize={92} fontWeight={900} color={GOLD} letterSpacing={2}>
      MAJARETE
    </StaticText>
    <StaticText fontSize={30} fontWeight={700} color={WHITE} lineHeight={1.3}>
      y te enviamos el acceso
      <br />
      automáticamente
    </StaticText>
    <GoldDivider />
    <StaticText fontSize={40} fontWeight={900} color={WHITE}>
      LEXIA<span style={{ color: GOLD }}>™</span>
    </StaticText>
    <StaticText fontSize={24} fontWeight={600} color={MUTED}>
      lexia-ceinca.vercel.app
    </StaticText>
  </Frame>
);
