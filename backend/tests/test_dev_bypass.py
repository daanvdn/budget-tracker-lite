import pytest

from app.config.settings import settings
from app.models.user import User


@pytest.mark.asyncio
async def test_dev_bypass_returns_user(client, db):
    """When DEV_AUTH_BYPASS is enabled and header is present, /api/auth/me returns a user."""
    # Ensure dev bypass is enabled for this test
    original_value = settings.DEV_AUTH_BYPASS
    settings.DEV_AUTH_BYPASS = True

    # Create a dev user in the test DB
    user = User(name="Dev Test User", email="dev@local", is_active=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Call the protected endpoint with the dev bypass header
    headers = {settings.DEV_BYPASS_HEADER: "1"}
    response = await client.get("/api/auth/me", headers=headers)

    # Restore original setting
    settings.DEV_AUTH_BYPASS = original_value

    assert response.status_code == 200
    data = response.json()
    # Response should contain at least the user's email or name
    assert data.get("email") == "dev@local" or data.get("name") == "Dev Test User"
