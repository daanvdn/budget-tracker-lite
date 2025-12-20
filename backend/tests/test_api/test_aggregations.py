import pytest
from datetime import date


def test_get_summary_empty(client):
    """Test getting summary when database is empty"""
    response = client.get("/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 0
    assert data["total_expenses"] == 0
    assert data["net_total"] == 0
    assert data["by_category"] == []
    assert data["by_beneficiary"] == []


def test_get_summary_with_data(client, sample_data):
    """Test getting summary with transactions"""
    response = client.get("/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 3000.0
    assert data["total_expenses"] == 150.0  # 100 + 50
    assert data["net_total"] == 2850.0


def test_get_summary_by_date_range(client, sample_data):
    """Test getting summary filtered by date range"""
    response = client.get("/aggregations/summary?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 3000.0
    assert data["total_expenses"] == 100.0  # Only groceries from January
    assert data["net_total"] == 2900.0


def test_get_summary_by_category(client, sample_data):
    """Test getting summary filtered by category"""
    cat_id = sample_data["categories"][0].id  # Food category
    response = client.get(f"/aggregations/summary?category_id={cat_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total_expenses"] == 100.0
    assert len(data["by_category"]) == 1


def test_get_summary_by_beneficiary(client, sample_data):
    """Test getting summary filtered by beneficiary"""
    ben_id = sample_data["beneficiaries"][0].id  # Supermarket
    response = client.get(f"/aggregations/summary?beneficiary_id={ben_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total_expenses"] == 100.0
    assert len(data["by_beneficiary"]) == 1


def test_get_summary_category_totals(client, sample_data):
    """Test that summary includes category totals"""
    response = client.get("/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert len(data["by_category"]) == 3
    
    # Check that each category has the correct structure
    for cat_total in data["by_category"]:
        assert "category_id" in cat_total
        assert "category_name" in cat_total
        assert "total" in cat_total


def test_get_summary_beneficiary_totals(client, sample_data):
    """Test that summary includes beneficiary totals"""
    response = client.get("/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert len(data["by_beneficiary"]) == 3
    
    # Check that each beneficiary has the correct structure
    for ben_total in data["by_beneficiary"]:
        assert "beneficiary_id" in ben_total
        assert "beneficiary_name" in ben_total
        assert "total" in ben_total


def test_get_summary_multiple_filters(client, sample_data):
    """Test getting summary with multiple filters"""
    cat_id = sample_data["categories"][0].id
    response = client.get(
        f"/aggregations/summary?start_date=2024-01-01&end_date=2024-01-31&category_id={cat_id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_expenses"] == 100.0
