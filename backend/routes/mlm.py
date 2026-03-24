from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from models.mlm import GenealogyNode, CommissionLine, CommissionRun
from models.user import User
from middleware.auth import get_current_user, get_current_admin
from services.mlm_service import MLMService
from utils.database import get_database
from config.settings import settings

router = APIRouter(prefix="/mlm", tags=["MLM/Network"])


@router.get("/enabled")
async def check_mlm_status():
    """
    Check if MLM features are enabled
    
    Returns configuration status of network marketing features.
    """
    return {
        "mlm_enabled": settings.MLM_ENABLED,
        "features": {
            "referrals": True,
            "binary_tree": settings.MLM_ENABLED,
            "commissions": settings.MLM_ENABLED,
            "ranks": settings.MLM_ENABLED
        },
        "disclaimer": "Network marketing features are optional. Platform operates as a standard marketplace even when disabled."
    }


@router.get("/referral-info")
async def get_referral_info(current_user: User = Depends(get_current_user)):
    """
    Get user's referral information
    
    Shows:
    - Personal referral code
    - Total referrals count
    - Active referrals
    - Referral earnings
    
    **Note**: Referral program is for promoting legitimate marketplace usage.
    Focus is on product sales, not recruitment.
    """
    db = get_database()
    
    # Get referral code
    referral_code = current_user.metadata.get("referral_code")
    
    # Count referrals
    referrals = await db.referrals.find({"referrer_id": current_user.id}).to_list(1000)
    total_referrals = len(referrals)
    active_referrals = sum(1 for r in referrals if r.get("status") == "active")
    
    # Calculate referral earnings
    pipeline = [
        {
            "$match": {
                "user_id": current_user.id,
                "reason": "referral_bonus"
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$amount"}
            }
        }
    ]
    
    referral_earnings = 0.0
    async for doc in db.token_ledger.aggregate(pipeline):
        referral_earnings = doc["total"]
    
    return {
        "referral_code": referral_code,
        "referral_link": f"https://terra.app/register?ref={referral_code}",
        "total_referrals": total_referrals,
        "active_referrals": active_referrals,
        "referral_earnings": round(referral_earnings, 2)
    }


@router.get("/genealogy", response_model=Optional[GenealogyNode])
async def get_genealogy(
    depth: int = Query(3, ge=1, le=5),
    current_user: User = Depends(get_current_user)
):
    """
    Get binary tree genealogy
    
    Shows user's position in binary tree with:
    - Left and right downlines
    - Volume by leg
    - Personal volume
    - Rank information
    
    **Depth**: How many levels down to display (1-5)
    
    **Important**: Network view is for tracking legitimate product sales
    through your network, not for recruitment visualization.
    """
    if not settings.MLM_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MLM features are not enabled"
        )
    
    mlm_service = MLMService()
    return await mlm_service.get_user_genealogy(current_user.id, depth)


@router.get("/commissions/summary")
async def get_commission_summary(current_user: User = Depends(get_current_user)):
    """
    Get commission earnings summary
    
    Shows:
    - Total commissions earned
    - Breakdown by type (pairing, matching, rank bonus)
    - Current period earnings
    
    **Disclaimer**: Commissions are earned from product sales in your network.
    They are based on business volume, not recruitment.
    """
    if not settings.MLM_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MLM features are not enabled"
        )
    
    mlm_service = MLMService()
    return await mlm_service.get_commission_summary(current_user.id)


@router.get("/commissions/history", response_model=dict)
async def get_commission_history(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Get commission payment history
    
    Shows all commission payments with:
    - Type (pairing, matching, etc.)
    - Amount
    - Calculation details
    - Payment status
    - Timestamp
    """
    if not settings.MLM_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MLM features are not enabled"
        )
    
    mlm_service = MLMService()
    
    commissions, total = await mlm_service.get_user_commissions(
        current_user.id,
        page,
        limit
    )
    
    return {
        "items": commissions,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/business-volume")
async def get_business_volume(current_user: User = Depends(get_current_user)):
    """
    Get current period business volume
    
    Shows:
    - Personal volume (from own orders)
    - Left leg volume
    - Right leg volume
    - Carry forward amounts
    
    **Note**: Volume represents actual product sales value, not points or tokens.
    """
    if not settings.MLM_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MLM features are not enabled"
        )
    
    db = get_database()
    from datetime import datetime
    
    period = datetime.utcnow().strftime("%Y-%m")
    
    volume = await db.business_volume.find_one({
        "user_id": current_user.id,
        "period": period
    })
    
    if not volume:
        return {
            "period": period,
            "personal_volume": 0.0,
            "left_volume": 0.0,
            "right_volume": 0.0,
            "carry_forward_left": 0.0,
            "carry_forward_right": 0.0
        }
    
    return {
        "period": period,
        "personal_volume": volume.get("personal_volume", 0.0),
        "left_volume": volume.get("left_volume", 0.0),
        "right_volume": volume.get("right_volume", 0.0),
        "carry_forward_left": volume.get("carry_forward_left", 0.0),
        "carry_forward_right": volume.get("carry_forward_right", 0.0)
    }


# Admin MLM routes
admin_router = APIRouter(prefix="/admin/mlm", tags=["Admin MLM"])


@admin_router.post("/commission-run", response_model=CommissionRun)
async def run_commission_calculation(
    start_date: str,
    end_date: str,
    run_type: str = "bi_weekly",
    current_user: User = Depends(get_current_admin)
):
    """
    Run commission calculation (Admin only)
    
    Processes commissions for a period:
    1. Calculates pairing bonuses
    2. Calculates matching bonuses
    3. Applies caps and limits
    4. Credits commission to token ledger
    
    - **start_date**: Period start (ISO format)
    - **end_date**: Period end (ISO format)
    - **run_type**: daily | weekly | bi_weekly | monthly
    """
    if not settings.MLM_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MLM features are not enabled"
        )
    
    mlm_service = MLMService()
    return await mlm_service.calculate_commissions(start_date, end_date, run_type)


@admin_router.get("/commission-runs", response_model=dict)
async def get_commission_runs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin)
):
    """
    Get commission run history (Admin only)
    """
    if not settings.MLM_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MLM features are not enabled"
        )
    
    db = get_database()
    
    total = await db.commission_runs.count_documents({})
    
    skip = (page - 1) * limit
    runs = await db.commission_runs.find()\
        .sort("created_at", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    return {
        "items": [CommissionRun(**r) for r in runs],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@admin_router.get("/stats")
async def get_mlm_stats(current_user: User = Depends(get_current_admin)):
    """
    Get MLM statistics (Admin only)
    
    Shows:
    - Total members in binary tree
    - Total business volume
    - Total commissions paid
    - Active members
    """
    if not settings.MLM_ENABLED:
        return {
            "mlm_enabled": False,
            "message": "MLM features are not enabled"
        }
    
    db = get_database()
    
    # Total members in binary tree
    total_members = await db.binary_tree.count_documents({})
    
    # Total commissions paid
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$amount"}
            }
        }
    ]
    
    total_commissions = 0.0
    async for doc in db.commission_lines.aggregate(pipeline):
        total_commissions = doc["total"]
    
    # Total business volume (current month)
    from datetime import datetime
    period = datetime.utcnow().strftime("%Y-%m")
    
    volume_pipeline = [
        {
            "$match": {"period": period}
        },
        {
            "$group": {
                "_id": None,
                "total_personal": {"$sum": "$personal_volume"},
                "total_left": {"$sum": "$left_volume"},
                "total_right": {"$sum": "$right_volume"}
            }
        }
    ]
    
    volume_stats = {
        "total_personal": 0.0,
        "total_left": 0.0,
        "total_right": 0.0
    }
    
    async for doc in db.business_volume.aggregate(volume_pipeline):
        volume_stats = {
            "total_personal": doc["total_personal"],
            "total_left": doc["total_left"],
            "total_right": doc["total_right"]
        }
    
    return {
        "mlm_enabled": True,
        "total_members": total_members,
        "total_commissions_paid": round(total_commissions, 2),
        "current_period": period,
        "current_period_volume": volume_stats
    }
