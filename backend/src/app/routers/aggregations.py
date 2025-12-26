from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.dependencies import get_current_active_user
from ..database import get_db
from ..models import User
from ..schemas import AggregationFilters, AggregationSummary
from ..services.aggregation import get_aggregation_summary

router = APIRouter(prefix="/aggregations", tags=["aggregations"])


@router.get("/summary", response_model=AggregationSummary)
async def aggregation_summary(
    filters: AggregationFilters = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get aggregation summary with optional filters

    Example: "How much did I spend on Child A for gifts in the past month?"
    - Set beneficiary_id to Child A's ID
    - Set category_id to gifts category ID
    - Set transaction_type to "expense"
    - Set start_date to one month ago
    - Set end_date to today
    """
    return await get_aggregation_summary(db, filters)
