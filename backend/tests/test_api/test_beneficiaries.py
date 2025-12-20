import pytest


def test_get_beneficiaries_empty(client):
    """Test getting beneficiaries when database is empty"""
    response = client.get("/beneficiaries/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_beneficiary(client):
    """Test creating a new beneficiary"""
    beneficiary_data = {
        "name": "Grocery Store"
    }
    response = client.post("/beneficiaries/", json=beneficiary_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Grocery Store"


def test_create_beneficiary_duplicate_name(client, sample_beneficiary):
    """Test creating beneficiary with duplicate name"""
    beneficiary_data = {
        "name": sample_beneficiary.name
    }
    response = client.post("/beneficiaries/", json=beneficiary_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_beneficiary(client, sample_beneficiary):
    """Test getting a specific beneficiary"""
    response = client.get(f"/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_beneficiary.id
    assert data["name"] == sample_beneficiary.name


def test_get_beneficiary_not_found(client):
    """Test getting a non-existent beneficiary"""
    response = client.get("/beneficiaries/999")
    assert response.status_code == 404


def test_update_beneficiary(client, sample_beneficiary):
    """Test updating a beneficiary"""
    update_data = {
        "name": "Updated Store"
    }
    response = client.put(f"/beneficiaries/{sample_beneficiary.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Store"


def test_delete_beneficiary(client, sample_beneficiary):
    """Test deleting a beneficiary"""
    response = client.delete(f"/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(f"/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 404


def test_get_all_beneficiaries(client, sample_data):
    """Test getting all beneficiaries"""
    response = client.get("/beneficiaries/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
