from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_active_user
from models.user import User
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user