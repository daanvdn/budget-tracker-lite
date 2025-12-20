import pytest


def test_get_users_empty(client):
    """Test getting users when database is empty"""
    response = client.get("/users/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_user(client):
    """Test creating a new user"""
    user_data = {
        "name": "John Doe",
        "email": "john@example.com"
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"


def test_create_user_duplicate_email(client, sample_user):
    """Test creating user with duplicate email"""
    user_data = {
        "name": "Another User",
        "email": sample_user.email
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_create_user_invalid_email(client):
    """Test creating user with invalid email"""
    user_data = {
        "name": "Test User",
        "email": "invalid-email"
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 422  # Validation error


def test_get_user(client, sample_user):
    """Test getting a specific user"""
    response = client.get(f"/users/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_user.id
    assert data["name"] == sample_user.name
    assert data["email"] == sample_user.email


def test_get_user_not_found(client):
    """Test getting a non-existent user"""
    response = client.get("/users/999")
    assert response.status_code == 404


def test_update_user(client, sample_user):
    """Test updating a user"""
    update_data = {
        "name": "Updated Name",
        "email": "updated@example.com"
    }
    response = client.put(f"/users/{sample_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["email"] == "updated@example.com"


def test_delete_user(client, sample_user):
    """Test deleting a user"""
    response = client.delete(f"/users/{sample_user.id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    response = client.get(f"/users/{sample_user.id}")
    assert response.status_code == 404


def test_get_all_users(client, sample_data):
    """Test getting all users"""
    response = client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
