from pathlib import Path
from typing import Any

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = "sqlite:///./budget_tracker.db"
    api_prefix: str = "/api"

    # File storage
    upload_dir: Path = Path("data/uploads")
    max_upload_size: int = 10 * 1024 * 1024  # 10MB

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    RESET_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour

    # CORS
    CORS_ORIGINS: list = ["http://localhost:4200", "http://localhost:8080", "http://localhost:34217"]

    # Development helpers
    # When DEV_AUTH_BYPASS=True and a request contains the header DEV_BYPASS_HEADER with value '1',
    # the auth dependency will return the first user from the database (local dev convenience only).
    DEV_AUTH_BYPASS: bool = False
    DEV_BYPASS_HEADER: str = "X-DEV-AUTH"
    # Optional: if set, the bypass will try to find a user with this email; otherwise it returns the first user.
    DEV_BYPASS_USER_EMAIL: str | None = None

    class Config:
        env_file = ".env"

    def model_post_init(self, context: Any, /) -> None:
        super().model_post_init(context)
        if self.DEV_AUTH_BYPASS:
            print("WARNING: DEV_AUTH_BYPASS is ENABLED. This should only be used in local development environments.")


settings = Settings()
