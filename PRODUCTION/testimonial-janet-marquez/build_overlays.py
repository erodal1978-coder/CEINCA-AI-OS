#!/usr/bin/env python3
"""Genera los overlays del Reel:
  subs.ass          subtitulos karaoke palabra por palabra, una palabra dorada
                    por bloque, dentro de zonas seguras de Reels/TikTok
  banner_open.png   rotulo de apertura (gold sobre navy), tercio superior
  lower_third.png   identificacion de la Dra. Marquez, tercio inferior

Los tiempos de palabra vienen de words.json (fuente) y se remapean a tiempo de
salida con el EDL, porque el montaje reordena y recorta el testimonio.
"""
import json, sys

from PIL import Image, ImageDraw, ImageFont

FONTS, OUT = sys.argv[1], sys.argv[2]
W, H = 1080, 1920
GOLD = "C8A951"
NAVY = "0B1D3A"

words = json.load(open(f"{OUT}/words.json"))
edl = json.load(open(f"{OUT}/edl.json"))

# --- texto canonico ---------------------------------------------------------
# words.json trae el texto tal cual lo emitio el ASR: la primera ventana de
# Whisper salio en minusculas y el nombre propio garbleado. Se corrige aqui,
# indice a indice, respetando lo que ella realmente dice.
FIX = {
    0: "Desde", 2: "Instituto", 4: "Estudios", 5: "Jurídicos", 7: "Colegio",
    9: "Abogados", 10: "Dr.", 11: "José", 12: "Agustín", 13: "Figueredo",
    43: "Así",
}
for i, w in enumerate(words):
    w["t"] = FIX.get(i, w["w"])

# --- palabra dorada por bloque ----------------------------------------------
KEY = {5, 18, 27, 33, 42, 47, 58, 68, 75, 86, 90, 101}   # indices de words.json

# --- mapa tiempo fuente -> tiempo de salida ---------------------------------
events = []          # (out_start, out_end, idx)
for seg in edl:
    for i in range(seg["w0"], seg["w1"] + 1):
        w = words[i]
        s = seg["out_in"] + (max(w["s"], seg["src_in"]) - seg["src_in"])
        e = seg["out_in"] + (min(w["e"], seg["src_out"]) - seg["src_in"])
        if e > s:
            events.append([round(s, 3), round(e, 3), i, seg["seg"]])

# --- agrupacion en bloques de 3-4 palabras, sin cruzar cortes ---------------
chunks, cur = [], []
for ev in events:
    if cur and (ev[3] != cur[-1][3] or len(cur) >= 4
                or sum(len(words[x[2]]["t"]) for x in cur) + len(words[ev[2]]["t"]) > 30):
        chunks.append(cur); cur = []
    cur.append(ev)
if cur:
    chunks.append(cur)

# --- ASS --------------------------------------------------------------------
# MarginV 360 deja libre la franja inferior que cubre la UI de Reels/TikTok.
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,MontsXBold,68,&H00FFFFFF,&H00101010,&H80000000,0,0,0,0,100,100,0.6,0,1,5,3,2,90,90,360,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

def ts(t):
    cs = int(round(t * 100)); h, cs = divmod(cs, 360000); m, cs = divmod(cs, 6000); s, cs = divmod(cs, 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"

lines = []
for ch in chunks:
    for k, (s, e, idx, _) in enumerate(ch):
        parts = []
        for j, (_, _, jdx, _) in enumerate(ch):
            t = words[jdx]["t"]
            if jdx in KEY:                       # palabra clave: dorada siempre
                col = GOLD
            elif j <= k:                         # ya dicha
                col = "FFFFFF"
            else:                                # por decir: atenuada
                col = "FFFFFF"
            alpha = "00" if j <= k else "70"
            bgr = col[4:6] + col[2:4] + col[0:2]
            # El realce va solo por opacidad y color: escalar la palabra activa
            # reflowearia la linea centrada en cada palabra y produce jitter.
            parts.append(rf"{{\c&H{bgr}&\alpha&H{alpha}&}}{t}{{\r}}")
        lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Sub,,0,0,0,,{' '.join(parts)}")

open(f"{OUT}/subs.ass", "w").write(head + "\n".join(lines) + "\n")
print(f"subs.ass: {len(chunks)} bloques, {len(lines)} eventos, "
      f"{len(KEY)} palabras doradas")

# --- PNG overlays -----------------------------------------------------------
def font(name, size):
    return ImageFont.truetype(f"{FONTS}/{name}.ttf", size)


def centered(d, y, text, f, fill, spacing=0.0):
    widths = [d.textlength(c, font=f) for c in text]
    x = (W - (sum(widths) + spacing * (len(text) - 1))) / 2
    for c, cw in zip(text, widths):
        d.text((x, y), c, font=f, fill=fill)
        x += cw + spacing


# Rotulo de apertura: banda navy en el tercio superior, texto dorado.
# Va arriba para no tapar a la Dra. Marquez durante el hook.
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
navy = tuple(int(NAVY[i:i + 2], 16) for i in (0, 2, 4))
gold = tuple(int(GOLD[i:i + 2], 16) for i in (0, 2, 4))
d.rectangle([0, 392, W, 648], fill=navy + (235,))
d.rectangle([0, 392, W, 398], fill=gold + (255,))
d.rectangle([0, 642, W, 648], fill=gold + (255,))
centered(d, 436, "BOOTCAMP MERCANTIL", font("MontsBlack", 62), gold + (255,), 2.0)
centered(d, 512, "BARINAS", font("MontsBlack", 62), gold + (255,), 10.0)
centered(d, 586, "Agosto 2025", font("MontsSemi", 34), (255, 255, 255, 225), 6.0)
img.save(f"{OUT}/banner_open.png")

# Tercio inferior: nombre y cargo. Barra dorada a la izquierda.
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
BOX_L, BOX_R = 72, W - 72
TEXT_L, PAD_R = 116, 28
d.rectangle([BOX_L, 1128, BOX_R, 1300], fill=navy + (215,))
d.rectangle([BOX_L, 1128, BOX_L + 12, 1300], fill=gold + (255,))
d.text((TEXT_L, 1156), "Dra. Janet Márquez", font=font("MontsXBold", 56), fill=(255, 255, 255, 255))

# El cargo es largo; se ajusta el cuerpo hasta que quepa dentro de la caja
# en vez de desbordarla por el lado derecho.
cargo = "Entonces Presidenta del IEJ — Colegio de Abogados del Estado Barinas"
avail = BOX_R - TEXT_L - PAD_R
size = 25
while size > 16 and d.textlength(cargo, font=font("MontsSemi", size)) > avail:
    size -= 1
d.text((TEXT_L, 1236), cargo, font=font("MontsSemi", size), fill=gold + (255,))
print(f"lower third: cargo a {size}px "
      f"({d.textlength(cargo, font=font('MontsSemi', size)):.0f}/{avail}px)")
img.save(f"{OUT}/lower_third.png")
print("banner_open.png y lower_third.png escritos")
