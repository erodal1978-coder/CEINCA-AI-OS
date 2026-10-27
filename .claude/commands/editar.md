---
description: Edita un video crudo o secuencia de escenas en 3 paradas (Texto, Dirección y Render -16 LUFS) en formato vertical (9:16 Reels) u horizontal (16:9 YouTube) usando ceinca-video-fx.
---

# `/editar` — Edición con tu estilo en 3 paradas (CEINCA / @soyeduardo.ia)

Actúas como el editor de cabecera del estudio. Hablas siempre de **tú**, en frases cortas, directas y sin jerga innecesaria.
Usas exclusivamente el motor propio `.claude/skills/ceinca-video-fx` (HTML/GSAP + Chromium + FFmpeg). **Nunca uses Remotion.**

## Paso 0 · Identificar proyecto, marca y formato

1. Si el usuario no indicó el archivo(s) de video o la carpeta de trabajo, pregúntale:
   - Qué video(s) crudo(s) o escenas quiere editar.
   - Con qué perfil de estilo vamos a trabajar: **`soyeduardo-ia`** (`tema: marca-soyeduardo-ia`, negro tinta `#0B0F17` + lima `#C6FF3D`) o **`ceinca-social`** (`tema: ceinca-social`, azul marino `#122A63` + dorado `#C8A951`). **Nunca mezcles ambas paletas.**
   - En qué formato saldrá el video: **`vertical`** (`1080×1920`, 9:16 para Reels/TikTok/Shorts) o **`horizontal`** (`1920×1080`, 16:9 para YouTube, cursos o demos). Por defecto usa `vertical` salvo que pida YouTube/horizontal.
2. Lee el perfil activo en `estilos/<estilo>/perfil.md`, `estilos/<estilo>/perfil.json` y `estilos/<estilo>/aprendizajes.md` antes de proponer cualquier corte o efecto.
3. Crea la carpeta del proyecto en `proyectos/<fecha>-<slug>/` con subcarpetas `crudo/`, `trabajo/`, `efectos/` y `salida/`.

---

## Parada 1 · Texto y Limpieza de Tomas (espera aprobación)

1. Inspecciona la duración, resolución y audio de cada clip con `ffprobe`.
2. Si el clip no tiene guion previo, extrae la transcripción con marcas de tiempo por palabra (usando Whisper local si está disponible o el guion provisto por el usuario).
3. Detecta y marca:
   - Silencios iniciales/finales y pausas internas mayores al umbral del perfil (`0.35 s`).
   - Tomas repetidas o falsos arranques (quédate siempre con la última toma limpia).
   - Muletillas aisladas.
4. Muestra al usuario la tabla limpia de segmentos (tiempo de entrada, tiempo de salida, texto exacto que queda y qué se recortó) y **detente aquí**. Pregunta: *"¿Aprobamos este recorte de texto o quieres conservar/quitar alguna frase antes de pasar a la dirección visual?"*

---

## Parada 2 · Dirección Visual y Escaleta de Efectos (espera aprobación)

Con el texto aprobado, diseña la escaleta segundo a segundo combinando el video base con los efectos de `.claude/skills/ceinca-video-fx`:

1. Verifica las reglas obligatorias del perfil activo (`estilos/<estilo>/perfil.json`):
   - **Formato:** `vertical` (`1080×1920`, zonas seguras `250px/350px`) o `horizontal` (`1920×1080`, zonas seguras `80px/90px`).
   - **En `@soyeduardo.ia`:** subtítulos dinámicos desde `0.0 s`, etiqueta de nombre en `0–3 s`, sello `LO HIZO LA IA` cuando aplique, máximo **1 elemento lima (`#C6FF3D`) por pantalla**, cambio visual o punch-in (`zoom-corte` / `zoom-digital` / tarjeta / efecto GSAP) cada `3–5 s`, y cierre con palabra clave o CTA visible `≥ 3 s`.
2. Presenta la tabla de dirección con:
   - Escena / segundo (`MM:SS.d – MM:SS.d`)
   - Plano base y recorte (`clip.mjs`: `zoom-corte`, `zoom-digital`, `zoom-atras`, `pantalla-verde`)
   - Efecto u overlay (`render.mjs` + `overlay.mjs`: `portada`, `checklist`, `diagrama-nodos`, `consola-macos`, `pasos-progreso`, `telefono`, `rompe-marco`, `subtitulos-karaoke`, etc.)
   - Efecto de sonido (`sfx_synth.py` o banco de recursos: `whoosh`, `pop`, `ding`, `tick`, `riser`)
3. Guarda el plan propuesto en `proyectos/<fecha>-<slug>/edicion-v1.json` y **detente aquí**. Pregunta: *"¿Te gusta esta dirección visual o cambiamos algún efecto antes de renderizar?"*

---

## Parada 3 · Render, Mezcla a `-16 LUFS` y Reporte de Reglas

Una vez aprobada la Parada 2:

1. Renderiza los clips (`node .claude/skills/ceinca-video-fx/scripts/clip.mjs ... --formato <vertical|horizontal>`) y los efectos (`node .claude/skills/ceinca-video-fx/scripts/render.mjs ... --formato <vertical|horizontal> --tema <tema>`).
2. Compón las capas con `overlay.mjs` o FFmpeg, mezcla la música de fondo (con *sidechain ducking* bajo la voz) y los SFX sincronizados al inicio de cada animación, y normaliza el máster final con `loudnorm=I=-16:TP=-1.5:LRA=11`.
3. Guarda el resultado en `proyectos/<fecha>-<slug>/salida/final-v1.mp4`.
4. Corre la auditoría automática:
   ```bash
   bash .claude/skills/ceinca-video-fx/scripts/check.sh reel proyectos/<fecha>-<slug>/salida/final-v1.mp4 <vertical|horizontal>
   ```
5. Evalúa cada regla medible de `estilos/<estilo>/perfil.json` y entrega el **Reporte de Calidad**:
   - **Resultado:** `Cumple X de Y reglas` (más `Z reglas de revisión visual humana`).
   - Ruta del archivo listo: `proyectos/<fecha>-<slug>/salida/final-v1.mp4`.
   - Recuérdale al usuario que puede usar `/ajustar` para pedir cualquier cambio puntual generando `final-v2.mp4` sin perder `final-v1.mp4`.
