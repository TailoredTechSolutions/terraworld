from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from utils.helpers import generate_uuid, utc_now


class UserProfile(BaseModel):
    """User profile data"""
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None


class UserPreferences(BaseModel):
    """User preferences"""
    language: str = "en"
    currency: str = "PHP"
    notifications: dict = {
        "push_enabled": True,
        "email_enabled": True,
        "sms_enabled": False
    }


class UserMetadata(BaseModel):
    """User metadata"""
    device_tokens: List[str] = []
    last_login_at: Optional[str] = None
    last_login_ip: Optional[str] = None
    signup_source: Optional[str] = "web"
    referral_code: Optional[str] = None


class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str
    roles: List[str] = ["buyer"]
    status: str = "active"  # active | suspended | deleted
    email_verified: bool = False
    phone_verified: bool = False
    kyc_status: str = "pending"  # pending | submitted | approved | rejected
    kyc_submitted_at: Optional[str] = None
    kyc_approved_at: Optional[str] = None
    profile: UserProfile
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    metadata: UserMetadata = Field(default_factory=UserMetadata)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    deleted_at: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "juan@example.com",
                "roles": ["buyer"],
                "status": "active",
                "profile": {
                    "first_name": "Juan",
                    "last_name": "Dela Cruz",
                    "display_name": "Juan D."
                }
            }
        }


class UserCreate(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    phone: Optional[str] = None
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    role: str = "buyer"  # buyer | farmer | driver
    referred_by: Optional[str] = None  # Referral code
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ['buyer', 'farmer', 'driver']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of {allowed_roles}')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response model (without sensitive data)"""
    id: str = Field(alias="_id")
    email: str
    phone: Optional[str] = None
    roles: List[str]
    status: str
    email_verified: bool
    phone_verified: bool
    kyc_status: str
    profile: UserProfile
    preferences: UserPreferences
    created_at: str
    
    class Config:
        populate_by_name = True


class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class Address(BaseModel):
    """Address model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    type: str = "delivery"  # delivery | pickup | billing
    label: str = "Home"
    is_default: bool = False
    contact_name: str
    contact_phone: str
    street_address: str
    barangay: str
    city: str
    province: str
    postal_code: str
    country: str = "PH"
    coordinates: Optional[dict] = None  # {"latitude": float, "longitude": float}
    delivery_instructions: Optional[str] = None
    verified: bool = False
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class AddressCreate(BaseModel):
    """Address creation model"""
    type: str = "delivery"
    label: str = "Home"
    is_default: bool = False
    contact_name: str
    contact_phone: str
    street_address: str
    barangay: str
    city: str
    province: str
    postal_code: str
    country: str = "PH"
    coordinates: Optional[dict] = None
    delivery_instructions: Optional[str] = None


class AddressUpdate(BaseModel):
    """Address update model"""
    label: Optional[str] = None
    is_default: Optional[bool] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    street_address: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    coordinates: Optional[dict] = None
    delivery_instructions: Optional[str] = None
