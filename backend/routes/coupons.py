from fastapi import APIRouter, HTTPException
from models import Coupon, CouponCreate, ApplyCouponRequest
from database import db
from datetime import datetime

router = APIRouter()


@router.post("/coupons", response_model=Coupon)
async def create_coupon(coupon: CouponCreate):
    coupon_obj = Coupon(**coupon.dict())
    await db.coupons.insert_one(coupon_obj.dict())
    return coupon_obj


@router.get("/coupons")
async def get_all_coupons():
    coupons = await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return coupons


@router.post("/coupons/validate")
async def validate_coupon(request: ApplyCouponRequest):
    coupon = await db.coupons.find_one({"code": request.code.upper(), "is_active": True})

    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")

    now = datetime.utcnow()
    if coupon.get("valid_until") and now > coupon["valid_until"]:
        raise HTTPException(status_code=400, detail="Coupon has expired")

    if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    if request.subtotal < coupon.get("min_order", 0):
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order of P{coupon['min_order']} required for this coupon"
        )

    if coupon["coupon_type"] == "percentage":
        discount = request.subtotal * (coupon["value"] / 100)
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    elif coupon["coupon_type"] == "fixed":
        discount = min(coupon["value"], request.subtotal)
    elif coupon["coupon_type"] == "free_delivery":
        discount = 50
    else:
        discount = 0

    return {
        "valid": True,
        "code": coupon["code"],
        "coupon_type": coupon["coupon_type"],
        "discount": discount,
        "description": coupon.get("description", ""),
        "message": f"Coupon applied! You save P{discount:.2f}"
    }


@router.post("/coupons/apply")
async def apply_coupon(code: str):
    result = await db.coupons.update_one(
        {"code": code.upper(), "is_active": True},
        {"$inc": {"used_count": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon applied"}


@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"message": "Coupon deleted"}
