from fastapi import APIRouter, HTTPException
from typing import List
from models import Cart, CartItem, AddToCartRequest, UpdateCartItemRequest
from database import db
from datetime import datetime

router = APIRouter()


@router.get("/cart/{user_id}", response_model=Cart)
async def get_cart(user_id: str):
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        new_cart = Cart(user_id=user_id)
        await db.carts.insert_one(new_cart.dict())
        return new_cart
    return Cart(**cart)


@router.post("/cart/add", response_model=Cart)
async def add_to_cart(request: AddToCartRequest):
    product = await db.products.find_one({"id": request.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["stock"] < request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = await db.carts.find_one({"user_id": request.user_id})

    cart_item = CartItem(
        product_id=product["id"],
        product_name=product["name"],
        farm_name=product["farm_name"],
        price=product["price"],
        unit=product["unit"],
        quantity=request.quantity,
        image=product["image"]
    )

    if not cart:
        new_cart = Cart(user_id=request.user_id, items=[cart_item])
        await db.carts.insert_one(new_cart.dict())
        return new_cart

    existing_items = cart.get("items", [])
    found = False
    for i, item in enumerate(existing_items):
        if item["product_id"] == request.product_id:
            existing_items[i]["quantity"] += request.quantity
            found = True
            break
    if not found:
        existing_items.append(cart_item.dict())

    await db.carts.update_one(
        {"user_id": request.user_id},
        {"$set": {"items": existing_items, "updated_at": datetime.utcnow()}}
    )
    updated_cart = await db.carts.find_one({"user_id": request.user_id})
    return Cart(**updated_cart)


@router.put("/cart/{user_id}/item/{product_id}", response_model=Cart)
async def update_cart_item(user_id: str, product_id: str, request: UpdateCartItemRequest):
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = cart.get("items", [])
    found = False
    for i, item in enumerate(items):
        if item["product_id"] == product_id:
            if request.quantity <= 0:
                items.pop(i)
            else:
                items[i]["quantity"] = request.quantity
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Item not in cart")

    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    updated_cart = await db.carts.find_one({"user_id": user_id})
    return Cart(**updated_cart)


@router.delete("/cart/{user_id}/item/{product_id}", response_model=Cart)
async def remove_from_cart(user_id: str, product_id: str):
    cart = await db.carts.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    items = [item for item in cart.get("items", []) if item["product_id"] != product_id]
    await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    updated_cart = await db.carts.find_one({"user_id": user_id})
    return Cart(**updated_cart)


@router.delete("/cart/{user_id}")
async def clear_cart(user_id: str):
    result = await db.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        await db.carts.insert_one(Cart(user_id=user_id).dict())
    return {"message": "Cart cleared"}
