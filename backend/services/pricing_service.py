from typing import Tuple, Optional
from models.order import PricingBreakdown
from utils.database import get_database
from config.settings import settings


class PricingService:
    """Pricing calculation service"""
    
    def __init__(self):
        self.db = get_database()
    
    async def calculate_order_pricing(
        self,
        subtotal: float,
        delivery_address: Optional[dict] = None
    ) -> PricingBreakdown:
        """
        Calculate complete order pricing with breakdown
        
        Args:
            subtotal: Sum of all product prices
            delivery_address: Delivery address with coordinates (for logistics fee)
        
        Returns:
            PricingBreakdown with all fees calculated
        """
        # Get configurable rates from database or use defaults
        platform_fee_rate = await self._get_config("platform_fee_rate", settings.PLATFORM_FEE_RATE)
        tax_rate = await self._get_config("tax_rate", settings.TAX_RATE)
        
        # Calculate platform fee
        platform_fee = round(subtotal * platform_fee_rate, 2)
        
        # Calculate tax (on subtotal + platform fee)
        taxable_amount = subtotal + platform_fee
        tax = round(taxable_amount * tax_rate, 2)
        
        # Calculate logistics fee
        logistics_fee = await self._calculate_logistics_fee(delivery_address)
        
        # Calculate total
        total = subtotal + platform_fee + tax + logistics_fee
        
        return PricingBreakdown(
            subtotal=round(subtotal, 2),
            platform_fee=platform_fee,
            platform_fee_rate=platform_fee_rate,
            tax=tax,
            tax_rate=tax_rate,
            logistics_fee=logistics_fee,
            total=round(total, 2)
        )
    
    async def _calculate_logistics_fee(self, delivery_address: Optional[dict] = None) -> float:
        """
        Calculate logistics/delivery fee
        
        For now, uses base fee from config.
        In production, this would calculate based on:
        - Delivery zone
        - Distance from farm(s)
        - Weight/volume
        - Delivery window
        """
        base_fee = await self._get_config("logistics_base_fee", settings.LOGISTICS_BASE_FEE)
        
        # TODO: Implement zone-based or distance-based calculation
        # If delivery_address has coordinates, query delivery_zones collection
        # Calculate distance from farmer location(s)
        # Apply per-km fee
        
        return round(base_fee, 2)
    
    async def _get_config(self, key: str, default: float) -> float:
        """Get configuration value from database or use default"""
        config = await self.db.system_config.find_one({"key": key})
        if config:
            return float(config["value"])
        return default
    
    def calculate_cart_totals(self, items: list) -> Tuple[float, int]:
        """
        Calculate cart totals
        
        Args:
            items: List of cart items with unit_price and quantity
        
        Returns:
            Tuple of (subtotal, items_count)
        """
        subtotal = 0.0
        items_count = 0
        
        for item in items:
            subtotal += item["unit_price"] * item["quantity"]
            items_count += item["quantity"]
        
        return round(subtotal, 2), items_count
