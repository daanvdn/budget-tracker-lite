import pytest


@pytest.mark.asyncio
async def test_get_transactions_empty(client):
    """Test getting transactions when database is empty"""
    response = await client.get("/api/transactions")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_transaction(client, sample_user, sample_category, sample_beneficiary):
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
    response = await client.post("/api/transactions", json=transaction_data)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100.0
    assert data["description"] == "Test transaction"
    assert data["type"] == "expense"


@pytest.mark.asyncio
async def test_get_transaction(client, sample_transaction):
    """Test getting a specific transaction"""
    response = await client.get(f"/api/transactions/{sample_transaction.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_transaction.id
    assert data["amount"] == float(sample_transaction.amount)


@pytest.mark.asyncio
async def test_update_transaction(client, sample_transaction):
    """Test updating a transaction"""
    update_data = {"amount": 75.0, "description": "Updated description"}
    response = await client.put(f"/api/transactions/{sample_transaction.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 75.0
    assert data["description"] == "Updated description"


@pytest.mark.asyncio
async def test_delete_transaction(client, sample_transaction):
    """Test deleting a transaction"""
    response = await client.delete(f"/api/transactions/{sample_transaction.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await client.get(f"/api/transactions/{sample_transaction.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_filter_transactions_by_date_range(client, sample_data):
    """Test filtering transactions by date range"""
    response = await client.get("/api/transactions/?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Only January transactions
