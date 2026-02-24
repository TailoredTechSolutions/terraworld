import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  ArrowLeft, 
  Truck, 
  ShieldCheck,
  Lock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryProviderSelector from "@/components/checkout/DeliveryProviderSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Delivery provider state
  const [selectedDeliveryProvider, setSelectedDeliveryProvider] = useState<string>("");
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const farmerSubtotal = getTotalPrice();
  const platformFeePercent = 0.20;
  const commissionPercent = 0.10;
  const vatPercent = 0.12;
  const platformFee = farmerSubtotal * platformFeePercent;
  const commission = farmerSubtotal * commissionPercent;
  const subtotalBeforeVAT = farmerSubtotal + platformFee + commission;
  const vat = subtotalBeforeVAT * vatPercent;
  const deliveryFee = deliveryEstimate?.estimated_fee ?? 0;
  const total = subtotalBeforeVAT + vat + deliveryFee;

  // Default coordinates for pickup (Manila farm) and delivery
  const defaultPickupLat = 14.5547;
  const defaultPickupLng = 121.0244;
  // Default delivery coordinates (Manila center)
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

    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    if (!selectedDeliveryProvider) {
      toast({
        title: "Select Delivery Service",
        description: "Please choose a delivery provider (Lalamove or Grab) before placing your order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
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
          customerName: `${formData.firstName} ${formData.lastName}`,
          deliveryAddress: `${formData.address}, ${formData.city} ${formData.zip}`,
        } 
      });

      toast({
        title: "Order placed successfully!",
        description: `Your order ${data.order.order_number} has been confirmed.`,
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
            <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
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
                Complete your order for fresh farm produce
              </p>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Delivery Information */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Delivery Information
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Juan" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="glass-card border-glass-border focus:border-primary"
                      required 
                    />
                    {formErrors.firstName && <p className="text-sm text-destructive">{formErrors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Dela Cruz" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="glass-card border-glass-border focus:border-primary"
                      required 
                    />
                    {formErrors.lastName && <p className="text-sm text-destructive">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="juan@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="glass-card border-glass-border focus:border-primary"
                    required 
                  />
                  {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+63 917 123 4567" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="glass-card border-glass-border focus:border-primary"
                    required 
                  />
                  {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main Street, Barangay..." 
                    value={formData.address}
                    onChange={handleInputChange}
                    className="glass-card border-glass-border focus:border-primary"
                    required 
                  />
                  {formErrors.address && <p className="text-sm text-destructive">{formErrors.address}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      placeholder="Manila" 
                      value={formData.city}
                      onChange={handleInputChange}
                      className="glass-card border-glass-border focus:border-primary"
                      required 
                    />
                    {formErrors.city && <p className="text-sm text-destructive">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input 
                      id="zip" 
                      placeholder="1000" 
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="glass-card border-glass-border focus:border-primary"
                      required 
                    />
                    {formErrors.zip && <p className="text-sm text-destructive">{formErrors.zip}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Provider Selection */}
              <DeliveryProviderSelector
                pickupLat={defaultPickupLat}
                pickupLng={defaultPickupLng}
                deliveryLat={defaultDeliveryLat}
                deliveryLng={defaultDeliveryLng}
                onProviderSelect={handleDeliveryProviderSelect}
                selectedProvider={selectedDeliveryProvider}
              />

              {/* Payment Method */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover ${
                      paymentMethod === "card" 
                        ? "border-2 border-primary bg-primary/10 shadow-glow-primary" 
                        : "border border-glass-border glass-card"
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Credit / Debit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, JCB</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-6 w-10 bg-gradient-to-r from-primary/80 to-primary rounded text-primary-foreground text-[8px] font-bold flex items-center justify-center">VISA</div>
                      <div className="h-6 w-10 bg-gradient-to-r from-destructive/80 to-destructive rounded flex items-center justify-center">
                        <div className="flex -space-x-1">
                          <div className="h-3 w-3 bg-destructive rounded-full opacity-80" />
                          <div className="h-3 w-3 bg-accent rounded-full opacity-80" />
                        </div>
                      </div>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover ${
                      paymentMethod === "gcash" 
                        ? "border-2 border-primary bg-primary/10 shadow-glow-primary" 
                        : "border border-glass-border glass-card"
                    }`}
                  >
                    <RadioGroupItem value="gcash" id="gcash" />
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">GCash</p>
                      <p className="text-sm text-muted-foreground">Pay with your GCash wallet</p>
                    </div>
                    <div className="h-6 w-14 bg-primary rounded text-primary-foreground text-[10px] font-bold flex items-center justify-center">GCash</div>
                  </label>

                  <label 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover ${
                      paymentMethod === "crypto" 
                        ? "border-2 border-primary bg-primary/10 shadow-glow-primary" 
                        : "border border-glass-border glass-card"
                    }`}
                  >
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Bitcoin className="h-5 w-5 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium">Cryptocurrency</p>
                      <p className="text-sm text-muted-foreground">BTC, ETH, USDC via Coinbase</p>
                    </div>
                    <div className="h-6 w-6 bg-accent rounded-full text-accent-foreground text-[10px] font-bold flex items-center justify-center">₿</div>
                  </label>
                </RadioGroup>
              </div>

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4 p-5 rounded-xl glass-card border border-glass-border">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="4242 4242 4242 4242" 
                      maxLength={19}
                      className="glass-card border-glass-border focus:border-primary"
                      required 
                    />
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
                disabled={isProcessing || !selectedDeliveryProvider}
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

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-2xl border border-glass-border p-6 space-y-6 shadow-glass">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 glass-card p-3 rounded-xl">
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-glass-border flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.farmName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm text-primary">
                      ₱{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="bg-glass-border" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Product Price</span>
                  <span className="font-medium">₱{farmerSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Platform Service Fee
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
                  <span className="text-muted-foreground flex items-center gap-1">
                    Transportation Fee
                    {selectedDeliveryProvider && (
                      <span className="text-xs glass-badge-primary px-1.5 py-0.5 rounded-full capitalize">
                        {selectedDeliveryProvider}
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {deliveryFee > 0 ? `₱${deliveryFee.toFixed(2)}` : "Select provider"}
                  </span>
                </div>
                <Separator className="bg-glass-border" />
                <div className="flex justify-between text-base pt-2">
                  <span className="font-semibold">Total Payable</span>
                  <span className="font-bold text-primary text-lg">₱{total.toFixed(2)}</span>
                </div>
              </div>

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
          type="submit"
          form="checkout-form"
          className="btn-liquid-accent h-11 rounded-xl font-semibold px-6"
          disabled={isProcessing || !selectedDeliveryProvider}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </div>
      <div className="lg:hidden h-20" /> {/* Spacer for sticky bar */}

      <Footer />
    </div>
  );
};

export default CheckoutPage;
