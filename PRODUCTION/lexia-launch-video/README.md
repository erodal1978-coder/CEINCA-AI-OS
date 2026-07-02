# LEXIA™ — Video de Lanzamiento (Remotion)

Proyecto Remotion que genera el reel vertical (9:16, 35s, 30fps) de lanzamiento
del paquete **LEXIA™** de CEINCA, siguiendo el framework NEAPS
(`MARKETING/NEAPS_AIDA.md`) y la identidad visual oficial
(`MARKETING/MONETIZATION_SCALE.md`: navy `#0B1D3A` + dorado premium).

## Estructura del guion (1050 frames = 35s)

| Beat NEAPS | Escena | Tiempo | Contenido |
|---|---|---|---|
| N — Núcleo del dolor | `HookScene` | 0–6s | Horas perdidas buscando el formato correcto / riesgo de rechazo |
| E — Entorno regulatorio | `EntornoScene` | 6–12s | Posicionamiento: no "documentos en segundos", sino precisión que tribunales y registros aceptan |
| A + P — Atención visual / Propuesta de valor | `ProductRevealScene` | 12–21s | Reveal LEXIA™ → GEM Mercantil CEINCA™ → GEM LOPNNA CEINCA™ → "+60 formatos editables" |
| Prueba social + bono | `SocialProofScene` | 21–28s | Respaldo CEINCA + bono de asesoría 1:1 para los primeros 15 compradores |
| S — Solución / CTA | `CTAScene` | 28–35s | Precio ancla $397 tachado → $147 (promo $97) + palabra clave **MAJARETE** + landing |

**Nota de blindaje de información sensible:** el guion dice siempre "+60
formatos" (nunca el conteo real de 64 plantillas LOPNNA) y **no** menciona el
descuento por pago internacional (solo por DM) ni el mecanismo de donación
caritativa (pendiente de coordinar con Sandy García). Si se edita el guion,
mantener estas dos restricciones.

## ⚠️ Assets pendientes (no incluidos en este entorno)

Esta sesión corrió en un entorno remoto/sandbox sin acceso al sistema de
archivos local de Linux Mint, así que **no pudo leer** la imagen hero ya
procesada, las fotos de la carpeta "Jornadas" ni la pista de música
mencionadas. El proyecto está armado para funcionar sin ellas (usa gráficos
CSS en vez de la imagen hero, y avatares dorados de relleno en vez de fotos
reales) y para recogerlas automáticamente en cuanto existan:

1. **Fotos "Jornadas" (prueba social)** → copiar a:
   `public/images/jornadas/1.jpg` … `5.jpg`
   (`src/components/AvatarCluster.tsx` las detecta solas; si el archivo no
   existe, se muestra un avatar dorado de relleno sin romper el render).
2. **Pista de música** → copiar a `public/audio/lexia-track.mp3` y luego
   cambiar `HAS_MUSIC = false` a `true` en `src/LexiaLaunch.tsx` (el
   renderizador de Remotion falla si el `<Audio>` apunta a un archivo
   inexistente, por eso se controla con esta bandera y no con detección
   automática).
3. **Imagen hero de la landing** (opcional) → si se quiere reemplazar el
   reveal de `ProductRevealScene` por la imagen real, copiarla a
   `public/images/hero.jpg` y sustituir el bloque de texto por un
   `<Img src={staticFile('images/hero.jpg')} />`.

## Comandos

```bash
npm install
npm start              # abre Remotion Studio (preview + timeline)
npm run build           # renderiza out/lexia-launch.mp4
npm run still            # exporta un frame fijo (thumbnail)
```

Requiere Node 18+. `npm run build` usa el renderer de Remotion (descarga
Chrome headless la primera vez).
