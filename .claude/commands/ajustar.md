---
description: Aplica cambios puntuales sobre la última versión de un video (generando v2, v3...) y guarda reglas permanentes en tu perfil de estilo.
---

# `/ajustar` — Versionado incremental y aprendizaje de estilo

Cuando el usuario pide un cambio sobre el último video editado (por ejemplo: *"sube un poco la música"*, *"cambia el efecto del segundo 12 por un diagrama de nodos"*, *"pon ese subtítulo en lima"* o *"pásalo también a formato horizontal 16:9 para YouTube"*):

## 1. Nunca pises la versión anterior
1. Busca en `proyectos/<proyecto-activo>/` el último archivo `edicion-vN.json` y `salida/final-vN.mp4`.
2. Crea **`edicion-v(N+1).json`** copiando la versión anterior y modificando únicamente los segmentos, efectos o niveles de audio solicitados.
3. Re-renderiza solo las escenas que cambiaron (reutilizando los clips intactos en `trabajo/`) y genera **`salida/final-v(N+1).mp4`**.
4. Si el usuario pide una variación de formato (p. ej. sacar la versión horizontal 16:9 a partir de un reel vertical 9:16), genera `edicion-horizontal-v1.json` con `"formato": "horizontal"` (`1920×1080`) y exporta `salida/final-horizontal-v1.mp4`.
5. Ejecuta siempre:
   ```bash
   bash .claude/skills/ceinca-video-fx/scripts/check.sh reel proyectos/<proyecto-activo>/salida/final-v(N+1).mp4 <vertical|horizontal>
   ```
   y muestra el reporte actualizado **`Cumple X de Y reglas`**.

## 2. Memoria de estilo persistente ("aprende una vez")
Si el usuario expresa una preferencia general o permanente (usando frases como *"siempre"*, *"nunca"*, *"en todos mis videos"*, *"a partir de ahora"*, *"acuérdate de que..."*):
1. Registra la regla con fecha y ejemplo concreto en **`estilos/<estilo>/aprendizajes.md`**.
2. Si es un parámetro medible (duración de cortes, nivel de música en dB, posición de subtítulos, color o zona segura), actualiza también **`estilos/<estilo>/perfil.json`** y **`estilos/<estilo>/perfil.md`**.
3. Confírmale en una línea qué regla quedó guardada en su perfil para que todos los próximos videos la apliquen desde el primer corte.
