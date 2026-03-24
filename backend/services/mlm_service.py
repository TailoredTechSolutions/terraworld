from typing import Optional, List, Tuple
from models.mlm import (
    BinaryTreeNode, BusinessVolume, CommissionRun,
    CommissionLine, Rank, UserRank, GenealogyNode
)
from services.reward_service import RewardService
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now
from fastapi import HTTPException, status
from datetime import datetime
from config.settings import settings


class MLMService:
    """MLM/Network marketing service"""
    
    def __init__(self):
        self.db = get_database()
        self.reward_service = RewardService()
    
    async def create_binary_tree_node(
        self,
        user_id: str,
        sponsor_id: str,
        parent_id: Optional[str] = None,
        position: Optional[str] = None
    ) -> BinaryTreeNode:
        """
        Create binary tree node for new member
        
        Args:
            user_id: New member's user ID
            sponsor_id: Who referred them
            parent_id: Parent node (for specific placement)
            position: Desired position (left/right)
        """
        # Check if user already in tree
        existing = await self.db.binary_tree.find_one({"user_id": user_id})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already in binary tree"
            )
        
        # If no parent specified, find placement
        if not parent_id:
            parent_id, position = await self._find_placement(sponsor_id)
        
        # Get parent node to determine level and path
        parent_node = await self.db.binary_tree.find_one({"user_id": parent_id})
        if not parent_node:
            # Root node
            level = 0
            path = f"/{user_id}"
        else:
            level = parent_node["level"] + 1
            path = f"{parent_node['path']}/{user_id}"
        
        # Create node
        node = BinaryTreeNode(
            _id=generate_uuid(),
            user_id=user_id,
            parent_id=parent_id,
            sponsor_id=sponsor_id,
            position=position,
            level=level,
            path=path
        )
        
        await self.db.binary_tree.insert_one(node.model_dump(by_alias=True))
        
        # Update parent's child reference
        if parent_node:
            child_field = f"{position}_child_id"
            await self.db.binary_tree.update_one(
                {"user_id": parent_id},
                {"$set": {child_field: user_id}}
            )
        
        return node
    
    async def record_business_volume(
        self,
        user_id: str,
        amount: float,
        period: Optional[str] = None
    ) -> None:
        """
        Record business volume for user
        
        Propagates volume up the binary tree
        """
        if not period:
            period = datetime.utcnow().strftime("%Y-%m")
        
        # Get or create volume record for user
        volume_record = await self.db.business_volume.find_one({
            "user_id": user_id,
            "period": period
        })
        
        if not volume_record:
            volume_record = BusinessVolume(
                _id=generate_uuid(),
                user_id=user_id,
                period=period,
                personal_volume=amount
            ).model_dump(by_alias=True)
            await self.db.business_volume.insert_one(volume_record)
        else:
            await self.db.business_volume.update_one(
                {"_id": volume_record["_id"]},
                {"$inc": {"personal_volume": amount}}
            )
        
        # Propagate volume up the tree
        await self._propagate_volume(user_id, amount, period)
    
    async def calculate_commissions(
        self,
        start_date: str,
        end_date: str,
        run_type: str = "bi_weekly"
    ) -> CommissionRun:
        """
        Calculate commissions for a period
        
        This is a simplified implementation. Production version would:
        - Handle pairing logic
        - Apply caps and limits
        - Calculate matching bonuses
        - Handle carry forward
        - Process rank bonuses
        """
        run = CommissionRun(
            _id=generate_uuid(),
            period={"start": start_date, "end": end_date},
            run_type=run_type,
            status="processing",
            started_at=utc_now()
        )
        
        await self.db.commission_runs.insert_one(run.model_dump(by_alias=True))
        
        try:
            commission_lines = []
            total_commissions = 0.0
            total_members = 0
            
            # Get all members with volume in this period
            period = datetime.fromisoformat(start_date.replace('Z', '')).strftime("%Y-%m")
            
            volumes = await self.db.business_volume.find({"period": period}).to_list(10000)
            
            for volume_record in volumes:
                user_id = volume_record["user_id"]
                total_members += 1
                
                # Calculate pairing bonus
                pairing_commission = await self._calculate_pairing_bonus(volume_record)
                
                if pairing_commission > 0:
                    commission_line = CommissionLine(
                        _id=generate_uuid(),
                        run_id=run.id,
                        user_id=user_id,
                        type="pairing_bonus",
                        amount=pairing_commission,
                        calculation={
                            "left_volume": volume_record["left_volume"],
                            "right_volume": volume_record["right_volume"],
                            "paired_volume": min(volume_record["left_volume"], volume_record["right_volume"]),
                            "rate": settings.PAIRING_BONUS_RATE,
                            "cap": settings.PAIRING_BONUS_CAP_DAILY
                        },
                        status="approved"
                    )
                    
                    commission_lines.append(commission_line.model_dump(by_alias=True))
                    total_commissions += pairing_commission
                    
                    # Credit to token ledger
                    await self.reward_service.credit_reward(
                        user_id=user_id,
                        amount=pairing_commission,
                        reason="commission",
                        description=f"Pairing bonus for {period}",
                        reference_id=run.id,
                        reference_type="commission_run"
                    )
            
            # Insert all commission lines
            if commission_lines:
                await self.db.commission_lines.insert_many(commission_lines)
            
            # Update run status
            await self.db.commission_runs.update_one(
                {"_id": run.id},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": utc_now(),
                        "stats": {
                            "total_members": total_members,
                            "total_commissions": round(total_commissions, 2),
                            "total_pairs": len(commission_lines)
                        }
                    }
                }
            )
            
        except Exception as e:
            # Mark run as failed
            await self.db.commission_runs.update_one(
                {"_id": run.id},
                {"$set": {"status": "failed"}}
            )
            raise e
        
        updated_run = await self.db.commission_runs.find_one({"_id": run.id})
        return CommissionRun(**updated_run)
    
    async def get_user_genealogy(
        self,
        user_id: str,
        depth: int = 3
    ) -> Optional[GenealogyNode]:
        """Get user's genealogy tree"""
        node = await self.db.binary_tree.find_one({"user_id": user_id})
        if not node:
            return None
        
        return await self._build_genealogy_node(user_id, depth)
    
    async def get_user_commissions(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 50
    ) -> Tuple[List[CommissionLine], int]:
        """Get user's commission history"""
        query = {"user_id": user_id}
        
        total = await self.db.commission_lines.count_documents(query)
        
        skip = (page - 1) * limit
        commissions = await self.db.commission_lines.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        return [CommissionLine(**c) for c in commissions], total
    
    async def get_commission_summary(self, user_id: str) -> dict:
        """Get user's commission summary"""
        # Total commissions
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": "$type",
                    "total": {"$sum": "$amount"}
                }
            }
        ]
        
        breakdown = {}
        total = 0.0
        
        async for doc in self.db.commission_lines.aggregate(pipeline):
            breakdown[doc["_id"]] = doc["total"]
            total += doc["total"]
        
        # Current period
        current_period = datetime.utcnow().strftime("%Y-%m")
        current_period_pipeline = [
            {
                "$lookup": {
                    "from": "commission_runs",
                    "localField": "run_id",
                    "foreignField": "_id",
                    "as": "run"
                }
            },
            {
                "$match": {
                    "user_id": user_id,
                    "run.period.start": {"$regex": f"^{current_period}"}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }
            }
        ]
        
        current_period_total = 0.0
        async for doc in self.db.commission_lines.aggregate(current_period_pipeline):
            current_period_total = doc["total"]
        
        return {
            "total_commissions": round(total, 2),
            "commission_breakdown": breakdown,
            "current_period_earnings": round(current_period_total, 2)
        }
    
    async def _find_placement(self, sponsor_id: str) -> Tuple[str, str]:
        """
        Find placement in binary tree
        
        Uses spillover logic: places in first available position
        under sponsor or their downline
        """
        # Start with sponsor
        queue = [sponsor_id]
        
        while queue:
            current_id = queue.pop(0)
            node = await self.db.binary_tree.find_one({"user_id": current_id})
            
            if not node:
                # This is the sponsor (root)
                return current_id, "left"
            
            # Check left position
            if not node.get("left_child_id"):
                return current_id, "left"
            
            # Check right position
            if not node.get("right_child_id"):
                return current_id, "right"
            
            # Both positions filled, check children
            queue.append(node["left_child_id"])
            queue.append(node["right_child_id"])
        
        # Fallback (shouldn't reach here)
        return sponsor_id, "left"
    
    async def _propagate_volume(self, user_id: str, amount: float, period: str) -> None:
        """Propagate volume up the binary tree"""
        node = await self.db.binary_tree.find_one({"user_id": user_id})
        
        while node and node.get("parent_id"):
            parent_node = await self.db.binary_tree.find_one({"user_id": node["parent_id"]})
            
            if not parent_node:
                break
            
            # Determine which leg to add volume to
            leg_field = f"{node['position']}_volume"
            
            # Get or create parent's volume record
            parent_volume = await self.db.business_volume.find_one({
                "user_id": parent_node["user_id"],
                "period": period
            })
            
            if not parent_volume:
                parent_volume = BusinessVolume(
                    _id=generate_uuid(),
                    user_id=parent_node["user_id"],
                    period=period
                ).model_dump(by_alias=True)
                await self.db.business_volume.insert_one(parent_volume)
            
            # Add volume to appropriate leg
            await self.db.business_volume.update_one(
                {"_id": parent_volume["_id"]},
                {"$inc": {leg_field: amount}}
            )
            
            # Move up the tree
            node = parent_node
    
    async def _calculate_pairing_bonus(self, volume_record: dict) -> float:
        """Calculate pairing bonus from business volume"""
        left = volume_record.get("left_volume", 0.0)
        right = volume_record.get("right_volume", 0.0)
        
        # Pairing is the smaller of the two legs
        paired_volume = min(left, right)
        
        if paired_volume <= 0:
            return 0.0
        
        # Calculate commission
        commission = paired_volume * settings.PAIRING_BONUS_RATE
        
        # Apply cap
        if commission > settings.PAIRING_BONUS_CAP_DAILY:
            commission = settings.PAIRING_BONUS_CAP_DAILY
        
        return round(commission, 2)
    
    async def _build_genealogy_node(
        self,
        user_id: str,
        depth: int
    ) -> Optional[GenealogyNode]:
        """Recursively build genealogy tree"""
        if depth <= 0:
            return None
        
        # Get user info
        user = await self.db.users.find_one({"_id": user_id})
        if not user:
            return None
        
        # Get binary tree node
        tree_node = await self.db.binary_tree.find_one({"user_id": user_id})
        if not tree_node:
            return None
        
        # Get current period volume
        period = datetime.utcnow().strftime("%Y-%m")
        volume = await self.db.business_volume.find_one({
            "user_id": user_id,
            "period": period
        })
        
        # Get user rank
        user_rank = await self.db.user_ranks.find_one({
            "user_id": user_id,
            "is_current": True
        })
        
        # Build node
        node = GenealogyNode(
            user_id=user_id,
            name=f"{user['profile']['first_name']} {user['profile']['last_name']}",
            position=tree_node.get("position", "root"),
            level=tree_node["level"],
            personal_volume=volume.get("personal_volume", 0.0) if volume else 0.0,
            left_volume=volume.get("left_volume", 0.0) if volume else 0.0,
            right_volume=volume.get("right_volume", 0.0) if volume else 0.0,
            rank=user_rank.get("rank_name") if user_rank else None
        )
        
        # Recursively build children
        if tree_node.get("left_child_id"):
            node.left_child = await self._build_genealogy_node(
                tree_node["left_child_id"],
                depth - 1
            )
        
        if tree_node.get("right_child_id"):
            node.right_child = await self._build_genealogy_node(
                tree_node["right_child_id"],
                depth - 1
            )
        
        return node
