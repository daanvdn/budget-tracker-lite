import pytest


# Tests for unauthenticated access (should fail with 401)
@pytest.mark.asyncio
async def test_upload_image_unauthenticated(client):
    """Test that unauthenticated requests to upload images fail"""
    # Create a small test image content
    image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"  # PNG header bytes
    files = {"file": ("test.png", image_content, "image/png")}
    response = await client.post("/api/images/upload", files=files)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_image_unauthenticated(client):
    """Test that unauthenticated requests to get images fail"""
    response = await client.get("/api/images/test.png")
    assert response.status_code == 401


# Tests for authenticated access
@pytest.mark.asyncio
async def test_upload_image_authenticated(authenticated_client):
    """Test uploading an image with authentication"""
    # Create a valid minimal PNG image
    # This is a 1x1 pixel transparent PNG
    image_content = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
        b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    files = {"file": ("test.png", image_content, "image/png")}
    response = await authenticated_client.post("/api/images/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert "path" in data
    assert data["path"].startswith("/api/images/")


@pytest.mark.asyncio
async def test_upload_non_image_fails(authenticated_client):
    """Test that uploading non-image files fails"""
    text_content = b"This is not an image"
    files = {"file": ("test.txt", text_content, "text/plain")}
    response = await authenticated_client.post("/api/images/upload", files=files)
    assert response.status_code == 400
    assert "must be an image" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_nonexistent_image(authenticated_client):
    """Test that getting a non-existent image returns 404"""
    response = await authenticated_client.get("/api/images/nonexistent.png")
    assert response.status_code == 404
