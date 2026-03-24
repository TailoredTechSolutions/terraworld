from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Import configuration
from config.settings import settings

# Import database
from utils.database import connect_to_mongo, close_mongo_connection

# Import routes
from routes import auth, users, products, cart, orders, payments, payouts, driver, admin_deliveries, rewards, mlm

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    logger.info("Starting Terra Digital Platform API...")
    await connect_to_mongo()
    logger.info("API is ready!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()
    logger.info("Shutdown complete")


# Create the main app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Terra Digital Platform - Farm to Market API",
    lifespan=lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

@api_router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Terra Digital Platform API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

# Include route modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(products.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(orders.farmer_router)
api_router.include_router(payments.router)
api_router.include_router(payouts.router)
api_router.include_router(payouts.admin_router)
api_router.include_router(driver.router)
api_router.include_router(admin_deliveries.router)
api_router.include_router(rewards.router)
api_router.include_router(rewards.admin_router)
api_router.include_router(mlm.router)
api_router.include_router(mlm.admin_router)

# Include the API router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
