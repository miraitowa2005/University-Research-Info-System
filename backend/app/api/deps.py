from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.crud import crud_user

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/login/access-token"
)


async def get_db() -> Generator[AsyncSession, None, None]:
    """Dependency to get an async database session."""
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    """Dependency to get the current authenticated user."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = payload.get("sub")
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = await crud_user.user.get(db, id=int(token_data))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency to get the current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency to get the current active superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user


async def get_current_active_auditor(
    token: str = Depends(reusable_oauth2),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Allow sys_admin or research_admin to perform audit operations, using JWT claims to avoid DB access."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        is_superuser = payload.get("is_superuser", False)
        role = payload.get("role", None)
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")
        # If token claims indicate privilege, allow
        if bool(is_superuser) or role == "research_admin":
            u = User(id=int(sub))
            setattr(u, "role", role or "teacher")
            setattr(u, "is_superuser", bool(is_superuser))
            setattr(u, "is_active", True)
            return u
        # Fallback to DB check to avoid claim mismatch issues
        db_user = await crud_user.user.get(db, id=int(sub))
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        if db_user.is_superuser or getattr(db_user, "role", None) == "research_admin":
            return db_user
        raise HTTPException(status_code=400, detail="The user doesn't have enough privileges")
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

