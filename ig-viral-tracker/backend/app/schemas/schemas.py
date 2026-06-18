import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: str
    name: str
    niche: str | None = None
    tone_of_voice: str | None = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    niche: str | None
    tone_of_voice: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TrackedAccountCreate(BaseModel):
    ig_username: str
    niche_tags: list[str] | None = None


class TrackedAccountResponse(BaseModel):
    id: uuid.UUID
    ig_username: str
    ig_user_id: str | None
    niche_tags: list[str] | None
    avg_likes_30d: float
    avg_comments_30d: float
    avg_engagement_rate: float
    last_scanned_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ViralPostResponse(BaseModel):
    id: uuid.UUID
    tracked_account_id: uuid.UUID
    ig_post_id: str
    post_type: str
    post_url: str
    caption: str | None
    hashtags: list[str] | None
    likes_count: int
    comments_count: int
    shares_count: int
    saves_count: int
    virality_score: float
    virality_multiplier: float
    ai_analysis: dict | None
    detected_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class RecreationCreate(BaseModel):
    viral_post_id: uuid.UUID
    desired_format: str | None = None


class RecreationResponse(BaseModel):
    id: uuid.UUID
    viral_post_id: uuid.UUID
    generated_script: str | None
    generated_caption: str | None
    generated_hashtags: list[str] | None
    suggested_publish_time: str | None
    thumbnail_prompt: str | None
    status: str
    result_likes: int | None
    result_comments: int | None
    result_engagement_rate: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_tracked_accounts: int
    total_viral_posts: int
    total_recreations: int
    top_accounts: list[dict]
    recent_virals: list[ViralPostResponse]
