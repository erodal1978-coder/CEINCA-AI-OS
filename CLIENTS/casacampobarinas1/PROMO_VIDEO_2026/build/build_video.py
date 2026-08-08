#!/usr/bin/env python3
"""
CASA CAMPO — Promo Reel builder
Fuente: 5 clips de la Promoción de Bachilleres U.E. Roberto Moreno 2026 (Barinas)
Salida: 1080x1920 @30fps
"""
import os, subprocess, sys, shlex

SCRATCH = "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad"
SRC = "/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11"
SEG = f"{SCRATCH}/seg"
FONT_A = f"{SCRATCH}/fonts/Anton.ttf"          # titulares disruptivos
FONT_B = f"{SCRATCH}/fonts/ArchivoBlack.ttf"   # etiquetas / kicker
FONT_M = f"{SCRATCH}/fonts/Montserrat.ttf"     # texto de apoyo

os.makedirs(SEG, exist_ok=True)

CLIPS = {
    "bc":    f"{SRC}/bc42ce7d-VID20260801WA00111.mp4",  # piscina wide, mejor calidad
    "ed":    f"{SRC}/edcc1439-VID20260801WA00131.mp4",  # deck + luces de color + humo
    "dj":    f"{SRC}/a15ae414-VID20260803WA00001.mp4",  # DJ + multitud
    "crowd": f"{SRC}/6842411f-VID20260801WA00121.mp4",  # multitud bailando
    "pool":  f"{SRC}/4fd3aea0-VID20260801WA00061.mp4",  # fiesta en piscina cenital
}

W, H, FPS = 1080, 1920, 30

# Paleta neón
CYAN    = "0x00E5FF"
MAGENTA = "0xFF2D95"
LIME    = "0xC6FF00"
WHITE   = "white"

# ---------------------------------------------------------------- helpers

def esc(t):
    """Escapa texto para drawtext."""
    return (t.replace("\\", "\\\\").replace(":", "\\:")
             .replace("'", "’").replace("%", "\\%")
             .replace(",", "\\,"))


def title(text, y, size=120, color=WHITE, font=FONT_A, delay=0.0,
          box=None, boxpad=26, dur=2.0, slide=34, border=None):
    """Titular con pop-in (fade + slide) y fade-out al final del plano.

    Sobre caja de color el texto va sin contorno: un borde negro sobre
    tipografía negra rellena las contraformas y la vuelve ilegible.
    """
    if border is None:
        border = 0 if box else 9
    t = f"(t-{delay})"
    alpha = (f"if(lt(t\\,{delay})\\,0\\,"
             f"if(lt({t}\\,0.16)\\,{t}/0.16\\,"
             f"if(gt(t\\,{dur-0.22:.2f})\\,max(0\\,({dur:.2f}-t)/0.22)\\,1)))")
    ypos = f"{y}-{slide}*(1-min(1\\,max(0\\,{t})/0.24))"
    f = (f"drawtext=fontfile='{font}':text='{esc(text)}':fontcolor={color}"
         f":fontsize={size}:x=(w-tw)/2:y='{ypos}':alpha='{alpha}'")
    if border:
        f += f":borderw={border}:bordercolor=black@0.92"
    if box:
        f += f":box=1:boxcolor={box}@0.94:boxborderw={boxpad}"
    else:
        f += ":shadowx=0:shadowy=8:shadowcolor=black@0.6"
    return f


def punchline(text, y, size=170, dur=1.0):
    """Titular del drop: contorno grueso para sostenerse sobre fondos neón."""
    alpha = f"if(lt(t\\,0.10)\\,t/0.10\\,if(gt(t\\,{dur-0.14:.2f})\\,max(0\\,({dur:.2f}-t)/0.14)\\,1))"
    scale = f"{size}"  # tamaño fijo: el impacto lo da el corte, no la animación
    return (f"drawtext=fontfile='{FONT_A}':text='{esc(text)}':fontcolor=white"
            f":fontsize={scale}:x=(w-tw)/2:y={y}:alpha='{alpha}'"
            f":borderw=13:bordercolor=black@0.95"
            f":shadowx=0:shadowy=10:shadowcolor=black@0.7")


def kicker(text, y, size=44, color=WHITE, box=MAGENTA, delay=0.0, dur=2.0):
    """Etiqueta pequeña tipo chip."""
    t = f"(t-{delay})"
    alpha = (f"if(lt(t\\,{delay})\\,0\\,"
             f"if(lt({t}\\,0.14)\\,{t}/0.14\\,"
             f"if(gt(t\\,{dur-0.2:.2f})\\,max(0\\,({dur:.2f}-t)/0.2)\\,1)))")
    return (f"drawtext=fontfile='{FONT_B}':text='{esc(text)}':fontcolor={color}"
            f":fontsize={size}:x=(w-tw)/2:y={y}:alpha='{alpha}'"
            f":box=1:boxcolor={box}@0.95:boxborderw=22")


def grade(strength="normal"):
    """Grade nocturno de fiesta: contraste, saturación neón, balance frío."""
    if strength == "hot":       # planos de drop, más agresivo
        return ("eq=contrast=1.22:saturation=1.55:brightness=0.03:gamma=0.97,"
                "colorbalance=rs=-0.05:bs=0.09:gm=-0.03:bh=0.07:rh=0.05")
    if strength == "soft":      # cierre / CTA
        return ("eq=contrast=1.10:saturation=1.28:brightness=0.01,"
                "colorbalance=bs=0.05:bh=0.04")
    return ("eq=contrast=1.15:saturation=1.42:brightness=0.02,"
            "colorbalance=rs=-0.04:bs=0.07:gm=-0.02:bh=0.05:rh=0.03")


def flash_in(dur=0.14):
    """Destello blanco decreciente al inicio del plano (corte con flash)."""
    return (f"eq=brightness='if(lt(t\\,{dur})\\,0.9*(1-t/{dur})\\,0)'"
            f":eval=frame")


def rgb_glitch(dur=0.10):
    """Aberración cromática breve al inicio (efecto glitch)."""
    return f"rgbashift=rh=16:bh=-16:enable='lt(t\\,{dur})'"


def shake(amp=9, speed=13):
    """Camera shake sutil vía crop dinámico (x/y se evalúan por frame)."""
    return (f"crop={W}:{H}:'{amp}+{amp}*sin({speed}*t)':'{amp}+{amp}*cos({speed*0.8}*t)'")


# ---------------------------------------------------------------- shot list
# (id, clip, in_point, duration, zoom, grade, extras[], texts[])
# zoom: "in" | "out" | "punch" | None

def S(sid, clip, ss, d, zoom="in", g="normal", fx=(), texts=()):
    return dict(id=sid, clip=clip, ss=ss, d=d, zoom=zoom, g=g, fx=list(fx),
                texts=list(texts))


# Rejilla musical: 120 BPM · negra = 0.5 s (15 frames) · compás = 2.0 s.
# Todas las duraciones son múltiplos de la negra para que cada corte caiga en tiempo.
SHOTS = [
    # ---------- ACTO 1 · HOOK ·  0.0 – 4.0 ----------
    S("01", "bc", 24.0, 2.0, "in", "normal", (),
      (lambda d: title("ESTO NO ES", 620, 132, WHITE, dur=d),
       lambda d: title("UNA FIESTA", 770, 132, WHITE, delay=0.18, dur=d))),

    S("02", "ed", 0.7, 2.0, "out", "normal", ("flash",),
      (lambda d: title("ES", 600, 132, WHITE, dur=d),
       lambda d: title("TU PROMOCIÓN", 750, 118, "black", box=CYAN, delay=0.15, dur=d))),

    # ---------- ACTO 2 · BUILD ·  4.0 – 12.0 ----------
    S("03", "dj", 3.2, 2.0, "in", "normal", ("flash",),
      (lambda d: kicker("DJ EN VIVO TODA LA NOCHE", 1520, 46, "black", LIME, dur=d),)),

    S("04", "bc", 9.4, 2.0, "out", "normal", (),
      (lambda d: title("PISCINA", 640, 126, WHITE, dur=d),
       lambda d: title("SOLO PARA USTEDES", 790, 74, WHITE, delay=0.15, dur=d))),

    S("05", "pool", 11.5, 1.5, "in", "normal", ("flash",),
      (lambda d: kicker("LUCES · HUMO · SONIDO PRO", 1520, 46, "black", CYAN, dur=d),)),

    S("06", "ed", 4.5, 1.5, "in", "normal", (),
      (lambda d: title("HASTA EL AMANECER", 700, 92, WHITE, dur=d),)),

    S("07", "dj", 9.1, 1.0, "in", "hot", ("flash",), ()),

    # ---------- ACTO 3 · DROP · 12.0 – 18.0 (cortes a 1 y 2 negras) ----------
    S("08", "dj", 15.6, 1.0, "punch", "hot", ("flash", "glitch", "shake"),
      (lambda d: punchline("TU NOCHE", 880, 172, d),)),

    S("09", "crowd", 3.2, 0.5, "punch", "hot", ("shake",), ()),
    S("10", "pool", 2.6, 0.5, "punch", "hot", ("flash",), ()),

    S("11", "crowd", 4.8, 1.0, "punch", "hot", ("shake",),
      (lambda d: punchline("TU GENTE", 880, 172, d),)),

    S("12", "bc", 17.0, 0.5, "punch", "hot", ("flash",), ()),
    S("13", "crowd", 11.8, 0.5, "punch", "hot", ("shake",), ()),

    S("14", "pool", 24.5, 1.0, "punch", "hot", ("flash",),
      (lambda d: punchline("TU LEYENDA", 880, 156, d),)),

    S("15", "dj", 16.8, 1.0, "punch", "hot", ("glitch", "shake"), ()),

    # ---------- ACTO 4 · PAYOFF / PRUEBA · 18.0 – 24.0 ----------
    S("16", "bc", 3.4, 3.0, "out", "normal", ("flash",),
      (lambda d: kicker("ASÍ SE DESPIDIÓ LA", 560, 44, "black", MAGENTA, dur=d),
       lambda d: title("PROMOCIÓN 2026", 660, 116, WHITE, delay=0.12, dur=d),
       lambda d: title("U.E. ROBERTO MORENO", 800, 62, WHITE, delay=0.24, dur=d))),

    S("17", "pool", 19.4, 3.0, "in", "normal", (),
      (lambda d: title("BARINAS", 700, 132, WHITE, dur=d),
       lambda d: title("VENEZUELA", 840, 66, CYAN, delay=0.15, dur=d))),

    # ---------- ACTO 5 · CTA · 24.0 – 28.0 ----------
    S("18", "bc", 26.0, 4.0, "out", "soft", ("flash",),
      (lambda d: title("¿TU PROMOCIÓN ES LA", 560, 62, WHITE, dur=d),
       lambda d: title("PRÓXIMA?", 650, 132, "black", box=LIME, delay=0.12, dur=d))),
]


def build_segment(s):
    src = CLIPS[s["clip"]]
    d = s["d"]
    nfr = max(2, int(round(d * FPS)))
    out = f"{SEG}/{s['id']}.mp4"

    # 1) normalizar + sobreescalar (evita jitter del zoompan)
    chain = [
        f"scale=1620:2880:force_original_aspect_ratio=increase:flags=lanczos",
        f"crop=1620:2880",
        f"fps={FPS}",
    ]

    # 2) movimiento de cámara
    z = s["zoom"]
    if z == "in":
        zexpr = f"1+0.11*on/{nfr}"
    elif z == "out":
        zexpr = f"1.12-0.11*on/{nfr}"
    elif z == "punch":
        zexpr = f"1.06+0.09*on/{nfr}"
    else:
        zexpr = "1"

    pad = 40 if "shake" in s["fx"] else 0
    zw, zh = W + pad * 2, H + pad * 2
    chain.append(
        f"zoompan=z='{zexpr}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":s={zw}x{zh}:fps={FPS}"
    )
    if pad:
        chain.append(shake(amp=pad // 2 or 1))

    # 3) look
    chain.append(grade(s["g"]))
    chain.append("unsharp=5:5:0.85:5:5:0.0")
    chain.append("vignette=PI/4.2")
    chain.append("noise=alls=4:allf=t+u")

    # 4) efectos de transición horneados
    if "glitch" in s["fx"]:
        chain.append(rgb_glitch())
    if "flash" in s["fx"]:
        chain.append(flash_in())

    # 5) tipografía
    for tf in s["texts"]:
        chain.append(tf(d))

    chain.append("format=yuv420p")
    vf = ",".join(chain)

    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-ss", str(s["ss"]), "-t", f"{d:.3f}", "-i", src,
        "-vf", vf,
        "-frames:v", str(nfr),
        "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", str(FPS),
        out,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO] {s['id']}\n{r.stderr[-2500:]}", file=sys.stderr)
        sys.exit(1)
    print(f"  ok {s['id']}  {s['clip']:<6} {s['ss']:>6.1f}s  {d:.2f}s  {nfr}f")
    return out


if __name__ == "__main__":
    print("Renderizando planos...")
    files = [build_segment(s) for s in SHOTS]
    with open(f"{SEG}/list.txt", "w") as fh:
        for f in files:
            fh.write(f"file '{f}'\n")
    total = sum(s["d"] for s in SHOTS)
    print(f"\n{len(files)} planos · {total:.2f}s de cuerpo principal")
