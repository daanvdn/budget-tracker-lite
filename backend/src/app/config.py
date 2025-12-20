from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    database_url: str = "sqlite+aiosqlite:///data/budget_tracker.db"

    # File storage
    upload_dir: Path = Path("/data/uploads")
    max_upload_size: int = 10 * 1024 * 1024  # 10MB

    # API
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:4200", "http://localhost"]

    class Config:
        env_file = ".env"


settings = Settings()
