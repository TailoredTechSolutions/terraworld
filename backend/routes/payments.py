from fastapi import APIRouter, HTTPException
from typing import Optional
from models import PaymentRequest
from database import db
from email_service import send_email_notification, notify_order_update
from datetime import datetime
import uuid
import asyncio

router = APIRouter()


@router.post("/payments/initiate")
async def initiate_payment(request: PaymentRequest):
    order = await db.orders.find_one({"id": request.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    ref_number = f"TERRA-{request.payment_method.upper()}-{uuid.uuid4().hex[:8].upper()}"

    payment = {
        "id": str(uuid.uuid4()),
        "order_id": request.order_id,
        "payment_method": request.payment_method,
        "amount": order["total"],
        "reference_number": ref_number,
        "phone_number": request.phone_number,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }

    await db.payments.insert_one(payment)

    qr_code = f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY:{ref_number}"

    return {
        "id": payment["id"],
        "reference_number": ref_number,
        "amount": order["total"],
        "payment_method": request.payment_method,
        "status": "pending",
        "qr_code": qr_code,
        "message": f"Please complete payment of P{order['total']:.2f} using {request.payment_method.upper()}",
        "instructions": [
            f"Open your {request.payment_method.upper()} app",
            "Go to Pay QR or Pay Bills",
            f"Enter reference number: {ref_number}",
            f"Confirm payment of P{order['total']:.2f}",
        ]
    }


@router.post("/payments/{payment_id}/confirm")
async def confirm_payment(payment_id: str):
    payment = await db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    await db.payments.update_one(
        {"id": payment_id},
        {"$set": {"status": "paid", "paid_at": datetime.utcnow()}}
    )

    order = await db.orders.find_one({"id": payment["order_id"]})
    await db.orders.update_one(
        {"id": payment["order_id"]},
        {"$set": {"payment_status": "paid", "order_status": "confirmed", "updated_at": datetime.utcnow()}}
    )

    notification = {
        "id": str(uuid.uuid4()),
        "user_id": order["user_id"],
        "type": "payment",
        "title": "Payment Successful",
        "message": f"Your payment of P{payment['amount']:.2f} for order #{payment['order_id'][:8]} has been confirmed.",
        "data": {"order_id": payment["order_id"], "amount": payment["amount"]},
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    await db.notifications.insert_one(notification)

    await notify_order_update(
        payment["order_id"],
        order["user_id"],
        "confirmed",
        "Payment confirmed! Your order is being prepared."
    )

    asyncio.create_task(send_email_notification(
        to_email=order.get("delivery_address", {}).get("full_name", "Customer"),
        subject=f"Payment Confirmed - #{payment['order_id'][:8]}",
        template="payment_confirmed",
        data={
            "order_id": payment["order_id"],
            "amount": payment["amount"],
            "payment_method": payment["payment_method"],
        }
    ))

    return {"status": "paid", "message": "Payment confirmed successfully"}


@router.get("/payments/{order_id}/status")
async def get_payment_status(order_id: str):
    payment = await db.payments.find_one({"order_id": order_id})
    if not payment:
        return {"status": "not_found", "message": "No payment initiated for this order"}

    return {
        "id": payment["id"],
        "status": payment["status"],
        "amount": payment["amount"],
        "reference_number": payment["reference_number"],
        "payment_method": payment["payment_method"],
    }
