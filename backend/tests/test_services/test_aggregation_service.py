import pytest
from datetime import date
from app.services import AggregationService
from app.schemas.aggregation import AggregationFilter
from app.models import Transaction, User, Category, Beneficiary
from app.models.transaction import TransactionType
from app.models.category import CategoryType


def test_aggregation_service_empty_database(db):
    """Test aggregation service with no transactions"""
    filters = AggregationFilter()
    result = AggregationService.get_summary(db, filters)
    
    assert result.total_income == 0
    assert result.total_expenses == 0
    assert result.net_total == 0
    assert result.by_category == []
    assert result.by_beneficiary == []


def test_aggregation_service_single_transaction(db):
    """Test aggregation service with a single transaction"""
    # Create dependencies
    user = User(name="Test User", email="test@example.com")
    category = Category(name="Food", type=CategoryType.EXPENSE)
    beneficiary = Beneficiary(name="Store")
    db.add_all([user, category, beneficiary])
    db.commit()
    
    # Create transaction
    transaction = Transaction(
        amount=100.0,
        date=date(2024, 1, 15),
        description="Test",
        type=TransactionType.EXPENSE,
        category_id=category.id,
        beneficiary_id=beneficiary.id,
        user_id=user.id
    )
    db.add(transaction)
    db.commit()
    
    filters = AggregationFilter()
    result = AggregationService.get_summary(db, filters)
    
    assert result.total_income == 0
    assert result.total_expenses == 100.0
    assert result.net_total == -100.0
    assert len(result.by_category) == 1
    assert result.by_category[0].category_name == "Food"
    assert result.by_category[0].total == 100.0


def test_aggregation_service_mixed_transactions(db, sample_data):
    """Test aggregation service with mixed income and expense transactions"""
    filters = AggregationFilter()
    result = AggregationService.get_summary(db, filters)
    
    assert result.total_income == 3000.0
    assert result.total_expenses == 150.0
    assert result.net_total == 2850.0


def test_aggregation_service_date_filter(db, sample_data):
    """Test aggregation service with date range filter"""
    filters = AggregationFilter(
        start_date=date(2024, 1, 1),
        end_date=date(2024, 1, 31)
    )
    result = AggregationService.get_summary(db, filters)
    
    # Only January transactions (100 expense + 3000 income)
    assert result.total_income == 3000.0
    assert result.total_expenses == 100.0


def test_aggregation_service_category_filter(db, sample_data):
    """Test aggregation service with category filter"""
    cat_id = sample_data["categories"][0].id  # Food category
    filters = AggregationFilter(category_id=cat_id)
    result = AggregationService.get_summary(db, filters)
    
    assert result.total_expenses == 100.0
    assert len(result.by_category) == 1


def test_aggregation_service_beneficiary_filter(db, sample_data):
    """Test aggregation service with beneficiary filter"""
    ben_id = sample_data["beneficiaries"][0].id  # Supermarket
    filters = AggregationFilter(beneficiary_id=ben_id)
    result = AggregationService.get_summary(db, filters)
    
    assert result.total_expenses == 100.0
    assert len(result.by_beneficiary) == 1


def test_aggregation_service_category_grouping(db, sample_data):
    """Test that aggregation correctly groups by category"""
    filters = AggregationFilter()
    result = AggregationService.get_summary(db, filters)
    
    # Should have 3 categories
    assert len(result.by_category) == 3
    
    # Verify each category total
    category_totals_map = {ct.category_name: ct.total for ct in result.by_category}
    assert category_totals_map["Food"] == 100.0
    assert category_totals_map["Salary"] == 3000.0
    assert category_totals_map["Transport"] == 50.0


def test_aggregation_service_beneficiary_grouping(db, sample_data):
    """Test that aggregation correctly groups by beneficiary"""
    filters = AggregationFilter()
    result = AggregationService.get_summary(db, filters)
    
    # Should have 3 beneficiaries
    assert len(result.by_beneficiary) == 3
    
    # Verify each beneficiary total
    beneficiary_totals_map = {bt.beneficiary_name: bt.total for bt in result.by_beneficiary}
    assert beneficiary_totals_map["Supermarket"] == 100.0
    assert beneficiary_totals_map["Employer"] == 3000.0
    assert beneficiary_totals_map["Gas Station"] == 50.0


def test_aggregation_service_edge_case_no_matching_filters(db, sample_data):
    """Test aggregation with filters that match no transactions"""
    filters = AggregationFilter(
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 31)
    )
    result = AggregationService.get_summary(db, filters)
    
    assert result.total_income == 0
    assert result.total_expenses == 0
    assert result.net_total == 0
