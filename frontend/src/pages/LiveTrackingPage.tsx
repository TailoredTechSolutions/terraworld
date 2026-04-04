import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useApiData";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Phone,
  Clock,
  Navigation,
  User,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status steps for the progress tracker
const orderSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusOrder = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

const LiveTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: order, isLoading, error } = useOrder(orderId || "");
  
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // WebSocket for live driver location
  useEffect(() => {
    if (!user?.id || !order || order.order_status !== "out_for_delivery") return;

    const wsUrl = import.meta.env.REACT_APP_BACKEND_URL?.replace('https://', 'wss://').replace('http://', 'ws://') || 'ws://localhost:8001';
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(`${wsUrl}/ws/${user.id}`);
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "driver_location" && data.order_id === orderId) {
            setDriverLocation(data.location);
            // Simulate ETA calculation (in real app, use Google Maps API)
            const estimatedMinutes = Math.floor(Math.random() * 20) + 5;
            setEta(estimatedMinutes);
          }
        };

        ws.onclose = () => {
          setTimeout(connect, 5000);
        };
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    };

    connect();

    // Simulate driver movement for demo
    const interval = setInterval(() => {
      if (order.order_status === "out_for_delivery") {
        setDriverLocation({
          lat: 16.455 + (Math.random() - 0.5) * 0.01,
          lng: 120.587 + (Math.random() - 0.5) * 0.01,
        });
        setEta(prev => prev ? Math.max(1, prev - 1) : 15);
      }
    }, 10000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [user?.id, order?.order_status, orderId]);

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.order_status === "cancelled") return -1;
    return statusOrder.indexOf(order.order_status);
  };

  const currentStep = getCurrentStepIndex();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 rounded-xl mb-4" />
          <Skeleton className="h-32 rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order not found</h1>
          <p className="text-muted-foreground mb-6">Unable to track this order</p>
          <Button onClick={() => navigate("/orders")}>View All Orders</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isDelivering = order.order_status === "out_for_delivery";
  const isCompleted = order.order_status === "delivered";
  const isCancelled = order.order_status === "cancelled";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map / Tracking Visual */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div 
                ref={mapRef}
                className="h-[300px] sm:h-[400px] bg-gradient-to-br from-primary/5 to-accent/5 relative"
              >
                {isDelivering ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      {/* Animated driver icon */}
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-primary/20 animate-ping absolute inset-0" />
                        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center relative">
                          <Truck className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Driver is on the way!</p>
                        {eta && (
                          <p className="text-2xl font-bold text-primary">
                            ~{eta} min away
                          </p>
                        )}
                      </div>
                      {driverLocation && (
                        <p className="text-xs text-muted-foreground">
                          Location: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : isCompleted ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-green-600">Delivered!</p>
                        <p className="text-sm text-muted-foreground">
                          Enjoy your fresh produce
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isCancelled ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                        <Package className="h-10 w-10 text-red-500" />
                      </div>
                      <p className="text-xl font-semibold text-red-600">Order Cancelled</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                        <Package className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">Preparing your order</p>
                        <p className="text-sm text-muted-foreground">
                          We'll notify you when it's on the way
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-secondary" />
                  <div 
                    className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
                    style={{ 
                      height: currentStep >= 0 
                        ? `${Math.min(100, (currentStep / (orderSteps.length - 1)) * 100)}%` 
                        : '0%' 
                    }}
                  />

                  {/* Steps */}
                  <div className="space-y-6">
                    {orderSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = index <= currentStep && currentStep >= 0;
                      const isCurrent = index === currentStep;

                      return (
                        <div key={step.key} className="flex gap-4 relative">
                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center z-10 transition-all",
                            isActive 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-muted-foreground",
                            isCurrent && "ring-4 ring-primary/20"
                          )}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 pt-2">
                            <p className={cn(
                              "font-medium",
                              isActive ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </p>
                            {isCurrent && !isCompleted && !isCancelled && (
                              <p className="text-sm text-primary animate-pulse">
                                Current status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            {/* Order Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Order #{order.id.slice(0, 8)}</h2>
                  <Badge className={cn(
                    isDelivering && "bg-purple-500/10 text-purple-600",
                    isCompleted && "bg-green-500/10 text-green-600",
                    isCancelled && "bg-red-500/10 text-red-600",
                    !isDelivering && !isCompleted && !isCancelled && "bg-blue-500/10 text-blue-600"
                  )}>
                    {order.order_status.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address.address_line1}, {order.delivery_address.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {isDelivering && eta 
                          ? `${eta} minutes`
                          : isCompleted 
                            ? "Delivered"
                            : "45-60 minutes after dispatch"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary">
                        <img 
                          src={item.image || "/placeholder.svg"}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.farm_name} • ×{item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">₱{item.subtotal.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{order.delivery_fee > 0 ? `₱${order.delivery_fee.toFixed(2)}` : "Free"}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₱{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Need Help?</h3>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LiveTrackingPage;
