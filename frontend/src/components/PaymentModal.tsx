import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  CheckCircle, 
  Loader2, 
  Copy, 
  CheckCheck,
  Clock,
  AlertCircle,
  QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { paymentApi, PaymentInitResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  paymentMethod: "gcash" | "maya";
  onPaymentSuccess: () => void;
}

const paymentBranding = {
  gcash: {
    name: "GCash",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: "💙",
  },
  maya: {
    name: "Maya",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    icon: "💚",
  },
};

type PaymentStep = "phone" | "processing" | "pending" | "success" | "failed";

const PaymentModal = ({
  open,
  onClose,
  orderId,
  amount,
  paymentMethod,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const [step, setStep] = useState<PaymentStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentInitResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const { toast } = useToast();

  const branding = paymentBranding[paymentMethod];

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("phone");
      setPhoneNumber("");
      setPaymentData(null);
      setCountdown(300);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (step === "pending" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (countdown === 0) {
      setStep("failed");
    }
  }, [step, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");

    try {
      const response = await paymentApi.initiate(orderId, paymentMethod, phoneNumber);
      setPaymentData(response);
      setStep("pending");
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setStep("phone");
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentData) return;

    setStep("processing");

    try {
      await paymentApi.confirm(paymentData.id);
      setStep("success");
      
      // Wait a moment then call success callback
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (error) {
      toast({
        title: "Confirmation failed",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
      setStep("pending");
    }
  };

  const copyReference = () => {
    if (paymentData) {
      navigator.clipboard.writeText(paymentData.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={cn("text-2xl")}>{branding.icon}</span>
            Pay with {branding.name}
          </DialogTitle>
          <DialogDescription>
            Complete your payment of ₱{amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Enter Phone */}
          {step === "phone" && (
            <div className="space-y-4">
              <div className={cn("p-4 rounded-xl", branding.bgColor)}>
                <div className="flex items-center gap-3">
                  <Smartphone className={cn("h-8 w-8", branding.textColor)} />
                  <div>
                    <p className={cn("font-semibold", branding.textColor)}>
                      {branding.name} Payment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enter your registered {branding.name} number
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive a payment request on your {branding.name} app
                </p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount to pay</span>
                <span className={cn("text-2xl font-bold", branding.textColor)}>
                  ₱{amount.toFixed(2)}
                </span>
              </div>

              <Button 
                className={cn("w-full h-12 text-white", branding.color)}
                onClick={handleInitiatePayment}
              >
                Continue to {branding.name}
              </Button>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === "processing" && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className={cn("h-16 w-16 animate-spin mx-auto", branding.textColor)} />
              <div>
                <p className="font-semibold">Processing your payment...</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we connect to {branding.name}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Pending - Show QR / Reference */}
          {step === "pending" && paymentData && (
            <div className="space-y-4">
              <div className={cn("p-4 rounded-xl text-center", branding.bgColor)}>
                <Clock className={cn("h-6 w-6 mx-auto mb-2", branding.textColor)} />
                <p className={cn("font-semibold", branding.textColor)}>
                  Waiting for payment
                </p>
                <p className="text-2xl font-mono font-bold mt-1">
                  {formatTime(countdown)}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <img 
                    src={paymentData.qr_code} 
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div className="p-4 rounded-xl bg-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Reference Number</p>
                    <p className="font-mono font-bold text-lg">{paymentData.reference_number}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={copyReference}>
                    {copied ? (
                      <CheckCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Instructions:</p>
                <ol className="space-y-1 text-sm text-muted-foreground">
                  {paymentData.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="shrink-0">{idx + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              {/* Demo: Confirm Payment Button */}
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-xs text-yellow-800 text-center mb-2">
                  🎭 Demo Mode: Click below to simulate payment confirmation
                </p>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={handleConfirmPayment}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Simulate Payment Received
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-green-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your payment of ₱{amount.toFixed(2)} has been confirmed
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {paymentData?.reference_number}
              </Badge>
            </div>
          )}

          {/* Step 5: Failed */}
          {step === "failed" && (
            <div className="text-center py-8 space-y-4">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-red-600">Payment Expired</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The payment window has expired. Please try again.
                </p>
              </div>
              <Button onClick={() => setStep("phone")} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
