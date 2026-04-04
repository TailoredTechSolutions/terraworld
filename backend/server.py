from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'terra_farming')]

# Create the main app without a prefix
app = FastAPI(title="Terra Farming API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


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


# ==================== MODELS ====================

# Product Models
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


# Farm Models
class Farm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    owner: str
    latitude: float
    longitude: float
    rating: float = 0.0
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
    delivery_available: bool = False
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
    delivery_available: bool = False
    organic_certified: bool = False


# Cart Models
class CartItem(BaseModel):
    product_id: str
    product_name: str
    farm_name: str
    price: float
    unit: str
    quantity: int
    image: str


class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Can be Supabase user ID or session ID for guests
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AddToCartRequest(BaseModel):
    user_id: str
    product_id: str
    quantity: int = 1


class UpdateCartItemRequest(BaseModel):
    quantity: int


# Order Models
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
    items: List[OrderItem]
    delivery_address: DeliveryAddress
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    order_status: OrderStatus = OrderStatus.PENDING
    subtotal: float
    delivery_fee: float
    total: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CreateOrderRequest(BaseModel):
    user_id: str
    delivery_address: DeliveryAddress
    payment_method: PaymentMethod
    notes: Optional[str] = None


# Category Model
class Category(BaseModel):
    id: str
    name: str
    icon: str


# ==================== ROUTES ====================

# Health Check
@api_router.get("/")
async def root():
    return {"message": "Terra Farming API", "version": "1.0.0", "status": "healthy"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


# ==================== PRODUCT ROUTES ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    farm_id: Optional[str] = None,
    organic: Optional[bool] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """Get all products with optional filters"""
    query = {}
    
    if category:
        query["category"] = category
    if farm_id:
        query["farm_id"] = farm_id
    if organic is not None:
        query["organic"] = organic
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    products = await db.products.find(query).skip(skip).limit(limit).to_list(limit)
    return [Product(**product) for product in products]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)


@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    """Create a new product"""
    product_obj = Product(**product.dict())
    await db.products.insert_one(product_obj.dict())
    return product_obj


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """Update a product"""
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


# ==================== FARM ROUTES ====================

@api_router.get("/farms", response_model=List[Farm])
async def get_farms(
    category: Optional[str] = None,
    organic_certified: Optional[bool] = None,
    delivery_available: Optional[bool] = None,
    municipality: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all farms with optional filters"""
    query = {}
    
    if category:
        query["categories"] = category
    if organic_certified is not None:
        query["organic_certified"] = organic_certified
    if delivery_available is not None:
        query["delivery_available"] = delivery_available
    if municipality:
        query["municipality"] = {"$regex": municipality, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"owner": {"$regex": search, "$options": "i"}}
        ]
    
    farms = await db.farms.find(query).skip(skip).limit(limit).to_list(limit)
    return [Farm(**farm) for farm in farms]


@api_router.get("/farms/{farm_id}", response_model=Farm)
async def get_farm(farm_id: str):
    """Get a single farm by ID"""
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return Farm(**farm)


@api_router.post("/farms", response_model=Farm)
async def create_farm(farm: FarmCreate):
    """Create a new farm"""
    farm_obj = Farm(**farm.dict())
    await db.farms.insert_one(farm_obj.dict())
    return farm_obj


@api_router.get("/farms/{farm_id}/products", response_model=List[Product])
async def get_farm_products(farm_id: str):
    """Get all products from a specific farm"""
    products = await db.products.find({"farm_id": farm_id}).to_list(100)
    return [Product(**product) for product in products]


# ==================== CART ROUTES ====================

@api_router.get("/cart/{user_id}", response_model=Cart)
async def get_cart(user_id: str):
    """Get user's cart"""
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        # Create empty cart
        cart = Cart(user_id=user_id)
        await db.carts.insert_one(cart.dict())
        return cart
    return Cart(**cart)


@api_router.post("/cart/add", response_model=Cart)
async def add_to_cart(request: AddToCartRequest):
    """Add item to cart"""
    # Get product details
    product = await db.products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check stock
    if product["stock"] < request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": request.user_id})
    
    cart_item = CartItem(
        product_id=product["id"],
        product_name=product["name"],
        farm_name=product["farm_name"],
        price=product["price"],
        unit=product["unit"],
        quantity=request.quantity,
        image=product["image"]
    )
    
    if not cart:
        cart = Cart(user_id=request.user_id, items=[cart_item])
        await db.carts.insert_one(cart.dict())
    else:
        # Check if product already in cart
        items = cart.get("items", [])
        existing_item = next((item for item in items if item["product_id"] == request.product_id), None)
        
        if existing_item:
            # Update quantity
            existing_item["quantity"] += request.quantity
        else:
            items.append(cart_item.dict())
        
        await db.carts.update_one(
            {"user_id": request.user_id},
            {"$set": {"items": items, "updated_at": datetime.utcnow()}}
        )
    
    # Return updated cart
    cart = await db.carts.find_one({"user_id": request.user_id})
    return Cart(**cart)


@api_router.put("/cart/{user_id}/item/{product_id}", response_model=Cart)
async def update_cart_item(user_id: str, product_id: str, request: UpdateCartItemRequest):
    """Update cart item quantity"""
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get("items", [])
    item_found = False
    
    for item in items:
        if item["product_id"] == product_id:
            if request.quantity <= 0:
                items.remove(item)
            else:
                item["quantity"] = request.quantity
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    cart = await db.carts.find_one({"user_id": user_id})
    return Cart(**cart)


@api_router.delete("/cart/{user_id}/item/{product_id}", response_model=Cart)
async def remove_from_cart(user_id: str, product_id: str):
    """Remove item from cart"""
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [item for item in cart.get("items", []) if item["product_id"] != product_id]
    
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    cart = await db.carts.find_one({"user_id": user_id})
    return Cart(**cart)


@api_router.delete("/cart/{user_id}")
async def clear_cart(user_id: str):
    """Clear entire cart"""
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    return {"message": "Cart cleared successfully"}


# ==================== ORDER ROUTES ====================

@api_router.post("/orders", response_model=Order)
async def create_order(request: CreateOrderRequest):
    """Create a new order from cart"""
    # Get cart
    cart = await db.carts.find_one({"user_id": request.user_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate totals
    items = []
    subtotal = 0
    
    for cart_item in cart["items"]:
        # Verify product still exists and has stock
        product = await db.products.find_one({"id": cart_item["product_id"]})
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {cart_item['product_name']} no longer available")
        if product["stock"] < cart_item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {cart_item['product_name']}")
        
        item_subtotal = cart_item["price"] * cart_item["quantity"]
        order_item = OrderItem(
            product_id=cart_item["product_id"],
            product_name=cart_item["product_name"],
            farm_name=cart_item["farm_name"],
            price=cart_item["price"],
            unit=cart_item["unit"],
            quantity=cart_item["quantity"],
            subtotal=item_subtotal,
            image=cart_item["image"]
        )
        items.append(order_item)
        subtotal += item_subtotal
    
    # Calculate delivery fee (simple: flat rate or based on subtotal)
    delivery_fee = 50.0 if subtotal < 500 else 0.0  # Free delivery for orders >= 500
    total = subtotal + delivery_fee
    
    # Create order
    order = Order(
        user_id=request.user_id,
        items=[item.dict() for item in items],
        delivery_address=request.delivery_address,
        payment_method=request.payment_method,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        notes=request.notes
    )
    
    await db.orders.insert_one(order.dict())
    
    # Update product stock
    for item in items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": request.user_id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    
    return order


@api_router.get("/orders/{user_id}", response_model=List[Order])
async def get_user_orders(user_id: str, skip: int = 0, limit: int = 50):
    """Get all orders for a user"""
    orders = await db.orders.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Order(**order) for order in orders]


@api_router.get("/orders/detail/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get a single order by ID"""
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)


@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus):
    """Update order status (admin/driver use)"""
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": status, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated", "status": status}


@api_router.put("/orders/{order_id}/cancel")
async def cancel_order(order_id: str):
    """Cancel an order"""
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order["order_status"] not in ["pending", "confirmed"]:
        raise HTTPException(status_code=400, detail="Cannot cancel order in current status")
    
    # Restore stock
    for item in order["items"]:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"stock": item["quantity"]}}
        )
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": OrderStatus.CANCELLED, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Order cancelled successfully"}


# ==================== CATEGORIES ROUTE ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all product categories"""
    return [
        Category(id="vegetables", name="Vegetables", icon="Leaf"),
        Category(id="fruits", name="Fruits", icon="Apple"),
        Category(id="dairy", name="Dairy & Eggs", icon="Egg"),
        Category(id="pantry", name="Pantry", icon="Package"),
    ]


# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Get admin dashboard statistics"""
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    total_products = await db.products.count_documents({})
    total_farms = await db.farms.count_documents({})
    
    # Calculate revenue
    revenue_pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get recent orders
    recent_orders = await db.orders.find().sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_products": total_products,
        "total_farms": total_farms,
        "total_revenue": total_revenue,
        "recent_orders": [Order(**order) for order in recent_orders]
    }


@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all orders for admin"""
    query = {}
    if status:
        query["order_status"] = status
    
    orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Order(**order) for order in orders]


@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, status: OrderStatus):
    """Admin update order status"""
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": status, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated", "status": status}


# ==================== FARMER ROUTES ====================

@api_router.get("/farmer/{farm_id}/stats")
async def get_farmer_stats(farm_id: str):
    """Get farmer dashboard statistics"""
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    # Get product count
    product_count = await db.products.count_documents({"farm_id": farm_id})
    
    # Get orders containing this farm's products
    orders_pipeline = [
        {"$match": {"items.farm_name": farm["name"]}},
        {"$group": {
            "_id": None,
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": {
                "$reduce": {
                    "input": {"$filter": {
                        "input": "$items",
                        "cond": {"$eq": ["$$this.farm_name", farm["name"]]}
                    }},
                    "initialValue": 0,
                    "in": {"$add": ["$$value", "$$this.subtotal"]}
                }
            }}
        }}
    ]
    order_stats = await db.orders.aggregate(orders_pipeline).to_list(1)
    
    stats = order_stats[0] if order_stats else {"total_orders": 0, "total_revenue": 0}
    
    return {
        "farm": Farm(**farm),
        "product_count": product_count,
        "total_orders": stats.get("total_orders", 0),
        "total_revenue": stats.get("total_revenue", 0),
    }


@api_router.get("/farmer/{farm_id}/products", response_model=List[Product])
async def get_farmer_products(farm_id: str):
    """Get all products for a specific farm"""
    products = await db.products.find({"farm_id": farm_id}).to_list(100)
    return [Product(**product) for product in products]


@api_router.post("/farmer/{farm_id}/products", response_model=Product)
async def add_farmer_product(farm_id: str, product: FarmerProductCreate):
    """Add a new product for a farm"""
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    product_obj = Product(
        **product.dict(),
        farm_id=farm_id,
        farm_name=farm["name"]
    )
    await db.products.insert_one(product_obj.dict())
    return product_obj


@api_router.put("/farmer/{farm_id}/products/{product_id}", response_model=Product)
async def update_farmer_product(farm_id: str, product_id: str, product_update: ProductUpdate):
    """Update a farmer's product"""
    existing = await db.products.find_one({"id": product_id, "farm_id": farm_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found or doesn't belong to this farm")
    
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    product = await db.products.find_one({"id": product_id})
    return Product(**product)


@api_router.delete("/farmer/{farm_id}/products/{product_id}")
async def delete_farmer_product(farm_id: str, product_id: str):
    """Delete a farmer's product"""
    result = await db.products.delete_one({"id": product_id, "farm_id": farm_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or doesn't belong to this farm")
    return {"message": "Product deleted successfully"}


@api_router.get("/farmer/{farm_id}/orders")
async def get_farmer_orders(farm_id: str):
    """Get orders containing this farm's products"""
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    # Find orders with products from this farm
    orders = await db.orders.find(
        {"items.farm_name": farm["name"]}
    ).sort("created_at", -1).to_list(100)
    
    # Filter items to only show this farm's products
    farm_orders = []
    for order in orders:
        farm_items = [item for item in order["items"] if item["farm_name"] == farm["name"]]
        farm_subtotal = sum(item["subtotal"] for item in farm_items)
        farm_orders.append({
            "order_id": order["id"],
            "order_status": order["order_status"],
            "created_at": order["created_at"],
            "items": farm_items,
            "farm_subtotal": farm_subtotal,
            "delivery_address": order["delivery_address"],
        })
    
    return farm_orders


# ==================== DATA SEEDING ====================

@api_router.post("/seed")
async def seed_database():
    """Seed database with initial data (run once)"""
    # Check if already seeded
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Database already seeded", "products": existing_products}
    
    # Import seed data
    from seed_data import SEED_PRODUCTS, SEED_FARMS
    
    # Insert farms
    for farm_data in SEED_FARMS:
        farm = Farm(**farm_data)
        await db.farms.insert_one(farm.dict())
    
    # Insert products
    for product_data in SEED_PRODUCTS:
        product = Product(**product_data)
        await db.products.insert_one(product.dict())
    
    return {
        "message": "Database seeded successfully",
        "farms": len(SEED_FARMS),
        "products": len(SEED_PRODUCTS)
    }


# Include the router in the main app
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    """Initialize database indexes on startup"""
    # Create indexes for better query performance
    await db.products.create_index("id", unique=True)
    await db.products.create_index("farm_id")
    await db.products.create_index("category")
    await db.products.create_index([("name", "text"), ("description", "text")])
    
    await db.farms.create_index("id", unique=True)
    await db.farms.create_index("categories")
    await db.farms.create_index([("name", "text"), ("description", "text")])
    
    await db.carts.create_index("user_id", unique=True)
    
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("user_id")
    await db.orders.create_index("created_at")
    
    logger.info("Database indexes created")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
