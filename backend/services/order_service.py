from typing import List, Tuple, Optional
from models.order import (
    Order, OrderCreate, OrderItem, OrderStatus,
    PricingBreakdown, OrderFilter
)
from services.pricing_service import PricingService
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now, generate_order_number
from fastapi import HTTPException, status


class OrderService:
    """Order management service"""
    
    def __init__(self):
        self.db = get_database()
        self.pricing_service = PricingService()
    
    async def create_order(self, user_id: str, order_data: OrderCreate) -> Order:
        """Create order from cart"""
        # Get user's cart
        cart = await self.db.carts.find_one({"user_id": user_id})
        if not cart or not cart.get("items"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Get delivery address
        address = await self.db.addresses.find_one({
            "_id": order_data.delivery_address_id,
            "user_id": user_id
        })
        
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery address not found"
            )
        
        # Build order items and validate stock
        order_items = []
        farmers_affected = set()
        
        for cart_item in cart["items"]:
            # Get product
            product = await self.db.products.find_one({
                "_id": cart_item["product_id"],
                "deleted_at": None
            })
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {cart_item['product_id']} not found"
                )
            
            # Check availability
            if product.get("availability", {}).get("status") != "in_stock":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product['name']} is not available"
                )
            
            # Check stock
            if product["stock_quantity"] < cart_item["quantity"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product['name']}. Only {product['stock_quantity']} available"
                )
            
            # Create order item
            order_item = OrderItem(
                product_id=product["_id"],
                farmer_id=product["farmer_id"],
                product_name=product["name"],
                quantity=cart_item["quantity"],
                unit=product["unit"],
                unit_price=product["base_price"],  # Use current price, not cart snapshot
                subtotal=round(product["base_price"] * cart_item["quantity"], 2)
            )
            
            order_items.append(order_item)
            farmers_affected.add(product["farmer_id"])
        
        # Calculate pricing
        subtotal = sum(item.subtotal for item in order_items)
        pricing = await self.pricing_service.calculate_order_pricing(
            subtotal,
            address
        )
        
        # Create order
        order_number = generate_order_number()
        
        # Build delivery window if provided
        delivery_window = None
        if order_data.delivery_window_start and order_data.delivery_window_end:
            delivery_window = {
                "start": order_data.delivery_window_start,
                "end": order_data.delivery_window_end
            }
        
        # Create address snapshot (exclude id and user_id)
        address_snapshot = {
            "contact_name": address["contact_name"],
            "contact_phone": address["contact_phone"],
            "street_address": address["street_address"],
            "barangay": address["barangay"],
            "city": address["city"],
            "province": address["province"],
            "postal_code": address["postal_code"],
            "country": address.get("country", "PH"),
            "coordinates": address.get("coordinates")
        }
        
        order = Order(
            _id=generate_uuid(),
            order_number=order_number,
            buyer_id=user_id,
            items=[item.model_dump() for item in order_items],
            pricing=pricing.model_dump(),
            delivery_address=address_snapshot,
            delivery_instructions=order_data.delivery_instructions,
            delivery_window=delivery_window,
            status="pending",
            status_history=[
                OrderStatus(
                    status="pending",
                    note="Order created"
                ).model_dump()
            ],
            notes={
                "buyer_notes": order_data.buyer_notes,
                "admin_notes": None
            },
            metadata={
                "source": "mobile",
                "ip_address": None
            }
        )
        
        # Insert order
        await self.db.orders.insert_one(order.model_dump(by_alias=True))
        
        # Reserve stock for all products
        for item in order_items:
            await self.db.products.update_one(
                {"_id": item.product_id},
                {"$inc": {"stock_quantity": -item.quantity}}
            )
        
        # Clear cart
        await self.db.carts.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "items": [],
                    "totals": {"subtotal": 0.0, "items_count": 0},
                    "updated_at": utc_now()
                }
            }
        )
        
        # TODO: Create notification for buyer
        # TODO: Create notifications for farmers
        # TODO: Trigger payment processing
        
        return order
    
    async def get_user_orders(
        self,
        user_id: str,
        filters: OrderFilter
    ) -> Tuple[List[Order], int]:
        """Get user's orders with filters"""
        query = {"buyer_id": user_id}
        
        if filters.status:
            query["status"] = filters.status
        
        # Get total count
        total = await self.db.orders.count_documents(query)
        
        # Get orders
        skip = (filters.page - 1) * filters.limit
        orders = await self.db.orders.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(filters.limit)\
            .to_list(filters.limit)
        
        return [Order(**o) for o in orders], total
    
    async def get_farmer_orders(
        self,
        farmer_id: str,
        filters: OrderFilter
    ) -> Tuple[List[Order], int]:
        """Get orders for a farmer"""
        query = {"items.farmer_id": farmer_id}
        
        if filters.status:
            query["status"] = filters.status
        
        # Get total count
        total = await self.db.orders.count_documents(query)
        
        # Get orders
        skip = (filters.page - 1) * filters.limit
        orders = await self.db.orders.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(filters.limit)\
            .to_list(filters.limit)
        
        return [Order(**o) for o in orders], total
    
    async def get_order(self, order_id: str, user_id: Optional[str] = None) -> Optional[Order]:
        """Get order by ID"""
        query = {"_id": order_id}
        
        # If user_id provided, ensure they have access
        if user_id:
            order = await self.db.orders.find_one(query)
            if not order:
                return None
            
            # Check if user is buyer or farmer
            if order["buyer_id"] != user_id:
                # Check if user is a farmer for this order
                farmer_ids = [item["farmer_id"] for item in order.get("items", [])]
                if user_id not in farmer_ids:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You don't have access to this order"
                    )
        else:
            order = await self.db.orders.find_one(query)
        
        if order:
            return Order(**order)
        return None
    
    async def update_order_status(
        self,
        order_id: str,
        new_status: str,
        note: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Order:
        """Update order status"""
        # Get order
        order = await self.db.orders.find_one({"_id": order_id})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        current_status = order["status"]
        
        # Validate status transition
        valid_transitions = {
            "pending": ["confirmed", "cancelled"],
            "confirmed": ["preparing", "cancelled"],
            "preparing": ["pickup_assigned"],
            "pickup_assigned": ["picked_up", "cancelled"],
            "picked_up": ["in_transit"],
            "in_transit": ["delivered"],
            "delivered": ["completed"],
            "completed": [],
            "cancelled": [],
            "disputed": ["refunded", "completed"],
            "refunded": []
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from {current_status} to {new_status}"
            )
        
        # Create status history entry
        status_entry = OrderStatus(
            status=new_status,
            note=note
        )
        
        # Update fields
        update_fields = {
            "status": new_status,
            "updated_at": utc_now()
        }
        
        if new_status == "cancelled":
            update_fields["cancelled_at"] = utc_now()
            # Restore stock
            for item in order.get("items", []):
                await self.db.products.update_one(
                    {"_id": item["product_id"]},
                    {"$inc": {"stock_quantity": item["quantity"]}}
                )
        
        if new_status == "completed":
            update_fields["completed_at"] = utc_now()
            # Update product stats
            for item in order.get("items", []):
                await self.db.products.update_one(
                    {"_id": item["product_id"]},
                    {"$inc": {"stats.orders": 1}}
                )
        
        # Update order
        await self.db.orders.update_one(
            {"_id": order_id},
            {
                "$set": update_fields,
                "$push": {"status_history": status_entry.model_dump()}
            }
        )
        
        # TODO: Send notification to buyer
        # TODO: Send notifications to farmers if relevant
        
        # Return updated order
        updated_order = await self.db.orders.find_one({"_id": order_id})
        return Order(**updated_order)
    
    async def cancel_order(self, order_id: str, user_id: str, reason: Optional[str] = None) -> Order:
        """Cancel order (buyer only, before pickup)"""
        order = await self.db.orders.find_one({"_id": order_id})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if user is buyer
        if order["buyer_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only buyer can cancel order"
            )
        
        # Check if order can be cancelled
        cancellable_statuses = ["pending", "confirmed", "preparing"]
        if order["status"] not in cancellable_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be cancelled. Current status: {order['status']}"
            )
        
        return await self.update_order_status(
            order_id,
            "cancelled",
            note=reason or "Cancelled by buyer",
            user_id=user_id
        )
