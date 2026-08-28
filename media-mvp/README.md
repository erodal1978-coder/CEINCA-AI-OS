# media-mvp

Carpeta aislada — primer prototipo mínimo del futuro CEINCA AI Video Production
System, sin relación con `video-export/` (Remotion) ni con `carrusel-export/`
(Playwright/imagen). Demuestra que la cadena `ffprobe + whisper + ffmpeg`
funciona de punta a punta sobre un video real. No recorta, no compone
overlays/captions sobre el video, no genera música/SFX, no procesa por lotes,
no orquesta nada — eso queda para pasos futuros, deliberadamente fuera de
alcance de esta v1.

## Uso

```bash
python3 media-mvp/analyze.py <video_file> [output_dir] [model] [lang]
```

- `video_file` — requerido. Ruta a cualquier video (Reel, testimonial, clip de
  cámara, lo que sea — no depende de `CLIENTS/` ni de ningún cliente).
- `output_dir` — opcional. Default: `media-mvp/output/<basename_sin_extensión>/`.
- `model` — opcional. Modelo de whisper (`tiny`/`base`/`small`/`medium`/`large`).
  Default: `base` — compromiso CPU-friendly (sin GPU/CUDA confirmada en esta
  máquina): descarga ~140MB, velocidad razonable, español legible. Usar
  `small`/`medium` para mayor precisión una vez validada la cadena.
- `lang` — opcional. Default: `es`.

Ejemplo:
```bash
python3 media-mvp/analyze.py ~/Vídeos/reel_borrador.mp4
```

## Salidas

Por cada video, en `output_dir`:

- **`metadata.json`** — duración, resolución, fps, codecs, canales/sample rate
  de audio, tamaño de archivo, más el JSON crudo completo de
  `ffprobe -show_format -show_streams` (nada se descarta).
- **`captions.srt`** — transcripción de whisper, formato SRT estándar
  (renombrado desde el nombre que whisper genera por defecto, para tener
  siempre el mismo nombre de archivo de salida).
- **`silences.json`** — intervalos de silencio detectados por
  `ffmpeg silencedetect` (umbral -30dB, duración mínima 0.5s), con
  `{start, end, duration}` por intervalo. Si el clip termina en silencio,
  el último intervalo se marca `"end_of_file": true`.

Si el video no tiene pista de audio, `captions.srt` y `silences.json` se
saltan explícitamente (no es un error — exit code 0).

## Requisitos

- `ffmpeg`/`ffprobe` en el PATH (confirmado: 6.1.1, con soporte para
  `silencedetect`, `loudnorm`/`ebur128`, `atempo`, `xfade`, `drawtext`, entre
  otros filtros relevantes para pasos futuros).
- `whisper` CLI instalado en un venv dedicado. Por defecto se busca en
  `~/.local/venvs/whisper/bin/whisper`; sobreescribir con la variable de
  entorno `WHISPER_BIN` si vive en otra ruta.

No hay `requirements.txt` — el script solo usa la librería estándar de
Python (`subprocess`, `json`, `re`, `os`, `sys`) e invoca el binario de
whisper directamente, sin importarlo como librería.

## Notas

- Sin suite de tests formal — el propio script se auto-verifica al final
  (confirma que `metadata.json`/`captions.srt`/`silences.json` existen y
  tienen forma válida), mismo patrón que el resto de scripts ffmpeg/Python
  del repo (`CLIENTS/casacampobarinas1/PROMO_VIDEO_2026/build/tp_limit.py`,
  `build_video.py`, `build_mix.sh`), ninguno de los cuales tiene tests
  formales tampoco.
- La primera vez que se usa un modelo de whisper, este se descarga
  (requiere red) — no es un error si la primera corrida tarda más.
- Todo lo generado en runtime vive en `output/`, gitignored localmente.
