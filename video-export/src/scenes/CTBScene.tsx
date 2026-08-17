import { AbsoluteFill, Easing, Interactive, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { colors, fontFamily, gradients } from "../theme";

type Props = {
  ctbText: string;
  ctbKeyword: string;
  handle: string;
};

const PULSE_PERIOD = 40;

export const CTBScene: React.FC<Props> = ({ ctbText, ctbKeyword, handle }) => {
  const frame = useCurrentFrame();

  const textIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pillIn = interpolate(frame, [14, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const handleIn = interpolate(frame, [36, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const pulsePhase = frame % PULSE_PERIOD;
  const pulse = interpolate(pulsePhase, [0, PULSE_PERIOD / 2, PULSE_PERIOD], [0, 1, 0], {
    easing: Easing.bezier(0.37, 0, 0.63, 1),
  });
  const pulseSpread = interpolate(pulse, [0, 1], [0, 18]);
  const pulseAlpha = interpolate(pulse, [0, 1], [0.4, 0]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 80px",
      }}
    >
      <Sequence from={30} layout="none">
        <Audio src={staticFile("audio/sfx-pop.wav")} volume={0.9} />
      </Sequence>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Interactive.Div
          name="CTB Text"
          style={{
            opacity: interpolate(textIn, [0, 1], [0, 0.85]),
            translate: `0 ${interpolate(textIn, [0, 1], [18, 0])}px`,
            color: colors.white,
            fontWeight: 600,
            fontSize: 44,
            textAlign: "center",
            maxWidth: 760,
          }}
        >
          {ctbText}
        </Interactive.Div>

        <Interactive.Div
          name="CTB Keyword"
          style={{
            opacity: pillIn,
            scale: interpolate(pillIn, [0, 1], [0.85, 1]),
            background: gradients.gold,
            color: colors.navy,
            fontWeight: 900,
            fontSize: 60,
            textTransform: "uppercase",
            letterSpacing: 1,
            padding: "26px 56px",
            borderRadius: 999,
            boxShadow: `0 0 0 ${pulseSpread}px rgba(200,169,81,${pulseAlpha})`,
          }}
        >
          {ctbKeyword}
        </Interactive.Div>

        <Interactive.Div
          name="CTB Handle"
          style={{
            opacity: interpolate(handleIn, [0, 1], [0, 0.6]),
            color: colors.white,
            fontWeight: 600,
            fontSize: 32,
          }}
        >
          {handle}
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
