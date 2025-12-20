from pydantic import BaseModel
from datetime import date
from typing import Optional


class AggregationFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    beneficiary_id: Optional[int] = None
    category_id: Optional[int] = None


class CategoryTotal(BaseModel):
    category_id: int
    category_name: str
    total: float


class BeneficiaryTotal(BaseModel):
    beneficiary_id: int
    beneficiary_name: str
    total: float


class AggregationResponse(BaseModel):
    total_income: float
    total_expenses: float
    net_total: float
    by_category: list[CategoryTotal]
    by_beneficiary: list[BeneficiaryTotal]
