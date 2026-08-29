#!/usr/bin/env python3
"""
CASA & CAMPO — subtítulos del Reel de testimonios (ASS + ffmpeg).

En este entorno NO hay transcripción automática: la política de red bloquea la
descarga de modelos (Whisper, Vosk). Lo que sí se puede hacer, y es la mitad
del trabajo, es sacar los tiempos: dónde empieza y termina cada frase se mide
sobre el audio de voz ya rescatado.

    python3 build_testi_subs.py detectar   -> escribe subs/guion.txt con los
                                              tramos de habla y timecodes reales
    (escribir el texto de cada tramo en subs/guion.txt)
    python3 build_testi_subs.py ass        -> escribe subs/testi.ass
    bash build_testi_quemar.sh             -> quema los subtítulos en el máster

El reparto de tiempo dentro de cada frase es proporcional al peso silábico de
cada palabra, no al número de caracteres: "de" y "grado" no duran lo mismo.
"""
import os
import re
import sys
import wave

import numpy as np

SCRATCH = os.environ.get(
    "TESTI_SCRATCH",
    "/tmp/claude-0/-home-user-CEINCA-AI-OS/a29f399c-f140-5bf3-ad8d-b92ce0d8ca11/scratchpad")
SUBS = os.path.join(SCRATCH, "subs")
# El guion es contenido escrito a mano: vive en el repo y se versiona.
# El .ass es derivado, se regenera, y se queda fuera con el resto del build.
GUION = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                     os.pardir, "subs", "guion.txt")
GUION = os.path.normpath(GUION)
ASS = os.path.join(SUBS, "testi.ass")

SR = 48000
# Cada pista de voz ya está colocada en su posición del montaje y rellenada
# hasta 30,6 s, así que sus tiempos son los del Reel final, no los del clip.
PISTAS = [("a", "voz_a.wav"), ("b", "voz_b.wav"),
          ("c", "voz_c.wav"), ("d", "voz_d.wav")]

# --- geometría (ver README §3): los chips de contexto viven en y=1520, así que
# el subtítulo va por encima. \an2 mide el margen desde abajo.
PLAY_W, PLAY_H = 1080, 1920
BASE_Y = 1400
MARGEN_V = PLAY_H - BASE_Y

LIMA = "&H0000FFC6"      # ASS es &HAABBGGRR, no RGB: C6FF00 -> 00FFC6
BLANCO = "&H00FFFFFF"
NEGRO = "&H00000000"

MAX_PALABRAS = 3         # ritmo de Reel: 3 palabras por pantalla como mucho
MIN_EN_PANTALLA = 0.55   # ninguna tarjeta baja de esto aunque hable rapidísimo


# --------------------------------------------------------------- 1. detección
def leer_wav(path):
    with wave.open(path, "rb") as w:
        n, ch = w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float32) / 32768
    return x.reshape(-1, ch).mean(axis=1) if ch > 1 else x


def banda_de_voz(x):
    """Aísla 300-3400 Hz: medir energía a secas confunde graves con habla."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < 300) | (f > 3400)] = 0
    return np.fft.irfft(X, n)


def detectar_habla(x, umbral_rel=0.11, hueco=0.26, minimo=0.22):
    """Tramos de habla por energía en banda de voz.

    El umbral es relativo al percentil 95 de la propia pista: cada testimonio
    se grabó a una distancia distinta del teléfono y un umbral absoluto deja
    fuera al que habla más bajo.
    """
    v = banda_de_voz(x)
    salto = int(0.02 * SR)
    marcos = len(v) // salto
    rms = np.array([np.sqrt(np.mean(v[i * salto:(i + 1) * salto] ** 2) + 1e-12)
                    for i in range(marcos)])
    ref = np.percentile(rms[rms > 1e-5], 95) if (rms > 1e-5).any() else 1.0
    activo = rms > ref * umbral_rel

    tramos, ini = [], None
    for i, a in enumerate(activo):
        if a and ini is None:
            ini = i
        elif not a and ini is not None:
            tramos.append((ini * 0.02, i * 0.02))
            ini = None
    if ini is not None:
        tramos.append((ini * 0.02, marcos * 0.02))

    unidos = []
    for t0, t1 in tramos:
        if unidos and t0 - unidos[-1][1] < hueco:
            unidos[-1] = (unidos[-1][0], t1)
        else:
            unidos.append((t0, t1))
    return [(round(a, 2), round(b, 2)) for a, b in unidos if b - a >= minimo]


def segmentar(x, minimo_seg=0.75):
    """Segmentos CONTIGUOS que cubren todo el habla del testimonio.

    Los tramos detectados no sirven tal cual como guion: con umbral alto se
    parten bien las frases pero se cae el habla más floja, y con umbral bajo
    sale un único bloque de 8 s. Aquí el umbral alto se usa sólo para localizar
    las pausas, y el corte se pone en mitad de cada pausa: así se conservan los
    puntos de respiración naturales sin que ninguna palabra quede fuera.
    """
    grueso = detectar_habla(x, umbral_rel=0.11, hueco=0.40, minimo=0.30)
    if not grueso:
        return []
    t0, t1 = grueso[0][0], grueso[-1][1]

    fino = detectar_habla(x, umbral_rel=0.42, hueco=0.10, minimo=0.14)
    cortes = [round((a[1] + b[0]) / 2, 2)
              for a, b in zip(fino, fino[1:]) if b[0] - a[1] >= 0.16]
    cortes = [c for c in cortes if t0 + 0.30 < c < t1 - 0.30]

    bordes = [t0] + cortes + [t1]
    segs = []
    for a, b in zip(bordes, bordes[1:]):
        # un segmento demasiado corto se pega al anterior: nadie quiere
        # rellenar veinte líneas de 0,2 s
        if segs and b - a < minimo_seg:
            segs[-1] = (segs[-1][0], b)
        else:
            segs.append((a, b))
    if len(segs) > 1 and segs[0][1] - segs[0][0] < minimo_seg:
        segs[:2] = [(segs[0][0], segs[1][1])]
    return [(round(a, 2), round(b, 2)) for a, b in segs]


def cmd_detectar():
    os.makedirs(SUBS, exist_ok=True)
    if os.path.exists(GUION):
        raise SystemExit(f"{GUION} ya existe. Bórralo si quieres regenerarlo "
                         f"(se perdería el texto ya escrito).")
    lineas = [
        "# GUION DE SUBTÍTULOS — Reel de testimonios Casa & Campo",
        "#",
        "# Los tiempos ya están medidos sobre el audio: son los tramos reales",
        "# de habla del Reel montado. NO hay que tocarlos.",
        "# Escribe después de la barra lo que dice cada tramo.",
        "# Un tramo vacío no genera subtítulo (útil si es una risa o un 'eh').",
        "#",
        "# formato:  id  inicio  fin  | texto",
        "",
    ]
    total = 0
    for tag, archivo in PISTAS:
        ruta = os.path.join(SCRATCH, archivo)
        if not os.path.exists(ruta):
            raise SystemExit(f"falta {ruta} — corre antes build_testi_mix.sh")
        tramos = segmentar(leer_wav(ruta))
        lineas.append(f"# --- testimonio {tag.upper()} ({archivo}) — "
                      f"{len(tramos)} tramos, "
                      f"{tramos[0][0]:.2f}s a {tramos[-1][1]:.2f}s")
        for i, (t0, t1) in enumerate(tramos, 1):
            lineas.append(f"{tag}{i:02d}  {t0:6.2f}  {t1:6.2f}  | ")
            total += 1
        lineas.append("")
    with open(GUION, "w", encoding="utf-8") as f:
        f.write("\n".join(lineas))
    print(f"  {GUION}")
    print(f"  {total} tramos de habla detectados — escribe el texto de cada uno")


# ------------------------------------------------------------------- 2. ASS
def silabas(palabra):
    """Peso silábico aproximado, suficiente para repartir tiempo.

    Cuenta grupos de vocales (los diptongos van juntos) y nunca devuelve 0,
    para que una palabra sin vocales no se lleve tiempo cero.
    """
    limpia = re.sub(r"[^a-záéíóúüñ]", "", palabra.lower())
    return max(1, len(re.findall(r"[aeiouáéíóúü]+", limpia)))


def leer_guion():
    if not os.path.exists(GUION):
        raise SystemExit(f"falta {GUION} — corre primero: "
                         f"python3 build_testi_subs.py detectar")
    filas = []
    for n, linea in enumerate(open(GUION, encoding="utf-8"), 1):
        linea = linea.strip()
        if not linea or linea.startswith("#"):
            continue
        m = re.match(r"^(\w+)\s+([\d.]+)\s+([\d.]+)\s*\|\s*(.*)$", linea)
        if not m:
            raise SystemExit(f"{GUION}:{n}: no entiendo esta línea:\n  {linea}")
        _, t0, t1, texto = m.groups()
        texto = texto.strip()
        if texto:
            filas.append((float(t0), float(t1), texto))
    if not filas:
        raise SystemExit(f"{GUION} no tiene ni un tramo con texto.")
    return filas


def tarjetas(filas):
    """Parte cada tramo en tarjetas de <=3 palabras con tiempo proporcional."""
    salida = []
    for t0, t1, texto in filas:
        palabras = texto.split()
        pesos = [silabas(p) for p in palabras]
        total = sum(pesos)
        dur = t1 - t0
        # tiempo absoluto de entrada/salida de cada palabra
        marcas, acc = [], 0.0
        for p, w in zip(palabras, pesos):
            ini = t0 + dur * acc / total
            acc += w
            marcas.append((p, ini, t0 + dur * acc / total))
        for i in range(0, len(marcas), MAX_PALABRAS):
            grupo = marcas[i:i + MAX_PALABRAS]
            salida.append((grupo[0][1], grupo[-1][2], grupo))
    return salida


def esc(s):
    return s.replace("\\", "\\\\").replace("{", "(").replace("}", ")")


def cmd_ass():
    grupos = tarjetas(leer_guion())
    cab = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {PLAY_W}
PlayResY: {PLAY_H}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Voz,Anton,100,{BLANCO},{BLANCO},{NEGRO},&H90000000,0,0,0,0,100,100,2,0,1,6,4,2,60,60,{MARGEN_V},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    def tc(t):
        h = int(t // 3600); m = int(t % 3600 // 60)
        s = t - h * 3600 - m * 60
        return f"{h:d}:{m:02d}:{s:05.2f}"

    ev = []
    for gi, (_, _, grupo) in enumerate(grupos):
        # Una tarjeta = varios eventos, uno por palabra resaltada. Es el modo
        # estándar de karaoke en libass: \k depende del reproductor, esto no.
        for wi, (_, ini, fin) in enumerate(grupo):
            if fin - ini < 0.01:
                continue
            partes = []
            for wj, (pal, _, _) in enumerate(grupo):
                color = LIMA if wj == wi else BLANCO
                partes.append(f"{{\\c{color}}}{esc(pal)}")
            texto = " ".join(partes)
            # pequeño pop sólo en la primera palabra de la tarjeta
            if wi == 0:
                texto = "{\\fscx88\\fscy88\\t(0,110,\\fscx100\\fscy100)}" + texto
            fin_real = fin
            if wi == len(grupo) - 1:
                # la última palabra se sostiene un poco para que la tarjeta no
                # parpadee cuando alguien habla muy rápido
                obj = grupo[0][1] + MIN_EN_PANTALLA
                fin_real = max(fin, obj) if gi + 1 >= len(grupos) else \
                    min(max(fin, obj), grupos[gi + 1][0])
            ev.append(f"Dialogue: 0,{tc(ini)},{tc(fin_real)},Voz,,0,0,0,,{texto}")

    os.makedirs(SUBS, exist_ok=True)
    with open(ASS, "w", encoding="utf-8") as f:
        f.write(cab + "\n".join(ev) + "\n")
    print(f"  {ASS}")
    print(f"  {len(grupos)} tarjetas, {len(ev)} eventos, "
          f"línea base y={BASE_Y} (por encima de los chips)")


if __name__ == "__main__":
    accion = sys.argv[1] if len(sys.argv) > 1 else "ass"
    if accion == "detectar":
        cmd_detectar()
    elif accion == "ass":
        cmd_ass()
    else:
        raise SystemExit("uso: build_testi_subs.py [detectar|ass]")
