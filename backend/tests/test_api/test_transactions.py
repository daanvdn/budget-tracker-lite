import pytest


# Tests for unauthenticated access (should fail with 401)
@pytest.mark.asyncio
async def test_get_transactions_unauthenticated(client):
    """Test that unauthenticated requests to get transactions fail"""
    response = await client.get("/api/transactions")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_transaction_unauthenticated(client):
    """Test that unauthenticated requests to create transactions fail"""
    transaction_data = {
        "amount": 100.0,
        "transaction_date": "2024-01-15T00:00:00",
        "description": "Test transaction",
        "type": "expense",
        "category_id": 1,
        "beneficiary_id": 1,
        "created_by_user_id": 1,
    }
    response = await client.post("/api/transactions", json=transaction_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_single_transaction_unauthenticated(client):
    """Test that unauthenticated requests to get a single transaction fail"""
    response = await client.get("/api/transactions/1")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_transaction_unauthenticated(client):
    """Test that unauthenticated requests to update transactions fail"""
    response = await client.put("/api/transactions/1", json={"amount": 75.0})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_transaction_unauthenticated(client):
    """Test that unauthenticated requests to delete transactions fail"""
    response = await client.delete("/api/transactions/1")
    assert response.status_code == 401


# Tests for authenticated access (should succeed)
@pytest.mark.asyncio
async def test_get_transactions_empty(authenticated_client):
    """Test getting transactions when database is empty"""
    response = await authenticated_client.get("/api/transactions")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_transaction(authenticated_client, sample_user, sample_category, sample_beneficiary):
    """Test creating a new transaction"""
    transaction_data = {
        "amount": 100.0,
        "transaction_date": "2024-01-15T00:00:00",
        "description": "Test transaction",
        "type": "expense",
        "category_id": sample_category.id,
        "beneficiary_id": sample_beneficiary.id,
        "created_by_user_id": sample_user.id,
    }
    response = await authenticated_client.post("/api/transactions", json=transaction_data)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100.0
    assert data["description"] == "Test transaction"
    assert data["type"] == "expense"


@pytest.mark.asyncio
async def test_get_transaction(authenticated_client, sample_transaction):
    """Test getting a specific transaction"""
    response = await authenticated_client.get(f"/api/transactions/{sample_transaction.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_transaction.id
    assert data["amount"] == float(sample_transaction.amount)


@pytest.mark.asyncio
async def test_update_transaction(authenticated_client, sample_transaction):
    """Test updating a transaction"""
    update_data = {"amount": 75.0, "description": "Updated description"}
    response = await authenticated_client.put(f"/api/transactions/{sample_transaction.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 75.0
    assert data["description"] == "Updated description"


@pytest.mark.asyncio
async def test_delete_transaction(authenticated_client, sample_transaction):
    """Test deleting a transaction"""
    response = await authenticated_client.delete(f"/api/transactions/{sample_transaction.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await authenticated_client.get(f"/api/transactions/{sample_transaction.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_filter_transactions_by_date_range(authenticated_client, sample_data):
    """Test filtering transactions by date range"""
    response = await authenticated_client.get("/api/transactions/?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Only January transactions
