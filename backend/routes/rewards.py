from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from models.mlm import TokenLedgerEntry, RewardAdjustment
from models.user import User
from middleware.auth import get_current_user, get_current_admin
from services.reward_service import RewardService

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("/balance")
async def get_reward_balance(current_user: User = Depends(get_current_user)):
    """
    Get current reward balance
    
    Returns user's current token/reward balance.
    
    **Note**: Rewards are platform utility points that can be used
    for future features or promotions. They are not financial instruments
    or investment products.
    """
    reward_service = RewardService()
    balance = await reward_service.get_user_balance(current_user.id)
    
    return {
        "user_id": current_user.id,
        "balance": round(balance, 2),
        "currency": "TERRA_POINTS"
    }


@router.get("/summary")
async def get_reward_summary(current_user: User = Depends(get_current_user)):
    """
    Get reward summary
    
    Shows:
    - Current balance
    - Lifetime earnings
    - Earnings breakdown by source (orders, referrals, commissions)
    
    **Disclaimer**: Platform rewards are utility points for internal use.
    Not redeemable for cash unless explicitly enabled by platform policy.
    """
    reward_service = RewardService()
    return await reward_service.get_reward_summary(current_user.id)


@router.get("/history", response_model=dict)
async def get_reward_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Get reward transaction history
    
    Shows all credits and debits to reward balance with:
    - Amount
    - Reason
    - Description
    - Related reference (order, referral, etc.)
    - Timestamp
    - Balance after transaction
    """
    reward_service = RewardService()
    
    entries, total, current_balance = await reward_service.get_user_ledger(
        current_user.id,
        page,
        limit
    )
    
    return {
        "current_balance": round(current_balance, 2),
        "items": entries,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


# Admin reward routes
admin_router = APIRouter(prefix="/admin/rewards", tags=["Admin Rewards"])


@admin_router.post("/adjust", response_model=TokenLedgerEntry)
async def adjust_user_rewards(
    adjustment: RewardAdjustment,
    current_user: User = Depends(get_current_admin)
):
    """
    Adjust user's reward balance (Admin only)
    
    - **user_id**: User to adjust
    - **amount**: Amount (positive for credit, negative for debit)
    - **reason**: Short reason code
    - **note**: Detailed explanation
    
    Creates auditable ledger entry with admin attribution.
    """
    reward_service = RewardService()
    return await reward_service.admin_adjust_reward(adjustment, current_user.id)


@admin_router.get("/user/{user_id}/history", response_model=dict)
async def get_user_reward_history(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_admin)
):
    """
    Get any user's reward history (Admin only)
    """
    reward_service = RewardService()
    
    entries, total, current_balance = await reward_service.get_user_ledger(
        user_id,
        page,
        limit
    )
    
    return {
        "user_id": user_id,
        "current_balance": round(current_balance, 2),
        "items": entries,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }
