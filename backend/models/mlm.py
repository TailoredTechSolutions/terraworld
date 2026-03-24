from pydantic import BaseModel, Field
from typing import Optional, List
from utils.helpers import generate_uuid, utc_now


class TokenLedgerEntry(BaseModel):
    """Token/rewards ledger entry"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    type: str  # credit | debit
    amount: float
    balance_after: float
    reason: str  # order_reward | referral_bonus | admin_adjustment | redemption | commission
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None  # order | referral | adjustment | commission
    description: str
    metadata: dict = {}
    admin_adjusted_by: Optional[str] = None
    admin_note: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class RewardAdjustment(BaseModel):
    """Admin reward adjustment"""
    user_id: str
    amount: float
    reason: str
    note: str


class BinaryTreeNode(BaseModel):
    """Binary tree node for MLM structure"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    parent_id: Optional[str] = None
    sponsor_id: str  # Who recruited them
    position: str  # left | right
    left_child_id: Optional[str] = None
    right_child_id: Optional[str] = None
    level: int  # Distance from root
    path: str  # For genealogy queries (e.g., "/root-id/parent-id/user-id")
    created_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class BusinessVolume(BaseModel):
    """Business volume tracking for commission calculations"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    period: str  # YYYY-MM format
    left_volume: float = 0.0
    right_volume: float = 0.0
    personal_volume: float = 0.0
    carry_forward_left: float = 0.0
    carry_forward_right: float = 0.0
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class Rank(BaseModel):
    """MLM rank definition"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    name: str
    slug: str
    level: int
    requirements: dict = {
        "personal_volume": 0.0,
        "left_volume": 0.0,
        "right_volume": 0.0,
        "direct_referrals": 0
    }
    benefits: dict = {
        "commission_rate": 0.0,
        "matching_levels": 0,
        "rank_bonus": 0.0
    }
    icon_url: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class UserRank(BaseModel):
    """User rank history"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    user_id: str
    rank_id: str
    rank_name: str
    achieved_at: str = Field(default_factory=utc_now)
    is_current: bool = True
    created_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class CommissionRun(BaseModel):
    """Commission calculation batch run"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    period: dict  # {"start": "...", "end": "..."}
    run_type: str  # daily | weekly | bi_weekly | monthly
    status: str = "pending"  # pending | processing | completed | failed
    stats: dict = {
        "total_members": 0,
        "total_commissions": 0.0,
        "total_pairs": 0
    }
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class CommissionLine(BaseModel):
    """Individual commission entry"""
    id: str = Field(default_factory=generate_uuid, alias="_id")
    run_id: str
    user_id: str
    type: str  # direct_bonus | pairing_bonus | matching_bonus | rank_bonus
    amount: float
    calculation: dict = {}  # Calculation details for transparency
    status: str = "approved"  # pending | approved | paid
    paid_at: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    
    class Config:
        populate_by_name = True


class ReferralInfo(BaseModel):
    """Referral information response"""
    referral_code: str
    total_referrals: int
    active_referrals: int
    referral_earnings: float


class GenealogyNode(BaseModel):
    """Genealogy tree node"""
    user_id: str
    name: str
    position: str
    level: int
    personal_volume: float
    left_volume: float
    right_volume: float
    rank: Optional[str] = None
    left_child: Optional['GenealogyNode'] = None
    right_child: Optional['GenealogyNode'] = None


class CommissionSummary(BaseModel):
    """Commission earnings summary"""
    total_commissions: float
    pending_commissions: float
    paid_commissions: float
    commission_breakdown: dict  # By type
    current_period_earnings: float


class PlacementRequest(BaseModel):
    """MLM placement request"""
    referrer_code: str
    position: str  # left | right
    parent_user_id: Optional[str] = None  # For specific placement
