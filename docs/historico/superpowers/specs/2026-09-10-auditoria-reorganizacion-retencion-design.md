# Auditoría, reconciliación y política de retención — CEINCA-AI-OS y CEINCA-WORKSPACE

**Fecha:** 2026-09-10
**Alcance confirmado:** `/home/eduardo/CEINCA-AI-OS` (2.5G) y `/home/eduardo/CEINCA-WORKSPACE` (2.1G). No incluye otros repos (`webcam-app`, `OpenMontage`, `mi-web-3d`) ni el backup `CEINCA-AI-OS-git-backup.tar.gz` (410M, vive en `/home/eduardo` directamente) — mencionado abajo pero fuera del alcance salvo que Eduardo lo incluya explícitamente.

## Contexto

Auditoría solicitada por Eduardo: sospecha de contenido disperso/mal ubicado entre los dos árboles, y necesidad de liberar espacio eliminando material de tareas ya cerradas (video, broll, audio, imágenes, posts) sin perder documentos legales/de cliente, que deben quedar organizados y respaldados por un tiempo antes de archivar.

Escaneo real ejecutado esta sesión (`du`/`find`, solo lectura) — hallazgos verificados, no supuestos.

## Decisiones tomadas

1. **Retención**: 90 días desde que una tarea/cliente se marca cerrada en el sistema de pendientes (ver spec hermano `2026-09-10-workflow-tareas-agy-notion-design.md`) antes de mover a `_archivo/AAAA-MM-DD/`; otro periodo igual antes de subir a Google Drive y borrar la copia local.
2. **Destino de respaldo en la nube**: Google Drive (ya conectado vía MCP en esta sesión, sin configuración nueva).
3. **Documentos legales/PII de cliente**: misma regla de tiempo, pero el respaldo en Drive queda siempre en una carpeta privada — nunca se sube a un espacio compartido/público ni a Notion.
4. **Reusar el patrón ya existente** `CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/AAAA-MM-DD/` en vez de crear una convención nueva.
5. **Caché de build/dependencias no entra en la política de retención** — se borra de inmediato, es 100% regenerable y ya está gitignoreada; no es "contenido" en el sentido que preocupa a Eduardo.

## Hallazgos y acción por categoría

### A. Basura regenerable — borrar ya, sin retención (~2.85G)

| Ruta | Tamaño | Causa | Acción |
|---|---|---|---|
| `CEINCA-AI-OS/CLIENTS/casacampobarinas1/site/node_modules` + `.next` | 1.1G | Caché de build Next.js, gitignoreada | `rm -rf`, se regenera con `npm install`/`next build` cuando haga falta tocar el sitio |
| `CEINCA-AI-OS/WEBKIT/site` (node_modules incluido) | 858M | Mismo patrón, herramienta WEBKIT | `rm -rf` |
| `CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/video/node_modules` + `.cache` | ~900M | Proyecto Next.js/Remotion abandonado (incluye `chrome-headless-shell` 209M) | Antes de borrar: 1 revisión rápida del código fuente (no `node_modules`) de esa carpeta para confirmar que no tiene nada que `CLIENTS/casacampobarinas1/` no tenga ya. Si confirmado, `rm -rf` de toda la carpeta `video/`, no solo el caché. |
| `CEINCA-WORKSPACE/Antigravity.tar.gz` | 164M | Instalador suelto en la raíz, redescargable | ~~Borrar~~ **hecho** (10-09-2026, autorización explícita de Eduardo) |

### B. Seguridad — acción inmediata, no espera de retención

| Ruta | Problema | Acción |
|---|---|---|
| `CEINCA-WORKSPACE/CEINCA/recovery-codes.txt` | Códigos de recuperación en texto plano, sin protección | Mover a un gestor de contraseñas o almacenamiento cifrado; nunca a Drive/Notion en texto plano |
| `CEINCA-AI-OS/ig-viral-tracker/backend/.env` + `.env.save` | Secretos huérfanos de un proyecto ya eliminado del repo (PR #16), pero la carpeta (32K) sigue en disco | Confirmar si las credenciales siguen activas (rotar si sí) y borrar la carpeta completa |

### C. Reconciliar antes de archivar (estructura, no solo espacio)

- **Casa & Campo Barinas duplicado en 3 sitios**: repo real/deployado (`CEINCA-AI-OS/CLIENTS/casacampobarinas1/`), carpeta vieja (`CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/`, tras limpiar su `node_modules` quedan videos/png sueltos + `material-julio`), y salidas sueltas (`CEINCA-WORKSPACE/generados/casa_campo_promo*.mp4`). Acción: revisar si la carpeta vieja tiene algún activo fuente (video/foto) que no exista ya en el repo — si sí, moverlo a `CLIENTS/casacampobarinas1/` como material fuente; el resto se archiva.
- **`CEINCA-WORKSPACE/06 TECNOLOGIA/LEXIA LANDING/`**: tiene su propio `.git` y `.vercel` anidados — un tercer lugar para LEXIA además de `CEINCA-AI-OS/PRODUCTION/lexia-launch-video/`. LEXIA ya está deprioritizada (handoff CEINCA-AI-OS). Acción: confirmar con `vercel ls`/dashboard si el deployment sigue activo; si no aporta nada vivo, archivar la carpeta completa.
- **Contenido personal en la raíz de `CEINCA-WORKSPACE`**: `curso claude/`, `claude-nuevos-tutoriales/`, `muestra-gems/`, `prompts/` — no es material de negocio CEINCA. Acción: mover a una ubicación personal fuera de este workspace (ej. `Documentos/`), o confirmar con Eduardo si deben quedarse.

### D. Contenido real de tareas cerradas — aplica retención 90 días → Drive (~1.1-1.2G)

| Ruta | Tamaño | Estado |
|---|---|---|
| `CEINCA-AI-OS/assets/testimonial-janet-marquez/` | 202M | ~~Reel final ya entregado — cerrado~~ **borrado directo (10-09-2026), sin pasar por retención/Drive — autorización explícita de Eduardo** |
| `CEINCA-WORKSPACE/CEINCA/LEXIA/` | 227M | Campaña deprioritizada — cerrado |
| `CEINCA-WORKSPACE/CEINCA/videos/` | 478M | Verificar contenido — probablemente cerrado, no auditado archivo por archivo |
| `CEINCA-WORKSPACE/generados/` | 25M | Carousels + promos ya publicados |
| `CEINCA-AI-OS/media-mvp/output/` | 227M | **Sin clasificar**: confirmar si es salida de pruebas del pipeline (tratar como fixture, no archivar) o un intento real de edición (`prueba_en_vivo/` sugiere esto último) |

### No tocar (activo, no aplica ninguna política)

- `CEINCA-WORKSPACE/03 FORMACION/JORNADAS SEPTIEMBRE - DICIEMBRE 2026/` (82M) — cursos vigentes/próximos.
- `Clientes - Legales/Frima personal AZUCENA/` (4.4M) — cliente activo con PII; entra a la política de retención solo cuando el caso se cierre explícitamente, no ahora.
- `CEINCA-AI-OS/media-mvp/test_*.mp4` — fixtures de test reusados por la suite, no confundir con contenido de cliente.

## Verificación

- Antes de cualquier borrado: `git status` limpio en `CEINCA-AI-OS`, y confirmar por ruta que nada de lo listado en categoría A/D está trackeado en git (`git ls-files <ruta>` vacío).
- Después de borrar caché (categoría A): confirmar que `npm install` reconstruye `casacampobarinas1/site` sin error antes de dar por cerrada esa tarea.
- Después de mover a Drive: confirmar que el archivo subido abre correctamente antes de borrar la copia local (nunca borrar-y-luego-verificar).
- `du -sh` de ambos árboles antes/después, reportado en el handoff.

## Documentación final

Actualizar `handoff.md` de `CEINCA-AI-OS` con espacio liberado (antes/después), y anotar en el sistema de pendientes (Notion, spec hermano) las 3 reconciliaciones de la categoría C como tareas de seguimiento si no se resuelven en la misma sesión.
