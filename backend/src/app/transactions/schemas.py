from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TransactionCreate(BaseModel):
    """Schema for creating a transaction"""
    description: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., pattern="^(income|expense)$")
    date: Optional[datetime] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "description": "Grocery shopping",
                "amount": 50.25,
                "category": "Food",
                "type": "expense",
                "date": "2024-01-15T10:00:00"
            }
        }


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction"""
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[str] = Field(None, pattern="^(income|expense)$")
    date: Optional[datetime] = None


class TransactionResponse(BaseModel):
    """Schema for transaction response"""
    id: int
    user_id: int
    description: str
    amount: float
    category: str
    type: str
    date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
