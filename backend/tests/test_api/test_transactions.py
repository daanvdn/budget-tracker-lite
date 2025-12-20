import pytest
from datetime import date
from io import BytesIO


def test_get_transactions_empty(client):
    """Test getting transactions when database is empty"""
    response = client.get("/transactions/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_transaction(client, sample_user, sample_category, sample_beneficiary):
    """Test creating a new transaction"""
    transaction_data = {
        "amount": 100.0,
        "date": "2024-01-15",
        "description": "Test transaction",
        "type": "expense",
        "category_id": sample_category.id,
        "beneficiary_id": sample_beneficiary.id,
        "user_id": sample_user.id
    }
    response = client.post("/transactions/", json=transaction_data)
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == 100.0
    assert data["description"] == "Test transaction"
    assert data["type"] == "expense"


def test_create_transaction_invalid_amount(client, sample_user, sample_category, sample_beneficiary):
    """Test creating transaction with invalid amount"""
    transaction_data = {
        "amount": -50.0,
        "date": "2024-01-15",
        "type": "expense",
        "category_id": sample_category.id,
        "beneficiary_id": sample_beneficiary.id,
        "user_id": sample_user.id
    }
    response = client.post("/transactions/", json=transaction_data)
    assert response.status_code == 400
    assert "Amount must be greater than 0" in response.json()["detail"]


def test_create_transaction_missing_required_fields(client):
    """Test creating transaction with missing required fields"""
    transaction_data = {
        "amount": 100.0,
        "date": "2024-01-15"
    }
    response = client.post("/transactions/", json=transaction_data)
    assert response.status_code == 422  # Validation error


def test_get_transaction(client, sample_transaction):
    """Test getting a specific transaction"""
    response = client.get(f"/transactions/{sample_transaction.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_transaction.id
    assert data["amount"] == sample_transaction.amount


def test_get_transaction_not_found(client):
    """Test getting a non-existent transaction"""
    response = client.get("/transactions/999")
    assert response.status_code == 404


def test_update_transaction(client, sample_transaction):
    """Test updating a transaction"""
    update_data = {
        "amount": 75.0,
        "description": "Updated description"
    }
    response = client.put(f"/transactions/{sample_transaction.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 75.0
    assert data["description"] == "Updated description"


def test_delete_transaction(client, sample_transaction):
    """Test deleting a transaction"""
    response = client.delete(f"/transactions/{sample_transaction.id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(f"/transactions/{sample_transaction.id}")
    assert response.status_code == 404


def test_filter_transactions_by_date_range(client, sample_data):
    """Test filtering transactions by date range"""
    response = client.get("/transactions/?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Only January transactions


def test_filter_transactions_by_beneficiary(client, sample_data):
    """Test filtering transactions by beneficiary"""
    ben_id = sample_data["beneficiaries"][0].id
    response = client.get(f"/transactions/?beneficiary_id={ben_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["beneficiary_id"] == ben_id


def test_filter_transactions_by_category(client, sample_data):
    """Test filtering transactions by category"""
    cat_id = sample_data["categories"][0].id
    response = client.get(f"/transactions/?category_id={cat_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category_id"] == cat_id


def test_filter_transactions_by_type(client, sample_data):
    """Test filtering transactions by type"""
    response = client.get("/transactions/?type=expense")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(t["type"] == "expense" for t in data)


def test_upload_image(client, sample_transaction):
    """Test uploading an image to a transaction"""
    file_content = b"fake image content"
    files = {"file": ("test.jpg", BytesIO(file_content), "image/jpeg")}
    response = client.post(f"/transactions/{sample_transaction.id}/upload-image", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "path" in data
    assert "test.jpg" in data["path"]


def test_upload_image_transaction_not_found(client):
    """Test uploading image to non-existent transaction"""
    file_content = b"fake image content"
    files = {"file": ("test.jpg", BytesIO(file_content), "image/jpeg")}
    response = client.post("/transactions/999/upload-image", files=files)
    assert response.status_code == 404
