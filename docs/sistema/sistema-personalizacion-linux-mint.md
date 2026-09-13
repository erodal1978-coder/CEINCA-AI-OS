# Sistema de Personalización Segura — Linux Mint (Dell OptiPlex 9010)

Adaptado del workflow de 4 fases descrito en How-To Geek (Jul 2026), ajustado a tu equipo real: Linux Mint (apt, Cinnamon, Timeshift preinstalado), Dell OptiPlex 9010 con HDD y 8GB RAM asimétrica en Flex Mode degradado.

## Por qué esta versión difiere del artículo original

| Punto del artículo | Ajuste para tu equipo | Razón |
|---|---|---|
| Arch + pacman/AUR | Mint + `apt` | Tu distro real |
| WM tipo i3/Hyprland/Sway | Cinnamon (mismo DE, solo temas/config) | Tu cuello de botella es disco+RAM, no el compositor. Cambiar de DE rompe flujos de trabajo que ya dominas en una máquina de producción |
| "Verificar si hay herramienta de snapshot" | Ya la tienes: Timeshift viene por defecto en Mint | Ahorra un paso completo de Phase 3 |
| Repo git en `~/.config` | Igual, pero **excluyendo explícitamente** cualquier carpeta con credenciales/tokens de tus herramientas (VS Code, Claude Code, Google Drive) | Tu `~/.config` puede tener tokens de sesión de las integraciones que usas a diario |
| VM recomendada como "opcional" | La marco como **obligatoria si vas a tocar algo más que temas/iconos/fuentes** | Esta máquina corre tu trabajo de CEINCA — no es un equipo de pruebas |

---

## Cómo usarlo

1. Abre una terminal en tu carpeta home (`cd ~`).
2. Lanza Claude Code (`claude`).
3. Pega el prompt completo de la sección siguiente.
4. Después del prompt, en el mismo mensaje o el siguiente, describe qué buscas — puedes adjuntar una captura de pantalla o simplemente describir el estilo ("quiero algo tipo Catppuccin Mocha pero conservando el panel de Cinnamon", por ejemplo).
5. Respeta las paradas entre fases. No le digas "hazlo todo de una vez" — eso anula el propósito del sistema.

Si tu petición implica cambiar de entorno de escritorio (no solo temas), detente y hazlo primero en una VM (VirtualBox/GNOME Boxes con una ISO de Mint) antes de tocar esta máquina.

---

## El prompt (cópialo tal cual)

```
Quiero que personalices mi escritorio Linux Mint (Cinnamon) siguiendo el
estilo de referencia que te voy a describir/mostrar. Este equipo es mi
máquina de trabajo diario (uso VS Code, Claude Code, y herramientas de
marketing) — prioriza seguridad y reversibilidad sobre velocidad.

Trabaja en cuatro fases. No te saltes ninguna, y detente a esperar mi
aprobación entre cada una. Mantén un archivo ~/PLAN.md durante toda la
sesión: después de que apruebe la Fase 2, escribe el plan aprobado ahí
como checklist, y marca cada ítem al completarlo. Si esta sesión se
reinicia, lee primero ~/PLAN.md y ~/claude-rice-log.md y continúa desde
donde quedó.

FASE 1 — AUDITORÍA (solo lectura)
No modifiques nada. Determina:
- Versión de Mint, edición de Cinnamon, arquitectura, gestor de paquetes (apt)
- Servidor gráfico (X11, que es el default en Cinnamon)
- Qué archivos de configuración controlan actualmente la apariencia
  (~/.config/gtk-3.0, ~/.themes, ~/.icons, dconf, cinnamon-settings)
- Qué herramientas necesarias para el look objetivo ya están instaladas
- Confirma que git y Timeshift están instalados (Timeshift viene por
  defecto en Mint — si no está, repórtalo, no lo instales todavía)
- Espacio libre en disco (mi equipo tiene HDD, no SSD — cualquier paquete
  pesado o tema con muchos assets debe evaluarse contra esto)
- RAM disponible (mi equipo corre con 8GB en modo asimétrico degradado —
  señala si algo que propones es pesado en RAM, como compositores con
  muchos efectos)
Repórtame todo esto antes de hacer cualquier otra cosa.

FASE 2 — PLAN
Investiga qué herramientas/temas usa la referencia que te di (tema GTK,
iconos, fuente, esquema de color, terminal, wallpaper). Cita en qué te
basas. Si no puedes identificar con confianza los componentes exactos,
dilo explícitamente y propón el equivalente bien documentado más cercano
disponible en los repos de Mint/Ubuntu — no adivines y lo presentes como
un hecho.

Luego dame:
- Plan escrito de exactamente qué vas a cambiar y qué archivos vas a tocar
- Lista de cada paquete a instalar, con una razón de una línea para cada uno
- Una nota explícita si algo de esto implica más que temas/iconos/fuentes
  (p. ej. cambiar de DE, instalar un compositor nuevo) — en ese caso,
  recomiéndame probarlo primero en una VM antes de aplicarlo aquí

Espera mi aprobación, luego escribe el plan en ~/PLAN.md como checklist.

FASE 3 — PREPARACIÓN
Una vez apruebe:
- Inicializa un repo git en ~/.config. Añade un .gitignore que ignore todo
  por defecto (*) y solo permita explícitamente las carpetas que vas a
  editar (ej. !gtk-3.0/, !cinnamon-session/). EXCLUYE explícitamente
  cualquier carpeta que contenga tokens o credenciales de sesión —
  particularmente todo lo relacionado con VS Code, Claude, y cualquier
  integración de Google — aunque esté dentro del rango de carpetas que
  vas a tocar. Si tienes dudas sobre si una carpeta contiene credenciales,
  exclúyela y pregúntame. Commitea el estado actual como
  "pre-claude-baseline" y etiquétalo. Esto no requiere root — hazlo tú mismo.
- Escribe UN script de shell llamado claude-setup.sh en mi home que
  contenga solo los pasos que requieren sudo: primero verificar/crear un
  snapshot de Timeshift, luego instalación de paquetes. Nada más va ahí.
- Cada línea del script debe tener un comentario arriba explicando qué hace.
- Si Timeshift no está disponible (no debería pasar en Mint, pero
  verifícalo), instalarlo y tomar el snapshot debe ser lo primero en el script.
- El script no debe contener patrones `curl | sh` / `wget | sh`, y no debe
  escribir archivos fuera de la operación normal del gestor de paquetes.
- No ejecutes el script. Dime que lo lea y lo corra yo mismo.

FASE 4 — CONSTRUCCIÓN
Después de que confirme que corrí el script:
- Haz los cambios un componente a la vez. Commitea a git después de cada
  componente con un mensaje descriptivo, y márcalo en ~/PLAN.md.
- Nunca sobrescribas un archivo de configuración existente sin antes
  copiarlo a <nombre>.bak.
- Añade cada acción a ~/claude-rice-log.md a medida que avanzas:
  timestamp, qué cambiaste, qué archivo, por qué.
- Antes de decirme que reinicie Cinnamon o cierre sesión, valida la
  sintaxis de la config con la herramienta propia si existe, y repórtame
  el resultado. Dime también cómo llegar a una TTY (Ctrl+Alt+F3) y
  restaurar el .bak si la sesión gráfica se rompe.
- No ejecutes sudo. Si algo requiere root, detente y dame el comando
  exacto para que lo corra yo mismo.
- Después de cada componente, dime qué revisar para verificar que funcionó.

Reglas para toda la sesión:
- Nunca ejecutes rm -rf, dd, mkfs, chmod -R, o chown -R en nada.
- Nunca piped un script descargado directo a un shell.
- Nunca edites nada fuera de mi home.
- Pregúntame antes de instalar algo que no esté en la lista aprobada de Fase 2.
- Si un comando falla, no improvises soluciones que involucren root o
  archivos del sistema — reporta la falla y espera.
- Si en algún punto detectas que el cambio propuesto es más profundo que
  temas/iconos/fuentes (cambio de DE, compositor, display server), detente
  y recomiéndame probarlo en VM primero, sin proceder.
```

---

## Notas finales

- **Guarda este prompt** en `~/claude-rice-prompt.md` para no tener que copiarlo cada vez.
- El log (`~/claude-rice-log.md`) y el plan (`~/PLAN.md`) quedan como registro — revísalos después de cada sesión, no solo durante.
- Si en algún punto Claude Code te sugiere algo que no entiendes completamente, pídele que te explique en español simple antes de aprobar — el punto de las paradas entre fases es justamente que tú decidas con información completa, no que apruebes por inercia.
