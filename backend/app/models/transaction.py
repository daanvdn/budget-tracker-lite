from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database.database import Base
import enum


class TransactionType(str, enum.Enum):
    EXPENSE = "expense"
    INCOME = "income"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False, index=True)
    description = Column(String)
    type = Column(Enum(TransactionType), nullable=False, index=True)
    image_path = Column(String, nullable=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey("beneficiaries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    category = relationship("Category")
    beneficiary = relationship("Beneficiary")
    user = relationship("User")
