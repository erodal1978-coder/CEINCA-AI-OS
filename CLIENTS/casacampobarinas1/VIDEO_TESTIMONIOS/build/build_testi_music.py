#!/usr/bin/env python3
"""
CASA & CAMPO — música del Reel de testimonios. Libre de derechos.

Deliberadamente escasa: sólo suena en el gancho (0–2.1 s) y en el cierre
(26.1–30.6 s). Bajo los testimonios NO HAY MÚSICA, ni siquiera baja.

El motivo es que estos clips se grabaron dentro de la fiesta y ya arrastran la
música del party detrás de la voz. Meter una segunda pista encima —aunque
fuera al 15%— sumaría un tercer plano sonoro y volvería el testimonio
ininteligible. Aquí la música enmarca, no acompaña.

Do mayor, cálida, sin percusión. Salida: testi_music.wav
"""
import numpy as np
import wave

SR = 48000
TOTAL = 30.6
N = int(TOTAL * SR)

HOOK_IN, HOOK_OUT = 0.0, 2.10      # se apaga justo antes del primer testimonio
CTA_IN, CTA_OUT = 26.10, TOTAL     # vuelve cuando ya nadie habla


def sec(x):
    return int(x * SR)


def add(buf, sig, at):
    i = sec(at)
    if i >= len(buf) or i < 0:
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]


def onepole_lp(x, cutoff):
    a = float(np.exp(-2 * np.pi * cutoff / SR))
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def piano(freq, dur=1.8, gain=0.5, seed=0):
    n = sec(dur); t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 1.7)
         + 0.32 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 3.0)
         + 0.12 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 4.8))
    rng = np.random.default_rng(11 + seed)
    y += rng.standard_normal(n) * np.exp(-t * 400) * 0.025
    return y * np.minimum(1.0, t / 0.006) * gain


def pad(freqs, dur, gain=0.18, seed=0):
    n = sec(dur); t = np.arange(n) / SR
    rng = np.random.default_rng(50 + seed)
    out = np.zeros(n)
    for f in freqs:
        for v in range(3):
            ph = (t * f * (1 + (v - 1) * 0.006) + rng.random()) % 1.0
            out += 2 * ph - 1
    out /= (len(freqs) * 3)
    out = onepole_lp(out, 1200)
    env = np.minimum(1.0, t / 0.5) * np.minimum(1.0, (dur - t) / 0.6)
    return out * np.maximum(0, env) * gain


def chime(freq=1046.5, gain=0.10):
    n = sec(1.0); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.8)
            + 0.4 * np.sin(2 * np.pi * freq * 2.5 * t) * np.exp(-t * 6.5)) * gain


music = np.zeros(N)

C4, E4, G4, A4, C5, F4, D4, B4 = 261.63, 329.63, 392.00, 440.00, 523.25, 349.23, 293.66, 493.88

# --- gancho: un acorde de Do que abre y se retira
add(music, pad([C4, E4, G4, C5], 2.10, gain=0.22, seed=1), HOOK_IN)
for j, f in enumerate([C4, E4, G4]):
    add(music, piano(f, 1.9, 0.38, seed=j), HOOK_IN + 0.05 + j * 0.10)
add(music, chime(1046.5, 0.10), 0.18)

# --- cierre: F – G – C, resolución cálida bajo el logo
add(music, pad([F4, A4, C5], 1.5, gain=0.20, seed=2), CTA_IN)
add(music, pad([G4, B4, D4 * 2], 1.5, gain=0.20, seed=3), CTA_IN + 1.5)
add(music, pad([C4, E4, G4, C5], TOTAL - (CTA_IN + 3.0), gain=0.24, seed=4), CTA_IN + 3.0)
for j, f in enumerate([F4, A4, C5]):
    add(music, piano(f, 1.6, 0.34, seed=10 + j), CTA_IN + 0.05 + j * 0.09)
for j, f in enumerate([C4, E4, G4, C5]):
    add(music, piano(f, 2.0, 0.34, seed=20 + j), CTA_IN + 3.05 + j * 0.09)
add(music, chime(1318.5, 0.12), CTA_IN + 0.30)

# --- silencio absoluto bajo los testimonios
env = np.ones(N)
env[sec(HOOK_OUT):sec(CTA_IN)] = 0.0
f = sec(0.35)
env[sec(HOOK_OUT) - f:sec(HOOK_OUT)] = np.linspace(1, 0, f)
env[sec(CTA_IN):sec(CTA_IN) + f] = np.linspace(0, 1, f)
music *= env


def write_wav(path, mono, peak=0.82, width=0.6):
    x = mono / (np.max(np.abs(mono)) + 1e-9) * peak
    d = sec(0.011)
    r = np.concatenate([np.zeros(d), x[:-d]]) * (1 - width) + x * width
    r = r / (np.max(np.abs(r)) + 1e-9) * peak
    inter = np.empty(len(x) * 2)
    inter[0::2], inter[1::2] = x, r
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(inter, -1, 1) * 32767).astype("<i2").tobytes())
    print(f"  {path}  {len(x)/SR:.2f}s")


if __name__ == "__main__":
    print("Sintetizando música de marco (Do mayor, sin percusión)...")
    write_wav("testi_music.wav", music)
    print("  música sólo en 0.0–2.1 s y 26.1–30.6 s; silencio bajo los testimonios")
