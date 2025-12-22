from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.config.settings import settings
from app.database.session import init_db
from app.routers import aggregations, beneficiaries, categories, images, transactions, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup: Initialize database tables
    # Import models to ensure they're registered with Base
    from app.models import Beneficiary, Category, Transaction, User  # noqa: F401
    await init_db()
    yield
    # Shutdown: Add cleanup code here if needed


# Initialize FastAPI app
app = FastAPI(
    title="Budget Tracker Lite API",
    description="A simple budget tracking application with authentication",
    version="1.0.0",
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
app.include_router(auth_router)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(categories.router, prefix=settings.api_prefix)
app.include_router(beneficiaries.router, prefix=settings.api_prefix)
app.include_router(transactions.router, prefix=settings.api_prefix)
app.include_router(aggregations.router, prefix=settings.api_prefix)
app.include_router(images.router, prefix=settings.api_prefix)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Budget Tracker Lite API", "docs": "/docs", "version": "1.0.0"}


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
