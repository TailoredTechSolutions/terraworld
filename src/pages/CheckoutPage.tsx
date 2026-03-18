import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, CouponCartItem } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  ArrowLeft, 
  Truck, 
  ShieldCheck,
  Lock,
  Wallet,
  Ticket,
  X,
  User,
  UserPlus,
  Package
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryProviderSelector from "@/components/checkout/DeliveryProviderSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long")
    .regex(/^[\d+\s()-]+$/, "Invalid phone number format"),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(300, "Address too long"),
  city: z.string().trim().min(2, "City is required").max(100, "City name too long"),
  zip: z.string().trim().min(4, "Postal code must be at least 4 digits").max(10, "Postal code too long")
    .regex(/^\d{4,10}$/, "Invalid postal code"),
});

// Relaxed schema for coupon-only orders (no delivery address needed)
const couponOnlySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20, "Phone number too long")
    .regex(/^[\d+\s()-]+$/, "Invalid phone number format"),
});

interface DeliveryEstimate {
  provider: string;
  estimated_fee: number;
  estimated_eta_minutes: number;
  distance_km: number;
  status: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, couponItems, upgradeItem, getTotalPrice, getProductSubtotal, getCouponSubtotal, getUpgradeSubtotal, clearCart, removeItem, removeCoupon, updateCouponRecipient, setUpgrade, hasItems } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [internalBalance, setInternalBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  
  const [selectedDeliveryProvider, setSelectedDeliveryProvider] = useState<string>("");
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);

  const hasProducts = items.length > 0;
  const hasCoupons = couponItems.length > 0;
  const hasUpgrade = upgradeItem !== null;
  const isDigitalOnly = !hasProducts && (hasCoupons || hasUpgrade);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("wallets")
          .select("internal_balance")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setInternalBalance(Number(data.internal_balance) || 0);
      }
      setLoadingWallet(false);
    })();
  }, []);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const productSubtotal = getProductSubtotal();
  const couponSubtotal = getCouponSubtotal();
  const upgradeSubtotal = getUpgradeSubtotal();
  const platformFeePercent = 0.20;
  const commissionPercent = 0.10;
  const vatPercent = 0.12;
  const platformFee = productSubtotal * platformFeePercent;
  const commission = productSubtotal * commissionPercent;
  const subtotalBeforeVAT = productSubtotal + platformFee + commission;
  const vat = subtotalBeforeVAT * vatPercent;
  const deliveryFee = (hasProducts && deliveryEstimate?.estimated_fee) ? deliveryEstimate.estimated_fee : 0;
  const total = subtotalBeforeVAT + vat + deliveryFee + couponSubtotal + upgradeSubtotal;

  const defaultPickupLat = 14.5547;
  const defaultPickupLng = 121.0244;
  const defaultDeliveryLat = 14.5995;
  const defaultDeliveryLng = 120.9842;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDeliveryProviderSelect = (provider: string, estimate: DeliveryEstimate) => {
    setSelectedDeliveryProvider(provider);
    setDeliveryEstimate(estimate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const schema = isCouponOnly ? couponOnlySchema : checkoutSchema;
    const dataToValidate = isCouponOnly 
      ? { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone }
      : formData;

    const validation = schema.safeParse(dataToValidate);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    if (hasProducts && !selectedDeliveryProvider) {
      toast({
        title: "Select Delivery Service",
        description: "Please choose a delivery provider for your product order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process coupon purchases via edge function
      if (hasCoupons) {
        for (const coupon of couponItems) {
          const { data, error } = await supabase.functions.invoke("purchase-coupon", {
            body: { 
              package_id: coupon.packageId,
              recipient: coupon.recipient,
              recipient_details: coupon.recipientDetails || {},
            },
          });
          if (error) throw new Error(error.message);
          if (!data?.success) throw new Error(data?.error || "Coupon purchase failed");
        }
      }

      // Process product order via create-order
      if (hasProducts) {
        const orderItems = items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          farmId: item.product.farmId,
          farmName: item.product.farmName,
        }));

        const { data, error } = await supabase.functions.invoke('create-order', {
          body: {
            customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
            customer_phone: formData.phone,
            customer_email: formData.email || null,
            delivery_address: `${formData.address}, ${formData.city} ${formData.zip}`.trim(),
            items: orderItems,
            payment_method: paymentMethod,
            delivery_provider: selectedDeliveryProvider,
            delivery_fee: deliveryFee,
            notes: null,
          },
        });

        if (error) throw new Error(error.message || 'Failed to create order');
        if (!data?.success || !data?.order) throw new Error(data?.error || 'Order creation failed');

        clearCart();
        navigate("/order-confirmation", { 
          state: { 
            orderId: data.order.order_number,
            total: data.order.total,
            paymentMethod,
            deliveryProvider: selectedDeliveryProvider,
            items: items.length,
            coupons: couponItems.length,
            customerName: `${formData.firstName} ${formData.lastName}`,
            deliveryAddress: `${formData.address}, ${formData.city} ${formData.zip}`,
          } 
        });
      } else {
        // Coupon-only completion
        clearCart();
        navigate("/order-confirmation", {
          state: {
            orderId: `CPN-${Date.now()}`,
            total: couponSubtotal,
            paymentMethod,
            coupons: couponItems.length,
            customerName: `${formData.firstName} ${formData.lastName}`,
          }
        });
      }

      toast({
        title: "Order placed successfully!",
        description: hasCoupons 
          ? `${couponItems.length} coupon(s) activated. BV credited to your account.`
          : "Your order has been confirmed.",
      });

    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasItems()) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some products or coupons before checking out.</p>
            <Button onClick={() => navigate("/")} className="btn-liquid">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Checkout
              </h1>
              <p className="text-muted-foreground">
                {isCouponOnly 
                  ? "Complete your coupon purchase"
                  : "Complete your order for fresh farm produce"
                }
              </p>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Contact / Delivery Information */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  {isCouponOnly ? <User className="h-5 w-5 text-primary" /> : <Truck className="h-5 w-5 text-primary" />}
                  {isCouponOnly ? "Contact Information" : "Delivery Information"}
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" placeholder="Juan" 
                      value={formData.firstName} onChange={handleInputChange}
                      className="glass-card border-glass-border focus:border-primary" required 
                    />
                    {formErrors.firstName && <p className="text-sm text-destructive">{formErrors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" placeholder="Dela Cruz" 
                      value={formData.lastName} onChange={handleInputChange}
                      className="glass-card border-glass-border focus:border-primary" required 
                    />
                    {formErrors.lastName && <p className="text-sm text-destructive">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" type="email" placeholder="juan@example.com" 
                    value={formData.email} onChange={handleInputChange}
                    className="glass-card border-glass-border focus:border-primary" required 
                  />
                  {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" type="tel" placeholder="+63 917 123 4567" 
                    value={formData.phone} onChange={handleInputChange}
                    className="glass-card border-glass-border focus:border-primary" required 
                  />
                  {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                </div>

                {/* Address fields only for product orders */}
                {hasProducts && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input 
                        id="address" placeholder="123 Main Street, Barangay..." 
                        value={formData.address} onChange={handleInputChange}
                        className="glass-card border-glass-border focus:border-primary" required 
                      />
                      {formErrors.address && <p className="text-sm text-destructive">{formErrors.address}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" placeholder="Manila" 
                          value={formData.city} onChange={handleInputChange}
                          className="glass-card border-glass-border focus:border-primary" required 
                        />
                        {formErrors.city && <p className="text-sm text-destructive">{formErrors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">Postal Code</Label>
                        <Input 
                          id="zip" placeholder="1000" 
                          value={formData.zip} onChange={handleInputChange}
                          className="glass-card border-glass-border focus:border-primary" required 
                        />
                        {formErrors.zip && <p className="text-sm text-destructive">{formErrors.zip}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Delivery Provider Selection – only for product orders */}
              {hasProducts && (
                <DeliveryProviderSelector
                  pickupLat={defaultPickupLat}
                  pickupLng={defaultPickupLng}
                  deliveryLat={defaultDeliveryLat}
                  deliveryLng={defaultDeliveryLng}
                  onProviderSelect={handleDeliveryProviderSelect}
                  selectedProvider={selectedDeliveryProvider}
                />
              )}

              {/* Payment Method */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover",
                    paymentMethod === "card" ? "border-2 border-primary bg-primary/10 shadow-glow-primary" : "border border-glass-border glass-card"
                  )}>
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, JCB</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover",
                    paymentMethod === "gcash" ? "border-2 border-primary bg-primary/10 shadow-glow-primary" : "border border-glass-border glass-card"
                  )}>
                    <RadioGroupItem value="gcash" id="gcash" />
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">GCash</p>
                      <p className="text-sm text-muted-foreground">Pay with your GCash wallet</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover",
                    paymentMethod === "internal_wallet" ? "border-2 border-primary bg-primary/10 shadow-glow-primary" : "border border-glass-border glass-card"
                  )}>
                    <RadioGroupItem value="internal_wallet" id="internal_wallet" />
                    <Wallet className="h-5 w-5 text-emerald-600" />
                    <div className="flex-1">
                      <p className="font-medium">Internal Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        {loadingWallet ? "Loading..." : `Balance: ₱${internalBalance.toLocaleString()}`}
                      </p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover",
                    paymentMethod === "crypto" ? "border-2 border-primary bg-primary/10 shadow-glow-primary" : "border border-glass-border glass-card"
                  )}>
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Bitcoin className="h-5 w-5 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium">Cryptocurrency</p>
                      <p className="text-sm text-muted-foreground">BTC, ETH, USDC</p>
                    </div>
                  </label>
                </RadioGroup>

                {/* Internal Wallet Balance Preview */}
                {paymentMethod === "internal_wallet" && (
                  <div className="mt-3 p-4 rounded-xl glass-card border border-emerald-500/30 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wallet Balance</span>
                      <span className="font-semibold text-emerald-600">₱{internalBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order Total</span>
                      <span className="font-semibold">₱{total.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-glass-border" />
                    {internalBalance >= total ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining After Purchase</span>
                        <span className="font-semibold text-emerald-600">₱{(internalBalance - total).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">From Wallet</span>
                          <span className="font-semibold text-emerald-600">₱{internalBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-destructive">Remaining to Pay</span>
                          <span className="font-semibold text-destructive">₱{(total - internalBalance).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Insufficient balance. Top up via Coupons or choose another method.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4 p-5 rounded-xl glass-card border border-glass-border">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" maxLength={19} className="glass-card border-glass-border focus:border-primary" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" maxLength={5} className="glass-card border-glass-border focus:border-primary" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" maxLength={4} className="glass-card border-glass-border focus:border-primary" required />
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full btn-liquid-accent h-14 rounded-xl text-lg font-semibold"
                disabled={isProcessing || (hasProducts && !selectedDeliveryProvider)}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Pay ₱{total.toFixed(2)}
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground glass-badge-primary px-4 py-2 rounded-full mx-auto w-fit">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure checkout powered by Stripe
              </div>
            </form>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-2xl border border-glass-border p-6 space-y-6 shadow-glass">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>

              {/* Products Section */}
              {hasProducts && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Products ({items.length})
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3 glass-card p-3 rounded-xl">
                        <div className="h-14 w-14 rounded-lg overflow-hidden border border-glass-border flex-shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            loading="lazy" decoding="async"
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.product.farmName} · Qty: {item.quantity}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-semibold text-sm text-primary">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                          <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupons Section */}
              {hasCoupons && (
                <div className="space-y-3">
                  {hasProducts && <Separator className="bg-glass-border" />}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    Coupons ({couponItems.length})
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {couponItems.map((coupon) => (
                      <CouponCheckoutItem
                        key={coupon.id}
                        coupon={coupon}
                        onRemove={() => removeCoupon(coupon.id)}
                        onUpdateRecipient={(r, d) => updateCouponRecipient(coupon.id, r, d)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-glass-border" />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                {hasProducts && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Products Subtotal</span>
                      <span className="font-medium">₱{productSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Platform Fee
                        <span className="text-xs glass-badge-accent px-1.5 py-0.5 rounded-full">20%</span>
                      </span>
                      <span className="font-medium text-accent">₱{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Commission
                        <span className="text-xs glass-badge-accent px-1.5 py-0.5 rounded-full">10%</span>
                      </span>
                      <span className="font-medium text-accent">₱{commission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        VAT
                        <span className="text-xs glass-badge-accent px-1.5 py-0.5 rounded-full">12%</span>
                      </span>
                      <span className="font-medium">₱{vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transportation</span>
                      <span className="font-medium">
                        {deliveryFee > 0 ? `₱${deliveryFee.toFixed(2)}` : "Select provider"}
                      </span>
                    </div>
                  </>
                )}

                {hasCoupons && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coupons Subtotal</span>
                    <span className="font-medium text-emerald-600">₱{couponSubtotal.toLocaleString()}</span>
                  </div>
                )}

                <Separator className="bg-glass-border" />
                <div className="flex justify-between text-base pt-2">
                  <span className="font-semibold">Total Payable</span>
                  <span className="font-bold text-primary text-lg">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {hasProducts && (
                <div className="p-4 rounded-xl glass-card-accent border border-primary/30 text-sm shadow-glow-primary">
                  <div className="flex items-center gap-2 text-primary font-medium mb-1">
                    <Truck className="h-4 w-4" />
                    Estimated Delivery
                  </div>
                  <p className="text-muted-foreground">
                    {deliveryEstimate 
                      ? `~${deliveryEstimate.estimated_eta_minutes} minutes via ${selectedDeliveryProvider}`
                      : "Select a delivery provider to see estimate"
                    }
                  </p>
                </div>
              )}

              {hasCoupons && (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium mb-1">
                    <Ticket className="h-4 w-4" />
                    Coupon Fulfillment
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Coupons are digital. BV & rewards are credited instantly after purchase.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-primary">₱{total.toFixed(2)}</p>
        </div>
        <Button 
          type="submit" form="checkout-form"
          className="btn-liquid-accent h-11 rounded-xl font-semibold px-6"
          disabled={isProcessing || (hasProducts && !selectedDeliveryProvider)}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </div>
      <div className="lg:hidden h-20" />

      <Footer />
    </div>
  );
};

// ── Coupon Line Item with Recipient Selection ──
const CouponCheckoutItem = ({
  coupon,
  onRemove,
  onUpdateRecipient,
}: {
  coupon: CouponCartItem;
  onRemove: () => void;
  onUpdateRecipient: (r: CouponCartItem['recipient'], d?: CouponCartItem['recipientDetails']) => void;
}) => {
  const [recipientType, setRecipientType] = useState<CouponCartItem['recipient']>(coupon.recipient);
  const [recipientEmail, setRecipientEmail] = useState(coupon.recipientDetails?.email || "");
  const [recipientName, setRecipientName] = useState(coupon.recipientDetails?.fullName || "");
  const [recipientPhone, setRecipientPhone] = useState(coupon.recipientDetails?.phone || "");

  const handleRecipientChange = (value: string) => {
    const r = value as CouponCartItem['recipient'];
    setRecipientType(r);
    if (r === "self") {
      onUpdateRecipient(r);
    }
  };

  const handleDetailBlur = () => {
    onUpdateRecipient(recipientType, {
      email: recipientEmail,
      fullName: recipientName,
      phone: recipientPhone,
    });
  };

  return (
    <div className="glass-card rounded-xl border border-glass-border overflow-hidden">
      {/* Coupon header */}
      <div className="flex items-center gap-3 p-3">
        <div className="h-12 w-12 rounded-lg overflow-hidden border border-glass-border flex-shrink-0">
          <img src={coupon.image} alt={coupon.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{coupon.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{coupon.bv.toLocaleString()} BV</Badge>
            <span className="text-[10px] text-muted-foreground">{coupon.reward}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="font-semibold text-sm text-primary">₱{coupon.price.toLocaleString()}</p>
          <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recipient selection */}
      <div className="border-t border-glass-border p-3 space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recipient</p>
        <RadioGroup value={recipientType} onValueChange={handleRecipientChange} className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <RadioGroupItem value="self" className="h-3.5 w-3.5" />
            <User className="h-3 w-3 text-muted-foreground" />
            Use for Myself
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <RadioGroupItem value="existing_user" className="h-3.5 w-3.5" />
            <User className="h-3 w-3 text-muted-foreground" />
            Assign to Existing User
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <RadioGroupItem value="new_member" className="h-3.5 w-3.5" />
            <UserPlus className="h-3 w-3 text-muted-foreground" />
            Assign to New Member / Buyer
          </label>
        </RadioGroup>

        {recipientType === "existing_user" && (
          <div className="pt-1.5 space-y-2">
            <Input 
              placeholder="User email or mobile" 
              value={recipientEmail} 
              onChange={(e) => setRecipientEmail(e.target.value)}
              onBlur={handleDetailBlur}
              className="h-8 text-xs glass-card border-glass-border"
            />
          </div>
        )}

        {recipientType === "new_member" && (
          <div className="pt-1.5 space-y-2">
            <Input 
              placeholder="Full name" 
              value={recipientName} 
              onChange={(e) => setRecipientName(e.target.value)}
              onBlur={handleDetailBlur}
              className="h-8 text-xs glass-card border-glass-border"
            />
            <Input 
              placeholder="Email" 
              value={recipientEmail} 
              onChange={(e) => setRecipientEmail(e.target.value)}
              onBlur={handleDetailBlur}
              className="h-8 text-xs glass-card border-glass-border"
            />
            <Input 
              placeholder="Mobile number" 
              value={recipientPhone} 
              onChange={(e) => setRecipientPhone(e.target.value)}
              onBlur={handleDetailBlur}
              className="h-8 text-xs glass-card border-glass-border"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
