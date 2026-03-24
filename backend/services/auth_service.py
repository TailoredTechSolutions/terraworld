from typing import Optional, Tuple
from models.user import User, UserCreate, UserLogin, UserResponse, TokenResponse
from utils.auth import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from utils.helpers import generate_uuid, utc_now, normalize_email, generate_referral_code
from utils.database import get_database
from fastapi import HTTPException, status
from config.settings import settings
import hashlib


class AuthService:
    """Authentication service"""
    
    def __init__(self):
        self.db = get_database()
    
    async def register_user(self, user_data: UserCreate) -> Tuple[User, str, str]:
        """Register a new user"""
        # Normalize email
        email = normalize_email(user_data.email)
        
        # Check if user already exists
        existing_user = await self.db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check phone if provided
        if user_data.phone:
            existing_phone = await self.db.users.find_one({"phone": user_data.phone})
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered"
                )
        
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Generate referral code
        referral_code = generate_referral_code(user_data.first_name)
        while await self.db.users.find_one({"metadata.referral_code": referral_code}):
            referral_code = generate_referral_code(user_data.first_name, str(generate_uuid())[:3])
        
        # Create user document
        from models.user import UserProfile, UserPreferences, UserMetadata
        
        user = User(
            _id=generate_uuid(),
            email=email,
            phone=user_data.phone,
            password_hash=password_hash,
            roles=[user_data.role],
            profile=UserProfile(
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                display_name=f"{user_data.first_name} {user_data.last_name[0]}."
            ),
            preferences=UserPreferences(),
            metadata=UserMetadata(
                referral_code=referral_code,
                signup_source="mobile",
                device_tokens=[],
                last_login_at=None,
                last_login_ip=None
            )
        )
        
        # Insert user
        await self.db.users.insert_one(user.model_dump(by_alias=True))
        
        # Handle referral if provided
        if user_data.referred_by:
            await self._create_referral(user_data.referred_by, user.id)
        
        # Create farmer profile if farmer role
        if user_data.role == "farmer":
            await self._create_farmer_profile(user.id)
        
        # Create driver profile if driver role
        if user_data.role == "driver":
            await self._create_driver_profile(user.id)
        
        # Generate tokens
        access_token = create_access_token({"sub": user.id, "roles": user.roles})
        refresh_token = create_refresh_token({"sub": user.id})
        
        # Store refresh token
        await self._store_refresh_token(user.id, refresh_token)
        
        return user, access_token, refresh_token
    
    async def login_user(self, login_data: UserLogin, ip_address: str = None) -> Tuple[User, str, str]:
        """Login user"""
        # Normalize email
        email = normalize_email(login_data.email)
        
        # Find user
        user_dict = await self.db.users.find_one({"email": email})
        if not user_dict:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = User(**user_dict)
        
        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is suspended or deleted"
            )
        
        # Update last login
        await self.db.users.update_one(
            {"_id": user.id},
            {
                "$set": {
                    "metadata.last_login_at": utc_now(),
                    "metadata.last_login_ip": ip_address,
                    "updated_at": utc_now()
                }
            }
        )
        
        # Generate tokens
        access_token = create_access_token({"sub": user.id, "roles": user.roles})
        refresh_token = create_refresh_token({"sub": user.id})
        
        # Store refresh token
        await self._store_refresh_token(user.id, refresh_token)
        
        return user, access_token, refresh_token
    
    async def refresh_access_token(self, refresh_token: str) -> Tuple[str, str]:
        """Refresh access token"""
        # Decode refresh token
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if refresh token exists and not revoked
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        stored_token = await self.db.refresh_tokens.find_one({
            "token_hash": token_hash,
            "revoked": False
        })
        
        if not stored_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token revoked or not found"
            )
        
        # Get user
        user_dict = await self.db.users.find_one({"_id": user_id})
        if not user_dict:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user = User(**user_dict)
        
        # Generate new tokens
        new_access_token = create_access_token({"sub": user.id, "roles": user.roles})
        new_refresh_token = create_refresh_token({"sub": user.id})
        
        # Revoke old refresh token
        await self.db.refresh_tokens.update_one(
            {"token_hash": token_hash},
            {"$set": {"revoked": True, "revoked_at": utc_now()}}
        )
        
        # Store new refresh token
        await self._store_refresh_token(user.id, new_refresh_token)
        
        return new_access_token, new_refresh_token
    
    async def logout_user(self, refresh_token: str) -> None:
        """Logout user by revoking refresh token"""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        await self.db.refresh_tokens.update_one(
            {"token_hash": token_hash},
            {"$set": {"revoked": True, "revoked_at": utc_now()}}
        )
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        user_dict = await self.db.users.find_one({"_id": user_id})
        if user_dict:
            return User(**user_dict)
        return None
    
    async def _store_refresh_token(self, user_id: str, token: str) -> None:
        """Store refresh token in database"""
        from datetime import datetime, timedelta
        
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        await self.db.refresh_tokens.insert_one({
            "_id": generate_uuid(),
            "user_id": user_id,
            "token_hash": token_hash,
            "device_info": {
                "platform": "unknown",
                "device_id": None,
                "app_version": None,
                "os_version": None
            },
            "expires_at": expires_at.isoformat() + "Z",
            "revoked": False,
            "revoked_at": None,
            "created_at": utc_now()
        })
    
    async def _create_referral(self, referral_code: str, referee_id: str) -> None:
        """Create referral record"""
        referrer = await self.db.users.find_one({"metadata.referral_code": referral_code})
        if referrer:
            await self.db.referrals.insert_one({
                "_id": generate_uuid(),
                "referrer_id": referrer["_id"],
                "referee_id": referee_id,
                "referral_code": referral_code,
                "status": "pending",
                "first_order_at": None,
                "total_orders": 0,
                "total_volume": 0.0,
                "created_at": utc_now()
            })
    
    async def _create_farmer_profile(self, user_id: str) -> None:
        """Create basic farmer profile"""
        from utils.helpers import slugify
        
        user = await self.get_user_by_id(user_id)
        if user:
            farm_slug = slugify(f"{user.profile.first_name}-{user.profile.last_name}-farm")
            
            await self.db.farmer_profiles.insert_one({
                "_id": generate_uuid(),
                "user_id": user_id,
                "farm_name": f"{user.profile.first_name}'s Farm",
                "farm_slug": farm_slug,
                "farm_description": None,
                "farm_story": None,
                "farm_images": [],
                "farm_size_hectares": None,
                "farming_methods": [],
                "certifications": [],
                "address": {},
                "payout_info": {
                    "method": "gcash",
                    "gcash_number": None
                },
                "stats": {
                    "total_products": 0,
                    "total_sales": 0.0,
                    "rating": 0.0,
                    "total_reviews": 0
                },
                "status": "pending",
                "verified": False,
                "featured": False,
                "created_at": utc_now(),
                "updated_at": utc_now()
            })
    
    async def _create_driver_profile(self, user_id: str) -> None:
        """Create basic driver profile"""
        await self.db.driver_profiles.insert_one({
            "_id": generate_uuid(),
            "user_id": user_id,
            "vehicle": {
                "type": None,
                "make": None,
                "model": None,
                "year": None,
                "plate_number": None,
                "color": None
            },
            "license": {
                "number": None,
                "expiry_date": None,
                "photo_url": None
            },
            "status": "pending",
            "verified": False,
            "availability": {
                "is_available": False,
                "last_updated": utc_now()
            },
            "stats": {
                "total_deliveries": 0,
                "completed_deliveries": 0,
                "cancelled_deliveries": 0,
                "rating": 0.0,
                "total_reviews": 0
            },
            "payout_info": {
                "method": "gcash",
                "gcash_number": None
            },
            "created_at": utc_now(),
            "updated_at": utc_now()
        })
