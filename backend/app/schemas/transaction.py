from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    amount: float
    date: date
    description: Optional[str] = None
    type: TransactionType
    category_id: int
    beneficiary_id: int
    user_id: int


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[date] = None
    description: Optional[str] = None
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    beneficiary_id: Optional[int] = None
    user_id: Optional[int] = None


class TransactionResponse(BaseModel):
    id: int
    amount: float
    date: date
    description: Optional[str]
    type: TransactionType
    image_path: Optional[str]
    category_id: int
    beneficiary_id: int
    user_id: int

    class Config:
        from_attributes = True


class TransactionFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    beneficiary_id: Optional[int] = None
    category_id: Optional[int] = None
    type: Optional[TransactionType] = None
