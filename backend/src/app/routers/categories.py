from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.dependencies import get_current_active_user
from ..database import get_db
from ..models import Category as CategoryModel
from ..models import User
from ..schemas import Category, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[Category])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all categories"""
    result = await db.execute(select(CategoryModel).order_by(CategoryModel.name))
    categories = result.scalars().all()
    return categories


@router.post("", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new category"""
    db_category = CategoryModel(**category.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category


@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a category by ID"""
    result = await db.execute(select(CategoryModel).where(CategoryModel.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a category"""
    result = await db.execute(select(CategoryModel).where(CategoryModel.id == category_id))
    db_category = result.scalar_one_or_none()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    for key, value in category.model_dump().items():
        setattr(db_category, key, value)

    await db.commit()
    await db.refresh(db_category)
    return db_category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a category"""
    result = await db.execute(select(CategoryModel).where(CategoryModel.id == category_id))
    db_category = result.scalar_one_or_none()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(db_category)
    await db.commit()
