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

## Rendimiento (100% local, sin costo de API)

Todo el pipeline corre local (whisper CLI + ffmpeg) — **cero costo por minuto
procesado, sin límites de rate/cuota**, porque no hay ningún servicio externo
involucrado. El único costo es tiempo de CPU en la máquina donde corre.

Medido en esta sesión sobre hardware real: **Intel Core i5-3570 @ 3.40GHz,
4 núcleos, sin GPU/CUDA** (`torch 2.12.1+cpu` confirmado en el venv de
whisper), modelo `base`:

| Duración del clip | Tiempo real de procesamiento | Notas |
|---|---|---|
| 8s (sintético, sin habla) | 6.6s | domina el overhead fijo (carga del modelo) |
| 24.9s (habla real) | 16.7s | ~0.67× la duración del video |
| 117.7s / ~2min (habla real) | 1m40s | ~0.85× la duración del video |
| 180s / 3min (audio muy bajo, ver Límites conocidos) | 6m43s | **outlier** — audio de mal nivel hace que whisper tarde ~2× más de lo esperado, además de producir basura |

Con clips de buen nivel de audio, el pipeline procesa en **~0.7-0.85× la
duración del propio video** — es decir, más rápido que tiempo real, incluso
en este hardware de 2012 sin GPU. Para un volumen de **~4 Reels/semana**
(asumiendo 60-90s cada uno), el procesamiento total semanal es del orden de
**minutos, no horas** — no hay ningún cuello de botella de latencia ni de
cuota para ese volumen.

Modelos más grandes (`small`/`medium`/`large`) serán proporcionalmente más
lentos en este mismo hardware — no medido en esta sesión, evaluar antes de
cambiar el default si la precisión de `base` no alcanza para un caso de uso
específico.

## Robustez — condiciones de audio probadas

Validado en esta sesión con 5 corridas reales (no solo el smoke test
sintético original), cruzando contra transcripciones de referencia conocidas
cuando aplicaba:

| Condición | Resultado | Evidencia |
|---|---|---|
| Habla limpia (~25s) | ✅ Transcripción exacta | ya validado antes de esta sesión |
| + ruido de fondo sintético (pink noise, -20dB bajo la voz) | ✅ Transcripción 95%+ fiel | 1 palabra degradada ("anuncios"→"anusios"), resto idéntico al original |
| Voz acelerada 1.5× | ✅ Transcripción completa y coherente | misma palabra ambigua degradada, sin pérdida de contenido |
| Clip largo (~2min, nivel de audio normal) | ✅ 11 segmentos coherentes, 42 silencios en posiciones plausibles | contenido verificado legible de principio a fin |
| Clip largo (3min, **nivel de audio muy bajo**, -54dB) | ⚠️ Transcripción no confiable | ver "Límites conocidos" — ahora detectado y advertido explícitamente, no falla en silencio |

Conclusión: el pipeline es robusto a ruido moderado y velocidad de habla —
las condiciones que realmente lo rompen son de **nivel de audio**, no de
duración ni de ruido de fondo per se.

## Límites conocidos

**Audio de nivel muy bajo produce resultados no confiables — ahora detectado
y advertido, no silencioso.** Descubierto al probar con un clip real de 3
minutos cuyo audio medía entre -54dB y -59dB de `mean_volume` en todo su
rango (vs. -29dB a -36dB en clips que transcriben bien). Con ese nivel:

- `silencedetect` (umbral fijo -30dB) clasificaba prácticamente el clip
  entero como silencio (180 de 180 segundos).
- whisper producía transcripción fragmentada y sin sentido ("Petición." /
  "La" / "A").

**Se probó normalizar el audio con `loudnorm` antes de re-analizarlo — esto
empeoró el resultado, no lo arregló**: al subir el nivel, `silencedetect`
dejó de encontrar silencios (0 detectados) y whisper alucinó texto
completamente inventado (palabras en ruso/chino, fragmentos sin relación al
contenido). Conclusión: cuando el audio es mayormente ruido de piso
amplificado y no habla real capturada débilmente, normalizar el nivel no
recupera información que no está ahí — solo hace más audible el ruido.

**Qué hace el script hoy en vez de intentar "arreglarlo" automáticamente:**
mide `mean_volume` con `ffmpeg volumedetect` sobre cada clip (queda guardado
en `metadata.json` como `audio_mean_volume_db`) y, si cae debajo de -45dB,
imprime una advertencia explícita antes y después de procesar, y marca
`captions.srt`/`silences.json` como `⚠️ WARN` en vez de `OK` en el reporte
final — en lugar de reportar silenciosamente "0 segmentos: normal, sin
habla" cuando en realidad el problema es el nivel de grabación.

**Recomendación práctica:** si un video se grabó con el micrófono lejos o
muy bajo, volver a grabarlo o subir el nivel manualmente en un editor de
audio antes de pasarlo por este pipeline — no hay corrección automática
confiable para este caso todavía.

## Manejo de fallos

Auditado explícitamente en esta sesión — el objetivo es que ningún fallo
quede en silencio con un output incompleto sin avisar:

- **Archivo de entrada no existe / `ffmpeg`/`ffprobe` no está en el PATH /
  binario de whisper no encontrado** — `sys.exit(1)` con mensaje claro,
  antes de intentar nada más.
- **`ffprobe` falla sobre el video** (corrupto, formato no soportado) —
  fatal, `sys.exit(1)`, imprime el stderr real de ffprobe.
- **`ffmpeg silencedetect` devuelve un código de error real** — ahora es
  fatal (`sys.exit(1)`), no se trata como "0 silencios encontrados". Antes
  de esta sesión el código ignoraba `returncode` en este paso, lo cual
  habría sido indistinguible de un clip genuinamente sin silencios.
- **whisper reporta éxito pero no genera el archivo `.srt` esperado**
  (ej. un supuesto de nombrado incorrecto) — ahora lanza error explícito
  (`sys.exit(1)`) en vez de continuar silenciosamente con una transcripción
  inexistente. Antes de esta sesión, este caso pasaba desapercibido y el
  reporte final solo mostraba "captions.srt FALTA" sin explicar por qué.
- **Transcripción vacía (0 segmentos)** — ya no se asume automáticamente
  "normal, sin habla". Se cruza contra dos señales: el nivel de audio medido
  (ver "Límites conocidos") y cuántos segundos de audio no-silencioso hay
  según `silences.json`. Si el nivel es normal y hay más de 3s de audio
  no-silencioso pero 0 segmentos transcritos, se marca `⚠️ WARN` con el
  mensaje "posible fallo de transcripción, no falta de habla" — en vez de
  la explicación tranquilizadora por defecto.
- **Video sin pista de audio** — no es un error, se documenta como `SKIPPED`
  explícito en cada paso, exit code 0.

## Tests

`python3 media-mvp/test_regressions.py` — tests de regresión sin pytest
(asserts simples + runner propio), corren en milisegundos porque prueban
las funciones puras de verificación sobre archivos sintéticos, sin invocar
ffmpeg/whisper reales. Cubren específicamente los 2 bugs encontrados en la
validación original (SRT vacío mal reportado como "FALTA"; tolerancia de
rango insuficiente entre `duration_s` de ffprobe y `silence_end` de ffmpeg)
más los 3 hallazgos de esta sesión (audio de nivel bajo, transcripción vacía
sospechosa con audio normal, salida de whisper faltante) — cada uno con su
caso de control para confirmar que el fix no se volvió permisivo con fallas
reales.

## Notas

- Auto-verificación al final del propio script (confirma que
  `metadata.json`/`captions.srt`/`silences.json` existen y tienen forma
  válida) además de los tests de regresión de arriba — mismo patrón de
  auto-verificación que el resto de scripts ffmpeg/Python del repo
  (`CLIENTS/casacampobarinas1/PROMO_VIDEO_2026/build/tp_limit.py`,
  `build_video.py`, `build_mix.sh`).
- La primera vez que se usa un modelo de whisper, este se descarga
  (requiere red) — no es un error si la primera corrida tarda más.
- Todo lo generado en runtime vive en `output/`, gitignored localmente.

## Video Editor MVP (plan_video.py / process_video.py)

Este módulo implementa un pipeline de edición de video de dos fases:

**Fase 1: Director (`plan_video.py`)**
Se invoca con:
`python3 plan_video.py <narracion_real> <project_name> --brief "<brief_text>" --output-dir <output_dir>`

Analiza el clip de narración usando `analyze.py` (Whisper/ffprobe) y construye un EDL borrador basado en la estructura NEAPS (hook, problema, solucion, etc.). Sugiere planos B-roll y asigna duraciones algorítmicamente. Escribe el resultado en `plan.json` y una representación legible en `plan.md`.

**Aprobación mediada por Claude (Paso manual)**
El usuario interactúa con Claude revisando `plan.md`. Tras debatir, construyen el `approved_plan.json` donde se asignan las decisiones finales para cada plano (`"source_decision": "agent_searches" | "user_provides"` y sus rutas). 

**Fase 2: Ensamblador (`process_video.py`)**
Se invoca con:
`python3 process_video.py <approved_plan.json>`

1. **Workers**: Descarga B-roll de Pexels/Pixabay para los planos marcados como `agent_searches` o usa el video proveído localmente.
2. **Ensamblador (ffmpeg)**: Recorta cada plano a la duración requerida, encadena todo en un video base, quema los subtítulos (`captions.srt`), agrega textos complementarios, mezcla el audio original con música de fondo (si se provee) y ajusta los volúmenes.
3. **QC Automático**: Evalúa la duración, resolución, si contiene audio y si los subtítulos están presentes. Si `captions.srt` está vacío, el paso de quemado de subtítulos se salta automáticamente sin fallar, dejando un warning en el QC final.

### Límites Conocidos del Video Editor
- **SRT Vacío**: Si Whisper no reconoce diálogo y el SRT resulta vacío (0 bytes), `process_video.py` lo salta sin intentar usar libass, evitando un crash de ffmpeg.
- **Sin validación avanzada de FPS/Resolución al concatenar**: Aún asume que los planos provistos o descargados se pueden concatenar directamente de manera segura por ffmpeg.
