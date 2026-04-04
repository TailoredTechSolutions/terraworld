from database import db
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)


async def send_email_notification(to_email: str, subject: str, template: str, data: dict):
    """Mock email sender - logs to database"""
    email = {
        "id": str(uuid.uuid4()),
        "to_email": to_email,
        "subject": subject,
        "template": template,
        "data": data,
        "body": generate_email_body(template, data),
        "status": "sent",
        "sent_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }
    await db.emails.insert_one(email)
    logger.info(f"Email sent to {to_email}: {subject}")
    return email


def generate_email_body(template: str, data: dict) -> str:
    """Generate email body from template"""
    templates = {
        "order_confirmation": f"""
Dear {data.get('customer_name', 'Customer')},

Thank you for your order #{data.get('order_id', '')[:8]}!

Order Total: P{data.get('total', 0):.2f}
Items: {data.get('items_count', 0)} item(s)

Your order is being prepared and will be delivered soon.

Thank you for shopping with Terra Farming!
        """,
        "order_shipped": f"""
Great news! Your order #{data.get('order_id', '')[:8]} is on its way!

Driver: {data.get('driver_name', 'Our delivery partner')}
Estimated arrival: {data.get('eta', '45-60 minutes')}

Track your order in the Terra Farming app.
        """,
        "order_delivered": f"""
Your order #{data.get('order_id', '')[:8]} has been delivered!

We hope you enjoy your fresh produce from local farms.

Please rate your experience in the app.

Thank you for supporting local farmers!
        """,
        "payment_confirmed": f"""
Payment Confirmed!

Order: #{data.get('order_id', '')[:8]}
Amount: P{data.get('amount', 0):.2f}
Method: {data.get('payment_method', 'N/A')}

Your order is now being prepared.
        """,
    }
    return templates.get(template, f"Notification: {data}")


async def notify_order_update(order_id: str, user_id: str, status: str, message: str):
    """Send order update notification via WebSocket and save to DB"""
    from websocket_manager import manager

    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "order_status",
        "title": "Order Update",
        "message": message,
        "data": {"order_id": order_id, "status": status},
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    await db.notifications.insert_one(notification)

    await manager.send_personal_message({
        "type": "order_update",
        "order_id": order_id,
        "status": status,
        "message": message,
    }, user_id)
