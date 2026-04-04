import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrder, useCancelOrder } from "@/hooks/useApiData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChefHat,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  CreditCard,
  Calendar,
  Receipt,
  Copy,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-500/10" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-orange-600", bgColor: "bg-orange-500/10" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-purple-600", bgColor: "bg-purple-500/10" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-500/10" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600", bgColor: "bg-red-500/10" },
};

const paymentMethodLabels: Record<string, string> = {
  gcash: "GCash",
  maya: "Maya",
  card: "Credit/Debit Card",
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  paid: "bg-green-500/10 text-green-600 border-green-500/30",
  failed: "bg-red-500/10 text-red-600 border-red-500/30",
  refunded: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(orderId || "");
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await cancelOrder.mutateAsync(order.id);
      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-xl mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-16 text-center">
          <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-4">Order not found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find this order. It may have been deleted or doesn't exist.</p>
            <Button onClick={() => navigate("/orders")} className="btn-liquid">
              View All Orders
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.order_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canCancel = order.order_status === "pending" || order.order_status === "confirmed";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Order ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold">{order.id}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyOrderId}>
                      {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full", status.bgColor)}>
                  <StatusIcon className={cn("h-5 w-5", status.color)} />
                  <span className={cn("font-semibold", status.color)}>{status.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Placed on {formatDate(order.created_at || "")}
              </div>
            </div>

            {/* Order Items */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-glass-border flex-shrink-0">
                      <img 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">{item.farm_name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span>₱{item.price.toFixed(2)} / {item.unit}</span>
                        <span className="text-muted-foreground">× {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">₱{item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.delivery_address.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.delivery_address.phone}</span>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{order.delivery_address.address_line1}</p>
                    {order.delivery_address.address_line2 && <p>{order.delivery_address.address_line2}</p>}
                    <p>{order.delivery_address.city}, {order.delivery_address.province} {order.delivery_address.postal_code}</p>
                  </div>
                </div>
                {order.delivery_address.notes && (
                  <div className="mt-3 p-3 rounded-lg bg-secondary/50 text-sm">
                    <span className="text-muted-foreground">Notes:</span> {order.delivery_address.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{order.delivery_fee > 0 ? `₱${order.delivery_fee.toFixed(2)}` : <span className="text-green-600">Free</span>}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₱{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{paymentMethodLabels[order.payment_method] || order.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={cn("border", paymentStatusColors[order.payment_status])}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this order? This action cannot be undone and the items will be restocked.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleCancelOrder}
                    >
                      Yes, Cancel Order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Help */}
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Need help with your order?</p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetailPage;
