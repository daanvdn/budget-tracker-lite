import pytest


@pytest.mark.asyncio
async def test_get_summary_empty(client):
    """Test getting summary when database is empty"""
    response = await client.get("/api/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 0
    assert data["total_expenses"] == 0
    assert data["net_total"] == 0


@pytest.mark.asyncio
async def test_get_summary_with_data(client, sample_data):
    """Test getting summary with transactions"""
    response = await client.get("/api/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 3000.0
    assert data["total_expenses"] == 150.0  # 100 + 50
    assert data["net_total"] == 2850.0


@pytest.mark.asyncio
async def test_get_summary_by_date_range(client, sample_data):
    """Test getting summary filtered by date range"""
    response = await client.get("/api/aggregations/summary?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 3000.0
    assert data["total_expenses"] == 100.0  # Only groceries from January
