# Perfil de Estilo: `@soyeduardo.ia` (Eduardo González — Marca Personal IA)

## 1. Identidad Visual (Regla de Oro: Cero mezcla con CEINCA)
- **Tema en `ceinca-video-fx`:** `marca-soyeduardo-ia` (o alias `cliente-eduardo-ia`).
- **Fondo principal (`--fx-bg`):** Negro tinta `#0B0F17`.
- **Superficies y tarjetas (`--fx-surface` / `--fx-surface-2`):** Azul pizarra oscuro `#131B2E` y `#1C2742` con borde `#1E293B`.
- **Texto principal (`--fx-text`):** Blanco hielo `#F8FAFC`. Texto secundario: `#94A3B8`.
- **Acento primario (`--fx-accent`):** Lima eléctrico `#C6FF3D` (texto sobre lima siempre en `#0B0F17`).
- **Acento secundario (`--fx-accent-2`):** Cian técnico `#38BDF8`.
- **Tipografías:** `Manrope` (700/800 en titulares, 400/600 en cuerpo) + `JetBrains Mono` (400/700 en contadores `1/3`, etiquetas técnicas, comandos y sellos).
- **Regla del único elemento lima:** Máximo **1 elemento en lima eléctrico (`#C6FF3D`)** simultáneo en pantalla (por ejemplo: la palabra activa del subtítulo karaoke, o el borde/check activo, nunca varios compitiendo).

## 2. Formatos Soportados (Vertical 9:16 y Horizontal 16:9)
- **Modo Vertical (`--formato vertical` · Reels / TikTok / Shorts):**
  - Resolución: `1080×1920`, `30 fps`, `H.264`, `yuv420p`.
  - Zona segura obligatoria: `250 px` arriba y `350 px` abajo libres de texto fijo o subtítulos.
- **Modo Horizontal (`--formato horizontal` · YouTube / Cursos / Demos):**
  - Resolución: `1920×1080`, `30 fps`, `H.264`, `yuv420p`.
  - Zona segura obligatoria: `80 px` arriba y `90 px` abajo.

## 3. Estructura y Ritmo de Edición
- **Voz y trato:** Español con acento venezolano cercano, seguro y práctico. Trato estricto en **singular y de tú** ("Te muestro", "Comenta CEREBRO y te envío..."). Prohibido hablar en plural ("les muestro", "comenten").
- **Subtítulos desde 0.0 s:** Siempre activos desde el primer cuadro, máximo 2 líneas en pantalla, resaltando la palabra clave en lima `#C6FF3D`.
- **Primeros 3 segundos (0–3 s):** Etiqueta de nombre `@soyeduardo.ia · Eduardo González` + sello `LO HIZO LA IA` cuando el vocero fue generado con Flow/IA.
- **Ritmo visual (cambio cada 3–5 s):** Alternar plano medio con `zoom-corte` (1.16x–1.22x), `zoom-digital` suave, `lupa-zoom`, `foco-spotlight`, `fragmentos-shatter`, layout `split-pip`, tarjetas de cristal/pizarra, capturas reales en `telefono` o `grabar-demo` (`--modo marco`) y efectos de código/motion (`bento-grid`, `barra-prompt`, `carrusel-blur`, `catalogo-lateral`, `diagrama-nodos`, `checklist`, `pasos-progreso`, `consola-macos`).
- **Política de marcas de terceros:** No generar ni dibujar logos oficiales ni mascotas de terceros (ChatGPT, Claude, Gemini); nombrar cada herramienta con etiquetas tipográficas limpias (`JetBrains Mono` + `Manrope`) y mostrar capturas reales de pantalla.
- **Cierre CTB (últimos 3–8 s):** Tarjeta final con palabra clave en mayúsculas (p. ej. `TORNILLO`, `CEREBRO`) visible durante al menos `3.0 s`.

## 4. Estándar de Audio (`-16 LUFS`)
- **Sonoridad integrada:** **`-16.0 LUFS` (± 1.5 LU)**, True Peak `≤ -1.5 dBTP`, LRA `≈ 11 LU` (verificado con `bash scripts/check.sh reel`).
- **Música de fondo:** Pista original de recursos generales a `-22 dB` en pasajes hablados (con *sidechain ducking* bajo la voz) subiendo suavemente en cierres.
- **Efectos de sonido (SFX):** Sincronizados al cuadro exacto en que inicia cada animación visual (`whoosh` en entradas, `pop`/`tick` en contadores `1/3`, `ding` en checks y CTA).
