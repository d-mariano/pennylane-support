from pydantic import BaseModel
from typing import List, TypeVar, Generic

T = TypeVar("T")

class ListResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    offset: int
    limit: int
