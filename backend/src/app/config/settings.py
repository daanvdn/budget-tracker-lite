from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = "sqlite:///./budget_tracker.db"
    api_prefix: str = "/api"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    RESET_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour

    # CORS
    CORS_ORIGINS: list = ["http://localhost:4200", "http://localhost:8080"]

    class Config:
        env_file = ".env"


settings = Settings()
