from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from typing import Optional
from models.payment import (
    PaymentInitiate, PaymentResponse, Payment,
    RefundCreate, Refund, PaymentWebhook
)
from models.user import User
from middleware.auth import get_current_user, get_current_admin
from services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/initiate", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def initiate_payment(
    payment_data: PaymentInitiate,
    current_user: User = Depends(get_current_user)
):
    """
    Initiate payment for an order
    
    - **order_id**: Order to pay for
    - **payment_method**: Payment method (gcash | card | bank)
    - **return_url**: Optional URL to return to after payment
    - **metadata**: Optional additional data
    
    Process:
    1. Validates order exists and belongs to user
    2. Checks order is in 'pending' status
    3. Initiates payment with provider
    4. Returns checkout URL or payment instructions
    
    Response includes:
    - **checkout_url**: URL to complete payment (redirect-based)
    - **qr_code**: QR code for scanning (QR-based payments)
    - **instructions**: Payment instructions
    """
    payment_service = PaymentService()
    
    payment, provider_data = await payment_service.initiate_payment(
        current_user.id,
        payment_data
    )
    
    return PaymentResponse(
        _id=payment.id,
        order_id=payment.order_id,
        amount=payment.amount,
        currency=payment.currency,
        method=payment.method,
        status=payment.status,
        provider=payment.provider,
        provider_reference=payment.provider_reference,
        checkout_url=provider_data.get("checkout_url"),
        qr_code=provider_data.get("qr_code"),
        instructions=provider_data.get("instructions"),
        created_at=payment.created_at
    )


@router.get("/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get payment details
    
    User can only view their own payments.
    """
    payment_service = PaymentService()
    
    payment = await payment_service.get_payment(payment_id, current_user.id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment


@router.post("/{payment_id}/verify", response_model=Payment)
async def verify_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Verify payment status with provider
    
    Queries the payment provider for the latest status.
    If payment is completed, order will be automatically confirmed.
    """
    payment_service = PaymentService()
    
    # Get payment to verify access
    payment = await payment_service.get_payment(payment_id, current_user.id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Verify with provider
    return await payment_service.verify_payment(payment_id)


@router.get("", response_model=dict)
async def get_user_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's payment history
    
    - **page**: Page number (default: 1)
    - **limit**: Items per page (default: 20, max: 100)
    """
    payment_service = PaymentService()
    
    payments, total = await payment_service.get_user_payments(
        current_user.id,
        page,
        limit
    )
    
    return {
        "items": payments,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.post("/{payment_id}/refund", response_model=Refund)
async def refund_payment(
    payment_id: str,
    refund_data: RefundCreate,
    current_user: User = Depends(get_current_admin)
):
    """
    Process refund (Admin only)
    
    - **reason**: Refund reason (cancelled_by_buyer | cancelled_by_farmer | out_of_stock | quality_issue | other)
    - **reason_note**: Optional detailed reason
    
    Process:
    1. Validates payment exists and is completed
    2. Processes refund with payment provider
    3. Updates payment status to 'refunded'
    4. Updates order status to 'refunded'
    5. Creates refund record
    """
    payment_service = PaymentService()
    
    return await payment_service.process_refund(
        payment_id,
        refund_data,
        current_user.id
    )


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def payment_webhook(
    request: Request,
    webhook_data: PaymentWebhook
):
    """
    Payment provider webhook endpoint
    
    Receives notifications from payment providers about payment status changes.
    
    NOTE: This endpoint should not require authentication as it's called by
    external payment providers. Instead, webhook signature is verified.
    
    For production:
    - Configure this URL in your payment provider dashboard
    - Ensure webhook signature verification is implemented
    - Add IP whitelisting if provider supports it
    """
    payment_service = PaymentService()
    
    # Get signature from headers if present
    signature = request.headers.get("X-Signature")
    
    try:
        await payment_service.handle_webhook(
            webhook_data.provider,
            webhook_data.model_dump(),
            signature
        )
        
        return {"status": "success"}
    
    except Exception as e:
        # Log error but return 200 to prevent retries
        # Payment providers usually retry failed webhooks
        return {"status": "error", "message": str(e)}
