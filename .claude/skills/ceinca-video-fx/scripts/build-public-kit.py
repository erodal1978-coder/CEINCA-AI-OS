#!/usr/bin/env python3
"""build-public-kit.py <carpeta-de-salida>

Construye el KIT DE REGALO «Video FX» a partir de esta skill, SIN ninguna marca:
nada de CEINCA, de @soyeduardo.ia ni de Eduardo (ni temas, ni perfiles, ni logo, ni ejemplos, ni bitácoras,
ni créditos). Es repetible: se corre cada vez que cambie la skill y termina verificando con un escaneo de marca.

Salida:
  <salida>/claude-code/video-fx/        carpeta de la skill (para .claude/skills/)
  <salida>/claude-ai/video-fx.zip       zip de la skill para subir a claude.ai
  <salida>/LEEME_PRIMERO.md · PROMPT_ADAPTAR_MARCA.md
  <salida>/Video_Fx_Eduardo_IA.zip      paquete de regalo (todo lo anterior)   [--nombre-zip para cambiarlo]
Este script NO se incluye en el kit.
"""
import os, re, sys, shutil, subprocess, zipfile, pathlib, json

SKILL = pathlib.Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
if not args:
    sys.exit(__doc__)
OUT = pathlib.Path(args[0]).resolve()
ZIP_NAME = 'Video_Fx_Eduardo_IA.zip'
for a in sys.argv[1:]:
    if a.startswith('--nombre-zip='):
        ZIP_NAME = a.split('=', 1)[1]
KIT = OUT / 'claude-code' / 'video-fx'
PK = SKILL / 'scripts' / 'public-kit'

# ---------------------------------------------------------------- 1) copia filtrada
EXCL_DIRS = {'node_modules', 'dist', 'out', '.cache', '.build', 'public-kit', 'frames', 'clips', 'brand', 'clientes'}
EXCL_FILES = {'package-lock.json', 'build-public-kit.py', 'brand.lock.json',
              'ceinca-social.css', 'ceinca-guias.css', 'marca-soyeduardo-ia.css', 'soyeduardo-ia.json',
              'reel-marca-ceinca-social.json', 'gsap.min.js'}  # GSAP se instala con npm (licencia GreenSock): no se redistribuye

def ignore(d, names):
    skip = set()
    for n in names:
        p = pathlib.Path(d) / n
        if p.is_dir() and n in EXCL_DIRS:
            # 'frames'/'clips'/'brand' solo se excluyen dentro de examples/ y vendor/ (no dentro de effects/)
            skip.add(n)
        elif n in EXCL_FILES or n.endswith('.mp4'):
            skip.add(n)
    return skip

if OUT.exists():
    shutil.rmtree(OUT)
KIT.parent.mkdir(parents=True)
shutil.copytree(SKILL, KIT, ignore=ignore)
(KIT / 'themes' / 'marcas').mkdir(parents=True, exist_ok=True)
(KIT / 'vendor' / 'brand').mkdir(parents=True, exist_ok=True)
shutil.copy(PK / 'mi-marca.json', KIT / 'themes' / 'marcas' / 'mi-marca.json')
shutil.copy(PK / 'logo.svg', KIT / 'vendor' / 'brand' / 'logo.svg')
(KIT / 'themes' / 'clientes').mkdir(exist_ok=True)
(KIT / 'themes' / 'clientes' / '.gitkeep').write_text('')

# ---------------------------------------------------------------- 2) contenido neutro de ejemplo (por efecto)
# Cada tabla se aplica a effects/<id>/index.html, effects/<id>/params.example.json y examples/<id>.json
CONTENT = {
 'camara-continua': [("'Constituye'", "'Graba'"), ("'Registra'", "'Edita'"), ("'Opera'", "'Publica'"),
                     ('"Constituye"', '"Graba"'), ('"Registra"', '"Edita"'), ('"Opera"', '"Publica"'),
                     ("sello: 'CEINCA'", "sello: 'MARCA'"), ('"sello": "CEINCA"', '"sello": "MARCA"')],
 'checklist': [("'Checklist **mercantil**'", "'Checklist **de lanzamiento**'"),
               ("['Acta firmada', 'Registro vigente', 'Capital adecuado', 'Libros al día']", "['Guion aprobado', 'Voz grabada', 'Efectos aplicados', 'Audio nivelado']"),
               ('Antes de ir al **registro**', 'Antes de **publicar**'),
               ('Acta firmada por todos los socios', 'Guion aprobado por todo el equipo'),
               ('Capital social adecuado', 'Efectos y marca aplicados'),
               ('Libros legales al día', 'Audio nivelado y sin silencios'),
               ('Poder del representante', 'Subtítulos revisados')],
 'collage-papel': [('Registra tu empresa **sin filas**', 'Crea tu video **sin editor**'),
                   ('Todo el trámite, desde tu casa.', 'Todo el proceso, desde tu computador.'),
                   ("sello: 'CEINCA'", "sello: 'MARCA'"), ('"sello": "CEINCA"', '"sello": "MARCA"')],
 'consola-macos': [("titulo: 'ceinca — zsh'", "titulo: 'video-fx — zsh'"),
                   ("['$ ceinca registrar --empresa', '> Validando documentos...', '+ Acta conforme', '+ Registro enviado']",
                    "['$ video-fx render --efecto portada', '> Validando zonas seguras...', '+ Marca aplicada', '+ Video exportado']"),
                   ('ceinca — registro mercantil', 'video-fx — render'),
                   ('$ ceinca registrar --empresa', '$ video-fx render --efecto portada'),
                   ('> Validando documentos...', '> Validando zonas seguras...'),
                   ('+ Acta conforme', '+ Tipografías cargadas'), ('+ Capital verificado', '+ Marca aplicada'),
                   ('$ ceinca enviar --saren', '$ video-fx exportar --mp4'),
                   ('+ Registro enviado en línea', '+ Video exportado en 1080×1920')],
 'corta-pega': [("['CEINCA™']", "['MARCA']")],
 'diagrama-nodos': [('Así viaja tu **trámite**', 'Así viaja tu **video**'), ("etiqueta: 'Registro'", "etiqueta: 'Publicar'"),
                    ('"etiqueta": "Registro"', '"etiqueta": "Publicar"')],
 'grafica-crece': [('Constituciones registradas', 'Videos publicados')],
 'mundo-app': [('"centro": "CEINCA"', '"centro": "MARCA"'), ("centro: 'CEINCA'", "centro: 'MARCA'"),
               ('"titulo": "Actas"', '"titulo": "Videos"'), ('"titulo": "Blindaje"', '"titulo": "Marca"'), ('"titulo": "Capital"', '"titulo": "Alcance"')],
 'muro-titulares': [('Nuevo criterio del Registro Mercantil sobre capital social', 'Nueva función automatiza tus reportes semanales'),
                    ('SAREN actualiza los requisitos de actas', 'Actualización: nuevas plantillas disponibles'),
                    ('SAREN actualiza requisitos de actas', 'Actualización: nuevas plantillas disponibles'),
                    ('Reconversión: qué cambia para tu empresa', 'Tendencias: qué cambia en video corto'),
                    ('Plazos de inscripción: lo que nadie te dijo', 'Retención: lo que nadie te dijo'),
                    ('Inscripción: lo que nadie te dijo', 'Retención: lo que nadie te dijo'),
                    ('Libros legales: multa por no sellarlos a tiempo', 'Error común: subtítulos fuera de la zona segura'),
                    ('Multa por no sellar los libros a tiempo', 'Error común: subtítulos fuera de la zona segura'),
                    ('Cómo blindar tu empresa antes de fin de año', 'Cómo preparar tus videos antes de fin de año'),
                    ('"fuente": "Registro"', '"fuente": "Producto"'), ('"fuente": "SAREN"', '"fuente": "Novedades"'),
                    ('"fuente": "Economía"', '"fuente": "Tendencias"'), ('"fuente": "Plazos"', '"fuente": "Datos"'),
                    ('"fuente": "Libros"', '"fuente": "Consejo"'), ('"fuente": "Blindaje"', '"fuente": "Plan"')],
 'orbita': [("centro: 'CEINCA'", "centro: 'MARCA'"), ("['Actas', 'Capital', 'Socios', 'Registro', 'Libros']", "['Guion', 'Voz', 'Efectos', 'Música', 'Subtítulos']"),
            ('"etiqueta": "Socios"', '"etiqueta": "Guion"'), ('"etiqueta": "Actas"', '"etiqueta": "Voz"'),
            ('"etiqueta": "Registro"', '"etiqueta": "Música"'), ('"etiqueta": "Capital"', '"etiqueta": "Efectos"')],
 'pasos-progreso': [("'Reserva el nombre'", "'Define el guion'"), ("'Verifica que esté disponible en el registro.'", "'Elige el tema y el gancho de los 3 primeros segundos.'"),
                    ("'Redacta el acta'", "'Graba la voz'"), ("'Con el objeto social y el capital.'", "'Una toma limpia, sin silencios largos.'"),
                    ("'Registra en línea'", "'Publica el reel'"), ("'Sube los documentos al sistema.'", "'Exporta el MP4 y súbelo a tu red.'"),
                    ('Redacta el **acta**', 'Graba la **voz**'), ('Objeto social, capital y administración, bien definidos.', 'Una toma limpia, sin silencios largos.'),
                    ('Registra en **línea**', 'Publica en **línea**'), ('Sube los documentos y espera la revisión.', 'Exporta el MP4 y súbelo a tu red.'),
                    ('Reserva el nombre', 'Define el guion'), ('Verifica que esté disponible en el registro.', 'Elige el tema y el gancho de los 3 primeros segundos.')],
 'portada': [("'ALERTA MERCANTIL'", "'NOVEDAD'"), ("'Tu empresa **sin** sorpresas'", "'Tu contenido **sin** esfuerzo'"),
             ('"Alerta mercantil"', '"Novedad"'), ('Tu acta **no** pasa en el registro', 'Tu video **no** pasa de largo')],
 'rompe-marco': [("'CEINCA™ FX'", "'FX'"), ('"CEINCA™ FX"', '"FX"'), ("|| 'CEINCA™'", "|| 'MARCA'")],
 'slide-interfaz': [("Comenta **FIEBRU'O** y te lo envío", 'Comenta **PALABRA** y te lo envío')],
 'telefono-chat': [("'CEINCA Mercantil'", "'Tu Marca'"), ('"CEINCA Mercantil"', '"Tu Marca"'),
                   ('¿Puedo registrar mi empresa en línea?', '¿Puedo crear un video sin editor?'),
                   ('Con documentos listos, muy poco.', 'Con tu guion listo, muy poco.'), ('Con los documentos listos, muy poco.', 'Con tu guion listo, muy poco.'),
                   ('.row.ceinca', '.row.marca'), ("'row ceinca'", "'row marca'"), ("'ceinca'", "'marca'"), ('"ceinca"', '"marca"'), ('"ceinca" |', '"marca" |')],
 'texto-cristal': [('Tu empresa **vale más** cuando está en regla', 'Tu video **vale más** cuando se ve profesional')],
 'zoom-atraves': [('Meses de **trámites**', 'Horas de **edición**'), ('Tu empresa **en línea**', 'Tu video **en minutos**')],
 'catalogo-lateral': [('CEINCA · FX', 'VIDEO · FX')],
}

EXTRA = {'examples/reel-voz.example.json': ['muro-titulares', 'rompe-marco', 'corta-pega', 'grafica-crece', 'portada', 'texto-cristal', 'mundo-app', 'checklist', 'zoom-atraves', 'pasos-progreso', 'slide-interfaz']}

def read(p):
    return p.read_text(encoding='utf-8')

def write(p, t):
    p.write_text(t, encoding='utf-8')

for eid, rules in CONTENT.items():
    files = [KIT / 'effects' / eid / 'index.html', KIT / 'effects' / eid / 'params.example.json', KIT / 'examples' / f'{eid}.json']
    for f in files:
        if not f.exists():
            continue
        t = read(f)
        for old, new in rules:
            t = t.replace(old, new)
        write(f, t)

for rel, ids in EXTRA.items():
    f = KIT / rel
    if f.exists():
        tx = read(f)
        for eid in ids:
            for a, b in CONTENT[eid]:
                tx = tx.replace(a, b)
        write(f, tx)

# ---------------------------------------------------------------- 3) reemplazos globales (código, ejemplos, docs)
NEUTRAL_BG = '111418'
GLOBAL = [
    ('ceinca-video-fx', 'video-fx'), ('ceinca-editor', 'video-fx'), ('ceinca-demo-', 'fx-demo-'), ('__ceinca', '__fx'),
    ('CEINCA Video FX', 'Video FX'), ('CEINCA VIDEO FX', 'VIDEO FX'),
    ('marca-soyeduardo-ia', 'estilo-dark-tech'), ('cliente-eduardo-ia', 'estilo-dark-tech'),
    ('ceinca-social', 'estilo-dark-tech'), ('ceinca-guias', 'estilo-red-glow'),
    ("'@ceinca.mercantil'", "'@tu_usuario'"), ('@ceinca.mercantil', '@tu_usuario'), ('@soyeduardo.ia', '@tu_usuario'),
    ('assets/eduardo-recorte.png', 'assets/sujeto-recorte.png'), ('DE LA SKILL DE CEINCA', 'EN LA DESCRIPCIÓN'),
    ("FIEBRU'O", 'PALABRA'), ('FIEBRU\\\'O', 'PALABRA'), ('Mecánicas con marca CEINCA', 'Mecánicas con tu marca'),
    ('0x0B0D12', f'0x{NEUTRAL_BG}'), ('0x0B0F17', f'0x{NEUTRAL_BG}'),
    ("'#0B0D12'", f"'#{NEUTRAL_BG}'"), ("'#1A1E27'", "'#1B2027'"), ("'#F3F0E8'", "'#F4F6F8'"), ("'#8B93A7'", "'#9AA5B1'"), ("'#2A2F3B'", "'#2F3742'"),
    ('border: 3px solid #0B0D12;', f'border: 3px solid #{NEUTRAL_BG};'),
    ('rgba(198, 255, 61, 0.88)', 'rgba(255, 255, 255, 0.88)'), ("'#C6FF3D'", "'#3DDC97'"),
    ('0x122A63', f'0x{NEUTRAL_BG}'), ('0xC6FF3D', '0x3DDC97'), ('border: 3px solid #C6FF3D;', 'border: 3px solid rgba(255, 255, 255, 0.88);'),
    ('aprobado por Eduardo en la v5 (20-10-2026)', 'valor recomendado'), (' de CEINCA / `@tu_usuario`', ''), ('"yo"\\|"ceinca"', '"yo"\\|"marca"'),
]
TEXT_EXT = ('.html', '.json', '.mjs', '.sh', '.md', '.py', '.js', '.css', '.svg')
for dp, dn, fn in os.walk(KIT):
    rel = pathlib.Path(dp).relative_to(KIT).parts
    if rel and rel[0] in ('vendor', 'node_modules'):
        continue
    for f in fn:
        if not f.endswith(TEXT_EXT):
            continue
        p = pathlib.Path(dp) / f
        t = read(p)
        o = t
        for old, new in GLOBAL:
            t = t.replace(old, new)
        if t != o:
            write(p, t)

# ---------------------------------------------------------------- 4) parches puntuales de código
def patch(rel, pairs, regex=False):
    p = KIT / rel
    t = read(p)
    for old, new in pairs:
        if regex:
            t2 = re.sub(old, new, t, flags=re.S)
            assert t2 != t, f'{rel}: patrón sin efecto: {old[:60]}'
            t = t2
        else:
            assert old in t, f'{rel}: no encontrado: {old[:70]}'
            t = t.replace(old, new)
    write(p, t)

# sync-brand: solo temas JSON (clientes/marcas/estilos); los tokens de otro manual son opcionales
patch('scripts/sync-brand.mjs', [
    ("// Única fuente de verdad: ceinca-design/references/tokens.md (modo Social/Redes)\n// y editorial-guides.md (modo Guías). Aquí NO se fija ningún valor de marca:\n// solo se declara qué token cumple qué rol semántico.",
     "// Fuente de verdad de cada tema: su json en themes/marcas, themes/estilos o themes/clientes (colores y tipografías).\n// Opcional: un manual con tokens.md / editorial-guides.md (--tokens, --guias). Aquí NO se fija ningún valor de marca."),
    ("const REPO_TOKENS = path.resolve(SKILL, '../ceinca-design/references/tokens.md');", "const REPO_TOKENS = path.resolve(SKILL, 'themes/tokens.md'); // opcional: si no existe se omite"),
    ("const REPO_GUIAS = path.resolve(SKILL, '../ceinca-design/references/editorial-guides.md');", "const REPO_GUIAS = path.resolve(SKILL, 'themes/editorial-guides.md'); // opcional: si no existe se omite"),
    ("--marcas    carpeta de json de MARCAS PROPIAS de Eduardo (default: themes/marcas) → tema marca-<slug>", "--marcas    carpeta de json de MARCAS PROPIAS (default: themes/marcas) → tema marca-<slug>"),
    ("// Rol técnico (bloques de código/consola). No es marca CEINCA: tokens.md no lo define, por eso vive aquí", "// Rol técnico (bloques de código/consola). tokens.md no lo define, por eso vive aquí"),
    ("c('Azul CEINCA')", "c('Azul Marca')"), ("nombre: 'estilo-dark-tech',\n    colores: {\n      bg: t('--navy')", "nombre: 'social',\n    colores: {\n      bg: t('--navy')"),
    ("nombre: 'estilo-red-glow',", "nombre: 'guias',"),
    ("marcas propias de Eduardo, no clientes", "marcas propias, no clientes"),
])
patch('scripts/sync-brand.mjs', [
    (r"const tokensBuf = Buffer\.from\(read\(TOKENS\)\);\nconst temas = \[socialTheme\(tokensBuf\.toString\('utf8'\)\)\];\nlet guiasBuf = null;\nif \(GUIAS\) \{ guiasBuf = Buffer\.from\(read\(GUIAS\)\); temas\.push\(guiasTheme\(guiasBuf\.toString\('utf8'\)\)\); \}",
     "let tokensBuf = null, guiasBuf = null;\nconst temas = [];\nif (fs.existsSync(TOKENS)) { tokensBuf = Buffer.from(read(TOKENS)); temas.push(socialTheme(tokensBuf.toString('utf8'))); }\nif (GUIAS && fs.existsSync(GUIAS)) { guiasBuf = Buffer.from(read(GUIAS)); temas.push(guiasTheme(guiasBuf.toString('utf8'))); }"),
    (r"tokens: \{ archivo: rel\(TOKENS\), sha256: sha\(tokensBuf\) \},", "tokens: tokensBuf ? { archivo: rel(TOKENS), sha256: sha(tokensBuf) } : null,"),
], regex=True)

# check.sh: la validación de «keyword exacta» era de una campaña concreta
patch('scripts/check.sh', [
    (r"      const ctb=j\.escenas\.filter.*?\n", ""),
    (r"      console\.log\(ctb\?.*?\n", ""),
    (r"okSeq&&ctb&&", "okSeq&&"),
], regex=True)
patch('scripts/check.sh', [("badges 1..N consecutivos y keyword exacta.", "badges 1..N consecutivos.")]) if 'keyword exacta.' in read(KIT / 'scripts/check.sh') else None

# GSAP: no viaja en el kit; render.mjs lo toma de node_modules (npm install) y check.sh lo acepta ahí
patch('scripts/render.mjs', [("  cp(path.join(SKILL, 'vendor/gsap'), path.join(dir, 'vendor/gsap'));",
"""  { // GSAP no se redistribuye en el kit: se toma de node_modules (npm install) o de vendor/gsap si existe
    const g1 = path.join(SKILL, 'vendor/gsap/gsap.min.js'), g2 = path.join(SKILL, 'node_modules/gsap/dist/gsap.min.js');
    const g = fs.existsSync(g1) ? g1 : fs.existsSync(g2) ? g2 : null;
    if (!g) die(3, 'falta GSAP: ejecuta primero  npm install  (en la carpeta video-fx)');
    cp(g, path.join(dir, 'vendor/gsap/gsap.min.js'));
  }""")])
patch('scripts/check.sh', [('[ -f "$SKILL/vendor/gsap/gsap.min.js" ] && [ -f "$SKILL/vendor/gsap/LICENSE.md" ] && ok "GSAP vendorizado con licencia" || bad "falta vendor/gsap"',
 '{ [ -f "$SKILL/vendor/gsap/gsap.min.js" ] || [ -f "$SKILL/node_modules/gsap/dist/gsap.min.js" ]; } && [ -f "$SKILL/vendor/gsap/LICENSE.md" ] && ok "GSAP disponible (npm install) con su nota de licencia" || bad "falta GSAP: ejecuta npm install"')])
(KIT / 'vendor' / 'gsap' / 'LICENSE.md').write_text("""# GSAP — licencia

Este kit **no incluye** `gsap.min.js`: se instala desde el paquete oficial con `npm install` (dependencia `gsap` de `package.json`) y `render.mjs` lo toma de `node_modules/gsap/dist/gsap.min.js`.

GSAP es de GreenSock y se usa bajo su «Standard "no charge" license»: https://gsap.com/standard-license
Lee sus condiciones vigentes antes de usarlo o redistribuirlo; este kit no te concede ningún derecho sobre GSAP.
""", encoding='utf-8')

# logo: el marcador neutro reemplaza la insignia de marca
patch('scripts/badge.mjs', [("vendor/brand/insignia-principal.svg", "vendor/brand/logo.svg")])

# grabar-demo: paleta de respaldo neutra (si el tema no se encuentra)
patch('scripts/grabar-demo.mjs', [
    ("    bg: '#111418',", "    bg: '#111418',"),
])

# package.json: nombre neutro
pj = json.loads(read(KIT / 'package.json'))
pj['name'] = 'video-fx'
pj.pop('description', None)
write(KIT / 'package.json', json.dumps(pj, indent=2, ensure_ascii=False) + '\n')

# ---------------------------------------------------------------- 5) SKILL.md neutro
sk = read(KIT / 'SKILL.md')

DESC = ("Efectos de video por código para Reels, TikTok, YouTube y carruseles de Instagram (HTML/GSAP + FFmpeg, sin Remotion): 27 plantillas HTML "
        "(titulares, checklist, gráfica, teléfono y chat, consola, diagrama de nodos, bento, barra de prompt, catálogo lateral, collage, órbita, rompe marco, "
        "corta y pega, karaoke y 2 slides de carrusel) y 7 efectos sobre tu clip (zoom digital, de corte y atrás, lupa, foco, fragmentos, pantalla verde). "
        "Formatos 9:16, 16:9 y carrusel 4:5. 3 estilos de ejemplo, temas de marca propios vía sync-brand, split-pip en overlay.mjs, reel-voz.mjs para reels "
        "con voz grabada, audio con SFX, doctor y check.sh. Activa con efecto de video, motion graphics, reel, pantalla verde, karaoke, zoom, carrusel animado, "
        "slides de video, split-pip o cualquier id de efecto.")
assert len(DESC) <= 1024, len(DESC)
fm_end = sk.index('\n---\n', 4)
sk = "---\nname: video-fx\ndescription: " + json.dumps(DESC, ensure_ascii=False) + sk[fm_end:]

def drop_section(text, heading_prefix):
    """Elimina una sección '#'-heading hasta el siguiente heading de igual o mayor jerarquía."""
    m = re.search(r'^(#{1,4}) ' + re.escape(heading_prefix), text, re.M)
    assert m, f'SKILL.md: sección no encontrada: {heading_prefix}'
    level = len(m.group(1))
    nxt = re.compile(r'^#{1,%d} ' % level, re.M).search(text, m.end())
    end = nxt.start() if nxt else len(text)
    return text[:m.start()] + text[end:]

for h in ['Qué cubre y qué no', 'Notas del Bloque 4', '5. Comandos de Estudio en el Repo',
          'Receta "reel NEAPS-AIDA con ventana"', 'Receta "reel v5: B-roll a pantalla completa']:
    sk = drop_section(sk, h)

MARCA = '''## Marca desacoplada (regla de oro)

- **Cada tema es un json** con colores y tipografías: `themes/marcas/<nombre>.json` (tu marca), `themes/estilos/<estilo>.json` (estilos de ejemplo) o `themes/clientes/<cliente>.json` (marcas de terceros con las que trabajes). `scripts/sync-brand.mjs` los convierte en `themes/<prefijo>-<nombre>.css` con variables semánticas `--fx-*` (`--fx-bg`, `--fx-surface`, `--fx-text`, `--fx-accent`, `--fx-font-display`, `--fx-font-body`, `--fx-font-mono`…) y vendoriza las fuentes desde `@fontsource/<familia>`. Si la familia o el peso no existen en fontsource **falla con un error claro**: nunca sustituye una fuente por otra.
- **Esquema del json** (el mismo para marcas, estilos y clientes): `colores.{bg,bg2,surface,surface2,text,textMuted,accent,accent2,accentDark,onAccent,line,danger,ok}`, `fuentes.{display,body}.{familia,pesos}` (opcional `fuentes.mono`), `forma.{radius,radiusLg}`; opcionales `gradBg`, `gradAccent`, `shadowCard`, `shadowAccent`, `extraCss`.
- **Tu marca:** copia `themes/marcas/mi-marca.json` con tu nombre (por ejemplo `mi-estudio.json`), cambia los valores y corre `npm run sync-brand`. Se usa con `"tema": "marca-mi-estudio"` o `--tema marca-mi-estudio`. El tema `estilo-dark-tech` es el predeterminado.
- **Rol `--fx-font-mono`:** rol técnico para consola/código; por defecto JetBrains Mono (declarado en `DEFAULT_MONO` dentro de `sync-brand.mjs`); cualquier json lo puede sobrescribir con `fuentes.mono`.
- Las plantillas en `effects/` y `shared/` **solo** usan `var(--fx-*)`. `bash scripts/check.sh estatico` falla si encuentra colores o `font-family` literales, URLs externas o azar/reloj en `effects/` y `shared/`.
- `themes/brand.lock.json` guarda la fecha, las familias de fuentes y los temas generados.
- **Logo:** `vendor/brand/logo.svg` es un marcador neutro; reemplázalo por tu logo si usas `--logo` en `badge.mjs` o `logo: true` en `reel-voz.mjs`.
- Estilos de ejemplo incluidos: `estilo-dark-tech`, `estilo-red-glow` y `estilo-ukiyo-e` (un estilo es un tema; cualquier efecto se puede renderizar en cualquiera con `--tema`).

'''
m = re.search(r'^## Marca desacoplada \(regla de oro\)', sk, re.M)
m2 = re.search(r'^## Motor de render', sk, re.M)
assert m and m2
sk = sk[:m.start()] + MARCA + sk[m2.start():]

SK_RULES = [
    ('`ceinca-social`, `ceinca-guias`, `marca-<slug>` (p. ej. `marca-soyeduardo-ia`), `cliente-<slug>` o `estilo-<nombre>` (ver Marca)',
     '`estilo-dark-tech` (default), `estilo-red-glow`, `estilo-ukiyo-e`, `marca-<slug>` o `cliente-<slug>` (ver Marca)'),
    ('`ceinca-guias`', '`estilo-red-glow`'),
    ('sobre fondo @soyeduardo.ia (para Reel)', 'sobre el fondo del tema (para Reel)'),
    ('para Reel)', 'para Reel)'),
    (' (sin Remotion y respetando el estándar **`-16 LUFS`** de CEINCA / `@soyeduardo.ia`)', ' (sin Remotion y con sonoridad de entrega en **`-16 LUFS`** por defecto)'),
    ('**Reglas aprendidas (reel FIEBRU\'O, 19-10-2026)**', '**Reglas aprendidas**'),
    ('**Reglas aprendidas (reel PALABRA, 19-10-2026)**', '**Reglas aprendidas**'),
    ('Verificado por Eduardo el 20-10-2026 en el sandbox de claude.ai', 'Verificado el 20-10-2026 en el sandbox de claude.ai'),
    (' · comando `/grabar-demo`', ''), (' · comando `/doctor`', ''),
    ('`estilo-dark-tech`, `estilo-red-glow`, `marca-<slug>` (p. ej. `estilo-dark-tech`), `cliente-<slug>` o `estilo-<nombre>` (ver Marca)',
     '`estilo-dark-tech` (default), `estilo-red-glow`, `estilo-ukiyo-e`, `marca-<slug>` o `cliente-<slug>` (ver Marca)'),
    ('checklist-guias.mp4', 'checklist-red-glow.mp4'),
    ('estilo-dark-tech.css · estilo-red-glow.css · estilo-*.css · marca-*.css', 'estilo-*.css · marca-*.css'),
    ('Si cambia el manual de marca, regenera el zip', 'Si cambias tu marca, regenera el zip'),
    ('caja dorada grande', 'caja de acento grande'),
    ("(`PALABRA`, con apóstrofe)", "(la palabra clave tal cual, con sus acentos o apóstrofes)"),
    ('(p. ej. Flow con el avatar del usuario)', '(p. ej. clips generados con un avatar de IA)'),
    ('grabador de demos y comandos', 'grabador de demos y diagnóstico'),
    ('Sin CDN, sin APIs ni servicios pagos: GSAP, fuentes y plantillas viajan dentro de la skill.', 'Sin CDN ni APIs de pago: GSAP se instala con `npm install`; las fuentes y las plantillas viajan dentro de la skill.'),
]
for old, new in SK_RULES:
    sk = sk.replace(old, new)
for old, new in GLOBAL:
    sk = sk.replace(old, new)

# líneas puntuales que remiten a archivos o bitácoras personales
DROP_LINE_PATTERNS = [
    r'^.*Ver la skill `flow-chrome`.*\n', r'^6\. Para Flow \(avatar.*\n', r'^- \*\*Copy:\*\* un carrusel animado sigue.*\n',
    r'^Comandos exactos: .*\n', r'^Ejemplo: `examples/reel-voz\.example\.json`\. Logo: .*\n',
]
for pat in DROP_LINE_PATTERNS:
    sk = re.sub(pat, '', sk, flags=re.M)
sk = re.sub(r' \(referencia analizada: Drive `[^`]*`, 4 estilos\)', '', sk)
sk = re.sub(r'\n{3,}', '\n\n', sk)
write(KIT / 'SKILL.md', sk)

# ---------------------------------------------------------------- 6) regenerar temas y lock sin tokens de otro manual
for d in ('node_modules', '.cache'):
    src = SKILL / d
    if src.exists():
        os.symlink(src, KIT / d)
try:
    subprocess.run(['node', 'scripts/sync-brand.mjs'], cwd=KIT, check=True)
finally:
    for d in ('node_modules', '.cache'):
        lk = KIT / d
        if lk.is_symlink():
            lk.unlink()
        elif lk.exists():
            shutil.rmtree(lk)

# ---------------------------------------------------------------- 7) escaneo de marca (si queda algo, el build falla)
BRAND = re.compile(r'ceinca|eduardo|soyeduardo|saren|seniat|mercantil|venezuel|fiebru|golem|ñapa|napa\b|rodr[ií]guez|gonz[aá]lez|'
                   r'1E3A8A|122A63|C8A951|0B0D12|0B0F17|1A1E27|F3F0E8|DBFF84|8B93A7|9CCB1F|C6FF3D|198,\s*255,\s*61', re.I)
left = []
for dp, dn, fn in os.walk(KIT):
    rel = pathlib.Path(dp).relative_to(KIT).parts
    if rel and rel[0] in ('vendor',):
        # solo se revisan los nombres de archivo dentro de vendor (las licencias de terceros nombran a sus autores)
        for f in fn:
            if BRAND.search(f):
                left.append((str(pathlib.Path(dp, f).relative_to(KIT)), 0, f))
        continue
    for f in fn:
        p = pathlib.Path(dp) / f
        if BRAND.search(f):
            left.append((str(p.relative_to(KIT)), 0, 'NOMBRE DE ARCHIVO'))
        if not f.endswith(TEXT_EXT + ('.txt', '.yml', '.yaml')):
            continue
        for ln, line in enumerate(read(p).splitlines(), 1):
            if BRAND.search(line):
                left.append((str(p.relative_to(KIT)), ln, line.strip()[:140]))
if left:
    print('✗ QUEDAN referencias de marca en el kit:')
    for f, ln, s in left[:80]:
        print(f'  {f}:{ln}: {s}')
    sys.exit(2)

# ---------------------------------------------------------------- 8) empaquetado
def zip_dir(src_root, arc_root, out, excl=('node_modules', '.cache', '.build', 'out', 'dist')):
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for dp, dn, fn in os.walk(src_root):
            dn[:] = [d for d in dn if d not in excl]
            for f in sorted(fn):
                p = pathlib.Path(dp) / f
                z.write(p, pathlib.Path(arc_root) / p.relative_to(src_root))

(OUT / 'claude-ai').mkdir()
zip_dir(KIT, 'video-fx', OUT / 'claude-ai' / 'video-fx.zip')
shutil.copy(PK / 'LEEME_PRIMERO.md', OUT / 'LEEME_PRIMERO.md')
shutil.copy(PK / 'PROMPT_ADAPTAR_MARCA.md', OUT / 'PROMPT_ADAPTAR_MARCA.md')
with zipfile.ZipFile(OUT / ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(OUT / 'LEEME_PRIMERO.md', 'LEEME_PRIMERO.md')
    z.write(OUT / 'PROMPT_ADAPTAR_MARCA.md', 'PROMPT_ADAPTAR_MARCA.md')
    z.write(OUT / 'claude-ai' / 'video-fx.zip', 'claude-ai/video-fx.zip')
    for dp, dn, fn in os.walk(KIT):
        for f in sorted(fn):
            p = pathlib.Path(dp) / f
            z.write(p, pathlib.Path('claude-code/video-fx') / p.relative_to(KIT))
n = sum(1 for _ in zipfile.ZipFile(OUT / ZIP_NAME).namelist())
print(f'✓ kit sin marca: {OUT / ZIP_NAME} ({n} archivos)')
print(f'✓ zip para claude.ai: {OUT / "claude-ai" / "video-fx.zip"}')
print(f'  description: {len(DESC)} caracteres')
