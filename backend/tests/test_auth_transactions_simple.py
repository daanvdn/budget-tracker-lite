import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from src.main import app


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def simple_client():
    """Create an ASGI test client against the src.main app with an isolated database."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_auth_flow_and_transaction_creation(simple_client: AsyncClient):
    """Ensure the auth-protected transaction endpoints work end-to-end."""
    # Register user
    register_resp = await simple_client.post(
        "/api/auth/register",
        json={"name": "Tester", "email": "tester@example.com", "password": "TestPass123"},
    )
    assert register_resp.status_code == 201

    # Login
    login_resp = await simple_client.post(
        "/api/auth/login", json={"email": "tester@example.com", "password": "TestPass123"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Authenticated /me
    me_resp = await simple_client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200

    # Create a transaction
    create_resp = await simple_client.post(
        "/api/transactions",
        headers=headers,
        json={
            "description": "Coffee",
            "amount": 3.5,
            "category": "Food",
            "type": "expense",
            "date": "2024-01-01T00:00:00",
        },
    )
    assert create_resp.status_code == 201

    # List transactions
    list_resp = await simple_client.get("/api/transactions", headers=headers)
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert len(data) == 1
    assert data[0]["description"] == "Coffee"
    assert data[0]["amount"] == 3.5
    assert data[0]["category"] == "Food"
    assert data[0]["type"] == "expense"
