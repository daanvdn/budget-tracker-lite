from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class TransactionType(str, Enum):
    """Transaction type enumeration"""

    EXPENSE = "expense"
    INCOME = "income"


class CategoryType(str, Enum):
    """Category type enumeration"""

    EXPENSE = "expense"
    INCOME = "income"
    BOTH = "both"


# User Schemas
class UserBase(BaseModel):
    """Base user schema"""

    name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a user"""

    pass


class UserUpdate(UserBase):
    """Schema for updating a user"""

    pass


class User(UserBase):
    """Schema for user response"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# Category Schemas
class CategoryBase(BaseModel):
    """Base category schema"""

    name: str = Field(..., min_length=1, max_length=100)
    type: CategoryType


class CategoryCreate(CategoryBase):
    """Schema for creating a category"""

    pass


class CategoryUpdate(CategoryBase):
    """Schema for updating a category"""

    pass


class Category(CategoryBase):
    """Schema for category response"""

    model_config = ConfigDict(from_attributes=True)

    id: int


# Beneficiary Schemas
class BeneficiaryBase(BaseModel):
    """Base beneficiary schema"""

    name: str = Field(..., min_length=1, max_length=100)


class BeneficiaryCreate(BeneficiaryBase):
    """Schema for creating a beneficiary"""

    pass


class BeneficiaryUpdate(BeneficiaryBase):
    """Schema for updating a beneficiary"""

    pass


class Beneficiary(BeneficiaryBase):
    """Schema for beneficiary response"""

    model_config = ConfigDict(from_attributes=True)

    id: int


# Transaction Schemas
class TransactionBase(BaseModel):
    """Base transaction schema"""

    type: TransactionType
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=1)
    transaction_date: datetime
    category_id: int
    beneficiary_id: int
    created_by_user_id: int
    image_path: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction"""

    pass


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction"""

    type: Optional[TransactionType] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1)
    transaction_date: Optional[datetime] = None
    category_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    created_by_user_id: Optional[int] = None
    image_path: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class Transaction(TransactionBase):
    """Schema for transaction response"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    category: Category
    beneficiary: Beneficiary
    created_by_user: User


# Aggregation Schemas
class AggregationFilters(BaseModel):
    """Filters for aggregation queries"""

    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    transaction_type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    beneficiary_id: Optional[int] = None


class AggregationSummary(BaseModel):
    """Summary aggregation result"""

    total_income: float = 0.0
    total_expenses: float = 0.0
    net_total: float = 0.0
    net_balance: float = 0.0
    transaction_count: int = 0
