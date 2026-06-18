import logging

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_viral_alert_email(to_email: str, viral_data: dict) -> bool:
    if not settings.SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, skipping email")
        return False

    html_content = f"""
    <h2>🔥 Post Viral Detectado</h2>
    <p><strong>Cuenta:</strong> @{viral_data['username']}</p>
    <p><strong>Tipo:</strong> {viral_data['post_type']}</p>
    <p><strong>Likes:</strong> {viral_data['likes_count']} ({viral_data['multiplier']}x del promedio)</p>
    <p><strong>URL:</strong> <a href="{viral_data['post_url']}">{viral_data['post_url']}</a></p>
    <p><strong>Caption:</strong> {viral_data.get('caption', '')[:200]}...</p>
    <br>
    <p>Ingresa al dashboard para ver el análisis completo y generar tu recreación.</p>
    """

    message = Mail(
        from_email=settings.SENDGRID_FROM_EMAIL,
        to_emails=to_email,
        subject=f"🔥 Viral detectado: @{viral_data['username']} ({viral_data['multiplier']}x)",
        html_content=html_content,
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
