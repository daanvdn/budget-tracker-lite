import pytest


@pytest.mark.asyncio
async def test_get_beneficiaries_empty(client):
    """Test getting beneficiaries when database is empty"""
    response = await client.get("/api/beneficiaries")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_beneficiary(client):
    """Test creating a new beneficiary"""
    beneficiary_data = {"name": "Grocery Store"}
    response = await client.post("/api/beneficiaries", json=beneficiary_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Grocery Store"


@pytest.mark.asyncio
async def test_get_beneficiary(client, sample_beneficiary):
    """Test getting a specific beneficiary"""
    response = await client.get(f"/api/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_beneficiary.id
    assert data["name"] == sample_beneficiary.name


@pytest.mark.asyncio
async def test_update_beneficiary(client, sample_beneficiary):
    """Test updating a beneficiary"""
    update_data = {"name": "Updated Store"}
    response = await client.put(f"/api/beneficiaries/{sample_beneficiary.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Store"


@pytest.mark.asyncio
async def test_delete_beneficiary(client, sample_beneficiary):
    """Test deleting a beneficiary"""
    response = await client.delete(f"/api/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await client.get(f"/api/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 404
