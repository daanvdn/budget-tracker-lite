from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.schemas import OccasionType


class GiftOccasion(Base):
    """Gift occasion model for tracking gift-giving events."""

    __tablename__ = "gift_occasions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    occasion_type = Column(Enum(OccasionType), nullable=False, default=OccasionType.OTHER)
    occasion_date = Column(Date, nullable=True)
    person_id = Column(Integer, ForeignKey("beneficiaries.id"), nullable=True)
    notes = Column(Text, nullable=True)
    is_pool_account = Column(Boolean, default=False, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    person = relationship("Beneficiary", back_populates="gift_occasions")
    created_by_user = relationship("User", back_populates="gift_occasions")
    gift_entries = relationship("GiftEntry", back_populates="occasion", cascade="all, delete-orphan")
    gift_purchases = relationship("GiftPurchase", back_populates="occasion", cascade="all, delete-orphan")
