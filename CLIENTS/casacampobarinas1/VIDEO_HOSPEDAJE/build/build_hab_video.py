#!/usr/bin/env python3
"""
CASA & CAMPO — "Hospedaje disponible"
Recorrido por el hospedaje. 1080x1920 @30fps.

Rejilla musical: 100 BPM · negra = 0.6 s (18 frames) · compás = 2.4 s.
Cortes: 0 · 2.4 · 4.8 · 6.6 · 8.4 · 10.2 · 12.0 · 13.8 · 16.2 · 18.6

Mezcla metraje de vídeo (grabado a pulso, se estabiliza con vidstab en dos
pasadas) y dos fotos fijas de la piscina, que son el único material de alta
resolución y sostienen el gancho y el cierre.

Las transiciones son xfade reales. Para que el centro de cada fundido caiga
exactamente en el tiempo musical, cada plano se renderiza con media transición
extra en cada extremo: L_i = d_i + X_{i-1}/2 + X_i/2. La suma vuelve a dar
exactamente sum(d) = 18.6 s.
"""
import os, subprocess, sys

SCRATCH = "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad"
SRC = "/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11"
SEG = f"{SCRATCH}/seg2"
TRF = f"{SCRATCH}/trf"
FONT_A = f"{SCRATCH}/fonts/Anton.ttf"
FONT_B = f"{SCRATCH}/fonts/ArchivoBlack.ttf"

for d in (SEG, TRF):
    os.makedirs(d, exist_ok=True)

MEDIA = {
    # fotos
    "pool": f"{SRC}/d2e220ac-IMG_20250803_180338_2.jpg",    # 1840x4080 piscina de día
    # vídeo — cabaña A-frame (piso de madera, techo inclinado)
    "af1":  f"{SRC}/70d100e7-VID20260811WA0158.mp4",        # 18.6s cama, sala, aire
    "af2":  f"{SRC}/3be26f4f-VID20260811WA0161.mp4",        # 12.2s mesa, ventana, bata
    # vídeo — habitación estándar (pared de mármol)
    "std1": f"{SRC}/33a4d25b-VID20260811WA0168.mp4",        # 17.9s TV + bata
    "std2": f"{SRC}/e951a5ab-VID20260811WA0167.mp4",        # 14.6s cama + toalla bordada
    # vídeo — cocina
    "coc":  f"{SRC}/030bc27e-VID20260811WA0162.mp4",        # 8.0s
    # fotos con Daniela Deximar León (Reina del Turismo de Barinas)
    "mod1": f"{SRC}/aad92147-679444.jpg",                   # 960x1280 bata + café, piscinas
    "mod2": f"{SRC}/7dd17dab-679445.jpg",                   # 960x1280 balcón sobre la piscina
}

W, H, FPS = 1080, 1920, 30
CYAN, MAGENTA, LIME, WHITE = "0x00E5FF", "0xFF2D95", "0xC6FF00", "white"


def esc(t):
    return (t.replace("\\", "\\\\").replace(":", "\\:")
             .replace("'", "’").replace("%", "\\%").replace(",", "\\,"))


def title(text, y, size=118, color=WHITE, font=FONT_A, delay=0.0,
          box=None, boxpad=26, dur=2.0, slide=30, border=None):
    if border is None:
        border = 0 if box else 9
    t = f"(t-{delay})"
    alpha = (f"if(lt(t\\,{delay})\\,0\\,"
             f"if(lt({t}\\,0.20)\\,{t}/0.20\\,"
             f"if(gt(t\\,{dur-0.28:.2f})\\,max(0\\,({dur:.2f}-t)/0.28)\\,1)))")
    ypos = f"{y}-{slide}*(1-min(1\\,max(0\\,{t})/0.30))"
    f = (f"drawtext=fontfile='{font}':text='{esc(text)}':fontcolor={color}"
         f":fontsize={size}:x=(w-tw)/2:y='{ypos}':alpha='{alpha}'")
    if border:
        f += f":borderw={border}:bordercolor=black@0.9"
    if box:
        f += f":box=1:boxcolor={box}@0.94:boxborderw={boxpad}"
    else:
        f += ":shadowx=0:shadowy=7:shadowcolor=black@0.55"
    return f


def kicker(text, y, size=42, color="black", box=LIME, delay=0.0, dur=2.0):
    t = f"(t-{delay})"
    alpha = (f"if(lt(t\\,{delay})\\,0\\,"
             f"if(lt({t}\\,0.18)\\,{t}/0.18\\,"
             f"if(gt(t\\,{dur-0.26:.2f})\\,max(0\\,({dur:.2f}-t)/0.26)\\,1)))")
    return (f"drawtext=fontfile='{FONT_B}':text='{esc(text)}':fontcolor={color}"
            f":fontsize={size}:x=(w-tw)/2:y={y}:alpha='{alpha}'"
            f":box=1:boxcolor={box}@0.95:boxborderw=22")


def credit(text, y, size=26, delay=0.0, dur=2.0):
    """Crédito de talento: discreto, no compite con el titular."""
    t = f"(t-{delay})"
    alpha = (f"if(lt(t\\,{delay})\\,0\\,"
             f"if(lt({t}\\,0.25)\\,{t}/0.25\\,"
             f"if(gt(t\\,{dur-0.26:.2f})\\,max(0\\,({dur:.2f}-t)/0.26)\\,1)))")
    return (f"drawtext=fontfile='{FONT_B}':text='{esc(text)}':fontcolor=white"
            f":fontsize={size}:x=(w-tw)/2:y={y}:alpha='{alpha}'"
            f":borderw=4:bordercolor=black@0.85"
            f":shadowx=0:shadowy=4:shadowcolor=black@0.6")


def grade(kind):
    """Look cálido y luminoso, distinto al neón del promo de fiesta."""
    if kind == "int":
        # Interiores con luz de bombillo: se levanta contraste y se corrige
        # la dominante amarilla con algo de azul.
        return ("eq=contrast=1.24:saturation=1.14:brightness=-0.022:gamma=0.99,"
                "colorbalance=rm=-0.05:bm=0.07:rh=-0.03:bh=0.04")
    return ("eq=contrast=1.10:saturation=1.24:brightness=0.015,"
            "colorbalance=rs=0.03:bs=-0.02:rh=0.04:bh=-0.02")


def warm_flash(dur=0.20):
    return (f"eq=brightness='if(lt(t\\,{dur})\\,0.40*(1-t/{dur})\\,0)'"
            f":saturation='if(lt(t\\,{dur})\\,1+0.45*(1-t/{dur})\\,1)':eval=frame")


def S(sid, kind, media, ss, d, zoom, g, crop=None, texts=(), fx=(), slow=None,
      anchor=0.5, zfix=None):
    return dict(id=sid, kind=kind, media=media, ss=ss, d=d, zoom=zoom, g=g,
                crop=crop, texts=list(texts), fx=list(fx), slow=slow,
                anchor=anchor, zfix=zfix)


SHOTS = [
    # 0.0 – 2.4 · gancho sobre la única foto de alta resolución
    S("01", "img", "pool", 0, 2.4, "in", "pool", (1540, 2738, 150, 1342),
      (lambda d: title("YA NO TE", 1280, 118, WHITE, dur=d),
       lambda d: title("TIENES QUE IR", 1420, 118, WHITE, delay=0.15, dur=d))),

    # 2.4 – 4.8 · el anuncio, sobre la cabaña (el interior más atractivo)
    S("02", "vid", "af1", 0.2, 2.4, "none", "int", None,
      (lambda d: title("HOSPEDAJE", 1150, 112, "black", box=CYAN, dur=d),
       lambda d: title("DISPONIBLE", 1300, 112, WHITE, delay=0.15, dur=d)),
      ("flash",)),

    # 4.8 – 6.6 · el balcón: al salir lo primero que se ve son las piscinas
    S("03", "img", "mod2", 0, 1.8, "in", "pool", (720, 1280, 140, 0),
      (lambda d: kicker("VISTA A LA PISCINA", 1480, 42, dur=d),)),

    # 6.6 – 8.4 · equipamiento verificable en el material
    S("04", "vid", "af1", 11.0, 1.8, "none", "int", None,
      (lambda d: kicker("AIRE ACONDICIONADO · SMART TV · WIFI", 1480, 36, dur=d),)),

    # 8.4 – 10.2 · batas con logo
    S("05", "vid", "std1", 13.4, 1.8, "none", "int", None,
      (lambda d: kicker("BATAS Y TOALLAS DE LA CASA", 1480, 42, "black", CYAN, dur=d),)),

    # 10.2 – 12.0 · toalla bordada sobre la cama: remate de marca, sin texto
    S("06", "vid", "std2", 9.0, 1.8, "none", "int", None, ()),

    # 12.0 – 13.8 · cocina
    S("07", "vid", "coc", 0.3, 1.8, "none", "int", None,
      (lambda d: kicker("COCINA EQUIPADA", 1480, 42, dur=d),)),

    # 13.8 – 16.2 · remate emocional en la cabaña
    S("08", "vid", "af2", 9.4, 2.4, "none", "int", None,
      (lambda d: title("TE ACUESTAS AQUÍ", 1180, 96, WHITE, dur=d),)),

    # 16.2 – 18.6 · el pago: amaneces frente a la piscina
    S("09", "img", "mod1", 0, 2.4, "out", "pool", (720, 1280, 30, 0),
      (lambda d: title("Y AMANECES", 1150, 118, WHITE, dur=d),
       lambda d: title("AQUÍ", 1290, 118, "black", box=LIME, delay=0.15, dur=d),
       lambda d: credit("CON DANIELA DEXIMAR LEÓN", 1512, 30, delay=0.6, dur=d),
       lambda d: credit("REINA DE LA CULTURA Y EL TURISMO 2025", 1556, 25,
                        delay=0.72, dur=d)),
      ("flash",)),
]

# Duración en frames pares para que la mitad siga siendo un entero de frames.
TRANS = [
    (0.4, "fade"),
    (0.2, "smoothleft"),
    (0.2, "wipeup"),
    (0.2, "smoothright"),
    (0.2, "smoothleft"),
    (0.2, "wipedown"),
    (0.4, "fade"),
    (0.4, "fade"),
]


def seg_len(i):
    L = SHOTS[i]["d"]
    if i > 0:
        L += TRANS[i - 1][0] / 2
    if i < len(TRANS):
        L += TRANS[i][0] / 2
    return round(L, 3)


def stabilize_pass1(s, L):
    """vidstabdetect: extrae las transformaciones del tramo usado."""
    trf = f"{TRF}/{s['id']}.trf"
    src_len = s["slow"] if s["slow"] else L
    cmd = ["ffmpeg", "-y", "-v", "error",
           "-ss", str(s["ss"]), "-t", f"{src_len:.3f}", "-i", MEDIA[s["media"]],
           "-vf", f"vidstabdetect=shakiness=8:accuracy=15:result={trf}",
           "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO vidstabdetect] {s['id']}\n{r.stderr[-1500:]}", file=sys.stderr)
        sys.exit(1)
    return trf


def build_segment(i):
    s = SHOTS[i]
    L = seg_len(i)
    nfr = int(round(L * FPS))
    out = f"{SEG}/{s['id']}.mp4"
    chain = []

    if s["kind"] == "vid":
        trf = stabilize_pass1(s, L)
        # optzoom recorta lo justo para que no aparezcan bordes negros.
        chain.append(f"vidstabtransform=input={trf}:smoothing=28:optzoom=1:"
                     f"zoom=1:interpol=bicubic")
        if s["slow"]:
            chain.append(f"setpts={L/s['slow']:.5f}*PTS")
        chain.append("scale=1620:2880:force_original_aspect_ratio=increase:flags=lanczos")
        chain.append("crop=1620:2880")
        src_len = s["slow"] if s["slow"] else L
        inp = ["-ss", str(s["ss"]), "-t", f"{src_len:.3f}", "-i", MEDIA[s["media"]]]
    else:
        cw, ch, cx, cy = s["crop"]
        chain.append(f"crop={cw}:{ch}:{cx}:{cy}")
        chain.append("scale=1620:2880:flags=lanczos")
        inp = ["-loop", "1", "-framerate", str(FPS), "-t", f"{L:.3f}",
               "-i", MEDIA[s["media"]]]

    chain.append(f"fps={FPS}")

    z = s["zoom"]
    if s["zfix"]:
        zexpr = f"{s['zfix']}"
    elif z == "in":
        zexpr = f"1+0.09*on/{nfr}"
    elif z == "out":
        zexpr = f"1.10-0.09*on/{nfr}"
    else:
        # El metraje ya tiene movimiento de cámara propio; un zoom encima
        # marearía. Sólo un empuje mínimo para que no se sienta congelado.
        zexpr = f"1.01+0.02*on/{nfr}"
    a = s["anchor"]
    yexpr = (f"ih/2-(ih/zoom/2)" if a == 0.5 else
             f"max(0\,min(ih-ih/zoom\,ih*{a}-(ih/zoom/2)))")
    chain.append(
        f"zoompan=z='{zexpr}':d=1:x='iw/2-(iw/zoom/2)':y='{yexpr}'"
        f":s={W}x{H}:fps={FPS}"
    )

    chain.append(grade(s["g"]))
    chain.append("unsharp=5:5:1.0:5:5:0.0")
    chain.append("vignette=PI/5.0")
    chain.append("noise=alls=3:allf=t+u")

    if "flash" in s["fx"]:
        chain.append(warm_flash())
    for tf in s["texts"]:
        chain.append(tf(L))
    chain.append("format=yuv420p")

    cmd = (["ffmpeg", "-y", "-v", "error"] + inp +
           ["-vf", ",".join(chain), "-frames:v", str(nfr), "-an",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(FPS), out])
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO] {s['id']}\n{r.stderr[-2500:]}", file=sys.stderr)
        sys.exit(1)
    print(f"  ok {s['id']}  {s['kind']} {s['media']:<5} ss={s['ss']:<5} "
          f"d={s['d']:.1f}s  L={L:.2f}s  {nfr}f")
    return out


def assemble(files):
    inputs = []
    for f in files:
        inputs += ["-i", f]
    parts, centers = [], []
    running = seg_len(0)
    prev = "0:v"
    for k, (xdur, xtype) in enumerate(TRANS):
        off = round(running - xdur, 3)
        centers.append(round(off + xdur / 2, 2))
        lbl = f"x{k}"
        parts.append(f"[{prev}][{k+1}:v]xfade=transition={xtype}"
                     f":duration={xdur}:offset={off}[{lbl}]")
        prev = lbl
        running = round(running + seg_len(k + 1) - xdur, 3)
    filt = ";".join(parts) + f";[{prev}]format=yuv420p[v]"
    cmd = (["ffmpeg", "-y", "-v", "error"] + inputs +
           ["-filter_complex", filt, "-map", "[v]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(FPS), f"{SCRATCH}/hab_body.mp4"])
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO ensamblaje]\n{r.stderr[-3000:]}", file=sys.stderr)
        sys.exit(1)
    print(f"\n  transiciones en: {centers}")
    print(f"  cuerpo: {running:.2f}s")


if __name__ == "__main__":
    print("Renderizando planos (estabilizando el metraje a pulso)...")
    files = [build_segment(i) for i in range(len(SHOTS))]
    assemble(files)
