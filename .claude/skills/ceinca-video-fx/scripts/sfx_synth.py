#!/usr/bin/env python3
"""Sintetiza música + SFX (numpy puro, determinista, sin muestras externas) a partir de un spec de cues."""
import json, sys, wave
import numpy as np

SR = 44100
spec = json.load(open(sys.argv[1]))
N = int(spec['total'] * SR) + SR // 2
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def put(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += x * gain

def stereo(x, t, gain=1.0, pan=0.0):
    put(L, x, t, gain * (1 - max(pan, 0))); put(R, x, t, gain * (1 + min(pan, 0)))

def env(n, a, r):
    e = np.ones(n); na = max(int(a * SR), 1); nr = max(int(r * SR), 1)
    e[:na] = np.linspace(0, 1, na)[:n]; e[-nr:] *= np.linspace(1, 0, nr)[: min(nr, n)]
    return e

def lp(x, fc):                                   # filtro paso bajo de un polo con corte variable (array) o fijo
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s += a[i] * (x[i] - s); y[i] = s
    return y

def hp(x, fc): return x - lp(x, fc)

def noise(n): return rng.standard_normal(n)

def whoosh(d, up=True, bright=1.0):
    n = int(max(d, 0.25) * SR); tt = np.linspace(0, 1, n)
    sweep = (300 + 5200 * bright * (tt if up else 1 - tt) ** 1.6)
    y = hp(lp(noise(n), sweep), 180)
    e = (1 - np.exp(-tt * 60)) * np.exp(-tt * 4.2)      # ataque inmediato: el pico coincide con el arranque del movimiento (ease-out)
    return y * e * 0.9

def pop(f0=620, d=0.16):
    n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.9 * np.exp(-tt * 40)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt * 22) + 0.25 * np.sin(2 * ph) * np.exp(-tt * 40)
    y[:40] += noise(40) * 0.2
    return y * 0.9

def ding(f0=1175, d=0.35):
    n = int(d * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * tt) + 0.4 * np.sin(2 * np.pi * f0 * 2.01 * tt)) * np.exp(-tt * 11) * 0.5

def tick(f=3200):
    n = int(0.03 * SR)
    y = hp(noise(n), f) * np.exp(-np.arange(n) / SR * 150)
    return y * 0.7

def key(f=None):
    n = int(0.045 * SR); tt = np.arange(n) / SR
    f = f or rng.uniform(1700, 2600)
    y = (hp(noise(n), 1400) * 0.6 + np.sin(2 * np.pi * f * tt) * 0.5) * np.exp(-tt * 95)
    return y * 0.6

def impacto(strong):
    n = int(0.7 * SR); tt = np.arange(n) / SR
    f = 52 + 90 * np.exp(-tt * 18); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-tt * 6.5)
    y += lp(noise(n), 2500) * np.exp(-tt * 28) * 0.35
    return y * (0.85 if strong else 0.6)

def riser(d):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    f = 180 * (2 ** (tt * 2.8)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * 0.35 + hp(lp(noise(n), 400 + 6000 * tt ** 2), 300) * 0.5 * tt
    return y * (tt ** 1.3) * (1 - np.exp(-(1 - tt) * 25)) * 0.9

def dibujo(d):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    y = hp(lp(noise(n), 1400 + 2200 * tt), 600) * 0.35
    return y * env(n, 0.05, 0.12)

def relleno(d):
    n = int(d * SR); tt = np.linspace(0, 1, n)
    f = 420 * (2 ** (tt * 1.4)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * 0.12 * env(n, 0.04, 0.15)

def papel(d=0.2):
    n = int(d * SR); tt = np.arange(n) / SR
    y = hp(lp(noise(n), 5200), 900) * (0.5 + 0.5 * (rng.random(n) > 0.6)) * np.exp(-tt * 14)
    return y * 0.8

# ---------- SFX ----------
if spec['sfx']:
    for c in spec['cues']:
        t, d, k = c['t'], c.get('d', 0.4), c['tipo']
        pan = float(rng.uniform(-0.25, 0.25))
        if k == 'impacto': stereo(impacto(c.get('f', 1)), t, 0.9); stereo(whoosh(0.45, up=True, bright=0.6), max(t - 0.38, 0), 0.5)
        elif k == 'whoosh': stereo(whoosh(min(max(d, 0.3), 0.7), up=False), t, 0.7, pan)
        elif k == 'riser': stereo(riser(min(d, 1.8)), t, 0.8)
        elif k == 'pop':
            if c.get('f', 1): stereo(pop(760), t, 0.8, -0.2); stereo(ding(1319), t + 0.04, 0.35, -0.2)
            else: stereo(pop(520), t, 0.7, 0.2)
        elif k == 'papel': stereo(papel(), t, 0.8, pan)
        elif k == 'tick': stereo(tick(), t, 0.7, pan)
        elif k == 'dibujo': stereo(dibujo(min(d, 1.5)), t, 0.6, pan)
        elif k == 'relleno': stereo(relleno(min(d, 3)), t, 0.6)
        elif k == 'teclas':
            n = max(int(d * 22), 3)                        # ~22 caracteres/s, igual que el typewriter visual
            for j in range(n): stereo(key(), t + j * d / n, 0.7 + 0.2 * rng.random(), pan)
    sfx_L, sfx_R = L.copy(), R.copy()
else:
    sfx_L = np.zeros(N); sfx_R = np.zeros(N)

# ---------- Música: Am–F–C–G, 120 bpm, compás en cada corte (escenas de 6 s = 3 compases) ----------
mus_L = np.zeros(N); mus_R = np.zeros(N)
if spec['musica']:
    bpm = spec['bpm']; beat = 60 / bpm; bar = 4 * beat
    mid = lambda m: 440 * 2 ** ((m - 69) / 12)
    prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]   # Am F C G
    nb = int(spec['total'] / bar) + 1
    def padnote(f, d):
        n = int(d * SR); tt = np.arange(n) / SR
        y = sum(np.sin(2 * np.pi * f * (1 + dt) * tt) for dt in (-0.004, 0, 0.004)) / 3
        y += 0.25 * np.sin(2 * np.pi * f * 2 * tt)
        return y * env(n, 0.5, 0.9)
    def pluck(f, d=0.5):
        n = int(d * SR); tt = np.arange(n) / SR
        y = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 8) + 0.2 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 14))
        return y * np.exp(-tt * 7)
    def kick():
        n = int(0.32 * SR); tt = np.arange(n) / SR
        f = 48 + 110 * np.exp(-tt * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
    def hat():
        n = int(0.05 * SR); return hp(noise(n), 7000) * np.exp(-np.arange(n) / SR * 70) * 0.5
    for b in range(nb):
        t0 = b * bar; root, ch = prog[b % 4]
        for m in ch: put(mus_L, padnote(mid(m), bar * 1.15), t0, 0.07); put(mus_R, padnote(mid(m) * 1.002, bar * 1.15), t0, 0.07)
        put(mus_L, pluck(mid(root - 12), 0.9), t0, 0.35); put(mus_R, pluck(mid(root - 12), 0.9), t0, 0.35)
        arp = [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1], ch[0] + 12, ch[1]]
        for j, m in enumerate(arp):
            tt0 = t0 + j * beat / 2; pn = -0.3 if j % 2 else 0.3
            put(mus_L, pluck(mid(m + 12)), tt0, 0.10 * (1 - max(pn, 0))); put(mus_R, pluck(mid(m + 12)), tt0, 0.10 * (1 + min(pn, 0)))
        if b >= 1:                                          # entra el pulso tras el primer compás
            for j in range(4):
                put(mus_L, kick(), t0 + j * beat, 0.55); put(mus_R, kick(), t0 + j * beat, 0.55)
            for j in range(8):
                put(mus_L, hat(), t0 + j * beat / 2 + beat / 4 * (j % 2 == 1) * 0, 0.12 * (1.4 if j % 2 else 0.8)); put(mus_R, hat(), t0 + j * beat / 2, 0.12 * (1.4 if j % 2 else 0.8))
    # cierre: fundido de salida de 1.2 s
    fo = np.ones(N); nf = int(1.2 * SR); end = int(spec['total'] * SR)
    fo[end - nf:end] = np.linspace(1, 0, nf); fo[end:] = 0
    mus_L *= fo; mus_R *= fo

# ---------- Duck: la música baja 5 dB bajo cada SFX ----------
level = np.maximum(np.abs(sfx_L), np.abs(sfx_R))
level = lp(np.convolve(level, np.ones(int(0.02 * SR)) / int(0.02 * SR), 'same')[::1], 6.0)
duck = 1 - 0.45 * np.clip(level / (level.max() + 1e-9) * 3, 0, 1)
oL = mus_L * duck + sfx_L; oR = mus_R * duck + sfx_R
pk = max(np.abs(oL).max(), np.abs(oR).max(), 1e-9); oL, oR = oL / pk * 0.9, oR / pk * 0.9
pcm = (np.stack([oL, oR], 1)[: int(spec['total'] * SR)] * 32767).astype('<i2')
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
