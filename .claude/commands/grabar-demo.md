---
description: Graba una demostración determinista de una página web o app en formato vertical (9:16 Reels) u horizontal (16:9 YouTube) con protección automática de contraseñas.
---

# `/grabar-demo` — Grabador de pantalla y demos web (9:16 Vertical y 16:9 Horizontal)

Graba una página web o aplicación local en Linux a 30 fps constantes usando `.claude/skills/ceinca-video-fx/scripts/grabar-demo.mjs`, lista para usar como video completo o como B-roll dentro de `/editar`.

## 1. Pregunta solo lo indispensable (si no lo especificó)
- **URL o ruta local** que vamos a mostrar.
- **Formato de salida:**
  - `vertical` (`1080×1920`, 9:16 para Reels, TikTok y Shorts)
  - `horizontal` (`1920×1080`, 16:9 Full HD para YouTube, cursos, tutoriales y webinars)
- **Modo de encuadre (`--modo`):**
  - `marco` *(recomendado)*: ventana de navegador limpia con barra superior y semáforo sobre el fondo del tema (`marca-soyeduardo-ia` o `ceinca-social`).
  - `pantalla`: captura a pantalla completa (`1080×1920` o `1920×1080`).
  - `telefono`: captura móvil dentro de un mockup centrada en el lienzo.

## 2. Candados de seguridad innegociables
- **Prohibido pedir, leer o escribir contraseñas, tokens o llaves de `.env`.**
- Si la página requiere iniciar sesión en una cuenta privada del usuario, indícale cómo abrir una sesión previa o grabar sobre una vista pública/demo, nunca recibas credenciales en el chat.
- `grabar-demo.mjs` difumina automáticamente cualquier campo `input[type="password"]` o `[data-secret]`.

## 3. Ejecución y verificación
Ejecuta el grabador según el formato elegido:

```bash
# Ejemplo en formato vertical (9:16 Reels/TikTok)
node .claude/skills/ceinca-video-fx/scripts/grabar-demo.mjs \
  --url "<URL_O_HTML>" \
  --formato vertical \
  --modo marco \
  --tema marca-soyeduardo-ia \
  --duracion 6 \
  -o proyectos/demos/demo-vertical.mp4

# Ejemplo en formato horizontal (16:9 YouTube)
node .claude/skills/ceinca-video-fx/scripts/grabar-demo.mjs \
  --url "<URL_O_HTML>" \
  --formato horizontal \
  --modo marco \
  --tema marca-soyeduardo-ia \
  --duracion 8 \
  -o proyectos/demos/demo-horizontal-yt.mp4
```

También puedes crear un archivo JSON de acciones deterministas (`scroll` suave y `acciones: [{ "tipo": "clic", "t": 2.4, "x": 540, "y": 620 }]`) para que el cursor lima haga clic con onda expansiva en el segundo exacto.
Al terminar, verifica el MP4 con `bash .claude/skills/ceinca-video-fx/scripts/check.sh video <salida.mp4> <duracion>` y entrega la ruta al usuario.
