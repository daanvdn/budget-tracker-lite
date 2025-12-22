from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings

Base = declarative_base()

sync_engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

database_url = settings.DATABASE_URL
async_database_url = (
    database_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    if database_url.startswith("sqlite://")
    else database_url
)

async_engine = create_async_engine(async_database_url, future=True)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Async database dependency"""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Initialize database tables
    
    Note: Models must be imported before calling this function to ensure
    all tables are registered with Base.metadata
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
