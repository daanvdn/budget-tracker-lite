from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.transactions.schemas import TransactionCreate, TransactionUpdate


def create_transaction(db: Session, transaction_data: TransactionCreate, user: User) -> Transaction:
    """Create a new transaction for a user"""
    transaction = Transaction(
        user_id=user.id,
        description=transaction_data.description,
        amount=transaction_data.amount,
        category=transaction_data.category,
        type=transaction_data.type,
        date=transaction_data.date or datetime.utcnow(),
        created_at=datetime.utcnow(),
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def get_transactions(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
    type_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
) -> List[Transaction]:
    """Get all transactions for a user with optional filters"""
    query = db.query(Transaction).filter(Transaction.user_id == user.id)

    if type_filter:
        query = query.filter(Transaction.type == type_filter)

    if category_filter:
        query = query.filter(Transaction.category == category_filter)

    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()


def get_transaction_by_id(db: Session, transaction_id: int, user: User) -> Optional[Transaction]:
    """Get a specific transaction by ID for a user"""
    return db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user.id).first()


def update_transaction(
    db: Session, transaction_id: int, transaction_data: TransactionUpdate, user: User
) -> Optional[Transaction]:
    """Update a transaction"""
    transaction = get_transaction_by_id(db, transaction_id, user)
    if not transaction:
        return None

    # Update only provided fields
    if transaction_data.description is not None:
        transaction.description = transaction_data.description
    if transaction_data.amount is not None:
        transaction.amount = transaction_data.amount
    if transaction_data.category is not None:
        transaction.category = transaction_data.category
    if transaction_data.type is not None:
        transaction.type = transaction_data.type
    if transaction_data.date is not None:
        transaction.date = transaction_data.date

    db.commit()
    db.refresh(transaction)

    return transaction


def delete_transaction(db: Session, transaction_id: int, user: User) -> bool:
    """Delete a transaction"""
    transaction = get_transaction_by_id(db, transaction_id, user)
    if not transaction:
        return False

    db.delete(transaction)
    db.commit()

    return True
