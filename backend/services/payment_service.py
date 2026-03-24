from typing import Optional, List, Tuple
from models.payment import (
    Payment, PaymentInitiate, PaymentEvent,
    Refund, RefundCreate
)
from models.order import Order
from services.payment_provider import get_payment_provider, PaymentProvider
from services.order_service import OrderService
from utils.database import get_database
from utils.helpers import generate_uuid, utc_now
from fastapi import HTTPException, status


class PaymentService:
    """Payment processing service"""
    
    def __init__(self, provider_name: str = "mock"):
        self.db = get_database()
        self.provider: PaymentProvider = get_payment_provider(provider_name)
        self.order_service = OrderService()
    
    async def initiate_payment(
        self,
        user_id: str,
        payment_data: PaymentInitiate
    ) -> Tuple[Payment, dict]:
        """
        Initiate payment for an order
        
        Returns:
            Tuple of (Payment, provider_data with checkout_url/qr_code)
        """
        # Get order
        order = await self.order_service.get_order(payment_data.order_id, user_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Verify user is the buyer
        if order.buyer_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only pay for your own orders"
            )
        
        # Check if order is in payable status
        if order.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be paid. Current status: {order.status}"
            )
        
        # Check if payment already exists
        existing_payment = await self.db.payments.find_one({
            "order_id": payment_data.order_id,
            "status": {"$in": ["pending", "processing", "completed"]}
        })
        
        if existing_payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already exists for this order"
            )
        
        # Get customer info
        user = await self.db.users.find_one({"_id": user_id})
        customer_info = {
            "name": f"{user['profile']['first_name']} {user['profile']['last_name']}",
            "email": user["email"],
            "phone": user.get("phone")
        }
        
        # Initiate payment with provider
        provider_reference, provider_data = await self.provider.initiate_payment(
            amount=order.pricing["total"],
            currency="PHP",
            order_id=order.id,
            customer_info=customer_info,
            metadata=payment_data.metadata
        )
        
        # Create payment record
        payment = Payment(
            _id=generate_uuid(),
            order_id=order.id,
            user_id=user_id,
            amount=order.pricing["total"],
            currency="PHP",
            method=payment_data.payment_method,
            status="pending",
            provider="mock",  # or "gcash" when configured
            provider_reference=provider_reference,
            provider_response=provider_data,
            metadata=payment_data.metadata,
            events=[
                PaymentEvent(
                    event="created",
                    note="Payment initiated"
                ).model_dump()
            ]
        )
        
        await self.db.payments.insert_one(payment.model_dump(by_alias=True))
        
        return payment, provider_data
    
    async def verify_payment(self, payment_id: str) -> Payment:
        """Verify payment status with provider"""
        payment_dict = await self.db.payments.find_one({"_id": payment_id})
        if not payment_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        payment = Payment(**payment_dict)
        
        # Query provider for current status
        provider_status, provider_data = await self.provider.verify_payment(
            payment.provider_reference
        )
        
        # Update payment if status changed
        if provider_status != payment.status:
            await self._update_payment_status(
                payment_id,
                provider_status,
                provider_data
            )
            
            # If payment completed, update order
            if provider_status == "completed":
                await self.order_service.update_order_status(
                    payment.order_id,
                    "confirmed",
                    note="Payment completed"
                )
        
        # Return updated payment
        updated_payment = await self.db.payments.find_one({"_id": payment_id})
        return Payment(**updated_payment)
    
    async def handle_webhook(
        self,
        provider: str,
        payload: dict,
        signature: Optional[str] = None
    ) -> None:
        """
        Handle payment provider webhook
        
        Webhooks notify us of payment status changes
        """
        # Verify webhook authenticity
        is_valid, parsed_data = await self.provider.verify_webhook(payload, signature)
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Extract payment reference and status
        provider_reference = parsed_data.get("transaction_id")
        new_status = parsed_data.get("status")
        
        if not provider_reference or not new_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook payload"
            )
        
        # Find payment by provider reference
        payment = await self.db.payments.find_one({
            "provider_reference": provider_reference
        })
        
        if not payment:
            # Webhook for unknown payment, log and ignore
            return
        
        # Update payment status
        await self._update_payment_status(
            payment["_id"],
            new_status,
            parsed_data
        )
        
        # Update order if payment completed
        if new_status == "completed":
            await self.order_service.update_order_status(
                payment["order_id"],
                "confirmed",
                note="Payment completed via webhook"
            )
    
    async def process_refund(
        self,
        payment_id: str,
        refund_data: RefundCreate,
        processed_by: str
    ) -> Refund:
        """Process a refund"""
        # Get payment
        payment_dict = await self.db.payments.find_one({"_id": payment_id})
        if not payment_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        payment = Payment(**payment_dict)
        
        # Check if payment can be refunded
        if payment.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only completed payments can be refunded"
            )
        
        # Check if already refunded
        if payment.refund_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already refunded"
            )
        
        # Process refund with provider
        refund_reference, provider_data = await self.provider.process_refund(
            payment.provider_reference,
            payment.amount,
            refund_data.reason
        )
        
        # Create refund record
        refund = Refund(
            _id=generate_uuid(),
            payment_id=payment.id,
            order_id=payment.order_id,
            amount=payment.amount,
            reason=refund_data.reason,
            reason_note=refund_data.reason_note,
            status="completed",  # Mock provider completes immediately
            processed_by=processed_by,
            provider_reference=refund_reference,
            completed_at=utc_now()
        )
        
        await self.db.refunds.insert_one(refund.model_dump(by_alias=True))
        
        # Update payment
        await self.db.payments.update_one(
            {"_id": payment_id},
            {
                "$set": {
                    "status": "refunded",
                    "refund_id": refund.id,
                    "updated_at": utc_now()
                },
                "$push": {
                    "events": PaymentEvent(
                        event="refunded",
                        note=f"Refund processed: {refund_data.reason}"
                    ).model_dump()
                }
            }
        )
        
        # Update order status
        await self.order_service.update_order_status(
            payment.order_id,
            "refunded",
            note=f"Payment refunded: {refund_data.reason}"
        )
        
        return refund
    
    async def get_user_payments(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Payment], int]:
        """Get user's payments"""
        query = {"user_id": user_id}
        
        # Get total count
        total = await self.db.payments.count_documents(query)
        
        # Get payments
        skip = (page - 1) * limit
        payments = await self.db.payments.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        return [Payment(**p) for p in payments], total
    
    async def get_payment(self, payment_id: str, user_id: Optional[str] = None) -> Optional[Payment]:
        """Get payment by ID"""
        payment_dict = await self.db.payments.find_one({"_id": payment_id})
        
        if not payment_dict:
            return None
        
        # Verify access if user_id provided
        if user_id and payment_dict["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return Payment(**payment_dict)
    
    async def _update_payment_status(
        self,
        payment_id: str,
        new_status: str,
        provider_data: dict
    ) -> None:
        """Update payment status"""
        update_fields = {
            "status": new_status,
            "updated_at": utc_now()
        }
        
        if new_status == "completed":
            update_fields["completed_at"] = utc_now()
        elif new_status == "failed":
            update_fields["failed_at"] = utc_now()
        
        event = PaymentEvent(
            event=new_status,
            data=provider_data,
            note=f"Payment {new_status}"
        )
        
        await self.db.payments.update_one(
            {"_id": payment_id},
            {
                "$set": update_fields,
                "$push": {"events": event.model_dump()}
            }
        )
