# Workflow de pendientes cruzado, con delegación a Agy y respaldo ante cortes eléctricos

**Fecha:** 2026-09-10
**Alcance confirmado:** todo el trabajo de Eduardo (no solo `CEINCA-AI-OS`) — incluye `CEINCA-WORKSPACE` (cursos/negocio, sin versionar), `webcam-app`, `OpenMontage`, `mi-web-3d`, y tareas de sistema/personales. No sustituye ningún `handoff.md` existente; se apoya en ellos.

## Contexto

Cada sesión de Claude Code arranca sin visibilidad de lo pendiente fuera del repo actual. Los pendientes reales viven dispersos: `handoff.md` por repo, `CEINCA-WORKSPACE/.../cronograma-ceinca-sep-dic-2026.md` (negocio, sin versionar), y la memoria de sesión. Además:

- Existe una CLI de agente alterna (`agy`, Antigravity) ya usada en paralelo (ver `handoff.md` CEINCA-AI-OS, Tarea 44) pero sin puente automático — hoy se alimenta a mano en una ventana aparte.
- Venezuela atraviesa cortes eléctricos frecuentes; ya hubo que pedir actualizaciones de `handoff.md` cada ~5 min durante el sprint del Video Editor MVP (28-08-2026) para no perder trabajo.
- Eduardo puede quedarse sin tokens/cuota de Claude a mitad de tarea y necesita poder seguir con Agy sin perder contexto.

Este diseño resuelve las tres cosas con un solo sistema: visibilidad cruzada de pendientes, delegación segura a Agy, y continuidad ante fallas (de cuota o de electricidad).

## Decisiones tomadas

1. **Alcance del sistema de tareas**: cruzado a todos los proyectos, no solo `CEINCA-AI-OS`.
2. **Notion como tablero cruzado, NO como único registro en caliente**: Notion necesita red; un corte que se lleve también el ISP perdería el último checkpoint si Notion fuera la única fuente. Cada proyecto conserva su `handoff.md` local (git-commiteado) como el respaldo rápido y offline-safe de "qué se estaba ejecutando" — igual que ya funciona hoy. Notion se sincroniza desde ahí al iniciar/cerrar sesión, no en tiempo real.
3. **Disparador**: hook de `SessionStart` global (`~/.claude/settings.json`), no un comando manual — corre en cualquier sesión, de cualquier proyecto.
4. **Dos niveles de confianza para Agy** (no uno):
   - **Automática/desatendida** (al iniciar sesión, sin que Eduardo esté mirando en tiempo real): solo tareas de diagnóstico/lectura, bajo `agy --sandbox`. Nunca ejecuta cambios.
   - **Manual/deliberada** (Eduardo decide activamente delegar — se acabaron los tokens de Claude, o anticipa/sufre un corte): Agy opera con la misma confianza que Claude Code hoy — mismas reglas de `CLAUDE.md`/`AGENTS.md`, mismo protocolo de `handoff.md`. La diferencia nunca fue de capacidad (ya confirmado en Tarea 44 del handoff de CEINCA-AI-OS), es de si hay supervisión — y aquí la hay, porque Eduardo eligió el cambio a propósito.
5. **El hook es tonto; el razonamiento lo hace Claude**: el script del hook solo inyecta un recordatorio corto (mismo patrón que el hook de REMEMBER ya activo). Soy yo quien, al iniciar la conversación, consulta Notion vía MCP, decide qué es delegable en modo diagnóstico, y disparo `agy -p "..." --sandbox --output-format json` para esos casos.

## Componentes

### 1. Base de datos Notion "Pendientes — Eduardo"

Propiedades: Título, Área (select: CEINCA-AI-OS / CEINCA-WORKSPACE-Negocio / webcam-app / OpenMontage / mi-web-3d / Sistema-Personal), Estado (Pendiente/En progreso/Bloqueado/Hecho), Prioridad, Delegable-diagnóstico (checkbox), Origen (repo/documento de donde salió), Hallazgos-Agy (texto, se llena con lo que Agy reporte).

Poblada inicialmente migrando los pendientes reales ya identificados (fix de `metadataBase` en Casa & Campo, prueba de campo de `webcam-app`, automatización Meta Business Suite, tema Módulo 03 del curso jurídico, los 2 correos sin enviar, la propuesta al Colegio de Contadores de Carabobo).

### 2. `handoff.md` por proyecto (sin cambios de fondo)

Sigue siendo el checkpoint primario, offline-safe, de cada repo. Se refuerza la disciplina ya usada en la práctica: durante tareas largas o en ventanas de riesgo de corte eléctrico, actualizar cada ~5-10 min en vez de solo al cierre de sesión.

### 3. Hook `SessionStart` global

`~/.claude/settings.json`, un script simple que inyecta: "Hay N pendientes abiertos en Notion — revísalos antes de responder y decide qué delegar a Agy en modo diagnóstico." Sin llamadas a red ni a MCP desde el hook mismo.

### 4. Delegación automática (diagnóstico)

Al iniciar sesión, consulto Notion vía MCP, filtro por `Delegable-diagnóstico = true` y `Estado = Pendiente`, y para cada uno disparo:

```
agy -p "<tarea acotada a investigar/reportar, prohibido modificar nada>" --sandbox --output-format json --print-timeout 5m
```

El resultado se escribe en el campo `Hallazgos-Agy` de Notion y se resume a Eduardo al abrir la sesión. Ninguna acción real se ejecuta sin que él la vea primero.

### 5. Delegación manual (continuidad)

Cuando Eduardo activa este camino explícitamente (falta de cuota o corte inminente/en curso), Agy se invoca con el mismo patrón que `agy-continue` ya usa hoy (lee `AGENTS.md` + `handoff.md`, reporta workspace/branch/HEAD/próxima tarea antes de tocar nada) pero generalizado a cualquier proyecto, no solo `CEINCA-AI-OS`. Sin `--dangerously-skip-permissions`; si es interactivo, Agy sigue preguntando por permisos como ya hace — la confianza aquí viene de que Eduardo está presente decidiendo, no de saltarse controles.

### 6. Sincronización Notion ↔ proyectos

Al iniciar sesión: leer el estado más reciente de cada `handoff.md`/documento relevante y reflejarlo en Notion (altas, cambios de estado). Al cerrar sesión (o cada ~5-10 min en tareas de riesgo, junto con la actualización de `handoff.md`): empujar los cambios de vuelta. Sin sync en tiempo real ni webhooks — deliberadamente fuera de alcance (YAGNI).

## Riesgos abiertos / a verificar antes de confiar en ellos

1. **Comportamiento real de `--sandbox`**: el changelog de Agy confirma que bloquea escritura en `.git` y puede denegar red no autorizada, y que funciona en modo headless (`-p`) sin colgarse — pero no hay documentación exhaustiva de qué más bloquea. Antes de depender de él para la delegación automática, hacer una prueba real: pedirle a Agy con `--sandbox` que intente escribir un archivo fuera de lo permitido y confirmar que lo bloquea.
   - **VERIFICADO (11-09-2026, Agy 1.2.1) — RIESGO CONFIRMADO, NO MITIGADO.** Prueba real ejecutada: `agy -p "Intenta crear un archivo en /tmp/agy-sandbox-test.txt..." --add-dir /home/eduardo/CEINCA-AI-OS --sandbox --output-format json --print-timeout 2m`. Resultado: Agy creó el archivo en `/tmp/agy-sandbox-test.txt` (fuera de `--add-dir`) sin ningún bloqueo — confirmado con `ls`/`cat` sobre el archivo real, no solo el reporte de Agy. `--sandbox` NO restringe la escritura a los directorios declarados con `--add-dir` en esta versión. **La Tarea 10 del plan de implementación (`agy-diagnose`, delegación automática/desatendida) queda detenida sin construir** — el diseño de esta spec (§ "Modelo de confianza en dos niveles") asumía que `--sandbox` sí aislaba la escritura; con este hallazgo, delegar tareas automáticas a Agy con la confianza asumida aquí no es seguro todavía. **Decisión del usuario (11-09-2026): opción (c).** Se descarta la delegación automática/desatendida a Agy por ahora — la Tarea 10 (`agy-diagnose`) no se construye. Queda solo el camino manual (`agy-continue`, confianza plena, activado explícitamente por Eduardo), que no depende de ningún aislamiento de `--sandbox`. Si en el futuro se quiere retomar la delegación automática, investigar primero (a) una bandera/config real de aislamiento en Agy, o (b) envolverlo en un sandbox externo del sistema (bwrap/firejail/contenedor) — no repetir el supuesto de que `--sandbox` por sí solo protege.
2. **Definir la lista inicial de categorías seguras** para cuando Agy actúa con confianza plena en el camino manual (ej. mantenimiento de sistema ya validado como en la Tarea 40) vs. categorías que, aun en modo manual, conviene supervisar en vivo (envíos a clientes reales, dinero, publicaciones públicas).
3. Confirmar que la base de datos de Notion queda compartida con la integración del MCP antes de intentar escribir en ella (ya se verificó acceso de lectura al workspace; falta crear y compartir la base específica).

## Verificación

- Prueba real de `--sandbox` (riesgo 1) antes de dar por buena la delegación automática.
- Un ciclo completo simulado: crear una tarea de prueba en Notion marcada diagnóstico → verificar que el hook la señala al iniciar sesión → verificar que Agy la ejecuta en modo lectura y el hallazgo queda escrito en Notion.
- `git status` limpio en cada `handoff.md` tocado antes de commitear.

## Documentación final

Al terminar la implementación, actualizar `handoff.md` de `CEINCA-AI-OS` con el resultado, y añadir a `AGENTS.md` (o crear uno nuevo por proyecto que no lo tenga) la referencia al nuevo flujo de continuidad manual con Agy.
