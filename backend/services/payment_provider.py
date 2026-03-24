from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple


class PaymentProvider(ABC):
    """Abstract payment provider interface"""
    
    @abstractmethod
    async def initiate_payment(
        self,
        amount: float,
        currency: str,
        order_id: str,
        customer_info: dict,
        metadata: dict = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Initiate a payment
        
        Returns:
            Tuple of (provider_reference, provider_data)
            provider_data may include: checkout_url, qr_code, instructions
        """
        pass
    
    @abstractmethod
    async def verify_payment(
        self,
        provider_reference: str
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Verify payment status
        
        Returns:
            Tuple of (status, provider_data)
            status: pending | processing | completed | failed
        """
        pass
    
    @abstractmethod
    async def process_refund(
        self,
        provider_reference: str,
        amount: float,
        reason: str
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Process a refund
        
        Returns:
            Tuple of (refund_reference, provider_data)
        """
        pass
    
    @abstractmethod
    async def verify_webhook(
        self,
        payload: dict,
        signature: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Verify webhook authenticity
        
        Returns:
            Tuple of (is_valid, parsed_data)
        """
        pass
    
    @abstractmethod
    async def process_payout(
        self,
        amount: float,
        destination: str,
        metadata: dict = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Process a payout to merchant/farmer
        
        Returns:
            Tuple of (payout_reference, provider_data)
        """
        pass


class MockPaymentProvider(PaymentProvider):
    """Mock payment provider for testing"""
    
    def __init__(self):
        self.payments = {}
        self.refunds = {}
        self.payouts = {}
    
    async def initiate_payment(
        self,
        amount: float,
        currency: str,
        order_id: str,
        customer_info: dict,
        metadata: dict = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Mock payment initiation"""
        from utils.helpers import generate_uuid
        
        reference = f"MOCK-PAY-{generate_uuid()[:8].upper()}"
        
        self.payments[reference] = {
            "status": "pending",
            "amount": amount,
            "currency": currency,
            "order_id": order_id,
            "customer_info": customer_info,
            "metadata": metadata or {}
        }
        
        return reference, {
            "checkout_url": f"https://mock-payment.terra.test/checkout/{reference}",
            "qr_code": None,
            "instructions": "This is a mock payment. Use test cards: 4111111111111111 (success), 4000000000000002 (decline)"
        }
    
    async def verify_payment(
        self,
        provider_reference: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Mock payment verification"""
        if provider_reference not in self.payments:
            return "failed", {"error": "Payment not found"}
        
        payment = self.payments[provider_reference]
        
        # Auto-complete mock payments after creation
        if payment["status"] == "pending":
            payment["status"] = "completed"
            self.payments[provider_reference] = payment
        
        return payment["status"], {
            "amount": payment["amount"],
            "currency": payment["currency"],
            "order_id": payment["order_id"]
        }
    
    async def process_refund(
        self,
        provider_reference: str,
        amount: float,
        reason: str
    ) -> Tuple[str, Dict[str, Any]]:
        """Mock refund processing"""
        from utils.helpers import generate_uuid
        
        refund_reference = f"MOCK-REF-{generate_uuid()[:8].upper()}"
        
        self.refunds[refund_reference] = {
            "payment_reference": provider_reference,
            "amount": amount,
            "reason": reason,
            "status": "completed"
        }
        
        return refund_reference, {
            "status": "completed",
            "amount": amount
        }
    
    async def verify_webhook(
        self,
        payload: dict,
        signature: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """Mock webhook verification"""
        # Mock webhooks are always valid
        return True, payload
    
    async def process_payout(
        self,
        amount: float,
        destination: str,
        metadata: dict = None
    ) -> Tuple[str, Dict[str, Any]]:
        """Mock payout processing"""
        from utils.helpers import generate_uuid
        
        payout_reference = f"MOCK-PAYOUT-{generate_uuid()[:8].upper()}"
        
        self.payouts[payout_reference] = {
            "amount": amount,
            "destination": destination,
            "metadata": metadata or {},
            "status": "completed"
        }
        
        return payout_reference, {
            "status": "completed",
            "amount": amount,
            "destination": destination
        }


class GCashPaymentProvider(PaymentProvider):
    """
    GCash payment provider
    
    NOTE: This is a template for GCash integration.
    Requires GCash API credentials and proper setup.
    """
    
    def __init__(self, api_key: str, api_secret: str, base_url: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url
    
    async def initiate_payment(
        self,
        amount: float,
        currency: str,
        order_id: str,
        customer_info: dict,
        metadata: dict = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Initiate GCash payment
        
        TODO: Implement actual GCash API integration
        - Use GCash Create Payment API
        - Handle authentication
        - Return checkout URL or QR code
        """
        raise NotImplementedError("GCash integration requires API credentials")
    
    async def verify_payment(
        self,
        provider_reference: str
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Verify GCash payment status
        
        TODO: Implement actual GCash API integration
        - Query GCash Payment Status API
        - Map GCash status to our status
        """
        raise NotImplementedError("GCash integration requires API credentials")
    
    async def process_refund(
        self,
        provider_reference: str,
        amount: float,
        reason: str
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Process GCash refund
        
        TODO: Implement actual GCash API integration
        - Use GCash Refund API
        - Handle partial vs full refunds
        """
        raise NotImplementedError("GCash integration requires API credentials")
    
    async def verify_webhook(
        self,
        payload: dict,
        signature: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Verify GCash webhook
        
        TODO: Implement actual GCash webhook verification
        - Verify signature
        - Parse webhook payload
        """
        raise NotImplementedError("GCash integration requires API credentials")
    
    async def process_payout(
        self,
        amount: float,
        destination: str,
        metadata: dict = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Process GCash payout
        
        TODO: Implement actual GCash API integration
        - Use GCash Payout API
        - Handle wallet-to-wallet transfer
        """
        raise NotImplementedError("GCash integration requires API credentials")


def get_payment_provider(provider_name: str = "mock") -> PaymentProvider:
    """
    Get payment provider instance
    
    Args:
        provider_name: Provider name (mock | gcash | stripe)
    
    Returns:
        PaymentProvider instance
    """
    if provider_name == "mock":
        return MockPaymentProvider()
    elif provider_name == "gcash":
        # TODO: Get credentials from environment
        # api_key = os.environ.get("GCASH_API_KEY")
        # api_secret = os.environ.get("GCASH_API_SECRET")
        # base_url = os.environ.get("GCASH_BASE_URL")
        # return GCashPaymentProvider(api_key, api_secret, base_url)
        raise NotImplementedError("GCash provider requires API credentials configuration")
    else:
        raise ValueError(f"Unknown payment provider: {provider_name}")
