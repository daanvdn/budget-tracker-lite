from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.app.database.session import Base


class Beneficiary(Base):
    """Beneficiary model."""

    __tablename__ = "beneficiaries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    transactions = relationship("Transaction", back_populates="beneficiary")
