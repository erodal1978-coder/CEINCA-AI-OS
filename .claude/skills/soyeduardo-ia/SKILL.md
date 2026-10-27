---
name: soyeduardo-ia
description: Marca personal @soyeduardo.ia (Eduardo Rodríguez · Claude e IA, Instagram y TikTok) — enrutador de marca v0.1. Usar SIEMPRE que se cree o revise cualquier pieza, texto, perfil, reel, carrusel, portada, destacada, keyword o automatización de @soyeduardo.ia (también "Digital Mentor", "soyeduardo", "LO HIZO LA IA", "{ER}", "Laboratorio", tema marca-soyeduardo-ia). NO usar para CEINCA (@ceinca.mercantil): ahí van ceinca-ia y ceinca-design.
---

# @soyeduardo.ia — enrutador de marca (v0.1, 22-10-2026)

Esta skill **no contiene la marca**: dice qué manual cargar y qué reglas no se rompen nunca. Los manuales son la fuente de verdad; si algo de aquí choca con ellos, mandan los manuales.

## Qué cargar según la tarea
| Tarea | Leer primero (en `MARKETING/SOYEDUARDO_IA/`) |
|---|---|
| Cualquier texto (copy, fijado, respuestas, DM, caption) | `MANUAL_TONO_ESTILO_SOYEDUARDO_IA.md` + `MANUAL_COPY_SOYEDUARDO_IA.md`; medir con `verificar_largos.py` |
| Elegir palabra clave | `CTB_KEYWORDS_SOYEDUARDO_IA.md` (8 reglas; tabla de uso) |
| Diseño estático (portada, carrusel, destacada, historia) | `MANUAL_IDENTIDAD_VISUAL_SOYEDUARDO_IA.md` + `MANUAL_TIPOGRAFIA_SOYEDUARDO_IA.md` |
| Reel o video | `MANUAL_PRODUCCION_VIDEO_SOYEDUARDO_IA.md` + `PRODUCTION/FLOW_SISTEMA.md` + skill `ceinca-video-fx` con `--tema marca-soyeduardo-ia` |
| Bio, nombre, destacadas, enlace | `MANUAL_PERFIL_BIOS_SOYEDUARDO_IA.md` |
| Automatización de Meta | skill `meta-automatizaciones-mbs` |
| Referencias de otros creadores | `ESTILO_VIDEO_REFERENCIA.md` (handles solo en el workspace) |
| SFX y música | `BANCO_SFX.md`; archivos en `CEINCA-WORKSPACE/RECURSOS_GENERALES/` |

Archivos de la cuenta (fuera del repo): `CEINCA-WORKSPACE/SOY_EDUARDO_IA/` → `CUENTA/` (logo, destacadas, fotos, auditoría), `REEL_N_<PALABRA>/` (un reel por carpeta: FINAL, CLIPS, MONTAJE, PROMPTS, FONDOS), `REFERENCIAS/`, `MANUALES/` (versiones visuales).

## Reglas duras (nunca se rompen)
1. **Tuteo** siempre; nunca voseo ni "usted". **Singular** ("yo"), nunca "nosotros".
2. **Constructor, no gurú:** nada de "revolucionario", "el secreto", promesas de dinero; sin "abogado" ni "+180 empresas" en el perfil.
3. **Sin cifras, testimonios ni antes/después inventados.** Cada afirmación sobre una herramienta lleva fecha de verificación.
4. **"Te lo regalo" solo si es literalmente gratis.**
5. **Candado de keyword:** sin palabra aprobada del banco, recurso real y automatización creada (Messenger + Instagram), no se publica. 1 palabra = 1 recurso.
6. **Color:** tinta de fondo, **un solo elemento lima por pantalla**, coral nunca junto al lima, oro solo en "respaldo CEINCA". Nada de la paleta azul/dorado de CEINCA.
7. **Tipografía:** Sora (títulos), Manrope (texto), JetBrains Mono (etiquetas). **Nunca Montserrat.**
8. **Nunca** logo, nombre o asterisco de Claude/Anthropic en la marca o el @.
9. **LO HIZO LA IA:** sello en toda pieza de prueba; firma verbal "Lo hizo la IA. Lo dirigí yo."
10. Archivos pesados (video, audio, imágenes) **fuera del repo**.

## Cómo trabajar
- Antes de entregar una pieza, pasar el checklist del manual correspondiente.
- Lo no verificado se marca como tal en el entregable (NO VERIFICADO / PENDIENTE), nunca se rellena.
- Al terminar: registrar la palabra usada en el banco y actualizar `handoff.md`.
