from typing import List, Tuple, Optional
from models.mlm import TokenLedgerEntry, RewardAdjustment
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now
from fastapi import HTTPException, status
from config.settings import settings


class RewardService:
    """Reward/token management service"""
    
    def __init__(self):
        self.db = get_database()
    
    async def get_user_balance(self, user_id: str) -> float:
        """Get user's current token balance"""
        # Get latest ledger entry to get balance
        latest = await self.db.token_ledger.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        
        if latest:
            return latest["balance_after"]
        return 0.0
    
    async def credit_reward(
        self,
        user_id: str,
        amount: float,
        reason: str,
        description: str,
        reference_id: Optional[str] = None,
        reference_type: Optional[str] = None,
        metadata: dict = None
    ) -> TokenLedgerEntry:
        """
        Credit reward to user
        
        Args:
            user_id: User to credit
            amount: Amount to credit
            reason: Reason code (order_reward, referral_bonus, etc.)
            description: Human-readable description
            reference_id: Related entity ID
            reference_type: Type of related entity
            metadata: Additional data
        """
        current_balance = await self.get_user_balance(user_id)
        new_balance = current_balance + amount
        
        entry = TokenLedgerEntry(
            _id=generate_uuid(),
            user_id=user_id,
            type="credit",
            amount=amount,
            balance_after=new_balance,
            reason=reason,
            reference_id=reference_id,
            reference_type=reference_type,
            description=description,
            metadata=metadata or {}
        )
        
        await self.db.token_ledger.insert_one(entry.model_dump(by_alias=True))
        
        return entry
    
    async def debit_reward(
        self,
        user_id: str,
        amount: float,
        reason: str,
        description: str,
        reference_id: Optional[str] = None,
        reference_type: Optional[str] = None,
        metadata: dict = None
    ) -> TokenLedgerEntry:
        """Debit reward from user (e.g., for redemption)"""
        current_balance = await self.get_user_balance(user_id)
        
        if current_balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient reward balance"
            )
        
        new_balance = current_balance - amount
        
        entry = TokenLedgerEntry(
            _id=generate_uuid(),
            user_id=user_id,
            type="debit",
            amount=amount,
            balance_after=new_balance,
            reason=reason,
            reference_id=reference_id,
            reference_type=reference_type,
            description=description,
            metadata=metadata or {}
        )
        
        await self.db.token_ledger.insert_one(entry.model_dump(by_alias=True))
        
        return entry
    
    async def issue_order_reward(self, order_id: str, user_id: str, order_amount: float) -> None:
        """
        Issue reward for completed order
        
        Reward rate is configurable (default 1%)
        """
        reward_rate = settings.REWARD_PER_ORDER_RATE
        reward_amount = order_amount * reward_rate
        
        await self.credit_reward(
            user_id=user_id,
            amount=reward_amount,
            reason="order_reward",
            description=f"Reward for order (₱{order_amount:.2f} × {reward_rate*100}%)",
            reference_id=order_id,
            reference_type="order",
            metadata={
                "order_amount": order_amount,
                "reward_rate": reward_rate
            }
        )
    
    async def issue_referral_bonus(
        self,
        referrer_id: str,
        referee_id: str,
        bonus_amount: float,
        reason: str = "first_order"
    ) -> None:
        """Issue referral bonus to referrer"""
        await self.credit_reward(
            user_id=referrer_id,
            amount=bonus_amount,
            reason="referral_bonus",
            description=f"Referral bonus: {reason}",
            reference_id=referee_id,
            reference_type="referral",
            metadata={
                "referee_id": referee_id,
                "bonus_type": reason
            }
        )
    
    async def admin_adjust_reward(
        self,
        adjustment: RewardAdjustment,
        admin_id: str
    ) -> TokenLedgerEntry:
        """Admin adjustment to user's reward balance"""
        if adjustment.amount > 0:
            entry = await self.credit_reward(
                user_id=adjustment.user_id,
                amount=adjustment.amount,
                reason="admin_adjustment",
                description=adjustment.reason,
                metadata={"adjusted_by": admin_id}
            )
        else:
            entry = await self.debit_reward(
                user_id=adjustment.user_id,
                amount=abs(adjustment.amount),
                reason="admin_adjustment",
                description=adjustment.reason,
                metadata={"adjusted_by": admin_id}
            )
        
        # Update entry with admin info
        await self.db.token_ledger.update_one(
            {"_id": entry.id},
            {
                "$set": {
                    "admin_adjusted_by": admin_id,
                    "admin_note": adjustment.note
                }
            }
        )
        
        return entry
    
    async def get_user_ledger(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[TokenLedgerEntry], int, float]:
        """
        Get user's reward ledger history
        
        Returns: (entries, total_count, current_balance)
        """
        query = {"user_id": user_id}
        
        total = await self.db.token_ledger.count_documents(query)
        
        skip = (page - 1) * limit
        entries = await self.db.token_ledger.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        current_balance = await self.get_user_balance(user_id)
        
        return [TokenLedgerEntry(**e) for e in entries], total, current_balance
    
    async def get_reward_summary(self, user_id: str) -> dict:
        """Get user's reward summary"""
        current_balance = await self.get_user_balance(user_id)
        
        # Calculate lifetime earnings (all credits)
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "type": "credit"
                }
            },
            {
                "$group": {
                    "_id": "$reason",
                    "total": {"$sum": "$amount"}
                }
            }
        ]
        
        earnings_by_reason = {}
        total_earned = 0.0
        
        async for doc in self.db.token_ledger.aggregate(pipeline):
            earnings_by_reason[doc["_id"]] = doc["total"]
            total_earned += doc["total"]
        
        return {
            "current_balance": round(current_balance, 2),
            "lifetime_earnings": round(total_earned, 2),
            "earnings_breakdown": earnings_by_reason
        }
