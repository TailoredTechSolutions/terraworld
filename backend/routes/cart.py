from fastapi import APIRouter, HTTPException, status, Depends
from models.order import CartItemAdd, CartItemUpdate
from models.user import User
from middleware.auth import get_current_user
from services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
async def get_cart(current_user: User = Depends(get_current_user)):
    """
    Get current user's cart with populated product information
    """
    cart_service = CartService()
    return await cart_service.get_or_create_cart(current_user.id)


@router.post("/items", status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: CartItemAdd,
    current_user: User = Depends(get_current_user)
):
    """
    Add item to cart or update quantity if already exists
    
    - **product_id**: Product to add
    - **quantity**: Quantity to add (default: 1)
    
    Validations:
    - Product must exist and be available
    - Sufficient stock must be available
    - Respects min/max order quantities
    """
    cart_service = CartService()
    return await cart_service.add_item(current_user.id, item_data)


@router.put("/items/{product_id}")
async def update_cart_item(
    product_id: str,
    update_data: CartItemUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update cart item quantity
    
    - **quantity**: New quantity (must be >= 1)
    """
    cart_service = CartService()
    return await cart_service.update_item(current_user.id, product_id, update_data)


@router.delete("/items/{product_id}", status_code=status.HTTP_200_OK)
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Remove item from cart
    """
    cart_service = CartService()
    return await cart_service.remove_item(current_user.id, product_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: User = Depends(get_current_user)):
    """
    Clear all items from cart
    """
    cart_service = CartService()
    await cart_service.clear_cart(current_user.id)
    return None
