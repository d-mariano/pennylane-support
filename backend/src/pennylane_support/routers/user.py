from fastapi import APIRouter, Depends
from ..dependencies import get_user
from ..models.user import User

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=User)
async def user(user: User = Depends(get_user)):
    return user
