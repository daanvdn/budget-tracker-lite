import pytest


@pytest.mark.asyncio
async def test_get_categories_empty(client):
    """Test getting categories when database is empty"""
    response = await client.get("/api/categories/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_category(client):
    """Test creating a new category"""
    category_data = {"name": "Food", "type": "expense"}
    response = await client.post("/api/categories/", json=category_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Food"
    assert data["type"] == "expense"


@pytest.mark.asyncio
async def test_get_category(client, sample_category):
    """Test getting a specific category"""
    response = await client.get(f"/api/categories/{sample_category.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_category.id
    assert data["name"] == sample_category.name


@pytest.mark.asyncio
async def test_update_category(client, sample_category):
    """Test updating a category"""
    update_data = {"name": "Updated Food", "type": "both"}
    response = await client.put(f"/api/categories/{sample_category.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Food"
    assert data["type"] == "both"


@pytest.mark.asyncio
async def test_delete_category(client, sample_category):
    """Test deleting a category"""
    response = await client.delete(f"/api/categories/{sample_category.id}")
    assert response.status_code == 204

    # Verify it's deleted
    response = await client.get(f"/api/categories/{sample_category.id}")
    assert response.status_code == 404
