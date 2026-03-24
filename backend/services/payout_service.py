from typing import List, Tuple, Optional
from models.payment import Payout, PayoutRequest, PayoutProcess
from services.payment_provider import get_payment_provider, PaymentProvider
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now
from fastapi import HTTPException, status
from datetime import datetime, timedelta


class PayoutService:
    """Payout management service for farmers"""
    
    def __init__(self, provider_name: str = "mock"):
        self.db = get_database()
        self.provider: PaymentProvider = get_payment_provider(provider_name)
    
    async def request_payout(
        self,
        farmer_id: str,
        payout_data: PayoutRequest
    ) -> Payout:
        """
        Farmer requests payout of accumulated earnings
        
        Calculates earnings from completed orders
        """
        # Get farmer profile for payout info
        farmer_profile = await self.db.farmer_profiles.find_one({"user_id": farmer_id})
        if not farmer_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farmer profile not found"
            )
        
        # Check if there's already a pending payout
        pending_payout = await self.db.payouts.find_one({
            "farmer_id": farmer_id,
            "status": {"$in": ["pending", "processing"]}
        })
        
        if pending_payout:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have a pending payout request"
            )
        
        # Calculate earnings from completed orders that haven't been paid out
        # Get all completed orders with this farmer's products
        completed_orders = await self.db.orders.find({
            "items.farmer_id": farmer_id,
            "status": "completed",
            "payment_id": {"$ne": None}  # Must have been paid
        }).to_list(1000)
        
        # Check which orders haven't been paid out yet
        paid_out_order_ids = set()
        existing_payouts = await self.db.payouts.find({
            "farmer_id": farmer_id,
            "status": {"$in": ["completed", "processing"]}
        }).to_list(1000)
        
        for payout in existing_payouts:
            for order in payout.get("orders", []):
                paid_out_order_ids.add(order["order_id"])
        
        # Calculate earnings from unpaid orders
        total_earnings = 0.0
        payout_orders = []
        
        for order in completed_orders:
            if order["_id"] in paid_out_order_ids:
                continue
            
            # Calculate farmer's share from this order
            farmer_items_total = 0.0
            for item in order.get("items", []):
                if item["farmer_id"] == farmer_id:
                    farmer_items_total += item["subtotal"]
            
            if farmer_items_total > 0:
                total_earnings += farmer_items_total
                payout_orders.append({
                    "order_id": order["_id"],
                    "order_number": order["order_number"],
                    "amount": farmer_items_total,
                    "date": order["completed_at"]
                })
        
        # Check if there are earnings to pay out
        if total_earnings <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No earnings available for payout"
            )
        
        # Set minimum payout threshold (e.g., ₱100)
        min_payout = 100.0
        if total_earnings < min_payout:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum payout amount is ₱{min_payout}. Current earnings: ₱{total_earnings:.2f}"
            )
        
        # Create payout request
        # Determine period based on first and last order
        period_start = min(order["date"] for order in payout_orders)
        period_end = max(order["date"] for order in payout_orders)
        
        payout = Payout(
            _id=generate_uuid(),
            farmer_id=farmer_id,
            period={"start": period_start, "end": period_end},
            orders=payout_orders,
            amount=round(total_earnings, 2),
            method=payout_data.method,
            destination=payout_data.destination,
            status="pending",
            notes=f"Payout request for {len(payout_orders)} orders"
        )
        
        await self.db.payouts.insert_one(payout.model_dump(by_alias=True))
        
        return payout
    
    async def get_farmer_payouts(
        self,
        farmer_id: str,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Payout], int]:
        """Get farmer's payout history"""
        query = {"farmer_id": farmer_id}
        
        # Get total count
        total = await self.db.payouts.count_documents(query)
        
        # Get payouts
        skip = (page - 1) * limit
        payouts = await self.db.payouts.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        return [Payout(**p) for p in payouts], total
    
    async def get_all_payouts(
        self,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Payout], int]:
        """Get all payouts (admin only)"""
        query = {}
        if status_filter:
            query["status"] = status_filter
        
        # Get total count
        total = await self.db.payouts.count_documents(query)
        
        # Get payouts
        skip = (page - 1) * limit
        payouts = await self.db.payouts.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        return [Payout(**p) for p in payouts], total
    
    async def process_payout(
        self,
        payout_id: str,
        admin_id: str,
        process_data: PayoutProcess
    ) -> Payout:
        """Process payout (admin only)"""
        # Get payout
        payout_dict = await self.db.payouts.find_one({"_id": payout_id})
        if not payout_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payout not found"
            )
        
        payout = Payout(**payout_dict)
        
        # Check if already processed
        if payout.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payout already {payout.status}"
            )
        
        # Update to processing
        await self.db.payouts.update_one(
            {"_id": payout_id},
            {
                "$set": {
                    "status": "processing",
                    "processed_by": admin_id,
                    "updated_at": utc_now()
                }
            }
        )
        
        try:
            # Process payout with provider
            payout_reference, provider_data = await self.provider.process_payout(
                amount=payout.amount,
                destination=payout.destination,
                metadata={
                    "farmer_id": payout.farmer_id,
                    "orders_count": len(payout.orders)
                }
            )
            
            # Update payout to completed
            await self.db.payouts.update_one(
                {"_id": payout_id},
                {
                    "$set": {
                        "status": "completed",
                        "provider_reference": payout_reference,
                        "notes": process_data.notes or payout.notes,
                        "completed_at": utc_now(),
                        "updated_at": utc_now()
                    }
                }
            )
            
            # Update farmer stats
            await self.db.farmer_profiles.update_one(
                {"user_id": payout.farmer_id},
                {"$inc": {"stats.total_sales": payout.amount}}
            )
            
        except Exception as e:
            # Mark as failed
            await self.db.payouts.update_one(
                {"_id": payout_id},
                {
                    "$set": {
                        "status": "failed",
                        "notes": f"Payout failed: {str(e)}",
                        "updated_at": utc_now()
                    }
                }
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Payout processing failed: {str(e)}"
            )
        
        # Return updated payout
        updated_payout = await self.db.payouts.find_one({"_id": payout_id})
        return Payout(**updated_payout)
    
    async def get_payout(
        self,
        payout_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Payout]:
        """Get payout by ID"""
        payout_dict = await self.db.payouts.find_one({"_id": payout_id})
        
        if not payout_dict:
            return None
        
        # Verify access if user_id provided
        if user_id and payout_dict["farmer_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return Payout(**payout_dict)
    
    async def get_pending_earnings(self, farmer_id: str) -> dict:
        """Get farmer's pending earnings summary"""
        # Get completed orders not yet paid out
        completed_orders = await self.db.orders.find({
            "items.farmer_id": farmer_id,
            "status": "completed",
            "payment_id": {"$ne": None}
        }).to_list(1000)
        
        # Get paid out order IDs
        paid_out_order_ids = set()
        existing_payouts = await self.db.payouts.find({
            "farmer_id": farmer_id,
            "status": {"$in": ["completed", "processing"]}
        }).to_list(1000)
        
        for payout in existing_payouts:
            for order in payout.get("orders", []):
                paid_out_order_ids.add(order["order_id"])
        
        # Calculate pending earnings
        pending_earnings = 0.0
        pending_orders_count = 0
        
        for order in completed_orders:
            if order["_id"] in paid_out_order_ids:
                continue
            
            for item in order.get("items", []):
                if item["farmer_id"] == farmer_id:
                    pending_earnings += item["subtotal"]
                    pending_orders_count += 1
                    break  # Count order once
        
        return {
            "pending_earnings": round(pending_earnings, 2),
            "pending_orders_count": pending_orders_count,
            "can_request_payout": pending_earnings >= 100.0
        }
