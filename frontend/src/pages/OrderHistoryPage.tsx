import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useCancelOrder } from "@/hooks/useApiData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChefHat,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  preparing: { label: "Preparing", icon: ChefHat, color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-500/10 text-green-600 border-green-500/30" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-500/10 text-red-600 border-red-500/30" },
};

const paymentMethodLabels: Record<string, string> = {
  gcash: "GCash",
  maya: "Maya",
  card: "Credit/Debit Card",
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

const OrderCard = ({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) => {
  const status = statusConfig[order.order_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canCancel = order.order_status === "pending" || order.order_status === "confirmed";
  const canTrack = order.order_status !== "cancelled" && order.order_status !== "delivered";
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="glass-card rounded-xl border border-glass-border p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Order ID</span>
            </div>
            <p className="font-mono text-sm font-medium">{order.id.slice(0, 8)}...</p>
          </div>
          <Badge className={cn("flex items-center gap-1.5 px-3 py-1 border", status.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>

        {/* Items Preview */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {order.items.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex-shrink-0">
              <div className="h-14 w-14 rounded-lg overflow-hidden border border-glass-border bg-secondary">
                <img 
                  src={item.image || "/placeholder.svg"} 
                  alt={item.product_name}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              </div>
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex-shrink-0 h-14 w-14 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground">
              +{order.items.length - 4}
            </div>
          )}
          <div className="flex-1 min-w-[100px]">
            <p className="text-sm font-medium">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground">
              {order.items.map(i => i.product_name).slice(0, 2).join(", ")}
              {order.items.length > 2 && "..."}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="font-medium text-xs">{order.delivery_address.city}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="font-medium text-xs">{paymentMethodLabels[order.payment_method] || order.payment_method}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Ordered</p>
              <p className="font-medium text-xs">{formatDate(order.created_at || "")}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShoppingBag className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-primary">₱{order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-glass-border">
          <div className="flex items-center gap-3">
            <Link 
              to={`/order/${order.id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Details <ChevronRight className="h-4 w-4" />
            </Link>
            {canTrack && (
              <Link 
                to={`/tracking/${order.id}`}
                className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                data-testid="track-order-btn"
              >
                <Truck className="h-3.5 w-3.5 mr-1" />
                Track
              </Link>
            )}
          </div>
          {canCancel && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onCancel(order.id);
                setShowCancelDialog(false);
              }}
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading, error } = useOrders();
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
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

  const filteredOrders = orders?.filter(order => {
    if (filter === "all") return true;
    return order.order_status === filter;
  }) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-16 text-center">
          <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-4">Sign in to view orders</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your order history.</p>
            <Button onClick={() => navigate("/auth")} className="btn-liquid">
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-2"
          onClick={() => navigate("/buyer")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Order History
            </h1>
            <p className="text-muted-foreground mt-1">
              View and track all your orders
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "out_for_delivery", label: "Delivering" },
              { key: "delivered", label: "Delivered" },
              { key: "cancelled", label: "Cancelled" },
            ].map(tab => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? "default" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full whitespace-nowrap",
                  filter === tab.key && "btn-liquid"
                )}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="glass-card p-8 rounded-xl text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load orders</h2>
            <p className="text-muted-foreground mb-4">There was an error loading your orders.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
            </h2>
            <p className="text-muted-foreground mb-6">
              {filter === "all" 
                ? "Start shopping to see your orders here!"
                : "You don't have any orders with this status."}
            </p>
            {filter === "all" && (
              <Button onClick={() => navigate("/shop")} className="btn-liquid">
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
