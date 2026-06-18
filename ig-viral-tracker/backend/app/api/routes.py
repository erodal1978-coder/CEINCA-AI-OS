import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Recreation, TrackedAccount, User, ViralPost
from app.schemas.schemas import (
    DashboardStats,
    RecreationCreate,
    RecreationResponse,
    TrackedAccountCreate,
    TrackedAccountResponse,
    UserCreate,
    UserResponse,
    ViralPostResponse,
)
from app.services.ai_analysis import generate_recreation
from app.tasks.scanner import scan_single_account

router = APIRouter()


# --- Users ---

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --- Tracked Accounts ---

@router.get("/users/{user_id}/accounts", response_model=list[TrackedAccountResponse])
def list_tracked_accounts(user_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(TrackedAccount).filter(TrackedAccount.user_id == user_id).all()


@router.post("/users/{user_id}/accounts", response_model=TrackedAccountResponse)
def add_tracked_account(user_id: uuid.UUID, account: TrackedAccountCreate, db: Session = Depends(get_db)):
    count = db.query(TrackedAccount).filter(TrackedAccount.user_id == user_id).count()
    if count >= settings.MAX_TRACKED_ACCOUNTS:
        raise HTTPException(status_code=400, detail=f"Maximum {settings.MAX_TRACKED_ACCOUNTS} tracked accounts reached")

    db_account = TrackedAccount(user_id=user_id, **account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@router.delete("/users/{user_id}/accounts/{account_id}")
def remove_tracked_account(user_id: uuid.UUID, account_id: uuid.UUID, db: Session = Depends(get_db)):
    account = db.query(TrackedAccount).filter(
        TrackedAccount.id == account_id, TrackedAccount.user_id == user_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return {"status": "deleted"}


@router.post("/users/{user_id}/accounts/{account_id}/scan")
def trigger_scan(user_id: uuid.UUID, account_id: uuid.UUID, db: Session = Depends(get_db)):
    account = db.query(TrackedAccount).filter(
        TrackedAccount.id == account_id, TrackedAccount.user_id == user_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    scan_single_account.delay(str(account_id))
    return {"status": "scan_queued"}


# --- Viral Posts ---

@router.get("/users/{user_id}/virals", response_model=list[ViralPostResponse])
def list_viral_posts(user_id: uuid.UUID, limit: int = 50, db: Session = Depends(get_db)):
    account_ids = db.query(TrackedAccount.id).filter(TrackedAccount.user_id == user_id).subquery()
    return (
        db.query(ViralPost)
        .filter(ViralPost.tracked_account_id.in_(account_ids))
        .order_by(desc(ViralPost.detected_at))
        .limit(limit)
        .all()
    )


@router.get("/virals/{viral_id}", response_model=ViralPostResponse)
def get_viral_post(viral_id: uuid.UUID, db: Session = Depends(get_db)):
    post = db.query(ViralPost).filter(ViralPost.id == viral_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Viral post not found")
    return post


# --- Recreations ---

@router.post("/users/{user_id}/recreations", response_model=RecreationResponse)
def create_recreation(user_id: uuid.UUID, data: RecreationCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    viral_post = db.query(ViralPost).filter(ViralPost.id == data.viral_post_id).first()
    if not viral_post:
        raise HTTPException(status_code=404, detail="Viral post not found")

    account = db.query(TrackedAccount).filter(TrackedAccount.id == viral_post.tracked_account_id).first()

    result = generate_recreation(
        username=account.ig_username,
        post_type=viral_post.post_type,
        analysis=viral_post.ai_analysis or {},
        user_niche=user.niche,
        user_tone=user.tone_of_voice,
        desired_format=data.desired_format,
    )

    recreation = Recreation(
        user_id=user_id,
        viral_post_id=data.viral_post_id,
        generated_script=result.get("script"),
        generated_caption=result.get("caption"),
        generated_hashtags=result.get("hashtags"),
        suggested_publish_time=result.get("suggested_publish_time"),
        thumbnail_prompt=result.get("thumbnail_prompt"),
    )
    db.add(recreation)
    db.commit()
    db.refresh(recreation)
    return recreation


@router.get("/users/{user_id}/recreations", response_model=list[RecreationResponse])
def list_recreations(user_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Recreation).filter(Recreation.user_id == user_id).order_by(desc(Recreation.created_at)).all()


# --- Dashboard ---

@router.get("/users/{user_id}/dashboard", response_model=DashboardStats)
def get_dashboard(user_id: uuid.UUID, db: Session = Depends(get_db)):
    accounts = db.query(TrackedAccount).filter(TrackedAccount.user_id == user_id).all()
    account_ids = [a.id for a in accounts]

    total_virals = db.query(ViralPost).filter(ViralPost.tracked_account_id.in_(account_ids)).count() if account_ids else 0
    total_recreations = db.query(Recreation).filter(Recreation.user_id == user_id).count()

    top_accounts = []
    if account_ids:
        top_query = (
            db.query(TrackedAccount.ig_username, func.count(ViralPost.id).label("viral_count"))
            .join(ViralPost, ViralPost.tracked_account_id == TrackedAccount.id)
            .filter(TrackedAccount.user_id == user_id)
            .group_by(TrackedAccount.ig_username)
            .order_by(desc("viral_count"))
            .limit(10)
            .all()
        )
        top_accounts = [{"username": r[0], "viral_count": r[1]} for r in top_query]

    recent_virals = (
        db.query(ViralPost)
        .filter(ViralPost.tracked_account_id.in_(account_ids))
        .order_by(desc(ViralPost.detected_at))
        .limit(20)
        .all()
    ) if account_ids else []

    return DashboardStats(
        total_tracked_accounts=len(accounts),
        total_viral_posts=total_virals,
        total_recreations=total_recreations,
        top_accounts=top_accounts,
        recent_virals=recent_virals,
    )
