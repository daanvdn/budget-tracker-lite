from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AggregationResponse, AggregationFilter
from app.services import AggregationService
from datetime import date
from typing import Optional

router = APIRouter(prefix="/aggregations", tags=["aggregations"])


@router.get("/summary", response_model=AggregationResponse)
def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    beneficiary_id: Optional[int] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    filters = AggregationFilter(
        start_date=start_date,
        end_date=end_date,
        beneficiary_id=beneficiary_id,
        category_id=category_id
    )
    return AggregationService.get_summary(db, filters)
