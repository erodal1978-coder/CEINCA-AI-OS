#!/usr/bin/env python3
"""
Limitador de pico real (true peak) con sobremuestreo 4x.

alimiter de ffmpeg sólo mira picos de muestra, así que deja pasar picos
inter-muestra que el codificador AAC convierte luego en saturación por encima
de 0 dBFS. Aquí se detectan en el dominio sobremuestreado y se calcula una
curva de ganancia suave que se aplica a la señal original.

Uso: tp_limit.py entrada.wav salida.wav [LUFS_objetivo] [techo_dBTP]
"""
import sys, wave
import numpy as np

SR = 48000
OS = 4                    # factor de sobremuestreo


def read_wav(path):
    w = wave.open(path, "rb")
    ch, sr, n = w.getnchannels(), w.getframerate(), w.getnframes()
    d = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float64) / 32768.0
    w.close()
    return d.reshape(-1, ch), sr


def write_wav(path, x, sr):
    pcm = (np.clip(x, -1.0, 1.0) * 32767).astype("<i2")
    w = wave.open(path, "wb")
    w.setnchannels(x.shape[1])
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(pcm.tobytes())
    w.close()


def upsample_fft(x, factor):
    """Sobremuestreo por relleno de ceros en frecuencia (interpolación sinc)."""
    n = len(x)
    X = np.fft.rfft(x)
    Y = np.zeros(n * factor // 2 + 1, dtype=complex)
    Y[:len(X)] = X
    return np.fft.irfft(Y, n * factor) * factor


def k_weight(x, sr):
    """Filtro de ponderación K (ITU-R BS.1770) para medir loudness."""
    # Pre-filtro de realce (cabeza) + paso-alto RLB, coeficientes a 48 kHz.
    b1 = np.array([1.53512485958697, -2.69169618940638, 1.19839281085285])
    a1 = np.array([1.0, -1.69065929318241, 0.73248077421585])
    b2 = np.array([1.0, -2.0, 1.0])
    a2 = np.array([1.0, -1.99004745483398, 0.99007225036621])

    def biquad(sig, b, a):
        y = np.zeros_like(sig)
        x1 = x2 = y1 = y2 = 0.0
        for i in range(len(sig)):
            xi = sig[i]
            yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
            x2, x1 = x1, xi
            y2, y1 = y1, yi
            y[i] = yi
        return y

    return biquad(biquad(x, b1, a1), b2, a2)


def integrated_lufs(sig, sr):
    """Loudness integrado con compuerta a -10 LU (BS.1770-4, simplificado)."""
    ch = sig.shape[1]
    z = np.zeros(sig.shape[0])
    for c in range(ch):
        z += k_weight(sig[:, c], sr) ** 2
    blk = int(0.400 * sr)
    hop = int(0.100 * sr)
    if len(z) < blk:
        return -70.0
    starts = range(0, len(z) - blk, hop)
    powers = np.array([z[s:s + blk].mean() for s in starts])
    lk = -0.691 + 10 * np.log10(powers + 1e-12)
    abs_ok = lk > -70.0
    if not abs_ok.any():
        return -70.0
    rel = -0.691 + 10 * np.log10(powers[abs_ok].mean() + 1e-12) - 10.0
    keep = abs_ok & (lk > rel)
    if not keep.any():
        keep = abs_ok
    return -0.691 + 10 * np.log10(powers[keep].mean() + 1e-12)


def true_peak_db(sig):
    p = 0.0
    for c in range(sig.shape[1]):
        p = max(p, np.abs(upsample_fft(sig[:, c], OS)).max())
    return 20 * np.log10(p + 1e-12)


def tp_limit(sig, ceiling_db, sr):
    """Reduce sólo lo necesario para que el pico real quede bajo el techo."""
    ceil = 10 ** (ceiling_db / 20.0)

    # Envolvente de pico real por muestra (máximo entre canales)
    peak_os = np.zeros(sig.shape[0] * OS)
    for c in range(sig.shape[1]):
        peak_os = np.maximum(peak_os, np.abs(upsample_fft(sig[:, c], OS)))
    peak = peak_os.reshape(-1, OS).max(axis=1)

    need = np.minimum(1.0, ceil / (peak + 1e-12))     # ganancia requerida <= 1

    # Ataque anticipado: la ganancia baja ANTES del pico (lookahead ~4 ms)
    la = int(0.004 * sr)
    g = need.copy()
    for i in range(1, la + 1):
        g = np.minimum(g, np.roll(need, -i))
    g[-la:] = np.minimum(g[-la:], need[-1])

    # Suavizado: ataque rápido, release lento -> sin distorsión audible
    atk = np.exp(-1.0 / (0.0008 * sr))
    rel = np.exp(-1.0 / (0.120 * sr))
    sm = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        tgt = g[i]
        coef = atk if tgt < cur else rel
        cur = coef * cur + (1 - coef) * tgt
        sm[i] = cur

    # El suavizado nunca debe dejar la ganancia por encima de la requerida:
    # si no, el pico se cuela igual. El pre-ramp ya evita el escalón brusco.
    sm = np.minimum(sm, need)

    return sig * sm[:, None]


def main():
    src, dst = sys.argv[1], sys.argv[2]
    target_lufs = float(sys.argv[3]) if len(sys.argv) > 3 else -14.0
    ceiling = float(sys.argv[4]) if len(sys.argv) > 4 else -1.8

    sig, sr = read_wav(src)
    li = integrated_lufs(sig, sr)
    gain = 10 ** ((target_lufs - li) / 20.0)
    print(f"  entrada: {li:.2f} LUFS, {true_peak_db(sig):+.2f} dBTP")
    print(f"  ganancia aplicada: {20*np.log10(gain):+.2f} dB")

    out = tp_limit(sig * gain, ceiling, sr)
    print(f"  salida:  {integrated_lufs(out, sr):.2f} LUFS, "
          f"{true_peak_db(out):+.2f} dBTP (techo {ceiling:+.1f})")
    write_wav(dst, out, sr)


if __name__ == "__main__":
    main()
