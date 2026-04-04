from fastapi import APIRouter, HTTPException
from typing import List
from models import Order, OrderItem, CreateOrderRequest, OrderStatus
from database import db
from email_service import send_email_notification, notify_order_update
from datetime import datetime
import asyncio

router = APIRouter()


@router.post("/orders", response_model=Order)
async def create_order(request: CreateOrderRequest):
    """Create a new order from cart"""
    cart = await db.carts.find_one({"user_id": request.user_id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Batch fetch all products in one query
    product_ids = [item["product_id"] for item in cart["items"]]
    products_cursor = await db.products.find({"id": {"$in": product_ids}}).to_list(len(product_ids))
    products_map = {p["id"]: p for p in products_cursor}

    items = []
    subtotal = 0

    for cart_item in cart["items"]:
        product = products_map.get(cart_item["product_id"])
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

    delivery_fee = 50.0 if subtotal < 500 else 0.0
    total = subtotal + delivery_fee

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

    for item in items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )

    await db.carts.update_one(
        {"user_id": request.user_id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )

    # Send order confirmation email
    asyncio.create_task(send_email_notification(
        to_email=request.delivery_address.full_name,
        subject=f"Order Confirmed - #{order.id[:8]}",
        template="order_confirmation",
        data={
            "customer_name": request.delivery_address.full_name,
            "order_id": order.id,
            "total": total,
            "items_count": len(items),
        }
    ))

    return order


@router.get("/orders/{user_id}", response_model=List[Order])
async def get_user_orders(user_id: str, skip: int = 0, limit: int = 50):
    orders = await db.orders.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [Order(**order) for order in orders]


@router.get("/orders/detail/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)


@router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": status, "updated_at": datetime.utcnow()}}
    )

    template_map = {
        "out_for_delivery": "order_shipped",
        "delivered": "order_delivered",
    }
    if status in template_map:
        asyncio.create_task(send_email_notification(
            to_email=order.get("delivery_address", {}).get("full_name", "Customer"),
            subject=f"Order Update - #{order_id[:8]}",
            template=template_map[status],
            data={"order_id": order_id, "customer_name": order.get("delivery_address", {}).get("full_name", "Customer")}
        ))

    asyncio.create_task(notify_order_update(order_id, order["user_id"], status, f"Order status updated to {status}"))

    return {"message": "Order status updated", "status": status}


@router.put("/orders/{order_id}/cancel")
async def cancel_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["order_status"] not in ["pending", "confirmed"]:
        raise HTTPException(status_code=400, detail="Cannot cancel order in current status")

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
