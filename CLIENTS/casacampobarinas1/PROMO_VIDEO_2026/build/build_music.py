#!/usr/bin/env python3
"""
CASA CAMPO — banda sonora original sintetizada (libre de derechos).
120 BPM, La menor. Estructura calcada al montaje:

    0.0 – 4.0   INTRO    pad filtrado, sin bombo
    4.0 – 12.0  BUILD    entra bombo, bajo, hats; riser de 10.0 a 12.0
   12.0 – 18.0  DROP     todo arriba (sección de cortes rápidos)
   18.0 – 24.0  PAYOFF   sostenido, algo menos denso
   24.0 – 28.0  CTA      filtrado hacia abajo
   28.0 – 30.9  OUTRO    acorde final + cola de reverb

Salidas: music.wav (cama musical) y sfx.wav (whooshes, risers, impactos).
"""
import numpy as np
import wave, struct

SR = 48000
TOTAL = 30.9
BPM = 120.0
BEAT = 60.0 / BPM          # 0.5 s
BAR = BEAT * 4             # 2.0 s

N = int(TOTAL * SR)
t = np.arange(N) / SR


def sec(x):
    return int(x * SR)


def add(buf, sig, at):
    """Suma sig dentro de buf en la posición at (segundos), recortando al final."""
    i = sec(at)
    if i >= len(buf):
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]


def env(n, a=0.002, d=0.1, s=0.0, r=0.05, sus=0.0):
    """Envolvente ADSR simple sobre n muestras."""
    e = np.zeros(n)
    ai, di, ri = sec(a), sec(d), sec(r)
    ai = min(ai, n)
    e[:ai] = np.linspace(0, 1, ai, endpoint=False)
    rest = n - ai
    di = min(di, rest)
    if di > 0:
        e[ai:ai + di] = np.linspace(1, s, di, endpoint=False)
    if s > 0 and n > ai + di:
        e[ai + di:] = s
        if ri > 0:
            k = min(ri, n - ai - di)
            e[n - k:] *= np.linspace(1, 0, k)
    return e


def onepole_lp(x, cutoff):
    """Filtro paso-bajo de un polo (cutoff en Hz, escalar o vector)."""
    a = np.exp(-2 * np.pi * np.asarray(cutoff, dtype=float) / SR)
    y = np.empty_like(x)
    acc = 0.0
    if np.isscalar(a) or a.ndim == 0:
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
    """Paso-alto = señal menos su paso-bajo."""
    return x - onepole_lp(x, cutoff)


# ---------------------------------------------------------------- instrumentos

def kick(dur=0.42, gain=1.0):
    n = sec(dur)
    tt = np.arange(n) / SR
    # barrido de tono 150 -> 45 Hz
    f = 45 + 115 * np.exp(-tt * 34)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt * 7.5)
    click = (np.random.default_rng(1).standard_normal(n)
             * np.exp(-tt * 420) * 0.28)
    s = body + click
    return np.tanh(s * 1.7) * gain


def sub(freq, dur, gain=0.6):
    n = sec(dur)
    tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * freq * tt) * 0.85
         + np.sin(4 * np.pi * freq * tt) * 0.15)
    return s * env(n, a=0.008, d=0.05, s=0.85, r=0.06) * gain


def hat(dur=0.05, gain=0.22, open_=False, seed=0):
    n = sec(dur if not open_ else dur * 4)
    rng = np.random.default_rng(100 + seed)
    x = rng.standard_normal(n)
    x = hp(x, 7000)
    tt = np.arange(n) / SR
    return x * np.exp(-tt * (150 if not open_ else 22)) * gain


def clap(gain=0.5, seed=3):
    n = sec(0.30)
    rng = np.random.default_rng(200 + seed)
    x = hp(rng.standard_normal(n), 1200)
    tt = np.arange(n) / SR
    e = np.exp(-tt * 16)
    # tres rebotes iniciales -> textura de palmas
    for off, amp in ((0.0, 1.0), (0.011, 0.8), (0.023, 0.6)):
        i = sec(off)
        e[i:i + sec(0.006)] *= 2.2 * amp
    return x * e * gain


def supersaw(freq, dur, gain=0.25, detune=0.011, voices=5, seed=0):
    """Acorde/pad de sierras desafinadas."""
    n = sec(dur)
    tt = np.arange(n) / SR
    rng = np.random.default_rng(300 + seed)
    out = np.zeros(n)
    for v in range(voices):
        d = (v - (voices - 1) / 2) * detune
        f = freq * (1 + d)
        ph = (tt * f + rng.random()) % 1.0
        out += 2 * ph - 1                      # sierra
    out /= voices
    return out * gain


def chord(freqs, dur, gain=0.22, seed=0):
    n = sec(dur)
    out = np.zeros(n)
    for i, f in enumerate(freqs):
        out += supersaw(f, dur, gain=1.0, seed=seed * 7 + i)
    out /= len(freqs)
    return out * env(n, a=0.02, d=0.15, s=0.8, r=0.25) * gain


def riser(dur=2.0, gain=0.5):
    """Ruido filtrado ascendente + tono que sube: tensión hacia el drop."""
    n = sec(dur)
    tt = np.arange(n) / SR
    p = tt / dur
    rng = np.random.default_rng(9)
    noise = rng.standard_normal(n)
    cutoff = 300 * (60 ** p)                    # 300 Hz -> 18 kHz
    band = hp(onepole_lp(noise, cutoff), 200 + 2500 * p)
    f = 220 * (2 ** (2.2 * p))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    return (band * 0.9 + tone) * (p ** 1.7) * gain


def whoosh(dur=0.55, gain=0.4, down=False, seed=0):
    """Barrido de ruido para acompañar un corte."""
    n = sec(dur)
    tt = np.arange(n) / SR
    p = tt / dur
    rng = np.random.default_rng(400 + seed)
    x = rng.standard_normal(n)
    curve = (1 - p) if down else p
    x = hp(onepole_lp(x, 500 + 9000 * curve), 400)
    shape = np.sin(np.pi * p) ** 1.4
    return x * shape * gain


def impact(gain=0.9):
    """Golpe grave con cola: marca el drop."""
    n = sec(1.6)
    tt = np.arange(n) / SR
    f = 38 + 60 * np.exp(-tt * 12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)
    rng = np.random.default_rng(11)
    tail = onepole_lp(rng.standard_normal(n), 900) * np.exp(-tt * 4.5) * 0.35
    return np.tanh((body + tail) * 1.3) * gain


def reverse_cymbal(dur=1.6, gain=0.32):
    n = sec(dur)
    tt = np.arange(n) / SR
    rng = np.random.default_rng(21)
    x = hp(rng.standard_normal(n), 4500)
    return x * ((tt / dur) ** 2.4) * gain


# ---------------------------------------------------------------- arreglo

music = np.zeros(N)
sfx = np.zeros(N)

# Progresión en La menor: Am – F – C – G (un compás cada uno, ciclo de 8 s)
PROG = [
    ("Am", 220.00, [220.00, 261.63, 329.63]),
    ("F",  174.61, [174.61, 220.00, 261.63]),
    ("C",  261.63, [261.63, 329.63, 392.00]),
    ("G",  196.00, [196.00, 246.94, 293.66]),
]

SEC_INTRO, SEC_BUILD, SEC_DROP = 0.0, 4.0, 12.0
SEC_PAY, SEC_CTA, SEC_OUTRO, END = 18.0, 24.0, 28.0, TOTAL


def section_at(x):
    if x < SEC_BUILD:  return "intro"
    if x < SEC_DROP:   return "build"
    if x < SEC_PAY:    return "drop"
    if x < SEC_CTA:    return "payoff"
    if x < SEC_OUTRO:  return "cta"
    return "outro"


# --- acordes: un compás por acorde, de principio a fin
bar_i = 0
x = 0.0
while x < END:
    name, root, notes = PROG[bar_i % 4]
    s = section_at(x)
    g = {"intro": 0.30, "build": 0.19, "drop": 0.34,
         "payoff": 0.21, "cta": 0.17, "outro": 0.28}[s]
    voiced = notes if s in ("intro", "build", "cta") else notes + [n * 2 for n in notes]
    add(music, chord(voiced, min(BAR, END - x), gain=g, seed=bar_i), x)
    bar_i += 1
    x += BAR

# --- intro con pulso: el arranque de un Reel no puede sonar vacío.
# Bombo apagado (paso-bajo) y hats suaves desde el compás 2.
x = 2.0
while x < SEC_BUILD:
    add(music, onepole_lp(kick(gain=0.62), 220), x)
    x += BEAT
x = 3.0
k0 = 0
while x < SEC_BUILD:
    add(music, hat(gain=0.10 + 0.05 * k0, seed=900 + k0), x)
    k0 += 1
    x += BEAT / 2

# --- bombo: cuatro por compás desde el BUILD hasta el final del CTA
x = SEC_BUILD
while x < SEC_OUTRO:
    s = section_at(x)
    g = {"build": 0.75, "drop": 1.0, "payoff": 0.82, "cta": 0.68}[s]
    # el compás previo al drop deja hueco para el riser
    if 11.0 <= x < 12.0:
        g *= 0.5
    add(music, kick(gain=g), x)
    x += BEAT

# --- bajo: corcheas con acento, sigue la raíz del acorde
x = SEC_BUILD
while x < SEC_OUTRO:
    bi = int(x // BAR) % 4
    root = PROG[bi][1] / 2.0                     # una octava abajo
    s = section_at(x)
    g = {"build": 0.34, "drop": 0.55, "payoff": 0.38, "cta": 0.28}[s]
    off = (x / (BEAT / 2)) % 2
    if off >= 1:                                  # contratiempo más corto
        add(music, sub(root, BEAT * 0.32, gain=g * 0.7), x)
    else:
        add(music, sub(root, BEAT * 0.42, gain=g), x)
    x += BEAT / 2

# --- hi-hats: semicorcheas desde el BUILD; abiertos en el contratiempo del DROP
x = SEC_BUILD
k = 0
while x < SEC_OUTRO:
    s = section_at(x)
    base = {"build": 0.16, "drop": 0.28, "payoff": 0.17, "cta": 0.13}[s]
    accent = 1.5 if k % 4 == 2 else 1.0
    add(music, hat(gain=base * accent, seed=k), x)
    if s == "drop" and k % 8 == 4:
        add(music, hat(gain=base * 0.9, open_=True, seed=k), x)
    k += 1
    x += BEAT / 4

# --- palmas en los tiempos 2 y 4
x = SEC_BUILD + BEAT
while x < SEC_OUTRO:
    s = section_at(x)
    g = {"build": 0.30, "drop": 0.55, "payoff": 0.36, "cta": 0.24}[s]
    add(music, clap(gain=g, seed=int(x)), x)
    x += BEAT * 2

# --- acorde final sostenido
_, _, last = PROG[0]
add(music, chord(last + [n * 2 for n in last], END - SEC_OUTRO, gain=0.30, seed=99),
    SEC_OUTRO)
add(music, impact(gain=0.5), SEC_OUTRO)

# ---------------------------------------------------------------- sidechain
# El bombo "respira": todo se agacha en cada negra mientras hay batería.
duck = np.ones(N)
x = SEC_BUILD
while x < SEC_OUTRO:
    i = sec(x)
    n = min(sec(BEAT * 0.85), N - i)
    if n > 0:
        depth = 0.55 if section_at(x) == "drop" else 0.42
        duck[i:i + n] = np.minimum(
            duck[i:i + n],
            (1 - depth) + depth * (np.arange(n) / n) ** 0.55)
    x += BEAT
music *= duck

# ---------------------------------------------------------------- SFX
# Golpe de apertura: puntúa el gancho en el frame 1 en vez de arrancar en vacío.
add(sfx, impact(gain=0.72), 0.0)
add(sfx, riser(2.0, gain=0.55), SEC_DROP - 2.0)
add(sfx, reverse_cymbal(1.6, gain=0.30), SEC_BUILD - 1.6)
add(sfx, reverse_cymbal(1.4, gain=0.26), SEC_PAY - 1.4)

# Impactos en los dos golpes estructurales
add(sfx, impact(gain=0.95), SEC_DROP)
add(sfx, impact(gain=0.55), SEC_PAY)

# Whooshes en los cortes principales del montaje
for i, cut in enumerate([2.0, 4.0, 6.0, 8.0, 9.5, 11.0,
                         18.0, 21.0, 24.0, 27.5]):
    add(sfx, whoosh(0.5, gain=0.30, down=(i % 2 == 1), seed=i), cut - 0.25)

# Whooshes cortos en los cortes rápidos del drop
for i, cut in enumerate([13.0, 13.5, 14.0, 15.0, 15.5, 16.0, 17.0]):
    add(sfx, whoosh(0.24, gain=0.16, down=(i % 2 == 0), seed=50 + i), cut - 0.10)

# ---------------------------------------------------------------- salida

def write_wav(path, mono, peak=0.89, stereo_width=0.0):
    x = mono / (np.max(np.abs(mono)) + 1e-9) * peak
    x = np.tanh(x * 1.05)
    if stereo_width > 0:
        d = sec(0.012)
        l = x.copy()
        r = np.concatenate([np.zeros(d), x[:-d]]) * (1 - stereo_width) + x * stereo_width
        r /= (np.max(np.abs(r)) + 1e-9) / peak
        inter = np.empty(len(x) * 2)
        inter[0::2], inter[1::2] = l, r
        ch, data = 2, inter
    else:
        ch, data = 1, x
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"  {path}  {len(x)/SR:.2f}s  {ch}ch")


if __name__ == "__main__":
    print("Sintetizando audio...")
    write_wav("music.wav", music, peak=0.86, stereo_width=0.72)
    write_wav("sfx.wav", sfx, peak=0.80, stereo_width=0.55)
    print("listo")
