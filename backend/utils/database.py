from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config.settings import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB"""
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGO_URL)
    db.db = db.client[settings.DB_NAME]
    logger.info(f"Connected to MongoDB database: {settings.DB_NAME}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    logger.info("Closing MongoDB connection...")
    db.client.close()
    logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.db
