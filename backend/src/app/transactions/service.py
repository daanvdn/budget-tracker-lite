from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.beneficiary import Beneficiary
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas import CategoryType, TransactionType
from app.transactions.schemas import TransactionCreate, TransactionResponse, TransactionUpdate

DEFAULT_BENEFICIARY_NAME = "General"


async def _get_or_create_category(db: AsyncSession, name: str, transaction_type: TransactionType) -> Category:
    """Fetch existing category by name or create a new one."""
    result = await db.execute(select(Category).where(Category.name == name))
    category = result.scalar_one_or_none()
    if category:
        return category

    category = Category(
        name=name,
        type=CategoryType.INCOME if transaction_type == TransactionType.INCOME else CategoryType.EXPENSE,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def _get_default_beneficiary(db: AsyncSession) -> Beneficiary:
    """Fetch or create a default beneficiary for simple transaction inputs."""
    result = await db.execute(select(Beneficiary).where(Beneficiary.name == DEFAULT_BENEFICIARY_NAME))
    beneficiary = result.scalar_one_or_none()
    if beneficiary:
        return beneficiary

    beneficiary = Beneficiary(name=DEFAULT_BENEFICIARY_NAME)
    db.add(beneficiary)
    await db.commit()
    await db.refresh(beneficiary)
    return beneficiary


def _to_response(transaction: Transaction, category_name: str, user_id: int) -> TransactionResponse:
    """Map a Transaction model to the simplified response expected by the frontend."""
    return TransactionResponse(
        id=transaction.id,
        user_id=user_id,
        description=transaction.description,
        amount=transaction.amount,
        category=category_name,
        type=transaction.type.value,
        date=transaction.transaction_date,
        created_at=transaction.created_at,
    )


async def create_transaction(db: AsyncSession, transaction_data: TransactionCreate, user: User) -> TransactionResponse:
    """Create a new transaction for a user"""
    transaction_type = TransactionType(transaction_data.type)
    category = await _get_or_create_category(db, transaction_data.category, transaction_type)
    beneficiary = await _get_default_beneficiary(db)

    transaction = Transaction(
        amount=transaction_data.amount,
        transaction_date=transaction_data.date or datetime.utcnow(),
        description=transaction_data.description,
        type=transaction_type,
        category_id=category.id,
        beneficiary_id=beneficiary.id,
        created_by_user_id=user.id,
    )

    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)

    return _to_response(transaction, category.name, user.id)


async def get_transactions(
    db: AsyncSession,
    user: User,
    skip: int = 0,
    limit: int = 100,
    type_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
) -> List[TransactionResponse]:
    """Get all transactions for a user with optional filters"""
    query = (
        select(Transaction, Category.name)
        .join(Category, Transaction.category_id == Category.id)
        .where(Transaction.created_by_user_id == user.id)
        .order_by(Transaction.transaction_date.desc())
        .offset(skip)
        .limit(limit)
    )

    if type_filter:
        query = query.where(Transaction.type == TransactionType(type_filter))

    if category_filter:
        query = query.where(Category.name == category_filter)

    result = await db.execute(query)
    rows = result.all()

    return [_to_response(transaction, category_name, user.id) for transaction, category_name in rows]


async def get_transaction_by_id(db: AsyncSession, transaction_id: int, user: User) -> Optional[TransactionResponse]:
    """Get a specific transaction by ID for a user"""
    result = await db.execute(
        select(Transaction, Category.name)
        .join(Category, Transaction.category_id == Category.id)
        .where(Transaction.id == transaction_id, Transaction.created_by_user_id == user.id)
    )
    row = result.first()
    if not row:
        return None

    transaction, category_name = row
    return _to_response(transaction, category_name, user.id)


async def update_transaction(
    db: AsyncSession, transaction_id: int, transaction_data: TransactionUpdate, user: User
) -> Optional[TransactionResponse]:
    """Update a transaction"""
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.created_by_user_id == user.id)
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        return None

    # Update only provided fields
    if transaction_data.description is not None:
        transaction.description = transaction_data.description
    if transaction_data.amount is not None:
        transaction.amount = transaction_data.amount
    if transaction_data.type is not None:
        transaction.type = TransactionType(transaction_data.type)
    if transaction_data.date is not None:
        transaction.transaction_date = transaction_data.date

    category_name: Optional[str] = None
    if transaction_data.category is not None:
        category = await _get_or_create_category(
            db,
            transaction_data.category,
            transaction.type,  # type: ignore[arg-type]
        )
        transaction.category_id = category.id
        category_name = category.name

    await db.commit()
    await db.refresh(transaction)

    if category_name is None:
        category_result = await db.execute(select(Category.name).where(Category.id == transaction.category_id))
        category_name = category_result.scalar_one_or_none() or ""

    return _to_response(transaction, category_name, user.id)


async def delete_transaction(db: AsyncSession, transaction_id: int, user: User) -> bool:
    """Delete a transaction"""
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.created_by_user_id == user.id)
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        return False

    await db.delete(transaction)
    await db.commit()

    return True
