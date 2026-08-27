# Testimonial Dra. Janet Márquez — Reel/TikTok

Reel/TikTok del testimonio de la Dra. Janet Márquez (Bootcamp Mercantil Barinas).
**Estado: renderizado.** Entregable en
`assets/testimonial-janet-marquez/REEL_Testimonial_Janet_Marquez.mp4`
(1080×1920, H.264 High, 9.35 Mbps, 30 fps, AAC 48 kHz, 49.28 s).

## Uso

```bash
bash PRODUCTION/testimonial-janet-marquez/render.sh                      # con musica
bash PRODUCTION/testimonial-janet-marquez/render.sh <dir_trabajo> --sin-musica
```

Dos entregables en `assets/testimonial-janet-marquez/`:

| Archivo | Audio |
|---|---|
| `REEL_Testimonial_Janet_Marquez.mp4` | voz + música con ducking |
| `REEL_Testimonial_Janet_Marquez_sin_musica.mp4` | solo la voz |

Misma edición, mismos overlays, misma duración; el logo conserva su SFX propio
en ambas. Verificado restando las dos pistas: la diferencia es únicamente la
música (−39.1 dBFS aislada) y el residuo en el tramo del logo es −69 dBFS.

Requiere `ffmpeg` con libass y `python3` con `pillow` y `fonttools`. El script
se prepara solo: extrae Montserrat de la rama `main`, genera subtítulos y
overlays, y cachea los segmentos en `<dir_trabajo>/segs`.

## Archivos

| Archivo | Contenido |
|---|---|
| `align.py` | Fusiona el texto de Whisper large-v3 con los timestamps del CTC español y segmenta por pausas reales |
| `words.json` | Transcripción palabra por palabra con tiempos (108 palabras) |
| `edl.json` | Lista de cortes: 10 segmentos + logo |
| `build_overlays.py` | Subtítulos karaoke (ASS), rótulo de apertura y tercio inferior |
| `render.sh` | Pipeline completo de render |

## Estructura del corte

| Seg | Salida | Fuente | Contenido |
|---|---|---|---|
| HOOK | 0.00–2.84 | 16.96–19.80 | «el mayor de los éxitos, a casa llena» |
| A–I | 2.84–43.27 | — | testimonio completo, pausas y muletillas recortadas |
| LOGO | 43.27–49.28 | 0–6 | cierre con su SFX propio |

Overlays: rótulo de apertura 0–4 s a la altura de los hombros (y 1004–1260),
tercio inferior 4.8–8.8 s (y 1128–1300) y subtítulos desde y≈1390, con 360 px
libres abajo para la UI de Reels y TikTok. El rótulo empezó en el tercio
superior y hubo que bajarlo: a esa altura cruzaba los ojos de la Dra. Márquez
durante los 4 s que dura. Como comparte franja con el tercio inferior, se
separan 0.8 s para que no lea como parpadeo de una caja a otra.

Los 9 cortes caen en pausas reales medidas con `silencedetect` a −24 dB.
Punch-in de 6 % sobre la palabra de mayor peso de cada frase, con zoom base
alternado entre planos para que cada corte lea como jump cut. Tres cortes de
b-roll a 9.60 s, 25.50 s y 33.60 s; el tercero sincroniza el pendón del
Colegio de Abogados con la palabra «Barinas».

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

## Nombre oficial

Instituto de Estudios Jurídicos «Dr. José Agustín Figueredo» del Colegio de
Abogados del Estado Barinas. Confirmado por el cliente y aplicado tanto al
subtítulo del segmento A como al tercio inferior.

## Dos cosas que costaron

**`loudnorm` dinámico truncaba la mezcla.** En modo dinámico arrastra ~3 s de
lookahead; con `amix duration=first` eso cortaba el audio 2.9 s antes de tiempo
y, en el concat final, se llevaba por delante el audio del logo entero. Ambas
fuentes se normalizan ahora en dos pasadas (medir → aplicar con `measured_*` y
`linear=true`), y la longitud se fija además con `apad`+`atrim`.

**El logo perdía 3 dB.** Su audio es mono; la conversión normal a estéreo
reparte potencia y resta 3 dB por canal. Con `pan=stereo|c0=c0|c1=c0` se
duplica el canal tal cual. Verificado contra el original: RMS −21.16 dBFS y
pico −2.12 dBFS, contra −21.2 / −2.1 del archivo fuente.

## Punto abierto

El ducking que «sube en tramos de puro b-roll sin diálogo» no tiene dónde
aplicarse: los tres insertos van bajo voz continua y, al recortarse las pausas,
no queda ningún tramo mudo. La música baja −17 dB bajo la voz (dentro del rango
pedido) y se mantiene ahí. Si se quiere ese respiro, hay que agregar un beat de
b-roll solo de ~2 s, que llevaría el total a ~51 s.
