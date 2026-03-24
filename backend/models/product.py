from pydantic import BaseModel, Field
from typing import Optional, List
from utils.helpers import generate_uuid, utc_now


class Category(BaseModel):
    """Category model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    name: str
    slug: str
    parent_id: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0
    status: str = "active"  # active | inactive
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class CategoryCreate(BaseModel):
    """Category creation model"""
    name: str
    parent_id: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    image_url: Optional[str] = None
    order: int = 0


class ProductImage(BaseModel):
    """Product image model"""
    url: str
    order: int = 1
    is_primary: bool = False


class ProductAvailability(BaseModel):
    """Product availability"""
    status: str = "in_stock"  # in_stock | out_of_stock | seasonal
    seasonal: bool = False
    available_from: Optional[str] = None
    available_until: Optional[str] = None


class ProductModeration(BaseModel):
    """Product moderation status"""
    status: str = "pending"  # pending | approved | rejected
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    rejection_reason: Optional[str] = None


class ProductStats(BaseModel):
    """Product statistics"""
    views: int = 0
    orders: int = 0
    rating: float = 0.0
    reviews: int = 0


class Product(BaseModel):
    """Product model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    farmer_id: str
    category_id: str
    name: str
    slug: str
    description: str
    unit: str = "kg"  # kg | pack | piece | bunch
    base_price: float
    stock_quantity: int
    min_order_quantity: int = 1
    max_order_quantity: Optional[int] = None
    images: List[ProductImage] = []
    attributes: dict = {}
    availability: ProductAvailability = Field(default_factory=ProductAvailability)
    moderation: ProductModeration = Field(default_factory=ProductModeration)
    featured: bool = False
    tags: List[str] = []
    stats: ProductStats = Field(default_factory=ProductStats)
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    deleted_at: Optional[str] = None
    
    class Config:
        populate_by_name = True


class ProductCreate(BaseModel):
    """Product creation model"""
    category_id: str
    name: str
    description: str
    unit: str = "kg"
    base_price: float = Field(gt=0)
    stock_quantity: int = Field(ge=0)
    min_order_quantity: int = Field(ge=1, default=1)
    max_order_quantity: Optional[int] = None
    images: List[ProductImage] = []
    attributes: dict = {}
    seasonal: bool = False
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    tags: List[str] = []


class ProductUpdate(BaseModel):
    """Product update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    base_price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    min_order_quantity: Optional[int] = Field(None, ge=1)
    max_order_quantity: Optional[int] = None
    images: Optional[List[ProductImage]] = None
    attributes: Optional[dict] = None
    tags: Optional[List[str]] = None


class ProductFilter(BaseModel):
    """Product filter model"""
    category_id: Optional[str] = None
    farmer_id: Optional[str] = None
    search: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    in_stock_only: bool = True
    featured_only: bool = False
    tags: Optional[List[str]] = None
    sort_by: str = "created_at"  # created_at | price | rating | name
    sort_order: str = "desc"  # asc | desc
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)


class FarmerProfile(BaseModel):
    """Farmer profile model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    farm_name: str
    farm_slug: str
    farm_description: Optional[str] = None
    farm_story: Optional[str] = None
    farm_images: List[str] = []
    farm_size_hectares: Optional[float] = None
    farming_methods: List[str] = []
    certifications: List[dict] = []
    address: dict
    payout_info: dict = {
        "method": "gcash",
        "gcash_number": None,
        "bank_name": None,
        "bank_account": None,
        "bank_account_name": None
    }
    stats: dict = {
        "total_products": 0,
        "total_sales": 0.0,
        "rating": 0.0,
        "total_reviews": 0
    }
    status: str = "pending"  # pending | approved | suspended
    verified: bool = False
    featured: bool = False
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class FarmerProfileCreate(BaseModel):
    """Farmer profile creation model"""
    farm_name: str
    farm_description: Optional[str] = None
    farm_story: Optional[str] = None
    farm_images: List[str] = []
    farm_size_hectares: Optional[float] = None
    farming_methods: List[str] = []
    address: dict
    payout_method: str = "gcash"
    gcash_number: Optional[str] = None


class FarmerProfileUpdate(BaseModel):
    """Farmer profile update model"""
    farm_name: Optional[str] = None
    farm_description: Optional[str] = None
    farm_story: Optional[str] = None
    farm_images: Optional[List[str]] = None
    farm_size_hectares: Optional[float] = None
    farming_methods: Optional[List[str]] = None
    payout_method: Optional[str] = None
    gcash_number: Optional[str] = None
