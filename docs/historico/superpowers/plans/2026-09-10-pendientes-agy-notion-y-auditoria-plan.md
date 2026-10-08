# Sistema de pendientes cruzado + delegación a Agy + auditoría/retención — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un tablero de pendientes cruzado a todos los proyectos de Eduardo en Notion, un hook de sesión que lo revise automáticamente, un mecanismo de delegación a la CLI de Antigravity (`agy`) en dos niveles de confianza, y ejecutar la limpieza/reconciliación/retención ya auditada sobre `CEINCA-AI-OS` y `CEINCA-WORKSPACE`.

**Architecture:** Notion es el tablero cruzado (no el registro en caliente — cada `handoff.md` local sigue siéndolo). Un hook `SessionStart` global inyecta un recordatorio estático; Claude, no el hook, consulta Notion vía MCP y decide qué delegar a `agy --sandbox` en modo diagnóstico. Un wrapper separado (`agy-continue` generalizado) cubre la continuidad manual con plena confianza. La limpieza/reconciliación es trabajo de filesystem directo, con puntos de confirmación explícitos antes de cualquier borrado de contenido real.

**Tech Stack:** Notion MCP (`mcp__claude_ai_Notion__*`), Google Drive MCP (`mcp__claude_ai_Google_Drive__*`), bash, la CLI `agy` (Antigravity, ya instalada en `~/.local/bin/agy`), hooks de Claude Code (`~/.claude/settings.json`).

**Spec:**
- `docs/superpowers/specs/2026-09-10-workflow-tareas-agy-notion-design.md`
- `docs/superpowers/specs/2026-09-10-auditoria-reorganizacion-retencion-design.md`

## Global Constraints

- Notion es tablero cruzado, NUNCA el único registro en caliente — cada `handoff.md` local sigue siendo el checkpoint offline-safe, sin cambios de fondo.
- Retención: 90 días desde que una tarea se marca `Hecho` con `Fecha-cierre` en Notion, antes de mover a `_archivo/AAAA-MM-DD/`; otro periodo igual antes de subir a Google Drive y borrar la copia local.
- Documentos legales/PII de cliente: nunca a un espacio público ni a Notion — solo Drive, en carpeta privada.
- Delegación automática/desatendida a Agy: SOLO diagnóstico/lectura, siempre con `--sandbox`, nunca `--dangerously-skip-permissions`.
- Delegación manual (continuidad, activada por Eduardo): misma confianza que Claude Code, siguiendo `AGENTS.md`/`CLAUDE.md`/`handoff.md` del proyecto correspondiente — sin `--dangerously-skip-permissions` tampoco.
- Antes de borrar cualquier ruta: confirmar que no está trackeada en git (`git ls-files <ruta>` vacío) cuando la ruta esté dentro de un repo.
- Nunca borrar contenido real (no-caché) sin que Eduardo confirme explícitamente el hallazgo primero.

---

## File Structure

- Create: `~/.claude/hooks/session-pendientes/check.sh` — hook `SessionStart`, texto estático, sin llamadas de red.
- Modify: `~/.claude/settings.json` — registra el hook anterior.
- Create: `~/.local/bin/agy-diagnose` — wrapper que invoca `agy -p ... --sandbox --output-format json` sobre una tarea puntual.
- Modify: `~/.local/bin/agy-continue` — generaliza el path del proyecto (hoy hardcodeado a `CEINCA-AI-OS`).
- Notion: nueva base de datos "Pendientes — Eduardo" (sin archivo local; su `data_source_id` se guarda como memoria de referencia).
- Modify: `CEINCA-AI-OS/handoff.md` — documentación de cierre de cada fase.

---

## Fase A — Seguridad (independiente, hacer primero)

### Task 1: Asegurar `recovery-codes.txt`

**Files:**
- Modify: elimina `CEINCA-WORKSPACE/CEINCA/recovery-codes.txt`
- Create: `CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10/recovery-codes.txt.gpg`

**Interfaces:** ninguna (tarea de filesystem, sin código).

- [ ] **Paso 1: Confirmar que el archivo no está en ningún repo git**

```bash
cd /home/eduardo/CEINCA-WORKSPACE && git status 2>&1 | head -1
```
Esperado: `fatal: not a git repository` (CEINCA-WORKSPACE no es un repo — confirma que no hay riesgo de historial).

- [ ] **Paso 2: Cifrar el archivo con una passphrase que Eduardo escribe en el prompt interactivo (nunca hardcodeada)**

```bash
mkdir -p /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10
gpg --symmetric --cipher-algo AES256 \
  --output /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10/recovery-codes.txt.gpg \
  /home/eduardo/CEINCA-WORKSPACE/CEINCA/recovery-codes.txt
```
`gpg` pedirá la passphrase por terminal — Eduardo la escribe en el momento, no se guarda en ningún script.

- [ ] **Paso 3: Verificar que el cifrado es correcto antes de borrar el original**

```bash
gpg --decrypt /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10/recovery-codes.txt.gpg > /tmp/verify-recovery.txt
diff /tmp/verify-recovery.txt /home/eduardo/CEINCA-WORKSPACE/CEINCA/recovery-codes.txt && echo "OK idéntico" && rm /tmp/verify-recovery.txt
```
Esperado: `OK idéntico`.

- [ ] **Paso 4: Borrar el original en texto plano**

```bash
rm /home/eduardo/CEINCA-WORKSPACE/CEINCA/recovery-codes.txt
```

- [ ] **Paso 5: Anotar en el handoff que el `.gpg` es temporal — Eduardo debe importar los códigos a su gestor de contraseñas y luego borrar también el `.gpg`.**

No hay commit (CEINCA-WORKSPACE no es git). Anotar directamente en `CEINCA-AI-OS/handoff.md` sección de esta sesión.

---

### Task 2: Eliminar `ig-viral-tracker/` huérfano

**Files:**
- Modify: elimina `CEINCA-AI-OS/ig-viral-tracker/` completo

**Interfaces:** ninguna.

- [ ] **Paso 1: Confirmar que no está trackeado**

```bash
cd /home/eduardo/CEINCA-AI-OS && git ls-files ig-viral-tracker | wc -l
```
Esperado: `0`.

- [ ] **Paso 2: Listar (sin exponer valores) qué variables de entorno definía, para que Eduardo revise si alguna sigue en uso en otro lado**

```bash
grep -oE '^[A-Z_]+=' ig-viral-tracker/backend/.env ig-viral-tracker/backend/.env.save 2>/dev/null | sort -u
```
Copiar la lista de nombres (no los valores) al handoff.

- [ ] **Paso 3: Borrar la carpeta completa**

```bash
rm -rf /home/eduardo/CEINCA-AI-OS/ig-viral-tracker
```

- [ ] **Paso 4: Verificar**

```bash
ls /home/eduardo/CEINCA-AI-OS/ig-viral-tracker 2>&1
```
Esperado: `No such file or directory`.

---

## Fase B — Caché de build regenerable (independiente, seguro)

### Task 3: Revisar y eliminar el proyecto Next.js/Remotion abandonado en `casa-campo-barinas/video/`

**Files:**
- Modify: elimina `CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/video/` completo (tras revisión)

- [ ] **Paso 1: Listar el código fuente real (excluyendo `node_modules`/`.cache`/`.next`) para revisión humana**

```bash
find "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/video" \
  -type f -not -path "*/node_modules/*" -not -path "*/.cache/*" -not -path "*/.next/*" \
  -not -path "*/.git/*"
```

- [ ] **Paso 2: Presentar la lista a Eduardo y confirmar que ningún archivo fuente único (componente Remotion, config, asset) falta en `CEINCA-AI-OS/CLIENTS/casacampobarinas1/`. Esperar confirmación explícita antes de continuar.**

- [ ] **Paso 3 (solo tras confirmación): borrar la carpeta completa**

```bash
rm -rf "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/video"
```

- [ ] **Paso 4: Verificar espacio liberado**

```bash
du -sh /home/eduardo/CEINCA-WORKSPACE
```

---

### Task 4: Eliminar caché de build en `casacampobarinas1/site` y `WEBKIT/site`

**Files:**
- Modify: elimina `node_modules/` y `.next/` de ambos proyectos

- [ ] **Paso 1: Confirmar que ninguno de los dos está trackeado**

```bash
cd /home/eduardo/CEINCA-AI-OS
git ls-files CLIENTS/casacampobarinas1/site/node_modules CLIENTS/casacampobarinas1/site/.next WEBKIT/site/node_modules | wc -l
```
Esperado: `0`.

- [ ] **Paso 2: Borrar**

```bash
rm -rf CLIENTS/casacampobarinas1/site/node_modules CLIENTS/casacampobarinas1/site/.next
rm -rf WEBKIT/site/node_modules
```

- [ ] **Paso 3: Verificar que `casacampobarinas1/site` reconstruye sin error (el sitio en producción no depende de esto, es solo para poder seguir editándolo localmente)**

```bash
cd CLIENTS/casacampobarinas1/site && npm install && npm run build
```
Esperado: build exitoso, sin errores. Si falla, no es bloqueante para el resto del plan — anotar en handoff y seguir.

- [ ] **Paso 4: Verificar espacio liberado**

```bash
cd /home/eduardo/CEINCA-AI-OS && du -sh .
```
Esperado: ~1.9G o menos (partiendo de 2.3G tras el Task 2).

---

## Fase C — Sistema de pendientes (Notion + hook + Agy)

### Task 5: Crear la base de datos Notion "Pendientes — Eduardo"

**Interfaces:**
- Produce: un `data_source_id` de Notion que las Tasks 6 y 10 consumen.

- [ ] **Paso 1: Crear la base con este esquema exacto**

Llamar a `mcp__claude_ai_Notion__notion-create-database` con:
```json
{
  "title": "Pendientes — Eduardo",
  "description": "Tablero cruzado de pendientes de todos los proyectos. NO es el registro en caliente de ningún proyecto — cada handoff.md local sigue siendo esa fuente.",
  "schema": "CREATE TABLE (\"Titulo\" TITLE, \"Area\" SELECT('CEINCA-AI-OS':blue, 'CEINCA-WORKSPACE-Negocio':green, 'webcam-app':orange, 'OpenMontage':purple, 'mi-web-3d':pink, 'Sistema-Personal':gray), \"Estado\" SELECT('Pendiente':red, 'En progreso':yellow, 'Bloqueado':orange, 'Hecho':green), \"Prioridad\" SELECT('Alta':red, 'Media':yellow, 'Baja':gray), \"Delegable-diagnostico\" CHECKBOX, \"Origen\" RICH_TEXT, \"Hallazgos-Agy\" RICH_TEXT, \"Fecha-cierre\" DATE)"
}
```

- [ ] **Paso 2: Extraer el `data_source_id` del resultado (aparece en una etiqueta `<data-source>`).**

- [ ] **Paso 3: Guardarlo como memoria de referencia (`/home/eduardo/.claude/projects/-home-eduardo/memory/`) para no tener que buscarlo en cada sesión futura:**

Crear `reference_notion-pendientes.md`:
```markdown
---
name: reference-notion-pendientes
description: ID de la base de datos Notion "Pendientes — Eduardo", tablero cruzado de todos los proyectos
metadata:
  type: reference
---

Base de datos Notion "Pendientes — Eduardo". data_source_id: <PEGAR EL ID REAL AQUÍ>.
Tablero cruzado, NO es el registro en caliente — cada handoff.md local de cada
proyecto sigue siendo esa fuente. Ver [[project-pendientes-agy-notion]].
```
Y añadir una línea en `MEMORY.md`.

- [ ] **Paso 4: Verificar leyendo la base recién creada**

```
mcp__claude_ai_Notion__notion-fetch con la URL/ID de la base — confirmar que el esquema tiene las 7 propiedades esperadas.
```

---

### Task 6: Migrar los pendientes reales conocidos a Notion

**Interfaces:**
- Consume: el `data_source_id` de la Task 5.

- [ ] **Paso 1: Crear estas 10 páginas con `mcp__claude_ai_Notion__notion-create-pages`, parent `{"type": "data_source_id", "data_source_id": "<el de la Task 5>"}`:**

| Titulo | Area | Estado | Prioridad | Origen |
|---|---|---|---|---|
| Fix metadataBase roto en layout.tsx (Casa & Campo) | CEINCA-AI-OS | Pendiente | Alta | handoff.md Tarea 45 |
| Prueba de campo real audio webcam-app | webcam-app | Pendiente | Alta | handoff.md, HANDOFF.md de webcam-app |
| Configurar automatización Meta Business Suite Hospedaje | CEINCA-AI-OS | Pendiente | Media | handoff.md Tarea 24 |
| Confirmar tema Módulo 03 curso jurídico (antes del 13-09) | CEINCA-WORKSPACE-Negocio | Pendiente | Alta | handoff.md Tarea 50 |
| Enviar correo propuesta FONPYME/J.Torres | CEINCA-WORKSPACE-Negocio | Pendiente | Media | memoria de sesión 09-09 |
| Enviar correo propuesta Prof. Pascual (ULA) | CEINCA-WORKSPACE-Negocio | Pendiente | Media | memoria de sesión 09-09 |
| Redactar y enviar propuesta Colegio Contadores Carabobo | CEINCA-WORKSPACE-Negocio | Pendiente | Media | handoff.md Tarea 51 |
| Reconciliar triple ubicación de Casa & Campo Barinas | CEINCA-AI-OS | Pendiente | Media | spec auditoria-reorganizacion, Task 11 de este plan |
| Verificar si lexia-landing sigue deployado en Vercel | CEINCA-WORKSPACE-Negocio | Pendiente | Baja | spec auditoria-reorganizacion, Task 12 de este plan |
| Mover contenido personal fuera de raíz CEINCA-WORKSPACE | CEINCA-WORKSPACE-Negocio | Pendiente | Baja | spec auditoria-reorganizacion, Task 13 de este plan |

- [ ] **Paso 2: Verificar con `notion-fetch` sobre la base que las 10 páginas existen con sus propiedades correctas.**

---

### Task 7: Escribir y registrar el hook `SessionStart` global

**Files:**
- Create: `~/.claude/hooks/session-pendientes/check.sh`
- Modify: `~/.claude/settings.json`

**Interfaces:** ninguna — el hook solo imprime texto a stdout, Claude Code lo inyecta como contexto.

- [ ] **Paso 1: Crear el script**

```bash
mkdir -p ~/.claude/hooks/session-pendientes
cat > ~/.claude/hooks/session-pendientes/check.sh << 'EOF'
#!/usr/bin/env bash
echo "=== PENDIENTES ==="
echo "Hay tareas abiertas en la base de Notion 'Pendientes — Eduardo'."
echo "Antes de responder: consulta la base vía MCP, resume lo abierto,"
echo "e identifica cuáles tienen Delegable-diagnostico=true para ofrecer"
echo "delegarlas a Agy en modo --sandbox (solo lectura, nunca ejecutar cambios)."
EOF
chmod +x ~/.claude/hooks/session-pendientes/check.sh
```

- [ ] **Paso 2: Registrar en `~/.claude/settings.json` (leer el archivo primero, añadir sin pisar hooks existentes)**

Añadir bajo la clave `hooks.SessionStart` (crear el array si no existe):
```json
{
  "matcher": "*",
  "hooks": [
    {
      "type": "command",
      "command": "~/.claude/hooks/session-pendientes/check.sh"
    }
  ]
}
```

- [ ] **Paso 3: Verificar arrancando una sesión nueva de Claude Code y confirmando que el texto "=== PENDIENTES ===" aparece en el contexto inicial.**

---

### Task 8: Generalizar `agy-continue` a cualquier proyecto

**Files:**
- Modify: `~/.local/bin/agy-continue`

**Interfaces:**
- Consume: nada externo.
- Produce: `agy-continue <ruta-del-proyecto>` — antes solo aceptaba `CEINCA-AI-OS` hardcodeado.

- [ ] **Paso 1: Leer el script actual (`~/.local/bin/agy-continue`) para confirmar su contenido exacto antes de editar.**

- [ ] **Paso 2: Reemplazar la línea `PROJECT="/home/eduardo/CEINCA-AI-OS"` por:**

```bash
if [ -z "${1:-}" ]; then
  echo "Uso: agy-continue <ruta-del-proyecto>" >&2
  exit 1
fi
PROJECT="$(realpath "$1")"
```

- [ ] **Paso 3: Confirmar que el resto del script (que ya usa `$PROJECT` en todos lados) no tiene ninguna otra referencia hardcodeada a `CEINCA-AI-OS`.**

```bash
grep -n "CEINCA-AI-OS" ~/.local/bin/agy-continue
```
Esperado: ninguna coincidencia tras el cambio.

- [ ] **Paso 4: Probar contra el proyecto actual sin romper el uso existente**

```bash
agy-continue /home/eduardo/CEINCA-AI-OS
```
Esperado: mismo comportamiento que antes del cambio (lee `AGENTS.md`/`handoff.md`/`CLAUDE.md`, reporta workspace/branch/HEAD).

---

### Task 9: Verificar empíricamente el comportamiento de `agy --sandbox`

**Interfaces:** ninguna — es una prueba, no código de producción.

- [ ] **Paso 1: Pedirle a Agy, con sandbox activo, que intente escribir un archivo fuera del workspace permitido**

```bash
agy -p "Intenta crear un archivo en /tmp/agy-sandbox-test.txt con el contenido 'test'. Reporta si tuviste éxito o si fuiste bloqueado." \
  --add-dir /home/eduardo/CEINCA-AI-OS --sandbox --output-format json --print-timeout 2m
```

- [ ] **Paso 2: Confirmar en la salida si el intento fue bloqueado o permitido, y documentar el resultado real (no supuesto) en el spec `2026-09-10-workflow-tareas-agy-notion-design.md`, sección "Riesgos abiertos", marcando el riesgo 1 como verificado.**

- [ ] **Paso 3: Si NO bloqueó la escritura fuera del workspace, detener aquí y avisar a Eduardo — la Task 10 no puede continuar con la confianza asumida en el diseño hasta resolver esto.**

---

### Task 10: Escribir el wrapper de delegación diagnóstica y probarlo end-to-end

**Files:**
- Create: `~/.local/bin/agy-diagnose`

**Interfaces:**
- Consume: el resultado verificado de la Task 9.
- Produce: `agy-diagnose "<descripción de la tarea>"` → imprime el JSON de resultado de `agy -p`.

- [ ] **Paso 1: Crear el wrapper**

```bash
cat > ~/.local/bin/agy-diagnose << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [ -z "${1:-}" ]; then
  echo "Uso: agy-diagnose \"<tarea a investigar>\"" >&2
  exit 1
fi
agy -p "TAREA DE SOLO DIAGNÓSTICO. Investiga y reporta. PROHIBIDO modificar, crear o borrar ningún archivo, o ejecutar cualquier comando que cambie el estado del sistema.

Tarea: $1" \
  --sandbox --output-format json --print-timeout 5m
EOF
chmod +x ~/.local/bin/agy-diagnose
```

- [ ] **Paso 2: Tomar una de las 10 tareas de la Task 6, marcarla `Delegable-diagnostico = true` en Notion (usar cualquiera de naturaleza investigativa, ej. "Verificar si lexia-landing sigue deployado en Vercel").**

- [ ] **Paso 3: Ejecutar el wrapper sobre esa tarea real**

```bash
agy-diagnose "Verifica si el proyecto en /home/eduardo/CEINCA-WORKSPACE/06 TECNOLOGIA/LEXIA LANDING sigue deployado activamente en Vercel (revisa .vercel/project.json y, si tienes acceso, el estado del deployment). No modifiques nada. Reporta lo que encuentres."
```

- [ ] **Paso 4: Escribir el resultado en el campo `Hallazgos-Agy` de esa página de Notion (`mcp__claude_ai_Notion__notion-update-page`, command `update_properties`) y marcar `Estado = En progreso`.**

- [ ] **Paso 5: Verificar leyendo la página de Notion que `Hallazgos-Agy` quedó con contenido real, no vacío.**

---

## Fase D — Reconciliación de duplicados

### Task 11: Reconciliar Casa & Campo Barinas

- [ ] **Paso 1: Listar lo que queda en `CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/` tras la Task 3 (ya sin `video/`)**

```bash
find "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS" -maxdepth 2 -type f
```

- [ ] **Paso 2: Comparar cada archivo contra `CEINCA-AI-OS/CLIENTS/casacampobarinas1/` — para cada uno, decidir: (a) ya existe equivalente en el repo → descartar de aquí, (b) es fuente única (foto/video que no está en el repo) → mover a `CLIENTS/casacampobarinas1/site/public/` o a una subcarpeta de material fuente, (c) es material de campaña ya publicado → mover a `_archivo/2026-09-10/`.**

- [ ] **Paso 3: Presentar la clasificación (a)/(b)/(c) a Eduardo, esperar confirmación antes de mover o borrar nada.**

- [ ] **Paso 4 (tras confirmación): ejecutar los movimientos, y actualizar el `Estado` de la tarea correspondiente en Notion a `Hecho` con `Fecha-cierre` = hoy.**

---

### Task 12: Verificar estado de `lexia-landing` en Vercel

- [ ] **Paso 1: Usar el resultado ya obtenido en la Task 10 (si se usó esta tarea como prueba end-to-end) o repetir la verificación si se usó otra.**

- [ ] **Paso 2: Si confirmado que no está activo/no aporta nada vivo: mover toda la carpeta a `_archivo/2026-09-10/lexia-landing/`.**

```bash
mv "/home/eduardo/CEINCA-WORKSPACE/06 TECNOLOGIA/LEXIA LANDING" "/home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10/lexia-landing"
```

- [ ] **Paso 3: Actualizar el `Estado` de la tarea correspondiente en Notion a `Hecho` con `Fecha-cierre` = hoy.**

---

### Task 13: Mover contenido personal fuera de la raíz de `CEINCA-WORKSPACE`

- [ ] **Paso 1: Presentar a Eduardo la lista exacta (`curso claude/`, `claude-nuevos-tutoriales/`, `muestra-gems/`, `prompts/`) y confirmar destino (ej. `~/Documentos/`).**

- [ ] **Paso 2 (tras confirmación): mover cada carpeta**

```bash
mv "/home/eduardo/CEINCA-WORKSPACE/curso claude" "/home/eduardo/CEINCA-WORKSPACE/claude-nuevos-tutoriales" \
   "/home/eduardo/CEINCA-WORKSPACE/02 SERVICIOS LEGALES/CATALOGO DE PRODUCTOS/MUESTRA GEMS" "/home/eduardo/CEINCA-WORKSPACE/06 TECNOLOGIA/PROMPTS Y GEMS/prompts" \
   /home/eduardo/Documentos/
```

- [ ] **Paso 3: Actualizar el `Estado` de la tarea correspondiente en Notion a `Hecho` con `Fecha-cierre` = hoy.**

---

## Fase E — Retención del contenido real restante

### Task 14: Archivar/subir a Drive el contenido real de tareas cerradas

**Files:** afecta `CEINCA-WORKSPACE/CEINCA/LEXIA/`, `CEINCA-WORKSPACE/CEINCA/videos/`, `CEINCA-WORKSPACE/generados/`, `CEINCA-AI-OS/media-mvp/output/`.

- [ ] **Paso 1: Clasificar `media-mvp/output/` — leer qué contiene `prueba_en_vivo/` y confirmar con Eduardo si es una prueba de pipeline (se queda, no aplica retención) o un intento real de entrega de cliente (aplica retención).**

- [ ] **Paso 2: Para cada carpeta confirmada como cerrada (LEXIA, CEINCA/videos, generados/, y media-mvp/output si aplica): mover a `_archivo/2026-09-10/`.**

```bash
mkdir -p /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10
mv /home/eduardo/CEINCA-WORKSPACE/CEINCA/LEXIA /home/eduardo/CEINCA-WORKSPACE/CEINCA/videos \
   /home/eduardo/CEINCA-WORKSPACE/generados /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10/
```

- [ ] **Paso 3: Subir cada carpeta archivada a Google Drive con `mcp__claude_ai_Google_Drive__create_file`, en una carpeta privada dedicada (ej. "CEINCA — Archivo 2026-09-10"), confirmando que cada subida termina sin error antes de continuar con la siguiente.**

- [ ] **Paso 4: Verificar cada archivo subido (confirmar que abre / que el tamaño coincide) ANTES de borrar la copia local — nunca borrar y luego verificar.**

- [ ] **Paso 5: Borrar las copias locales ya verificadas en Drive.**

- [ ] **Paso 6: Actualizar `handoff.md` de `CEINCA-AI-OS` con el resumen final: espacio total liberado (`du -sh` antes/después de todo el plan), qué se archivó, qué se subió a Drive, y las 3 memorias de referencia/proyecto nuevas creadas en esta sesión.**

- [ ] **Paso 7: Commit final**

```bash
cd /home/eduardo/CEINCA-AI-OS
git add handoff.md
git commit -m "docs: cierre de la ejecución del plan de pendientes/Agy/auditoría (09-2026)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EKrwBLuBBdvUeQYCjCbSRb"
```

---

## Self-Review (completado durante la escritura de este plan)

- **Cobertura del spec 1** (workflow Agy/Notion): base de datos (Task 5), migración (Task 6), hook (Task 7), continuidad manual generalizada (Task 8), verificación de sandbox (Task 9), delegación diagnóstica end-to-end (Task 10). Cubierto completo.
- **Cobertura del spec 2** (auditoría/retención): seguridad (Tasks 1-2), caché regenerable (Tasks 3-4), reconciliación (Tasks 11-13), retención real (Task 14). Cubierto completo.
- **Ya ejecutado fuera de este plan, no repetido**: borrado de `testimonial-janet-marquez` y `Antigravity.tar.gz` (autorizados explícitamente por Eduardo antes de escribir este plan) — no aparecen como tareas pendientes.
- **Puntos de confirmación humana explícitos** en Tasks 3, 11, 13, 14 (paso 1) — ninguna acción irreversible sobre contenido real ocurre sin que Eduardo la vea primero.
