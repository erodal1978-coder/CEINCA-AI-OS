import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { Background } from "./scenes/Background";
import { HookScene } from "./scenes/HookScene";
import { ValueScene } from "./scenes/ValueScene";
import { CTBScene } from "./scenes/CTBScene";

export const HOOK_DURATION = 90;
export const VALUE_DURATION = 90;
export const CTB_DURATION = 90;
export const REEL_DURATION = HOOK_DURATION + VALUE_DURATION + CTB_DURATION;

export const ReelCTBSchema = z.object({
  hookBadge: z.string(),
  headline: z.string(),
  subtitle: z.string(),
  valueText: z.string(),
  ctbText: z.string(),
  ctbKeyword: z.string(),
  handle: z.string(),
});

export const ReelCTB: React.FC<z.infer<typeof ReelCTBSchema>> = ({
  hookBadge,
  headline,
  subtitle,
  valueText,
  ctbText,
  ctbKeyword,
  handle,
}) => {
  return (
    <AbsoluteFill>
      <Background />

      <Sequence name="Hook" durationInFrames={HOOK_DURATION}>
        <HookScene badge={hookBadge} headline={headline} subtitle={subtitle} />
      </Sequence>

      <Sequence name="Value" from={HOOK_DURATION} durationInFrames={VALUE_DURATION}>
        <ValueScene valueText={valueText} />
      </Sequence>

      <Sequence
        name="CTB"
        from={HOOK_DURATION + VALUE_DURATION}
        durationInFrames={CTB_DURATION}
      >
        <CTBScene ctbText={ctbText} ctbKeyword={ctbKeyword} handle={handle} />
      </Sequence>
    </AbsoluteFill>
  );
};
