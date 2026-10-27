# GUION FINAL — Reel A "+20 efectos de video hechos por Claude"
27-10-2026 · @soyeduardo.ia · Toma continua real de Eduardo · ≈30 s · 1080×1920 · 30 fps · −14 LUFS
Plan general: `docs/PLAN_MAESTRO_ÑAPA_27-10-2026.md` (F3). Textos de publicación (caption, fijado, DM): §4.1 del plan.

> Los 21 efectos son el **plan**: cada uno se confirma en F1 (render OK + legible a 1,1 s). Si uno falla, entra una reserva (§6). Si pasan menos de 21, el título deja de decir "+20" y dice la cifra exacta.

---

## 1. Para leer en el teleprompter (copia esto tal cual)
```
Todo esto lo hizo Claude.

Mosaico. Zoom digital. Bento. Lupa. Barra prompt. Foco. Pasos.
Fragmentos. Chat móvil. Zoom corte. Consola. Rompe marco. Nodos.
Corta y pega. Carrusel blur. Zoom atrás. Gráfica. Vértigo.
Karaoke. Collage. Zoom a través.

Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.
```
**Cómo decirlo**
- Una palabra o nombre cada **1,1 s** (≈ 54 pulsos por minuto): ponte un metrónomo a 54 BPM en un oído mientras grabas.
- Nombres **secos y claros**, sin "eeh", sin pausa larga entre ellos; la energía sube un poco en «Zoom a través».
- Antes de «Lo hizo la IA» respira medio segundo (el cierre es más lento y cercano).
- Si no sale perfecto a 1,1 s no pasa nada: el montaje usa **los tiempos reales** de cada palabra (§5), no la tabla.

## 2. Línea de tiempo objetivo
| # | t (s) | Voz | Efecto (id) | Insumo | Qué se ve en el marco derecho |
|---|---|---|---|---|---|
| — | 0,0–1,9 | «Todo esto lo hizo Claude.» | (arranca el #1) | — | Título + sello + lista; el mosaico ya corre |
| 1 | 1,9–3,0 | Mosaico | `muro-videos` | Tu toma (varios inicios) | 20 copias tuyas; zoom a la central |
| 2 | 3,0–4,1 | Zoom digital | `zoom-digital` | Tu toma | Acercamiento continuo al rostro |
| 3 | 4,1–5,2 | Bento | `bento-grid` | Texto/datos | Cuadrícula con contador, anillo y barras |
| 4 | 5,2–6,3 | Lupa | `lupa-zoom` | Tu toma | Lupa que recorre el rostro (×1,8) |
| 5 | 6,3–7,4 | Barra prompt | `barra-prompt` | Texto | Prompt que se escribe y responde |
| 6 | 7,4–8,5 | Foco | `foco-spotlight` | Tu toma | Todo oscuro menos el rostro |
| 7 | 8,5–9,6 | Pasos | `pasos-progreso` | Texto | Barra segmentada + numeral |
| 8 | 9,6–10,7 | Fragmentos | `fragmentos-shatter` | Tu toma | Franjas que encajan en 0,35 s |
| 9 | 10,7–11,8 | Chat móvil | `telefono-chat` | Texto | Teléfono con burbujas |
| 10 | 11,8–12,9 | Zoom corte | `zoom-corte` | Tu toma | Salto instantáneo plano abierto/cerrado |
| 11 | 12,9–14,0 | Consola | `consola-macos` | Texto | Comando que se escribe |
| 12 | 14,0–15,1 | Rompe marco | `rompe-marco` | **Foto tuya recortada (PNG)** | Tú sobresales de la tarjeta |
| 13 | 15,1–16,2 | Nodos | `diagrama-nodos` | Texto | Nodos y pulso que viaja |
| 14 | 16,2–17,3 | Corta y pega | `corta-pega` | **Foto tuya recortada (PNG)** | Sticker stop-motion |
| 15 | 17,3–18,4 | Carrusel blur | `carrusel-blur` | Texto | Tarjetas veloces que frenan |
| 16 | 18,4–19,5 | Zoom atrás | `zoom-atras` | Tu toma | Del plano cerrado al abierto |
| 17 | 19,5–20,6 | Gráfica | `grafica-crece` | Datos de ejemplo | Barras/línea que crecen |
| 18 | 20,6–21,7 | Vértigo | `vertigo-simulado` | Imagen de tu oficina + recorte | Fondo que se estira, tú no |
| 19 | 21,7–22,8 | Karaoke | `subtitulos-karaoke` | Tu toma | Subtítulo palabra por palabra sobre ti |
| 20 | 22,8–23,9 | Collage | `collage-papel` | Texto | Piezas de papel en stop-motion |
| 21 | 23,9–25,0 | Zoom a través | `zoom-atraves` | Texto | Anillos que atraviesan a la escena final |
| — | 25,0–30,0 | «Lo hizo la IA. Lo dirigí yo. Comenta ÑAPA y te regalo la skill.» | (cierre) | Tu toma | Tú al centro, grande, con la píldora lima |
Ritmo: 11 efectos sobre tu cara/foto y 10 escenas de interfaz, alternados (no más de 2 seguidos del mismo tipo).
**Sin datos inventados:** todo texto/dato de las escenas de interfaz es de **ejemplo y se nota** (p. ej. "Ejemplo", cifras redondas claramente ficticias), nunca resultados reales de clientes.

## 3. Pantalla fija (todo el reel)
Zona segura 250 px arriba / 350 px abajo → alto útil **1320 px** (y 250–1570).
- **Arriba (dentro de la zona segura):** título fijo `**+20** efectos de video hechos por Claude` (Sora 800, hueso; "+20" en lima) y el sello lima `LO HIZO LA IA` (JetBrains Mono). Un solo elemento lima por pantalla: el "+20" cede el lima al sello si compiten.
- **Izquierda — la lista:** 21 filas, **62 px cada una** (21 × 62 = 1302), texto **≥ 34 px**, columna x 40–400. Fila activa = píldora hueso con texto tinta; las demás, niebla `#8B93A7`.
- **Derecha — el marco:** 610×1084 px (9:16), esquinas 24 px, centrado en la zona segura. Aquí corre el efecto de cada beat.
- **Fondo:** Tinta `#0B0D12` con rejilla sutil (tema `marca-soyeduardo-ia`).
- **Subtítulos:** solo en el gancho y el cierre (los nombres ya están en la lista), desde el segundo 0, palabra por palabra.
- **0–25 s:** música en cama baja + 1 SFX corto por cambio de efecto.
- **25–30 s (cierre):** la lista desaparece; tú pasas al centro a pantalla grande; a los 25,0 s entra la píldora lima **«Comenta ÑAPA»**; a los 27,5 s aparece debajo, pequeño, «Guarda · Comparte · Comenta» (CTB triple). La voz solo dice "comenta".

## 4. Cómo grabar (checklist)
**Antes**
- [ ] Mismo atuendo y luz que tu foto de perfil. Fondo liso o tu oficina, sin ruido visual.
- [ ] Vertical 9:16, 1080×1920, 30 fps. Encuadre de busto, **cabeza en el tercio superior con aire por encima**, centrado (el marco es estrecho: no te muevas de lado).
- [ ] Micrófono cercano; sin música en la toma. Metrónomo a 54 BPM en un solo oído.
- [ ] Teleprompter con el texto del §1.
**Toma**
- [ ] 3 tomas completas de ≈32 s (aguanta el ritmo; elige la mejor). Empieza con 1 s de silencio y termina con 1 s de silencio.
- [ ] Gestos mínimos en los nombres; el cierre sí lleva mirada directa y media sonrisa.
**Insumos extra (5 minutos)**
- [ ] **2 fotos tuyas, misma ropa, de frente**, para `rompe-marco` y `corta-pega`. Pásalas por un quitafondos y guarda **PNG con fondo transparente** (la skill no recorta personas en video).
- [ ] Imagen de tu oficina (la que ya tienes) para `vertigo-simulado`.
- [ ] Pista de música de Gemini (uso comercial confirmado por ti).

## 5. Montaje (lo hace Claude Code, tras F1)
1. Transcribir la toma y extraer el **inicio y fin real de cada nombre** (Whisper si `doctor.mjs` lo detecta; si no, marcarlo a mano). Esos tiempos mandan sobre la tabla.
2. Efectos sobre tu cara: `node scripts/clip.mjs <json> -o out/<id>.mp4` con `recorte {desde, hasta}` = tiempos reales del nombre.
3. Escenas de interfaz: `node scripts/render.mjs <json> --tema marca-soyeduardo-ia --formato vertical -o out/<id>.mp4`, `duracion` = lo que dure su nombre (≈1,1 s).
4. Componer lista + marco + título + sello (ver F1.6 del plan: si `catalogo-lateral` no admite clip, composición con `ffmpeg overlay`).
5. Subtítulos del gancho y del cierre con `subtitulos-karaoke` vía `overlay.mjs`.
6. Audio: tu voz + música (cama baja) + SFX (`audio.mjs` / `sfx_synth.py`). Normalizar a **−14 LUFS, pico ≤ −1,0 dBTP**.
7. Portada: tu cara + "+20 efectos" + sello; legible a 110 px.

## 6. Reservas y sustituciones
| Si falla… | Entra… | Nota |
|---|---|---|
| Cualquier efecto no legible en 1,1 s | Checklist · Órbita · Titulares · Mundo app · Cámara continua | Se cambia también el nombre hablado y la fila de la lista |
| Rompe marco o Corta y pega (PNG mal recortado) | Checklist · Órbita | Sin recorte limpio no se usa |
| Pantalla verde | **No está en la lista** | Solo si grabas 2 s extra sobre fondo verde; entonces sustituye a Collage |
| Menos de 21 efectos válidos | Título con cifra exacta | Nunca "+20" sin evidencia |

## 7. Criterios de aceptación (medir y mostrar la salida)
- [ ] 1080×1920 · 30 fps · 28–32 s.
- [ ] Subtítulos del gancho desde 0 s · cierre (píldora «Comenta ÑAPA») visible ≥ 4,5 s.
- [ ] LUFS −14 ±1 · pico real ≤ −1,0 dBTP.
- [ ] Texto clave dentro de la zona segura (250/350).
- [ ] Lista legible (≥ 34 px), cada efecto entendible en ≈1,1 s.
- [ ] Cero asterisco o logo de Claude · cero cifras reales inventadas en las escenas.
- [ ] Gancho de respaldo si la retención a 3 s sale baja: «Esto no lo editó nadie. Lo hizo Claude.»
