from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings

from .database import AsyncSessionLocal, init_db
from .models import (
    Beneficiary,
    Category,
    CategoryType,
    Transaction,
    TransactionType,
    User,
)
from .routers import (
    aggregations,
    beneficiaries,
    categories,
    images,
    transactions,
    users,
)


async def seed_data():
    """Seed initial data if database is empty"""
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        # Check if data already exists
        result = await db.execute(select(User))
        if result.first():
            print("Database already seeded, skipping...")
            return

        print("Seeding database with initial data...")

        # Create users
        users_data = [
            User(name="Parent 1"),
            User(name="Parent 2"),
        ]
        db.add_all(users_data)
        await db.commit()

        # Refresh to get IDs
        for user in users_data:
            await db.refresh(user)

        # Create categories
        categories_data = [
            Category(name="Groceries", type=CategoryType.EXPENSE),
            Category(name="Gifts", type=CategoryType.EXPENSE),
            Category(name="School", type=CategoryType.EXPENSE),
            Category(name="Entertainment", type=CategoryType.EXPENSE),
            Category(name="Healthcare", type=CategoryType.EXPENSE),
            Category(name="Transportation", type=CategoryType.EXPENSE),
            Category(name="Utilities", type=CategoryType.EXPENSE),
            Category(name="Salary", type=CategoryType.INCOME),
            Category(name="Birthday Money", type=CategoryType.INCOME),
            Category(name="Allowance", type=CategoryType.BOTH),
        ]
        db.add_all(categories_data)
        await db.commit()

        # Refresh to get IDs
        for category in categories_data:
            await db.refresh(category)

        # Create beneficiaries
        beneficiaries_data = [
            Beneficiary(name="Household"),
            Beneficiary(name="Child A"),
            Beneficiary(name="Child B"),
        ]
        db.add_all(beneficiaries_data)
        await db.commit()

        # Refresh to get IDs
        for beneficiary in beneficiaries_data:
            await db.refresh(beneficiary)

        # Create sample transactions
        now = datetime.utcnow()
        transactions_data = [
            Transaction(
                type=TransactionType.EXPENSE,
                amount=150.50,
                description="Weekly grocery shopping",
                transaction_date=now - timedelta(days=2),
                category_id=categories_data[0].id,  # Groceries
                beneficiary_id=beneficiaries_data[0].id,  # Household
                created_by_user_id=users_data[0].id,
            ),
            Transaction(
                type=TransactionType.EXPENSE,
                amount=45.00,
                description="Birthday gift for friend",
                transaction_date=now - timedelta(days=5),
                category_id=categories_data[1].id,  # Gifts
                beneficiary_id=beneficiaries_data[1].id,  # Child A
                created_by_user_id=users_data[0].id,
            ),
            Transaction(
                type=TransactionType.INCOME,
                amount=3500.00,
                description="Monthly salary",
                transaction_date=now - timedelta(days=1),
                category_id=categories_data[7].id,  # Salary
                beneficiary_id=beneficiaries_data[0].id,  # Household
                created_by_user_id=users_data[0].id,
            ),
            Transaction(
                type=TransactionType.INCOME,
                amount=50.00,
                description="Birthday money from grandparents",
                transaction_date=now - timedelta(days=10),
                category_id=categories_data[8].id,  # Birthday Money
                beneficiary_id=beneficiaries_data[2].id,  # Child B
                created_by_user_id=users_data[1].id,
            ),
        ]
        db.add_all(transactions_data)
        await db.commit()

        print("Database seeded successfully!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    print("Initializing database...")
    await init_db()
    await seed_data()
    print("Application startup complete!")

    yield

    # Shutdown
    print("Application shutdown")


# Create FastAPI app
app = FastAPI(
    title="Budget Tracker Lite API",
    description="Self-hosted budget tracking application for household use",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(beneficiaries.router, prefix=settings.api_prefix)
app.include_router(transactions.router, prefix=settings.api_prefix)
app.include_router(aggregations.router, prefix=settings.api_prefix)
app.include_router(images.router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Budget Tracker Lite API", "version": "0.1.0", "docs": "/docs"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
