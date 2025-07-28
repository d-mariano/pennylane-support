from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlmodel import Session, select

from ..dependencies import get_session
from ..models.challenge import (
    Challenge, ChallengeCreate, ChallengePublic, ChallengeUpdate, ChallengeDifficulty
)
from ..models.conversation import Conversation, ConversationPublic
from ..models.responses import ListResponse

router = APIRouter(
    prefix="/challenges",
    tags=["challenges"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=ListResponse[ChallengePublic])
async def list_challenges(
    *,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    difficulty: Optional[ChallengeDifficulty] = None,
    category: Optional[str] = None,
):
    """List all challenges with optional filtering and pagination."""
    query = select(Challenge)
    
    if difficulty:
        query = query.where(Challenge.difficulty == difficulty)
    if category:
        query = query.where(Challenge.category == category)
    
    total = session.scalar(select(func.count()).select_from(Challenge)) or 0    
    items = session.exec(query.offset(offset).limit(limit)).all()
    
    return ListResponse[Challenge](
        items=items,
        total=total,
        offset=offset,
        limit=limit,
    )

@router.post("/", response_model=ChallengePublic, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    *,
    session: Session = Depends(get_session),
    challenge: ChallengeCreate,
):
    """Create a new coding challenge."""
    db_challenge = Challenge.model_validate(challenge)
    session.add(db_challenge)
    session.commit()
    session.refresh(db_challenge)
    return db_challenge

@router.get("/{challenge_id}", response_model=ChallengePublic)
async def read_challenge(
    *,
    session: Session = Depends(get_session),
    challenge_id: str,
):
    """Get a single challenge by ID."""
    challenge = session.exec(
        select(Challenge)
        .where(Challenge.challenge_id == challenge_id)
    ).first()
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    return challenge

@router.patch("/{challenge_id}", response_model=ChallengePublic)
async def update_challenge(
    *,
    session: Session = Depends(get_session),
    challenge_id: str,
    challenge: ChallengeUpdate,
):
    """Update a challenge's metadata."""
    db_challenge = await read_challenge(session=session, challenge_id=challenge_id)
    
    update_data = challenge.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_challenge, key, value)
    
    session.add(db_challenge)
    session.commit()
    session.refresh(db_challenge)
    return db_challenge

@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge(
    *,
    session: Session = Depends(get_session),
    challenge_id: str,
):
    """Delete a challenge."""
    challenge = await read_challenge(session=session, challenge_id=challenge_id)
    session.delete(challenge)
    session.commit()
    return {"ok": True}

@router.get("/{challenge_id}/conversations", response_model=ListResponse[ConversationPublic])
async def get_challenge_conversations(
    *,
    session: Session = Depends(get_session),
    challenge_id: str,
    offset: int = 0,
    limit: int = Query(default=20, le=100),
):
    """Get all conversations for a specific challenge with pagination."""
    challenge = await read_challenge(session=session, challenge_id=challenge_id)
    
    total = session.scalar(
        select(func.count()).select_from(Conversation)
        .where(Conversation.challenge_id == challenge.id)
    ) or 0

    query = (
        select(Conversation)
        .where(Conversation.challenge_id == challenge.id)
        .order_by(Conversation.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    items = session.exec(query).all()
    
    return ListResponse(
        items=items,
        total=total,
        offset=offset,
        limit=limit,
    )
