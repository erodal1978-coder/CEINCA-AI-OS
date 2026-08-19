#!/usr/bin/env python3
"""
CASA & CAMPO — "La bienvenida de Angelo"
Reel del recibimiento sorpresa por su regreso de España. 1080x1920 @30fps.

Rejilla musical: 90 BPM · negra = 0.6667 s (20 frames exactos) · compás = 2.667 s.
Cortes en beat: 0 · 2.000 · 4.667 · 8.000 · 10.667 · 14.000 · 18.000

Un solo fragmento por clip, sin repetir ninguno:
  S01 a138  abrazo            (GANCHO)
  S02 a104  la llegada
  S03 a139  mariachis en vivo
  S04 a100  el abrazo largo
  S05 a150  todos en Casa & Campo
  CTA       logo animado + EVENTO

Captions palabra por palabra: línea pequeña de apoyo arriba y palabra clave
grande abajo, resaltada en color en los golpes emocionales.
"""
import os, subprocess, sys

SCRATCH = "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad"
SRC = "/home/user/CEINCA-AI-OS/Videos/Assets"
SEG = f"{SCRATCH}/seg3"
TRF = f"{SCRATCH}/trf3"
FONT_A = f"{SCRATCH}/fonts/Anton.ttf"
FONT_B = f"{SCRATCH}/fonts/ArchivoBlack.ttf"

for d in (SEG, TRF):
    os.makedirs(d, exist_ok=True)

CLIPS = {
    "a138": f"{SRC}/VID-20260804-WA0138.mp4",   # 12.2s  abrazos
    "a104": f"{SRC}/VID-20260804-WA0104.mp4",   # 90.0s  llegada
    "a139": f"{SRC}/VID-20260804-WA0139.mp4",   # 16.5s  mariachis
    "a100": f"{SRC}/VID-20260804-WA0100.mp4",   # 57.2s  reencuentro
    "a150": f"{SRC}/VID-20260811-WA0150.mp4",   # 5.8s   multitud
}

W, H, FPS = 1080, 1920, 30
BEAT = 60.0 / 90.0                      # 0.66667 s = 20 frames
CYAN, LIME, WHITE, AMBER = "0x00E5FF", "0xC6FF00", "white", "0xFFC93C"


def esc(t):
    return (t.replace("\\", "\\\\").replace(":", "\\:")
             .replace("'", "’").replace("%", "\\%").replace(",", "\\,"))


def caption(small, big, t0, t1, color=WHITE, y_big=1290, size_big=118):
    """Caption cinemático: apoyo pequeño arriba, palabra clave grande abajo.

    Aparece con un pop (sube y entra en alpha) y desaparece antes del corte.
    Los tiempos son locales al plano.
    """
    fade = 0.14
    a = (f"if(lt(t\\,{t0})\\,0\\,"
         f"if(lt(t\\,{t0+fade})\\,(t-{t0})/{fade}\\,"
         f"if(gt(t\\,{t1-fade})\\,max(0\\,({t1}-t)/{fade})\\,1)))")
    pop = f"-18*(1-min(1\\,max(0\\,(t-{t0}))/0.18))"
    out = []
    if small:
        out.append(
            f"drawtext=fontfile='{FONT_B}':text='{esc(small)}':fontcolor=white@0.95"
            f":fontsize=40:x=(w-tw)/2:y='{y_big-92}{pop}':alpha='{a}'"
            f":borderw=5:bordercolor=black@0.85")
    out.append(
        f"drawtext=fontfile='{FONT_A}':text='{esc(big)}':fontcolor={color}"
        f":fontsize={size_big}:x=(w-tw)/2:y='{y_big}{pop}':alpha='{a}'"
        f":borderw=10:bordercolor=black@0.92"
        f":shadowx=0:shadowy=8:shadowcolor=black@0.6")
    return out


def grade():
    """Look cálido de mediodía llanero: sol duro y sombras profundas.
    Se levanta algo la sombra y se calienta la alta luz."""
    return ("eq=contrast=1.13:saturation=1.16:brightness=0.012:gamma=1.03,"
            "colorbalance=rs=0.03:gs=0.01:bs=-0.04:rh=0.05:bh=-0.03")


def S(sid, clip, ss, d, caps=(), zoom="soft", zfix=None, anchor=0.5):
    return dict(id=sid, clip=clip, ss=ss, d=d, caps=list(caps), zoom=zoom,
                zfix=zfix, anchor=anchor)


B = BEAT
SHOTS = [
    # ---- GANCHO 0.000 – 2.000 (3 negras)
    # El abrazo de a100 es la imagen más legible y emotiva del lote: va primero.
    S("01", "a100", 46.50, 3 * B,
      (("", "ANGELO", 0.10, 1.05, WHITE),
       ("", "VOLVIÓ", 1.05, 1.98, LIME))),

    # ---- CUERPO 2.000 – 4.667 (4 negras): la llegada.
    # Encuadre cerrado y anclado arriba: el plano original tiene medio cuadro
    # de tierra porque la cámara va mirando al suelo mientras camina.
    S("02", "a104", 85.60, 4 * B,
      (("REGRESÓ DE", "ESPAÑA", 0.05, 1.33, WHITE),
       ("", "NO SABÍA NADA", 1.33, 2.62, WHITE)),
      zfix=1.32, anchor=0.40),

    # ---- 4.667 – 8.000 (5 negras): los mariachis
    S("03", "a139", 8.60, 5 * B,
      (("LO RECIBIERON CON", "MARIACHI", 0.05, 1.66, AMBER),
       ("", "EN VIVO", 1.66, 3.28, WHITE))),

    # ---- 8.000 – 10.667 (4 negras): el abrazo, con los mariachis detrás
    S("04", "a138", 8.40, 4 * B,
      (("Y SU FAMILIA", "COMPLETA", 0.05, 1.33, LIME),
       ("", "LO ABRAZÓ", 1.33, 2.62, WHITE))),

    # ---- 10.667 – 14.000 (5 negras): todos en Casa & Campo
    S("05", "a150", 0.60, 5 * B,
      (("TODO PASÓ EN", "CASA & CAMPO", 0.05, 3.28, CYAN),)),
]


def stabilize_pass1(s, L):
    trf = f"{TRF}/{s['id']}.trf"
    cmd = ["ffmpeg", "-y", "-v", "error",
           "-ss", str(s["ss"]), "-t", f"{L:.3f}", "-i", CLIPS[s["clip"]],
           "-vf", f"vidstabdetect=shakiness=9:accuracy=15:result={trf}",
           "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO vidstabdetect] {s['id']}\n{r.stderr[-1500:]}", file=sys.stderr)
        sys.exit(1)
    return trf


def build_segment(s):
    L = s["d"]
    nfr = int(round(L * FPS))
    out = f"{SEG}/{s['id']}.mp4"
    trf = stabilize_pass1(s, L)

    chain = [
        f"vidstabtransform=input={trf}:smoothing=15:optzoom=1:zoom=1:interpol=bicubic",
        "scale=1620:2880:force_original_aspect_ratio=increase:flags=lanczos",
        "crop=1620:2880",
        f"fps={FPS}",
    ]
    # El material ya tiene movimiento propio: sólo un empuje mínimo.
    z = s["zfix"] or (f"1.01+0.025*on/{nfr}" if s["zoom"] == "soft" else "1")
    a = s["anchor"]
    yexpr = ("ih/2-(ih/zoom/2)" if a == 0.5 else
             f"max(0\\,min(ih-ih/zoom\\,ih*{a}-(ih/zoom/2)))")
    chain.append(f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='{yexpr}'"
                 f":s={W}x{H}:fps={FPS}")
    chain.append(grade())
    chain.append("unsharp=5:5:0.9:5:5:0.0")
    chain.append("vignette=PI/4.8")
    chain.append("noise=alls=3:allf=t+u")

    for small, big, t0, t1, col in s["caps"]:
        size = 118 if len(big) <= 10 else (96 if len(big) <= 13 else 84)
        chain += caption(small, big, t0, t1, col, size_big=size)
    chain.append("format=yuv420p")

    cmd = ["ffmpeg", "-y", "-v", "error",
           "-ss", str(s["ss"]), "-t", f"{L:.3f}", "-i", CLIPS[s["clip"]],
           "-vf", ",".join(chain), "-frames:v", str(nfr), "-an",
           "-c:v", "libx264", "-preset", "medium", "-crf", "18",
           "-pix_fmt", "yuv420p", "-r", str(FPS), out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO] {s['id']}\n{r.stderr[-2500:]}", file=sys.stderr)
        sys.exit(1)
    print(f"  ok {s['id']}  {s['clip']}  ss={s['ss']:<6} {L:.3f}s  {nfr}f")
    return out


if __name__ == "__main__":
    print("Renderizando planos (estabilizando)...")
    files = [build_segment(s) for s in SHOTS]
    with open(f"{SEG}/list.txt", "w") as fh:
        for f in files:
            fh.write(f"file '{f}'\n")
    total = sum(s["d"] for s in SHOTS)
    cuts, acc = [], 0.0
    for s in SHOTS:
        acc += s["d"]
        cuts.append(round(acc, 3))
    print(f"\n  cortes en: {cuts}")
    print(f"  cuerpo: {total:.3f}s  ({total/BEAT:.0f} negras)")
