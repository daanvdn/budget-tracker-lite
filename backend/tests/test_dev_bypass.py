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


@pytest.mark.asyncio
async def test_dev_bypass_all_endpoints(client, db):
    """Test that all protected endpoints work with dev bypass header if a user exists."""
    # Enable dev bypass
    original_value = settings.DEV_AUTH_BYPASS
    settings.DEV_AUTH_BYPASS = True

    # Create a dev user in the test DB
    user = User(name="Dev Test User", email="dev@local", is_active=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    headers = {settings.DEV_BYPASS_HEADER: "1"}

    # /api/auth/me
    resp = await client.get("/api/auth/me", headers=headers)
    assert resp.status_code == 200

    # /api/transactions
    resp = await client.get("/api/transactions", headers=headers)
    assert resp.status_code in (200, 204)  # 204 if no data

    # /api/categories
    resp = await client.get("/api/categories", headers=headers)
    assert resp.status_code in (200, 204)

    # /api/beneficiaries
    resp = await client.get("/api/beneficiaries", headers=headers)
    assert resp.status_code in (200, 204)

    # /api/users
    resp = await client.get("/api/users", headers=headers)
    assert resp.status_code in (200, 204)

    # /api/aggregations/summary
    resp = await client.get("/api/aggregations/summary", headers=headers)
    assert resp.status_code in (200, 204)

    # Restore original setting
    settings.DEV_AUTH_BYPASS = original_value
