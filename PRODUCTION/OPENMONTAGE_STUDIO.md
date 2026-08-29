# MÓDULO PRODUCCIÓN AUTOMATIZADA — OPENMONTAGE (CLAUDE CODE)
## CEINCA AI OS v2.0 | Pipeline de video de bajo costo: guion → voz → metraje → edición → render

---

## ⚙️ QUÉ ES Y CÓMO SE POSICIONA FRENTE A FLOW REELS

OpenMontage (`github.com/calesthio/OpenMontage`) es una herramienta que corre
**dentro de Claude Code** (no en el chat normal) y encadena todo el proceso de
producción de un video a partir de una idea en lenguaje natural: investiga el
tema, propone un plan de costo, escribe el guion, genera la narración,
busca metraje en bancos gratuitos (NASA, Archive.org, Wikimedia) y entrega el
video final montado y renderizado.

**No sustituye** el pipeline `PRODUCTION/FLOW_REELS.md` — lo complementa. Son
dos productoras con objetivos distintos:

| Criterio | FLOW_REELS (Google Flow + Meta Edits) | OpenMontage (Claude Code) |
|---|---|---|
| Formato objetivo | Reels 9:16, alto impacto NEAPS+AIDA | Explainers 16:9 o narrados, formato largo |
| Avatar @Eduardo consistente | Sí (Ingredient + character consistency) | No — sin avatar humano entrenado |
| Estética | Cinematográfica premium (Teal & Orange, Rembrandt) | Funcional, informativa, stock real |
| Costo | Tier Pro/Ultra de Google AI | Empieza en $0 (voz local + stock libre) |
| Uso recomendado CEINCA | Contenido de venta/conversión (Nivel 1 escalera) | Contenido educativo masivo, explicaciones de KNOWLEDGE/ |
| Control humano | Manual, escena por escena | Automatizado, con aprobación de costo previa |

**Regla de uso:** si el video lleva a @Eduardo hablando a cámara para vender o
cerrar (NEAPS paso S — Solución/CTB), usar FLOW_REELS. Si el video es
explicativo, de fondo, o para nutrir audiencia sin necesidad de rostro
(NEAPS pasos N/E/A), OpenMontage es la vía más barata y rápida.

---

## 🧱 REQUISITOS TÉCNICOS

```
Python 3.10+          — motor interno
Node.js 18+           — montaje de animaciones
FFmpeg                — edición y export final del video
Claude Code (versión completa, no el chat web)
```

Si no sabes si los tienes instalados, pídeselo directo a Claude Code:
> "Comprueba si tengo Python, Node y FFmpeg instalados y, si me falta alguno,
> instálamelo y guíame."

---

## 🛠️ INSTALACIÓN

### Opción A — que lo instale Claude Code (recomendada)

Pegar este prompt dentro de Claude Code, en la carpeta donde se quiera montar
el estudio de video (fuera de este repo `CEINCA-AI-OS`, en un directorio de
proyecto separado):

```
Instálame OpenMontage de este repositorio: https://github.com/calesthio/OpenMontage .
Encárgate tú de todo: clonarlo, ejecutar la instalación (make setup), crear el
archivo .env y comprobar que tengo Python, Node y FFmpeg. Avísame cuando pueda
pedirte mi primer video y dime si necesito alguna clave (puedo empezar gratis).
```

### Opción B — manual

```bash
git clone https://github.com/calesthio/OpenMontage.git
cd OpenMontage
make setup
cp .env.example .env
```

> **Windows:** si `make setup` falla, usar la Opción A — Claude Code hace la
> instalación paso a paso sin depender de `make`.

---

## 💰 CONTROL DE COSTO (OBLIGATORIO ANTES DE GENERAR)

```
Modo gratis   : voz local (Piper) + metraje NASA/Archive.org/Wikimedia + edición local
Modo premium  : voz/video IA de pago vía claves en .env
Tope por defecto : $10
Umbral de aprobación : pide permiso explícito por encima de $0,50 por acción
Prueba inicial : "make demo" genera videos de ejemplo gratis
```

**Nunca aprobar un plan de costo sin revisarlo primero.** OpenMontage siempre
muestra el plan y el costo estimado antes de generar nada — es el punto de
control económico del sistema, igual que la Escalera de Monetización
(`MARKETING/MONETIZATION_SCALE.md`) exige control de precio por nivel de
producto.

---

## ⚠️ BLINDAJE NORMATIVO ANTES DE PUBLICAR (obligatorio para temas CEINCA)

OpenMontage escribe el guion con un modelo genérico — **no conoce** el
Protocolo Anti-Alucinación (`RULES/ANTI_HALLUCINATION.md`) ni el Marco de
Razonamiento Jurídico Venezolano (`RULES/LEGAL_REASONING.md`). Cualquier guion
autogenerado sobre temas de KNOWLEDGE/ (SAREN, Reconversiones, LOPNNA, etc.)
**debe pasar por revisión manual** antes de aprobar el render final:

```
☐ El guion NO afirma la reconversión de capitales como requisito obligatorio
  general (ver regla de excepción en ANTI_HALLUCINATION.md)
☐ Ninguna cifra, tasa BCV o circular del SAREN se presenta como vigente sin
  verificarla — si hay duda, se declara la incertidumbre en el propio guion
☐ El dictamen incluye mapa de riesgo mercantil, no solo teoría legal
☐ El tono se ajusta a la Matriz de Audiencia (STRATEGY/AUDIENCE_MATRIX.md)
```

Si el tema no es jurídico (explicación general de IA, productividad,
tendencias), este paso de revisión no aplica.

---

## 🎬 CÓMO PEDIR EL VIDEO

Con OpenMontage instalado, abrir su carpeta en Claude Code y pedir el video en
una frase. Ejemplos ya adaptados a temas de CEINCA (usar como plantilla):

```
Hazme un explainer de 60 segundos sobre por qué las reconversiones monetarias
dejaron en cero el capital social de las empresas venezolanas antiguas.

Crea un video de 45 segundos sobre qué es el SAREN y por qué los criterios de
rechazo cambian según la región, con voz y música.

Monta un montaje de 75 segundos sobre la Ley LOPNNA aplicada a documentos
mercantiles, con metraje real, sin narración, tono elegante y con música.
```

Tras cada petición, OpenMontage entrega primero el **plan + costo estimado**.
Aprobar o ajustar antes de continuar — nunca generar en automático sin ver el
plan.

---

## 📋 CHECKLIST DE PRODUCCIÓN OPENMONTAGE

```
PRE-PRODUCCIÓN
☐ Python, Node y FFmpeg verificados
☐ .env creado (modo gratis por defecto)
☐ Tema definido y ubicado en la escalera NEAPS (N/E/A → OpenMontage, S → Flow)

PRODUCCIÓN
☐ Petición redactada en lenguaje normal, duración y tono especificados
☐ Plan de costo revisado y aprobado ANTES de generar
☐ make demo probado primero si es la primera vez usando la herramienta

REVISIÓN DE CONTENIDO (temas legales/KNOWLEDGE)
☐ Guion pasado por checklist de blindaje normativo (sección anterior)
☐ Cifras y referencias legales verificadas o marcadas como no confirmadas

POST-PRODUCCIÓN
☐ Video final revisado contra identidad visual CEINCA (navy #122A63 + dorado)
  si se usan overlays o textos — OpenMontage no aplica esta paleta por defecto,
  ajustar manualmente si el resultado lo requiere
☐ Publicación en el nivel correspondiente de la Escalera de Monetización
```

---

*Módulo creado a partir de la guía "Un estudio de video en Claude" (AIMAX
Agency, @david_ai_pro). Herramienta externa de terceros — CEINCA no mantiene
ni es responsable del código de OpenMontage, solo documenta su integración
en el flujo de producción del sistema.*
