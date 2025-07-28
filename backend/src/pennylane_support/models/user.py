from enum import StrEnum
from pydantic import BaseModel


class UserRole(StrEnum):
    SUPPORT = "support"
    USER = "user"


class User(BaseModel):
    user_id: int
    username: str
    email: str
    role: UserRole
