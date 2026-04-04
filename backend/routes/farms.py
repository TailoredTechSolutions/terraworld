from fastapi import APIRouter, HTTPException
from typing import List
from models import Farm, FarmCreate, Product
from database import db

router = APIRouter()


@router.get("/farms", response_model=List[Farm])
async def get_farms(
    category: str = None,
    organic_certified: bool = None,
    delivery_available: bool = None,
    municipality: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 50
):
    query = {}
    if category:
        query["categories"] = category
    if organic_certified is not None:
        query["organic_certified"] = organic_certified
    if delivery_available is not None:
        query["delivery_available"] = delivery_available
    if municipality:
        query["municipality"] = municipality
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    farms = await db.farms.find(query).skip(skip).limit(limit).to_list(limit)
    return [Farm(**f) for f in farms]


@router.get("/farms/{farm_id}", response_model=Farm)
async def get_farm(farm_id: str):
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return Farm(**farm)


@router.post("/farms", response_model=Farm)
async def create_farm(farm: FarmCreate):
    farm_obj = Farm(**farm.dict())
    await db.farms.insert_one(farm_obj.dict())
    return farm_obj


@router.get("/farms/{farm_id}/products", response_model=List[Product])
async def get_farm_products(farm_id: str):
    products = await db.products.find({"farm_id": farm_id}).to_list(100)
    return [Product(**p) for p in products]
