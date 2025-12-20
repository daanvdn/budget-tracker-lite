from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..database import get_db
from ..models import User as UserModel
from ..schemas import User, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[User])
async def list_users(db: AsyncSession = Depends(get_db)):
    """List all users"""
    result = await db.execute(select(UserModel).order_by(UserModel.name))
    users = result.scalars().all()
    return users


@router.post("", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user"""
    db_user = UserModel(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get a user by ID"""
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, user: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update a user"""
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user.model_dump().items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a user"""
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(db_user)
    await db.commit()
