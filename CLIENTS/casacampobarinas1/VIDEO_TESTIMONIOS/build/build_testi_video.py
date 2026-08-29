#!/usr/bin/env python3
"""
CASA & CAMPO — "Lo que dijo la Promoción 2026"
Reel de testimonios de la U.E. Roberto Moreno 2026. 1080x1920 @30fps.

Aquí manda la VOZ, no el beat: los cortes caen en los silencios reales entre
frases (detectados por energía en banda de voz), no sobre una rejilla musical.
Cortar en rejilla partiría palabras a la mitad.

Los cuatro testimonios se grabaron en plena fiesta y la música del party tapaba
la voz (entre -2.6 y -8.6 dB por debajo). La cadena de rescate de audio, que
vive en build_testi_mix.sh, invierte esa relación hasta +5/+20 dB.

Orden: se abre con el testimonio más corto y se cierra con el más extenso,
para que el ritmo arranque rápido y el peso quede al final.
"""
import os, subprocess, sys

SCRATCH = "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad"
SRC = "/root/.claude/uploads/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11"
SEG = f"{SCRATCH}/seg4"
TRF = f"{SCRATCH}/trf4"
FONT_A = f"{SCRATCH}/fonts/Anton.ttf"
FONT_B = f"{SCRATCH}/fonts/ArchivoBlack.ttf"

for d in (SEG, TRF):
    os.makedirs(d, exist_ok=True)

CLIPS = {
    "t1": f"{SRC}/f7245811-VID20260801WA00071.mp4",   #  7.6s · habla 1.1-2.4
    "t2": f"{SRC}/4c7effd7-VID20260801WA00091.mp4",   # 15.8s · habla 1.0-10.0
    "t3": f"{SRC}/25ba7d3c-VID20260801WA00101.mp4",   # 13.8s · habla 0.6-13.4
    "t4": f"{SRC}/696e3c2d-VID20260801WA01011.mp4",   # 11.1s · habla 0.1-7.8
}

W, H, FPS = 1080, 1920, 30
CYAN, LIME, WHITE, MAGENTA = "0x00E5FF", "0xC6FF00", "white", "0xFF2D95"


def esc(t):
    return (t.replace("\\", "\\\\").replace(":", "\\:")
             .replace("'", "’").replace("%", "\\%").replace(",", "\\,"))


def chip(text, y, size=40, color="black", box=LIME, delay=0.0, dur=2.0, hold=1.6):
    """Etiqueta de contexto. Se retira pronto para no competir con la cara."""
    fin = min(dur, delay + hold)
    a = (f"if(lt(t\\,{delay})\\,0\\,"
         f"if(lt(t\\,{delay+0.18})\\,(t-{delay})/0.18\\,"
         f"if(gt(t\\,{fin-0.25:.2f})\\,max(0\\,({fin:.2f}-t)/0.25)\\,1)))")
    return (f"drawtext=fontfile='{FONT_B}':text='{esc(text)}':fontcolor={color}"
            f":fontsize={size}:x=(w-tw)/2:y={y}:alpha='{a}'"
            f":box=1:boxcolor={box}@0.95:boxborderw=20")


def grade():
    """Piscina de noche con luces de color: se contiene el magenta y se
    levanta algo la cara, que es lo único que importa en un testimonio."""
    return ("eq=contrast=1.12:saturation=1.10:brightness=0.035:gamma=1.05,"
            "colorbalance=rm=-0.03:gm=0.02:bm=-0.02:rh=0.02:bh=0.02")


def S(sid, clip, ss, d, chips=(), zoom=1.44, anchor=0.34):
    return dict(id=sid, clip=clip, ss=ss, d=d, chips=list(chips),
                zoom=zoom, anchor=anchor)


# Puntos de corte tomados de los silencios reales entre frases.
SHOTS = [
    # corto y directo: arranca rápido
    S("01", "t1", 0.95, 1.80,
      (lambda d: chip("PROMOCIÓN 2026", 1520, 40, "black", LIME, 0.15, d),)),

    S("02", "t4", 0.05, 5.75,
      (lambda d: chip("U.E. ROBERTO MORENO", 1520, 38, "black", CYAN, 0.20, d),)),

    S("03", "t2", 0.90, 8.05,
      (lambda d: chip("EN CASA & CAMPO", 1520, 38, "black", LIME, 0.20, d),)),

    # el más extenso cierra el bloque de testimonios
    S("04", "t3", 0.50, 8.95,
      (lambda d: chip("BARINAS", 1520, 38, "black", CYAN, 0.20, d),)),
]


def stabilize_pass1(s):
    trf = f"{TRF}/{s['id']}.trf"
    r = subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", str(s["ss"]), "-t", f"{s['d']:.3f}",
         "-i", CLIPS[s["clip"]],
         "-vf", f"vidstabdetect=shakiness=8:accuracy=15:result={trf}",
         "-f", "null", "-"], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO vidstabdetect] {s['id']}\n{r.stderr[-1200:]}", file=sys.stderr)
        sys.exit(1)
    return trf


def build_segment(s):
    nfr = int(round(s["d"] * FPS))
    out = f"{SEG}/{s['id']}.mp4"
    trf = stabilize_pass1(s)

    chain = [
        f"vidstabtransform=input={trf}:smoothing=14:optzoom=1:zoom=1:interpol=bicubic",
        "scale=1620:2880:force_original_aspect_ratio=increase:flags=lanczos",
        "crop=1620:2880",
        f"fps={FPS}",
    ]
    a = s["anchor"]
    yexpr = ("ih/2-(ih/zoom/2)" if a == 0.5 else
             f"max(0\\,min(ih-ih/zoom\\,ih*{a}-(ih/zoom/2)))")
    chain.append(f"zoompan=z='{s['zoom']}':d=1:x='iw/2-(iw/zoom/2)':y='{yexpr}'"
                 f":s={W}x{H}:fps={FPS}")
    chain.append(grade())
    chain.append("unsharp=5:5:0.85:5:5:0.0")
    chain.append("vignette=PI/5.0")
    chain.append("noise=alls=3:allf=t+u")
    for cf in s["chips"]:
        chain.append(cf(s["d"]))
    chain.append("format=yuv420p")

    r = subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-ss", str(s["ss"]), "-t", f"{s['d']:.3f}",
         "-i", CLIPS[s["clip"]], "-vf", ",".join(chain),
         "-frames:v", str(nfr), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-r", str(FPS), out], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[FALLO] {s['id']}\n{r.stderr[-2500:]}", file=sys.stderr)
        sys.exit(1)
    print(f"  ok {s['id']}  {s['clip']}  ss={s['ss']:<5} {s['d']:.2f}s  {nfr}f")
    return out


if __name__ == "__main__":
    print("Renderizando testimonios...")
    files = [build_segment(s) for s in SHOTS]
    with open(f"{SEG}/list.txt", "w") as fh:
        for f in files:
            fh.write(f"file '{f}'\n")
    tot = sum(s["d"] for s in SHOTS)
    acc, cortes = 0.0, []
    for s in SHOTS:
        acc += s["d"]; cortes.append(round(acc, 2))
    print(f"\n  cortes en: {cortes}")
    print(f"  bloque de testimonios: {tot:.2f}s")
