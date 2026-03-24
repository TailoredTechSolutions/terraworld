"""
Seed script to populate initial data
Run this script to add categories and test data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv
import os
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.helpers import generate_uuid, utc_now

# Load environment
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')


async def seed_categories():
    """Seed categories"""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connected to {db_name}")
    
    # Check if categories already exist
    count = await db.categories.count_documents({})
    if count > 0:
        print(f"Categories already exist ({count} found). Skipping seed.")
        client.close()
        return
    
    categories = [
        {
            "_id": generate_uuid(),
            "name": "Vegetables",
            "slug": "vegetables",
            "parent_id": None,
            "description": "Fresh vegetables from local farms",
            "icon_url": None,
            "image_url": None,
            "order": 1,
            "status": "active",
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "name": "Fruits",
            "slug": "fruits",
            "parent_id": None,
            "description": "Fresh fruits from local farms",
            "icon_url": None,
            "image_url": None,
            "order": 2,
            "status": "active",
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "name": "Dairy & Eggs",
            "slug": "dairy-eggs",
            "parent_id": None,
            "description": "Fresh dairy products and eggs",
            "icon_url": None,
            "image_url": None,
            "order": 3,
            "status": "active",
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "name": "Meat & Poultry",
            "slug": "meat-poultry",
            "parent_id": None,
            "description": "Fresh meat and poultry",
            "icon_url": None,
            "image_url": None,
            "order": 4,
            "status": "active",
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "name": "Rice & Grains",
            "slug": "rice-grains",
            "parent_id": None,
            "description": "Rice, grains, and cereals",
            "icon_url": None,
            "image_url": None,
            "order": 5,
            "status": "active",
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "name": "Herbs & Spices",
            "slug": "herbs-spices",
            "parent_id": None,
            "description": "Fresh herbs and spices",
            "icon_url": None,
            "image_url": None,
            "order": 6,
            "status": "active",
            "created_at": utc_now(),
            "updated_at": utc_now()
        }
    ]
    
    result = await db.categories.insert_many(categories)
    print(f"Inserted {len(result.inserted_ids)} categories")
    
    client.close()
    print("Seed completed!")


async def seed_system_config():
    """Seed system configuration"""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if config already exists
    count = await db.system_config.count_documents({})
    if count > 0:
        print(f"System config already exists ({count} found). Skipping seed.")
        client.close()
        return
    
    configs = [
        {
            "_id": generate_uuid(),
            "key": "platform_fee_rate",
            "value": 0.05,
            "type": "float",
            "description": "Platform fee percentage (5%)",
            "category": "pricing",
            "editable": True,
            "updated_by": None,
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "key": "tax_rate",
            "value": 0.08,
            "type": "float",
            "description": "Tax/VAT rate (8%)",
            "category": "pricing",
            "editable": True,
            "updated_by": None,
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "key": "logistics_base_fee",
            "value": 50.0,
            "type": "float",
            "description": "Base delivery fee (PHP)",
            "category": "logistics",
            "editable": True,
            "updated_by": None,
            "created_at": utc_now(),
            "updated_at": utc_now()
        },
        {
            "_id": generate_uuid(),
            "key": "mlm_enabled",
            "value": True,
            "type": "boolean",
            "description": "Enable MLM/referral system",
            "category": "features",
            "editable": True,
            "updated_by": None,
            "created_at": utc_now(),
            "updated_at": utc_now()
        }
    ]
    
    result = await db.system_config.insert_many(configs)
    print(f"Inserted {len(result.inserted_ids)} system configs")
    
    client.close()


async def main():
    """Run all seed functions"""
    print("Starting seed process...")
    await seed_categories()
    await seed_system_config()
    print("All seeds completed!")


if __name__ == "__main__":
    asyncio.run(main())
