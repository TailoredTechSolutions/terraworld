from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
import logging

from database import db, client
from models import Category, Farm, Product
from websocket_manager import manager

# Route modules
from routes import products, farms, cart, orders, payments, notifications
from routes import drivers, reviews, coupons, analytics, admin, farmer, emails, uploads

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Terra Farming API", version="2.0.0")

# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STATIC FILES (uploads) ====================
upload_dir = Path(__file__).parent / "uploads"
upload_dir.mkdir(exist_ok=True)
app.mount("/api/files", StaticFiles(directory=str(upload_dir)), name="uploads")

# ==================== INCLUDE ROUTERS ====================
PREFIX = "/api"

app.include_router(products.router, prefix=PREFIX, tags=["Products"])
app.include_router(farms.router, prefix=PREFIX, tags=["Farms"])
app.include_router(cart.router, prefix=PREFIX, tags=["Cart"])
app.include_router(orders.router, prefix=PREFIX, tags=["Orders"])
app.include_router(payments.router, prefix=PREFIX, tags=["Payments"])
app.include_router(notifications.router, prefix=PREFIX, tags=["Notifications"])
app.include_router(drivers.router, prefix=PREFIX, tags=["Drivers"])
app.include_router(reviews.router, prefix=PREFIX, tags=["Reviews"])
app.include_router(coupons.router, prefix=PREFIX, tags=["Coupons"])
app.include_router(analytics.router, prefix=PREFIX, tags=["Analytics"])
app.include_router(admin.router, prefix=PREFIX, tags=["Admin"])
app.include_router(farmer.router, prefix=PREFIX, tags=["Farmer"])
app.include_router(emails.router, prefix=PREFIX, tags=["Emails"])
app.include_router(uploads.router, prefix=PREFIX, tags=["Uploads"])


# ==================== ROOT & HEALTH ====================

@app.get("/api")
async def root():
    return {"message": "Terra Farming API", "version": "2.0.0", "status": "healthy"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


# ==================== CATEGORIES ====================

@app.get("/api/categories")
async def get_categories():
    return [
        {"id": "vegetables", "name": "Vegetables", "icon": "Leaf"},
        {"id": "fruits", "name": "Fruits", "icon": "Apple"},
        {"id": "dairy", "name": "Dairy & Eggs", "icon": "Egg"},
        {"id": "pantry", "name": "Pantry", "icon": "Package"},
    ]


# ==================== WEBSOCKET ====================

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            import json
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except Exception:
        manager.disconnect(websocket, user_id)


# ==================== SEED DATA ====================

@app.post("/api/seed")
async def seed_database():
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Database already seeded", "products": existing_products}

    from seed_data import SEED_PRODUCTS, SEED_FARMS

    for farm_data in SEED_FARMS:
        farm = Farm(**farm_data)
        await db.farms.insert_one(farm.dict())

    for product_data in SEED_PRODUCTS:
        product = Product(**product_data)
        await db.products.insert_one(product.dict())

    return {
        "message": "Database seeded successfully",
        "farms": len(SEED_FARMS),
        "products": len(SEED_PRODUCTS)
    }


# ==================== STARTUP / SHUTDOWN ====================

@app.on_event("startup")
async def startup_db_client():
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

    await db.payments.create_index("id", unique=True)
    await db.payments.create_index("order_id")

    await db.notifications.create_index("id", unique=True)
    await db.notifications.create_index("user_id")
    await db.notifications.create_index([("user_id", 1), ("is_read", 1)])

    await db.drivers.create_index("id", unique=True)
    await db.drivers.create_index("user_id", unique=True)

    await db.deliveries.create_index("id", unique=True)
    await db.deliveries.create_index("order_id")
    await db.deliveries.create_index("driver_id")

    await db.reviews.create_index("id", unique=True)
    await db.reviews.create_index("product_id")
    await db.reviews.create_index("farm_id")
    await db.reviews.create_index("user_id")

    await db.coupons.create_index("id", unique=True)
    await db.coupons.create_index("code", unique=True)

    await db.emails.create_index("id", unique=True)
    await db.emails.create_index("to_email")

    logger.info("Database indexes created - Terra Farming API v2.0 ready")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
