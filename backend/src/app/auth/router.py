import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.auth.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.auth.service import (
    authenticate_user,
    create_password_reset_token,
    create_user_token,
    register_user,
    reset_password_with_token,
)
from app.database.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    try:
        user = await register_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(
            f"Unexpected error during user registration:\n"
            f"{''.join(traceback.format_exception(type(e), e, e.__traceback__))}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration",
        )


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login user and return JWT token"""
    try:
        user = await authenticate_user(db, login_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

        token = create_user_token(user)
        return token
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error during login:\n{''.join(traceback.format_exception(type(e), e, e.__traceback__))}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current authenticated user information"""
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Request password reset token"""
    reset_token = await create_password_reset_token(db, request.email)

    if not reset_token:
        # Don't reveal if email exists or not for security
        return ForgotPasswordResponse(message="If the email exists, a password reset link will be sent")

    # For LAN use without email server, return the token directly
    # In production with email, send email and don't return token
    return ForgotPasswordResponse(
        message="Password reset token generated. Use this token to reset your password.", reset_token=reset_token.token
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using reset token"""
    try:
        await reset_password_with_token(db, request.token, request.new_password)
        return ResetPasswordResponse(message="Password has been reset successfully")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(
            f"Unexpected error during password reset:\n"
            f"{''.join(traceback.format_exception(type(e), e, e.__traceback__))}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during password reset",
        )
