import pytest


# Tests for unauthenticated access (should fail with 401)
@pytest.mark.asyncio
async def test_get_beneficiaries_unauthenticated(client):
    """Test that unauthenticated requests to get beneficiaries fail"""
    response = await client.get("/api/beneficiaries")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_beneficiary_unauthenticated(client):
    """Test that unauthenticated requests to create beneficiaries fail"""
    beneficiary_data = {"name": "Grocery Store"}
    response = await client.post("/api/beneficiaries", json=beneficiary_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_single_beneficiary_unauthenticated(client):
    """Test that unauthenticated requests to get a single beneficiary fail"""
    response = await client.get("/api/beneficiaries/1")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_beneficiary_unauthenticated(client):
    """Test that unauthenticated requests to update beneficiaries fail"""
    response = await client.put("/api/beneficiaries/1", json={"name": "Updated"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_beneficiary_unauthenticated(client):
    """Test that unauthenticated requests to delete beneficiaries fail"""
    response = await client.delete("/api/beneficiaries/1")
    assert response.status_code == 401


# Tests for authenticated access (should succeed)
@pytest.mark.asyncio
async def test_get_beneficiaries_empty(authenticated_client):
    """Test getting beneficiaries when database is empty"""
    response = await authenticated_client.get("/api/beneficiaries")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_beneficiary(authenticated_client):
    """Test creating a new beneficiary"""
    beneficiary_data = {"name": "Grocery Store"}
    response = await authenticated_client.post("/api/beneficiaries", json=beneficiary_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Grocery Store"


@pytest.mark.asyncio
async def test_get_beneficiary(authenticated_client, sample_beneficiary):
    """Test getting a specific beneficiary"""
    response = await authenticated_client.get(f"/api/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_beneficiary.id
    assert data["name"] == sample_beneficiary.name


@pytest.mark.asyncio
async def test_update_beneficiary(authenticated_client, sample_beneficiary):
    """Test updating a beneficiary"""
    update_data = {"name": "Updated Store"}
    response = await authenticated_client.put(f"/api/beneficiaries/{sample_beneficiary.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Store"


@pytest.mark.asyncio
async def test_delete_beneficiary(authenticated_client, sample_beneficiary):
    """Test deleting a beneficiary"""
    response = await authenticated_client.delete(f"/api/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await authenticated_client.get(f"/api/beneficiaries/{sample_beneficiary.id}")
    assert response.status_code == 404
