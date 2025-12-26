from datetime import datetime

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.security import create_access_token, get_password_hash
from app.database import Base, get_db
from app.database import async_engine as production_engine
from app.main import app
from app.models import (
    Beneficiary,
    Category,
    CategoryType,
    Transaction,
    TransactionType,
    User,
)

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session", autouse=True)
def cleanup_production_engine():
    """Cleanup production engine after all tests complete"""
    yield
    # Dispose the production engine to prevent hanging
    import asyncio

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(production_engine.dispose())
        else:
            loop.run_until_complete(production_engine.dispose())
    except RuntimeError:
        # If no event loop, create one for cleanup
        asyncio.run(production_engine.dispose())


@pytest_asyncio.fixture(scope="function")
async def db():
    """Create a fresh database for each test"""
    # Create a new engine for each test to ensure isolation
    test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    TestingSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    # Dispose the test engine
    await test_engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def authenticated_user(db):
    """Create an authenticated user for testing"""
    user = User(
        name="Test Auth User",
        email="testauth@example.com",
        hashed_password=get_password_hash("TestPassword123"),
        is_active=True,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def auth_token(authenticated_user):
    """Create an auth token for the authenticated user"""
    token = create_access_token(data={"sub": authenticated_user.email})
    return token


@pytest_asyncio.fixture(scope="function")
async def auth_headers(auth_token):
    """Return authorization headers for authenticated requests"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest_asyncio.fixture(scope="function")
async def client(db):
    """Create a test client with the test database (unauthenticated)"""

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def authenticated_client(db, auth_headers):
    """Create a test client with authentication"""

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=auth_headers) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_user(db):
    """Create a sample user"""
    user = User(name="Test User")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture
async def sample_category(db):
    """Create a sample category"""
    category = Category(name="Food", type=CategoryType.EXPENSE)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@pytest_asyncio.fixture
async def sample_beneficiary(db):
    """Create a sample beneficiary"""
    beneficiary = Beneficiary(name="Grocery Store")
    db.add(beneficiary)
    await db.commit()
    await db.refresh(beneficiary)
    return beneficiary


@pytest_asyncio.fixture
async def sample_transaction(db, sample_user, sample_category, sample_beneficiary):
    """Create a sample transaction"""
    transaction = Transaction(
        amount=50.0,
        transaction_date=datetime(2024, 1, 15),
        description="Grocery shopping",
        type=TransactionType.EXPENSE,
        category_id=sample_category.id,
        beneficiary_id=sample_beneficiary.id,
        created_by_user_id=sample_user.id,
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction


@pytest_asyncio.fixture
async def sample_data(db):
    """Create a complete dataset for testing"""
    # Create users
    user1 = User(name="User One")
    user2 = User(name="User Two")
    db.add_all([user1, user2])
    await db.commit()
    await db.refresh(user1)
    await db.refresh(user2)

    # Create categories
    cat1 = Category(name="Food", type=CategoryType.EXPENSE)
    cat2 = Category(name="Salary", type=CategoryType.INCOME)
    cat3 = Category(name="Transport", type=CategoryType.EXPENSE)
    db.add_all([cat1, cat2, cat3])
    await db.commit()
    await db.refresh(cat1)
    await db.refresh(cat2)
    await db.refresh(cat3)

    # Create beneficiaries
    ben1 = Beneficiary(name="Supermarket")
    ben2 = Beneficiary(name="Employer")
    ben3 = Beneficiary(name="Gas Station")
    db.add_all([ben1, ben2, ben3])
    await db.commit()
    await db.refresh(ben1)
    await db.refresh(ben2)
    await db.refresh(ben3)

    # Create transactions
    trans1 = Transaction(
        amount=100.0,
        transaction_date=datetime(2024, 1, 10),
        description="Groceries",
        type=TransactionType.EXPENSE,
        category_id=cat1.id,
        beneficiary_id=ben1.id,
        created_by_user_id=user1.id,
    )
    trans2 = Transaction(
        amount=3000.0,
        transaction_date=datetime(2024, 1, 31),
        description="Monthly salary",
        type=TransactionType.INCOME,
        category_id=cat2.id,
        beneficiary_id=ben2.id,
        created_by_user_id=user1.id,
    )
    trans3 = Transaction(
        amount=50.0,
        transaction_date=datetime(2024, 2, 5),
        description="Gas",
        type=TransactionType.EXPENSE,
        category_id=cat3.id,
        beneficiary_id=ben3.id,
        created_by_user_id=user1.id,
    )
    db.add_all([trans1, trans2, trans3])
    await db.commit()

    return {
        "users": [user1, user2],
        "categories": [cat1, cat2, cat3],
        "beneficiaries": [ben1, ben2, ben3],
        "transactions": [trans1, trans2, trans3],
    }
