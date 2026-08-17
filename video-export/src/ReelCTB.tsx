import { AbsoluteFill, Sequence, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { Background } from "./scenes/Background";
import { HookScene } from "./scenes/HookScene";
import { ValueScene } from "./scenes/ValueScene";
import { CTBScene } from "./scenes/CTBScene";

export const HOOK_DURATION = 90;
export const VALUE_DURATION = 90;
export const CTB_DURATION = 90;
export const REEL_DURATION = HOOK_DURATION + VALUE_DURATION + CTB_DURATION;

// Frames where a keyword SFX plays: hook whoosh, value ding, CTB pill pop.
const SFX_CUE_FRAMES = [0, HOOK_DURATION, HOOK_DURATION + VALUE_DURATION + 30];
const MUSIC_VOLUME = 0.85;
const DUCK_VOLUME = 0.3;
const DUCK_ATTACK = 3;
const DUCK_HOLD = 12;
const DUCK_RELEASE = 14;

// There's no voiceover in this template, so the music bed can sit loud —
// it only ducks briefly around each keyword SFX so the accent reads clearly.
const getMusicVolume = (frame: number) => {
  let volume = MUSIC_VOLUME;
  for (const cue of SFX_CUE_FRAMES) {
    const rel = frame - cue;
    if (rel < 0) continue;
    if (rel < DUCK_ATTACK) {
      volume = Math.min(volume, interpolate(rel, [0, DUCK_ATTACK], [MUSIC_VOLUME, DUCK_VOLUME]));
    } else if (rel < DUCK_ATTACK + DUCK_HOLD) {
      volume = Math.min(volume, DUCK_VOLUME);
    } else if (rel < DUCK_ATTACK + DUCK_HOLD + DUCK_RELEASE) {
      volume = Math.min(
        volume,
        interpolate(
          rel,
          [DUCK_ATTACK + DUCK_HOLD, DUCK_ATTACK + DUCK_HOLD + DUCK_RELEASE],
          [DUCK_VOLUME, MUSIC_VOLUME],
        ),
      );
    }
  }
  return volume;
};

export const ReelCTBSchema = z.object({
  hookBadge: z.string(),
  headline: z.string(),
  subtitle: z.string(),
  highlightWord: z.string(),
  valueText: z.string(),
  emphasisPhrase: z.string(),
  ctbText: z.string(),
  ctbKeyword: z.string(),
  handle: z.string(),
});

export const ReelCTB: React.FC<z.infer<typeof ReelCTBSchema>> = ({
  hookBadge,
  headline,
  subtitle,
  highlightWord,
  valueText,
  emphasisPhrase,
  ctbText,
  ctbKeyword,
  handle,
}) => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/music-bed.wav")} volume={getMusicVolume} />

      <Background />

      <Sequence name="Hook" durationInFrames={HOOK_DURATION}>
        <HookScene badge={hookBadge} headline={headline} subtitle={subtitle} highlightWord={highlightWord} />
      </Sequence>

      <Sequence name="Value" from={HOOK_DURATION} durationInFrames={VALUE_DURATION}>
        <ValueScene valueText={valueText} emphasisPhrase={emphasisPhrase} />
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
