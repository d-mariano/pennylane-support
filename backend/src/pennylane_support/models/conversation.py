from tkinter.constants import S
from typing import List, Optional, TYPE_CHECKING
from enum import Enum
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .challenge import Challenge

class ConversationStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_FOR_USER = "WAITING_FOR_USER"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class PostCreate(SQLModel):
    """Schema for creating a new post."""
    content: str

class PostBase(PostCreate):
    """Base schema for a post in a conversation."""
    user: str
    conversation_id: int = Field(default=None, foreign_key="conversation.id")

class Post(PostBase, table=True):
    """Database model for a post in a conversation."""
    id: int | None = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    conversation: Optional["Conversation"] = Relationship(back_populates="posts")

class PostPublic(PostBase):
    """Schema for public representation of a post."""
    id: int
    timestamp: datetime

class ConversationCreate(SQLModel):
    """Schema for creating a new conversation."""
    identifier: str = Field(unique=True, index=True)
    challenge_id: int = Field(foreign_key="challenge.id")
    topic: str
    category: str
    status: ConversationStatus = ConversationStatus.OPEN
    assignee: str | None = None

class ConversationBase(ConversationCreate):
    """Base schema for a conversation."""
    user: str

class Conversation(ConversationBase, table=True):
    """Database model for a conversation."""
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)}
    )
    
    challenge: "Challenge" = Relationship(back_populates="conversations")
    posts: List[Post] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class ConversationPublic(ConversationBase):
    """Schema for public representation of a conversation."""
    id: int
    created_at: datetime
    updated_at: datetime
    posts: List[PostPublic] = []

class ConversationUpdate(SQLModel):
    """Schema for updating a conversation."""
    assignee: str | None = None
    status: ConversationStatus | None = None
