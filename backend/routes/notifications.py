from fastapi import APIRouter, HTTPException
from typing import Optional
from database import db
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/notifications/{user_id}")
async def get_user_notifications(user_id: str, skip: int = 0, limit: int = 50):
    notifications = await db.notifications.find(
        {"user_id": user_id}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    for n in notifications:
        n.pop("_id", None)

    unread = await db.notifications.count_documents({"user_id": user_id, "is_read": False})
    return {"notifications": notifications, "unread_count": unread}


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.put("/notifications/{user_id}/read-all")
async def mark_all_notifications_read(user_id: str):
    await db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}


@router.post("/notifications/create")
async def create_notification(user_id: str, notification_type: str, title: str, message: str, data: Optional[dict] = None):
    from websocket_manager import manager

    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    await db.notifications.insert_one(notification)

    await manager.send_personal_message({
        "type": "notification",
        "notification": {
            "id": notification["id"],
            "type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
        }
    }, user_id)

    return {"message": "Notification created", "notification_id": notification["id"]}
