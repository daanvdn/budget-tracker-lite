import pytest


# Tests for unauthenticated access (should fail with 401)
@pytest.mark.asyncio
async def test_get_categories_unauthenticated(client):
    """Test that unauthenticated requests to get categories fail"""
    response = await client.get("/api/categories")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_category_unauthenticated(client):
    """Test that unauthenticated requests to create categories fail"""
    category_data = {"name": "Food", "type": "expense"}
    response = await client.post("/api/categories", json=category_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_single_category_unauthenticated(client):
    """Test that unauthenticated requests to get a single category fail"""
    response = await client.get("/api/categories/1")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_category_unauthenticated(client):
    """Test that unauthenticated requests to update categories fail"""
    response = await client.put("/api/categories/1", json={"name": "Updated"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_category_unauthenticated(client):
    """Test that unauthenticated requests to delete categories fail"""
    response = await client.delete("/api/categories/1")
    assert response.status_code == 401


# Tests for authenticated access (should succeed)
@pytest.mark.asyncio
async def test_get_categories_empty(authenticated_client):
    """Test getting categories when database is empty"""
    response = await authenticated_client.get("/api/categories")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_category(authenticated_client):
    """Test creating a new category"""
    category_data = {"name": "Food", "type": "expense"}
    response = await authenticated_client.post("/api/categories", json=category_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Food"
    assert data["type"] == "expense"


@pytest.mark.asyncio
async def test_get_category(authenticated_client, sample_category):
    """Test getting a specific category"""
    response = await authenticated_client.get(f"/api/categories/{sample_category.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_category.id
    assert data["name"] == sample_category.name


@pytest.mark.asyncio
async def test_update_category(authenticated_client, sample_category):
    """Test updating a category"""
    update_data = {"name": "Updated Food", "type": "both"}
    response = await authenticated_client.put(f"/api/categories/{sample_category.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Food"
    assert data["type"] == "both"


@pytest.mark.asyncio
async def test_delete_category(authenticated_client, sample_category):
    """Test deleting a category"""
    response = await authenticated_client.delete(f"/api/categories/{sample_category.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await authenticated_client.get(f"/api/categories/{sample_category.id}")
    assert response.status_code == 404
