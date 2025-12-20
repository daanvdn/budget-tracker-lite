from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Transaction, Category, Beneficiary
from app.models.transaction import TransactionType
from app.schemas.aggregation import AggregationResponse, CategoryTotal, BeneficiaryTotal, AggregationFilter


class AggregationService:
    @staticmethod
    def get_summary(db: Session, filters: AggregationFilter) -> AggregationResponse:
        # Build base query
        query = db.query(Transaction)
        
        # Apply filters
        if filters.start_date:
            query = query.filter(Transaction.date >= filters.start_date)
        if filters.end_date:
            query = query.filter(Transaction.date <= filters.end_date)
        if filters.beneficiary_id:
            query = query.filter(Transaction.beneficiary_id == filters.beneficiary_id)
        if filters.category_id:
            query = query.filter(Transaction.category_id == filters.category_id)
        
        # Get all transactions
        transactions = query.all()
        
        # Calculate totals
        total_income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
        total_expenses = sum(t.amount for t in transactions if t.type == TransactionType.EXPENSE)
        net_total = total_income - total_expenses
        
        # Group by category
        category_totals = {}
        for t in transactions:
            if t.category_id not in category_totals:
                category_totals[t.category_id] = {
                    'category_id': t.category_id,
                    'category_name': t.category.name,
                    'total': 0
                }
            category_totals[t.category_id]['total'] += t.amount
        
        # Group by beneficiary
        beneficiary_totals = {}
        for t in transactions:
            if t.beneficiary_id not in beneficiary_totals:
                beneficiary_totals[t.beneficiary_id] = {
                    'beneficiary_id': t.beneficiary_id,
                    'beneficiary_name': t.beneficiary.name,
                    'total': 0
                }
            beneficiary_totals[t.beneficiary_id]['total'] += t.amount
        
        return AggregationResponse(
            total_income=total_income,
            total_expenses=total_expenses,
            net_total=net_total,
            by_category=[CategoryTotal(**ct) for ct in category_totals.values()],
            by_beneficiary=[BeneficiaryTotal(**bt) for bt in beneficiary_totals.values()]
        )
