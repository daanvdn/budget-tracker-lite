from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


class GiftPurchase(Base):
    """Gift purchase model for tracking purchases made from pooled gift money."""

    __tablename__ = "gift_purchases"

    id = Column(Integer, primary_key=True, index=True)
    occasion_id = Column(Integer, ForeignKey("gift_occasions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    description = Column(String(200), nullable=False)
    notes = Column(Text, nullable=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    occasion = relationship("GiftOccasion", back_populates="gift_purchases")
    transaction = relationship("Transaction", back_populates="gift_purchases")
    created_by_user = relationship("User", back_populates="gift_purchases")
