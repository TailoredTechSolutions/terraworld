from pydantic import BaseModel, Field
from typing import Optional, List
from utils.helpers import generate_uuid, utc_now


class DeliveryZone(BaseModel):
    """Delivery zone model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    name: str
    slug: str
    polygon: dict  # GeoJSON polygon
    base_fee: float
    per_km_fee: float
    min_fee: float
    max_fee: float
    estimated_time_minutes: int
    status: str = "active"  # active | inactive
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class DeliveryLocation(BaseModel):
    """Delivery location details"""
    name: str
    address: str
    coordinates: dict  # {"latitude": float, "longitude": float}


class DeliveryRoute(BaseModel):
    """Delivery route information"""
    distance_km: float
    estimated_duration_minutes: int
    polyline: Optional[str] = None  # Encoded polyline


class ProofOfDelivery(BaseModel):
    """Proof of delivery"""
    photos: List[str] = []
    signature_url: Optional[str] = None
    timestamp: Optional[str] = None
    notes: Optional[str] = None
    recipient_name: Optional[str] = None


class DeliveryAssignment(BaseModel):
    """Delivery assignment model"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    order_id: str
    driver_id: Optional[str] = None
    type: str = "full"  # pickup_only | delivery_only | full
    
    # Pickup details
    pickup: dict = {
        "farmer_id": None,
        "location": None,
        "scheduled_at": None,
        "arrived_at": None,
        "completed_at": None,
        "notes": None
    }
    
    # Delivery details
    delivery: dict = {
        "location": None,
        "scheduled_at": None,
        "arrived_at": None,
        "completed_at": None,
        "notes": None
    }
    
    # Route information
    route: Optional[dict] = None
    
    # Status
    status: str = "unassigned"  # unassigned | assigned | en_route_pickup | picked_up | en_route_delivery | delivered | completed | cancelled
    
    # Proof of delivery
    proof_of_pickup: dict = {
        "photos": [],
        "signature_url": None,
        "timestamp": None,
        "notes": None
    }
    
    proof_of_delivery: dict = {
        "photos": [],
        "signature_url": None,
        "timestamp": None,
        "notes": None,
        "recipient_name": None
    }
    
    # Earnings
    driver_earnings: float = 0.0
    
    # Timestamps
    assigned_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class DeliveryAssignmentCreate(BaseModel):
    """Create delivery assignment"""
    order_id: str
    driver_id: str
    pickup_scheduled_at: str
    delivery_scheduled_at: str


class DeliveryAccept(BaseModel):
    """Accept delivery job"""
    estimated_pickup_time: Optional[str] = None


class DeliveryPickupComplete(BaseModel):
    """Mark pickup complete"""
    photos: List[str] = []
    signature_url: Optional[str] = None
    notes: Optional[str] = None


class DeliveryComplete(BaseModel):
    """Mark delivery complete"""
    photos: List[str] = []
    signature_url: Optional[str] = None
    notes: Optional[str] = None
    recipient_name: str


class DriverAvailability(BaseModel):
    """Driver availability update"""
    is_available: bool
    notes: Optional[str] = None


class DriverProfileUpdate(BaseModel):
    """Driver profile update"""
    vehicle_type: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[int] = None
    vehicle_plate_number: Optional[str] = None
    vehicle_color: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry_date: Optional[str] = None
    gcash_number: Optional[str] = None


class DriverStats(BaseModel):
    """Driver statistics"""
    total_deliveries: int = 0
    completed_deliveries: int = 0
    cancelled_deliveries: int = 0
    rating: float = 0.0
    total_reviews: int = 0
    total_earnings: float = 0.0
