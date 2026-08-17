import { AbsoluteFill, Easing, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { colors, fontFamily } from "../theme";
import { HighlightedText } from "../utils/HighlightedText";

type Props = {
  badge: string;
  headline: string;
  subtitle: string;
  highlightWord?: string;
};

export const HookScene: React.FC<Props> = ({ badge, headline, subtitle, highlightWord }) => {
  const frame = useCurrentFrame();

  const badgeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const headlineIn = interpolate(frame, [10, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const subtitleIn = interpolate(frame, [26, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const highlightProgress = interpolate(frame, [46, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.37, 0, 0.63, 1),
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 80px",
      }}
    >
      <Audio src={staticFile("audio/sfx-whoosh.wav")} volume={0.9} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        <Interactive.Div
          name="Hook Badge"
          style={{
            opacity: badgeIn,
            translate: `0 ${interpolate(badgeIn, [0, 1], [24, 0])}px`,
            border: `2px solid ${colors.gold}`,
            background: "rgba(200,169,81,0.12)",
            color: colors.gold,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: 2,
            textTransform: "uppercase",
            padding: "14px 36px",
            borderRadius: 999,
          }}
        >
          {badge}
        </Interactive.Div>

        <Interactive.Div
          name="Hook Headline"
          style={{
            opacity: headlineIn,
            scale: interpolate(headlineIn, [0, 1], [0.92, 1]),
            color: colors.white,
            fontWeight: 900,
            fontSize: 96,
            lineHeight: 1.08,
            textAlign: "center",
            maxWidth: 880,
          }}
        >
          <HighlightedText
            text={headline}
            phrase={highlightWord}
            progress={highlightProgress}
            color="rgba(200,169,81,0.55)"
            type="highlight"
          />
        </Interactive.Div>

        <Interactive.Div
          name="Hook Subtitle"
          style={{
            opacity: interpolate(subtitleIn, [0, 1], [0, 0.85]),
            translate: `0 ${interpolate(subtitleIn, [0, 1], [18, 0])}px`,
            color: colors.white,
            fontWeight: 600,
            fontSize: 44,
            textAlign: "center",
            maxWidth: 780,
          }}
        >
          {subtitle}
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
