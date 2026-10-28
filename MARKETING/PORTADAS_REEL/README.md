# Portadas de reel (1080×1920) — receta validada el 27-10-2026

Aprobadas por Eduardo: **CHINCHORRO** (CEINCA, `ceinca-social`: azul marino + dorado, Manrope 800) y **Reel B de ÑAPA** (@soyeduardo.ia: Tinta + lima, Sora 800).

## Reglas de la receta
1. **Lienzo 1080×1920.** Todo el texto y la cara dentro del **cuadro central 1080×1080 del feed (y 420 a 1500)**. Fuera del cuadro solo continúa la imagen.
2. **Foto:** un fotograma del propio reel (el avatar o Eduardo), **mirando a cámara y sin gesto de hablar** (sonrisa suave, boca cerrada o casi). Revisar varios fotogramas; el de mitad de frase suele salir con un gesto raro.
3. **Rostro arriba y más pequeño:** la foto se escala al **85 %** con la coronilla en **y ≈ 450** y la barbilla **antes de y ≈ 1100**. El texto empieza **debajo de la barbilla** (y ≈ 1165); nunca sobre la cara ni el cuello.
4. **Titular:** una sola idea, **2 líneas**, MAYÚSCULAS, 92–96 px, con **una palabra resaltada** (banda dorada `#C8A951` con texto azul en CEINCA; banda lima `#C6FF3D` con texto tinta en @soyeduardo.ia: un solo elemento de acento).
5. **Interlineado del titular: 1,3** (solo las dos líneas del titular; la línea de apoyo va a 1,2). Con 1,02 las líneas se pegaban.
6. **Línea de apoyo** corta (≈ 42–44 px) bajo el titular y un **identificador pequeño** arriba dentro del cuadro: logo + etiqueta en CEINCA, `@soyeduardo.ia` en JetBrains Mono. *Nota:* es una excepción aprobada a la regla de «sin tags superpuestos» de `PRODUCTION/FLOW_SISTEMA.md`: se mantienen pequeños y arriba, lejos del titular.
7. **Velo** degradado vertical desde y ≈ 980 hacia abajo (nunca una franja de borde recto sobre la cara).
8. Comprobar con el **recorte 1080×1080** (magenta sobre el cuadro) que nada se sale.

## Uso
```
node MARKETING/PORTADAS_REEL/generar.mjs --marca ceinca --foto fotograma.png \
  --l1 "[[Apostilla]]" --l2 "tu título" --sub "Desde donde vivas · en línea" --tag "COPIA CERTIFICADA" -o portada.png
node MARKETING/PORTADAS_REEL/generar.mjs --marca soyeduardo --foto fotograma.png \
  --l1 "¿Por qué" --l2 "salen [[planos]]?" --sub "tus videos de Claude" --tag "@soyeduardo.ia" -o portada_b.png
```
Requiere `npm install` en `.claude/skills/ceinca-video-fx` (trae `playwright-core`) y Chrome/Chromium. El fotograma se extrae con `ffmpeg -ss <s> -i clip.mp4 -frames:v 1 fotograma.png` (1080×1920).
