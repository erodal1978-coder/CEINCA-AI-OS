// Generates the music bed and keyword SFX for Reel-CTB as raw synthesized WAV
// files (no external audio downloads / no license concerns). Re-run with
// `node scripts/generate-audio.mjs` after tweaking any parameters below.
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "audio");
mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 44100;

function writeWav(filename, channels) {
  const numChannels = channels.length;
  const numFrames = channels[0].length;
  const blockAlign = numChannels * 2;
  const dataSize = numFrames * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * blockAlign, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      buffer.writeInt16LE(Math.round(sample * 32767), offset);
      offset += 2;
    }
  }

  writeFileSync(join(OUT_DIR, filename), buffer);
  console.log(`wrote public/audio/${filename} (${(numFrames / SAMPLE_RATE).toFixed(2)}s)`);
}

// ---------- DSP helpers ----------

function mix(...layers) {
  const len = Math.max(...layers.map((l) => l.length));
  const out = new Float32Array(len);
  for (const layer of layers) {
    for (let i = 0; i < layer.length; i++) out[i] += layer[i];
  }
  return out;
}

function gain(buf, g) {
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] * g;
  return out;
}

function at(buf, offsetSeconds, totalLength) {
  const offset = Math.round(offsetSeconds * SAMPLE_RATE);
  const out = new Float32Array(totalLength);
  for (let i = 0; i < buf.length && offset + i < totalLength; i++) {
    out[offset + i] = buf[i];
  }
  return out;
}

function whiteNoise(seconds, seed) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out[i] = (s / 4294967296) * 2 - 1;
  }
  return out;
}

function lowpass(buf, cutoffFn) {
  const out = new Float32Array(buf.length);
  let y = 0;
  const dt = 1 / SAMPLE_RATE;
  for (let i = 0; i < buf.length; i++) {
    const cutoff = typeof cutoffFn === "function" ? cutoffFn(i / SAMPLE_RATE) : cutoffFn;
    const alpha = dt / (1 / (2 * Math.PI * cutoff) + dt);
    y = y + alpha * (buf[i] - y);
    out[i] = y;
  }
  return out;
}

function highpass(buf, lowpassed) {
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] - lowpassed[i];
  return out;
}

function sine(seconds, freq, phase0 = 0) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = phase0;
  for (let i = 0; i < n; i++) {
    out[i] = Math.sin(phase);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
  }
  return out;
}

function envelope(buf, { attack = 0.01, decay = 0, sustain = 1, release = 0.1 } = {}) {
  const n = buf.length;
  const out = new Float32Array(n);
  const a = Math.max(1, Math.round(attack * SAMPLE_RATE));
  const d = Math.round(decay * SAMPLE_RATE);
  const r = Math.max(1, Math.round(release * SAMPLE_RATE));
  for (let i = 0; i < n; i++) {
    let g;
    if (i < a) g = i / a;
    else if (i < a + d) g = 1 - (1 - sustain) * ((i - a) / d);
    else if (i < n - r) g = sustain;
    else g = sustain * Math.max(0, (n - i) / r);
    out[i] = buf[i] * g;
  }
  return out;
}

function expDecay(buf, tau) {
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] * Math.exp(-(i / SAMPLE_RATE) / tau);
  }
  return out;
}

function fadeInOut(buf, fadeInSec, fadeOutSec) {
  const out = Float32Array.from(buf);
  const inN = Math.round(fadeInSec * SAMPLE_RATE);
  const outN = Math.round(fadeOutSec * SAMPLE_RATE);
  for (let i = 0; i < inN && i < out.length; i++) out[i] *= i / inN;
  for (let i = 0; i < outN && i < out.length; i++) out[out.length - 1 - i] *= i / outN;
  return out;
}

function normalize(buf, peak = 0.9) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  if (max === 0) return buf;
  const g = peak / max;
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) out[i] = buf[i] * g;
  return out;
}

function stereoWiden(mono, delaySeconds) {
  const delaySamples = Math.round(delaySeconds * SAMPLE_RATE);
  const right = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) {
    const srcIdx = i - delaySamples;
    right[i] = srcIdx >= 0 ? mono[srcIdx] : 0;
  }
  return [mono, right];
}

// ---------- Music bed ----------
// Tense, professional "alerta mercantil" pad in A minor: a slow breathing
// triad under a building heartbeat pulse, resolving into a bright fifth
// chime exactly when the CTB gold pill lands (t = 6.0s).

const MUSIC_DURATION = 9.4; // > 9.0s reel length; render trims to composition duration
const totalSamples = Math.round(MUSIC_DURATION * SAMPLE_RATE);

function padNote(freq, seconds) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const lfo = 1 + 0.03 * Math.sin(2 * Math.PI * 0.15 * t);
    out[i] = Math.sin(phase) * lfo;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
  }
  return out;
}

const pad = mix(
  gain(padNote(110, MUSIC_DURATION), 0.5), // A2
  gain(padNote(130.81, MUSIC_DURATION), 0.35), // C3
  gain(padNote(164.81, MUSIC_DURATION), 0.3), // E3
);
const padShaped = envelope(pad, { attack: 1.4, sustain: 1, release: 1.2 });

function kick(seconds, freqStart, freqEnd, tau) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const f = freqStart + (freqEnd - freqStart) * Math.min(1, t / 0.08);
    out[i] = Math.sin(phase) * Math.exp(-t / tau);
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
  }
  return out;
}

// 120 BPM = 0.5s/beat, which divides evenly into the 3s-per-scene structure
// (Hook/Value/CTB) — beats land exactly on every scene cut and SFX cue.
const BPM = 120;
const beatSec = 60 / BPM;
const SFX_CUE_TIMES = [0, 3, 7]; // whoosh (hook), ding (value), pop (CTB pill landing)
let pulseTrack = new Float32Array(totalSamples);
for (let beat = 0; beat * beatSec < MUSIC_DURATION - 0.3; beat++) {
  const t0 = beat * beatSec;
  // builds tension into the CTB moment at t=6s, then eases off for the payoff
  const build = t0 < 6 ? Math.min(1, t0 / 6) : Math.max(0.3, 1 - (t0 - 6) / 3);
  const isCue = SFX_CUE_TIMES.some((c) => Math.abs(t0 - c) < 0.01);
  const accent = isCue ? 1.5 : 1;
  const hit = gain(kick(0.25, 90, 45, 0.12), (0.22 + 0.18 * build) * accent);
  pulseTrack = mix(pulseTrack, at(hit, t0, totalSamples));
}

function pluck(freq, seconds, tau) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    out[i] = Math.sin(phase) * Math.exp(-(i / SAMPLE_RATE) / tau);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
  }
  return out;
}

const chime = mix(gain(pluck(880, 1.6, 0.55), 0.22), gain(pluck(1318.51, 1.6, 0.5), 0.16));
const chimePlaced = at(chime, 6.02, totalSamples);

let musicMono = mix(at(padShaped, 0, totalSamples), pulseTrack, chimePlaced);
musicMono = fadeInOut(musicMono, 0.6, 0.9);
musicMono = normalize(musicMono, 0.85);

writeWav("music-bed.wav", stereoWiden(musicMono, 0.012));

// ---------- Keyword SFX ----------

// Whoosh — hook badge swoop-in
{
  const duration = 0.35;
  const noise = whiteNoise(duration, 42);
  const lp = lowpass(noise, (t) => 400 + 3200 * (t / duration));
  const hp = highpass(noise, lowpass(noise, (t) => 150 + 800 * (t / duration)));
  const band = mix(gain(lp, 0.6), gain(hp, 0.4));
  const shaped = envelope(band, { attack: 0.02, decay: 0.08, sustain: 0.4, release: 0.2 });
  writeWav("sfx-whoosh.wav", stereoWiden(normalize(shaped, 0.6), 0.004));
}

// Ding — value checkmark landing
{
  const duration = 0.5;
  const fundamental = gain(sine(duration, 1318.51), 0.7); // E6
  const harmonic = gain(sine(duration, 2637.02), 0.25); // E7
  const bell = expDecay(mix(fundamental, harmonic), 0.22);
  const shaped = envelope(bell, { attack: 0.002, sustain: 1, release: 0.35 });
  writeWav("sfx-ding.wav", stereoWiden(normalize(shaped, 0.6), 0));
}

// Pop — CTB keyword pill landing
{
  const duration = 0.28;
  const thump = kick(duration, 150, 60, 0.09);
  const click = envelope(gain(whiteNoise(0.02, 7), 0.5), {
    attack: 0.001,
    decay: 0.005,
    sustain: 0.2,
    release: 0.01,
  });
  const combined = mix(gain(thump, 0.8), at(click, 0, thump.length));
  const tailed = envelope(combined, { attack: 0.001, sustain: 1, release: 0.05 });
  writeWav("sfx-pop.wav", stereoWiden(normalize(tailed, 0.7), 0));
}

console.log("Done.");
