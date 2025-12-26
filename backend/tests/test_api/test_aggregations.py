import pytest


# Tests for unauthenticated access (should fail with 401)
@pytest.mark.asyncio
async def test_get_summary_unauthenticated(client):
    """Test that unauthenticated requests to get summary fail"""
    response = await client.get("/api/aggregations/summary")
    assert response.status_code == 401


# Tests for authenticated access (should succeed)
@pytest.mark.asyncio
async def test_get_summary_empty(authenticated_client):
    """Test getting summary when database is empty"""
    response = await authenticated_client.get("/api/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 0
    assert data["total_expenses"] == 0
    assert data["net_total"] == 0


@pytest.mark.asyncio
async def test_get_summary_with_data(authenticated_client, sample_data):
    """Test getting summary with transactions"""
    response = await authenticated_client.get("/api/aggregations/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 3000.0
    assert data["total_expenses"] == 150.0  # 100 + 50
    assert data["net_total"] == 2850.0


@pytest.mark.asyncio
async def test_get_summary_by_date_range(authenticated_client, sample_data):
    """Test getting summary filtered by date range"""
    response = await authenticated_client.get("/api/aggregations/summary?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert data["total_income"] == 3000.0
    assert data["total_expenses"] == 100.0  # Only groceries from January
