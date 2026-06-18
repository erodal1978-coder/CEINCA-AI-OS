import re
from datetime import datetime, timezone

import instaloader

from app.core.config import settings


class InstagramService:
    def __init__(self):
        self.loader = instaloader.Instaloader(
            download_pictures=False,
            download_videos=False,
            download_video_thumbnails=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
        )

    def get_profile(self, username: str) -> dict:
        profile = instaloader.Profile.from_username(self.loader.context, username)
        return {
            "user_id": str(profile.userid),
            "username": profile.username,
            "followers": profile.followers,
            "following": profile.followees,
            "posts_count": profile.mediacount,
            "is_private": profile.is_private,
        }

    def get_recent_posts(self, username: str, limit: int = 30) -> list[dict]:
        profile = instaloader.Profile.from_username(self.loader.context, username)
        if profile.is_private:
            return []

        posts = []
        for i, post in enumerate(profile.get_posts()):
            if i >= limit:
                break

            post_type = "reel" if post.is_video and post.video_duration else "image"
            if post.typename == "GraphSidecar":
                post_type = "carousel"

            caption = post.caption or ""
            hashtags = re.findall(r"#(\w+)", caption)

            posts.append({
                "ig_post_id": post.shortcode,
                "post_type": post_type,
                "post_url": f"https://www.instagram.com/p/{post.shortcode}/",
                "caption": caption,
                "hashtags": hashtags,
                "likes_count": post.likes,
                "comments_count": post.comments,
                "timestamp": post.date_utc.replace(tzinfo=timezone.utc),
                "video_duration": post.video_duration if post.is_video else None,
            })

        return posts

    def calculate_averages(self, posts: list[dict]) -> dict:
        if not posts:
            return {"avg_likes": 0, "avg_comments": 0, "avg_engagement": 0}

        total_likes = sum(p["likes_count"] for p in posts)
        total_comments = sum(p["comments_count"] for p in posts)
        count = len(posts)

        return {
            "avg_likes": total_likes / count,
            "avg_comments": total_comments / count,
            "avg_engagement": (total_likes + total_comments) / count,
        }

    def detect_viral(self, post: dict, averages: dict) -> dict | None:
        avg_likes = averages["avg_likes"]
        if avg_likes == 0:
            return None

        likes_multiplier = post["likes_count"] / avg_likes
        if likes_multiplier < settings.VIRALITY_LIKES_MULTIPLIER:
            return None

        virality_score = likes_multiplier
        if averages["avg_comments"] > 0:
            comments_multiplier = post["comments_count"] / averages["avg_comments"]
            virality_score = (likes_multiplier + comments_multiplier) / 2

        return {
            **post,
            "virality_score": round(virality_score, 2),
            "virality_multiplier": round(likes_multiplier, 2),
        }


instagram_service = InstagramService()
