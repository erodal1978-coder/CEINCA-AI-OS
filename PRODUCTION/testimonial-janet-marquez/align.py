#!/usr/bin/env python3
"""Fusiona el texto de Whisper large-v3 (exacto) con los timestamps del CTC
espanol (que Whisper via sherpa-onnx no expone) para obtener un transcript
palabra por palabra con tiempos reales, y lo segmenta en frases usando las
pausas reales medidas sobre el audio.
"""
import json, re, subprocess, unicodedata
from difflib import SequenceMatcher

ctc = json.load(open("ctc_words.json"))
wh = json.load(open("whisper_text.json"))

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9n]", "", s)

# --- 1. tokens CTC -> palabras con tiempo ------------------------------------
words_ctc = []
for tok, ts in zip(ctc["tokens"], ctc["timestamps"]):
    if tok.startswith(" ") or not words_ctc:
        words_ctc.append({"w": tok.strip(), "s": ts})
    else:
        words_ctc[-1]["w"] += tok
for i, x in enumerate(words_ctc):
    x["e"] = words_ctc[i + 1]["s"] if i + 1 < len(words_ctc) else x["s"] + 0.45

# --- 2. unir las dos ventanas de Whisper quitando el solape ------------------
# La ventana A termina truncada ("...eventos aqui de"), asi que un match exacto
# de cola contra cabeza falla: se busca el bloque comun mas largo entre la cola
# de A y la cabeza de B.
a_words, b_words = wh[0].split(), wh[1].split()
TA, TB = 25, 25
na = [norm(x) for x in a_words[-TA:]]
nb = [norm(x) for x in b_words[:TB]]
m = SequenceMatcher(None, na, nb, autojunk=False).find_longest_match(0, len(na), 0, len(nb))
if m.size >= 2:
    cut_a = len(a_words) - TA + m.a          # A se corta donde arranca el solape
    cut_b = m.b + m.size                     # B se reanuda tras el solape
    merged = a_words[:cut_a] + b_words[m.b:]
    print(f"solape: {m.size} palabras -> A[:{cut_a}] + B[{m.b}:]  "
          f"('{' '.join(a_words[cut_a:cut_a+m.size])}')")
else:
    merged = a_words + b_words
    print("sin solape detectado")
print(f"total {len(merged)} palabras")

# --- 3. alineacion Whisper <-> CTC -------------------------------------------
nw = [norm(x) for x in merged]
nc = [norm(x["w"]) for x in words_ctc]
sm = SequenceMatcher(None, nw, nc, autojunk=False)
out = [{"w": x, "s": None, "e": None} for x in merged]
matched = 0
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        for k in range(i2 - i1):
            out[i1 + k]["s"], out[i1 + k]["e"] = words_ctc[j1 + k]["s"], words_ctc[j1 + k]["e"]
            matched += 1
    elif tag == "replace":
        n = i2 - i1
        t0 = words_ctc[j1]["s"] if j1 < len(words_ctc) else (out[i1 - 1]["e"] or 0)
        t1 = words_ctc[j2 - 1]["e"] if j2 - 1 < len(words_ctc) else t0 + 0.4 * n
        for k in range(n):
            out[i1 + k]["s"] = t0 + (t1 - t0) * k / n
            out[i1 + k]["e"] = t0 + (t1 - t0) * (k + 1) / n
print(f"palabras con tiempo directo del CTC: {matched}/{len(merged)}")

for i, x in enumerate(out):
    if x["s"] is None:
        prev = next((out[j]["e"] for j in range(i - 1, -1, -1) if out[j]["e"] is not None), 0.0)
        nxt = next((out[j]["s"] for j in range(i + 1, len(out)) if out[j]["s"] is not None), prev + 0.4)
        x["s"], x["e"] = prev, nxt
    x["s"], x["e"] = round(x["s"], 3), round(max(x["e"], x["s"] + 0.08), 3)

# --- 4. pausas reales medidas sobre el audio ---------------------------------
p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "voice16k.wav",
                    "-af", "silencedetect=noise=-24dB:d=0.18", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
sil = []
cur = None
for tok in re.findall(r"silence_(start|end): ([-0-9.]+)", p):
    if tok[0] == "start":
        cur = float(tok[1])
    elif cur is not None:
        sil.append((cur, float(tok[1])))
        cur = None
print(f"\npausas detectadas: {len(sil)}")

# El corte de frase cae en la pausa: la palabra siguiente arranca despues del hueco.
breaks = {s for s, e in sil if 0.5 < s < 44.0}

phrases, cur = [], []
for i, x in enumerate(out):
    cur.append(x)
    nxt_s = out[i + 1]["s"] if i + 1 < len(out) else 99
    if any(x["e"] - 0.35 <= b <= nxt_s + 0.35 for b in breaks) or i == len(out) - 1:
        phrases.append(cur); cur = []
if cur:
    phrases.append(cur)

json.dump(out, open("words.json", "w"), ensure_ascii=False, indent=1)
json.dump(phrases, open("phrases.json", "w"), ensure_ascii=False, indent=1)
print(f"\n{len(phrases)} frases:")
for k, ph in enumerate(phrases):
    print(f"  {k:2d} [{ph[0]['s']:6.2f} -> {ph[-1]['e']:6.2f}]  {' '.join(w['w'] for w in ph)}")
