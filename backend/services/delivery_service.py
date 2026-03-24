from typing import List, Tuple, Optional
from models.delivery import (
    DeliveryAssignment, DeliveryAssignmentCreate,
    DeliveryAccept, DeliveryPickupComplete, DeliveryComplete
)
from services.order_service import OrderService
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now
from fastapi import HTTPException, status


class DeliveryService:
    """Delivery management service"""
    
    def __init__(self):
        self.db = get_database()
        self.order_service = OrderService()
    
    async def create_delivery_assignment(
        self,
        assignment_data: DeliveryAssignmentCreate,
        admin_id: str
    ) -> DeliveryAssignment:
        """Create delivery assignment (admin only)"""
        # Get order
        order = await self.order_service.get_order(assignment_data.order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check order status
        if order.status not in ["confirmed", "preparing"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be assigned for delivery. Current status: {order.status}"
            )
        
        # Check if delivery already exists
        existing = await self.db.delivery_assignments.find_one({"order_id": assignment_data.order_id})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery assignment already exists for this order"
            )
        
        # Get driver
        driver = await self.db.driver_profiles.find_one({"user_id": assignment_data.driver_id})
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
        
        # Check driver status
        if driver["status"] != "active" or not driver["verified"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver is not available for assignments"
            )
        
        # Get farmer info for pickup
        # Assuming order has only one farmer for simplicity
        farmer_id = order.items[0].farmer_id if order.items else None
        farmer_profile = await self.db.farmer_profiles.find_one({"user_id": farmer_id})
        
        pickup_location = {
            "name": farmer_profile["farm_name"] if farmer_profile else "Farm",
            "address": farmer_profile.get("address", {}).get("street", ""),
            "coordinates": farmer_profile.get("address", {}).get("coordinates")
        }
        
        delivery_location = {
            "name": order.delivery_address.get("contact_name"),
            "address": f"{order.delivery_address.get('street_address')}, {order.delivery_address.get('city')}",
            "coordinates": order.delivery_address.get("coordinates")
        }
        
        # Calculate route (basic - can be enhanced with real routing API)
        route = await self._calculate_route(
            pickup_location.get("coordinates"),
            delivery_location.get("coordinates")
        )
        
        # Create assignment
        assignment = DeliveryAssignment(
            _id=generate_uuid(),
            order_id=order.id,
            driver_id=assignment_data.driver_id,
            type="full",
            pickup={
                "farmer_id": farmer_id,
                "location": pickup_location,
                "scheduled_at": assignment_data.pickup_scheduled_at,
                "arrived_at": None,
                "completed_at": None,
                "notes": None
            },
            delivery={
                "location": delivery_location,
                "scheduled_at": assignment_data.delivery_scheduled_at,
                "arrived_at": None,
                "completed_at": None,
                "notes": order.delivery_instructions
            },
            route=route,
            status="assigned",
            driver_earnings=order.pricing.get("logistics_fee", 0.0),
            assigned_at=utc_now()
        )
        
        await self.db.delivery_assignments.insert_one(assignment.model_dump(by_alias=True))
        
        # Update order status
        await self.order_service.update_order_status(
            order.id,
            "pickup_assigned",
            note=f"Assigned to driver"
        )
        
        # Update order with delivery assignment ID
        await self.db.orders.update_one(
            {"_id": order.id},
            {"$set": {"delivery_assignment_id": assignment.id}}
        )
        
        return assignment
    
    async def get_available_jobs(self, driver_id: str) -> List[dict]:
        """Get available delivery jobs for driver"""
        # Get unassigned deliveries
        unassigned = await self.db.delivery_assignments.find({
            "status": "unassigned"
        }).to_list(100)
        
        # Get driver's assigned jobs
        assigned = await self.db.delivery_assignments.find({
            "driver_id": driver_id,
            "status": {"$in": ["assigned", "en_route_pickup", "picked_up", "en_route_delivery"]}
        }).to_list(100)
        
        jobs = []
        for assignment in (unassigned + assigned):
            # Get order details
            order = await self.db.orders.find_one({"_id": assignment["order_id"]})
            if order:
                jobs.append({
                    "assignment_id": assignment["_id"],
                    "order_number": order["order_number"],
                    "order_total": order["pricing"]["total"],
                    "pickup_location": assignment["pickup"]["location"],
                    "delivery_location": assignment["delivery"]["location"],
                    "pickup_scheduled_at": assignment["pickup"]["scheduled_at"],
                    "delivery_scheduled_at": assignment["delivery"]["scheduled_at"],
                    "status": assignment["status"],
                    "earnings": assignment["driver_earnings"],
                    "route": assignment.get("route")
                })
        
        return jobs
    
    async def accept_delivery_job(
        self,
        assignment_id: str,
        driver_id: str,
        accept_data: DeliveryAccept
    ) -> DeliveryAssignment:
        """Driver accepts delivery job"""
        assignment_dict = await self.db.delivery_assignments.find_one({"_id": assignment_id})
        if not assignment_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery assignment not found"
            )
        
        # Check if already assigned
        if assignment_dict["driver_id"] and assignment_dict["driver_id"] != driver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This delivery is already assigned to another driver"
            )
        
        # Update assignment
        await self.db.delivery_assignments.update_one(
            {"_id": assignment_id},
            {
                "$set": {
                    "driver_id": driver_id,
                    "status": "assigned",
                    "assigned_at": utc_now(),
                    "updated_at": utc_now()
                }
            }
        )
        
        updated = await self.db.delivery_assignments.find_one({"_id": assignment_id})
        return DeliveryAssignment(**updated)
    
    async def start_pickup(self, assignment_id: str, driver_id: str) -> DeliveryAssignment:
        """Driver starts pickup (en route to farmer)"""
        assignment = await self._get_driver_assignment(assignment_id, driver_id)
        
        if assignment.status != "assigned":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start pickup. Current status: {assignment.status}"
            )
        
        await self.db.delivery_assignments.update_one(
            {"_id": assignment_id},
            {
                "$set": {
                    "status": "en_route_pickup",
                    "updated_at": utc_now()
                }
            }
        )
        
        updated = await self.db.delivery_assignments.find_one({"_id": assignment_id})
        return DeliveryAssignment(**updated)
    
    async def complete_pickup(
        self,
        assignment_id: str,
        driver_id: str,
        pickup_data: DeliveryPickupComplete
    ) -> DeliveryAssignment:
        """Driver completes pickup from farmer"""
        assignment = await self._get_driver_assignment(assignment_id, driver_id)
        
        if assignment.status != "en_route_pickup":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete pickup. Current status: {assignment.status}"
            )
        
        proof_of_pickup = {
            "photos": pickup_data.photos,
            "signature_url": pickup_data.signature_url,
            "timestamp": utc_now(),
            "notes": pickup_data.notes
        }
        
        await self.db.delivery_assignments.update_one(
            {"_id": assignment_id},
            {
                "$set": {
                    "status": "picked_up",
                    "pickup.completed_at": utc_now(),
                    "proof_of_pickup": proof_of_pickup,
                    "updated_at": utc_now()
                }
            }
        )
        
        # Update order status
        await self.order_service.update_order_status(
            assignment.order_id,
            "picked_up",
            note="Driver picked up order from farmer"
        )
        
        updated = await self.db.delivery_assignments.find_one({"_id": assignment_id})
        return DeliveryAssignment(**updated)
    
    async def start_delivery(self, assignment_id: str, driver_id: str) -> DeliveryAssignment:
        """Driver starts delivery (en route to buyer)"""
        assignment = await self._get_driver_assignment(assignment_id, driver_id)
        
        if assignment.status != "picked_up":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start delivery. Current status: {assignment.status}"
            )
        
        await self.db.delivery_assignments.update_one(
            {"_id": assignment_id},
            {
                "$set": {
                    "status": "en_route_delivery",
                    "updated_at": utc_now()
                }
            }
        )
        
        # Update order status
        await self.order_service.update_order_status(
            assignment.order_id,
            "in_transit",
            note="Driver en route to delivery location"
        )
        
        updated = await self.db.delivery_assignments.find_one({"_id": assignment_id})
        return DeliveryAssignment(**updated)
    
    async def complete_delivery(
        self,
        assignment_id: str,
        driver_id: str,
        delivery_data: DeliveryComplete
    ) -> DeliveryAssignment:
        """Driver completes delivery to buyer"""
        assignment = await self._get_driver_assignment(assignment_id, driver_id)
        
        if assignment.status != "en_route_delivery":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete delivery. Current status: {assignment.status}"
            )
        
        proof_of_delivery = {
            "photos": delivery_data.photos,
            "signature_url": delivery_data.signature_url,
            "timestamp": utc_now(),
            "notes": delivery_data.notes,
            "recipient_name": delivery_data.recipient_name
        }
        
        await self.db.delivery_assignments.update_one(
            {"_id": assignment_id},
            {
                "$set": {
                    "status": "completed",
                    "delivery.completed_at": utc_now(),
                    "proof_of_delivery": proof_of_delivery,
                    "completed_at": utc_now(),
                    "updated_at": utc_now()
                }
            }
        )
        
        # Update order status
        await self.order_service.update_order_status(
            assignment.order_id,
            "delivered",
            note=f"Delivered to {delivery_data.recipient_name}"
        )
        
        # Update driver stats
        await self.db.driver_profiles.update_one(
            {"user_id": driver_id},
            {
                "$inc": {
                    "stats.total_deliveries": 1,
                    "stats.completed_deliveries": 1
                }
            }
        )
        
        updated = await self.db.delivery_assignments.find_one({"_id": assignment_id})
        return DeliveryAssignment(**updated)
    
    async def get_driver_deliveries(
        self,
        driver_id: str,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[DeliveryAssignment], int]:
        """Get driver's delivery history"""
        query = {"driver_id": driver_id}
        
        if status_filter:
            query["status"] = status_filter
        
        total = await self.db.delivery_assignments.count_documents(query)
        
        skip = (page - 1) * limit
        assignments = await self.db.delivery_assignments.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        return [DeliveryAssignment(**a) for a in assignments], total
    
    async def get_all_deliveries(
        self,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[DeliveryAssignment], int]:
        """Get all deliveries (admin)"""
        query = {}
        if status_filter:
            query["status"] = status_filter
        
        total = await self.db.delivery_assignments.count_documents(query)
        
        skip = (page - 1) * limit
        assignments = await self.db.delivery_assignments.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        return [DeliveryAssignment(**a) for a in assignments], total
    
    async def _get_driver_assignment(
        self,
        assignment_id: str,
        driver_id: str
    ) -> DeliveryAssignment:
        """Get assignment and verify driver access"""
        assignment_dict = await self.db.delivery_assignments.find_one({
            "_id": assignment_id,
            "driver_id": driver_id
        })
        
        if not assignment_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery assignment not found or access denied"
            )
        
        return DeliveryAssignment(**assignment_dict)
    
    async def _calculate_route(
        self,
        origin: Optional[dict],
        destination: Optional[dict]
    ) -> dict:
        """
        Calculate route between two points
        
        TODO: Integrate with real routing API (Google Maps, Mapbox, etc.)
        For now, returns basic estimated distance and time
        """
        if not origin or not destination:
            return {
                "distance_km": 10.0,
                "estimated_duration_minutes": 30,
                "polyline": None
            }
        
        # Basic straight-line distance calculation (Haversine formula)
        from math import radians, sin, cos, sqrt, atan2
        
        lat1 = radians(origin.get("latitude", 0))
        lon1 = radians(origin.get("longitude", 0))
        lat2 = radians(destination.get("latitude", 0))
        lon2 = radians(destination.get("longitude", 0))
        
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance_km = 6371 * c  # Earth radius in km
        
        # Estimate time (assume 30 km/h average speed in city)
        estimated_minutes = int((distance_km / 30) * 60)
        
        return {
            "distance_km": round(distance_km, 2),
            "estimated_duration_minutes": max(15, estimated_minutes),
            "polyline": None
        }
