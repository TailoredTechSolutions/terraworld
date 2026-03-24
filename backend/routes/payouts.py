from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from models.payment import (
    PayoutRequest, PayoutResponse, Payout, PayoutProcess
)
from models.user import User
from middleware.auth import get_current_user, get_current_farmer, get_current_admin
from services.payout_service import PayoutService

router = APIRouter(prefix="/payouts", tags=["Payouts"])


@router.get("/earnings", response_model=dict)
async def get_pending_earnings(
    current_user: User = Depends(get_current_farmer)
):
    """
    Get farmer's pending earnings summary
    
    Shows:
    - Total pending earnings from completed orders
    - Number of orders pending payout
    - Whether farmer can request payout (minimum ₱100)
    """
    payout_service = PayoutService()
    return await payout_service.get_pending_earnings(current_user.id)


@router.post("/request", response_model=PayoutResponse, status_code=status.HTTP_201_CREATED)
async def request_payout(
    payout_data: PayoutRequest,
    current_user: User = Depends(get_current_farmer)
):
    """
    Request payout of accumulated earnings (Farmer only)
    
    - **method**: Payout method (gcash | bank)
    - **destination**: GCash number (+639XXXXXXXXX) or bank account number
    
    Requirements:
    - Minimum payout amount: ₱100
    - Only earnings from completed, paid orders
    - No pending payout requests
    
    Process:
    1. Calculates earnings from unpaid completed orders
    2. Validates minimum payout threshold
    3. Creates payout request (status: pending)
    4. Admin will process the payout
    """
    payout_service = PayoutService()
    
    payout = await payout_service.request_payout(
        current_user.id,
        payout_data
    )
    
    return PayoutResponse(
        _id=payout.id,
        farmer_id=payout.farmer_id,
        amount=payout.amount,
        method=payout.method,
        status=payout.status,
        created_at=payout.created_at
    )


@router.get("", response_model=dict)
async def get_farmer_payouts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_farmer)
):
    """
    Get farmer's payout history
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    """
    payout_service = PayoutService()
    
    payouts, total = await payout_service.get_farmer_payouts(
        current_user.id,
        page,
        limit
    )
    
    return {
        "items": payouts,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{payout_id}", response_model=Payout)
async def get_payout(
    payout_id: str,
    current_user: User = Depends(get_current_farmer)
):
    """
    Get payout details
    
    Farmer can only view their own payouts.
    """
    payout_service = PayoutService()
    
    payout = await payout_service.get_payout(payout_id, current_user.id)
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )
    
    return payout


# Admin payout routes
admin_router = APIRouter(prefix="/admin/payouts", tags=["Admin Payouts"])


@admin_router.get("", response_model=dict)
async def get_all_payouts(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all payout requests (Admin only)
    
    - **status**: Filter by status (pending | processing | completed | failed)
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    """
    payout_service = PayoutService()
    
    payouts, total = await payout_service.get_all_payouts(
        status_filter,
        page,
        limit
    )
    
    return {
        "items": payouts,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@admin_router.get("/{payout_id}", response_model=Payout)
async def get_payout_admin(
    payout_id: str,
    current_user: User = Depends(get_current_admin)
):
    """
    Get payout details (Admin only)
    """
    payout_service = PayoutService()
    
    payout = await payout_service.get_payout(payout_id)
    if not payout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payout not found"
        )
    
    return payout


@admin_router.post("/{payout_id}/process", response_model=Payout)
async def process_payout(
    payout_id: str,
    process_data: PayoutProcess,
    current_user: User = Depends(get_current_admin)
):
    """
    Process payout request (Admin only)
    
    - **notes**: Optional processing notes
    
    Process:
    1. Validates payout is in 'pending' status
    2. Updates status to 'processing'
    3. Processes payout with payment provider
    4. Updates status to 'completed' or 'failed'
    5. Updates farmer's total sales stats
    
    For GCash payouts, funds are transferred to farmer's GCash wallet.
    """
    payout_service = PayoutService()
    
    return await payout_service.process_payout(
        payout_id,
        current_user.id,
        process_data
    )
