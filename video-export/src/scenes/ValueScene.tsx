import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { colors, fontFamily, gradients } from "../theme";

type Props = {
  valueText: string;
};

export const ValueScene: React.FC<Props> = ({ valueText }) => {
  const frame = useCurrentFrame();

  const iconIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const textIn = interpolate(frame, [14, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
        <div
          style={{
            opacity: iconIn,
            scale: interpolate(iconIn, [0, 1], [0.5, 1]),
            width: 120,
            height: 120,
            borderRadius: 999,
            background: gradients.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 900,
            color: colors.navy,
          }}
        >
          ✓
        </div>

        <Interactive.Div
          name="Value Text"
          style={{
            opacity: textIn,
            translate: `0 ${interpolate(textIn, [0, 1], [24, 0])}px`,
            color: colors.white,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.15,
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          {valueText}
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
