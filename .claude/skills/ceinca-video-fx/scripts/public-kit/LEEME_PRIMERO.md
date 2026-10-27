# Video FX — plantilla de efectos de video con IA

Una **skill para Claude** que genera efectos de video por código (HTML + GSAP → MP4) y procesa tus clips con FFmpeg. Es una plantilla: **no trae ninguna marca**; la adaptas a la tuya.

## Qué incluye
- **27 plantillas de efectos** en `video-fx/effects/` (25 de reel y 2 slides de carrusel): titulares, checklist, gráficas, teléfono y chat, consola, diagrama de nodos, bento, barra de prompt, carrusel con desenfoque, catálogo lateral, collage, órbita, rompe-marco, corta y pega, subtítulos karaoke, etc.
- **7 efectos sobre tu propio clip** (FFmpeg): zoom digital, zoom de corte, zoom hacia atrás, lupa, foco, fragmentos y pantalla verde.
- Formatos **9:16** (Reels/TikTok), **16:9** (YouTube) y **carrusel 4:5**. Seis efectos son solo verticales (ver `SKILL.md`).
- Composición sobre video (`overlay.mjs`, incluido `--layout split-pip`), reels con voz grabada (`reel-voz.mjs`), música y efectos de sonido por código, y validadores (`check.sh`, `doctor.mjs`).
- Tres estilos de ejemplo (Dark Tech, Red Glow, Ukiyo-e) y una **plantilla de marca** (`video-fx/themes/marcas/mi-marca.json`).

## Cómo se instala
**En Claude Code**
1. Copia la carpeta `claude-code/video-fx/` a `.claude/skills/video-fx/` de tu proyecto.
2. Abre Claude Code en ese proyecto y pídele: *«Lee `.claude/skills/video-fx/SKILL.md` y corre el diagnóstico»*.
3. Si te falta algo, el diagnóstico te lo dice.

**En claude.ai**
1. Sube `claude-ai/video-fx.zip` como skill.
2. Dentro del chat se puede generar y validar el `params.json`; para renderizar necesitas Node, FFmpeg y Chromium (si el entorno no los tiene, renderiza en Claude Code).

## Requisitos
Claude con Claude Code, **Node 22 o superior**, **FFmpeg** y **Chromium/Chrome**. Para el recorte de cara en `reel-voz` hace falta además `pip install opencv-python-headless`. Cada comando que usa `npm install` descarga las dependencias la primera vez.

## Cómo ponerle tu marca
Abre `PROMPT_ADAPTAR_MARCA.md`, rellena tus datos y pégaselo a Claude Code. O hazlo a mano: edita `video-fx/themes/marcas/mi-marca.json` (colores y tipografías) y corre `npm run sync-brand` dentro de `video-fx/`; luego usa `--tema marca-mi-marca`.

## Primer render
```bash
cd video-fx && npm install
node scripts/render.mjs examples/portada.json -o out/portada.mp4
bash scripts/check.sh video out/portada.mp4 4
```

## Importante
- Esto es una plantilla técnica. Revísala antes de publicar o redistribuir y usa solo contenido, logos y tipografías que tengas derecho a usar.
- **GSAP no viene incluido**: se instala con `npm install` desde su paquete oficial (licencia «Standard no charge» de GreenSock: https://gsap.com/standard-license; léela antes de usarlo o redistribuirlo). Sí vienen las licencias de las tipografías OFL (`video-fx/vendor/fonts/*.LICENSE`) y la del modelo de detección facial YuNet, MIT (`video-fx/vendor/modelos/LICENSE-yunet.md`).
- Los videos de prueba y tu `node_modules` no vienen en el paquete: se generan con `npm run assets` y `npm install`.
