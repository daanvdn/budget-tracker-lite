import pytest


# Tests for unauthenticated access (should fail with 401)
@pytest.mark.asyncio
async def test_get_users_unauthenticated(client):
    """Test that unauthenticated requests to get users fail"""
    response = await client.get("/api/users")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_user_unauthenticated(client):
    """Test that unauthenticated requests to create users fail"""
    user_data = {"name": "John Doe"}
    response = await client.post("/api/users", json=user_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_single_user_unauthenticated(client):
    """Test that unauthenticated requests to get a single user fail"""
    response = await client.get("/api/users/1")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_user_unauthenticated(client):
    """Test that unauthenticated requests to update users fail"""
    response = await client.put("/api/users/1", json={"name": "Updated"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_user_unauthenticated(client):
    """Test that unauthenticated requests to delete users fail"""
    response = await client.delete("/api/users/1")
    assert response.status_code == 401


# Tests for authenticated access (should succeed)
@pytest.mark.asyncio
async def test_get_users_empty(authenticated_client):
    """Test getting users when database is empty (except auth user)"""
    response = await authenticated_client.get("/api/users")
    assert response.status_code == 200
    # At least the authenticated user should exist
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_user(authenticated_client):
    """Test creating a new user"""
    user_data = {"name": "John Doe"}
    response = await authenticated_client.post("/api/users", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_user(authenticated_client, sample_user):
    """Test getting a specific user"""
    response = await authenticated_client.get(f"/api/users/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_user.id
    assert data["name"] == sample_user.name


@pytest.mark.asyncio
async def test_update_user(authenticated_client, sample_user):
    """Test updating a user"""
    update_data = {"name": "Updated Name"}
    response = await authenticated_client.put(f"/api/users/{sample_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_user(authenticated_client, sample_user):
    """Test deleting a user"""
    response = await authenticated_client.delete(f"/api/users/{sample_user.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await authenticated_client.get(f"/api/users/{sample_user.id}")
    assert response.status_code == 404
