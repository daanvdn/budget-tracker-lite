from sqlalchemy import String, Integer, Numeric, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional
import enum

from ..database import Base


class TransactionType(str, enum.Enum):
    """Transaction type enumeration"""

    EXPENSE = "expense"
    INCOME = "income"


class CategoryType(str, enum.Enum):
    """Category type enumeration"""

    EXPENSE = "expense"
    INCOME = "income"
    BOTH = "both"


class User(Base):
    """User model"""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="created_by_user")


class Category(Base):
    """Category model"""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    type: Mapped[CategoryType] = mapped_column(SQLEnum(CategoryType), nullable=False)

    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="category")


class Beneficiary(Base):
    """Beneficiary model"""

    __tablename__ = "beneficiaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="beneficiary")


class Transaction(Base):
    """Transaction model - unified for expenses and income"""

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[TransactionType] = mapped_column(SQLEnum(TransactionType), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    transaction_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    image_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Foreign keys
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    beneficiary_id: Mapped[int] = mapped_column(Integer, ForeignKey("beneficiaries.id"), nullable=False, index=True)
    created_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")
    beneficiary: Mapped["Beneficiary"] = relationship("Beneficiary", back_populates="transactions")
    created_by_user: Mapped["User"] = relationship("User", back_populates="transactions")
