# REEL — La bienvenida de Angelo
### Recibimiento sorpresa por su regreso de España · Keyword: **EVENTO**

---

## 1. ENTREGABLES

| Archivo | Uso | Peso |
|---|---|---|
| `CASA_CAMPO_Angelo_Bienvenida_MASTER.mp4` | Publicación y anuncios | 17 MB |
| `CASA_CAMPO_Angelo_Bienvenida_SIN_MUSICA.mp4` | Reel orgánico con audio de tendencia (conserva el mariachi real) | 17 MB |
| `CASA_CAMPO_Angelo_portada.jpg` | Portada del Reel | 272 KB |

**Ficha técnica:** 1080×1920 · H.264 High · 30 fps · **18,0 s** · AAC 192 kbps
· −14,1 LUFS · pico real −2,1 dBFS · **17 MB** (límite pedido: 80 MB).

> **Los másteres no viven en el repo.** Git guarda cada versión de cada binario
> para siempre y no se puede borrar después sin reescribir el historial, así que
> los `.mp4` renderizados están en `.gitignore`. Los archivos finales se entregan
> por Drive/WhatsApp y se regeneran exactos con los scripts de `build/` a partir
> de las fuentes en `Videos/Assets/`. Lo que sí se versiona es la receta: scripts,
> tiempos de cada plano y copy.

---

## 2. ESTRUCTURA

Rejilla de **90 BPM** (negra 0,667 s = 20 frames exactos). Todos los cortes
caen en tiempo. **Un solo fragmento por clip, ninguno repetido.**

| Tiempo | Clip | Contenido | Caption |
|---|---|---|---|
| 0,00 – 2,00 | `WA0100` | **GANCHO** — el abrazo | ANGELO / **VOLVIÓ** |
| 2,00 – 4,67 | `WA0104` | La llegada | REGRESÓ DE **ESPAÑA** / NO SABÍA NADA |
| 4,67 – 8,00 | `WA0139` | Mariachis tocando | LO RECIBIERON CON **MARIACHI** / EN VIVO |
| 8,00 – 10,67 | `WA0138` | El abrazo, mariachis detrás | Y SU FAMILIA **COMPLETA** / LO ABRAZÓ |
| 10,67 – 14,00 | `WA0150` | Todos en Casa & Campo | TODO PASÓ EN **CASA & CAMPO** |
| 13,60 – 18,00 | logo | **CIERRE** animado | ¿TU PRÓXIMO **EVENTO?** · COMENTA: EVENTO |

Gancho en los primeros 2 s ✓ · cuerpo hasta el 78 % ✓ · cierre de 4 s ✓

**Por qué el abrazo abre el Reel:** el material no tiene el instante en que
Angelo ve por primera vez a la familia — los clips arrancan con la celebración
ya empezada. El plano más cercano a ese momento, y el más legible, es el abrazo
de `WA0100`, así que va primero. Se probó abrir con `WA0138` y no funcionó: ese
tramo es un primer plano tan cerrado que sólo se ve tela.

---

## 3. J-CUT / L-CUT

El mariachi **real** de los clips es el eje sonoro del Reel:

- **J-CUT** — el mariachi entra en **4,20 s**, 0,47 s **antes** que su imagen
  (4,667 s). El sonido tira del corte en vez de seguirlo.
- **L-CUT** — sigue sonando hasta **9,00 s**, un segundo **después** de que la
  imagen ya cambió al abrazo (8,00 s). El mariachi cose los dos planos.

Medición del máster (RMS por tramo):

```
              mariachi   música propia
3.60-4.20       silencio    -18.3   manda la música
4.20-4.67         -28.4     -20.8   J-CUT: audio antes que imagen
4.67-8.00         -21.4     -34.5   manda el mariachi (13 dB por debajo)
8.00-9.00         -28.9     -34.3   L-CUT: audio sigue tras el corte
9.00-9.60       silencio    -22.2   vuelve la música
```

La pista propia está compuesta **con un hueco deliberado** entre 4,2 y 9,0 s
para que esto funcione: no se trata de bajar el volumen en la mezcla, el
arreglo directamente no toca ahí.

---

## 4. TRATAMIENTO

- **Música original** (libre de derechos, sintetizada aquí): Re mayor, 90 BPM,
  piano de fieltro, cuerdas cálidas, bajo y percusión que entran sólo después
  del hueco del mariachi. Progresión D–A–Bm–G, resolución en D bajo el logo.
- **Efectos:** swell cálido que anuncia la entrada del mariachi, whooshes
  suaves en cada corte, y dos chimes en la aparición del logo.
- **Sonido real:** mariachi (`WA0139`), ambiente de la multitud (`WA0150`) bajo
  el plano final, y ambiente del abrazo (`WA0100`) bajo el gancho.
- **Estabilización** vidstab en dos pasadas sobre todo el metraje, que venía
  grabado a pulso.
- **Grade** cálido de mediodía llanero: sombra levantada, alta luz cálida,
  contraste moderado.
- **Captions cinemáticos:** línea de apoyo pequeña arriba y palabra clave
  grande abajo, con pop de entrada. Resaltadas en color las tres palabras que
  cargan la emoción: **VOLVIÓ** (lima), **MARIACHI** (ámbar), **COMPLETA** (lima).
- **Sin logo sobreimpreso en el cuerpo** ✓ — el logo aparece sólo en el cierre.

### Animación del logo

Entrada con **muelle** (`easeOutBack` desde 0,55×, con rebote), resplandor azul
que pulsa una vez al aparecer, y respiración lenta al asentarse.

Se compone **cuadro a cuadro en numpy** y se envía a ffmpeg por tubería, porque
ffmpeg no puede animar `scale` (evalúa `w`/`h` una sola vez). El texto lo pone
ffmpeg encima, que para tipografía es mejor herramienta.

> **No se usó Remotion.** Habría exigido instalar Node, el paquete y el
> pipeline de render de Chromium para una placa de 4 s. El resultado por
> composición directa es equivalente y sin dependencias. Si se quiere una
> biblioteca de plantillas de cierre reutilizables, ahí sí conviene Remotion y
> es un trabajo aparte.

---

## 5. COPY

### Caption

```
Angelo se fue a España. Volvió sin saber lo que le tenían preparado. 🎺🇻🇪

Su familia le montó la bienvenida completa:
mariachi en vivo, todos escondidos, y el abrazo que llevaba años esperando.

Eso no se planifica en un salón cualquiera.
Se planifica donde quepa la gente, la música y el desorden bonito. 🌴

Casa & Campo Barinas — donde pasan las cosas que después se cuentan.

📍 El Jobal, vía Obispos — a 15 min de la redoma
🎉 Cumpleaños · Bienvenidas · Graduaciones · Eventos privados

💾 Guarda este Reel para cuando te toque organizar la sorpresa.
🔄 Etiqueta a quien tiene un familiar por volver.
💬 Comenta "EVENTO" y te paso fechas y lo que incluye.

📲 0424-5541927
```

### Mensaje a fijar

```
📌 ¿Vas a montar una sorpresa así?

▪️ "¿Puedo llevar mariachi?" → Sí, y hay espacio y tomas para el montaje.
▪️ "¿Se alquila completo?" → Sí, exclusivo, sin público externo.
▪️ "¿Cuánta gente entra?" → Depende del formato; escríbenos y lo cuadramos.
▪️ "¿Hasta qué hora?" → Se conversa según el evento.
▪️ "¿Se puede decorar antes?" → Sí, se coordina el acceso previo.

Comenta "EVENTO" 👇 o escribe al 0424-5541927
```

### Hashtags

```
#Barinas #BarinasVenezuela #Bienvenida #RegresoACasa #VenezolanosEnEspaña
#Mariachi #SorpresaFamiliar #EventosBarinas #ElJobal #Llano
#CasaYCampo #EventosPrivados #Reencuentro #Barinas2026
```

---

## 6. REGENERAR

```bash
python3 build/build_angelo_video.py   # 5 planos, estabilización y captions
python3 build/build_angelo_cta.py     # placa de cierre con logo animado
python3 build/build_angelo_music.py   # música original + efectos
bash    build/build_angelo_mix.sh     # montaje, J-cut/L-cut, mezcla y export
```

`build/tp_limit.py` es el limitador de pico real con sobremuestreo 4×.

Fuentes en `Videos/Assets/`. Los tiempos de cada plano están en la lista
`SHOTS` de `build_angelo_video.py`.

---

## 7. NOTAS

- **No se identifica a nadie por parentesco en pantalla.** El material no
  permite confirmar quién es la madre, así que los captions cuentan la historia
  ("su familia completa") sin etiquetar personas. Si se confirma quién es
  quién, se puede ajustar en un minuto.
- **El logo tiene una errata**: la línea dice "El Placer de Sentirse **bién**".
  En español va sin tilde: *bien*. Conviene corregir el archivo original.
- `WA0104` es el clip más débil: la cámara va mirando al suelo casi todo el
  tiempo y medio cuadro es tierra. Se rescató con un encuadre cerrado y
  anclado arriba, pero es el plano más blando del Reel.
- El clip `WA0100` venía con el audio muy caliente (−8,5 LUFS y pico +1,2
  dBFS, o sea saturado en origen). Se usó sólo como ambiente de fondo,
  filtrado y muy por debajo.
