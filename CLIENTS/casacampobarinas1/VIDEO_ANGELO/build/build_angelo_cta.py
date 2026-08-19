#!/usr/bin/env python3
"""
CASA & CAMPO — placa de cierre animada del Reel de Angelo.

El logo se compone cuadro a cuadro en numpy para poder controlar el rebote:
ffmpeg no puede animar `scale` (evalúa w/h una sola vez), así que la escala
por frame se hace aquí y el resultado se manda a ffmpeg por tubería.

Animación: entrada con muelle (easeOutBack) desde 0.55x, resplandor que
pulsa una vez, y respiración lenta al asentarse. El texto lo pone ffmpeg
encima, que para tipografía es mejor herramienta.

Salida: seg3/99_cta.mp4  (4.0 s, 120 frames, 1080x1920)
"""
import numpy as np
import subprocess, os

SCRATCH = "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad"
SRC = "/home/user/CEINCA-AI-OS/Videos/Assets"
LOGO = f"{SRC}/Logo IG Nuevo_20260819_130946_0000.png"
BG_CLIP = f"{SRC}/VID-20260811-WA0150.mp4"
FONT_A = f"{SCRATCH}/fonts/Anton.ttf"
FONT_B = f"{SCRATCH}/fonts/ArchivoBlack.ttf"

W, H, FPS = 1080, 1920, 30
DUR = 4.4        # 4.0 s de placa + 0.4 s que se come la disolvencia
NFR = int(DUR * FPS)
LOGO_BASE = 620          # tamaño del logo a escala 1.0
LOGO_CY = 700            # centro vertical del logo


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, **kw)
    if r.returncode != 0:
        raise SystemExit(f"fallo: {cmd}\n{r.stderr.decode()[-2000:]}")
    return r


def load_rgba(path, size):
    """Decodifica un PNG con alfa a un array (size, size, 4) float 0..1."""
    r = run(["ffmpeg", "-v", "error", "-i", path,
             "-vf", f"scale={size}:{size}:flags=lanczos",
             "-f", "rawvideo", "-pix_fmt", "rgba", "-"])
    a = np.frombuffer(r.stdout, dtype=np.uint8).reshape(size, size, 4)
    return a.astype(np.float32) / 255.0


def load_bg():
    """Fondo: un frame de la multitud, desenfocado y oscurecido."""
    out = f"{SCRATCH}/cta_bg.png"
    run(["ffmpeg", "-y", "-v", "error", "-ss", "2.2", "-i", BG_CLIP,
         "-frames:v", "1",
         "-vf", (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
                 f"crop={W}:{H},eq=contrast=1.05:saturation=1.10:brightness=-0.30,"
                 f"gblur=sigma=26,vignette=PI/3.2"),
         out])
    r = run(["ffmpeg", "-v", "error", "-i", out,
             "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(r.stdout, dtype=np.uint8).reshape(H, W, 3).astype(np.float32) / 255.0


def resize_rgba(img, n):
    """Reescala bilineal a n×n conservando alfa."""
    s = img.shape[0]
    if n == s:
        return img
    g = (np.arange(n) + 0.5) * s / n - 0.5
    g = np.clip(g, 0, s - 1)
    i0 = np.floor(g).astype(int)
    i1 = np.minimum(i0 + 1, s - 1)
    f = (g - i0).astype(np.float32)
    tmp = img[i0] * (1 - f)[:, None, None] + img[i1] * f[:, None, None]
    tmp = tmp[:, i0] * (1 - f)[None, :, None] + tmp[:, i1] * f[None, :, None]
    return tmp


def ease_out_back(p, overshoot=1.45):
    c1 = overshoot
    c3 = c1 + 1.0
    q = p - 1.0
    return 1.0 + c3 * q ** 3 + c1 * q ** 2


def radial_glow(size, softness=0.55):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    c = (size - 1) / 2.0
    d = np.sqrt((x - c) ** 2 + (y - c) ** 2) / c
    g = np.clip(1.0 - d / softness, 0.0, 1.0) ** 2
    return g


def main():
    bg = load_bg()
    logo = load_rgba(LOGO, 900)
    glow_src = radial_glow(1400)
    GLOW_RGB = np.array([0.29, 0.70, 1.00], dtype=np.float32)   # azul del logo

    p = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-",
         "-vf", (
             # Texto sobre la animación: ffmpeg es mejor para tipografía.
             f"drawtext=fontfile='{FONT_A}':text='¿TU PRÓXIMO':fontcolor=white"
             f":fontsize=76:x=(w-tw)/2:y='1120-26*(1-min(1\\,max(0\\,t-0.55)/0.30))'"
             f":alpha='min(1\\,max(0\\,t-0.55)/0.30)'"
             f":borderw=8:bordercolor=black@0.85,"
             f"drawtext=fontfile='{FONT_A}':text='EVENTO?':fontcolor=black"
             f":fontsize=150:x=(w-tw)/2:y='1280-26*(1-min(1\\,max(0\\,t-0.70)/0.30))'"
             f":alpha='min(1\\,max(0\\,t-0.70)/0.30)'"
             f":box=1:boxcolor=0xC6FF00@0.96:boxborderw=26,"
             f"drawtext=fontfile='{FONT_B}':text='COMENTA\\: EVENTO':fontcolor=white"
             f":fontsize=48:x=(w-tw)/2:y=1500:alpha='min(1\\,max(0\\,t-1.05)/0.35)'"
             f":borderw=6:bordercolor=black@0.85,"
             f"drawtext=fontfile='{FONT_B}':text='@casacampobarinas1':fontcolor=0x00E5FF"
             f":fontsize=40:x=(w-tw)/2:y=1580:alpha='min(1\\,max(0\\,t-1.25)/0.35)'"
             f":borderw=5:bordercolor=black@0.8,"
             f"drawtext=fontfile='{FONT_B}':text='0424-5541927':fontcolor=white"
             f":fontsize=36:x=(w-tw)/2:y=1642:alpha='min(1\\,max(0\\,t-1.40)/0.35)'"
             f":borderw=5:bordercolor=black@0.8,"
             f"format=yuv420p"),
         "-frames:v", str(NFR),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-r", str(FPS),
         f"{SCRATCH}/seg3/99_cta.mp4"],
        stdin=subprocess.PIPE)

    for n in range(NFR):
        t = n / FPS
        frame = bg.copy()

        # --- muelle de entrada + respiración
        if t < 0.18:
            scale, alpha = 0.0, 0.0
        else:
            p_in = min(1.0, (t - 0.18) / 0.55)
            scale = 0.55 + (1.0 - 0.55) * ease_out_back(p_in)
            alpha = min(1.0, (t - 0.18) / 0.22)
            if p_in >= 1.0:
                scale *= 1.0 + 0.012 * np.sin((t - 0.73) * 2.0)

        if alpha <= 0.001:
            p.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
            continue

        # --- resplandor: un pulso al aparecer, luego se asienta
        gpulse = 0.55 * np.exp(-((t - 0.42) ** 2) / 0.045) + 0.16
        gsize = int(LOGO_BASE * scale * 2.1)
        if gsize > 2:
            g = resize_rgba(glow_src[:, :, None], gsize)[:, :, 0] * gpulse * alpha
            gy0 = LOGO_CY - gsize // 2
            gx0 = (W - gsize) // 2
            y0, y1 = max(0, gy0), min(H, gy0 + gsize)
            x0, x1 = max(0, gx0), min(W, gx0 + gsize)
            if y1 > y0 and x1 > x0:
                sub = g[y0 - gy0:y1 - gy0, x0 - gx0:x1 - gx0][:, :, None]
                frame[y0:y1, x0:x1] += sub * GLOW_RGB[None, None, :]

        # --- logo
        lsize = max(2, int(LOGO_BASE * scale))
        lg = resize_rgba(logo, lsize)
        ly0 = LOGO_CY - lsize // 2
        lx0 = (W - lsize) // 2
        y0, y1 = max(0, ly0), min(H, ly0 + lsize)
        x0, x1 = max(0, lx0), min(W, lx0 + lsize)
        if y1 > y0 and x1 > x0:
            sub = lg[y0 - ly0:y1 - ly0, x0 - lx0:x1 - lx0]
            a = (sub[:, :, 3] * alpha)[:, :, None]
            frame[y0:y1, x0:x1] = frame[y0:y1, x0:x1] * (1 - a) + sub[:, :, :3] * a

        p.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())

    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("ffmpeg falló al codificar la placa")
    print(f"  placa de cierre lista: {NFR} frames, {DUR:.1f}s")


if __name__ == "__main__":
    os.makedirs(f"{SCRATCH}/seg3", exist_ok=True)
    main()
