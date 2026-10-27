# Perfil de Estilo: `@soyeduardo.ia` (Eduardo Rodríguez — Marca Personal IA)

## 1. Identidad Visual (Regla de Oro: Cero mezcla con CEINCA)
- **Tema en `ceinca-video-fx`:** `marca-soyeduardo-ia`. **Fuente de verdad:** `themes/marcas/soyeduardo-ia.json` (lo genera `sync-brand`) y el manual `02_MANUAL_DE_MARCA.md` («Laboratorio»). Si este perfil y el tema discrepan, manda el tema.
- **Fondo principal (`--fx-bg`):** Tinta `#0B0D12`.
- **Superficies y tarjetas (`--fx-surface` / `--fx-surface-2`):** Grafito `#1A1E27` y `#232834`, con borde `#2A2F3B`.
- **Texto principal (`--fx-text`):** Hueso `#F3F0E8`. Texto secundario (`--fx-text-muted`): Niebla `#8B93A7`.
- **Acento primario (`--fx-accent`):** Lima Señal `#C6FF3D` (texto sobre lima siempre en Tinta `#0B0D12`; el lima no se usa para párrafos).
- **Acento secundario (`--fx-accent-2`):** Lima claro `#DBFF84`. Coral Humano `#FF6B4A` solo para alertas o polémica en forma de pregunta, nunca junto al lima en el mismo bloque. Sin cian ni azul.
- **Tipografías:** `Sora` 800 en titulares (en mayúsculas y minúsculas, no todo en mayúsculas), `Manrope` 400/600/700 en cuerpo y `JetBrains Mono` 400/700 en contadores `1/3`, etiquetas técnicas, comandos y sellos (en minúsculas).
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
- **Primeros 3 segundos (0–3 s):** Etiqueta de nombre `@soyeduardo.ia · Eduardo Rodríguez` + sello `LO HIZO LA IA` cuando el vocero fue generado con Flow/IA.
- **Ritmo visual (cambio cada 3–5 s):** Alternar plano medio con `zoom-corte` (1.16x–1.22x), `zoom-digital` suave, `lupa-zoom`, `foco-spotlight`, `fragmentos-shatter`, layout `split-pip`, tarjetas de cristal/pizarra, capturas reales en `telefono` o `grabar-demo` (`--modo marco`) y efectos de código/motion (`bento-grid`, `barra-prompt`, `carrusel-blur`, `catalogo-lateral`, `diagrama-nodos`, `checklist`, `pasos-progreso`, `consola-macos`).
- **Política de marcas de terceros:** No generar ni dibujar logos oficiales ni mascotas de terceros (ChatGPT, Claude, Gemini); nombrar cada herramienta con etiquetas tipográficas limpias (`JetBrains Mono` + `Manrope`, sin imitar el logotipo ajeno) y mostrar capturas reales de pantalla.
- **Cierre CTB (últimos 3–8 s):** Tarjeta final con palabra clave en mayúsculas (p. ej. `TORNILLO`, `CEREBRO`) visible durante al menos `3.0 s`.

## 4. Estándar de Audio (`-16 LUFS`)
- **Sonoridad integrada:** **`-16.0 LUFS` (± 1.5 LU)**, True Peak `≤ -1.5 dBTP` como objetivo (`check.sh reel` verifica formato, A/V, sonoridad y silencios, y avisa si el pico supera −1,0 dBFS; el LRA no se verifica).
- **Música de fondo:** Pista original de recursos generales a `-22 dB` en pasajes hablados (con *sidechain ducking* bajo la voz) subiendo suavemente en cierres.
- **Efectos de sonido (SFX):** Sincronizados al cuadro exacto en que inicia cada animación visual (`whoosh` en entradas, `pop`/`tick` en contadores `1/3`, `ding` en checks y CTA).
