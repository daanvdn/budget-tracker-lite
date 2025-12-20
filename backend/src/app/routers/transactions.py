from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import Transaction as TransactionModel
from ..schemas import Transaction, TransactionCreate, TransactionType, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[Transaction])
async def list_transactions(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    transaction_type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    beneficiary_id: Optional[int] = None,
    created_by_user_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """List transactions with optional filters"""
    query = select(TransactionModel).options(
        selectinload(TransactionModel.category),
        selectinload(TransactionModel.beneficiary),
        selectinload(TransactionModel.created_by_user),
    )

    # Apply filters
    if start_date:
        query = query.where(TransactionModel.transaction_date >= start_date)
    if end_date:
        query = query.where(TransactionModel.transaction_date <= end_date)
    if transaction_type:
        query = query.where(TransactionModel.type == transaction_type)
    if category_id:
        query = query.where(TransactionModel.category_id == category_id)
    if beneficiary_id:
        query = query.where(TransactionModel.beneficiary_id == beneficiary_id)
    if created_by_user_id:
        query = query.where(TransactionModel.created_by_user_id == created_by_user_id)

    # Order by transaction date descending
    query = query.order_by(TransactionModel.transaction_date.desc())

    # Pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    transactions = result.scalars().all()
    return transactions


# Accept trailing slash for list endpoint without redirect
router.add_api_route(
    "/",
    list_transactions,
    methods=["GET"],
    response_model=List[Transaction],
    include_in_schema=False,
)


@router.post("", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction(transaction: TransactionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new transaction"""
    db_transaction = TransactionModel(**transaction.model_dump())
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)

    # Load relationships
    result = await db.execute(
        select(TransactionModel)
        .where(TransactionModel.id == db_transaction.id)
        .options(
            selectinload(TransactionModel.category),
            selectinload(TransactionModel.beneficiary),
            selectinload(TransactionModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: int, db: AsyncSession = Depends(get_db)):
    """Get a transaction by ID"""
    result = await db.execute(
        select(TransactionModel)
        .where(TransactionModel.id == transaction_id)
        .options(
            selectinload(TransactionModel.category),
            selectinload(TransactionModel.beneficiary),
            selectinload(TransactionModel.created_by_user),
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: int, transaction: TransactionUpdate, db: AsyncSession = Depends(get_db)):
    """Update a transaction"""
    result = await db.execute(select(TransactionModel).where(TransactionModel.id == transaction_id))
    db_transaction = result.scalar_one_or_none()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Update only provided fields
    for key, value in transaction.model_dump(exclude_unset=True).items():
        setattr(db_transaction, key, value)

    await db.commit()
    await db.refresh(db_transaction)

    # Load relationships
    result = await db.execute(
        select(TransactionModel)
        .where(TransactionModel.id == transaction_id)
        .options(
            selectinload(TransactionModel.category),
            selectinload(TransactionModel.beneficiary),
            selectinload(TransactionModel.created_by_user),
        )
    )
    return result.scalar_one()


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(transaction_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a transaction"""
    result = await db.execute(select(TransactionModel).where(TransactionModel.id == transaction_id))
    db_transaction = result.scalar_one_or_none()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    await db.delete(db_transaction)
    await db.commit()
