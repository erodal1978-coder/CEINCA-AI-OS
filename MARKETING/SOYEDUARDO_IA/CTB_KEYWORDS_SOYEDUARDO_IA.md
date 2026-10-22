# @soyeduardo.ia — Banco de Keywords Disruptivas (CTB)
**Versión 0.2 · 21-10-2026 · borrador para aprobación de Eduardo (sin aprobar)**
Submarca personal de Eduardo Rodríguez (construye con Claude e IA, "constructor, no gurú"). Adapta el mecanismo de `MARKETING/CTB_PALABRAS_DISRUPTIVAS.md` (CEINCA, v2.4). Las dos cuentas NO comparten banco de palabras: no reutilizar aquí ningún venezolanismo de CEINCA.

## 0. Qué se hereda de CEINCA y qué cambia

| Se hereda (mecánica) | Cambia (nicho) |
|---|---|
| Una palabra = un recurso; reciclar solo mismo tema y recurso. | Ya no son venezolanismos: audiencia LATAM, así que **cero regionalismos**. |
| CTA siempre "Comenta [PALABRA]", nunca "por DM". | El campo semántico es **taller / construcción** (coherente con "constructor, no gurú"), no comida criolla. |
| Automatización en Meta Business Suite: "contiene", minúsculas, una por palabra, todas las publicaciones. | Se añade un **filtro técnico anti-falso-disparo** (sección 2), que CEINCA no necesitaba con palabras largas y raras. |
| Registro vivo de uso (tabla 1). | Datos de resultados: los de esta cuenta empiezan en cero. No se importan métricas de CEINCA como prueba. |

## 1. Por qué NO "claude / gemini / ia"
1. **Falso disparo por subcadena (verificado).** La automatización usa coincidencia "contiene". "ia" está dentro de "gracias", "magia" y "familia"; cualquier comentario con esas palabras activaría el DM. Comprobado contra el diccionario español local (86.016 entradas): "ia" aparece dentro de 5.032 de ellas.
2. **Palabras genéricas = ruido.** No distingues quién comenta por el recurso de quién comenta por casualidad, y no hay trazabilidad por pieza.
3. **No suenan a ti.** Son los nombres de las herramientas, no una seña de identidad. Eso es exactamente lo que CEINCA evita con palabras raras.
4. **Marcas ajenas.** Poner "Claude" o "Gemini" como palabra de pedido pone marcas de terceros en el CTA de la cuenta. Es una inferencia, no un asesoramiento legal; evitarlas lo elimina.
5. *No verificado:* se desconoce si otras cuentas del nicho ya usan estas palabras como trigger. Es probable para "PROMPT", "IA" y "GUÍA", pero no se midió; revisar 5–10 cuentas antes de dar por cerrado el banco.

## 2. Reglas de validez de una palabra (filtro obligatorio)
Una palabra solo entra al banco si cumple las 8:
1. **≥ 5 letras.** Evita subcadenas de palabras comunes.
2. **Subcadena, en dos niveles** (prueba con diccionario; ver §8):
   - **2a (duro):** no está contenida en una palabra común de **otra raíz**. Ej.: "ia" (dentro de "gracias"), "bot", "torno" (dentro de "entorno", "retorno"), "plano", "banco", "chispa" quedan fuera.
   - **2b (blando):** si solo la contienen **derivados de su misma raíz** (maqueta → maquetación, cincel → cincelar, fragua → fraguar), se acepta, pero se marca **"riesgo derivado"** en la tabla.
3. **No contiene a otra palabra del banco** ni está contenida en ella (si lo hace, la automatización de una dispara la otra).
4. **Sin tildes ni ñ.** Cada persona escribe con o sin tilde; la coincidencia fallaría.
5. **Ortografía inequívoca.** Si la gente puede escribirla de dos formas (j/g, s/z, b/v, h), se perderán leads. Va a la reserva. Si la duda existe pero es poco frecuente (p. ej. ll/y), se acepta con la marca "riesgo ortográfico bajo".
6. **Escribible en el celular en 3 segundos.** Máx. ~9 letras salvo "posts estrella".
7. **Cero carga política o de marca registrada**, y sin parecido con las palabras de CEINCA.
8. **No es vocabulario habitual del nicho.** La automatización es "contiene" en **todas** las publicaciones: cualquier persona que escriba la palabra en un comentario normal dispara el DM. Se excluyen términos de uso corriente al hablar de IA, tecnología o diseño (p. ej. "alucinar", "prototipo", "mecanismo").

## 3. Cómo suena una palabra que marca pauta
Criterio de selección (juicio editorial, no medición): que sea una **imagen física y concreta** de taller, que choque con el lenguaje de IA ("agente", "prompt", "modelo") y que Eduardo pueda decirla en voz alta sin sonar a gurú. Metáfora central: *la IA es la herramienta, tú eres quien construye*.

## 4. Registro de uso (actualizar en cada pieza nueva)

| Palabra | Tema / recurso | Estado |
|---|---|---|
| GOLEM | Reel 1 (Instagram y TikTok): el prompt exacto del DM (recurso por confirmar) | **Palabra aprobada por Eduardo (21-10-2026).** Sin publicar. Automatización (Messenger + Instagram, nativa MBS, activa, DM con nombre del destinatario): **creada 21-10-2026, SIN PROBAR** (probar justo después de publicar). Ver skill `meta-automatizaciones-mbs`. TikTok: sin automatización, entrega **manual** por Eduardo. |
| SOLDADURA | Reel 2 «me transformo con IA» (Flow gratis): guía PDF que une Claude (preproducción) + Flow (producción) | **Palabra elegida por Eduardo (22-10-2026).** Video v2 aprobado y guía PDF hecha (22-10, `REEL_2_SOLDADURA/GUIA/`); copies en `FINAL/COPIES_REEL2_SOLDADURA.md`. Guía pública en Drive (`1qiLCM0fiSxzb6wIqPHoZqCpX4xKfdfoO`). Automatización (Messenger + IG, nativa MBS, activa, DM con nombre): **creada 22-10-2026, SIN PROBAR** (probar justo después de publicar). Falta: publicar. Plan: `CEINCA-WORKSPACE/SOY_EDUARDO_IA/REEL_2_SOLDADURA/PLAN_REEL_2.md`. |

## 5. Banco: 29 candidatas (13 utilizables, 16 en reserva) + 12 excluidas
Puntuaciones **1–10 = criterio editorial** sobre memorabilidad + facilidad de teclear + encaje de marca. No son datos medidos. El filtro de subcadena (reglas 2a/2b) se aplicó contra el diccionario español (86.016 entradas; ver §8); las marcadas "riesgo derivado" cumplen 2b, no 2a. Las tachadas se usarán cuando se asignen.

### A. Prioridad (usar primero)
| Palabra | Idea / tipo de recurso sugerido | Nota | Puntaje |
|---|---|---|---|
| GOLEM | Agente o automatización que "hace el trabajo" | Corta, rara, imagen potente; ortografía clara. **ASIGNADA: reel 1** | 9 |
| TALADRO | Pack de prompts / plantilla que "perfora" un problema | Concreta y masculina de taller; fácil de teclear | 8.5 |
| SOLDADURA | Flujo que une dos herramientas (Claude + otra) | Memorable; 9 letras. **ASIGNADA: reel 2** | 8 |
| TORNILLO | Paso a paso corto, "una pieza a la vez" | Muy teclable. Riesgo ortográfico bajo (ll/y); riesgo derivado mínimo ("atornillo") | 8 |
| ANDAMIO | Estructura base para empezar un proyecto | Ortografía clara | 7.5 |
| SOPLETE | Truco rápido que "calienta" un resultado | Corta, visual | 7.5 |
| REMACHE | Checklist de cierre / revisión final | Rara; poco usada | 7.5 |
| TRINQUETE | Sistema que solo avanza (rutina semanal) | Rara; 9 letras, algo difícil | 7 |

### B. Disponibles
CABLEADO · TUERCA · CINCEL · YUNQUE · FRAGUA
(**Riesgo derivado** (2b) en CINCEL ("cincelar"), FRAGUA ("fraguar") y YUNQUE ("ayunque", variante de la misma palabra según criterio editorial; el diccionario local no trae definiciones): solo disparan con derivados o variantes de su misma raíz, de uso poco frecuente en comentarios. Riesgo bajo, no nulo.)

### C. Reserva (verificar antes de usar)
- **Por ortografía (regla 5):** ENGRANAJE (j/g) · RELOJERO (j/g) · MORDAZA (s/z) · BISAGRA (b/v, g/j).
- **Por ser vocabulario habitual del nicho (regla 8):** ALUCINAR (término corriente al hablar de fallos de IA; antes estaba en prioridad) · PROTOTIPO · MECANISMO · ARTEFACTO · BOCETO.
- **Por riesgo derivado alto (regla 2b):** MAQUETA ("maquetación" y "maquetar" son frecuentes en comentarios de web; antes estaba en prioridad con 7).
- **Otras:** CORTOCIRCUITO (13 letras: solo post estrella) · TRANSISTOR · SANDBOX (anglicismo) · AUTOMATA (tilde de uso común: "autómata") · CIRCUITO ("cortacircuitos" lo contiene) · AGENTE (contenida en "coagente", y demasiado genérica del nicho).
- **Solapamiento interno (regla 3):** CIRCUITO está contenida en CORTOCIRCUITO. Ambas están en reserva; si se promueven, solo una de las dos.

### D. Excluidas (no usar)
IA, BOT, CLAUDE, GEMINI, GPT, PROMPT, CHATGPT, TOKEN, PLANO, TORNO, BANCO, CHISPA — por subcadena, genéricas o marcas ajenas (sección 1).
*Pendiente de revisar y completar hasta ~40 al aprobar el diseño.*

## 6. Cómo se usa
**Candado (actualizado 21-10-2026):** ningún post, guion ni copy promete "comenta X" hasta que X esté aprobada en este banco.
- **Instagram:** la automatización se crea **antes** de publicar y se **prueba justo después** de publicar (un comentario de prueba con la palabra; comprobar que llega el DM).
- **TikTok:** no hay automatización ni comentario fijado (verificado por Eduardo): la entrega es **manual** por Eduardo y debe estar pendiente de los primeros comentarios al publicar. Cómo llega el recurso (respuesta o DM): **NO VERIFICADO**.
1. Elige UNA palabra de la sección A (sin tachar) cuyo tipo de recurso encaje con la pieza.
2. Comprueba en la tabla 1 que no esté asignada a otro tema.
3. Instagram: crea la automatización en Meta Business Suite **antes** de publicar (ver `SISTEMA_VIRAL.md` §8): trigger "comentario contiene", palabra en minúsculas, todas las publicaciones, y pruébala justo después de publicar. TikTok: entrega manual.
4. Al publicar, táchala en la sección 5 y registra la fila en la tabla 1.
5. Sube la versión actualizada a repo + Drive (`CEINCA RESPALDO/Digital mentor`).

## 7. Texto de los tres activos (adaptado, pendiente de redactar en el manual de copy)
- **Respuesta pública:** 3 variantes rotadas (cálida / operativa / con gancho), ≤500 caracteres, sin enlace.
- **DM automático:** entrega arriba, qué contiene, **pregunta abierta**, sígueme como continuidad, firma "Eduardo — @soyeduardo.ia". Sin firma institucional ni frase "gratis" falsa si el recurso tiene costo.
- **Voz:** "Lo construí para mi negocio y te lo regalo" **solo si es literalmente cierto** para ese recurso; si no, "Lo probé y esto pasó".
- Estos textos se redactan en el manual de copy (siguiente documento), no aquí.

## 8. Notas de método y límites
- Prueba de subcadena: coincidencia de cada candidata contra `/usr/share/dict/spanish` (86.016 entradas, formas base, sin conjugaciones) y `american-english`. **No cubre** conjugaciones, jerga, nombres propios ni vocabulario corriente que no esté en el diccionario como derivado (por eso existe la regla 8). La prueba definitiva es publicar y monitorear los primeros 20 comentarios.
- Resultado de la prueba 2a/2b sobre las 13 utilizables (21-10-2026): sin coincidencias en el diccionario salvo CINCEL ("cincelar"…), FRAGUA ("fraguar"…) y YUNQUE ("ayunque"), las tres de su misma raíz (2b). El diccionario no trae derivados como "maquetación" (se detectó a mano), por eso MAQUETA pasó a reserva.
- Los puntajes son orientativos; el nicho "IA en español" cambia rápido y no se midió el uso real de palabras por la competencia.
- Meta puede cambiar cómo funciona "contiene"; comprobar en Business Suite el día de crear cada automatización.
- **No hay datos de rendimiento de esta cuenta todavía.** Los números de CEINCA (alcance, views) vienen de otra audiencia y no se trasladan.
