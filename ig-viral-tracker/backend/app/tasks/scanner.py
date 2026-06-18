import logging
from datetime import datetime, timezone

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.models import TrackedAccount, User, ViralPost
from app.services.ai_analysis import analyze_viral_post
from app.services.instagram import instagram_service
from app.services.notifications import send_viral_alert_email

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def scan_all_accounts(self):
    db = SessionLocal()
    try:
        accounts = db.query(TrackedAccount).all()
        for account in accounts:
            scan_single_account.delay(str(account.id))
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3, rate_limit="5/m")
def scan_single_account(self, account_id: str):
    db = SessionLocal()
    try:
        account = db.query(TrackedAccount).filter(TrackedAccount.id == account_id).first()
        if not account:
            return

        posts = instagram_service.get_recent_posts(account.ig_username, limit=30)
        if not posts:
            return

        averages = instagram_service.calculate_averages(posts)
        account.avg_likes_30d = averages["avg_likes"]
        account.avg_comments_30d = averages["avg_comments"]
        account.avg_engagement_rate = averages["avg_engagement"]
        account.last_scanned_at = datetime.now(timezone.utc)

        for post in posts[:10]:
            existing = db.query(ViralPost).filter(ViralPost.ig_post_id == post["ig_post_id"]).first()
            if existing:
                continue

            viral_data = instagram_service.detect_viral(post, averages)
            if not viral_data:
                continue

            niche = ", ".join(account.niche_tags) if account.niche_tags else "general"

            try:
                ai_analysis = analyze_viral_post(
                    username=account.ig_username,
                    niche=niche,
                    post_type=viral_data["post_type"],
                    likes_count=viral_data["likes_count"],
                    avg_likes=averages["avg_likes"],
                    multiplier=viral_data["virality_multiplier"],
                    comments_count=viral_data["comments_count"],
                    caption=viral_data.get("caption", ""),
                    hashtags=viral_data.get("hashtags", []),
                )
            except Exception as e:
                logger.error(f"AI analysis failed for {account.ig_username}: {e}")
                ai_analysis = None

            viral_post = ViralPost(
                tracked_account_id=account.id,
                ig_post_id=viral_data["ig_post_id"],
                post_type=viral_data["post_type"],
                post_url=viral_data["post_url"],
                caption=viral_data.get("caption"),
                hashtags=viral_data.get("hashtags"),
                likes_count=viral_data["likes_count"],
                comments_count=viral_data["comments_count"],
                shares_count=viral_data.get("shares_count", 0),
                saves_count=viral_data.get("saves_count", 0),
                virality_score=viral_data["virality_score"],
                virality_multiplier=viral_data["virality_multiplier"],
                ai_analysis=ai_analysis,
            )
            db.add(viral_post)

            user = db.query(User).filter(User.id == account.user_id).first()
            if user:
                send_viral_alert_email(
                    to_email=user.email,
                    viral_data={
                        "username": account.ig_username,
                        "post_type": viral_data["post_type"],
                        "likes_count": viral_data["likes_count"],
                        "multiplier": viral_data["virality_multiplier"],
                        "post_url": viral_data["post_url"],
                        "caption": viral_data.get("caption", ""),
                    },
                )

            logger.info(f"Viral detected: @{account.ig_username} - {viral_data['virality_multiplier']}x")

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Scan failed for account {account_id}: {e}")
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()
