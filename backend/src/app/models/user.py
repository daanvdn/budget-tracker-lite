from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database.session import Base


class User(Base):
    """User model for transactions and authentication."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    transactions = relationship("Transaction", back_populates="created_by_user")
    gift_occasions = relationship("GiftOccasion", back_populates="created_by_user")
    gift_entries = relationship("GiftEntry", back_populates="created_by_user")
    gift_purchases = relationship("GiftPurchase", back_populates="created_by_user")
