import pytest
from datetime import date
from app.models import User, Category, Beneficiary, Transaction
from app.models.category import CategoryType
from app.models.transaction import TransactionType


def test_user_model(db):
    """Test User model creation"""
    user = User(name="Test User", email="test@example.com")
    db.add(user)
    db.commit()
    
    assert user.id is not None
    assert user.name == "Test User"
    assert user.email == "test@example.com"


def test_category_model(db):
    """Test Category model creation"""
    category = Category(name="Food", type=CategoryType.EXPENSE)
    db.add(category)
    db.commit()
    
    assert category.id is not None
    assert category.name == "Food"
    assert category.type == CategoryType.EXPENSE


def test_category_type_enum(db):
    """Test Category type enum values"""
    cat1 = Category(name="Expense Cat", type=CategoryType.EXPENSE)
    cat2 = Category(name="Income Cat", type=CategoryType.INCOME)
    cat3 = Category(name="Both Cat", type=CategoryType.BOTH)
    
    db.add_all([cat1, cat2, cat3])
    db.commit()
    
    assert cat1.type == CategoryType.EXPENSE
    assert cat2.type == CategoryType.INCOME
    assert cat3.type == CategoryType.BOTH


def test_beneficiary_model(db):
    """Test Beneficiary model creation"""
    beneficiary = Beneficiary(name="Test Store")
    db.add(beneficiary)
    db.commit()
    
    assert beneficiary.id is not None
    assert beneficiary.name == "Test Store"


def test_transaction_model(db, sample_user, sample_category, sample_beneficiary):
    """Test Transaction model creation"""
    transaction = Transaction(
        amount=100.0,
        date=date(2024, 1, 15),
        description="Test transaction",
        type=TransactionType.EXPENSE,
        category_id=sample_category.id,
        beneficiary_id=sample_beneficiary.id,
        user_id=sample_user.id
    )
    db.add(transaction)
    db.commit()
    
    assert transaction.id is not None
    assert transaction.amount == 100.0
    assert transaction.description == "Test transaction"
    assert transaction.type == TransactionType.EXPENSE


def test_transaction_type_enum(db, sample_user, sample_category, sample_beneficiary):
    """Test Transaction type enum values"""
    trans1 = Transaction(
        amount=100.0, date=date(2024, 1, 15), type=TransactionType.EXPENSE,
        category_id=sample_category.id, beneficiary_id=sample_beneficiary.id,
        user_id=sample_user.id
    )
    trans2 = Transaction(
        amount=200.0, date=date(2024, 1, 16), type=TransactionType.INCOME,
        category_id=sample_category.id, beneficiary_id=sample_beneficiary.id,
        user_id=sample_user.id
    )
    
    db.add_all([trans1, trans2])
    db.commit()
    
    assert trans1.type == TransactionType.EXPENSE
    assert trans2.type == TransactionType.INCOME


def test_transaction_relationships(db, sample_user, sample_category, sample_beneficiary):
    """Test Transaction relationships with other models"""
    transaction = Transaction(
        amount=100.0,
        date=date(2024, 1, 15),
        type=TransactionType.EXPENSE,
        category_id=sample_category.id,
        beneficiary_id=sample_beneficiary.id,
        user_id=sample_user.id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    # Test relationships
    assert transaction.category.id == sample_category.id
    assert transaction.category.name == sample_category.name
    assert transaction.beneficiary.id == sample_beneficiary.id
    assert transaction.beneficiary.name == sample_beneficiary.name
    assert transaction.user.id == sample_user.id
    assert transaction.user.name == sample_user.name


def test_unique_constraints(db):
    """Test unique constraints on models"""
    # Test unique email for users
    user1 = User(name="User 1", email="same@example.com")
    db.add(user1)
    db.commit()
    
    user2 = User(name="User 2", email="same@example.com")
    db.add(user2)
    with pytest.raises(Exception):  # Should raise integrity error
        db.commit()
    db.rollback()
    
    # Test unique category name
    cat1 = Category(name="Food", type=CategoryType.EXPENSE)
    db.add(cat1)
    db.commit()
    
    cat2 = Category(name="Food", type=CategoryType.INCOME)
    db.add(cat2)
    with pytest.raises(Exception):  # Should raise integrity error
        db.commit()
    db.rollback()
