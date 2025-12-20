from sqlalchemy import Column, Enum, Integer, String
from sqlalchemy.orm import relationship
from src.app.database.session import Base
from src.app.schemas import CategoryType


class Category(Base):
    """Budget category model."""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(Enum(CategoryType), nullable=False)

    transactions = relationship("Transaction", back_populates="category")
