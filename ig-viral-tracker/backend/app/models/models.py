import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    niche: Mapped[str | None] = mapped_column(String(100))
    tone_of_voice: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tracked_accounts: Mapped[list["TrackedAccount"]] = relationship(back_populates="user")
    recreations: Mapped[list["Recreation"]] = relationship(back_populates="user")


class TrackedAccount(Base):
    __tablename__ = "tracked_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    ig_username: Mapped[str] = mapped_column(String(100), nullable=False)
    ig_user_id: Mapped[str | None] = mapped_column(String(100))
    niche_tags: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    avg_likes_30d: Mapped[float] = mapped_column(Float, default=0.0)
    avg_comments_30d: Mapped[float] = mapped_column(Float, default=0.0)
    avg_engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    last_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="tracked_accounts")
    viral_posts: Mapped[list["ViralPost"]] = relationship(back_populates="tracked_account")


class ViralPost(Base):
    __tablename__ = "viral_posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tracked_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tracked_accounts.id"), nullable=False)
    ig_post_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    post_type: Mapped[str] = mapped_column(String(20), nullable=False)
    post_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text)
    hashtags: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    shares_count: Mapped[int] = mapped_column(Integer, default=0)
    saves_count: Mapped[int] = mapped_column(Integer, default=0)
    virality_score: Mapped[float] = mapped_column(Float, default=0.0)
    virality_multiplier: Mapped[float] = mapped_column(Float, default=0.0)
    ai_analysis: Mapped[dict | None] = mapped_column(JSON)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    tracked_account: Mapped["TrackedAccount"] = relationship(back_populates="viral_posts")
    recreations: Mapped[list["Recreation"]] = relationship(back_populates="viral_post")


class Recreation(Base):
    __tablename__ = "recreations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    viral_post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("viral_posts.id"), nullable=False)
    generated_script: Mapped[str | None] = mapped_column(Text)
    generated_caption: Mapped[str | None] = mapped_column(Text)
    generated_hashtags: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    suggested_publish_time: Mapped[str | None] = mapped_column(String(50))
    thumbnail_prompt: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    result_likes: Mapped[int | None] = mapped_column(Integer)
    result_comments: Mapped[int | None] = mapped_column(Integer)
    result_engagement_rate: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="recreations")
    viral_post: Mapped["ViralPost"] = relationship(back_populates="recreations")
