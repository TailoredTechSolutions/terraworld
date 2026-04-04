import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  Navigation,
  AlertCircle,
  Play,
  User,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { driverApi, DriverStats, Delivery, AvailableDelivery } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; color: string; nextAction: string; nextStatus: string }> = {
  assigned: { label: "Assigned", color: "bg-blue-500/10 text-blue-600", nextAction: "Pick Up", nextStatus: "picked_up" },
  picked_up: { label: "Picked Up", color: "bg-orange-500/10 text-orange-600", nextAction: "Start Delivery", nextStatus: "in_transit" },
  in_transit: { label: "In Transit", color: "bg-purple-500/10 text-purple-600", nextAction: "Mark Delivered", nextStatus: "delivered" },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600", nextAction: "", nextStatus: "" },
};

const DriverDashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<AvailableDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registering, setRegistering] = useState(false);
  
  // Registration form state
  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    vehicleType: "motorcycle",
    vehiclePlate: "",
  });

  // Mock driver ID - in real app, this would come from user profile
  const [driverId, setDriverId] = useState<string | null>(null);

  const fetchDriverData = async (id: string) => {
    try {
      const [stats, active, completed, available] = await Promise.all([
        driverApi.getStats(id),
        driverApi.getDeliveries(id, "assigned,picked_up,in_transit"),
        driverApi.getDeliveries(id, "delivered"),
        driverApi.getAvailableDeliveries(),
      ]);
      
      setDriverStats(stats);
      setActiveDeliveries(active.filter(d => ["assigned", "picked_up", "in_transit"].includes(d.status)));
      setCompletedDeliveries(completed);
      setAvailableDeliveries(available);
    } catch (error) {
      console.error("Failed to fetch driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check localStorage for driver ID
    const savedDriverId = localStorage.getItem("terra_driver_id");
    if (savedDriverId) {
      setDriverId(savedDriverId);
      fetchDriverData(savedDriverId);
    } else {
      setLoading(false);
      setShowRegisterDialog(true);
    }
  }, [user]);

  const handleRegister = async () => {
    if (!user || !regForm.name || !regForm.phone || !regForm.vehiclePlate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);
    try {
      const driver = await driverApi.register(
        user.id,
        regForm.name,
        regForm.phone,
        regForm.vehicleType,
        regForm.vehiclePlate
      );
      
      localStorage.setItem("terra_driver_id", driver.id);
      setDriverId(driver.id);
      setShowRegisterDialog(false);
      fetchDriverData(driver.id);
      
      toast({
        title: "Registration successful!",
        description: "Welcome to Terra Farming delivery team!",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleAcceptDelivery = async (orderId: string) => {
    if (!driverId) return;
    
    try {
      await driverApi.acceptDelivery(driverId, orderId);
      toast({
        title: "Delivery accepted!",
        description: "Navigate to the pickup location to collect the order.",
      });
      fetchDriverData(driverId);
    } catch (error: any) {
      toast({
        title: "Failed to accept",
        description: error.message || "Could not accept delivery",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    if (!driverId) return;
    
    try {
      await driverApi.updateDeliveryStatus(driverId, deliveryId, newStatus);
      toast({
        title: "Status updated!",
        description: `Delivery marked as ${newStatus.replace("_", " ")}`,
      });
      fetchDriverData(driverId);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update status",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
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
            <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-4">Driver Portal</h1>
            <p className="text-muted-foreground mb-6">Sign in to access the driver dashboard</p>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Truck className="h-7 w-7 text-primary" />
              Driver Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your deliveries and earnings
            </p>
          </div>
          {driverStats && (
            <Badge className={cn(
              "px-3 py-1",
              driverStats.driver.status === "available" && "bg-green-500/10 text-green-600",
              driverStats.driver.status === "on_delivery" && "bg-orange-500/10 text-orange-600",
              driverStats.driver.status === "offline" && "bg-gray-500/10 text-gray-600"
            )}>
              {driverStats.driver.status.replace("_", " ").toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        {driverStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                    <p className="text-xl font-bold text-primary">₱{driverStats.total_earnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold">{driverStats.total_deliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-xl font-bold">{driverStats.active_deliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-xl font-bold">{driverStats.rating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="gap-2">
              <Package className="h-4 w-4" />
              Active ({activeDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="gap-2">
              <Navigation className="h-4 w-4" />
              Available ({availableDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Active Deliveries */}
          <TabsContent value="active" className="space-y-4">
            {activeDeliveries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No active deliveries</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Accept a delivery from the Available tab
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeDeliveries.map((delivery) => {
                const config = statusConfig[delivery.status];
                return (
                  <Card key={delivery.id} className="overflow-hidden">
                    <div className={cn("h-1", config.color.replace("/10", ""))} />
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={config.color}>{config.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Order #{delivery.order_id.slice(0, 8)}
                            </span>
                          </div>
                          
                          {delivery.order && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{delivery.order.customer_name}</span>
                                <a href={`tel:${delivery.order.customer_phone}`} className="text-primary">
                                  <Phone className="h-4 w-4" />
                                </a>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span>
                                  {delivery.order.delivery_address.address_line1}, {delivery.order.delivery_address.city}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{delivery.order.items_count} item(s)</span>
                                <span className="font-semibold text-primary">
                                  ₱{delivery.order.total.toFixed(0)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {config.nextAction && (
                          <Button 
                            className="btn-liquid shrink-0"
                            onClick={() => handleUpdateStatus(delivery.id, config.nextStatus)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {config.nextAction}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Available Deliveries */}
          <TabsContent value="available" className="space-y-4">
            {availableDeliveries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Navigation className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No deliveries available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back soon for new orders
                  </p>
                </CardContent>
              </Card>
            ) : (
              availableDeliveries.map((delivery) => (
                <Card key={delivery.order_id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/10 text-blue-600">New Order</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(delivery.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{delivery.customer_name}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>
                            {delivery.delivery_address.address_line1}, {delivery.delivery_address.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{delivery.items_count} item(s)</span>
                          <span className="font-semibold text-primary">
                            ₱{delivery.total.toFixed(0)} + ₱50 delivery fee
                          </span>
                        </div>
                      </div>

                      <Button 
                        className="btn-liquid shrink-0"
                        onClick={() => handleAcceptDelivery(delivery.order_id)}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Accept Delivery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            {completedDeliveries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No delivery history yet</p>
                </CardContent>
              </Card>
            ) : (
              completedDeliveries.slice(0, 20).map((delivery) => (
                <Card key={delivery.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Order #{delivery.order_id.slice(0, 8)}</span>
                        </div>
                        {delivery.order && (
                          <p className="text-sm text-muted-foreground">
                            {delivery.order.customer_name} • {delivery.order.delivery_address.city}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Delivered {delivery.delivered_at ? formatTime(delivery.delivered_at) : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+₱50</p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Become a Driver
            </DialogTitle>
            <DialogDescription>
              Register to start delivering fresh produce from local farms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Juan dela Cruz"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09XX XXX XXXX"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <select
                id="vehicleType"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={regForm.vehicleType}
                onChange={(e) => setRegForm({ ...regForm, vehicleType: e.target.value })}
              >
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car / Van</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plate">Vehicle Plate Number *</Label>
              <Input
                id="plate"
                placeholder="ABC 1234"
                value={regForm.vehiclePlate}
                onChange={(e) => setRegForm({ ...regForm, vehiclePlate: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={registering} className="btn-liquid">
              {registering ? "Registering..." : "Register as Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DriverDashboardPage;
