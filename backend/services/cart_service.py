from typing import Optional
from models.order import Cart, CartItem, CartTotals, CartItemAdd, CartItemUpdate
from services.pricing_service import PricingService
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now
from fastapi import HTTPException, status


class CartService:
    """Cart management service"""
    
    def __init__(self):
        self.db = get_database()
        self.pricing_service = PricingService()
    
    async def get_or_create_cart(self, user_id: str) -> dict:
        """Get user's cart or create if doesn't exist"""
        cart_dict = await self.db.carts.find_one({"user_id": user_id})
        
        if not cart_dict:
            # Create new cart
            cart = Cart(
                _id=generate_uuid(),
                user_id=user_id,
                items=[],
                totals=CartTotals(subtotal=0.0, items_count=0)
            )
            await self.db.carts.insert_one(cart.model_dump(by_alias=True))
            cart_dict = cart.model_dump(by_alias=True)
        
        # Populate cart with product info
        return await self._populate_cart(cart_dict)
    
    async def add_item(self, user_id: str, item_data: CartItemAdd) -> dict:
        """Add item to cart or update quantity if exists"""
        # Get product
        product = await self.db.products.find_one({
            "_id": item_data.product_id,
            "deleted_at": None
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check if product is available
        if product.get("availability", {}).get("status") != "in_stock":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not available"
            )
        
        # Check stock
        if product["stock_quantity"] < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Only {product['stock_quantity']} available"
            )
        
        # Check min/max order quantity
        if item_data.quantity < product.get("min_order_quantity", 1):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum order quantity is {product.get('min_order_quantity', 1)}"
            )
        
        if product.get("max_order_quantity") and item_data.quantity > product["max_order_quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum order quantity is {product['max_order_quantity']}"
            )
        
        # Get or create cart
        cart_dict = await self.db.carts.find_one({"user_id": user_id})
        if not cart_dict:
            cart = Cart(
                _id=generate_uuid(),
                user_id=user_id,
                items=[],
                totals=CartTotals(subtotal=0.0, items_count=0)
            )
            await self.db.carts.insert_one(cart.model_dump(by_alias=True))
            cart_dict = cart.model_dump(by_alias=True)
        
        # Check if item already in cart
        existing_item = None
        items = cart_dict.get("items", [])
        
        for item in items:
            if item["product_id"] == item_data.product_id:
                existing_item = item
                break
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item["quantity"] + item_data.quantity
            
            # Check stock for new quantity
            if new_quantity > product["stock_quantity"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot add more. Stock limit: {product['stock_quantity']}"
                )
            
            await self.db.carts.update_one(
                {"user_id": user_id, "items.product_id": item_data.product_id},
                {"$set": {"items.$.quantity": new_quantity, "updated_at": utc_now()}}
            )
        else:
            # Add new item
            new_item = CartItem(
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                unit_price=product["base_price"]
            )
            
            await self.db.carts.update_one(
                {"user_id": user_id},
                {
                    "$push": {"items": new_item.model_dump()},
                    "$set": {"updated_at": utc_now()}
                }
            )
        
        # Recalculate totals
        await self._recalculate_totals(user_id)
        
        # Return updated cart
        return await self.get_or_create_cart(user_id)
    
    async def update_item(self, user_id: str, product_id: str, update_data: CartItemUpdate) -> dict:
        """Update item quantity in cart"""
        # Get product for validation
        product = await self.db.products.find_one({
            "_id": product_id,
            "deleted_at": None
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check stock
        if product["stock_quantity"] < update_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock. Only {product['stock_quantity']} available"
            )
        
        # Update item
        result = await self.db.carts.update_one(
            {"user_id": user_id, "items.product_id": product_id},
            {
                "$set": {
                    "items.$.quantity": update_data.quantity,
                    "updated_at": utc_now()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in cart"
            )
        
        # Recalculate totals
        await self._recalculate_totals(user_id)
        
        # Return updated cart
        return await self.get_or_create_cart(user_id)
    
    async def remove_item(self, user_id: str, product_id: str) -> dict:
        """Remove item from cart"""
        result = await self.db.carts.update_one(
            {"user_id": user_id},
            {
                "$pull": {"items": {"product_id": product_id}},
                "$set": {"updated_at": utc_now()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in cart"
            )
        
        # Recalculate totals
        await self._recalculate_totals(user_id)
        
        # Return updated cart
        return await self.get_or_create_cart(user_id)
    
    async def clear_cart(self, user_id: str) -> None:
        """Clear all items from cart"""
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
    
    async def _recalculate_totals(self, user_id: str) -> None:
        """Recalculate cart totals"""
        cart = await self.db.carts.find_one({"user_id": user_id})
        if not cart:
            return
        
        subtotal, items_count = self.pricing_service.calculate_cart_totals(cart.get("items", []))
        
        await self.db.carts.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "totals.subtotal": subtotal,
                    "totals.items_count": items_count,
                    "updated_at": utc_now()
                }
            }
        )
    
    async def _populate_cart(self, cart_dict: dict) -> dict:
        """Populate cart items with product information"""
        items = cart_dict.get("items", [])
        populated_items = []
        
        for item in items:
            # Get product
            product = await self.db.products.find_one({
                "_id": item["product_id"],
                "deleted_at": None
            })
            
            if product:
                # Get farmer info
                farmer = await self.db.farmer_profiles.find_one({"user_id": product["farmer_id"]})
                
                populated_item = {
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "unit_price": item["unit_price"],
                    "added_at": item["added_at"],
                    "product": {
                        "name": product["name"],
                        "slug": product["slug"],
                        "unit": product["unit"],
                        "current_price": product["base_price"],
                        "stock_quantity": product["stock_quantity"],
                        "images": product.get("images", []),
                        "availability": product.get("availability", {})
                    },
                    "farmer": {
                        "id": product["farmer_id"],
                        "farm_name": farmer.get("farm_name") if farmer else "Unknown Farm"
                    },
                    "subtotal": round(item["unit_price"] * item["quantity"], 2)
                }
                populated_items.append(populated_item)
        
        return {
            "_id": cart_dict["_id"],
            "user_id": cart_dict["user_id"],
            "items": populated_items,
            "totals": cart_dict.get("totals", {"subtotal": 0.0, "items_count": 0}),
            "updated_at": cart_dict["updated_at"]
        }
