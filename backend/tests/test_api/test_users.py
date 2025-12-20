import pytest


@pytest.mark.asyncio
async def test_get_users_empty(client):
    """Test getting users when database is empty"""
    response = await client.get("/api/users/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_user(client):
    """Test creating a new user"""
    user_data = {"name": "John Doe"}
    response = await client.post("/api/users/", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_user(client, sample_user):
    """Test getting a specific user"""
    response = await client.get(f"/api/users/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_user.id
    assert data["name"] == sample_user.name


@pytest.mark.asyncio
async def test_update_user(client, sample_user):
    """Test updating a user"""
    update_data = {"name": "Updated Name"}
    response = await client.put(f"/api/users/{sample_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_user(client, sample_user):
    """Test deleting a user"""
    response = await client.delete(f"/api/users/{sample_user.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await client.get(f"/api/users/{sample_user.id}")
    assert response.status_code == 404
