import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from datetime import date

from app.database.database import Base, get_db
from app.models import User, Category, Beneficiary, Transaction
from app.models.category import CategoryType
from app.models.transaction import TransactionType
from main import app


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with the test database"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db):
    """Create a sample user"""
    user = User(name="Test User", email="test@example.com")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def sample_category(db):
    """Create a sample category"""
    category = Category(name="Food", type=CategoryType.EXPENSE)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@pytest.fixture
def sample_beneficiary(db):
    """Create a sample beneficiary"""
    beneficiary = Beneficiary(name="Grocery Store")
    db.add(beneficiary)
    db.commit()
    db.refresh(beneficiary)
    return beneficiary


@pytest.fixture
def sample_transaction(db, sample_user, sample_category, sample_beneficiary):
    """Create a sample transaction"""
    transaction = Transaction(
        amount=50.0,
        date=date(2024, 1, 15),
        description="Grocery shopping",
        type=TransactionType.EXPENSE,
        category_id=sample_category.id,
        beneficiary_id=sample_beneficiary.id,
        user_id=sample_user.id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@pytest.fixture
def sample_data(db):
    """Create a complete dataset for testing"""
    # Create users
    user1 = User(name="User One", email="user1@example.com")
    user2 = User(name="User Two", email="user2@example.com")
    db.add_all([user1, user2])
    db.commit()
    
    # Create categories
    cat1 = Category(name="Food", type=CategoryType.EXPENSE)
    cat2 = Category(name="Salary", type=CategoryType.INCOME)
    cat3 = Category(name="Transport", type=CategoryType.EXPENSE)
    db.add_all([cat1, cat2, cat3])
    db.commit()
    
    # Create beneficiaries
    ben1 = Beneficiary(name="Supermarket")
    ben2 = Beneficiary(name="Employer")
    ben3 = Beneficiary(name="Gas Station")
    db.add_all([ben1, ben2, ben3])
    db.commit()
    
    # Create transactions
    trans1 = Transaction(
        amount=100.0, date=date(2024, 1, 10), description="Groceries",
        type=TransactionType.EXPENSE, category_id=cat1.id,
        beneficiary_id=ben1.id, user_id=user1.id
    )
    trans2 = Transaction(
        amount=3000.0, date=date(2024, 1, 31), description="Monthly salary",
        type=TransactionType.INCOME, category_id=cat2.id,
        beneficiary_id=ben2.id, user_id=user1.id
    )
    trans3 = Transaction(
        amount=50.0, date=date(2024, 2, 5), description="Gas",
        type=TransactionType.EXPENSE, category_id=cat3.id,
        beneficiary_id=ben3.id, user_id=user1.id
    )
    db.add_all([trans1, trans2, trans3])
    db.commit()
    
    return {
        "users": [user1, user2],
        "categories": [cat1, cat2, cat3],
        "beneficiaries": [ben1, ben2, ben3],
        "transactions": [trans1, trans2, trans3]
    }
