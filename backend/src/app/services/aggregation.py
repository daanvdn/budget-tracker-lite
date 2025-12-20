from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
from typing import Optional

from ..models import Transaction, TransactionType
from ..schemas import AggregationFilters, AggregationSummary


async def get_aggregation_summary(db: AsyncSession, filters: AggregationFilters) -> AggregationSummary:
    """
    Calculate aggregation summary based on filters
    """
    query = select(Transaction)

    # Apply filters
    if filters.start_date:
        query = query.where(Transaction.transaction_date >= filters.start_date)
    if filters.end_date:
        query = query.where(Transaction.transaction_date <= filters.end_date)
    if filters.transaction_type:
        query = query.where(Transaction.type == filters.transaction_type)
    if filters.category_id:
        query = query.where(Transaction.category_id == filters.category_id)
    if filters.beneficiary_id:
        query = query.where(Transaction.beneficiary_id == filters.beneficiary_id)

    # Execute query
    result = await db.execute(query)
    transactions = result.scalars().all()

    # Calculate aggregates
    total_income = sum(float(t.amount) for t in transactions if t.type == TransactionType.INCOME)
    total_expenses = sum(float(t.amount) for t in transactions if t.type == TransactionType.EXPENSE)
    net_balance = total_income - total_expenses
    transaction_count = len(transactions)

    return AggregationSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        transaction_count=transaction_count,
    )
