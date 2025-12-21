from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.schemas import TransactionType


class Transaction(Base):
    """Transaction model for budget tracking."""

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    transaction_date = Column(DateTime, nullable=False, index=True)
    description = Column(String, nullable=False)
    type = Column(Enum(TransactionType), nullable=False, index=True)
    image_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey("beneficiaries.id"), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    category = relationship("Category", back_populates="transactions")
    beneficiary = relationship("Beneficiary", back_populates="transactions")
    created_by_user = relationship("User", back_populates="transactions")
