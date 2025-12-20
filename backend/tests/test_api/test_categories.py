import pytest


def test_get_categories_empty(client):
    """Test getting categories when database is empty"""
    response = client.get("/categories/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_category(client):
    """Test creating a new category"""
    category_data = {
        "name": "Food",
        "type": "expense"
    }
    response = client.post("/categories/", json=category_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Food"
    assert data["type"] == "expense"


def test_create_category_duplicate_name(client, sample_category):
    """Test creating category with duplicate name"""
    category_data = {
        "name": sample_category.name,
        "type": "expense"
    }
    response = client.post("/categories/", json=category_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_create_category_invalid_type(client):
    """Test creating category with invalid type"""
    category_data = {
        "name": "Test",
        "type": "invalid_type"
    }
    response = client.post("/categories/", json=category_data)
    assert response.status_code == 422  # Validation error


def test_get_category(client, sample_category):
    """Test getting a specific category"""
    response = client.get(f"/categories/{sample_category.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_category.id
    assert data["name"] == sample_category.name


def test_get_category_not_found(client):
    """Test getting a non-existent category"""
    response = client.get("/categories/999")
    assert response.status_code == 404


def test_update_category(client, sample_category):
    """Test updating a category"""
    update_data = {
        "name": "Updated Food",
        "type": "both"
    }
    response = client.put(f"/categories/{sample_category.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Food"
    assert data["type"] == "both"


def test_delete_category(client, sample_category):
    """Test deleting a category"""
    response = client.delete(f"/categories/{sample_category.id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(f"/categories/{sample_category.id}")
    assert response.status_code == 404


def test_get_all_categories(client, sample_data):
    """Test getting all categories"""
    response = client.get("/categories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
