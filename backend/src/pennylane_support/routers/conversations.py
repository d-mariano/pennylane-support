from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from ..dependencies import get_session, get_user
from ..models.challenge import Challenge
from ..models.conversation import (
    Conversation, ConversationCreate, ConversationPublic, ConversationUpdate,
    Post, PostCreate, PostPublic, ConversationStatus
)
from ..models.responses import ListResponse
from ..models.user import User, UserRole

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"],
    responses={404: {"description": "Not found"}},
)

def get_conversation(session: Session, conversation_id: int) -> Conversation:
    """Get a conversation by ID or raise 404 if not found."""
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.get("/", response_model=ListResponse[ConversationPublic])
async def list_conversations(
    *,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    status: Optional[ConversationStatus] = None,
    category: Optional[str] = None,
    challenge_id: Optional[str] = None,
):
    """List all support conversations with optional filtering."""
    query = select(Conversation)
    
    if status:
        query = query.where(Conversation.status == status)
    if category:
        query = query.where(Conversation.category == category)
    if challenge_id:
        query = query.join(Challenge).where(Challenge.challenge_id == challenge_id)
    
    # Get total count for pagination
    total = session.scalar(select(func.count()).select_from(Conversation)) or 0
    items = session.exec(query.offset(offset).limit(limit)).all()
    
    return ListResponse[ConversationPublic](
        items=items,
        total=total,
        offset=offset,
        limit=limit,
    )

@router.get("/user", response_model=ListResponse[ConversationPublic])
async def list_user_conversations(
    *,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    user: User = Depends(get_user),
):
    query = select(Conversation).where(Conversation.user == user.username)
    total = session.scalar(select(func.count()).select_from(Conversation).where(Conversation.user == user.username)) or 0
    items = session.exec(query.offset(offset).limit(limit)).all()
    
    return ListResponse[ConversationPublic](
        items=items,
        total=total,
        offset=offset,
        limit=limit,
    )

@router.post("/", response_model=ConversationPublic, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    *,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
    conversation: ConversationCreate,
):
    """Create a new support conversation."""
    db_conversation = Conversation.model_validate(
        **conversation.model_dump(), user=user.username
    )
    session.add(db_conversation)
    session.commit()
    session.refresh(db_conversation)
    return db_conversation

@router.get("/{conversation_id}", response_model=ConversationPublic)
async def read_conversation(
    *,
    session: Session = Depends(get_session),
    conversation_id: int,
):
    """Get a single conversation by ID with all its posts."""
    conversation = session.exec(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.posts))
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return conversation

@router.patch("/{conversation_id}", response_model=ConversationPublic)
async def update_conversation(
    *,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
    conversation_id: int,
    conversation: ConversationUpdate,
):
    """Update a conversation's metadata."""
    if user.role != UserRole.SUPPORT:
        raise HTTPException(status_code=403, detail="User is not authorized to update this conversation")

    db_conversation = await read_conversation(session=session, conversation_id=conversation_id)
    
    # Update only the fields that were provided
    update_data = conversation.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_conversation, key, value)
    
    db_conversation.updated_at = datetime.now(timezone.utc)
    session.add(db_conversation)
    session.commit()
    session.refresh(db_conversation)
    return db_conversation

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    *,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
    conversation_id: int,
):
    """Delete a conversation and all its posts."""
    conversation = await read_conversation(session=session, conversation_id=conversation_id)
    
    if user.username != conversation.user:
        raise HTTPException(status_code=403, detail="User is not authorized to delete this conversation")

    session.delete(conversation)
    session.commit()
    return {"ok": True}

# Post endpoints
@router.post("/{conversation_id}/posts", response_model=PostPublic, status_code=status.HTTP_201_CREATED)
async def create_post(
    *,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
    conversation_id: int,
    post: PostCreate,
):
    """Add a post to an existing conversation."""
    # Verify conversation exists
    conversation = await read_conversation(session=session, conversation_id=conversation_id)
    
    # Create the new post
    db_post = Post(
        **post.model_dump(),
        user=user.username,
        conversation_id=conversation_id,
        timestamp=datetime.now(timezone.utc)
    )
    
    # Update conversation's updated_at timestamp
    conversation.updated_at = datetime.now(timezone.utc)
    
    session.add(db_post)
    session.commit()
    session.refresh(db_post)
    return db_post

@router.get("/{conversation_id}/posts", response_model=ListResponse[PostPublic])
async def list_posts(
    *,
    session: Session = Depends(get_session),
    conversation_id: int,
    offset: int = 0,
    limit: int = Query(default=20, le=100),
):
    """List all posts in a conversation with pagination."""
    # Verify conversation exists
    await read_conversation(session=session, conversation_id=conversation_id)
    
    # Get total count for pagination
    total = session.scalar(
        select(func.count()).select_from(Post)
        .where(Post.conversation_id == conversation_id)
    ) or 0
    
    # Get paginated posts
    query = (
        select(Post)
        .where(Post.conversation_id == conversation_id)
        .order_by(Post.timestamp)
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

@router.get("/{conversation_id}/posts/{post_id}", response_model=PostPublic)
async def read_post(
    *,
    session: Session = Depends(get_session),
    conversation_id: int,
    post_id: int,
):
    """Get a specific post from a conversation."""
    # Verify conversation exists
    await read_conversation(session=session, conversation_id=conversation_id)
    
    post = session.exec(
        select(Post)
        .where(Post.conversation_id == conversation_id)
        .where(Post.id == post_id)
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return post

@router.delete("/{conversation_id}/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    *,
    user: User = Depends(get_user),
    session: Session = Depends(get_session),
    conversation_id: int,
    post_id: int,
):
    """Delete a specific post from a conversation."""
    # Verify conversation exists
    await read_conversation(session=session, conversation_id=conversation_id)
    
    post = session.exec(
        select(Post)
        .where(Post.conversation_id == conversation_id)
        .where(Post.id == post_id)
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if user.username != post.user:
        raise HTTPException(status_code=403, detail="User is not authorized to delete this post")
    
    session.delete(post)
    session.commit()
    return
