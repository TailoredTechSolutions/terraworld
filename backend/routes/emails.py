from fastapi import APIRouter
from database import db
from email_service import send_email_notification

router = APIRouter()


@router.get("/emails")
async def get_sent_emails(limit: int = 50):
    emails = await db.emails.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return emails


@router.post("/emails/send-test")
async def send_test_email(to_email: str, template: str = "order_confirmation"):
    test_data = {
        "customer_name": "Test Customer",
        "order_id": "test-order-12345678",
        "total": 500.00,
        "items_count": 3,
    }
    email = await send_email_notification(to_email, f"Test: {template}", template, test_data)
    return {"message": "Test email sent", "email_id": email["id"]}
