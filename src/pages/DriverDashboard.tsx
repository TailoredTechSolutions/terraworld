import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Package, 
  CheckCircle, 
  Truck, 
  ArrowLeft,
  ChevronRight,
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type OrderStatus = "pending" | "picked_up" | "in_transit" | "delivered";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  pickupFarm: string;
  deliveryAddress: string;
  items: { name: string; quantity: number }[];
  status: OrderStatus;
  estimatedTime: string;
  distance: string;
  earnings: number;
  pickupCoords: { lat: number; lng: number };
  deliveryCoords: { lat: number; lng: number };
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Maria Santos",
    customerPhone: "+63 917 123 4567",
    pickupAddress: "123 Green Valley Farm, Tagaytay",
    pickupFarm: "Green Valley Organic Farm",
    deliveryAddress: "Unit 5B, Palm Residences, Makati City",
    items: [
      { name: "Organic Tomatoes", quantity: 2 },
      { name: "Fresh Eggs (1 dozen)", quantity: 1 },
      { name: "Local Honey", quantity: 1 },
    ],
    status: "pending",
    estimatedTime: "25 mins",
    distance: "8.5 km",
    earnings: 85,
    pickupCoords: { lat: 14.1153, lng: 120.9621 },
    deliveryCoords: { lat: 14.5547, lng: 121.0244 },
  },
  {
    id: "ORD-002",
    customerName: "Juan Dela Cruz",
    customerPhone: "+63 918 987 6543",
    pickupAddress: "45 Sunrise Farm, Lipa City",
    pickupFarm: "Sunrise Organic Gardens",
    deliveryAddress: "88 Mahogany St., BGC, Taguig",
    items: [
      { name: "Fresh Strawberries", quantity: 3 },
      { name: "Organic Lettuce", quantity: 2 },
    ],
    status: "picked_up",
    estimatedTime: "40 mins",
    distance: "15.2 km",
    earnings: 120,
    pickupCoords: { lat: 13.9411, lng: 121.1633 },
    deliveryCoords: { lat: 14.5508, lng: 121.0500 },
  },
  {
    id: "ORD-003",
    customerName: "Ana Reyes",
    customerPhone: "+63 919 555 1234",
    pickupAddress: "78 Hillside Ranch, Antipolo",
    pickupFarm: "Hillside Family Farm",
    deliveryAddress: "12 Jasmine Lane, Pasig City",
    items: [
      { name: "Free-range Chicken", quantity: 1 },
      { name: "Fresh Carrots", quantity: 2 },
    ],
    status: "in_transit",
    estimatedTime: "12 mins",
    distance: "5.8 km",
    earnings: 95,
    pickupCoords: { lat: 14.5862, lng: 121.1761 },
    deliveryCoords: { lat: 14.5764, lng: 121.0851 },
  },
];

const completedOrders: Order[] = [
  {
    id: "ORD-098",
    customerName: "Pedro Gonzales",
    customerPhone: "+63 920 111 2222",
    pickupAddress: "Green Acres Farm, Cavite",
    pickupFarm: "Green Acres Produce",
    deliveryAddress: "55 Sunset Blvd, Las Piñas",
    items: [{ name: "Organic Vegetables Bundle", quantity: 1 }],
    status: "delivered",
    estimatedTime: "Completed",
    distance: "12.3 km",
    earnings: 110,
    pickupCoords: { lat: 14.2873, lng: 120.8767 },
    deliveryCoords: { lat: 14.4445, lng: 120.9838 },
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Pending Pickup", color: "bg-warning/10 text-warning border-warning/20", icon: Package },
  picked_up: { label: "Picked Up", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle },
  in_transit: { label: "In Transit", color: "bg-accent/10 text-accent border-accent/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
};

const DriverDashboard = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const todayEarnings = [...orders, ...completedOrders]
    .filter((o) => o.status === "delivered" || o.status === "in_transit")
    .reduce((sum, o) => sum + o.earnings, 0);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: "picked_up",
      picked_up: "in_transit",
      in_transit: "delivered",
      delivered: null,
    };
    return flow[currentStatus];
  };

  const getNextStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      pending: "Confirm Pickup",
      picked_up: "Start Delivery",
      in_transit: "Complete Delivery",
      delivered: "Completed",
    };
    return labels[status];
  };

  const openNavigation = (coords: { lat: number; lng: number }) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-lg font-semibold">Driver Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome back, Driver</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold text-foreground">{activeOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-2xl font-bold text-foreground">₱{todayEarnings}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card className="border-border">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active orders at the moment</p>
                  <p className="text-sm text-muted-foreground mt-1">New orders will appear here</p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSelect={() => setSelectedOrder(order)}
                  onUpdateStatus={updateOrderStatus}
                  onNavigate={openNavigation}
                  getNextStatus={getNextStatus}
                  getNextStatusLabel={getNextStatusLabel}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={() => setSelectedOrder(order)}
                onUpdateStatus={updateOrderStatus}
                onNavigate={openNavigation}
                getNextStatus={getNextStatus}
                getNextStatusLabel={getNextStatusLabel}
                isCompleted
              />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          onNavigate={openNavigation}
          getNextStatus={getNextStatus}
          getNextStatusLabel={getNextStatusLabel}
        />
      )}
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onSelect: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onNavigate: (coords: { lat: number; lng: number }) => void;
  getNextStatus: (status: OrderStatus) => OrderStatus | null;
  getNextStatusLabel: (status: OrderStatus) => string;
  isCompleted?: boolean;
}

const OrderCard = ({
  order,
  onSelect,
  onUpdateStatus,
  onNavigate,
  getNextStatus,
  getNextStatusLabel,
  isCompleted,
}: OrderCardProps) => {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const nextStatus = getNextStatus(order.status);

  return (
    <Card className="border-border card-hover cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <span className="text-sm font-medium text-foreground">{order.id}</span>
          </div>
          <span className="text-sm font-semibold text-primary">₱{order.earnings}</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pickup from</p>
              <p className="text-sm font-medium text-foreground">{order.pickupFarm}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1">
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Deliver to</p>
              <p className="text-sm font-medium text-foreground">{order.customerName}</p>
              <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{order.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{order.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{order.items.length} items</span>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                onNavigate(
                  order.status === "pending" ? order.pickupCoords : order.deliveryCoords
                )
              }
            >
              <Navigation className="h-4 w-4 mr-1" />
              Navigate
            </Button>
            {nextStatus && (
              <Button
                size="sm"
                className="flex-1 btn-primary-gradient"
                onClick={() => onUpdateStatus(order.id, nextStatus)}
              >
                {getNextStatusLabel(order.status)}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onNavigate: (coords: { lat: number; lng: number }) => void;
  getNextStatus: (status: OrderStatus) => OrderStatus | null;
  getNextStatusLabel: (status: OrderStatus) => string;
}

const OrderDetailModal = ({
  order,
  onClose,
  onUpdateStatus,
  onNavigate,
  getNextStatus,
  getNextStatusLabel,
}: OrderDetailModalProps) => {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const nextStatus = getNextStatus(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-sm", config.color)}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {config.label}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="font-display text-xl font-semibold mt-2">{order.id}</h2>
        </div>

        <div className="p-4 space-y-6">
          {/* Customer Info */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`tel:${order.customerPhone}`)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Location */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Pickup Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground mb-1">{order.pickupFarm}</p>
              <p className="text-sm text-muted-foreground mb-3">{order.pickupAddress}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onNavigate(order.pickupCoords)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Pickup
              </Button>
            </CardContent>
          </Card>

          {/* Delivery Location */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground mb-1">{order.customerName}</p>
              <p className="text-sm text-muted-foreground mb-3">{order.deliveryAddress}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onNavigate(order.deliveryCoords)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Delivery
              </Button>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground">{item.name}</span>
                    <Badge variant="secondary">x{item.quantity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Earnings */}
          <Card className="border-border bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Earnings</span>
                <span className="text-xl font-bold text-primary">₱{order.earnings}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          {nextStatus && (
            <Button
              size="lg"
              className="w-full btn-primary-gradient"
              onClick={() => {
                onUpdateStatus(order.id, nextStatus);
                if (nextStatus === "delivered") {
                  onClose();
                }
              }}
            >
              {getNextStatusLabel(order.status)}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
