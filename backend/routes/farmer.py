from fastapi import APIRouter, HTTPException
from typing import List
from models import Product, FarmerProductCreate, ProductUpdate, Farm
from database import db
from datetime import datetime

router = APIRouter()


@router.get("/farmer/{farm_id}/stats")
async def get_farmer_stats(farm_id: str):
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    product_count = await db.products.count_documents({"farm_id": farm_id})

    order_pipeline = [
        {"$unwind": "$items"},
        {"$match": {"items.farm_name": farm.get("name", "")}},
        {"$group": {
            "_id": None,
            "total_orders": {"$sum": 1},
            "total_revenue": {"$sum": "$items.subtotal"}
        }}
    ]
    order_result = await db.orders.aggregate(order_pipeline).to_list(1)
    total_orders = order_result[0]["total_orders"] if order_result else 0
    total_revenue = order_result[0]["total_revenue"] if order_result else 0

    farm.pop("_id", None)

    return {
        "farm": Farm(**farm),
        "product_count": product_count,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
    }


@router.get("/farmer/{farm_id}/products", response_model=List[Product])
async def get_farmer_products(farm_id: str):
    products = await db.products.find({"farm_id": farm_id}).to_list(100)
    return [Product(**p) for p in products]


@router.post("/farmer/{farm_id}/products", response_model=Product)
async def add_farmer_product(farm_id: str, product: FarmerProductCreate):
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    product_obj = Product(
        farm_id=farm_id,
        farm_name=farm["name"],
        **product.dict()
    )
    await db.products.insert_one(product_obj.dict())
    return product_obj


@router.put("/farmer/{farm_id}/products/{product_id}", response_model=Product)
async def update_farmer_product(farm_id: str, product_id: str, product_update: ProductUpdate):
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.utcnow()
    result = await db.products.update_one(
        {"id": product_id, "farm_id": farm_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    product = await db.products.find_one({"id": product_id})
    return Product(**product)


@router.delete("/farmer/{farm_id}/products/{product_id}")
async def delete_farmer_product(farm_id: str, product_id: str):
    result = await db.products.delete_one({"id": product_id, "farm_id": farm_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


@router.get("/farmer/{farm_id}/orders")
async def get_farmer_orders(farm_id: str):
    farm = await db.farms.find_one({"id": farm_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    farm_name = farm["name"]
    orders = await db.orders.find({
        "items": {"$elemMatch": {"farm_name": farm_name}}
    }).sort("created_at", -1).to_list(100)

    farmer_orders = []
    for order in orders:
        farm_items = [item for item in order["items"] if item["farm_name"] == farm_name]
        farm_subtotal = sum(item["subtotal"] for item in farm_items)
        farmer_orders.append({
            "order_id": order["id"],
            "order_status": order["order_status"],
            "created_at": order.get("created_at", ""),
            "items": farm_items,
            "farm_subtotal": farm_subtotal,
            "delivery_address": order.get("delivery_address", {}),
        })

    return farmer_orders
