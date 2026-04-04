from fastapi import APIRouter, HTTPException
from typing import Optional
from models import Driver, DriverLocationUpdate, OrderStatus
from database import db
from email_service import notify_order_update
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/drivers/register")
async def register_driver(user_id: str, name: str, phone: str, vehicle_type: str, vehicle_plate: str):
    existing = await db.drivers.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Driver already registered")

    driver = Driver(
        user_id=user_id, name=name, phone=phone,
        vehicle_type=vehicle_type, vehicle_plate=vehicle_plate
    )
    await db.drivers.insert_one(driver.dict())
    return driver


@router.get("/drivers/available-deliveries")
async def get_available_deliveries():
    orders = await db.orders.find({"order_status": "confirmed"}).to_list(50)
    if not orders:
        return []

    # Batch fetch existing deliveries
    order_ids = [o["id"] for o in orders]
    existing_deliveries = await db.deliveries.find({"order_id": {"$in": order_ids}}).to_list(len(order_ids))
    assigned_order_ids = {d["order_id"] for d in existing_deliveries}

    deliveries = []
    for order in orders:
        if order["id"] not in assigned_order_ids:
            deliveries.append({
                "order_id": order["id"],
                "total": order["total"],
                "items_count": len(order["items"]),
                "customer_name": order.get("delivery_address", {}).get("full_name", "N/A"),
                "delivery_address": order.get("delivery_address", {}),
                "created_at": order.get("created_at", ""),
            })
    return deliveries


@router.get("/drivers/{driver_id}")
async def get_driver(driver_id: str):
    driver = await db.drivers.find_one({"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return Driver(**driver)


@router.get("/drivers/{driver_id}/stats")
async def get_driver_stats(driver_id: str):
    driver = await db.drivers.find_one({"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    total = await db.deliveries.count_documents({"driver_id": driver_id})
    active = await db.deliveries.count_documents({"driver_id": driver_id, "status": {"$in": ["assigned", "picked_up"]}})

    deliveries = await db.deliveries.find({"driver_id": driver_id, "status": "delivered"}).to_list(1000)
    total_earnings = 0
    if deliveries:
        # Batch fetch all orders for earnings calculation
        del_order_ids = [d["order_id"] for d in deliveries]
        orders_list = await db.orders.find({"id": {"$in": del_order_ids}}).to_list(len(del_order_ids))
        for order in orders_list:
            total_earnings += order["total"] * 0.15

    return {
        "driver": Driver(**driver),
        "total_deliveries": total,
        "active_deliveries": active,
        "total_earnings": total_earnings,
        "rating": driver.get("rating", 5.0),
    }


@router.get("/drivers/{driver_id}/deliveries")
async def get_driver_deliveries(driver_id: str, status: Optional[str] = None):
    query = {"driver_id": driver_id}
    if status:
        query["status"] = status

    deliveries = await db.deliveries.find(query).sort("created_at", -1).to_list(100)

    # Batch fetch all related orders
    order_ids = [d["order_id"] for d in deliveries]
    orders_list = await db.orders.find({"id": {"$in": order_ids}}).to_list(len(order_ids)) if order_ids else []
    orders_map = {o["id"]: o for o in orders_list}

    result = []
    for d in deliveries:
        d.pop("_id", None)
        order = orders_map.get(d["order_id"])
        if order:
            d["order"] = {
                "id": order["id"],
                "total": order["total"],
                "items_count": len(order["items"]),
                "customer_name": order.get("delivery_address", {}).get("full_name", "N/A"),
                "customer_phone": order.get("delivery_address", {}).get("phone", "N/A"),
                "delivery_address": order.get("delivery_address", {}),
            }
        result.append(d)
    return result


@router.post("/drivers/{driver_id}/accept-delivery/{order_id}")
async def accept_delivery(driver_id: str, order_id: str):
    driver = await db.drivers.find_one({"id": driver_id})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    existing = await db.deliveries.find_one({"order_id": order_id})
    if existing:
        raise HTTPException(status_code=400, detail="Delivery already assigned")

    delivery = {
        "id": str(uuid.uuid4()),
        "order_id": order_id,
        "driver_id": driver_id,
        "driver_name": driver["name"],
        "driver_phone": driver["phone"],
        "status": "assigned",
        "pickup_location": {"lat": 16.4023, "lng": 120.5960},
        "delivery_location": {"address": order.get("delivery_address", {}).get("address_line1", "")},
        "created_at": datetime.utcnow(),
    }
    await db.deliveries.insert_one(delivery)

    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": OrderStatus.PREPARING, "updated_at": datetime.utcnow()}}
    )

    await db.drivers.update_one(
        {"id": driver_id},
        {"$set": {"status": "on_delivery"}}
    )

    await notify_order_update(order_id, order["user_id"], "preparing", f"Driver {driver['name']} accepted your delivery!")

    return {"message": "Delivery accepted", "delivery_id": delivery["id"]}


@router.put("/drivers/{driver_id}/delivery/{delivery_id}/status")
async def update_delivery_status(driver_id: str, delivery_id: str, status: str):
    delivery = await db.deliveries.find_one({"id": delivery_id, "driver_id": driver_id})
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    update_data = {"status": status}
    if status == "picked_up":
        update_data["picked_up_at"] = datetime.utcnow()
        order_status = OrderStatus.OUT_FOR_DELIVERY
    elif status == "delivered":
        update_data["delivered_at"] = datetime.utcnow()
        order_status = OrderStatus.DELIVERED
        await db.drivers.update_one(
            {"id": driver_id},
            {"$set": {"status": "available"}, "$inc": {"total_deliveries": 1}}
        )
    else:
        order_status = None

    await db.deliveries.update_one({"id": delivery_id}, {"$set": update_data})

    if order_status:
        await db.orders.update_one(
            {"id": delivery["order_id"]},
            {"$set": {"order_status": order_status, "updated_at": datetime.utcnow()}}
        )

        order = await db.orders.find_one({"id": delivery["order_id"]})
        if order:
            msg = "Your order is on the way!" if status == "picked_up" else "Your order has been delivered!"
            await notify_order_update(delivery["order_id"], order["user_id"], order_status, msg)

    return {"message": f"Delivery status updated to {status}"}


@router.put("/drivers/{driver_id}/location")
async def update_driver_location(driver_id: str, location: DriverLocationUpdate):
    from websocket_manager import manager

    result = await db.drivers.update_one(
        {"id": driver_id},
        {"$set": {"current_location": {"lat": location.latitude, "lng": location.longitude}}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Driver not found")

    deliveries = await db.deliveries.find({"driver_id": driver_id, "status": {"$in": ["assigned", "picked_up"]}}).to_list(10)

    # Batch fetch orders for all active deliveries
    if deliveries:
        del_order_ids = [d["order_id"] for d in deliveries]
        orders_list = await db.orders.find({"id": {"$in": del_order_ids}}).to_list(len(del_order_ids))
        orders_map = {o["id"]: o for o in orders_list}

        for delivery in deliveries:
            order = orders_map.get(delivery["order_id"])
            if order:
                await manager.send_personal_message({
                    "type": "driver_location",
                    "order_id": delivery["order_id"],
                    "location": {"lat": location.latitude, "lng": location.longitude},
                }, order["user_id"])

    return {"message": "Location updated"}
