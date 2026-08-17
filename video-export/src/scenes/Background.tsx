import { AbsoluteFill } from "remotion";
import { colors, gradients } from "../theme";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: gradients.hero }}>
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -260,
          width: 900,
          height: 900,
          borderRadius: 999,
          background: `radial-gradient(circle, ${colors.gold} 0%, rgba(200,169,81,0) 70%)`,
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -320,
          left: -260,
          width: 820,
          height: 820,
          borderRadius: 999,
          background: `radial-gradient(circle, ${colors.navyLight} 0%, rgba(26,53,96,0) 70%)`,
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
