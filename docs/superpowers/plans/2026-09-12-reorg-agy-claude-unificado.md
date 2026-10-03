# Reorganización Home + CEINCA-AI-OS + CEINCA-WORKSPACE — Arquitectura Unificada Agy/Claude — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Este plan es de FILESYSTEM, no de código: no hay tests automatizados — cada paso de "verificar" reemplaza al ciclo red/green.

**Goal:** Reorganizar `/home/eduardo`, `CEINCA-AI-OS` y `CEINCA-WORKSPACE` en una arquitectura sin archivos sueltos, con contenido de negocio/cliente en WORKSPACE (por cliente y servicio), tooling de Claude/Agy consolidado en AI-OS, y Agy (Gemini CLI) apuntando a AI-OS como fuente de conocimiento compartida con Claude Code.

**Architecture:** CEINCA-AI-OS = base de funcionamiento compartida (código, KNOWLEDGE/, RULES/, AGENTS/, .claude/skills, herramientas) — sin contenido específico de un cliente. CEINCA-WORKSPACE = negocio/operación (clientes, marca propia, campañas) — se convierte en repo git privado para entrar al backup automático. Home = solo config estándar de usuario + proyectos de desarrollo standalone agrupados en `~/repos/`.

**Tech Stack:** bash, git, git-subtree (para extraer casacampobarinas1/site con historial).

**Spec:** este mismo documento — nace de una auditoría de 3 forks de solo-lectura (2026-09-12) más confirmación explícita de Eduardo en 2 decisiones (ver Global Constraints).

## Global Constraints

- NUNCA borrar nada de forma irreversible sin mover antes a una carpeta `_archivo/<fecha>/` (convención ya establecida en CEINCA-WORKSPACE desde 2026-08-26).
- NUNCA mover/borrar un archivo dentro de `CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/` — es zona de cuarentena ya usada, se queda intacta.
- Política de assets de `CEINCA-AI-OS/CLAUDE.md`: NO video/audio/binarios pesados versionados en git salvo excepción explícita ya documentada (PRODUCTION/lexia-launch-video/public/audio). El binario `agy` (213MB) NUNCA se mete en el repo git de CEINCA-AI-OS — se queda en `~/.local/bin` (ubicación estándar), solo se reconfigura su área de trabajo.
- CEINCA-WORKSPACE se convierte en repo git privado (decisión de Eduardo, 2026-09-12) para integrarse al cron `git-wip-checkpoint` (cada 15 min, solo commits locales, nunca push) — mismo mecanismo que ya protege los otros 7 repos.
- `CLIENTS/casacampobarinas1/site` se extrae a su propio repo git (recomendación dada, aceptada implícitamente): es un producto vivo en Vercel (`projectId prj_BuKEcvVRQVDB7ybTLJrRiKWLlRFC`, deploy vía CLI de Vercel, no vía integración de GitHub) — extraerlo no interrumpe el sitio en producción porque Vercel no depende de dónde vive el código localmente, solo del `.vercel/project.json` (gitignored, se preserva físicamente en la carpeta al moverla).
- Todo movimiento de archivo de cliente respeta la convención `04 CLIENTES/<CLIENTE>/<servicio>/` con servicios en minúscula y guiones: `redes-sociales/`, `legal/`, `formacion-curso/`. Un cliente monoservicio no necesita la subcarpeta si el 100% de su contenido es un solo servicio (ej. `Clientes - Legales/*`).
- Antes de cada tarea que toca `CEINCA-AI-OS`, correr `git status` y confirmar árbol limpio o los cambios esperados — es un repo git real con push previo, no tocar sin verificar.

---

### Task 0: Convertir CEINCA-WORKSPACE en repo git privado y sumarlo al backup automático

**Files:**
- Create: `CEINCA-WORKSPACE/.git/` (init)
- Create: `CEINCA-WORKSPACE/.gitignore`
- Modify: config de `git-wip-checkpoint` (el cron que ya cubre 7 repos — ver [[project-git-wip-checkpoint]] en memoria, o `crontab -l` / script del cron para ubicarlo)

**Interfaces:** ninguna (filesystem/git puro).

- [ ] **Paso 1: Confirmar que WORKSPACE no es ya un repo git (por si algo cambió)**

```bash
git -C /home/eduardo/CEINCA-WORKSPACE status 2>&1 | head -1
```
Esperado: `fatal: not a git repository`.

- [ ] **Paso 2: Inicializar el repo**

```bash
cd /home/eduardo/CEINCA-WORKSPACE
git init
git config user.name "Eduardo Rodriguez"
git config user.email "erodal1978@gmail.com"
```

- [ ] **Paso 3: Crear `.gitignore` para excluir binarios pesados de video/audio del historial**

```bash
cat > /home/eduardo/CEINCA-WORKSPACE/.gitignore <<'EOF'
*.mp4
*.mov
*.webm
*.mp3
*.wav
node_modules/
.next/
.vercel/
.env*
EOF
```

- [ ] **Paso 4: Primer commit**

```bash
cd /home/eduardo/CEINCA-WORKSPACE
git add -A
git commit -m "chore: init repo privado CEINCA-WORKSPACE para backup automatico"
```

- [ ] **Paso 5: Verificar tamaño del commit (que el .gitignore realmente excluyó lo pesado)**

```bash
git -C /home/eduardo/CEINCA-WORKSPACE count-objects -vH
```
Esperado: tamaño en el orden de decenas/cientos de MB, NO varios GB (si sale varios GB, el `.gitignore` no está agarrando algo pesado — revisar antes de seguir).

- [ ] **Paso 6: Localizar el script/cron de `git-wip-checkpoint` y agregar CEINCA-WORKSPACE a su lista de repos**

```bash
crontab -l | grep -i wip
```
Editar el script que referencia (ubicarlo con el comando anterior) para incluir `/home/eduardo/CEINCA-WORKSPACE` en su lista de repos vigilados. Verificar tras el próximo tick (máx. 15 min) con:

```bash
git -C /home/eduardo/CEINCA-WORKSPACE log --oneline -3
```
Esperado: un commit automático nuevo del checkpoint tras esperar el intervalo.

---

### Task 1: Extraer CLIENTS/casacampobarinas1/site a su propio repo git

**Files:**
- Create: `/home/eduardo/repos/casacampo-barinas-site/` (nuevo repo)
- Modify: `CEINCA-AI-OS` (remueve `CLIENTS/casacampobarinas1/site/` del working tree y del tracking)

**Interfaces:** ninguna.

- [ ] **Paso 1: Confirmar que el árbol de CEINCA-AI-OS está limpio antes de tocar nada**

```bash
git -C /home/eduardo/CEINCA-AI-OS status --short
```
Esperado: sin salida (árbol limpio) o solo cambios ya conocidos/esperados de esta sesión.

- [ ] **Paso 2: Extraer el subdirectorio con su historial de git preservado**

```bash
cd /home/eduardo/CEINCA-AI-OS
git subtree split --prefix=CLIENTS/casacampobarinas1/site -b casacampo-site-extract
mkdir -p /home/eduardo/repos
git worktree add /home/eduardo/repos/casacampo-barinas-site casacampo-site-extract
```

- [ ] **Paso 3: Preservar el link de Vercel (está gitignored, no viaja con `git subtree`)**

```bash
cp -r /home/eduardo/CEINCA-AI-OS/CLIENTS/casacampobarinas1/site/.vercel \
      /home/eduardo/repos/casacampo-barinas-site/.vercel
```

- [ ] **Paso 4: Convertir el worktree en un repo independiente real**

```bash
cd /home/eduardo/repos/casacampo-barinas-site
git worktree lock . 2>/dev/null; true  # noop si no aplica
rm -rf .git
git init
git add -A
git commit -m "chore: import casacampo-barinas site desde CEINCA-AI-OS con historial via subtree split"
cd /home/eduardo/CEINCA-AI-OS
git worktree remove --force /home/eduardo/repos/casacampo-barinas-site 2>/dev/null; true
git branch -D casacampo-site-extract
```
Nota: el `rm -rf .git` + `git init` deja un repo nuevo (sin el historial completo de commits, porque el worktree se desvincula) — si Eduardo quiere preservar el historial real, usar en su lugar `git clone --no-hardlinks /home/eduardo/CEINCA-AI-OS /tmp/cco-extract && cd /tmp/cco-extract && git filter-repo --path CLIENTS/casacampobarinas1/site --path-rename CLIENTS/casacampobarinas1/site/:` (requiere `git-filter-repo` instalado) y mover ese resultado a `~/repos/casacampo-barinas-site` en su lugar de los pasos 2-4 anteriores.

- [ ] **Paso 5: Verificar que el sitio sigue deployable desde la nueva ubicación (sin hacer deploy real todavía)**

```bash
cd /home/eduardo/repos/casacampo-barinas-site
cat .vercel/project.json
npm install --dry-run 2>&1 | tail -5
```
Esperado: el `project.json` con el mismo `projectId` de antes, y que `npm install --dry-run` no tire errores de estructura rota.

- [ ] **Paso 6: Remover el contenido del repo CEINCA-AI-OS**

```bash
cd /home/eduardo/CEINCA-AI-OS
git rm -r CLIENTS/casacampobarinas1/site
git commit -m "refactor: extraer site de casacampo-barinas a repo propio (ver ~/repos/casacampo-barinas-site)"
```

- [ ] **Paso 7: Confirmar en Vercel que el proyecto sigue funcionando (deploy real solo si Eduardo lo pide explícitamente)**

```bash
cd /home/eduardo/repos/casacampo-barinas-site
vercel inspect casacampo-barinas 2>&1 | head -10
```
No correr `vercel --prod` en este paso — solo confirmar que el proyecto remoto sigue ahí. El siguiente deploy normal (cuando Eduardo haga sus ajustes) ya sale desde la nueva ruta.

---

### Task 2: Mover el resto de CLIENTS/ (contenido no-código) a CEINCA-WORKSPACE

**Files:**
- Modify: `CEINCA-AI-OS/CLIENTS/casacampobarinas1/*` (todo menos `site/`, ya movido en Task 1) → `CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/`
- Modify: `CEINCA-AI-OS/CLIENTS/ceinca-english-elpinal/` → `CEINCA-WORKSPACE/04 CLIENTES/CEINCA ENGLISH EL PINAL/`

- [ ] **Paso 1: Listar qué queda en CLIENTS/ tras la Task 1**

```bash
find /home/eduardo/CEINCA-AI-OS/CLIENTS -maxdepth 2
```

- [ ] **Paso 2: Mover con git (mantiene el archivo trackeado como "renombrado" para quien mire el diff)**

```bash
cd /home/eduardo/CEINCA-AI-OS
mkdir -p /home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS
mkdir -p /home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CEINCA ENGLISH EL PINAL
git mv CLIENTS/casacampobarinas1/* /home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CASA CAMPO BARINAS/
git mv CLIENTS/ceinca-english-elpinal/* /home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/CEINCA ENGLISH EL PINAL/
rmdir CLIENTS/casacampobarinas1 CLIENTS/ceinca-english-elpinal CLIENTS 2>/dev/null; true
```
Nota: `git mv` hacia una ruta fuera del propio repo no funciona con historial en un solo comando entre 2 repos distintos — si `git mv` falla por "fatal: not under version control" al cruzar el repo de WORKSPACE, usar `mv` normal seguido de `git rm -r CLIENTS/` en AI-OS y `git add -A` en WORKSPACE (ya inicializado en Task 0) para que quede trackeado en su nuevo repo.

- [ ] **Paso 3: Commit en ambos repos**

```bash
cd /home/eduardo/CEINCA-AI-OS && git add -A && git commit -m "refactor: mover contenido de clientes fuera de AI-OS a CEINCA-WORKSPACE"
cd /home/eduardo/CEINCA-WORKSPACE && git add -A && git commit -m "chore: recibir contenido de clientes movido desde CEINCA-AI-OS"
```

- [ ] **Paso 4: Verificar que CEINCA-AI-OS quedó sin `CLIENTS/`**

```bash
git -C /home/eduardo/CEINCA-AI-OS status --short
ls /home/eduardo/CEINCA-AI-OS | grep -i CLIENTS
```
Esperado: sin salida en el segundo comando.

---

### Task 3: Limpiar carpetas huérfanas y bloat operativo en CEINCA-AI-OS

**Files:**
- Modify: `CEINCA-AI-OS/Videos/` (huérfana, no declarada en CLAUDE.md)
- Modify: `CEINCA-AI-OS/assets/testimonial-janet-marquez/` (residuo de media ya untracked)
- Modify: `CEINCA-AI-OS/media-mvp/output/` (227M generado, no permanente)

- [ ] **Paso 1: Confirmar que nada de esto está trackeado en git (para no perder historial real por accidente)**

```bash
git -C /home/eduardo/CEINCA-AI-OS ls-files Videos/ assets/testimonial-janet-marquez/ media-mvp/output/
```
Esperado: sin salida (nada trackeado) — si algo aparece, detener y revisar antes de tocar.

- [ ] **Paso 2: Mover a archivo (no borrar) — usar la convención ya establecida en WORKSPACE**

```bash
mkdir -p /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-12
mv /home/eduardo/CEINCA-AI-OS/Videos /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-12/CEINCA-AI-OS-Videos-huerfana
mv /home/eduardo/CEINCA-AI-OS/assets/testimonial-janet-marquez /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-12/testimonial-janet-marquez
mv /home/eduardo/CEINCA-AI-OS/media-mvp/output /home/eduardo/CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-12/media-mvp-output
```

- [ ] **Paso 3: Verificar espacio recuperado en el working tree de AI-OS**

```bash
du -sh /home/eduardo/CEINCA-AI-OS
```
Esperado: notablemente menor a la medición previa (media-mvp/output solo eran 227M).

---

### Task 4: Reconciliar SKILLS/ (raíz, mayúscula) vs .claude/skills/ — CHECKPOINT MANUAL

**Files:**
- Review: `CEINCA-AI-OS/SKILLS/{ceinca-design,ceinca-ia,meta-ads-andromeda-expert}`
- Review: `CEINCA-AI-OS/.claude/skills/*` (16 skills reales de Claude Code)

Esta tarea NO tiene comandos automáticos — necesita que Eduardo mire el contenido de las 3 carpetas de `SKILLS/` y diga si son (a) skills reales de Claude Code mal ubicadas → fusionar en `.claude/skills/` con el formato correcto, o (b) documentación/referencia que casualmente se llama igual → renombrar a algo como `docs/referencias-ia/` para no chocar con `.claude/skills/`.

- [ ] **Paso 1: Mostrar el contenido para que Eduardo decida**

```bash
for d in ceinca-design ceinca-ia meta-ads-andromeda-expert; do
  echo "=== $d ==="; find /home/eduardo/CEINCA-AI-OS/SKILLS/$d -type f; echo
done
```

- [ ] **Paso 2 (bloqueado hasta decisión de Eduardo): ejecutar la fusión o el renombrado según lo que responda.**

---

### Task 5: Reconciliar duplicado divergente y mover tooling de Claude fuera de CEINCA-WORKSPACE

**Files:**
- Review: `CEINCA-WORKSPACE/sistema-personalizacion-linux-mint.md` vs `CEINCA-WORKSPACE/01 IDENTIDAD DE MARCA/MANUALES DE MARCA/sistema-personalizacion-linux-mint.md` (contenido distinto, confirmado por `diff`)
- Modify: mover a `CEINCA-AI-OS/docs/` una vez reconciliado
- Modify: `CEINCA-WORKSPACE/GUIA_MAESTRA_IA_GITHUB_CLAUDE_CODE_VIDEO_CEINCA.md` → `CEINCA-AI-OS/docs/`
- Modify: `CEINCA-WORKSPACE/01 IDENTIDAD DE MARCA/MANUALES DE MARCA/Guia imagen Claude code.png` → `CEINCA-AI-OS/docs/`

- [ ] **Paso 1: Ver el diff exacto entre las dos versiones para decidir cuál es la vigente**

```bash
diff /home/eduardo/CEINCA-WORKSPACE/sistema-personalizacion-linux-mint.md \
     "/home/eduardo/CEINCA-WORKSPACE/01 IDENTIDAD DE MARCA/MANUALES DE MARCA/sistema-personalizacion-linux-mint.md"
```
Con el diff en mano, Eduardo confirma cuál queda como versión final (o si hay que fusionar contenido de ambas).

- [ ] **Paso 2: Mover la versión final (una sola) y el resto de tooling suelto a CEINCA-AI-OS/docs/**

```bash
mkdir -p /home/eduardo/CEINCA-AI-OS/docs/sistema
mv /home/eduardo/CEINCA-WORKSPACE/sistema-personalizacion-linux-mint.md /home/eduardo/CEINCA-AI-OS/docs/sistema/ # (o la otra version, segun Paso 1)
rm "/home/eduardo/CEINCA-WORKSPACE/01 IDENTIDAD DE MARCA/MANUALES DE MARCA/sistema-personalizacion-linux-mint.md"  # la descartada, ya reconciliada
mv /home/eduardo/CEINCA-WORKSPACE/GUIA_MAESTRA_IA_GITHUB_CLAUDE_CODE_VIDEO_CEINCA.md /home/eduardo/CEINCA-AI-OS/docs/
mv "/home/eduardo/CEINCA-WORKSPACE/01 IDENTIDAD DE MARCA/MANUALES DE MARCA/Guia imagen Claude code.png" /home/eduardo/CEINCA-AI-OS/docs/
```

- [ ] **Paso 3: Commit en ambos repos**

```bash
cd /home/eduardo/CEINCA-AI-OS && git add -A && git commit -m "docs: recibir documentacion de tooling Claude que vivia en CEINCA-WORKSPACE"
cd /home/eduardo/CEINCA-WORKSPACE && git add -A && git commit -m "chore: mover documentacion de tooling Claude a CEINCA-AI-OS"
```

---

### Task 6: Clasificar archivos sueltos en la raíz de CEINCA-WORKSPACE

**Files:**
- Review: `003-CIRCULAR0001.pdf`, `CUNAGUARO.html`, `Gems.zip`, `Recording_2026_09_01.webm`

- [ ] **Paso 1: Mostrar tamaño y tipo de cada uno para clasificar**

```bash
file /home/eduardo/CEINCA-WORKSPACE/{003-CIRCULAR0001.pdf,CUNAGUARO.html,Gems.zip,Recording_2026_09_01.webm} 2>/dev/null
ls -la /home/eduardo/CEINCA-WORKSPACE/{003-CIRCULAR0001.pdf,CUNAGUARO.html,Gems.zip,Recording_2026_09_01.webm} 2>/dev/null
```

- [ ] **Paso 2 (requiere una mirada de Eduardo o de Claude abriendo cada uno): mover cada archivo a la carpeta de cliente/proyecto que corresponda, o a `CEINCA-WORKSPACE/CEINCA/` si son propios de la marca, o a `_archivo/2026-09-12/` si son basura confirmada.**

---

### Task 7: Unificar convención `Clientes - Legales/` → `04 CLIENTES/`

**Files:**
- Modify: `CEINCA-WORKSPACE/Clientes - Legales/{Caso Lucia Cedula, Frima personal AZUCENA}` → `CEINCA-WORKSPACE/04 CLIENTES/<CLIENTE>/legal/`

- [ ] **Paso 1: Listar contenido actual**

```bash
find "/home/eduardo/CEINCA-WORKSPACE/Clientes - Legales" -maxdepth 2
```

- [ ] **Paso 2: Mover cada caso a su propia carpeta de cliente dentro de Clientes-Asesoria, bajo `legal/`**

```bash
mkdir -p "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/LUCIA - CEDULA/LEGAL"
mkdir -p "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/AZUCENA/LEGAL"
mv "/home/eduardo/CEINCA-WORKSPACE/Clientes - Legales/Caso Lucia Cedula"/* "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/LUCIA - CEDULA/LEGAL/"
mv "/home/eduardo/CEINCA-WORKSPACE/Clientes - Legales/Frima personal AZUCENA"/* "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/AZUCENA/LEGAL/"
rmdir "/home/eduardo/CEINCA-WORKSPACE/Clientes - Legales/Caso Lucia Cedula" "/home/eduardo/CEINCA-WORKSPACE/Clientes - Legales/Frima personal AZUCENA" "/home/eduardo/CEINCA-WORKSPACE/Clientes - Legales" 2>/dev/null; true
```
Nota: los nombres finales de carpeta (`lucia-cedula`, `azucena`) son una propuesta razonable — ajustar si Eduardo prefiere otro nombre de cliente.

- [ ] **Paso 3: Commit**

```bash
cd /home/eduardo/CEINCA-WORKSPACE && git add -A && git commit -m "refactor: unificar convencion de nombres de Clientes - Legales bajo 04 CLIENTES"
```

---

### Task 8: Introducir subcarpetas de servicio en clientes multiservicio y consolidar duplicado FONPYME

**Files:**
- Modify: `04 CLIENTES/{Viajes Harmar, orlando_fonpyme, NOVA AUDITOR GEM, Yilviana R}` → introducir `redes-sociales/`, `legal/`, `formacion-curso/` según lo que ya se les ofrece
- Modify: `03 FORMACION/JORNADAS SEPTIEMBRE - DICIEMBRE 2026/FONPYME - JUNIOR TORRES CURSO` → `04 CLIENTES/ORLANDO - FONPYME/FORMACION/`

Este task requiere que Eduardo confirme qué servicio(s) tiene cada cliente antes de mover archivos ciegamente (evita adivinar y mover a la carpeta equivocada). Listar primero, mover después.

- [ ] **Paso 1: Listar contenido actual de cada carpeta de cliente**

```bash
for c in "Viajes Harmar" orlando_fonpyme "NOVA AUDITOR GEM" "Yilviana R"; do
  echo "=== $c ==="; find "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/$c" -maxdepth 1; echo
done
```

- [ ] **Paso 2 (con confirmación de Eduardo por cliente): crear subcarpetas de servicio y mover el contenido correspondiente.**

- [ ] **Paso 3: Consolidar FONPYME**

```bash
mkdir -p "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/ORLANDO - FONPYME/FORMACION"
mv "/home/eduardo/CEINCA-WORKSPACE/03 FORMACION/JORNADAS SEPTIEMBRE - DICIEMBRE 2026/FONPYME - JUNIOR TORRES CURSO"/* \
   "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/ORLANDO - FONPYME/FORMACION/"
```

- [ ] **Paso 4: Commit**

```bash
cd /home/eduardo/CEINCA-WORKSPACE && git add -A && git commit -m "refactor: subcarpetas de servicio por cliente y consolidacion FONPYME"
```

---

### Task 9: Mover contenido de negocio suelto en home a CEINCA-WORKSPACE

**Files:**
- Modify: `~/lexia todos/`, `~/lexia-landing/`, `~/lexia-landing.zip` → reconciliar contra `CEINCA-WORKSPACE/06 TECNOLOGIA/LEXIA LANDING/` (ya existe y está vivo)
- Modify: `~/ADECUACION ESTATUTOS...ASOCIACIÓN CIVIL ESCUELA AGROECOLÓGICA MONTALBÁN.docx.md` → `04 CLIENTES/ESCUELA AGROECOLOGICA MONTALBAN/LEGAL/`
- Modify: `~/Saren_solicitud de copia certificada.mp4` → carpeta legal del cliente SAREN correspondiente (confirmar cuál cliente con Eduardo, el nombre solo no lo identifica)

- [ ] **Paso 1: Comparar `~/lexia-landing/` (si aún existe suelto en home) contra `CEINCA-WORKSPACE/06 TECNOLOGIA/LEXIA LANDING/` (la que está viva y deployada)**

```bash
ls -la /home/eduardo/lexia-landing 2>/dev/null
diff -rq /home/eduardo/lexia-landing /home/eduardo/CEINCA-WORKSPACE/06 TECNOLOGIA/LEXIA LANDING 2>/dev/null | head -20
```
Si son iguales o la de home es una copia vieja: borrar la de home (o archivarla) y quedarse solo con la de WORKSPACE. Si `~/lexia-landing.zip` es un zip del mismo contenido: mismo tratamiento.

- [ ] **Paso 2: `~/lexia todos/` — revisar contenido antes de decidir destino (puede ser material de campaña que complementa `_archivo/2026-09-10/LEXIA`, ya archivado)**

```bash
find "/home/eduardo/lexia todos" -maxdepth 2
```

- [ ] **Paso 3: Mover el documento de Escuela Agroecológica Montalbán**

```bash
mkdir -p "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/ESCUELA AGROECOLOGICA MONTALBAN/LEGAL"
mv "/home/eduardo/ADECUACION ESTATUTOS...ASOCIACIÓN CIVIL ESCUELA AGROECOLÓGICA MONTALBÁN.docx.md" \
   "/home/eduardo/CEINCA-WORKSPACE/04 CLIENTES/ESCUELA AGROECOLOGICA MONTALBAN/LEGAL/"
```
(Ajustar el nombre exacto del archivo — verificar con `ls ~/ADECUACION*` antes de mover, el nombre real puede diferir levemente del listado del audit.)

- [ ] **Paso 4: Confirmar con Eduardo a qué cliente pertenece el archivo de SAREN antes de moverlo (SAREN es el trámite, no el cliente).**

- [ ] **Paso 5: Commit en WORKSPACE**

```bash
cd /home/eduardo/CEINCA-WORKSPACE && git add -A && git commit -m "chore: recibir archivos de cliente sueltos que vivian en home"
```

---

### Task 10: Agrupar proyectos standalone de home en ~/repos/ y limpiar basura confirmada

**Files:**
- Modify: `~/ceinca`, `~/webcam-app`, `~/mi-web-3d`, `~/OpenMontage`, `~/ig-viral-tracker`, `~/Proyecto_Hermes`, `~/mtkclient` → `~/repos/`
- Delete (tras confirmación): `~/CEINCA-AI-OS-git-backup.tar.gz` (428M), `~/google-cloud-cli-linux-x86_64.tar.gz` (87M), `~/protonvpn-stable-release_1.0.8_all.deb`, `~/.claude.json.tmp.*` viejos, `~/lexia-landing.zip` (si Task 9 confirma que es duplicado)

- [ ] **Paso 1: Crear `~/repos/` y mover los proyectos (son repos git independientes, `mv` normal es seguro — no cruza working trees de git como en Task 2)**

```bash
mkdir -p /home/eduardo/repos
mv /home/eduardo/ceinca /home/eduardo/webcam-app /home/eduardo/mi-web-3d \
   /home/eduardo/OpenMontage /home/eduardo/ig-viral-tracker \
   /home/eduardo/Proyecto_Hermes /home/eduardo/mtkclient \
   /home/eduardo/repos/
```

- [ ] **Paso 2: Verificar que cada uno sigue siendo un repo git funcional tras el move**

```bash
for d in /home/eduardo/repos/*/; do
  echo "=== $d ==="; git -C "$d" status --short --branch 2>&1 | head -2
done
```

- [ ] **Paso 3: Si `git-wip-checkpoint` referencia rutas absolutas de estos repos, actualizar esas rutas al nuevo `~/repos/<nombre>`**

```bash
crontab -l | grep -iE "ceinca$|webcam-app|mi-web-3d|OpenMontage|ig-viral-tracker|Proyecto_Hermes|mtkclient"
```
Editar el script referenciado para que apunte a las nuevas rutas bajo `~/repos/`.

- [ ] **Paso 4: Borrar basura confirmada (checkpoint: mostrar antes de borrar, no borrar en automático sin que Eduardo vea la lista)**

```bash
ls -la /home/eduardo/CEINCA-AI-OS-git-backup.tar.gz /home/eduardo/google-cloud-cli-linux-x86_64.tar.gz \
       /home/eduardo/protonvpn-stable-release_1.0.8_all.deb /home/eduardo/.claude.json.tmp.* 2>/dev/null
```
Tras confirmación explícita: `rm` cada uno.

---

### Task 11: Mover personal suelto y capturas de pantalla

**Files:**
- Modify: `~/Captura de pantalla*.png`, `~/my_photo-1.jpg` → `~/Documentos/Personal/`

- [ ] **Paso 1: Mover**

```bash
mkdir -p /home/eduardo/Documentos/Personal
mv /home/eduardo/Captura\ de\ pantalla*.png /home/eduardo/my_photo-1.jpg /home/eduardo/Documentos/Personal/ 2>/dev/null; true
```

---

### Task 12: Integrar Agy con CEINCA-AI-OS como base de conocimiento compartida

**Files:**
- Modify: `~/.gemini/antigravity-cli/config.json` → agregar `/home/eduardo/CEINCA-AI-OS` a `trustedWorkspaces`
- Create: `CEINCA-AI-OS/docs/agy-integracion.md` (documentar qué puede leer Agy y qué no)

**Interfaces:**
- `KNOWLEDGE/`, `RULES/`, `AGENTS/` de CEINCA-AI-OS son markdown puro → consumibles directamente por Agy vía `--add-dir /home/eduardo/CEINCA-AI-OS` sin adaptación.
- `.claude/skills/` y `.claude/agents/` usan el formato de Skill/Agent de Claude Code → Agy (Gemini CLI) NO los interpreta nativamente (tiene su propio sistema de skills en `~/.gemini/antigravity-cli/builtin/skills`, formato distinto) — puente/traducción queda **fuera de alcance de este plan**, es una fase aparte.

- [ ] **Paso 1: Agregar CEINCA-AI-OS a trustedWorkspaces de Agy**

```bash
python3 - <<'EOF'
import json
p = "/home/eduardo/.gemini/antigravity-cli/config.json"
with open(p) as f:
    cfg = json.load(f)
ws = cfg.get("trustedWorkspaces", [])
new_path = "/home/eduardo/CEINCA-AI-OS"
if new_path not in ws:
    ws.append(new_path)
cfg["trustedWorkspaces"] = ws
with open(p, "w") as f:
    json.dump(cfg, f, indent=2)
print("OK:", cfg["trustedWorkspaces"])
EOF
```

- [ ] **Paso 2: Verificar**

```bash
python3 -c "import json; print(json.load(open('/home/eduardo/.gemini/antigravity-cli/config.json'))['trustedWorkspaces'])"
```
Esperado: incluye `/home/eduardo/CEINCA-AI-OS`.

- [ ] **Paso 3: Documentar el alcance real (qué comparte, qué no) para que futuras sesiones no asuman paridad total**

Crear `CEINCA-AI-OS/docs/agy-integracion.md` con el contenido del bloque "Interfaces" de arriba, más un recordatorio explícito: **NUNCA usar `--add-dir` apuntando a `$HOME` completo** (bug real corregido en `agy-continue` el 2026-09-12, ver memoria `reference_agy-delegation-system`) — el `--add-dir` para tareas de este árbol debe ser `/home/eduardo/CEINCA-AI-OS` o una subcarpeta específica, nunca home entero.

- [ ] **Paso 4: Commit**

```bash
cd /home/eduardo/CEINCA-AI-OS && git add docs/agy-integracion.md && git commit -m "docs: documentar integracion Agy con base de conocimiento compartida"
```

---

## Fuera de alcance de este plan (documentar, no ejecutar ahora)

- Auditoría profunda de `~/Descargas` y `~/Escritorio` (482M) — casi seguro tienen más archivos de cliente sin clasificar ("Salto Angel", "FUNDESTA" ya vistos ahí). Necesita su propio plan.
- Puente de formato entre `.claude/skills/`/`.claude/agents/` (Claude Code) y `~/.gemini/antigravity-cli/builtin/skills` (Agy) — investigación aparte antes de prometer paridad de herramientas, no solo de conocimiento en texto plano.
- Triage interno de los dumps de video ya archivados en `CEINCA-WORKSPACE/90 ARCHIVO HISTORICO/2026-09-10/LEXIA` y `04 CLIENTES/CASA CAMPO BARINAS/video` — no se tocan, siguen en cuarentena reversible.
- Decisión de contenido de `~/lexia todos/` más allá de lo cubierto en Task 9 Paso 2, si resulta ser más que un simple duplicado.
