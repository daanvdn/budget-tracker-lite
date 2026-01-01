from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.database.session import Base


class TokenBlocklist(Base):
    """Blocklisted JWT tokens for logout functionality

    Tokens are stored here when a user logs out. The token remains in the blocklist
    until it naturally expires (based on expires_at), at which point it can be cleaned up.
    """

    __tablename__ = "token_blocklist"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String, unique=True, index=True, nullable=False)  # JWT ID or token hash
    token = Column(String, nullable=False)  # Full token for reference
    expires_at = Column(DateTime, nullable=False)  # When the token naturally expires
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
