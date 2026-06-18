import json

import anthropic

from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

ANALYSIS_PROMPT = """Analiza este post viral de Instagram y genera un análisis detallado en JSON.

Post:
- Cuenta: @{username} (nicho: {niche})
- Tipo: {post_type}
- Likes: {likes_count} (promedio de la cuenta: {avg_likes}) → {multiplier}x
- Comentarios: {comments_count}
- Caption: {caption}
- Hashtags: {hashtags}

Genera un JSON con:
{{
  "hook_analysis": "descripción del hook usado",
  "content_structure": "estructura del contenido (Hook → Problema → Solución → CTA, etc.)",
  "viral_pattern": "patrón identificado de viralidad",
  "emotional_trigger": "emoción principal que dispara el engagement",
  "hashtag_strategy": "análisis de la estrategia de hashtags",
  "best_publish_time": "hora recomendada de publicación basada en el engagement",
  "key_takeaways": ["punto 1", "punto 2", "punto 3"]
}}

Responde SOLO con el JSON válido."""

RECREATION_PROMPT = """Eres un experto en contenido viral de Instagram. Basándote en este análisis de un post viral, genera contenido adaptado.

Post viral original:
- Cuenta: @{username}
- Tipo: {post_type}
- Análisis: {analysis}

Perfil del usuario que quiere recrear:
- Nicho: {user_niche}
- Tono de voz: {user_tone}
- Formato deseado: {desired_format}

Genera un JSON con:
{{
  "script": "guion completo adaptado al nicho del usuario (si es reel/video)",
  "caption": "caption optimizado con emojis y CTA",
  "hashtags": ["hashtag1", "hashtag2", "...hasta 15 hashtags relevantes"],
  "suggested_publish_time": "hora y día recomendado",
  "thumbnail_prompt": "prompt para generar la portada/thumbnail con IA de imágenes",
  "trending_audio_suggestion": "sugerencia de audio trending si aplica"
}}

Responde SOLO con el JSON válido."""


def analyze_viral_post(
    username: str,
    niche: str,
    post_type: str,
    likes_count: int,
    avg_likes: float,
    multiplier: float,
    comments_count: int,
    caption: str,
    hashtags: list[str],
) -> dict:
    prompt = ANALYSIS_PROMPT.format(
        username=username,
        niche=niche,
        post_type=post_type,
        likes_count=likes_count,
        avg_likes=int(avg_likes),
        multiplier=multiplier,
        comments_count=comments_count,
        caption=caption[:500],
        hashtags=", ".join(hashtags[:10]),
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    return json.loads(message.content[0].text)


def generate_recreation(
    username: str,
    post_type: str,
    analysis: dict,
    user_niche: str,
    user_tone: str,
    desired_format: str | None = None,
) -> dict:
    prompt = RECREATION_PROMPT.format(
        username=username,
        post_type=post_type,
        analysis=json.dumps(analysis, ensure_ascii=False),
        user_niche=user_niche or "general",
        user_tone=user_tone or "profesional pero cercano",
        desired_format=desired_format or post_type,
    )

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    return json.loads(message.content[0].text)
