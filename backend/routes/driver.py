from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, List
from models.delivery import (
    DeliveryAssignment, DeliveryAccept,
    DeliveryPickupComplete, DeliveryComplete,
    DriverAvailability, DriverProfileUpdate
)
from models.user import User
from middleware.auth import get_current_driver
from services.delivery_service import DeliveryService
from utils.database import get_database
from utils.helpers import utc_now

router = APIRouter(prefix="/driver", tags=["Driver"])


@router.get("/profile")
async def get_driver_profile(current_user: User = Depends(get_current_driver)):
    """
    Get driver profile
    
    Includes:
    - Vehicle information
    - License details
    - Availability status
    - Statistics (deliveries, earnings, rating)
    - Payout information
    """
    db = get_database()
    
    driver_profile = await db.driver_profiles.find_one({"user_id": current_user.id})
    if not driver_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found"
        )
    
    return driver_profile


@router.put("/profile")
async def update_driver_profile(
    profile_update: DriverProfileUpdate,
    current_user: User = Depends(get_current_driver)
):
    """
    Update driver profile
    
    Can update:
    - Vehicle details
    - License information
    - Payout method (GCash number)
    """
    db = get_database()
    
    update_fields = {}
    
    if profile_update.vehicle_type:
        update_fields["vehicle.type"] = profile_update.vehicle_type
    if profile_update.vehicle_make:
        update_fields["vehicle.make"] = profile_update.vehicle_make
    if profile_update.vehicle_model:
        update_fields["vehicle.model"] = profile_update.vehicle_model
    if profile_update.vehicle_year:
        update_fields["vehicle.year"] = profile_update.vehicle_year
    if profile_update.vehicle_plate_number:
        update_fields["vehicle.plate_number"] = profile_update.vehicle_plate_number
    if profile_update.vehicle_color:
        update_fields["vehicle.color"] = profile_update.vehicle_color
    if profile_update.license_number:
        update_fields["license.number"] = profile_update.license_number
    if profile_update.license_expiry_date:
        update_fields["license.expiry_date"] = profile_update.license_expiry_date
    if profile_update.gcash_number:
        update_fields["payout_info.gcash_number"] = profile_update.gcash_number
    
    update_fields["updated_at"] = utc_now()
    
    await db.driver_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields}
    )
    
    updated_profile = await db.driver_profiles.find_one({"user_id": current_user.id})
    return updated_profile


@router.put("/availability")
async def update_availability(
    availability: DriverAvailability,
    current_user: User = Depends(get_current_driver)
):
    """
    Update driver availability
    
    - **is_available**: true to go online, false to go offline
    - **notes**: Optional note about availability
    """
    db = get_database()
    
    await db.driver_profiles.update_one(
        {"user_id": current_user.id},
        {
            "$set": {
                "availability.is_available": availability.is_available,
                "availability.last_updated": utc_now(),
                "updated_at": utc_now()
            }
        }
    )
    
    status_text = "online" if availability.is_available else "offline"
    
    return {
        "status": "success",
        "message": f"Driver is now {status_text}",
        "is_available": availability.is_available
    }


@router.get("/jobs/available")
async def get_available_jobs(current_user: User = Depends(get_current_driver)):
    """
    Get available delivery jobs
    
    Shows:
    - Unassigned deliveries
    - Driver's current assignments
    - Pickup and delivery locations
    - Scheduled times
    - Earnings per job
    """
    delivery_service = DeliveryService()
    return await delivery_service.get_available_jobs(current_user.id)


@router.post("/jobs/{assignment_id}/accept", response_model=DeliveryAssignment)
async def accept_job(
    assignment_id: str,
    accept_data: DeliveryAccept,
    current_user: User = Depends(get_current_driver)
):
    """
    Accept delivery job
    
    Driver accepts an available delivery assignment.
    """
    delivery_service = DeliveryService()
    return await delivery_service.accept_delivery_job(
        assignment_id,
        current_user.id,
        accept_data
    )


@router.post("/jobs/{assignment_id}/start-pickup", response_model=DeliveryAssignment)
async def start_pickup(
    assignment_id: str,
    current_user: User = Depends(get_current_driver)
):
    """
    Start pickup
    
    Driver indicates they're en route to farmer's location for pickup.
    """
    delivery_service = DeliveryService()
    return await delivery_service.start_pickup(assignment_id, current_user.id)


@router.post("/jobs/{assignment_id}/complete-pickup", response_model=DeliveryAssignment)
async def complete_pickup(
    assignment_id: str,
    pickup_data: DeliveryPickupComplete,
    current_user: User = Depends(get_current_driver)
):
    """
    Complete pickup
    
    Driver confirms pickup from farmer with proof.
    
    - **photos**: List of photo URLs (items picked up)
    - **signature_url**: Farmer's signature (optional)
    - **notes**: Any notes about pickup
    """
    delivery_service = DeliveryService()
    return await delivery_service.complete_pickup(
        assignment_id,
        current_user.id,
        pickup_data
    )


@router.post("/jobs/{assignment_id}/start-delivery", response_model=DeliveryAssignment)
async def start_delivery(
    assignment_id: str,
    current_user: User = Depends(get_current_driver)
):
    """
    Start delivery
    
    Driver indicates they're en route to buyer's location for delivery.
    """
    delivery_service = DeliveryService()
    return await delivery_service.start_delivery(assignment_id, current_user.id)


@router.post("/jobs/{assignment_id}/complete-delivery", response_model=DeliveryAssignment)
async def complete_delivery(
    assignment_id: str,
    delivery_data: DeliveryComplete,
    current_user: User = Depends(get_current_driver)
):
    """
    Complete delivery
    
    Driver confirms delivery to buyer with proof.
    
    - **photos**: List of photo URLs (delivered items)
    - **signature_url**: Buyer's signature (optional)
    - **notes**: Any notes about delivery
    - **recipient_name**: Name of person who received delivery
    """
    delivery_service = DeliveryService()
    return await delivery_service.complete_delivery(
        assignment_id,
        current_user.id,
        delivery_data
    )


@router.get("/deliveries", response_model=dict)
async def get_driver_deliveries(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_driver)
):
    """
    Get driver's delivery history
    
    - **status**: Filter by status (optional)
    - **page**: Page number
    - **limit**: Items per page
    """
    delivery_service = DeliveryService()
    
    deliveries, total = await delivery_service.get_driver_deliveries(
        current_user.id,
        status_filter,
        page,
        limit
    )
    
    return {
        "items": deliveries,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/earnings")
async def get_driver_earnings(current_user: User = Depends(get_current_driver)):
    """
    Get driver earnings summary
    
    Shows:
    - Total earnings
    - Completed deliveries count
    - Pending earnings (from in-progress deliveries)
    - Average earnings per delivery
    """
    db = get_database()
    
    # Get driver stats
    driver_profile = await db.driver_profiles.find_one({"user_id": current_user.id})
    if not driver_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found"
        )
    
    # Calculate total earnings from completed deliveries
    completed_deliveries = await db.delivery_assignments.find({
        "driver_id": current_user.id,
        "status": "completed"
    }).to_list(1000)
    
    total_earnings = sum(d.get("driver_earnings", 0) for d in completed_deliveries)
    completed_count = len(completed_deliveries)
    
    # Calculate pending earnings from in-progress deliveries
    in_progress = await db.delivery_assignments.find({
        "driver_id": current_user.id,
        "status": {"$in": ["assigned", "en_route_pickup", "picked_up", "en_route_delivery"]}
    }).to_list(100)
    
    pending_earnings = sum(d.get("driver_earnings", 0) for d in in_progress)
    
    avg_earnings = total_earnings / completed_count if completed_count > 0 else 0
    
    return {
        "total_earnings": round(total_earnings, 2),
        "pending_earnings": round(pending_earnings, 2),
        "completed_deliveries": completed_count,
        "in_progress_deliveries": len(in_progress),
        "average_earnings_per_delivery": round(avg_earnings, 2),
        "stats": driver_profile.get("stats", {})
    }
