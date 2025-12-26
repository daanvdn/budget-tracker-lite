from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import TokenData
from app.auth.security import decode_access_token
from app.config.settings import settings
from app.database.session import get_db
from app.models.user import User


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get the current authenticated user

    - If DEV_AUTH_BYPASS is enabled and the request contains the DEV_BYPASS_HEADER set to '1',
      return a local dev user (first user or by configured email).
    - Otherwise validate the JWT token from the Authorization header (Bearer token).
    """
    # Dev bypass: explicit opt-in only
    if settings.DEV_AUTH_BYPASS:
        header_val = request.headers.get(settings.DEV_BYPASS_HEADER)
        if header_val == "1":
            # Try to find specific user by email if configured
            if settings.DEV_BYPASS_USER_EMAIL:
                result = await db.execute(select(User).filter(User.email == settings.DEV_BYPASS_USER_EMAIL))
                user = result.scalar_one_or_none()
                if user:
                    return user
            # Fallback: return the first user in DB
            result = await db.execute(select(User).limit(1))
            user = result.scalar_one_or_none()
            if user:
                return user
            # If no user exists, fall through to normal credentials flow

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Extract Authorization header manually so we control behavior in absence of header
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header:
        raise credentials_exception

    try:
        scheme, token = auth_header.split()
    except ValueError:
        raise credentials_exception

    if scheme.lower() != "bearer":
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    token_data = TokenData(email=email)

    result = await db.execute(select(User).filter(User.email == token_data.email))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
