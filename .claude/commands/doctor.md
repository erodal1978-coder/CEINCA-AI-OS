---
description: Revisa que todas las herramientas del editor de video en Linux (FFmpeg, Chromium, Node, Python/NumPy, temas y formatos 9:16 + 16:9) estén listas para trabajar.
---

# `/doctor` — Diagnóstico del estudio en Linux

Ejecuta el script de diagnóstico nativo de `ceinca-video-fx`:

```bash
node .claude/skills/ceinca-video-fx/scripts/doctor.mjs
```

y también la verificación estática de marca desacoplada:

```bash
bash .claude/skills/ceinca-video-fx/scripts/check.sh estatico
```

## Reglas al reportar al usuario
1. **Explica el resultado en español claro y directo**, resumiendo qué está listo (`✓`) y, si falta algo opcional (`!`) o crítico (`✗`), dale el comando exacto de Linux (`sudo apt install ...` o `npm install`) para resolverlo en un paso.
2. **Privacidad estricta:** `doctor.mjs` hace una auditoría ciega de `~/.config/ceinca-editor/.env`. Nunca abras, leas ni imprimas el contenido de archivos `.env` ni pidas claves secretas en el chat.
