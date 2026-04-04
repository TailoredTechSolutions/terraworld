from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime
import uuid


# ==================== ENUMS ====================

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    GCASH = "gcash"
    MAYA = "maya"
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    COD = "cod"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class NotificationType(str, Enum):
    ORDER_STATUS = "order_status"
    PAYMENT = "payment"
    DELIVERY = "delivery"
    SYSTEM = "system"
    PROMOTION = "promotion"


class DriverStatus(str, Enum):
    AVAILABLE = "available"
    ON_DELIVERY = "on_delivery"
    OFFLINE = "offline"


class CouponType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_DELIVERY = "free_delivery"


class AnalyticsTimeframe(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


# ==================== PRODUCT MODELS ====================

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    unit: str
    farm_id: str
    farm_name: str
    image: str
    category: str
    stock: int
    organic: bool = False
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProductCreate(BaseModel):
    name: str
    price: float
    unit: str
    farm_id: str
    farm_name: str
    image: str
    category: str
    stock: int
    organic: bool = False
    description: str


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    organic: Optional[bool] = None
    description: Optional[str] = None


class FarmerProductCreate(BaseModel):
    name: str
    price: float
    unit: str
    image: str
    category: str
    stock: int
    organic: bool = False
    description: str


# ==================== FARM MODELS ====================

class Farm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    owner: str
    latitude: float
    longitude: float
    rating: float = 5.0
    review_count: int = 0
    image: str
    description: str
    products: List[str] = []
    contact: Optional[str] = None
    farm_type: Optional[str] = None
    certificate: Optional[str] = None
    program: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    elevation: Optional[str] = None
    farm_area: Optional[str] = None
    established: Optional[str] = None
    specialties: List[str] = []
    categories: List[str] = []
    operating_hours: Optional[str] = None
    delivery_available: bool = True
    organic_certified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class FarmCreate(BaseModel):
    name: str
    owner: str
    latitude: float
    longitude: float
    image: str
    description: str
    products: List[str] = []
    contact: Optional[str] = None
    farm_type: Optional[str] = None
    certificate: Optional[str] = None
    program: Optional[str] = None
    municipality: Optional[str] = None
    province: Optional[str] = None
    elevation: Optional[str] = None
    farm_area: Optional[str] = None
    established: Optional[str] = None
    specialties: List[str] = []
    categories: List[str] = []
    operating_hours: Optional[str] = None
    delivery_available: bool = True
    organic_certified: bool = False


# ==================== CART MODELS ====================

class CartItem(BaseModel):
    product_id: str
    product_name: str
    farm_name: str
    price: float
    unit: str
    quantity: int
    image: str


class Cart(BaseModel):
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AddToCartRequest(BaseModel):
    user_id: str
    product_id: str
    quantity: int = 1


class UpdateCartItemRequest(BaseModel):
    quantity: int


# ==================== ORDER MODELS ====================

class DeliveryAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    province: str
    postal_code: str
    notes: Optional[str] = None


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    farm_name: str
    price: float
    unit: str
    quantity: int
    subtotal: float
    image: str


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[dict]
    delivery_address: DeliveryAddress
    payment_method: str = "gcash"
    payment_status: str = "pending"
    order_status: str = "pending"
    subtotal: float = 0
    delivery_fee: float = 0
    total: float = 0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CreateOrderRequest(BaseModel):
    user_id: str
    delivery_address: DeliveryAddress
    payment_method: str = "gcash"
    notes: Optional[str] = None


# ==================== CATEGORY ====================

class Category(BaseModel):
    id: str
    name: str
    icon: str


# ==================== NOTIFICATION MODELS ====================

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    title: str
    message: str
    data: Optional[dict] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== PAYMENT MODELS ====================

class PaymentRequest(BaseModel):
    order_id: str
    payment_method: str
    phone_number: Optional[str] = None


class PaymentResponse(BaseModel):
    id: str
    reference_number: str
    amount: float
    payment_method: str
    status: str
    qr_code: str
    message: str
    instructions: List[str]


# ==================== DRIVER MODELS ====================

class Driver(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: str
    vehicle_type: str
    vehicle_plate: str
    status: str = "available"
    current_location: Optional[dict] = None
    rating: float = 5.0
    total_deliveries: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DeliveryAssignment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    driver_id: str
    driver_name: str
    driver_phone: str
    status: str = "assigned"
    pickup_location: Optional[dict] = None
    delivery_location: Optional[dict] = None
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DriverLocationUpdate(BaseModel):
    latitude: float
    longitude: float


# ==================== REVIEW MODELS ====================

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    product_id: Optional[str] = None
    farm_id: Optional[str] = None
    order_id: Optional[str] = None
    rating: int
    comment: str = ""
    images: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReviewCreate(BaseModel):
    product_id: Optional[str] = None
    farm_id: Optional[str] = None
    order_id: Optional[str] = None
    rating: int
    comment: str = ""
    images: List[str] = []


# ==================== COUPON MODELS ====================

class Coupon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    coupon_type: str
    value: float
    min_order: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int = 0
    valid_until: Optional[datetime] = None
    is_active: bool = True
    description: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CouponCreate(BaseModel):
    code: str
    coupon_type: str
    value: float
    min_order: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    description: str = ""


class ApplyCouponRequest(BaseModel):
    code: str
    subtotal: float


# ==================== EMAIL MODELS ====================

class EmailNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    to_email: str
    subject: str
    body: str
    template: str
    data: Optional[dict] = None
    status: str = "pending"
    sent_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
