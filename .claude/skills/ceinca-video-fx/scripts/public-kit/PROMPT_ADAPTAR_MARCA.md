# Prompt para Claude Code — adaptar Video FX a mi marca

Actúa como ingeniero senior de herramientas creativas y motion graphics. Trabaja sobre la skill `video-fx/` de este proyecto.

## Objetivo
Adaptar la identidad visual a MI MARCA sin eliminar, renombrar ni romper los efectos existentes.

## Antes de modificar
1. Lee `SKILL.md`, `package.json`, los scripts de render y el sistema de temas (`themes/`).
2. Cuenta los efectos reales por carpeta (`effects/`) y distingue las plantillas HTML/GSAP de los efectos de clip de `scripts/clip.mjs`.
3. No afirmes que un efecto funciona si no lo has ejecutado. Separa: validación estática, pruebas de render y pruebas pendientes.
4. No hagas cambios destructivos ni borres archivos sin explicarlo antes.

## Mi identidad de marca
Te daré los datos reales. Si falta alguno, pregunta o usa un valor neutro marcado como provisional. No inventes logos, colores oficiales, fuentes, eslóganes, nombres, webs ni redes sociales.
- Nombre de la marca: [ESCRIBIR]
- Colores HEX (fondo, superficie, texto, acento): [ESCRIBIR]
- Tipografía de títulos y de texto: [ESCRIBIR O "PROPONER OPCIONES"]
- Estilo visual: [ESCRIBIR]
- Logo (ruta local o "NO TENGO"): [ESCRIBIR]
- Formatos: vertical 9:16 y/o horizontal 16:9 [ELEGIR]

## Requisitos
- Crea un tema nuevo copiando `themes/marcas/mi-marca.json` con el nombre de mi marca (por ejemplo `themes/marcas/mi-estudio.json`), ajusta los valores y corre `npm run sync-brand`; el tema se usará con `--tema marca-<nombre>`.
- Conserva el comportamiento de los efectos: cambia solo tokens, tipografías y el contenido de ejemplo cuando haga falta.
- No metas colores ni tipografías literales dentro de `effects/` ni `shared/`: todo va con `var(--fx-*)` (lo valida `bash scripts/check.sh estatico`).
- Si pongo un logo, guárdalo en `vendor/brand/logo.svg` (sustituye el marcador).
- No incluyas logos ni nombres de terceros dentro de mi logotipo.
- No añadas dependencias ni servicios de pago sin explicarlo.
- No expongas claves ni datos privados.

## Pruebas y entrega
1. `node scripts/doctor.mjs` y `bash scripts/check.sh estatico`.
2. Renderiza un ejemplo sencillo con un tema genérico y otro con mi tema.
3. Si falta Node, FFmpeg o Chromium, dilo claramente; no declares la prueba superada.
4. Entrega: archivos modificados, pruebas ejecutadas con su resultado y limitaciones.
5. No hagas commit, push ni publicación sin pedírmelo.

Primero entrega un plan corto y el inventario de efectos; después procede con cambios seguros y reversibles.
