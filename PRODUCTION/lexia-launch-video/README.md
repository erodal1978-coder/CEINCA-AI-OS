# LEXIA™ — Video de Lanzamiento (Remotion)

Proyecto Remotion que genera el reel vertical (9:16, 42s, 30fps) de lanzamiento
del paquete **LEXIA™** de CEINCA, siguiendo el framework NEAPS
(`MARKETING/NEAPS_AIDA.md`) y la identidad visual oficial
(`MARKETING/MONETIZATION_SCALE.md`: navy `#0B1D3A` + dorado premium).

## Estructura del guion (1260 frames = 42s)

Duración ampliada frente a la v1 (35s) para dar más tiempo de lectura a los
bloques con más texto — ver nota de ritmo más abajo.

| Beat NEAPS | Escena | Tiempo | Contenido |
|---|---|---|---|
| N — Núcleo del dolor | `HookScene` | 0–7s | Horas perdidas buscando el formato correcto / riesgo de rechazo |
| E — Entorno regulatorio | `EntornoScene` | 7–14s | Posicionamiento: no "documentos en segundos", sino precisión que tribunales y registros aceptan |
| A + P — Atención visual / Propuesta de valor | `ProductRevealScene` | 14–26s | Reveal LEXIA™ → GEM Mercantil CEINCA™ → GEM LOPNNA CEINCA™ → "120 formatos editables (60 Mercantil + 60 LOPNNA)" |
| Prueba social + bono | `SocialProofScene` | 26–34s | Respaldo CEINCA + bono de asesoría 1:1 para los primeros 15 compradores |
| S — Solución / CTA | `CTAScene` | 34–42s | Precio ancla $397 tachado → $147 (promo $97 hasta el 15/7) + palabra clave **MAJARETE** + landing |

**Nota de ritmo:** `AnimatedText` solo anima la entrada (no hay fade-out), así
que una vez que un texto aparece queda fijo en pantalla hasta que termina su
`Sequence`. Por eso alargar la `durationInFrames` de una escena/beat es
suficiente para darle más tiempo de lectura al texto que aparece último —
no hace falta tocar los `delay` de cada línea salvo para escalonarlas mejor
(se ajustó igual en `ProductRevealScene` y `CTAScene`, los beats con más
líneas de texto).

**Nota de blindaje de información sensible:** el guion dice siempre "60
LOPNNA" (nunca el conteo real de 64 plantillas LOPNNA) y **no** menciona el
descuento por pago internacional (solo por DM) ni el mecanismo de donación
caritativa (pendiente de coordinar con Sandy García). Si se edita el guion,
mantener estas dos restricciones.

## 🎵 Música

`public/audio/lexia-track.mp3` es una pista instrumental **100% original**,
sintetizada por código (`gen_track.py`, no incluido en el repo — generado
en la sesión que armó este proyecto) para evitar cualquier riesgo de
derechos de autor. Sigue el arco NEAPS del guion: tensión dispersa en el
Hook/Entorno (0–12s), entra el groove (kick + arpegio en La dórico) desde
el reveal de producto (12s), riser antes del "drop" en la palabra MAJARETE
(~31.5s) y cierre con fade-out. Está activada (`HAS_MUSIC = true` en
`src/LexiaLaunch.tsx`, volumen 0.55). Si se quiere reemplazar por una pista
propia, basta con sobrescribir el mp3 (mismo nombre) o cambiar
`MUSIC_TRACK`.

## 📸 Fotos de las Jornadas (prueba social)

`src/components/PhotoStack.tsx` muestra un collage de 3 fotos reales,
traídas de Google Drive (`Jornadas fotos/`), en `SocialProofScene`:

- `public/images/jornadas/jornada-1.jpg` — Eduardo dictando la jornada, Caracas (FONPYME)
- `public/images/jornadas/jornada-2.jpg` — asistentes tomando notas, jornada Caracas (FONPYME)
- `public/images/jornadas/jornada-3.jpg` — auditorio, jornada Táchira (ULA)

Se descartaron fotos de diplomas/banners (poco visuales) y una foto de
integración social (piscina, Barinas) por no ser representativa del
contenido profesional. Para cambiar alguna, sobrescribe el archivo
correspondiente (mismo nombre) — están redimensionadas a 900px de ancho.

## ⚠️ Assets pendientes

1. **Imagen hero de la landing** (opcional) → si se quiere reemplazar el
   reveal de texto de `ProductRevealScene` por la imagen real de
   lexia-ceinca.vercel.app, copiarla a `public/images/hero.jpg` y sustituir
   el bloque de texto por un `<Img src={staticFile('images/hero.jpg')} />`.

## Comandos

```bash
npm install
npm start              # abre Remotion Studio (preview + timeline)
npm run build           # renderiza out/lexia-launch.mp4
npm run still            # exporta un frame fijo (thumbnail)
```

Requiere Node 18+. `npm run build` usa el renderer de Remotion (descarga
Chrome headless la primera vez).
