from typing import List, TYPE_CHECKING
from enum import Enum
from datetime import datetime, timezone
from sqlalchemy.types import JSON
from sqlmodel import SQLModel, Field, Relationship, Column

if TYPE_CHECKING:
    from .conversation import Conversation

class ChallengeDifficulty(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class ChallengeBase(SQLModel):
    """Base schema for a challenge."""
    challenge_id: str = Field(unique=True, index=True)
    title: str
    description: str
    category: str
    difficulty: ChallengeDifficulty
    points: int = 0
    tags: List[str] = Field(sa_column=Column(JSON), default_factory=list)
    learning_objectives: List[str] = Field(sa_column=Column(JSON), default_factory=list)
    hints: List[str] = Field(sa_column=Column(JSON), default_factory=list)

class Challenge(ChallengeBase, table=True):
    """Database model for a challenge."""
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)}
    )
    
    conversations: List["Conversation"] = Relationship(back_populates="challenge")

class ChallengeCreate(ChallengeBase):
    """Schema for creating a new challenge."""
    pass


class ChallengePublic(ChallengeBase):
    """Schema for public representation of a challenge."""
    id: int
    created_at: datetime
    updated_at: datetime

class ChallengeUpdate(ChallengeBase):
    ...
