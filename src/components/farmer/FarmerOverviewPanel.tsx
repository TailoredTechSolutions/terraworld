import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatusChip from "@/components/backoffice/StatusChip";
import KPICard from "@/components/backoffice/KPICard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, BarChart, Bar,
} from "recharts";
import {
  ShoppingBag, Package, DollarSign, Coins, Bell, Clock,
  Plus, Eye, Wallet, TrendingUp, AlertTriangle, Truck, Leaf,
} from "lucide-react";
import { format } from "date-fns";

interface FarmerOverviewPanelProps {
  farmerId: string;
  userId: string;
  onNavigate: (tab: string) => void;
}

// Demo data used when real data is empty
const demoProducts = [
  { id: "d1", name: "Tomatoes", stock: 350, unit: "lbs", price: 112.50, category: "vegetables", harvest_date: "2026-03-10", is_paused: false },
  { id: "d2", name: "Corn", stock: 200, unit: "lbs", price: 85.00, category: "vegetables", harvest_date: "2026-03-08", is_paused: false },
  { id: "d3", name: "Lettuce", stock: 8, unit: "kg", price: 145.00, category: "vegetables", harvest_date: "2026-03-12", is_paused: false },
  { id: "d4", name: "Carrots", stock: 120, unit: "lbs", price: 95.00, category: "vegetables", harvest_date: "2026-03-09", is_paused: false },
  { id: "d5", name: "Potatoes", stock: 500, unit: "lbs", price: 68.00, category: "vegetables", harvest_date: "2026-03-07", is_paused: false },
  { id: "d6", name: "Mangoes", stock: 75, unit: "kg", price: 180.00, category: "fruits", harvest_date: "2026-03-11", is_paused: false },
];

const demoOrders = [
  { id: "do1", order_number: "ORD-2026-021", customer_name: "Local Market", status: "preparing", total: 5625, created_at: new Date(Date.now() - 2 * 3600000).toISOString(), items: "Tomatoes (50 lbs)" },
  { id: "do2", order_number: "ORD-2026-022", customer_name: "Fresh Grocery", status: "in_transit", total: 2900, created_at: new Date(Date.now() - 5 * 3600000).toISOString(), items: "Lettuce (20 crates)" },
  { id: "do3", order_number: "ORD-2026-023", customer_name: "Maria Santos", status: "pending", total: 1360, created_at: new Date(Date.now() - 8 * 3600000).toISOString(), items: "Carrots (16 lbs)" },
  { id: "do4", order_number: "ORD-2026-024", customer_name: "Downtown Deli", status: "delivered", total: 8500, created_at: new Date(Date.now() - 24 * 3600000).toISOString(), items: "Potatoes (125 lbs)" },
  { id: "do5", order_number: "ORD-2026-025", customer_name: "Chef Juan's Kitchen", status: "delivered", total: 3600, created_at: new Date(Date.now() - 48 * 3600000).toISOString(), items: "Mangoes (20 kg)" },
];

const demoDelivery = {
  driver: "Carlos Martinez",
  product: "50 lbs Tomatoes",
  destination: "Downtown Market",
  status: "In Transit",
  eta: "25 mins",
};

const demoWeeklyRevenue = [
  { day: "Mon", revenue: 3200 },
  { day: "Tue", revenue: 4800 },
  { day: "Wed", revenue: 2900 },
  { day: "Thu", revenue: 5100 },
  { day: "Fri", revenue: 6200 },
  { day: "Sat", revenue: 7500 },
  { day: "Sun", revenue: 4120 },
];

const demoTopProducts = [
  { name: "Tomatoes", sales: 4200 },
  { name: "Potatoes", sales: 3400 },
  { name: "Mangoes", sales: 2800 },
  { name: "Carrots", sales: 1900 },
  { name: "Corn", sales: 1500 },
];

const FarmerOverviewPanel = ({ farmerId, userId, onNavigate }: FarmerOverviewPanelProps) => {
  const { data: todayOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["farmer-today-orders", farmerId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, customer_name, created_at")
        .eq("farmer_id", farmerId)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const pendingOrders = todayOrders.filter((o) => o.status === "pending");

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["farmer-wallet", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("available_balance, pending_balance")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: tokenBalance, isLoading: tokenLoading } = useQuery({
    queryKey: ["farmer-token-balance", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("agri_token_balance")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.agri_token_balance ?? 0;
    },
  });

  const { data: realProducts = [] } = useQuery({
    queryKey: ["farmer-products-overview", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, unit, price, category, harvest_date, is_paused")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ["farmer-low-stock", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, unit")
        .eq("farmer_id", farmerId)
        .lte("stock", 10)
        .order("stock", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["farmer-unread-notifs", userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: periodEarnings = 0 } = useQuery({
    queryKey: ["farmer-period-earnings", farmerId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from("orders")
        .select("farmer_price")
        .eq("farmer_id", farmerId)
        .eq("status", "delivered")
        .gte("created_at", thirtyDaysAgo.toISOString());
      if (error) throw error;
      return data.reduce((sum, o) => sum + Number(o.farmer_price ?? 0), 0);
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["farmer-recent-orders", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, customer_name, created_at")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentNotifs = [] } = useQuery({
    queryKey: ["farmer-recent-notifs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const isLoading = ordersLoading || walletLoading || tokenLoading;

  // Use demo data when real data is empty
  const hasRealOrders = recentOrders.length > 0;
  const displayOrders = hasRealOrders ? recentOrders : demoOrders;
  const displayProducts = realProducts.length > 0 ? realProducts : demoProducts;
  const displayLowStock = lowStockProducts.length > 0 ? lowStockProducts : demoProducts.filter(p => p.stock <= 10);
  const displayEarnings = periodEarnings > 0 ? periodEarnings : 33820;
  const displayTodayOrders = todayOrders.length > 0 ? todayOrders.length : 6;
  const displayPending = pendingOrders.length > 0 ? pendingOrders.length : 2;
  const displayTokens = Number(tokenBalance) > 0 ? Number(tokenBalance) : 245;

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="cursor-pointer" onClick={() => onNavigate("orders")}>
          <KPICard title="Today's Orders" value={isLoading ? "..." : displayTodayOrders} icon={ShoppingBag} />
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("orders")}>
          <KPICard title="Pending" value={isLoading ? "..." : displayPending} icon={Clock} />
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("earnings")}>
          <KPICard title="Monthly Earnings" value={isLoading ? "..." : `₱${displayEarnings.toLocaleString()}`} icon={TrendingUp} />
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("tokens")}>
          <KPICard title="AGRI Tokens" value={isLoading ? "..." : displayTokens.toLocaleString()} icon={Coins} />
        </div>
      </div>

      {/* Product Listings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Product Listings
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => onNavigate("products")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Harvest</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayProducts.slice(0, 5).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.stock} {p.unit}</TableCell>
                    <TableCell>₱{Number(p.price).toFixed(2)}/{p.unit}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {p.harvest_date ? format(new Date(p.harvest_date), "MMM d") : "—"}
                    </TableCell>
                    <TableCell>
                      {p.is_paused ? (
                        <Badge variant="secondary">Paused</Badge>
                      ) : (p.stock ?? 0) <= 10 ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {displayProducts.length > 5 && (
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => onNavigate("products")}>
              View all {displayProducts.length} products →
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders + Delivery Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onNavigate("orders")}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{o.order_number} — {o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.items || format(new Date(o.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">₱{Number(o.total).toLocaleString()}</span>
                    <StatusChip status={o.status || "pending"} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Status + Wallet */}
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4" /> Active Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver</span>
                  <span className="font-medium">{demoDelivery.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{demoDelivery.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span>{demoDelivery.destination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-primary border-primary/30">{demoDelivery.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETA</span>
                  <span className="font-medium text-primary">{demoDelivery.eta}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {walletLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-bold">₱{Number(wallet?.available_balance ?? 4120).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Pending</span>
                    <span>₱{Number(wallet?.pending_balance ?? 1850).toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => onNavigate("withdrawals")}>
                    Request Payout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoWeeklyRevenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Leaf className="h-4 w-4" /> Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ sales: { label: "Sales (₱)", color: "hsl(var(--primary))" } }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoTopProducts} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {displayLowStock.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {displayLowStock.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <span className="font-medium">{p.name}</span>
                  <StatusChip status={`${p.stock} ${p.unit} left`} />
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={() => onNavigate("products")}>
                Manage Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" /> Alerts
            {(unreadCount > 0 || !hasRealOrders) && <StatusChip status={`${unreadCount || 3} unread`} />}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {unreadCount === 0 && hasRealOrders ? (
            <p className="text-xs text-muted-foreground">All caught up!</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm"><span className="font-bold">{unreadCount || 3}</span> unread alert{(unreadCount || 3) > 1 ? "s" : ""}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => onNavigate("notifications")}>
                View Alerts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-1.5 py-3" onClick={() => onNavigate("products")}>
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-1.5 py-3" onClick={() => onNavigate("orders")}>
              <Eye className="h-5 w-5" />
              <span className="text-xs">View Orders</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-1.5 py-3" onClick={() => onNavigate("withdrawals")}>
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Request Withdrawal</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-1.5 py-3" onClick={() => onNavigate("delivery")}>
              <Truck className="h-5 w-5" />
              <span className="text-xs">Track Deliveries</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerOverviewPanel;
