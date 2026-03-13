import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Package, Truck, CheckCircle, Clock, DollarSign, Star,
  Navigation, MapPin, Phone, ArrowRight, Loader2, User,
  AlertCircle, Bell, LifeBuoy, ShieldCheck
} from "lucide-react";
import { format } from "date-fns";

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

const DriverDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isAvailable, setIsAvailable] = useState(true);

  // Fetch orders assigned to driver (via driver_id matching any driver record linked by admin email)
  const { data: assignedOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["driver-orders", user?.id],
    queryFn: async () => {
      // Get all orders that have a driver assigned
      const { data } = await supabase
        .from("orders")
        .select("*")
        .not("driver_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: deliveryBookings } = useQuery({
    queryKey: ["driver-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("delivery_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id,
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

  const activeDeliveries = assignedOrders?.filter(o => o.status !== "delivered" && o.status !== "cancelled") || [];
  const completedDeliveries = assignedOrders?.filter(o => o.status === "delivered") || [];

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      home: "Dashboard", assigned: "Assigned Deliveries", history: "Delivery History",
      availability: "Availability", earnings: "Earnings", notifications: "Notifications",
      support: "Support", profile: "Profile",
    };
    return titles[activeTab] || "Dashboard";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <DriverHome activeCount={activeDeliveries.length} completedCount={completedDeliveries.length} wallet={wallet} onNavigate={setActiveTab} />;
      case "assigned": return <DriverAssigned orders={activeDeliveries} bookings={deliveryBookings || []} />;
      case "history": return <DriverHistory orders={completedDeliveries} />;
      case "availability": return <DriverAvailability isAvailable={isAvailable} setIsAvailable={setIsAvailable} />;
      case "earnings": return <DriverEarnings wallet={wallet} transactions={walletTxns || []} />;
      case "notifications": return <DriverNotifications notifications={notifications || []} />;
      case "support": return <DriverSupport />;
      case "profile": return <DriverProfile profile={profile} />;
      default: return <DriverHome activeCount={activeDeliveries.length} completedCount={completedDeliveries.length} wallet={wallet} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <DriverSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{profile?.full_name || user.email?.split("@")[0]}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Driver</Badge>
                    <Badge variant="outline" className={isAvailable ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-muted text-muted-foreground"}>
                      {isAvailable ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-6">{getPageTitle()}</h2>
            {renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// ─── HOME ────────────────────────────────────────────────────────────────
const DriverHome = ({ activeCount, completedCount, wallet, onNavigate }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Active Deliveries", value: activeCount, icon: Package, color: "text-blue-600" },
        { label: "Completed Today", value: completedCount, icon: CheckCircle, color: "text-green-600" },
        { label: "Rating", value: "4.8 ★", icon: Star, color: "text-yellow-600" },
        { label: "Available Balance", value: `₱${Number(wallet?.available_balance || 0).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
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
const DriverAssigned = ({ orders, bookings }: { orders: any[]; bookings: any[] }) => {
  if (!orders.length) {
    return (
      <Card><CardContent className="pt-6 text-center space-y-3">
        <Package className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No active deliveries assigned.</p>
      </CardContent></Card>
    );
  }

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                    <TableCell className="text-sm">{order.customer_name}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{order.delivery_address}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status || "pending"]}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">₱{Number(order.total).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
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
const DriverAvailability = ({ isAvailable, setIsAvailable }: { isAvailable: boolean; setIsAvailable: (v: boolean) => void }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <Label className="text-base font-semibold">Available for Deliveries</Label>
            <p className="text-sm text-muted-foreground mt-1">Toggle to receive new delivery assignments</p>
          </div>
          <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
        </div>
        <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Current Status</span><Badge variant={isAvailable ? "default" : "secondary"}>{isAvailable ? "Online" : "Offline"}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span>Motorcycle</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Service Zone</span><span>Metro Manila & Benguet</span></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── EARNINGS ────────────────────────────────────────────────────────────
const DriverEarnings = ({ wallet, transactions }: { wallet: any; transactions: any[] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Available</p><p className="text-2xl font-bold">₱{Number(wallet?.available_balance || 0).toLocaleString()}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">₱{Number(wallet?.pending_balance || 0).toLocaleString()}</p></CardContent></Card>
      <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Withdrawn</p><p className="text-2xl font-bold">₱{Number(wallet?.total_withdrawn || 0).toLocaleString()}</p></CardContent></Card>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
      <CardContent>
        {!transactions.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
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
        )}
      </CardContent>
    </Card>
  </div>
);

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────
const DriverNotifications = ({ notifications }: { notifications: any[] }) => (
  <div className="space-y-2">
    {!notifications.length ? (
      <Card><CardContent className="pt-6 text-center space-y-3">
        <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No notifications.</p>
      </CardContent></Card>
    ) : (
      notifications.map((n) => (
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

// ─── SUPPORT ─────────────────────────────────────────────────────────────
const DriverSupport = () => (
  <Card>
    <CardHeader><CardTitle className="text-base flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-primary" />Driver Support</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">Need help? Contact the Terra support team for delivery issues, payout questions, or account assistance.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-lg border space-y-1">
          <p className="text-sm font-medium">Emergency Hotline</p>
          <p className="text-sm text-muted-foreground">+63 917 TERRA (83772)</p>
        </div>
        <div className="p-4 rounded-lg border space-y-1">
          <p className="text-sm font-medium">Email Support</p>
          <p className="text-sm text-muted-foreground">drivers@terrafarming.ph</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── PROFILE ─────────────────────────────────────────────────────────────
const DriverProfile = ({ profile }: { profile: any }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-5 w-5 text-primary" />Personal Information</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Full Name</p><p className="font-medium">{profile?.full_name || "—"}</p></div>
          <div><p className="text-muted-foreground">Email</p><p className="font-medium">{profile?.email || "—"}</p></div>
          <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{profile?.phone || "—"}</p></div>
          <div><p className="text-muted-foreground">Referral Code</p><p className="font-medium font-mono">{profile?.referral_code || "—"}</p></div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Vehicle Details</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground">Vehicle Type</p><p className="font-medium">Motorcycle</p></div>
          <div><p className="text-muted-foreground">License Plate</p><p className="font-medium">ABC 1234</p></div>
          <div><p className="text-muted-foreground">Service Zone</p><p className="font-medium">Metro Manila & Benguet</p></div>
          <div><p className="text-muted-foreground">Rating</p><p className="font-medium">4.8 ★</p></div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />KYC / Verification</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Verified</p>
            <p className="text-xs text-green-600 dark:text-green-400">Your identity and vehicle have been verified.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default DriverDashboard;
