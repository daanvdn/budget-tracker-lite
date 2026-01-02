import logging
import sys
import traceback
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI, Request
from fastapi import HTTPException as FastAPIHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config.settings import settings

from .auth.router import router as auth_router
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
    gift_occasions,
    images,
    transactions,
    users,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)

# Create logger for this module
logger = logging.getLogger(__name__)


async def seed_data():
    """Seed initial data if database is empty"""
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        # Check if data already exists
        result = await db.execute(select(User))
        if result.first():
            logger.info("Database already seeded, skipping...")
            return

        logger.info("Seeding database with initial data...")

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

        logger.info("Database seeded successfully!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Initializing database...")
    await init_db()
    await seed_data()
    logger.info("Application startup complete!")

    yield

    # Shutdown
    logger.info("Application shutdown")


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


@app.middleware("http")
async def log_exceptions_middleware(request: Request, call_next):
    """Middleware to catch and log all exceptions with full tracebacks.

    - For HTTP exceptions (Starlette/FastAPI), return a JSON response with the proper status code.
    - For other exceptions, log and return a 500 JSON response. Do not re-raise to avoid crashing the worker.
    """
    try:
        response = await call_next(request)
        return response
    except (StarletteHTTPException, FastAPIHTTPException) as http_exc:
        # Log at info level — these are expected client errors (e.g., 400/401/404)
        logger.info(f"HTTP exception during request {request.method} {request.url.path}: {http_exc}")
        # Try to extract detail if available
        detail = getattr(http_exc, "detail", str(http_exc))
        status_code = getattr(http_exc, "status_code", 400)
        return JSONResponse(status_code=status_code, content={"detail": detail})
    except Exception as exc:
        logger.error(
            f"Unhandled exception during request {request.method} {request.url.path}:\n"
            f"{''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))}"
        )
        # Return a generic 500 response instead of re-raising to avoid crashing the worker
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to log all unhandled exceptions"""
    logger.error(
        f"Unhandled exception for {request.method} {request.url.path}:\n"
        f"{''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))}"
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(auth_router)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(beneficiaries.router, prefix=settings.api_prefix)
app.include_router(transactions.router, prefix=settings.api_prefix)
app.include_router(aggregations.router, prefix=settings.api_prefix)
app.include_router(images.router, prefix=settings.api_prefix)
app.include_router(gift_occasions.router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Budget Tracker Lite API", "version": "0.1.0", "docs": "/docs"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
