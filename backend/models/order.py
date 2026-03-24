from pydantic import BaseModel, Field
from typing import List, Optional
from utils.helpers import generate_uuid, utc_now


class CartItem(BaseModel):
    """Cart item model"""
    product_id: str
    quantity: int = Field(ge=1)
    unit_price: float  # Snapshot at add time
    added_at: str = Field(default_factory=utc_now)


class CartTotals(BaseModel):
    """Cart totals"""
    subtotal: float
    items_count: int


class Cart(BaseModel):
    """Shopping cart model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    items: List[CartItem] = []
    totals: CartTotals = Field(default_factory=lambda: CartTotals(subtotal=0.0, items_count=0))
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class CartItemAdd(BaseModel):
    """Add item to cart request"""
    product_id: str
    quantity: int = Field(ge=1, default=1)


class CartItemUpdate(BaseModel):
    """Update cart item quantity"""
    quantity: int = Field(ge=1)


class CartResponse(BaseModel):
    """Cart response with populated product info"""
    id: str = Field(alias="_id")
    user_id: str
    items: List[dict]  # Will be populated with product info
    totals: CartTotals
    updated_at: str
    
    class Config:
        populate_by_name = True


class PricingBreakdown(BaseModel):
    """Pricing breakdown for order"""
    subtotal: float
    platform_fee: float
    platform_fee_rate: float
    tax: float
    tax_rate: float
    logistics_fee: float
    total: float


class OrderItem(BaseModel):
    """Order item"""
    product_id: str
    farmer_id: str
    product_name: str
    quantity: int
    unit: str
    unit_price: float
    subtotal: float


class OrderStatus(BaseModel):
    """Order status history entry"""
    status: str
    timestamp: str = Field(default_factory=utc_now)
    note: Optional[str] = None


class Order(BaseModel):
    """Order model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    order_number: str
    buyer_id: str
    items: List[OrderItem]
    pricing: PricingBreakdown
    delivery_address: dict  # Address snapshot
    delivery_instructions: Optional[str] = None
    delivery_window: Optional[dict] = None
    status: str = "pending"  # pending | confirmed | preparing | pickup_assigned | picked_up | in_transit | delivered | completed | cancelled | disputed | refunded
    status_history: List[OrderStatus] = []
    payment_id: Optional[str] = None
    delivery_assignment_id: Optional[str] = None
    notes: dict = {"buyer_notes": None, "admin_notes": None}
    metadata: dict = {}
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    cancelled_at: Optional[str] = None
    completed_at: Optional[str] = None
    
    class Config:
        populate_by_name = True


class OrderCreate(BaseModel):
    """Order creation request"""
    delivery_address_id: str
    delivery_instructions: Optional[str] = None
    delivery_window_start: Optional[str] = None
    delivery_window_end: Optional[str] = None
    buyer_notes: Optional[str] = None


class OrderResponse(BaseModel):
    """Order response"""
    id: str = Field(alias="_id")
    order_number: str
    buyer_id: str
    items: List[OrderItem]
    pricing: PricingBreakdown
    delivery_address: dict
    delivery_instructions: Optional[str] = None
    status: str
    status_history: List[OrderStatus]
    created_at: str
    updated_at: str
    
    class Config:
        populate_by_name = True


class OrderStatusUpdate(BaseModel):
    """Order status update request"""
    status: str
    note: Optional[str] = None


class OrderFilter(BaseModel):
    """Order filter"""
    status: Optional[str] = None
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
