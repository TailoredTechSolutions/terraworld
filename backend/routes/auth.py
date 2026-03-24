from fastapi import APIRouter, HTTPException, status, Request, Depends
from models.user import UserCreate, UserLogin, TokenResponse, UserResponse, RefreshTokenRequest
from services.auth_service import AuthService
from config.settings import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user
    
    - **email**: User email address (must be unique)
    - **password**: Password (min 8 chars, must contain uppercase, lowercase, and digit)
    - **first_name**: User's first name
    - **last_name**: User's last name
    - **role**: User role (buyer | farmer | driver)
    - **phone**: Optional phone number
    - **referred_by**: Optional referral code
    """
    auth_service = AuthService()
    
    try:
        user, access_token, refresh_token = await auth_service.register_user(user_data)
        
        # Create user response
        user_response = UserResponse(
            _id=user.id,
            email=user.email,
            phone=user.phone,
            roles=user.roles,
            status=user.status,
            email_verified=user.email_verified,
            phone_verified=user.phone_verified,
            kyc_status=user.kyc_status,
            profile=user.profile,
            preferences=user.preferences,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, request: Request):
    """
    Login user
    
    - **email**: User email address
    - **password**: User password
    """
    auth_service = AuthService()
    
    try:
        # Get IP address
        ip_address = request.client.host if request.client else None
        
        user, access_token, refresh_token = await auth_service.login_user(login_data, ip_address)
        
        # Create user response
        user_response = UserResponse(
            _id=user.id,
            email=user.email,
            phone=user.phone,
            roles=user.roles,
            status=user.status,
            email_verified=user.email_verified,
            phone_verified=user.phone_verified,
            kyc_status=user.kyc_status,
            profile=user.profile,
            preferences=user.preferences,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_request: RefreshTokenRequest):
    """
    Refresh access token
    
    - **refresh_token**: Valid refresh token
    """
    auth_service = AuthService()
    
    try:
        new_access_token, new_refresh_token = await auth_service.refresh_access_token(
            token_request.refresh_token
        )
        
        # Get user info
        from utils.auth import decode_token
        payload = decode_token(new_access_token)
        user_id = payload.get("sub")
        
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_response = UserResponse(
            _id=user.id,
            email=user.email,
            phone=user.phone,
            roles=user.roles,
            status=user.status,
            email_verified=user.email_verified,
            phone_verified=user.phone_verified,
            kyc_status=user.kyc_status,
            profile=user.profile,
            preferences=user.preferences,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(token_request: RefreshTokenRequest):
    """
    Logout user by revoking refresh token
    
    - **refresh_token**: Refresh token to revoke
    """
    auth_service = AuthService()
    
    try:
        await auth_service.logout_user(token_request.refresh_token)
        return None
    except Exception as e:
        # Even if logout fails, return success (token might already be revoked)
        return None
