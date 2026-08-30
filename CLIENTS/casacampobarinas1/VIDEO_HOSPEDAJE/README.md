# VIDEO HOSPEDAJE — Casa & Campo Barinas
### Anuncio de disponibilidad de hospedaje · Keyword: **HOSPEDAJE**

> **Por qué "hospedaje" y no "habitaciones"** (criterio de Alirio): no son
> cuartos separados sino un chalet / cabaña, y el cobro es **por persona, no
> por habitación**. Decir "habitación" hace que la gente pregunte "¿en cuánto
> sale la habitación?" y obliga a desmentir en cada DM. "Hospedaje" evita esa
> fricción desde el primer segundo.

---

## 1. ENTREGABLES

| Archivo | Uso | Peso |
|---|---|---|
| `CASA_CAMPO_Hospedaje_MASTER.mp4` | **Anuncios pagados (Meta Ads)** y publicación directa | 19 MB |
| `CASA_CAMPO_Hospedaje_SIN_MUSICA.mp4` | **Reel orgánico** — para montarle audio de tendencia | 19 MB |
| `CASA_CAMPO_pista_hospedaje_100bpm.mp3` | Pista suelta, reutilizable | 508 KB |
| `CASA_CAMPO_Hospedaje_portada.jpg` | Portada del Reel | 356 KB |

**Ficha técnica:** 1080×1920 · 30 fps · 21,5 s · H.264 High · AAC 192 kbps
· −15,4 LUFS integrado · pico real −0,6 dBFS (sin saturación).

> **Los másteres no viven en el repo.** Git guarda cada versión de cada binario
> para siempre y no se puede borrar después sin reescribir el historial, así que
> los `.mp4` renderizados están en `.gitignore`. Los archivos finales se entregan
> por Drive/WhatsApp y se regeneran exactos con los scripts de `build/` a partir
> de las fuentes en `Videos/Assets/`. Lo que sí se versiona es la receta: scripts,
> tiempos de cada plano y copy.

Dos versiones por la misma razón que el promo de promociones: Meta no admite
audio con licencia en anuncios pagados, así que el MASTER lleva música propia
y la versión SIN_MUSICA queda lista para audio de tendencia en orgánico.

**Talento:** Daniela Deximar León ([@daniela_deximar](https://instagram.com/daniela_deximar))
— Reina de la Cultura y el Turismo 2025. Acreditada en pantalla en el plano de cierre.

---

## 2. ESTRUCTURA

Rejilla musical de **100 BPM** (negra 0,6 s · compás 2,4 s). Cada corte cae en
tiempo, así que cualquier pista de ~100 BPM sincroniza.

| Tiempo | Contenido | Texto en pantalla |
|---|---|---|
| 0,0 – 2,4 | Piscina de día, descanso en camastro | YA NO TE / TIENES QUE IR |
| 2,4 – 4,8 | Cabaña, cama | **HOSPEDAJE** / DISPONIBLE |
| 4,8 – 6,6 | Balcón sobre la piscina (Daniela) | `VISTA A LA PISCINA` |
| 6,6 – 8,4 | Smart TV + split de aire | `AIRE ACONDICIONADO · SMART TV · WIFI` |
| 8,4 – 10,2 | Bata con logo sobre pared de mármol | `BATAS Y TOALLAS DE LA CASA` |
| 10,2 – 12,0 | Toalla bordada sobre la cama | — |
| 12,0 – 13,8 | Cocina | `COCINA EQUIPADA` |
| 13,8 – 16,2 | Cabaña, cama y bata | TE ACUESTAS AQUÍ |
| 16,2 – 18,6 | Bata + café frente a las piscinas (Daniela) | Y AMANECES / AQUÍ + crédito a @daniela_deximar |
| 18,1 – 21,5 | Placa de marca | CASA & CAMPO · COMENTA: HOSPEDAJE |

**Lógica del guion:** el argumento no es "tenemos cuartos", es **quitar la
fricción de irse**. Quien viene a Casa & Campo se va manejando de noche a 15
minutos de Barinas; el hospedaje elimina eso. Abre con el descanso ("ya no te
tienes que ir"), muestra el producto en el medio, y cierra con el beneficio
real: te acuestas ahí y amaneces frente a la piscina, en bata y con café.

**"Vista a la piscina", no "al verde"** (criterio de Alirio): al salir al
balcón lo primero que se ve son las piscinas. La foto del balcón lo demuestra,
y sustituyó a un plano del ventanal de la cabaña que sólo mostraba árboles.

---

## 3. TRATAMIENTO TÉCNICO

- Metraje grabado a pulso: **estabilizado con vidstab en dos pasadas**
  (`vidstabdetect` → `vidstabtransform` con `optzoom`), sin bordes negros.
- Transiciones **xfade reales** (fundido, smoothleft, wipeup, smoothright,
  wipedown). Cada plano se renderiza con media transición extra a cada lado
  para que el centro del fundido caiga exacto en el tiempo musical.
- Grade cálido y luminoso, distinto al neón del promo de fiesta: son dos
  productos distintos y deben verse distintos.
- Audio: pista original tropical/chill (Fa mayor, 100 BPM, marimba, bajo,
  palmas, pad y contramelodía de steel drum) + whooshes suaves en cada corte
  y chimes en los textos clave.

---

## 4. COPY PARA INSTAGRAM

### Caption

```
Ya no te tienes que ir. 🌙

Casa & Campo ahora tiene HOSPEDAJE.

Eso cambia todo:
❌ Antes: se acababa el día y te tocaba manejar de vuelta.
✅ Ahora: te quedas, duermes ahí, y amaneces frente a la piscina.

No es un cuarto suelto: es una cabaña con todo adentro.
🛏️ Cama con lencería y toallas de la casa
🧖 Batas Casa & Campo
❄️ Aire acondicionado
📺 Smart TV
📶 WiFi
🍳 Cocina equipada
🌴 Balcón con vista directa a la piscina

Ideal para:
· Escapada de fin de semana
· Familias y grupos que vienen de lejos
· Quien alquiló para un evento y no quiere manejar de noche
· Descanso de verdad, a 15 minutos de Barinas

📌 El hospedaje se cobra POR PERSONA, no por habitación.
Escríbenos con cuántos vienen y te pasamos el monto exacto.

Disponibilidad abierta desde ya. 📅

💾 Guarda este Reel para cuando quieras desconectarte.
🔄 Etiqueta a quien siempre dice "necesito salir de la ciudad".
💬 Comenta "HOSPEDAJE" y te paso disponibilidad y tarifas.

📸 Con @daniela_deximar — Reina de la Cultura y el Turismo 2025 👑

📲 0424-5541927
```

> Etiquetar a @daniela_deximar también en el Reel (no sólo en el caption):
> multiplica el alcance sin costo alguno.

### Mensaje a fijar (primer comentario)

```
📌 HOSPEDAJE EN CASA & CAMPO — lo que más nos preguntan:

▪️ "¿Cuánto sale la habitación?" → No se cobra por habitación.
   Es por persona, porque es una cabaña completa. Dinos cuántos vienen.
▪️ "¿Se puede solo dormir, sin evento?" → Sí, el hospedaje va aparte.
▪️ "¿Puedo usar la piscina si me quedo?" → Sí, es parte de la estadía.
▪️ "¿Tiene aire?" → Sí, aire acondicionado en la cabaña.
▪️ "¿Se puede cocinar?" → Sí, hay cocina equipada.
▪️ "¿Cómo reservo?" → Se aparta con abono y te queda la fecha bloqueada.

Comenta "HOSPEDAJE" 👇 y te llega todo por DM
o escribe al 0424-5541927
```

### Hashtags

```
#Barinas #BarinasVenezuela #HospedajeBarinas #PosadaBarinas
#DondeDormirEnBarinas #EscapadaDeFinDeSemana #TurismoBarinas
#CabañasVenezuela #PiscinaBarinas #Llano #ElJobal
#DescansoEnFamilia #TurismoInterno #ReinaDelTurismo #Barinas2026
```

---

## 5. AUTOMATIZACIÓN META

**TRIGGER:** Comentario contiene "hospedaje"
**COINCIDENCIA:** Contiene (no exacta). Añadir también como disparadores
`hospedaje`, `hospedage` (error común) y `cabaña`/`cabana`.

**RESPUESTA PÚBLICA:**
```
🙌 ¡[Nombre]! Gracias por escribirnos 💪
Ya te envié la info del hospedaje por mensaje directo 📩
👉 Revisa tu bandeja de Instagram.
Si no lo ves, busca en "Solicitudes de mensajes".
Síguenos para ver la disponibilidad al día 🚀
```

**DM AUTOMÁTICO:**
```
¡Hola! 👋 Gracias por tu interés en el hospedaje de Casa & Campo.

No alquilamos habitaciones sueltas: es una cabaña completa,
y el hospedaje se cobra POR PERSONA.

Lo que incluye:
🛏️ Cama con lencería y toallas de la casa
🧖 Batas Casa & Campo
❄️ Aire acondicionado
📺 Smart TV
📶 WiFi
🍳 Cocina equipada
🏊 Acceso a la piscina y áreas verdes
🌴 Balcón con vista a la piscina

📍 El Jobal, vía Obispos — a 15 min de la redoma industrial

Para pasarte el monto exacto y la disponibilidad, cuéntanos:
1️⃣ ¿Para qué fecha la necesitas?
2️⃣ ¿Cuántas personas se quedan?
3️⃣ ¿Es solo hospedaje o vienen a un evento también?

Casa & Campo Barinas 📲
0424-5541927
```

> **Importante:** los DM de las keywords viejas (CHAPUZÓN, HAMACA, COROCORO)
> dicen "10am a 7pm". Ese horario contradice una oferta de hospedaje, así que
> **HOSPEDAJE necesita su propia automatización** — no reutilizar ninguna de
> esas. Este bloque está listo para copiar y pegar.

---

## 6. REGENERAR

```bash
python3 build/build_hab_video.py     # 9 planos, estabilización y texto
bash    build/build_hab_endcard.sh   # placa de marca
python3 build/build_hab_music.py     # música original + efectos
bash    build/build_hab_mix.sh       # montaje, mezcla y exportación
```

`build/tp_limit.py` (compartido con el otro vídeo) es el limitador de pico real
con sobremuestreo 4×. Hace falta porque `alimiter` de ffmpeg sólo mide picos de
muestra y además renormaliza a 0 dBFS por defecto.

Los tiempos de cada plano viven en la lista `SHOTS` de `build_hab_video.py`.

---

## 7. NOTAS Y LIMITACIONES

- **WiFi confirmado por el cliente**: la mención en pantalla y en el copy es
  correcta.
- **El título de Daniela se corrigió**: se había puesto "Reina del Turismo de
  Barinas" y su bio dice "Reina de la Cultura y el Turismo 2025". En pantalla
  va ahora el de su bio. Si el cargo oficial fuese otro, avisar.
- **Se descartó la habitación de lencería de corazones.** Lee como motel y
  choca con el público de graduaciones y cumpleaños infantiles.
- **Se descartó el plano de la sala de estar**: en el metraje la cámara apunta
  al techo inclinado y la mesa queda siempre en el borde inferior del cuadro.
  No hay encuadre rescatable. Si se regraba ese rincón a la altura de la mesa,
  entra sin tocar nada más.
- **Sigue faltando el baño.** Es la primera pregunta de quien va a dormir fuera
  y no hay ni una toma.
- **Calidad de origen:** los 7 vídeos llegaron a 360×640 por WhatsApp y hubo
  que ampliarlos 4,5×. Las dos fotos con Daniela son lo mejor del material y
  por eso sostienen el plano del balcón y el cierre.
- La cocina es el plano más débil: está ordenada pero el azulejo y la
  iluminación no acompañan. Se mantiene porque "cocina equipada" es un
  argumento real para estadías de varios días.
