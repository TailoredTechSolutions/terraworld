from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from models.delivery import DeliveryAssignment, DeliveryAssignmentCreate
from models.user import User
from middleware.auth import get_current_admin
from services.delivery_service import DeliveryService
from utils.database import get_database

router = APIRouter(prefix="/admin/deliveries", tags=["Admin Deliveries"])


@router.post("/assign", response_model=DeliveryAssignment, status_code=status.HTTP_201_CREATED)
async def assign_delivery(
    assignment_data: DeliveryAssignmentCreate,
    current_user: User = Depends(get_current_admin)
):
    """
    Assign delivery to driver (Admin only)
    
    - **order_id**: Order to assign for delivery
    - **driver_id**: Driver to assign
    - **pickup_scheduled_at**: Scheduled pickup time
    - **delivery_scheduled_at**: Scheduled delivery time
    
    Process:
    1. Validates order status (must be confirmed or preparing)
    2. Validates driver is active and verified
    3. Creates delivery assignment
    4. Updates order status to 'pickup_assigned'
    5. Calculates route and earnings
    """
    delivery_service = DeliveryService()
    return await delivery_service.create_delivery_assignment(
        assignment_data,
        current_user.id
    )


@router.get("", response_model=dict)
async def get_all_deliveries(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all deliveries (Admin only)
    
    - **status**: Filter by status (optional)
    - **page**: Page number
    - **limit**: Items per page
    """
    delivery_service = DeliveryService()
    
    deliveries, total = await delivery_service.get_all_deliveries(
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


@router.get("/drivers", response_model=dict)
async def get_all_drivers(
    status_filter: Optional[str] = Query(None, alias="status"),
    available_only: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all drivers (Admin only)
    
    - **status**: Filter by status (active | inactive | suspended)
    - **available_only**: Show only available drivers
    - **page**: Page number
    - **limit**: Items per page
    """
    db = get_database()
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    if available_only:
        query["availability.is_available"] = True
    
    total = await db.driver_profiles.count_documents(query)
    
    skip = (page - 1) * limit
    drivers = await db.driver_profiles.find(query)\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    # Populate with user info
    driver_list = []
    for driver in drivers:
        user = await db.users.find_one({"_id": driver["user_id"]})
        if user:
            driver_list.append({
                "_id": driver["_id"],
                "user_id": driver["user_id"],
                "name": f"{user['profile']['first_name']} {user['profile']['last_name']}",
                "email": user["email"],
                "phone": user.get("phone"),
                "vehicle": driver.get("vehicle"),
                "license": driver.get("license"),
                "status": driver["status"],
                "verified": driver["verified"],
                "availability": driver.get("availability"),
                "stats": driver.get("stats"),
                "created_at": driver["created_at"]
            })
    
    return {
        "items": driver_list,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.put("/drivers/{driver_id}/verify")
async def verify_driver(
    driver_id: str,
    current_user: User = Depends(get_current_admin)
):
    """
    Verify driver (Admin only)
    
    Approves driver to receive delivery assignments.
    """
    db = get_database()
    
    driver = await db.driver_profiles.find_one({"user_id": driver_id})
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )
    
    await db.driver_profiles.update_one(
        {"user_id": driver_id},
        {
            "$set": {
                "verified": True,
                "status": "active",
                "updated_at": utc_now()
            }
        }
    )
    
    return {"status": "success", "message": "Driver verified"}


@router.put("/drivers/{driver_id}/suspend")
async def suspend_driver(
    driver_id: str,
    current_user: User = Depends(get_current_admin)
):
    """
    Suspend driver (Admin only)
    
    Prevents driver from receiving new delivery assignments.
    """
    db = get_database()
    
    driver = await db.driver_profiles.find_one({"user_id": driver_id})
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )
    
    await db.driver_profiles.update_one(
        {"user_id": driver_id},
        {
            "$set": {
                "status": "suspended",
                "updated_at": utc_now()
            }
        }
    )
    
    return {"status": "success", "message": "Driver suspended"}


@router.get("/stats")
async def get_delivery_stats(current_user: User = Depends(get_current_admin)):
    """
    Get delivery statistics (Admin only)
    
    Shows:
    - Total deliveries by status
    - Average delivery time
    - Driver performance metrics
    - Delivery success rate
    """
    db = get_database()
    
    # Count deliveries by status
    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    status_counts = {}
    async for doc in db.delivery_assignments.aggregate(pipeline):
        status_counts[doc["_id"]] = doc["count"]
    
    # Get total active drivers
    active_drivers = await db.driver_profiles.count_documents({
        "status": "active",
        "verified": True
    })
    
    available_drivers = await db.driver_profiles.count_documents({
        "status": "active",
        "verified": True,
        "availability.is_available": True
    })
    
    # Get completed deliveries for success rate
    total_assigned = status_counts.get("assigned", 0) + \
                    status_counts.get("en_route_pickup", 0) + \
                    status_counts.get("picked_up", 0) + \
                    status_counts.get("en_route_delivery", 0) + \
                    status_counts.get("completed", 0) + \
                    status_counts.get("cancelled", 0)
    
    completed = status_counts.get("completed", 0)
    success_rate = (completed / total_assigned * 100) if total_assigned > 0 else 0
    
    return {
        "deliveries_by_status": status_counts,
        "active_drivers": active_drivers,
        "available_drivers": available_drivers,
        "success_rate": round(success_rate, 2),
        "total_deliveries": sum(status_counts.values())
    }


from utils.helpers import utc_now
