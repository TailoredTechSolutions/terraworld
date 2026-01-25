import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Truck, Clock, MapPin, Receipt, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as {
    orderId: string;
    total: number;
    paymentMethod: string;
    items: number;
  } | null;

  // Redirect if accessed directly without order data
  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card": return "Credit/Debit Card";
      case "gcash": return "GCash";
      case "crypto": return "Cryptocurrency";
      default: return method;
    }
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 50);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-6 animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-14 w-14 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for shopping with FarmDirect
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-left space-y-6 mb-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-display text-xl font-bold text-foreground">{orderData.orderId}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-semibold text-foreground">
                    {estimatedDelivery.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">45-60 min from now</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-semibold text-foreground">123 Main Street</p>
                  <p className="text-xs text-muted-foreground">Manila, 1000</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Ordered</span>
                <span className="font-medium">{orderData.items} items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{getPaymentMethodLabel(orderData.paymentMethod)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₱45.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold">Total Paid</span>
                <span className="font-bold text-primary text-lg">₱{orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Status Preview */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-8">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2 justify-center">
              <Truck className="h-5 w-5 text-primary" />
              Delivery Status
            </h3>
            
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2 text-primary font-medium">Confirmed</span>
              </div>
              <div className="flex-1 h-1 bg-primary mx-2" />
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="text-xs mt-2 text-muted-foreground">Preparing</span>
              </div>
              <div className="flex-1 h-1 bg-border mx-2" />
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs mt-2 text-muted-foreground">On the way</span>
              </div>
              <div className="flex-1 h-1 bg-border mx-2" />
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <Home className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-xs mt-2 text-muted-foreground">Delivered</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => navigate("/map")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Track Order
            </Button>
            <Button 
              className="btn-primary-gradient rounded-xl"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            A confirmation email has been sent to your email address.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;