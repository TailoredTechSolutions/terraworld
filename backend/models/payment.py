from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from utils.helpers import generate_uuid, utc_now


class PaymentMethod(BaseModel):
    """Payment method model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    type: str  # gcash | card | bank
    provider: str  # gcash | stripe | etc
    is_default: bool = False
    details: dict  # Provider-specific details (masked)
    metadata: dict = {}
    status: str = "active"  # active | inactive | expired
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class PaymentEvent(BaseModel):
    """Payment event/status change"""
    event: str  # created | processing | completed | failed | refunded
    timestamp: str = Field(default_factory=utc_now)
    data: dict = {}
    note: Optional[str] = None


class Payment(BaseModel):
    """Payment transaction model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    order_id: str
    user_id: str
    amount: float
    currency: str = "PHP"
    method: str  # gcash | card | bank | cod
    status: str = "pending"  # pending | processing | completed | failed | refunded
    provider: str  # gcash | stripe | mock
    provider_reference: Optional[str] = None  # Provider's transaction ID
    provider_response: dict = {}  # Raw provider response
    metadata: dict = {}
    events: List[dict] = []  # Payment event history
    refund_id: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    completed_at: Optional[str] = None
    failed_at: Optional[str] = None
    
    class Config:
        populate_by_name = True


class PaymentInitiate(BaseModel):
    """Payment initiation request"""
    order_id: str
    payment_method: str  # gcash | card | bank | cod
    return_url: Optional[str] = None  # For redirects
    metadata: dict = {}


class PaymentResponse(BaseModel):
    """Payment response"""
    id: str = Field(alias="_id")
    order_id: str
    amount: float
    currency: str
    method: str
    status: str
    provider: str
    provider_reference: Optional[str] = None
    checkout_url: Optional[str] = None  # For redirect-based payments
    qr_code: Optional[str] = None  # For QR-based payments
    instructions: Optional[str] = None
    created_at: str
    
    class Config:
        populate_by_name = True


class PaymentWebhook(BaseModel):
    """Generic payment webhook payload"""
    provider: str
    event_type: str
    transaction_id: str
    status: str
    data: Dict[str, Any]
    signature: Optional[str] = None


class Refund(BaseModel):
    """Refund transaction model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    payment_id: str
    order_id: str
    amount: float
    reason: str  # cancelled_by_buyer | cancelled_by_farmer | out_of_stock | quality_issue | other
    reason_note: Optional[str] = None
    status: str = "pending"  # pending | processing | completed | failed
    processed_by: Optional[str] = None  # Admin user ID
    provider_reference: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    completed_at: Optional[str] = None
    
    class Config:
        populate_by_name = True


class RefundCreate(BaseModel):
    """Refund creation request"""
    reason: str
    reason_note: Optional[str] = None


class Payout(BaseModel):
    """Farmer payout model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    farmer_id: str
    period: dict  # {"start": "...", "end": "..."}
    orders: List[dict]  # List of orders included in payout
    amount: float
    method: str  # gcash | bank
    destination: str  # GCash number or bank account
    status: str = "pending"  # pending | processing | completed | failed
    processed_by: Optional[str] = None
    provider_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    completed_at: Optional[str] = None
    
    class Config:
        populate_by_name = True


class PayoutRequest(BaseModel):
    """Payout request from farmer"""
    method: str  # gcash | bank
    destination: str  # Phone number or account number


class PayoutResponse(BaseModel):
    """Payout response"""
    id: str = Field(alias="_id")
    farmer_id: str
    amount: float
    method: str
    status: str
    created_at: str
    
    class Config:
        populate_by_name = True


class PayoutProcess(BaseModel):
    """Admin payout processing"""
    notes: Optional[str] = None
