from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from models.order import (
    OrderCreate, OrderResponse, OrderStatusUpdate, OrderFilter, Order
)
from models.user import User
from middleware.auth import get_current_user, get_current_farmer
from services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create order from cart
    
    - **delivery_address_id**: User's address ID for delivery
    - **delivery_instructions**: Optional delivery instructions
    - **delivery_window_start**: Optional delivery window start time
    - **delivery_window_end**: Optional delivery window end time
    - **buyer_notes**: Optional notes from buyer
    
    Process:
    1. Validates cart has items
    2. Validates delivery address
    3. Checks product availability and stock
    4. Calculates pricing (platform fee, tax, logistics)
    5. Creates order and reserves stock
    6. Clears cart
    
    Order starts in 'pending' status awaiting payment confirmation.
    """
    order_service = OrderService()
    order = await order_service.create_order(current_user.id, order_data)
    
    return OrderResponse(
        _id=order.id,
        order_number=order.order_number,
        buyer_id=order.buyer_id,
        items=order.items,
        pricing=order.pricing,
        delivery_address=order.delivery_address,
        delivery_instructions=order.delivery_instructions,
        status=order.status,
        status_history=order.status_history,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.get("", response_model=dict)
async def get_user_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's orders
    
    - **status**: Filter by order status (optional)
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    """
    order_service = OrderService()
    
    filters = OrderFilter(
        status=status_filter,
        page=page,
        limit=limit
    )
    
    orders, total = await order_service.get_user_orders(current_user.id, filters)
    
    return {
        "items": [OrderResponse(
            _id=order.id,
            order_number=order.order_number,
            buyer_id=order.buyer_id,
            items=order.items,
            pricing=order.pricing,
            delivery_address=order.delivery_address,
            delivery_instructions=order.delivery_instructions,
            status=order.status,
            status_history=order.status_history,
            created_at=order.created_at,
            updated_at=order.updated_at
        ) for order in orders],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get order detail
    
    User must be the buyer or one of the farmers for this order.
    """
    order_service = OrderService()
    
    order = await order_service.get_order(order_id, current_user.id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.put("/{order_id}/cancel", response_model=Order)
async def cancel_order(
    order_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Cancel order (buyer only)
    
    - Can only cancel orders in 'pending', 'confirmed', or 'preparing' status
    - Stock will be restored
    - **reason**: Optional cancellation reason
    """
    order_service = OrderService()
    return await order_service.cancel_order(order_id, current_user.id, reason)


# Farmer order routes
farmer_router = APIRouter(prefix="/farmer/orders", tags=["Farmer Orders"])


@farmer_router.get("", response_model=dict)
async def get_farmer_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_farmer)
):
    """
    Get orders for current farmer
    
    Shows orders that include products from this farmer.
    
    - **status**: Filter by order status (optional)
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    """
    order_service = OrderService()
    
    filters = OrderFilter(
        status=status_filter,
        page=page,
        limit=limit
    )
    
    orders, total = await order_service.get_farmer_orders(current_user.id, filters)
    
    return {
        "items": [OrderResponse(
            _id=order.id,
            order_number=order.order_number,
            buyer_id=order.buyer_id,
            items=order.items,
            pricing=order.pricing,
            delivery_address=order.delivery_address,
            delivery_instructions=order.delivery_instructions,
            status=order.status,
            status_history=order.status_history,
            created_at=order.created_at,
            updated_at=order.updated_at
        ) for order in orders],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@farmer_router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_farmer)
):
    """
    Update order status (farmer only)
    
    - **status**: New status
    - **note**: Optional note about the status change
    
    Farmers can transition orders through preparation and pickup stages.
    
    Valid status transitions:
    - confirmed → preparing
    - preparing → pickup_assigned (when driver assigned)
    """
    order_service = OrderService()
    
    # Verify farmer has access to this order
    order = await order_service.get_order(order_id, current_user.id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return await order_service.update_order_status(
        order_id,
        status_update.status,
        status_update.note,
        current_user.id
    )
