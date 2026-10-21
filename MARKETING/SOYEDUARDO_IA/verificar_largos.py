#!/usr/bin/env python3
"""Verifica los largos de los textos de MANUAL_COPY_SOYEDUARDO_IA.md.

Lee cada bloque de código del manual precedido por un marcador:
    <!-- largo: id=ig_dm max=1000 [min=80] [hashtags=5] [declared=937] [allow_brackets=1] -->
y mide el texto del bloque (sin las líneas de cierre ```).

Medidas:
  - cp  = caracteres Unicode (code points).
  - u16 = unidades UTF-16 (los emoji fuera del plano básico cuentan 2): es la medida más estricta.
El veredicto usa el MAYOR de los dos contra el límite. Los saltos de línea cuentan 1.
También: cuenta hashtags, avisa de marcadores [...] sin completar (salvo allow_brackets=1) y compara
con la cifra declarada por Eduardo (declared=N), si existe.

Uso:  python3 verificar_largos.py [--actualizar]
  --actualizar  escribe la tabla de resultados al final del manual (tras <!-- RESULTADO_VERIFICACION -->).
Sale con código 1 si algún texto no cumple.
"""
import re
import sys
from pathlib import Path

MANUAL = Path(__file__).with_name("MANUAL_COPY_SOYEDUARDO_IA.md")
MARCA = re.compile(r"<!--\s*largo:\s*(.*?)\s*-->\s*\n```[^\n]*\n(.*?)\n```", re.S)
HASHTAG = re.compile(r"(?<![\w#])#[^\W\d_][\w]*", re.U)
CORCHETES = re.compile(r"\[[^\]\n]+\]")


def parse_attrs(s):
    return dict(p.split("=", 1) for p in s.split())


def medir(texto):
    cp = len(texto)
    u16 = len(texto.encode("utf-16-le")) // 2
    return cp, u16


def main():
    actualizar = "--actualizar" in sys.argv
    md = MANUAL.read_text(encoding="utf-8")
    filas, fallos = [], 0
    for m in MARCA.finditer(md):
        a, texto = parse_attrs(m.group(1)), m.group(2)
        cp, u16 = medir(texto)
        peor = max(cp, u16)
        mx = int(a["max"]) if "max" in a else None
        mn = int(a["min"]) if "min" in a else None
        hmax = int(a["hashtags"]) if "hashtags" in a else None
        nh = len(HASHTAG.findall(texto))
        probs = []
        if mx is not None and peor > mx:
            probs.append(f"pasa de {mx}")
        if mn is not None and peor < mn:
            probs.append(f"menos de {mn}")
        if hmax is not None and nh > hmax:
            probs.append(f"{nh} hashtags (máx. {hmax})")
        if "PENDIENTE" in texto:
            probs.append("PENDIENTE (no validado)")
        elif a.get("allow_brackets") != "1" and CORCHETES.search(texto):
            probs.append("marcador sin completar: " + CORCHETES.search(texto).group(0))
        declared = ""
        if "declared" in a:
            d = int(a["declared"])
            declared = f"{d} → " + ("coincide (code points)" if d == cp else "coincide (UTF-16)" if d == u16 else f"NO coincide (cp {cp}, u16 {u16})")
        # un marcador sin completar o PENDIENTE no es fallo de largo, pero sí aviso
        es_fallo = any(p.startswith(("pasa", "menos", "hashtags")) for p in probs)
        fallos += es_fallo
        lim = (f"{mn}–" if mn else "≤ ") + (str(mx) if mx else "—")
        estado = "FALLA: " + "; ".join(probs) if es_fallo else ("AVISO: " + "; ".join(probs) if probs else "OK")
        filas.append((a.get("id", "?"), cp, u16, lim, nh, declared, estado))

    enc = "| Texto | Caracteres | UTF-16 | Límite | Hashtags | Declarado por Eduardo | Estado |\n|---|---|---|---|---|---|---|"
    tabla = enc + "\n" + "\n".join(f"| `{i}` | {cp} | {u} | {lim} | {nh} | {dec or '—'} | {est} |" for i, cp, u, lim, nh, dec, est in filas)
    print(tabla)
    print(f"\n{len(filas)} textos medidos; {fallos} con fallo de largo/hashtags.")
    if actualizar:
        marca = "<!-- RESULTADO_VERIFICACION -->"
        base = md.split(marca)[0]
        md2 = base + marca + "\n" + tabla + "\n\nCaracteres = code points de Python; UTF-16 = medida estricta (emoji = 2). El veredicto usa el mayor.\n"
        MANUAL.write_text(md2, encoding="utf-8")
        print("Tabla actualizada en", MANUAL.name)
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
