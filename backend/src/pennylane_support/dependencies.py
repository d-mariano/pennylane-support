from sqlmodel import Session
from .database import engine
from .models.user import User, UserRole

def get_session():
    with Session(engine) as session:
        yield session

def get_user():

    # user = User(**{
    #     "user_id": 1,
    #     "username": "pennylane_support",
    #     "email": "pennylane_support@example.com",
    #     "role": UserRole.SUPPORT
    # })

    user = User(**{
        "user_id": 1,
        "username": "newbie_quantum",
        "email": "newbie_quantum@example.com",
        "role": UserRole.USER
    })

    return user
