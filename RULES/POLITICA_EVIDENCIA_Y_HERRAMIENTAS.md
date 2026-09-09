# POLÍTICA DE EVIDENCIA Y ADOPCIÓN DE HERRAMIENTAS

Regla transversal para todo el repositorio (código, contenido, decisiones técnicas). No sustituye a `RULES/ANTI_HALLUCINATION.md`, que sigue siendo la fuente específica para razonamiento legal/SAREN.

## Jerarquía de evidencia

Ante cualquier afirmación técnica o de hecho, en este orden:

1. Evidencia verificable en este repositorio (código real, tests, `handoff.md`).
2. Documentación oficial de la herramienta/API en cuestión.
3. Documentación oficial de la plataforma/proveedor.
4. Fuente secundaria confiable.
5. Conocimiento general del modelo.
6. Inferencia.

Nunca invertir este orden — no usar conocimiento general o inferencia cuando 1-4 están disponibles y son verificables.

## Regla de incertidumbre

Si no hay evidencia suficiente, la salida válida es **"NO CONFIRMADO"**, no una suposición presentada como hecho ("probablemente funciona", "la documentación dice..." sin haberla comprobado).

## Matriz anti-humo (antes de adoptar cualquier herramienta o dependencia nueva)

| Pregunta | Respuesta requerida |
|---|---|
| ¿La fuente es oficial? | Sí/No |
| ¿Tiene documentación? | Sí/No |
| ¿Hay repositorio? | Sí/No |
| ¿La licencia está clara? | Sí/No |
| ¿Es realmente gratis? | Sí/No |
| ¿Usa API de pago? | Sí/No |
| ¿Requiere GPU? | Sí/No |
| ¿Requiere cuenta? | Sí/No |
| ¿Entrega credenciales a terceros? | Sí/No |
| ¿Está activo/mantenido? | Sí/No |
| ¿Fecha de última actualización? | Fecha |
| ¿Se puede reproducir el resultado localmente? | Sí/No |

Si no se puede responder la mayoría de estas preguntas, la herramienta no debe convertirse en dependencia crítica del sistema.

## Origen

Adaptado de la sección 6 (Sistema anti-alucinación), sección 48 (Matriz anti-humo) y sección 61 (Política de evidencia) de `GUIA_MAESTRA_IA_GITHUB_CLAUDE_CODE_VIDEO_CEINCA.md` (`CEINCA-WORKSPACE/`, 08-09-2026), incorporadas tras verificación cruzada contra el estado real de este repositorio — ver `handoff.md` (sesión 08-09-2026) para el análisis completo de qué se adoptó y qué se rechazó de ese documento.
