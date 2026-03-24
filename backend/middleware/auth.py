from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from utils.auth import decode_token
from models.user import User
from services.auth_service import AuthService

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    auth_service = AuthService()
    user = await auth_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """Get current user if authenticated, otherwise None"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_roles(allowed_roles: List[str]):
    """Dependency to check if user has required roles"""
    async def check_roles(current_user: User = Depends(get_current_user)) -> User:
        user_roles = set(current_user.roles)
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User must have one of these roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return check_roles


# Common role dependencies
async def get_current_buyer(current_user: User = Depends(get_current_user)) -> User:
    """Require buyer role"""
    if "buyer" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyer role required"
        )
    return current_user


async def get_current_farmer(current_user: User = Depends(get_current_user)) -> User:
    """Require farmer role"""
    if "farmer" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Farmer role required"
        )
    return current_user


async def get_current_driver(current_user: User = Depends(get_current_user)) -> User:
    """Require driver role"""
    if "driver" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Driver role required"
        )
    return current_user


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return current_user
