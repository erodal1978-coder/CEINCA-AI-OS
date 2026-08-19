#!/usr/bin/env python3
"""
CASA & CAMPO — banda sonora del Reel de Angelo. Libre de derechos: sintetizada
aquí, sin muestras de terceros.

90 BPM, Re mayor, emotiva y ascendente. El arreglo deja un HUECO deliberado
entre 4.2 y 9.0 s: ahí entra el audio real del mariachi (J-cut) y se mantiene
por encima del corte (L-cut). La música no compite, acompaña.

    0.0 – 2.0    GANCHO   piano solo + swell
    2.0 – 4.2    llegada  piano + pad, entra pulso
    4.2 – 9.0    HUECO    todo baja: manda el mariachi real
    9.0 – 14.0   subida   piano, pad, bajo y percusión, crece
   14.0 – 18.0   CIERRE   resolución cálida bajo el logo

Salidas: ang_music.wav y ang_sfx.wav
"""
import numpy as np
import wave

SR = 48000
TOTAL = 18.0
BPM = 90.0
BEAT = 60.0 / BPM          # 0.66667 s
BAR = BEAT * 4             # 2.66667 s
N = int(TOTAL * SR)

DUCK_IN, DUCK_OUT = 4.2, 9.0    # tramo donde manda el mariachi real


def sec(x):
    return int(x * SR)


def add(buf, sig, at):
    i = sec(at)
    if i >= len(buf) or i < 0:
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * np.asarray(cutoff, dtype=float) / SR)
    y = np.empty_like(x)
    acc = 0.0
    if a.ndim == 0:
        af = float(a)
        for i in range(len(x)):
            acc = (1 - af) * x[i] + af * acc
            y[i] = acc
    else:
        for i in range(len(x)):
            ai = a[i]
            acc = (1 - ai) * x[i] + ai * acc
            y[i] = acc
    return y


def hp(x, cutoff):
    return x - onepole_lp(x, cutoff)


# ---------------------------------------------------------------- instrumentos

def piano(freq, dur=1.4, gain=0.5, seed=0):
    """Piano de fieltro: fundamental suave, pocos armónicos, ataque redondeado."""
    n = sec(dur)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.9)
         + 0.34 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 3.2)
         + 0.14 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 5.0)
         + 0.06 * np.sin(2 * np.pi * freq * 4.02 * t) * np.exp(-t * 7.5))
    rng = np.random.default_rng(300 + seed)
    y += rng.standard_normal(n) * np.exp(-t * 380) * 0.03     # golpe de martillo
    atk = np.minimum(1.0, t / 0.006)
    return y * atk * gain


def strings(freqs, dur, gain=0.16, seed=0):
    """Cuerdas cálidas: sierras desafinadas filtradas, ataque lento."""
    n = sec(dur)
    t = np.arange(n) / SR
    rng = np.random.default_rng(400 + seed)
    out = np.zeros(n)
    for f in freqs:
        for v in range(3):
            det = (v - 1) * 0.006
            ph = (t * f * (1 + det) + rng.random()) % 1.0
            out += 2 * ph - 1
    out /= (len(freqs) * 3)
    out = onepole_lp(out, 1300)
    env = np.minimum(1.0, t / 0.55) * np.minimum(1.0, (dur - t) / 0.5)
    return out * np.maximum(0, env) * gain


def bass(freq, dur, gain=0.34):
    n = sec(dur)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * freq * t)
    env = np.minimum(1.0, t / 0.02) * np.exp(-t * 0.9)
    return y * env * gain


def kick(gain=0.5):
    n = sec(0.34)
    t = np.arange(n) / SR
    f = 46 + 80 * np.exp(-t * 28)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5)
    return np.tanh(y * 1.3) * gain


def tamb(gain=0.10, seed=0):
    n = sec(0.10)
    t = np.arange(n) / SR
    rng = np.random.default_rng(600 + seed)
    return hp(rng.standard_normal(n), 6000) * np.exp(-t * 42) * gain


def swell(dur=1.6, gain=0.30, seed=1):
    """Crescendo cálido: ruido filtrado que abre. Marca la entrada del mariachi."""
    n = sec(dur)
    t = np.arange(n) / SR
    p = t / dur
    rng = np.random.default_rng(700 + seed)
    x = rng.standard_normal(n)
    x = hp(onepole_lp(x, 600 + 7000 * p), 400)
    return x * (p ** 2.0) * gain


def whoosh(dur=0.42, gain=0.15, down=False, seed=0):
    n = sec(dur)
    t = np.arange(n) / SR
    p = t / dur
    rng = np.random.default_rng(800 + seed)
    x = rng.standard_normal(n)
    curve = (1 - p) if down else p
    x = hp(onepole_lp(x, 800 + 6000 * curve), 600)
    return x * (np.sin(np.pi * p) ** 1.5) * gain


def sparkle(freq=1318.5, gain=0.13):
    n = sec(1.1)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.6)
         + 0.45 * np.sin(2 * np.pi * freq * 2.4 * t) * np.exp(-t * 6.0)
         + 0.25 * np.sin(2 * np.pi * freq * 3.7 * t) * np.exp(-t * 9.0))
    return y * gain


# ---------------------------------------------------------------- arreglo
music = np.zeros(N)
sfx = np.zeros(N)

# Re mayor: D – A – Bm – G  (I – V – vi – IV), un acorde por compás
D4, E4, Fs4, G4, A4, B4, Cs5, D5 = 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 554.37, 587.33
A3, B3, Cs4, G3, Fs3 = 220.00, 246.94, 277.18, 196.00, 185.00

PROG = [
    ("D",  73.42,  [D4, Fs4, A4],  [D4, Fs4, A4, D5]),
    ("A",  110.00, [Cs4, E4, A4],  [A3, Cs4, E4, A4]),
    ("Bm", 61.74,  [B3, D4, Fs4],  [B3, D4, Fs4, B4]),
    ("G",  98.00,  [G3, B3, D4],   [G3, B3, D4, G4]),
    ("D",  73.42,  [D4, Fs4, A4],  [D4, Fs4, A4, D5]),
    ("A",  110.00, [Cs4, E4, A4],  [A3, Cs4, E4, A4]),
    ("D",  73.42,  [D4, Fs4, A4],  [D4, Fs4, A4, D5]),
]

# --- piano: arpegio en corcheas, presente todo el tema
x = 0.0
bar_i = 0
while x < TOTAL:
    _, root, tri, voiced = PROG[bar_i % len(PROG)]
    pattern = [tri[0], tri[1], tri[2], tri[1], tri[0], tri[2], tri[1], tri[2]]
    for j, f in enumerate(pattern):
        tt = x + j * (BEAT / 2)
        if tt >= TOTAL:
            break
        accent = 1.25 if j % 4 == 0 else 1.0
        add(music, piano(f, 1.5, 0.42 * accent, seed=bar_i * 8 + j), tt)
    bar_i += 1
    x += BAR

# --- cuerdas desde el segundo compás
x = BAR
bar_i = 1
while x < TOTAL:
    voiced = PROG[bar_i % len(PROG)][3]
    add(music, strings(voiced, min(BAR, TOTAL - x), gain=0.17, seed=bar_i), x)
    bar_i += 1
    x += BAR

# --- bajo, percusión y pandereta: sólo después del hueco del mariachi
x = DUCK_OUT
while x < TOTAL:
    bi = int(x // BAR) % len(PROG)
    add(music, bass(PROG[bi][1], BEAT * 2.0, gain=0.36), x)
    add(music, kick(gain=0.46), x)
    x += BEAT
x = DUCK_OUT
k = 0
while x < TOTAL:
    add(music, tamb(gain=0.09 * (1.4 if k % 2 == 0 else 1.0), seed=k), x)
    k += 1
    x += BEAT / 2

# --- acorde final sostenido bajo el logo
add(music, strings([D4, Fs4, A4, D5], TOTAL - 16.0, gain=0.22, seed=99), 16.0)
for j, f in enumerate([D4, Fs4, A4, D5]):
    add(music, piano(f, 2.0, 0.34, seed=900 + j), 16.0 + j * 0.09)

# ---------------------------------------------------------------- hueco J/L-cut
# Rampa suave hacia abajo para dejar entrar el mariachi real, y de vuelta.
env = np.ones(N)
fi, fo = sec(0.55), sec(0.8)
i0, i1 = sec(DUCK_IN), sec(DUCK_OUT)
env[i0:i0 + fi] = np.linspace(1.0, 0.16, fi)
env[i0 + fi:i1] = 0.16
env[i1:i1 + fo] = np.linspace(0.16, 1.0, fo)
music *= env

# ---------------------------------------------------------------- SFX
add(sfx, swell(1.5, gain=0.34), DUCK_IN - 1.1)          # entrada del mariachi
for i, cut in enumerate([2.0, 4.667, 8.0, 10.667, 14.0]):
    add(sfx, whoosh(0.42, gain=0.16, down=(i % 2 == 1), seed=i), cut - 0.21)
add(sfx, sparkle(1318.5, gain=0.15), 14.25)             # aparición del logo
add(sfx, sparkle(1567.98, gain=0.10), 14.55)

# ---------------------------------------------------------------- salida

def write_wav(path, mono, peak=0.85, width=0.62):
    x = mono / (np.max(np.abs(mono)) + 1e-9) * peak
    d = sec(0.011)
    r = np.concatenate([np.zeros(d), x[:-d]]) * (1 - width) + x * width
    r = r / (np.max(np.abs(r)) + 1e-9) * peak
    inter = np.empty(len(x) * 2)
    inter[0::2], inter[1::2] = x, r
    pcm = (np.clip(inter, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {path}  {len(x)/SR:.2f}s")


if __name__ == "__main__":
    print("Sintetizando (Re mayor, 90 BPM, con hueco para el mariachi)...")
    write_wav("ang_music.wav", music, peak=0.84, width=0.64)
    write_wav("ang_sfx.wav", sfx, peak=0.78, width=0.55)
    print("listo")
