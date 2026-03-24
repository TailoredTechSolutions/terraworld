from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.user import User, UserResponse, Address, AddressCreate, AddressUpdate
from middleware.auth import get_current_user
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        _id=current_user.id,
        email=current_user.email,
        phone=current_user.phone,
        roles=current_user.roles,
        status=current_user.status,
        email_verified=current_user.email_verified,
        phone_verified=current_user.phone_verified,
        kyc_status=current_user.kyc_status,
        profile=current_user.profile,
        preferences=current_user.preferences,
        created_at=current_user.created_at
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    profile_update: dict,
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    db = get_database()
    
    # Build update fields
    update_fields = {}
    
    if "first_name" in profile_update:
        update_fields["profile.first_name"] = profile_update["first_name"]
    if "last_name" in profile_update:
        update_fields["profile.last_name"] = profile_update["last_name"]
    if "display_name" in profile_update:
        update_fields["profile.display_name"] = profile_update["display_name"]
    if "bio" in profile_update:
        update_fields["profile.bio"] = profile_update["bio"]
    if "avatar_url" in profile_update:
        update_fields["profile.avatar_url"] = profile_update["avatar_url"]
    if "date_of_birth" in profile_update:
        update_fields["profile.date_of_birth"] = profile_update["date_of_birth"]
    if "gender" in profile_update:
        update_fields["profile.gender"] = profile_update["gender"]
    if "phone" in profile_update:
        # Check if phone is already taken
        existing = await db.users.find_one({
            "phone": profile_update["phone"],
            "_id": {"$ne": current_user.id}
        })
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already in use"
            )
        update_fields["phone"] = profile_update["phone"]
    
    update_fields["updated_at"] = utc_now()
    
    # Update user
    await db.users.update_one(
        {"_id": current_user.id},
        {"$set": update_fields}
    )
    
    # Fetch updated user
    updated_user_dict = await db.users.find_one({"_id": current_user.id})
    updated_user = User(**updated_user_dict)
    
    return UserResponse(
        _id=updated_user.id,
        email=updated_user.email,
        phone=updated_user.phone,
        roles=updated_user.roles,
        status=updated_user.status,
        email_verified=updated_user.email_verified,
        phone_verified=updated_user.phone_verified,
        kyc_status=updated_user.kyc_status,
        profile=updated_user.profile,
        preferences=updated_user.preferences,
        created_at=updated_user.created_at
    )


# Address Management
@router.get("/addresses", response_model=List[Address])
async def get_user_addresses(current_user: User = Depends(get_current_user)):
    """Get all addresses for current user"""
    db = get_database()
    
    addresses = await db.addresses.find({"user_id": current_user.id}).to_list(100)
    return [Address(**addr) for addr in addresses]


@router.post("/addresses", response_model=Address, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new address"""
    db = get_database()
    
    # If this is marked as default, unset other defaults
    if address_data.is_default:
        await db.addresses.update_many(
            {"user_id": current_user.id, "type": address_data.type},
            {"$set": {"is_default": False}}
        )
    
    address = Address(
        _id=generate_uuid(),
        user_id=current_user.id,
        **address_data.model_dump()
    )
    
    await db.addresses.insert_one(address.model_dump(by_alias=True))
    
    return address


@router.get("/addresses/{address_id}", response_model=Address)
async def get_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific address"""
    db = get_database()
    
    address_dict = await db.addresses.find_one({
        "_id": address_id,
        "user_id": current_user.id
    })
    
    if not address_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return Address(**address_dict)


@router.put("/addresses/{address_id}", response_model=Address)
async def update_address(
    address_id: str,
    address_update: AddressUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update address"""
    db = get_database()
    
    # Check if address exists and belongs to user
    existing = await db.addresses.find_one({
        "_id": address_id,
        "user_id": current_user.id
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    # Build update fields
    update_fields = {
        k: v for k, v in address_update.model_dump(exclude_unset=True).items()
        if v is not None
    }
    
    # If setting as default, unset other defaults
    if update_fields.get("is_default"):
        await db.addresses.update_many(
            {
                "user_id": current_user.id,
                "type": existing["type"],
                "_id": {"$ne": address_id}
            },
            {"$set": {"is_default": False}}
        )
    
    update_fields["updated_at"] = utc_now()
    
    await db.addresses.update_one(
        {"_id": address_id},
        {"$set": update_fields}
    )
    
    # Fetch updated address
    updated_dict = await db.addresses.find_one({"_id": address_id})
    return Address(**updated_dict)


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete address"""
    db = get_database()
    
    result = await db.addresses.delete_one({
        "_id": address_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return None
