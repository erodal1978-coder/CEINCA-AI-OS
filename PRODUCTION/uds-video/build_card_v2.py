#!/usr/bin/env python3
"""v2 - Tarjeta de cierre (unica aparicion de texto y logo en el video).

Fondo solido #0A0A0A, logo al 30% del ancho con aire alrededor y debajo
"Felices vacaciones." en Montserrat blanco puro. El fade-in de 0.6s del
conjunto lo aplica ffmpeg sobre el clip completo: como el fondo es #0A0A0A,
fundir desde negro es indistinguible de fundir solo el logo y el texto.
"""

import sys

from PIL import Image, ImageDraw, ImageFont

FONT_DIR, OUT, LOGO = sys.argv[1], sys.argv[2], sys.argv[3]

W, H = 1080, 1920
DARK = (10, 10, 10)
WHITE = (255, 255, 255)

logo = Image.open(LOGO).convert("RGBA")
logo_w = int(W * 0.30)                       # 30% del ancho
logo_h = round(logo_w * logo.height / logo.width)
logo_r = logo.resize((logo_w, logo_h), Image.LANCZOS)

card = Image.new("RGB", (W, H), DARK)
d = ImageDraw.Draw(card)

fnt = ImageFont.truetype(f"{FONT_DIR}/Montserrat-700.ttf", 66)
text = "Felices vacaciones."
gap, text_h = 104, 74

block_h = logo_h + gap + text_h
top = (H - block_h) // 2

card.paste(logo_r, ((W - logo_w) // 2, top), logo_r)

y = top + logo_h + gap
tw = d.textlength(text, font=fnt)
d.text(((W - tw) / 2, y), text, font=fnt, fill=WHITE)

card.save(OUT)
print(f"{OUT}: logo {logo_w}x{logo_h} (30% de {W}), bloque {block_h}px desde y={top}")
