# REEL — Testimonios Promoción 2026
### U.E. Roberto Moreno · Keyword: **PROMOCIÓN** · Destino: WhatsApp

---

## 1. VÍDEO, NO CARRUSEL

Se pidió "lo que sea más estratégico". Es **vídeo**, sin discusión:

Un testimonio vale por la **cara y la voz**. Un carrusel de frases entrecomilladas
es texto que cualquiera pudo escribir; cuatro muchachos hablando a cámara en la
piscina es prueba. Además el Reel tiene mucho más alcance orgánico que el
carrusel, y aquí el objetivo es llegar a padres y delegados de curso que aún no
siguen la cuenta.

El carrusel además era inviable: no hay forma de citar lo que dicen sin
transcripción, y en este entorno no se pudo transcribir (ver §5).

---

## 2. ENTREGABLE

| Archivo | Peso |
|---|---|
| `CASA_CAMPO_Testimonios_Promo2026.mp4` | 23 MB |
| `CASA_CAMPO_Testimonios_portada.jpg` | 96 KB |

**Ficha técnica:** 1080×1920 · H.264 High · 30 fps · **30,5 s** · AAC 192 kbps
· −14,1 LUFS · pico real −2,5 dBFS.

> **El máster no vive en el repo.** Los `.mp4` están en `.gitignore`; se entregan
> por Drive/WhatsApp y se regeneran con los scripts de `build/`.

---

## 3. ESTRUCTURA

**Aquí no hay rejilla musical.** En los otros Reels los cortes caen en el beat;
en este caen en los **silencios reales entre frases**, detectados midiendo
energía en banda de voz. Cortar en rejilla habría partido palabras a la mitad.

| Tiempo | Contenido | Texto |
|---|---|---|
| 0,0 – 2,0 | **Gancho** sobre una cara real | LA PROMOCIÓN 2026 RESPONDE / ¿VALE LA PENA **ALQUILARLO?** |
| 2,0 – 3,8 | Testimonio 1 (`WA0007`) | `PROMOCIÓN 2026` |
| 3,8 – 9,6 | Testimonio 2 (`WA0101`) | `U.E. ROBERTO MORENO` |
| 9,6 – 17,6 | Testimonio 3 (`WA0009`) | `EN CASA & CAMPO` |
| 17,6 – 26,2 | Testimonio 4 (`WA0010`) | `BARINAS` |
| 26,2 – 30,5 | **Cierre** con logo animado | ¿TU PROMOCIÓN ES LA **PRÓXIMA?** · COMENTA: PROMOCIÓN · WhatsApp |

**El gancho plantea la objeción, no la respuesta.** "¿Vale la pena alquilarlo?"
es exactamente lo que se pregunta quien está evaluando el gasto, y deja que
sean ellos quienes contesten. No se les pone nada en boca.

**Orden corto → largo:** abre con el testimonio de 1,8 s para que arranque
rápido y cierra con el de 8,9 s, que es el más extenso y el que mejor se
entiende.

**Encuadre de retrato.** Se cerró el plano sobre las caras (zoom 1,44 anclado
arriba). En un testimonio lo que comunica es la cara, y además mantiene el
foco donde debe estar tratándose de bachilleres en traje de baño.

---

## 4. AUDIO: EL PROBLEMA REAL Y CÓMO SE RESOLVIÓ

Los cuatro clips se grabaron **dentro de la fiesta**, con la música del party
sonando. Medido por bandas, la música estaba **por encima** de la voz:

```
clip   voz/graves ANTES   DESPUÉS   mejora
 1          -2.9 dB       +17.3 dB   +20.2
 2          -8.6 dB        +5.2 dB   +13.8
 3          -2.6 dB       +20.0 dB   +22.7
 4          -8.0 dB        +7.3 dB   +15.3
```

La cadena de rescate corta el bajo del party con dos paso-altos en 180 Hz,
atenúa 250 Hz, realza 1.8 kHz y 3.2 kHz (donde vive la inteligibilidad),
reduce ruido y comprime para levantar lo que quedó bajo.

### Por qué NO hay música bajo los testimonios

Se pidió música de fondo con ducking al 15-20%. **No se puso, a propósito.**

Estos clips ya arrastran la música del party detrás de la voz. Meter una
segunda pista encima —aunque fuera al 15%— habría sumado un **tercer plano
sonoro** y devuelto el testimonio a ser ininteligible, justo lo que costó
20 dB arreglar.

La música original que se compuso suena **sólo donde no habla nadie**: en el
gancho (0–2,1 s) y en el cierre (26,1–30,5 s). No es un ducking en la mezcla:
el arreglo directamente no toca bajo los testimonios. Medición del máster:

```
tramo                mezcla    música
GANCHO               -17.3     -17.1
testimonio 1         -20.2     -67.6
testimonio 2         -19.3    -180.0   (silencio)
testimonio 3         -19.0    -180.0   (silencio)
testimonio 4         -18.9     -97.2
CIERRE               -18.9     -18.5
```

Si aun así se quiere música bajo las voces, que sea **por debajo de −30 dB**
respecto a la voz y filtrada por encima de 4 kHz para no invadir la banda de
inteligibilidad. Recomendación: no hacerlo.

---

## 5. FALTA SUBTITULARLO — Y ES IMPORTANTE

**El Reel sale sin subtítulos y hay que ponérselos antes de publicar.**

No se pudieron generar aquí: la política de red del entorno bloquea la descarga
de modelos de transcripción (HuggingFace y el CDN de OpenAI devuelven 403), y
sin modelo no hay Whisper. Tampoco se puede transcribir de oído.

Esto no es opcional: la mayoría ve Reels en silencio, y un testimonio sin
subtítulos pierde casi todo. **En Edits o CapCut, subtítulos automáticos en
español**: reconocen bien este audio ya rescatado, y son dos minutos.

Al subtitular conviene:
- Estilo Reel: palabra grande, resaltada en color, en la zona baja del cuadro.
- Dejarlos por encima de `y = 1500` para no chocar con los chips de contexto.
- Revisar los nombres propios ("Casa & Campo", "Roberto Moreno").

**Y antes de publicar, revisa el audio tú.** No pude escucharlo: elegí los
cortes midiendo dónde hay voz y dónde hay silencio, no por lo que dicen. El
montaje asume que los testimonios son positivos —es lo razonable, los grabó la
propia casa en su fiesta— pero confírmalo.

---

## 6. COPY

### Caption

```
No lo decimos nosotros. Lo dicen ellos. 🎓

La Promoción 2026 de la U.E. Roberto Moreno alquiló Casa & Campo
para su fiesta de grado. Esto respondieron cuando les preguntamos.

Sin guion, sin libreto, y todavía dentro de la piscina. 🌴

Porque una fiesta de promoción no se juzga por las fotos:
se juzga por cómo la cuentan los que estuvieron.

📍 El Jobal, vía Obispos — a 15 min de la redoma de Barinas
🏊 Piscina privada · áreas verdes · comida llanera
🎧 Espacio para tu DJ, tus luces y tu gente
📅 Agenda 2026 abierta

Si eres delegado de curso, madre de la comisión, o el que
siempre termina organizando todo: esto es lo que te van a decir
tus compañeros el día después.

💾 Guarda este Reel para cuando toque decidir.
🔄 Envíaselo al grupo de la promoción.
💬 Comenta "PROMOCIÓN" y te escribimos por WhatsApp con fechas y lo que incluye.

📲 0424-5541927
```

### Mensaje a fijar (primer comentario)

```
📌 Lo que preguntan los que están cuadrando su promoción:

▪️ "¿Se alquila COMPLETO?" → Sí. Exclusivo, sin público externo.
▪️ "¿Podemos llevar nuestro DJ?" → Sí, y hay espacio y tomas para el montaje.
▪️ "¿Cuántas personas entran?" → Depende del formato; escríbenos y lo cuadramos.
▪️ "¿Hasta qué hora?" → Se conversa según el evento, no hay corte estándar.
▪️ "¿Se puede decorar antes?" → Sí, se coordina el acceso previo.
▪️ "¿Cómo se aparta?" → Con abono, y te queda la fecha bloqueada.

Comenta "PROMOCIÓN" 👇 y te escribimos por WhatsApp
o escribe directo al 0424-5541927
```

### Hashtags

```
#Barinas #BarinasVenezuela #PromocionDeBachilleres #Promocion2026
#Graduacion2026 #FiestaDePromocion #EventosBarinas #QuintasBarinas
#AlquilerParaEventos #Testimonios #ElJobal #Llano
#Bachilleres2026 #EventosPrivados #Barinas2026
```

### Configuración
- **Keyword del embudo:** `PROMOCIÓN` — ya existe, no hace falta automatización nueva.
- **Portada:** `CASA_CAMPO_Testimonios_portada.jpg`.
- **Ubicación:** etiquetar Barinas.
- **Colaboración:** si la promoción o el liceo tienen cuenta, invitarlos como
  colaboradores. En un Reel de testimonios eso multiplica el alcance porque lo
  ven los compañeros y sus familias.

---

## 7. REGENERAR

```bash
python3 build/build_testi_video.py    # 4 testimonios, cortes en los silencios
python3 build/build_testi_placas.py   # gancho + cierre con logo animado
python3 build/build_testi_music.py    # música de marco (sólo gancho y cierre)
bash    build/build_testi_mix.sh      # rescate de voz, mezcla y exportación
```

`build/tp_limit.py` es el limitador de pico real con sobremuestreo 4×.

---

## 8. ANTES DE PUBLICAR

- **Subtitular** (§5). Es lo único que separa este Reel de estar terminado.
- **Revisar el audio** y confirmar que lo que dicen es publicable.
- **Permiso de los que salen.** Son bachilleres recién graduados y salen en
  traje de baño en la cuenta comercial del negocio. Grabaron para la casa en su
  propia fiesta, pero un anuncio público es otra cosa: conviene el visto bueno
  de ellos, y de sus representantes si alguno es menor de edad. Por eso el
  encuadre se cerró sobre las caras.
- **Publicar entre semana por la noche o domingo**, cuando el grupo de la
  promoción está en el teléfono.
