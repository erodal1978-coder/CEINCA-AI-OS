# MARKITDOWN/ — nota de vendorización

Este directorio es una copia vendorizada de [`microsoft/markitdown`](https://github.com/microsoft/markitdown),
la librería de Microsoft para convertir documentos (PDF, Office, HTML, imágenes, audio, etc.) a Markdown,
pensada para alimentar pipelines de LLM.

- **Origen:** https://github.com/microsoft/markitdown.git
- **Commit vendorizado:** `945314a45ddbe02935f2fd287b797dc0ba4a01e4` (2026-09-16)
- **Licencia:** MIT (ver `LICENSE` y `packages/markitdown-ocr/LICENSE`)

## Qué se excluyó y por qué

Siguiendo la Política de Assets de `CLAUDE.md` (raíz del repo) — no versionar multimedia pesado en Git —
se excluyeron las carpetas `tests/` de cada paquete. Contienen fixtures de prueba (PDFs escaneados,
audio `.wav`, imágenes, HTML de muestra) que suman ~24MB y no son necesarias para usar la librería,
solo para correr su propio test suite. También se excluyeron `.github/`, `.devcontainer/`,
`Dockerfile`, `.pre-commit-config.yaml` y los archivos `CODE_OF_CONDUCT.md`/`SECURITY.md`/`SUPPORT.md`
(infraestructura de CI/contribución del repo original, sin uso dentro de CEINCA-AI-OS).

Se conservó: código fuente (`packages/*/src`), `README.md` de cada paquete, `pyproject.toml`
(para instalar dependencias), `LICENSE` y `ThirdPartyNotices.md`.

## Uso previsto en CEINCA-AI-OS

Herramienta de conversión documento → Markdown para alimentar auditorías mercantiles y
procesamiento de conocimiento (actas, gacetas, informes en PDF/Office) hacia `KNOWLEDGE/` o
los pipelines de `AGENTS/`. No es un agente ni un skill de Claude Code — es una librería Python
que se instala como dependencia cuando algún workflow la necesite.

Para actualizar esta copia a una versión más reciente del upstream: clonar
`microsoft/markitdown` de nuevo, repetir la misma poda (excluir `tests/` y archivos de CI) y
actualizar el commit y la fecha en esta nota.
