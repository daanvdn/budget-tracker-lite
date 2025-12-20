from sqlalchemy import Column, Integer, String, Enum
from app.database.database import Base
import enum


class CategoryType(str, enum.Enum):
    EXPENSE = "expense"
    INCOME = "income"
    BOTH = "both"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(Enum(CategoryType), nullable=False, default=CategoryType.EXPENSE)
