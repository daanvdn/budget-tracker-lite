import re
import secrets
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import Token, UserLogin, UserRegister
from app.auth.security import create_access_token, get_password_hash, verify_password
from app.config.settings import settings
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"

    return True, "Password is valid"


async def register_user(db: AsyncSession, user_data: UserRegister) -> User:
    """Register a new user"""
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise ValueError("Email already registered")

    # Validate password strength
    is_valid, message = validate_password_strength(user_data.password)
    if not is_valid:
        raise ValueError(message)

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        is_active=True,
        created_at=datetime.utcnow(),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


async def authenticate_user(db: AsyncSession, login_data: UserLogin) -> Optional[User]:
    """Authenticate a user with email and password"""
    result = await db.execute(select(User).filter(User.email == login_data.email))
    user = result.scalar_one_or_none()
    if not user:
        return None

    if not verify_password(login_data.password, user.hashed_password):
        return None

    return user


def create_user_token(user: User) -> Token:
    """Create access token for user"""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return Token(access_token=access_token, token_type="bearer")


async def create_password_reset_token(db: AsyncSession, email: str) -> Optional[PasswordResetToken]:
    """Create a password reset token for a user"""
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return None

    # Generate secure random token
    token = secrets.token_urlsafe(32)

    # Set expiration time
    expires_at = datetime.utcnow() + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)

    # Create reset token record
    reset_token = PasswordResetToken(
        user_id=user.id, token=token, expires_at=expires_at, used=False, created_at=datetime.utcnow()
    )

    db.add(reset_token)
    await db.commit()
    await db.refresh(reset_token)

    return reset_token


async def reset_password_with_token(db: AsyncSession, token: str, new_password: str) -> bool:
    """Reset user password using a reset token"""
    # Find the reset token
    result = await db.execute(select(PasswordResetToken).filter(PasswordResetToken.token == token))
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        raise ValueError("Invalid reset token")

    # Check if token is already used
    if reset_token.used:
        raise ValueError("Reset token has already been used")

    # Check if token is expired
    if reset_token.expires_at < datetime.utcnow():
        raise ValueError("Reset token has expired")

    # Validate new password
    is_valid, message = validate_password_strength(new_password)
    if not is_valid:
        raise ValueError(message)

    # Get the user
    user_result = await db.execute(select(User).filter(User.id == reset_token.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    # Update password
    user.hashed_password = get_password_hash(new_password)

    # Mark token as used
    reset_token.used = True

    await db.commit()

    return True
