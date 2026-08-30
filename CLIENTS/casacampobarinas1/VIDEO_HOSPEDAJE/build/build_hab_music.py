#!/usr/bin/env python3
"""
CASA & CAMPO — banda sonora original para el vídeo de habitaciones.
Libre de derechos: sintetizada aquí, no hay muestra de terceros.

100 BPM, Fa mayor, tropical/chill. Deliberadamente distinta del EDM del
promo de fiesta: el objetivo aquí es descanso, no rumba.

    0.0 – 4.8   INTRO   arpegio de marimba + shaker
    4.8 – 12.0  GROOVE  entran bombo, bajo y palmas
   12.0 – 18.6  LIFT    pad + contramelodía
   18.6 – 21.5  CIERRE  acorde final sobre la placa de marca

Salidas: hab_music.wav y hab_sfx.wav
"""
import numpy as np
import wave

SR = 48000
TOTAL = 21.5
BPM = 100.0
BEAT = 60.0 / BPM          # 0.6 s
BAR = BEAT * 4             # 2.4 s
N = int(TOTAL * SR)


def sec(x):
    return int(x * SR)


def add(buf, sig, at):
    i = sec(at)
    if i >= len(buf) or i < 0:
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]


def onepole_lp(x, cutoff):
    """Paso-bajo de un polo. cutoff admite escalar o vector (barrido)."""
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

def marimba(freq, dur=0.42, gain=0.5, seed=0):
    """Marimba/kalimba: fundamental + parcial cuarto, decaimiento rápido."""
    n = sec(dur)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 7.0)
         + 0.42 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 15.0)
         + 0.16 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t * 26.0))
    # golpe de mazo
    rng = np.random.default_rng(500 + seed)
    y += rng.standard_normal(n) * np.exp(-t * 500) * 0.05
    return y * gain


def steel(freq, dur=0.7, gain=0.34):
    """Timbre tipo steel drum para la contramelodía."""
    n = sec(dur)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.4)
         + 0.5 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 5.5)
         + 0.28 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 8.0))
    return y * gain


def kick(dur=0.34, gain=0.72):
    n = sec(dur)
    t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9.0)
    return np.tanh(y * 1.4) * gain


def bass(freq, dur, gain=0.42):
    n = sec(dur)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * freq * t) * 0.9 + 0.1 * np.sin(4 * np.pi * freq * t)
    env = np.minimum(1.0, t / 0.012) * np.exp(-t * 1.6)
    return y * env * gain


def shaker(dur=0.09, gain=0.13, seed=0):
    n = sec(dur)
    t = np.arange(n) / SR
    rng = np.random.default_rng(700 + seed)
    return hp(rng.standard_normal(n), 6500) * np.exp(-t * 46) * gain


def clap(gain=0.3, seed=0):
    n = sec(0.26)
    t = np.arange(n) / SR
    rng = np.random.default_rng(800 + seed)
    x = hp(rng.standard_normal(n), 1400)
    e = np.exp(-t * 19)
    for off, amp in ((0.0, 1.0), (0.012, 0.75)):
        i = sec(off)
        e[i:i + sec(0.005)] *= 2.0 * amp
    return x * e * gain


def pad(freqs, dur, gain=0.14, seed=0):
    """Colchón suave de sierras desafinadas, filtrado."""
    n = sec(dur)
    t = np.arange(n) / SR
    rng = np.random.default_rng(900 + seed)
    out = np.zeros(n)
    for i, f in enumerate(freqs):
        for v in range(3):
            det = (v - 1) * 0.008
            ph = (t * f * (1 + det) + rng.random()) % 1.0
            out += 2 * ph - 1
    out /= (len(freqs) * 3)
    out = onepole_lp(out, 1500)
    env = np.minimum(1.0, t / 0.35) * np.minimum(1.0, (dur - t) / 0.4)
    return out * np.maximum(0, env) * gain


def airy_whoosh(dur=0.5, gain=0.16, down=False, seed=0):
    n = sec(dur)
    t = np.arange(n) / SR
    p = t / dur
    rng = np.random.default_rng(1000 + seed)
    x = rng.standard_normal(n)
    curve = (1 - p) if down else p
    x = hp(onepole_lp(x, 900 + 6000 * curve), 700)
    return x * (np.sin(np.pi * p) ** 1.6) * gain


def chime(freq=1046.5, gain=0.12):
    n = sec(0.9)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 4.5)
         + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 7.0))
    return y * gain


# ---------------------------------------------------------------- arreglo
music = np.zeros(N)
sfx = np.zeros(N)

# Fa mayor: F – Dm – Bb – C  (un compás cada uno)
F4, G4, A4, Bb3, Bb4 = 349.23, 392.00, 440.00, 233.08, 466.16
C4, C5, D4, D5, E4 = 261.63, 523.25, 293.66, 587.33, 329.63

PROG = [
    ("F",  87.31,  [F4, A4, C5, A4, F4, A4, C5, C5], [F4, A4, C5]),
    ("Dm", 73.42,  [D4, F4, A4, F4, D4, F4, A4, A4], [D4, F4, A4]),
    ("Bb", 58.27,  [Bb3, D4, F4, D4, Bb3, D4, F4, F4], [Bb3, D4, F4]),
    ("C",  65.41,  [C4, E4, G4, E4, C4, E4, G4, G4], [C4, E4, G4]),
]

SEC_GROOVE, SEC_LIFT, SEC_END, END = 4.8, 12.0, 18.6, TOTAL


def section_at(x):
    if x < SEC_GROOVE: return "intro"
    if x < SEC_LIFT:   return "groove"
    if x < SEC_END:    return "lift"
    return "cierre"


# --- arpegio de marimba: corcheas (0.3 s), todo el tema. Es el gancho.
x = 0.0
bar_i = 0
while x < END:
    name, root, arp, notes = PROG[bar_i % 4]
    s = section_at(x)
    g = {"intro": 0.50, "groove": 0.44, "lift": 0.40, "cierre": 0.30}[s]
    for j, f in enumerate(arp):
        tt = x + j * (BEAT / 2)
        if tt >= END:
            break
        accent = 1.18 if j % 4 == 0 else 1.0
        add(music, marimba(f, 0.42, g * accent, seed=bar_i * 8 + j), tt)
    bar_i += 1
    x += BAR

# --- shaker en corcheas desde el compás 2
x = BAR
k = 0
while x < SEC_END:
    s = section_at(x)
    g = {"intro": 0.10, "groove": 0.15, "lift": 0.15}[s]
    add(music, shaker(gain=g * (1.35 if k % 2 == 0 else 1.0), seed=k), x)
    k += 1
    x += BEAT / 2

# --- bombo desde el groove
x = SEC_GROOVE
while x < SEC_END:
    g = 0.72 if section_at(x) == "groove" else 0.78
    add(music, kick(gain=g), x)
    x += BEAT

# --- bajo: raíz en 1 y 3, con anticipación en el contratiempo de 4
x = SEC_GROOVE
while x < SEC_END:
    bi = int(x // BAR) % 4
    root = PROG[bi][1]
    add(music, bass(root, BEAT * 1.6, gain=0.44), x)
    add(music, bass(root, BEAT * 0.45, gain=0.30), x + BEAT * 2.5)
    x += BAR / 2 * 2  # un ciclo por compás

# --- palmas en los tiempos 2 y 4
x = SEC_GROOVE + BEAT
while x < SEC_END:
    g = 0.28 if section_at(x) == "groove" else 0.34
    add(music, clap(gain=g, seed=int(x * 3)), x)
    x += BEAT * 2

# --- pad a partir del lift
x = SEC_LIFT
bar_i = int(SEC_LIFT // BAR)
while x < SEC_END:
    notes = PROG[bar_i % 4][3]
    add(music, pad(notes + [n * 2 for n in notes], min(BAR, SEC_END - x),
                   gain=0.16, seed=bar_i), x)
    bar_i += 1
    x += BAR

# --- contramelodía de steel drum en el lift (blancas)
LEAD = [(12.0, C5), (13.2, A4), (14.4, Bb4), (15.6, A4),
        (16.8, G4), (17.4, A4), (18.0, C5)]
for tt, f in LEAD:
    add(music, steel(f, 0.9, gain=0.30), tt)

# --- cierre: acorde de Fa sostenido bajo la placa de marca
add(music, pad([F4, A4, C5, F4 * 2], END - SEC_END, gain=0.22, seed=77), SEC_END)
for j, f in enumerate([F4, A4, C5]):
    add(music, marimba(f, 1.2, 0.34, seed=990 + j), SEC_END + j * 0.16)

# --- sidechain suave: el bombo abre paso sin bombear de más
duck = np.ones(N)
x = SEC_GROOVE
while x < SEC_END:
    i = sec(x)
    n = min(sec(BEAT * 0.7), N - i)
    if n > 0:
        duck[i:i + n] = np.minimum(duck[i:i + n],
                                   0.72 + 0.28 * (np.arange(n) / n) ** 0.6)
    x += BEAT
music *= duck

# ---------------------------------------------------------------- SFX
# Whoosh suave en cada corte del montaje
for i, cut in enumerate([2.4, 4.8, 6.6, 8.4, 10.2, 12.0, 13.8, 16.2, 18.6]):
    add(sfx, airy_whoosh(0.44, gain=0.17, down=(i % 2 == 1), seed=i), cut - 0.22)

# Chimes en los dos textos clave y en la placa
for tt in (0.10, 2.55, 16.35, 18.75):
    add(sfx, chime(1046.5, gain=0.11), tt)

# ---------------------------------------------------------------- salida

def write_wav(path, mono, peak=0.85, width=0.6):
    x = mono / (np.max(np.abs(mono)) + 1e-9) * peak
    d = sec(0.010)
    l = x
    r = np.concatenate([np.zeros(d), x[:-d]]) * (1 - width) + x * width
    r = r / (np.max(np.abs(r)) + 1e-9) * peak
    inter = np.empty(len(x) * 2)
    inter[0::2], inter[1::2] = l, r
    pcm = (np.clip(inter, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {path}  {len(x)/SR:.2f}s")


if __name__ == "__main__":
    print("Sintetizando audio (tropical/chill, 100 BPM, Fa mayor)...")
    write_wav("hab_music.wav", music, peak=0.84, width=0.66)
    write_wav("hab_sfx.wav", sfx, peak=0.78, width=0.55)
    print("listo")
