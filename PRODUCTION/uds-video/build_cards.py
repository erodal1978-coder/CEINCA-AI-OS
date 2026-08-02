#!/usr/bin/env python3
"""Paso 3 - Tarjetas de apertura/cierre y placas de texto sobre el montaje.

Genera cuatro PNG de 1080x1920 que luego ffmpeg superpone o concatena:
  card_open.png    tarjeta de apertura (fondo solido + logo + titulos)
  card_close.png   tarjeta de cierre (fondo solido + logo, sin texto)
  text_block2.png  RGBA transparente, franja + agradecimiento (tercio inferior)
  text_block3.png  RGBA transparente, franja + "Felices vacaciones."

Tipografia Montserrat (institucional sans-serif), blanco puro sobre franja
oscura al 45% de opacidad. Los fundidos de 0.5s los aplica ffmpeg sobre el alfa.
"""

import sys

from PIL import Image, ImageDraw, ImageFont

FONT_DIR, OUT_DIR, LOGO = sys.argv[1], sys.argv[2], sys.argv[3]

W, H = 1080, 1920
DARK = (10, 10, 10)          # #0A0A0A
WHITE = (255, 255, 255)
BAND_ALPHA = 115             # 45% de 255
SAFE_X = 96                  # margen lateral de seguridad


def font(weight, size):
    return ImageFont.truetype(f"{FONT_DIR}/Montserrat-{weight}.ttf", size)


def track(draw, xy, text, fnt, fill, spacing=0, anchor_center_x=None):
    """Dibuja texto con tracking (letter-spacing) opcional, centrado en x."""
    widths = [draw.textlength(c, font=fnt) for c in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = anchor_center_x - total / 2 if anchor_center_x is not None else xy[0]
    y = xy[1]
    for c, cw in zip(text, widths):
        draw.text((x, y), c, font=fnt, fill=fill)
        x += cw + spacing
    return total


def wrap(draw, text, fnt, max_w):
    lines, cur = [], ""
    for word in text.split():
        probe = f"{cur} {word}".strip()
        if draw.textlength(probe, font=fnt) <= max_w:
            cur = probe
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


# --------------------------------------------------------------------------
# Tarjetas de apertura y cierre
# --------------------------------------------------------------------------
logo = Image.open(LOGO).convert("RGBA")
logo_w = int(W * 0.35)                                    # 35% del ancho
logo_h = round(logo_w * logo.height / logo.width)
logo_r = logo.resize((logo_w, logo_h), Image.LANCZOS)


def make_card(with_text):
    card = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(card)

    if not with_text:
        card.paste(logo_r, ((W - logo_w) // 2, (H - logo_h) // 2), logo_r)
        return card

    f_title = font("700", 54)
    f_sub = font("400", 38)
    gap_logo, gap_title = 96, 30
    title_h, sub_h = 62, 46

    block_h = logo_h + gap_logo + title_h + gap_title + sub_h
    top = (H - block_h) // 2

    card.paste(logo_r, ((W - logo_w) // 2, top), logo_r)
    y = top + logo_h + gap_logo
    track(d, (0, y), "Universidad Deportiva del Sur", f_title, WHITE,
          spacing=1.5, anchor_center_x=W / 2)
    y += title_h + gap_title
    track(d, (0, y), "Cierre de Semestre 2026", f_sub, (222, 222, 222),
          spacing=4.0, anchor_center_x=W / 2)
    return card


make_card(True).save(f"{OUT_DIR}/card_open.png")
make_card(False).save(f"{OUT_DIR}/card_close.png")


# --------------------------------------------------------------------------
# Placas de texto sobre el montaje (tercio inferior)
# --------------------------------------------------------------------------
def make_text_plate(text, size, weight, out, line_gap=18, pad_y=56):
    plate = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(plate)
    fnt = font(weight, size)
    lines = wrap(d, text, fnt, W - 2 * SAFE_X)

    line_h = size + line_gap
    text_h = line_h * len(lines) - line_gap
    band_h = text_h + 2 * pad_y

    # Tercio inferior, dejando aire por debajo para la UI de Reels/Stories.
    band_top = 1470 - band_h // 2
    d.rectangle([0, band_top, W, band_top + band_h], fill=(6, 6, 6, BAND_ALPHA))

    y = band_top + pad_y - size * 0.12
    for ln in lines:
        tw = d.textlength(ln, font=fnt)
        d.text(((W - tw) / 2, y), ln, font=fnt, fill=WHITE + (255,))
        y += line_h

    plate.save(out)
    print(f"{out}: {len(lines)} linea(s), franja {band_h}px en y={band_top}")


make_text_plate(
    "El Rectorado, Vicerrectorado y demás autoridades rectorales agradecen "
    "la labor y el compromiso de nuestros docentes este semestre.",
    46, "600", f"{OUT_DIR}/text_block2.png")

make_text_plate("Felices vacaciones.", 72, "700", f"{OUT_DIR}/text_block3.png")

print(f"logo en tarjeta: {logo_w}x{logo_h} px (35% de {W})")
