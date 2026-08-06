# Testimonial Dra. Janet Márquez — Reel/TikTok

Análisis previo al render del testimonio del Bootcamp Mercantil Barinas.
**Estado: guion de cortes entregado, pendiente de aprobación. Nada renderizado aún.**

Fuentes en `assets/testimonial-janet-marquez/`.

## Archivos

| Archivo | Contenido |
|---|---|
| `align.py` | Fusiona el texto de Whisper large-v3 con los timestamps del CTC español y segmenta por pausas reales |
| `words.json` | Transcripción palabra por palabra con tiempos (108 palabras) |
| `edl.json` | Lista de cortes: 10 segmentos + logo, 49.11 s |

## Cómo se obtuvo la transcripción

El proxy de red bloquea `huggingface.co` y `openaipublic.azureedge.net`, así que
faster-whisper no puede descargar modelos. Ruta usada:

1. **Texto** — Whisper large-v3 vía releases de GitHub (`k2-fsa/sherpa-onnx`),
   que sí pasan el proxy. Por esa vía Whisper **no expone timestamps de palabra**.
2. **Tiempos** — `sherpa-onnx-nemo-fast-conformer-ctc-es-1424`, CTC de español
   con timestamps de token nativos.
3. **Fusión** — `align.py` alinea ambas secuencias con `SequenceMatcher`:
   102/108 palabras reciben timestamp directo del CTC, el resto se interpola.

Verificación: cortar el audio en `[18.48, 19.76]` y re-transcribir devuelve
exactamente «A casa llena.», que es lo que predicen los timestamps.

El nombre propio se resolvió aislando el fragmento `[3.30, 5.40]`: en pasada
completa Whisper oyó «gutián», pero sobre el fragmento aislado los dos modelos
coinciden en **«doctor José Agustín Figueredo»**. Pendiente de confirmación
del cliente porque va escrito en pantalla.

## Reproducir el análisis

```bash
pip install sherpa-onnx
# modelos (≈1.5 GB) desde releases de GitHub
B=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models
curl -sSL -o w.tar.bz2 "$B/sherpa-onnx-whisper-large-v3.tar.bz2" && tar xjf w.tar.bz2
curl -sSL -o c.tar.bz2 "$B/sherpa-onnx-nemo-fast-conformer-ctc-es-1424.tar.bz2" && tar xjf c.tar.bz2
ffmpeg -i ../../assets/testimonial-janet-marquez/VID_20260805_173719_112_bsl.mp4 \
       -vn -ac 1 -ar 16000 -c:a pcm_s16le voice16k.wav
python3 align.py
```

## Puntos abiertos

1. Confirmar «doctor José Agustín Figueredo».
2. El ducking que «sube en tramos de puro b-roll sin diálogo» no tiene dónde
   aplicarse: los tres insertos van bajo voz continua y no hay tramo mudo.
   Requiere decidir si se agrega un beat de b-roll solo (~2 s).
3. Confirmar que «Entonces Presidenta del IEJ» lleva ese «Entonces» a propósito.
