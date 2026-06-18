from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "IG Viral Tracker"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ig_viral_tracker"
    REDIS_URL: str = "redis://localhost:6379/0"
    ANTHROPIC_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""
    SENDGRID_FROM_EMAIL: str = "alerts@igviraltracker.com"
    INSTAGRAM_SESSION_ID: str = ""
    SCAN_INTERVAL_MINUTES: int = 60
    MAX_TRACKED_ACCOUNTS: int = 50
    VIRALITY_LIKES_MULTIPLIER: float = 3.0
    VIRALITY_COMMENTS_MULTIPLIER: float = 5.0
    VIRALITY_ENGAGEMENT_SPEED_MULTIPLIER: float = 2.0
    VIRALITY_SHARES_MULTIPLIER: float = 4.0

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
