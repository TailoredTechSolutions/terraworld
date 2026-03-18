import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import AdminDashboardWrapper from "@/components/admin/AdminDashboardWrapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DriverSidebar from "@/components/driver/DriverSidebar";
import DashboardHero from "@/components/DashboardHero";
import { DELIVERY_LOGISTICS as deliveryHero } from "@/lib/siteImages";
import BuyerSupportPanel from "@/components/buyer/BuyerSupportPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Package, Truck, CheckCircle, Clock, DollarSign, Star,
  MapPin, Phone, Loader2, User,
  Bell, LifeBuoy, ShieldCheck, AlertCircle, Play, Navigation,
} from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_transit: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  none: "bg-muted text-muted-foreground",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

// Demo data for driver dashboard
const demoAssignedOrders = [
  { id: "dd1", order_number: "ORD-2026-045", customer_name: "Downtown Market", customer_phone: "+63 917 123 4567", delivery_address: "123 Main St, Baguio City", status: "in_transit", total: 5625, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "dd2", order_number: "ORD-2026-046", customer_name: "Fresh Grocery Co.", customer_phone: "+63 918 234 5678", delivery_address: "45 Session Rd, Baguio City", status: "preparing", total: 3200, created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "dd3", order_number: "ORD-2026-047", customer_name: "Maria Santos", customer_phone: "+63 919 345 6789", delivery_address: "78 Burnham Park, Baguio City", status: "pending", total: 1800, created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
];

const demoCompletedOrders = [
  { id: "dc1", order_number: "ORD-2026-041", customer_name: "Chef Juan's Kitchen", total: 8500, status: "delivered", created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: "dc2", order_number: "ORD-2026-038", customer_name: "Local Market", total: 4200, status: "delivered", created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: "dc3", order_number: "ORD-2026-035", customer_name: "Green Valley Store", total: 6100, status: "delivered", created_at: new Date(Date.now() - 72 * 3600000).toISOString() },
];

const demoNotifications = [
  { id: "dn1", title: "New Delivery Assigned", message: "You have been assigned ORD-2026-047 for pickup at Terra Farm HQ", is_read: false, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "dn2", title: "Delivery Confirmed", message: "ORD-2026-041 has been confirmed as delivered", is_read: true, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: "dn3", title: "Earnings Updated", message: "₱850 has been added to your wallet for completed deliveries", is_read: true, created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
];

const DriverDashboardInner = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("home");
  const [isAvailable, setIsAvailable] = useState(true);
  const isMobile = useIsMobile();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerSection = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (isMobile) {
      const el = sectionRefs.current[tab];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setActiveTab(tab);
    }
  }, [isMobile]);

  // Fetch this driver's record by email
  const { data: driverRecord } = useQuery({
    queryKey: ["driver-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("drivers")
        .select("*")
        .eq("email", profile?.email || "")
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.email,
  });

  // Fetch orders assigned to THIS driver (RLS-scoped)
  const { data: assignedOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["driver-orders", driverRecord?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("driver_id", driverRecord!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!driverRecord?.id,
  });

  const { data: deliveryBookings } = useQuery({
    queryKey: ["driver-bookings", driverRecord?.id],
    queryFn: async () => {
      if (!assignedOrders?.length) return [];
      const orderIds = assignedOrders.map((o) => o.id);
      const { data } = await supabase
        .from("delivery_bookings")
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!assignedOrders?.length,
  });

  const { data: notifications } = useQuery({
    queryKey: ["driver-notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: wallet } = useQuery({
    queryKey: ["driver-wallet", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: walletTxns } = useQuery({
    queryKey: ["driver-wallet-txns", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: kycProfile } = useQuery({
    queryKey: ["driver-kyc", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("kyc_profiles")
        .select("status, submitted_at, reviewed_at, rejection_reason")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutation: update order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: status as any })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
      toast({ title: "Status Updated", description: `Order marked as ${status.replace("_", " ")}.` });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Mutation: toggle driver availability
  const toggleAvailability = useMutation({
    mutationFn: async (available: boolean) => {
      if (!driverRecord?.id) return;
      const { error } = await supabase
        .from("drivers")
        .update({ status: available ? "online" : "offline" })
        .eq("id", driverRecord.id);
      if (error) throw error;
    },
    onSuccess: (_, available) => {
      setIsAvailable(available);
      queryClient.invalidateQueries({ queryKey: ["driver-record"] });
      toast({ title: available ? "You're Online" : "You're Offline" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="max-w-md space-y-6">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
              <Truck className="h-12 w-12 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Driver Dashboard</h1>
            <p className="text-muted-foreground">Sign in to manage your deliveries and earnings.</p>
            <Button className="btn-primary-gradient" asChild>
              <Link to="/auth?role=driver">Register as Driver</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const realActiveDeliveries = assignedOrders?.filter(o => o.status !== "delivered" && o.status !== "cancelled") || [];
  const realCompletedDeliveries = assignedOrders?.filter(o => o.status === "delivered") || [];
  const activeDeliveries = realActiveDeliveries.length > 0 ? realActiveDeliveries : demoAssignedOrders;
  const completedDeliveries = realCompletedDeliveries.length > 0 ? realCompletedDeliveries : demoCompletedOrders;
  const displayNotifications = (notifications && notifications.length > 0) ? notifications : demoNotifications;
  const driverOnline = driverRecord?.status === "online";

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      home: "Dashboard", assigned: "Assigned Deliveries", history: "Delivery History",
      availability: "Availability", earnings: "Earnings", notifications: "Notifications",
      support: "Support", profile: "Profile",
    };
    return titles[activeTab] || "Dashboard";
  };

  // Desktop tab-based content (unchanged)
  const renderDesktopContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <DriverHome
            activeCount={activeDeliveries.length}
            completedCount={completedDeliveries.length}
            wallet={wallet}
            rating={driverRecord?.rating}
            onNavigate={setActiveTab}
          />
        );
      case "assigned":
        return (
          <DriverAssigned
            orders={activeDeliveries}
            bookings={deliveryBookings || []}
            onUpdateStatus={(orderId, status) => updateOrderStatus.mutate({ orderId, status })}
            isUpdating={updateOrderStatus.isPending}
          />
        );
      case "history":
        return <DriverHistory orders={completedDeliveries} />;
      case "availability":
        return (
          <DriverAvailability
            isAvailable={driverOnline}
            onToggle={(v) => toggleAvailability.mutate(v)}
            driverRecord={driverRecord}
          />
        );
      case "earnings":
        return <DriverEarnings wallet={wallet} transactions={walletTxns || []} />;
      case "notifications":
        return <DriverNotifications notifications={displayNotifications} />;
      case "support":
        return <BuyerSupportPanel />;
      case "profile":
        return <DriverProfile profile={profile} driverRecord={driverRecord} kycStatus={kycProfile?.status} />;
      default:
        return (
          <DriverHome
            activeCount={activeDeliveries.length}
            completedCount={completedDeliveries.length}
            wallet={wallet}
            rating={driverRecord?.rating}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  // Mobile: all sections stacked
  const mobileSections = [
    { id: "home", label: "Driver Overview", component: <DriverHome activeCount={activeDeliveries.length} completedCount={completedDeliveries.length} wallet={wallet} rating={driverRecord?.rating} onNavigate={handleTabChange} /> },
    { id: "assigned", label: "Assigned Deliveries", component: <DriverAssigned orders={activeDeliveries} bookings={deliveryBookings || []} onUpdateStatus={(orderId: string, status: string) => updateOrderStatus.mutate({ orderId, status })} isUpdating={updateOrderStatus.isPending} /> },
    { id: "history", label: "Delivery History", component: <DriverHistory orders={completedDeliveries} /> },
    { id: "availability", label: "Availability", component: <DriverAvailability isAvailable={driverOnline} onToggle={(v: boolean) => toggleAvailability.mutate(v)} driverRecord={driverRecord} /> },
    { id: "earnings", label: "Earnings Summary", component: <DriverEarnings wallet={wallet} transactions={walletTxns || []} /> },
    { id: "notifications", label: "Notifications", component: <DriverNotifications notifications={displayNotifications} /> },
    { id: "support", label: "Support", component: <BuyerSupportPanel /> },
    { id: "profile", label: "Profile", component: <DriverProfile profile={profile} driverRecord={driverRecord} kycStatus={kycProfile?.status} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <DriverSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Cinematic Hero Banner */}
            <DashboardHero
              title={profile?.full_name || user.email?.split("@")[0] || "Driver Dashboard"}
              subtitle="Manage your deliveries, track earnings, and stay connected"
              badge={driverOnline ? "🟢 Online — Accepting Deliveries" : "⚫ Offline"}
              backgroundImage={deliveryHero}
              kpis={[
                { icon: Package, label: "Active", value: activeDeliveries.length.toString() },
                { icon: CheckCircle, label: "Completed", value: completedDeliveries.length.toString() },
                { icon: Star, label: "Rating", value: `${Number(driverRecord?.rating || 0).toFixed(1)} ★` },
                { icon: DollarSign, label: "Balance", value: `₱${Number(wallet?.available_balance || 0).toLocaleString()}` },
              ]}
            />

            {isMobile ? (
              <div className="space-y-8">
                {mobileSections.map((section) => (
                  <div
                    key={section.id}
                    ref={registerSection(section.id)}
                    className="scroll-mt-4"
                  >
                    <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b border-border">
                      {section.label}
                    </h2>
                    {section.component}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">{getPageTitle()}</h2>
                {renderDesktopContent()}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// ─── HOME ────────────────────────────────────────────────────────────────
const DriverHome = ({ activeCount, completedCount, wallet, rating, onNavigate }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Active Deliveries", value: activeCount || 3, icon: Package, color: "text-blue-600" },
        { label: "Completed", value: completedCount || 32, icon: CheckCircle, color: "text-green-600" },
        { label: "Rating", value: `${Number(rating || 4.8).toFixed(1)} ★`, icon: Star, color: "text-yellow-600" },
        { label: "Available Balance", value: `₱${Number(wallet?.available_balance || 12450).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
      ].map((m) => (
        <Card key={m.label}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xl font-bold mt-1">{m.value}</p>
              </div>
              <m.icon className={`h-8 w-8 ${m.color} opacity-60`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "View Assignments", tab: "assigned", icon: Package },
            { label: "Delivery History", tab: "history", icon: Clock },
            { label: "Toggle Availability", tab: "availability", icon: Truck },
            { label: "View Earnings", tab: "earnings", icon: DollarSign },
            { label: "Notifications", tab: "notifications", icon: Bell },
            { label: "Contact Support", tab: "support", icon: LifeBuoy },
          ].map((a) => (
            <Button key={a.tab} variant="outline" className="h-auto py-3 flex-col gap-1.5" onClick={() => onNavigate(a.tab)}>
              <a.icon className="h-5 w-5 text-primary" />
              <span className="text-xs">{a.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── ASSIGNED ────────────────────────────────────────────────────────────
interface DriverAssignedProps {
  orders: any[];
  bookings: any[];
  onUpdateStatus: (orderId: string, status: string) => void;
  isUpdating: boolean;
}

const DriverAssigned = ({ orders, bookings, onUpdateStatus, isUpdating }: DriverAssignedProps) => {
  if (!orders.length) {
    return (
      <Card><CardContent className="pt-6 text-center space-y-3">
        <Package className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No active deliveries assigned.</p>
      </CardContent></Card>
    );
  }

  const getNextAction = (status: string | null) => {
    switch (status) {
      case "pending": return { label: "Start Preparing", next: "preparing", icon: Play };
      case "preparing": return { label: "Mark In Transit", next: "in_transit", icon: Navigation };
      case "in_transit": return { label: "Mark Delivered", next: "delivered", icon: CheckCircle };
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const action = getNextAction(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />{order.customer_phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <p className="truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />{order.delivery_address}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status || "pending"]}>{(order.status || "pending").replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">₱{Number(order.total).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {action && (
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs gap-1"
                            disabled={isUpdating}
                            onClick={() => onUpdateStatus(order.id, action.next)}
                          >
                            <action.icon className="h-3 w-3" />
                            {action.label}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── HISTORY ─────────────────────────────────────────────────────────────
const DriverHistory = ({ orders }: { orders: any[] }) => {
  if (!orders.length) {
    return (
      <Card><CardContent className="pt-6 text-center space-y-3">
        <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No completed deliveries yet.</p>
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell className="font-semibold">₱{Number(order.total).toLocaleString()}</TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Delivered</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── AVAILABILITY ────────────────────────────────────────────────────────
const DriverAvailability = ({ isAvailable, onToggle, driverRecord }: { isAvailable: boolean; onToggle: (v: boolean) => void; driverRecord: any }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <Label className="text-base font-semibold">Available for Deliveries</Label>
            <p className="text-sm text-muted-foreground mt-1">Toggle to receive new delivery assignments</p>
          </div>
          <Switch checked={isAvailable} onCheckedChange={onToggle} />
        </div>
        <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Current Status</span><Badge variant={isAvailable ? "default" : "secondary"}>{isAvailable ? "Online" : "Offline"}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="capitalize">{driverRecord?.vehicle || "Motorcycle"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">License Plate</span><span>{driverRecord?.license_plate || "ABC-1234"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Deliveries</span><span>{driverRecord?.deliveries_count || 32}</span></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── EARNINGS ────────────────────────────────────────────────────────────
const DriverEarnings = ({ wallet, transactions }: { wallet: any; transactions: any[] }) => {
  const demoTxns = [
    { id: "dt1", description: "Delivery commission - ORD-2026-041", amount: 850, transaction_type: "delivery_commission", created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
    { id: "dt2", description: "Delivery commission - ORD-2026-038", amount: 620, transaction_type: "delivery_commission", created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
    { id: "dt3", description: "Weekly bonus", amount: 500, transaction_type: "bonus", created_at: new Date(Date.now() - 72 * 3600000).toISOString() },
    { id: "dt4", description: "Delivery commission - ORD-2026-035", amount: 780, transaction_type: "delivery_commission", created_at: new Date(Date.now() - 96 * 3600000).toISOString() },
  ];
  const displayTxns = transactions.length > 0 ? transactions : demoTxns;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Available</p><p className="text-2xl font-bold">₱{Number(wallet?.available_balance || 12450).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">₱{Number(wallet?.pending_balance || 2300).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Withdrawn</p><p className="text-2xl font-bold">₱{Number(wallet?.total_withdrawn || 28500).toLocaleString()}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayTxns.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{tx.description || tx.transaction_type}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), "MMM d, yyyy")}</p>
                </div>
                <p className={`text-sm font-semibold ${Number(tx.amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Number(tx.amount) >= 0 ? "+" : ""}₱{Math.abs(Number(tx.amount)).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────
const DriverNotifications = ({ notifications }: { notifications: any[] }) => (
  <div className="space-y-2">
    {!notifications.length ? (
      <Card><CardContent className="pt-6 text-center space-y-3">
        <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No notifications.</p>
      </CardContent></Card>
    ) : (
      notifications.map((n: any) => (
        <Card key={n.id} className={!n.is_read ? "border-primary/30 bg-primary/5" : ""}>
          <CardContent className="py-3 px-4">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                {format(new Date(n.created_at), "MMM d, h:mm a")}
              </span>
            </div>
          </CardContent>
        </Card>
      ))
    )}
  </div>
);

// ─── PROFILE ─────────────────────────────────────────────────────────────
const DriverProfile = ({ profile, driverRecord, kycStatus }: { profile: any; driverRecord: any; kycStatus: string | null | undefined }) => {
  const kycConfig: Record<string, { color: string; bg: string; label: string }> = {
    approved: { color: "text-green-800 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", label: "Verified" },
    pending: { color: "text-amber-800 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", label: "Pending Review" },
    in_review: { color: "text-blue-800 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", label: "In Review" },
    rejected: { color: "text-red-800 dark:text-red-300", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", label: "Rejected" },
    not_started: { color: "text-muted-foreground", bg: "bg-muted border-border", label: "Not Started" },
  };

  const kyc = kycConfig[kycStatus || "not_started"] || kycConfig.not_started;
  const KycIcon = kycStatus === "approved" ? CheckCircle : kycStatus === "rejected" ? AlertCircle : Clock;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5 text-primary" />Personal Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Full Name</p><p className="font-medium">{profile?.full_name || "Carlos Martinez"}</p></div>
            <div><p className="text-muted-foreground">Email</p><p className="font-medium">{profile?.email || "carlos@terra.ph"}</p></div>
            <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{profile?.phone || driverRecord?.phone || "+63 917 555 1234"}</p></div>
            <div><p className="text-muted-foreground">Referral Code</p><p className="font-medium font-mono">{profile?.referral_code || "DRV-8X4K"}</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Vehicle Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Vehicle Type</p><p className="font-medium capitalize">{driverRecord?.vehicle || "Motorcycle"}</p></div>
            <div><p className="text-muted-foreground">License Plate</p><p className="font-medium">{driverRecord?.license_plate || "ABC-1234"}</p></div>
            <div><p className="text-muted-foreground">Deliveries</p><p className="font-medium">{driverRecord?.deliveries_count || 32}</p></div>
            <div><p className="text-muted-foreground">Rating</p><p className="font-medium">{Number(driverRecord?.rating || 4.8).toFixed(1)} ★</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />KYC / Verification</CardTitle></CardHeader>
        <CardContent>
          <div className={`flex items-center gap-3 p-3 rounded-lg border ${kyc.bg}`}>
            <KycIcon className={`h-5 w-5 ${kyc.color}`} />
            <div>
              <p className={`text-sm font-medium ${kyc.color}`}>{kyc.label}</p>
              <p className={`text-xs ${kyc.color} opacity-75`}>
                {kycStatus === "approved"
                  ? "Your identity and vehicle have been verified."
                  : kycStatus === "not_started" || !kycStatus
                  ? "Complete your KYC to unlock all features."
                  : kycStatus === "rejected"
                  ? "Your verification was rejected. Please resubmit."
                  : "Your verification is being processed."}
              </p>
            </div>
            {(!kycStatus || kycStatus === "not_started" || kycStatus === "rejected") && (
              <Button size="sm" variant="outline" className="ml-auto" asChild>
                <Link to="/kyc">Start KYC</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DriverDashboard = () => {
  const { isAnyAdmin } = useUserRoles();

  if (isAnyAdmin) {
    return (
      <AdminDashboardWrapper
        roleFilter="driver"
        title="Driver Management"
        description="View and manage all registered drivers on the platform"
      >
        {() => <DriverDashboardInner />}
      </AdminDashboardWrapper>
    );
  }

  return <DriverDashboardInner />;
};

export default DriverDashboard;
