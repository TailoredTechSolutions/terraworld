from fastapi import APIRouter, HTTPException
from typing import List
from models import Order, OrderStatus
from database import db

router = APIRouter()


@router.get("/admin/stats")
async def get_admin_stats():
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    total_products = await db.products.count_documents({})
    total_farms = await db.farms.count_documents({})

    revenue_pipeline = [
        {"$match": {"order_status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    recent_orders = await db.orders.find().sort("created_at", -1).limit(10).to_list(10)
    for order in recent_orders:
        order.pop("_id", None)

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_products": total_products,
        "total_farms": total_farms,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders,
    }


@router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(
    status: str = None,
    skip: int = 0,
    limit: int = 50,
):
    query = {}
    if status:
        query["order_status"] = status
    orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Order(**order) for order in orders]


@router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(order_id: str, status: OrderStatus):
    from email_service import notify_order_update
    import asyncio

    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": status, "updated_at": __import__('datetime').datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    order = await db.orders.find_one({"id": order_id})
    if order:
        asyncio.create_task(notify_order_update(order_id, order["user_id"], status, f"Order status updated to {status}"))

    return {"message": "Order status updated", "status": status}
