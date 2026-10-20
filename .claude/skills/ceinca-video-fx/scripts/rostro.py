#!/usr/bin/env python3
# rostro.py — mide dónde está el rostro en un tramo de clip, en coordenadas del lienzo 1080×1920 (encuadre cover).
# Lo usa reel-voz.mjs para que textos y subtítulos nunca tapen la cara. Detector: YuNet (OpenCV, vendor/modelos).
# Uso: python3 scripts/rostro.py <clip> <desde> <hasta> [--paso 0.2] [--desplazar 0]
# Salida (stdout, JSON): {"n": muestras_con_cara, "top": y_frente, "bottom": y_menton, "x0":, "x1":} o {"n": 0}
# "bottom" es la barbilla estimada (caja YuNet + 12 % de su alto) y es el máximo del tramo: si el locutor se acerca, manda el peor caso.
import json, os, sys

try:
    import cv2
except ImportError:
    print(json.dumps({"n": 0, "error": "sin OpenCV (pip install opencv-python)"}))
    sys.exit(0)

args = sys.argv[1:]
def opt(name, d):
    return float(args[args.index(name) + 1]) if name in args else d
clip, desde, hasta = args[0], float(args[1]), float(args[2])
paso, desplazar = opt('--paso', 0.2), opt('--desplazar', 0)
modelo = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'vendor', 'modelos', 'face_detection_yunet_2023mar.onnx')

cap = cv2.VideoCapture(clip)
cajas, t, det = [], desde, None
while t < hasta:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, f = cap.read()
    if not ok:
        break
    H, W = f.shape[:2]
    if det is None:
        det = cv2.FaceDetectorYN.create(modelo, '', (W, H), 0.7)
    _, caras = det.detect(f)
    if caras is not None and len(caras):
        x, y, w, h = max(caras, key=lambda c: c[2] * c[3])[:4]
        s = max(1080 / W, 1920 / H); ox, oy = (W * s - 1080) / 2, (H * s - 1920) / 2
        cajas.append((x * s - ox, y * s - oy + desplazar, (x + w) * s - ox, (y + h * 1.12) * s - oy + desplazar))
    t += paso

if not cajas:
    print(json.dumps({"n": 0}))
else:
    print(json.dumps({"n": len(cajas), "top": round(min(c[1] for c in cajas)), "bottom": round(max(c[3] for c in cajas)),
                      "x0": round(min(c[0] for c in cajas)), "x1": round(max(c[2] for c in cajas))}))
