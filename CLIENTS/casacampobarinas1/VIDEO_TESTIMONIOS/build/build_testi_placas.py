#!/usr/bin/env python3
"""
CASA & CAMPO — gancho y placa de cierre del Reel de testimonios.

El gancho plantea la objeción que el propio Reel responde ("¿vale la pena?")
en vez de afirmar lo que dicen los testimonios: no hay transcripción posible
en este entorno, así que no se les pone nada en boca.

El cierre reutiliza el logo animado con muelle del Reel de Angelo.

Salidas: seg4/00_hook.mp4 (2.0 s) y seg4/99_cta.mp4 (4.4 s)
"""
import numpy as np
import subprocess, os

SCRATCH = "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad"
ASSETS = "/home/user/CEINCA-AI-OS/Videos/Assets"
SRC = "/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11"
LOGO = f"{ASSETS}/Logo IG Nuevo_20260819_130946_0000.png"
BG_CLIP = f"{SRC}/25ba7d3c-VID20260801WA00101.mp4"     # la cara más expresiva
FONT_A = f"{SCRATCH}/fonts/Anton.ttf"
FONT_B = f"{SCRATCH}/fonts/ArchivoBlack.ttf"

W, H, FPS = 1080, 1920, 30
LOGO_BASE, LOGO_CY = 600, 690


def run(cmd):
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        raise SystemExit(f"fallo: {cmd}\n{r.stderr.decode()[-2000:]}")
    return r


# ------------------------------------------------------------------ gancho
def build_hook():
    """2.0 s: la pregunta que el Reel va a responder, sobre una cara real.

    El bloque de texto va DEBAJO de la barbilla (la cara ocupa y 780–1230 en
    este encuadre): en un testimonio la cara es el argumento, taparla mata el
    gancho. Como efecto colateral, la caja lima cubre el torso.
    """
    vf = (
        "scale=1620:2880:force_original_aspect_ratio=increase:flags=lanczos,"
        "crop=1620:2880,fps=30,"
        "zoompan=z='1.44+0.05*on/60':d=1:x='iw/2-(iw/zoom/2)'"
        ":y='max(0\\,min(ih-ih/zoom\\,ih*0.34-(ih/zoom/2)))':s=1080x1920:fps=30,"
        "eq=contrast=1.10:saturation=1.04:brightness=-0.05:gamma=1.02,"
        # el desenfoque y el velo eran para leer texto SOBRE la cara; ahora el
        # texto va debajo, así que la cara puede verse nítida y más clara
        "gblur=sigma=2,vignette=PI/3.6,noise=alls=3:allf=t+u,"
        "drawbox=x=0:y=0:w=1080:h=1920:color=black@0.20:t=fill,"
        # el texto sí necesita fondo: degradado hacia el tercio inferior.
        # Se apilan cajas al 5 % cada 32 px porque una sola banda deja un filo
        # recto visible cruzando el hombro.
        + "".join(f"drawbox=x=0:y={y}:w=1080:h={1920-y}:color=black@0.05:t=fill,"
                  for y in range(1040, 1041 + 32 * 11, 32))
        +
        f"drawtext=fontfile='{FONT_B}':text='LA PROMOCIÓN 2026 RESPONDE'"
        ":fontcolor=0x00E5FF:fontsize=42:x=(w-tw)/2:y=1262"
        ":alpha='min(1\\,max(0\\,t-0.10)/0.25)':borderw=6:bordercolor=black@0.9,"
        f"drawtext=fontfile='{FONT_A}':text='¿VALE LA PENA':fontcolor=white"
        ":fontsize=118:x=(w-tw)/2:y='1330-24*(1-min(1\\,max(0\\,t-0.20)/0.28))'"
        ":alpha='min(1\\,max(0\\,t-0.20)/0.28)':borderw=10:bordercolor=black@0.92,"
        f"drawtext=fontfile='{FONT_A}':text='ALQUILARLO?':fontcolor=black"
        ":fontsize=118:x=(w-tw)/2:y='1472-24*(1-min(1\\,max(0\\,t-0.34)/0.28))'"
        ":alpha='min(1\\,max(0\\,t-0.34)/0.28)'"
        ":box=1:boxcolor=0xC6FF00@0.96:boxborderw=24,"
        "format=yuv420p")
    run(["ffmpeg", "-y", "-v", "error", "-ss", "6.6", "-t", "2.0", "-i", BG_CLIP,
         "-vf", vf, "-frames:v", "60", "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-r", "30", f"{SCRATCH}/seg4/00_hook.mp4"])
    print("  gancho listo (2.0 s)")


# ------------------------------------------------------------------ cierre
def load_rgba(path, size):
    r = run(["ffmpeg", "-v", "error", "-i", path,
             "-vf", f"scale={size}:{size}:flags=lanczos",
             "-f", "rawvideo", "-pix_fmt", "rgba", "-"])
    return np.frombuffer(r.stdout, dtype=np.uint8).reshape(size, size, 4).astype(np.float32) / 255


def load_bg():
    out = f"{SCRATCH}/testi_cta_bg.png"
    run(["ffmpeg", "-y", "-v", "error", "-ss", "10.5", "-i", BG_CLIP, "-frames:v", "1",
         "-vf", (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
                 f"crop={W}:{H},eq=contrast=1.05:saturation=1.05:brightness=-0.34,"
                 f"gblur=sigma=28,vignette=PI/3.2"), out])
    r = run(["ffmpeg", "-v", "error", "-i", out, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(r.stdout, dtype=np.uint8).reshape(H, W, 3).astype(np.float32) / 255


def resize_rgba(img, n):
    s = img.shape[0]
    if n == s:
        return img
    g = np.clip((np.arange(n) + 0.5) * s / n - 0.5, 0, s - 1)
    i0 = np.floor(g).astype(int); i1 = np.minimum(i0 + 1, s - 1)
    f = (g - i0).astype(np.float32)
    t = img[i0] * (1 - f)[:, None, None] + img[i1] * f[:, None, None]
    return t[:, i0] * (1 - f)[None, :, None] + t[:, i1] * f[None, :, None]


def ease_out_back(p, c1=1.45):
    c3 = c1 + 1.0; q = p - 1.0
    return 1.0 + c3 * q ** 3 + c1 * q ** 2


def radial_glow(size, soft=0.55):
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    c = (size - 1) / 2.0
    d = np.sqrt((x - c) ** 2 + (y - c) ** 2) / c
    return np.clip(1.0 - d / soft, 0, 1) ** 2


def build_cta():
    DUR = 4.4
    NFR = int(DUR * FPS)
    bg = load_bg(); logo = load_rgba(LOGO, 900); glow = radial_glow(1400)
    GLOW = np.array([0.29, 0.70, 1.00], dtype=np.float32)
    vf = (
        f"drawtext=fontfile='{FONT_A}':text='¿TU PROMOCIÓN ES LA':fontcolor=white"
        f":fontsize=68:x=(w-tw)/2:y='1110-26*(1-min(1\\,max(0\\,t-0.55)/0.30))'"
        f":alpha='min(1\\,max(0\\,t-0.55)/0.30)':borderw=8:bordercolor=black@0.85,"
        f"drawtext=fontfile='{FONT_A}':text='PRÓXIMA?':fontcolor=black"
        f":fontsize=148:x=(w-tw)/2:y='1265-26*(1-min(1\\,max(0\\,t-0.70)/0.30))'"
        f":alpha='min(1\\,max(0\\,t-0.70)/0.30)'"
        f":box=1:boxcolor=0xC6FF00@0.96:boxborderw=26,"
        f"drawtext=fontfile='{FONT_B}':text='COMENTA\\: PROMOCIÓN':fontcolor=white"
        f":fontsize=46:x=(w-tw)/2:y=1490:alpha='min(1\\,max(0\\,t-1.05)/0.35)'"
        f":borderw=6:bordercolor=black@0.85,"
        f"drawtext=fontfile='{FONT_B}':text='Y TE ESCRIBIMOS POR WHATSAPP':fontcolor=0x00E5FF"
        f":fontsize=34:x=(w-tw)/2:y=1556:alpha='min(1\\,max(0\\,t-1.22)/0.35)'"
        f":borderw=5:bordercolor=black@0.8,"
        f"drawtext=fontfile='{FONT_B}':text='0424-5541927':fontcolor=white"
        f":fontsize=40:x=(w-tw)/2:y=1618:alpha='min(1\\,max(0\\,t-1.40)/0.35)'"
        f":borderw=5:bordercolor=black@0.8,"
        f"format=yuv420p")
    p = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-vf", vf,
         "-frames:v", str(NFR), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-r", str(FPS), f"{SCRATCH}/seg4/99_cta.mp4"],
        stdin=subprocess.PIPE)
    for n in range(NFR):
        t = n / FPS
        fr = bg.copy()
        if t < 0.18:
            p.stdin.write((np.clip(fr, 0, 1) * 255).astype(np.uint8).tobytes()); continue
        pin = min(1.0, (t - 0.18) / 0.55)
        sc = 0.55 + 0.45 * ease_out_back(pin)
        al = min(1.0, (t - 0.18) / 0.22)
        if pin >= 1.0:
            sc *= 1.0 + 0.012 * np.sin((t - 0.73) * 2.0)
        gp = 0.55 * np.exp(-((t - 0.42) ** 2) / 0.045) + 0.16
        gs = int(LOGO_BASE * sc * 2.1)
        if gs > 2:
            g = resize_rgba(glow[:, :, None], gs)[:, :, 0] * gp * al
            gy, gx = LOGO_CY - gs // 2, (W - gs) // 2
            y0, y1 = max(0, gy), min(H, gy + gs); x0, x1 = max(0, gx), min(W, gx + gs)
            if y1 > y0 and x1 > x0:
                fr[y0:y1, x0:x1] += g[y0-gy:y1-gy, x0-gx:x1-gx][:, :, None] * GLOW
        ls = max(2, int(LOGO_BASE * sc))
        lg = resize_rgba(logo, ls)
        ly, lx = LOGO_CY - ls // 2, (W - ls) // 2
        y0, y1 = max(0, ly), min(H, ly + ls); x0, x1 = max(0, lx), min(W, lx + ls)
        if y1 > y0 and x1 > x0:
            sub = lg[y0-ly:y1-ly, x0-lx:x1-lx]
            a = (sub[:, :, 3] * al)[:, :, None]
            fr[y0:y1, x0:x1] = fr[y0:y1, x0:x1] * (1 - a) + sub[:, :, :3] * a
        p.stdin.write((np.clip(fr, 0, 1) * 255).astype(np.uint8).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("ffmpeg falló en la placa de cierre")
    print(f"  cierre listo ({DUR} s)")


if __name__ == "__main__":
    os.makedirs(f"{SCRATCH}/seg4", exist_ok=True)
    build_hook()
    build_cta()
