# CEINCA Video Editor Architect para Linux (9:16 Reels + 16:9 YouTube)

Adaptación nativa a **Linux** de las mejores prácticas de `video-editor-architect` (flujo en 3 paradas, memoria de estilo persistente, versionado sin pisar `final-v1`/`v2`, diagnóstico `/doctor` y grabador de demos `/grabar-demo`), conectada **100% a tu motor propio `ceinca-video-fx`** (HTML/GSAP + Chromium + FFmpeg, sin Remotion y con sonoridad oficial a **`-16 LUFS`**).

---

## 1. Qué incluye este paquete

```text
ceinca-editor-linux-pack/
├─ .claude/
│  ├─ commands/
│  │  ├─ editar.md        # /editar — Flujo en 3 paradas (Texto → Dirección → Render -16 LUFS + Reporte X/Y)
│  │  ├─ ajustar.md       # /ajustar — Versiones v2, v3... y aprendizaje permanente en estilos/
│  │  ├─ grabar-demo.md   # /grabar-demo — Grabación de sitios/apps en 9:16 (Reels) y 16:9 (YouTube)
│  │  └─ doctor.md        # /doctor — Diagnóstico completo de dependencias en Linux
│  └─ skills/
│     └─ ceinca-video-fx/ # Skill v1.2.0 actualizada con soporte dual 9:16 y 16:9 + temas @soyeduardo.ia y CEINCA
├─ estilos/
│  ├─ soyeduardo-ia/      # Perfil entrenable de @soyeduardo.ia (#0B0D12 + #C6FF3D, -16 LUFS, 10 reglas)
│  │  ├─ perfil.md
│  │  ├─ perfil.json
│  │  └─ aprendizajes.md
│  └─ ceinca-social/      # Perfil institucional CEINCA (#122A63 + #C8A951, -16 LUFS)
│     ├─ perfil.md
│     ├─ perfil.json
│     └─ aprendizajes.md
└─ INSTALACION_LINUX.md   # Esta guía + prompt de activación rápida
```

---

## 2. Instalación rápida en tu Linux (`CEINCA-AI-OS`)

### Paso 1: Copiar los archivos en la raíz de tu repositorio
Descomprime `ceinca-editor-linux-pack.zip` directamente en la raíz de tu repo `CEINCA-AI-OS`:

```bash
unzip -o ceinca-editor-linux-pack.zip -d /ruta/a/tu/CEINCA-AI-OS
cd /ruta/a/tu/CEINCA-AI-OS
```

*(Si también usas la skill en `claude.ai` web o escritorio, sube el archivo `ceinca-video-fx.zip` en la sección de Skills).*

### Paso 2: Instalar dependencias base en Linux (una sola vez)
En Debian / Ubuntu / Mint / Pop!_OS:

```bash
sudo apt update && sudo apt install -y ffmpeg chromium python3-numpy git
cd .claude/skills/ceinca-video-fx && npm install
```

*(Opcional para transcribir crudos automáticamente sin guion previo):*
```bash
pipx install openai-whisper   # o: pip install faster-whisper
```

### Paso 3: Verificar que todo esté en verde con `/doctor`
```bash
node .claude/skills/ceinca-video-fx/scripts/doctor.mjs
bash .claude/skills/ceinca-video-fx/scripts/check.sh estatico
```

---

## 3. Cómo usar el modo Vertical (`9:16`) y el modo Horizontal YouTube (`16:9`)

### A. En los comandos de Claude Code
1. **`/doctor`** → Revisa tu entorno Linux en 2 segundos.
2. **`/editar`** → Pásale tus escenas de Flow o un video crudo. Te preguntará si vas para **Reels/TikTok (`vertical`, `1080×1920`)** o **YouTube/Curso (`horizontal`, `1920×1080`)**, aplicará las 3 paradas de aprobación y te entregará `salida/final-v1.mp4` validado a **`-16 LUFS`** con su reporte `Cumple X de Y reglas`.
3. **`/ajustar`** → Pide cualquier cambio (*"sube la música 2 dB"*, *"sácame también la versión horizontal 16:9 para YouTube"*, *"recuerda siempre poner la etiqueta por 3 segundos"*). Crea `final-v2.mp4` sin borrar `final-v1.mp4` y guarda la regla en `estilos/<marca>/aprendizajes.md`.
4. **`/grabar-demo`** → Graba cualquier web o app local a 30 fps con cursor animado y protección automática de contraseñas (`input[type="password"]` difuminado), tanto en **vertical (`9:16`)** como en **horizontal (`16:9`)**.

### B. Desde terminal directa (CLI)

```bash
cd .claude/skills/ceinca-video-fx

# 1. Renderizar cualquier efecto en VERTICAL 9:16 (1080x1920) con tu marca @soyeduardo.ia
node scripts/render.mjs examples/diagrama-nodos.json \
  --tema marca-soyeduardo-ia \
  --formato vertical \
  -o out/nodos-reel.mp4

# 2. Renderizar el mismo efecto en HORIZONTAL 16:9 (1920x1080 para YouTube)
node scripts/render.mjs examples/diagrama-nodos.json \
  --tema marca-soyeduardo-ia \
  --formato horizontal \
  -o out/nodos-youtube.mp4

# 3. Aplicar zoom de corte sobre un clip en HORIZONTAL 16:9
node scripts/clip.mjs examples/clip-zoom-corte.json \
  --formato horizontal \
  -o out/clip-yt.mp4

# 4. Grabar una demo web en VERTICAL 9:16 (modo marco o telefono)
node scripts/grabar-demo.mjs \
  --url https://tu-app.com \
  --formato vertical \
  --modo marco \
  --tema marca-soyeduardo-ia \
  --duracion 6 \
  -o out/demo-reel.mp4

# 5. Grabar una demo web en HORIZONTAL 16:9 para YouTube (modo marco o pantalla completa)
node scripts/grabar-demo.mjs \
  --url https://tu-app.com \
  --formato horizontal \
  --modo marco \
  --tema marca-soyeduardo-ia \
  --duracion 8 \
  -o out/demo-youtube.mp4

# 6. Auditar cualquier Reel o Video de YouTube terminado (-16 LUFS + resolución + 30fps)
bash scripts/check.sh reel out/mi-video-final.mp4 vertical
bash scripts/check.sh reel out/mi-video-youtube.mp4 horizontal
```
