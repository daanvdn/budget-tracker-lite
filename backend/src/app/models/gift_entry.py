from datetime import datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.schemas import GiftDirection


class GiftEntry(Base):
    """Gift entry model for tracking individual gifts."""

    __tablename__ = "gift_entries"

    id = Column(Integer, primary_key=True, index=True)
    occasion_id = Column(Integer, ForeignKey("gift_occasions.id"), nullable=False)
    direction = Column(Enum(GiftDirection), nullable=False)
    person_id = Column(Integer, ForeignKey("beneficiaries.id"), nullable=False)
    amount = Column(Float, nullable=False)
    gift_date = Column(Date, nullable=False)
    description = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    occasion = relationship("GiftOccasion", back_populates="gift_entries")
    person = relationship("Beneficiary", back_populates="gift_entries")
    transaction = relationship("Transaction", back_populates="gift_entries")
    created_by_user = relationship("User", back_populates="gift_entries")
