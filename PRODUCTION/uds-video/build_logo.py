#!/usr/bin/env python3
"""Paso 1 - Tratamiento del logo UDS.

Toma la salida de `ffmpeg colorkey` sobre channels4_profile.jpg y:
  1. Restringe la transparencia al blanco conectado al borde (flood fill), de modo
     que los blancos interiores del logo -- la figura del atleta y las estrellas --
     no se perforen.
  2. Recorta al bounding box real del contenido, sin sobrante transparente.
  3. Escribe logo_final.png (logo completo) y logo_final_reverse.png, variante con
     el wordmark negro invertido a blanco para que lea sobre fondo #0A0A0A.
"""

import sys

import numpy as np
from PIL import Image
from scipy import ndimage

raw_path, out_final, out_reverse, out_emblem = sys.argv[1:5]

# Altura relativa a la que termina el escudo y empieza el wordmark del logo.
WORDMARK_TOP = 0.79

img = np.array(Image.open(raw_path).convert("RGBA"))
h, w = img.shape[:2]

# --- 1. transparencia solo en el blanco conectado al borde -------------------
keyed = img[:, :, 3] < 128
labels, n = ndimage.label(keyed)
border = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
border.discard(0)
outside = np.isin(labels, list(border))

alpha = np.where(outside, 0, 255).astype(np.uint8)

# Anti-aliasing del contorno: en el borde exterior conservamos la alfa suave que
# produjo colorkey (blend), en lugar de un recorte duro de 1 bit.
soft = img[:, :, 3]
edge = ndimage.binary_dilation(outside, iterations=1) & ~outside
alpha[edge] = np.minimum(alpha[edge], np.maximum(soft[edge], 200))

out = img.copy()
out[:, :, 3] = alpha
# Los pixeles totalmente transparentes se blanquean para evitar halos al escalar.
out[alpha == 0, 0:3] = 255

# --- 2. crop al bounding box real -------------------------------------------
ys, xs = np.nonzero(alpha > 8)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
cropped = out[y0:y1, x0:x1]
Image.fromarray(cropped).save(out_final)
print(f"logo_final.png  {cropped.shape[1]}x{cropped.shape[0]}  (bbox {x0},{y0} -> {x1},{y1} de {w}x{h})")

# --- 3. variante reverse para fondo oscuro -----------------------------------
# El wordmark "UNIVERSIDAD DEPORTIVA DEL SUR" es negro puro y desaparece sobre
# #0A0A0A. La franja inferior del logo (por debajo del escudo) contiene solo las
# letras: tras el keyeado su fondo blanco quedo transparente, asi que todo pixel
# opaco ahi es trazo de texto y se pinta blanco puro -- incluido el antialiasing,
# que de otro modo dejaria un halo oscuro alrededor de cada letra.
rev = cropped.copy()
ch, cw = rev.shape[:2]
band = slice(int(ch * WORDMARK_TOP), ch)
sub = rev[band]
strokes = sub[:, :, 3] > 8
sub[strokes, 0:3] = 255
rev[band] = sub
Image.fromarray(rev).save(out_reverse)
print(f"logo_final_reverse.png  {cw}x{ch}  ({int(strokes.sum())} px del wordmark invertidos a blanco)")

# --- 4. emblema (antorcha + escudo) para las tarjetas ------------------------
# En las tarjetas el nombre de la universidad ya va compuesto en Montserrat
# blanco; repetir el wordmark del JPEG -- rasterizado y con artefactos a 378 px
# de ancho -- duplicaria el texto y bajaria la calidad. Se usa solo el emblema.
emblem = cropped[: int(ch * WORDMARK_TOP)]
ys, xs = np.nonzero(emblem[:, :, 3] > 8)
emblem = emblem[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
Image.fromarray(emblem).save(out_emblem)
print(f"logo_emblem.png  {emblem.shape[1]}x{emblem.shape[0]}")
