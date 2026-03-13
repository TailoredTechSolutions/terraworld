import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusChip from "@/components/backoffice/StatusChip";
import KPICard from "@/components/backoffice/KPICard";
import {
  ShoppingBag, Package, DollarSign, Coins, Bell, Clock,
  Plus, Eye, Wallet, TrendingUp, AlertTriangle, Truck,
} from "lucide-react";
import { format } from "date-fns";

interface FarmerOverviewPanelProps {
  farmerId: string;
  userId: string;
  onNavigate: (tab: string) => void;
}

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

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards — shared KPICard component */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="cursor-pointer" onClick={() => onNavigate("orders")}>
          <KPICard
            title="Today's Orders"
            value={isLoading ? "..." : todayOrders.length}
            icon={ShoppingBag}
          />
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("orders")}>
          <KPICard
            title="Pending"
            value={isLoading ? "..." : pendingOrders.length}
            icon={Clock}
          />
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("earnings")}>
          <KPICard
            title="Monthly Earnings"
            value={isLoading ? "..." : `₱${periodEarnings.toLocaleString()}`}
            icon={TrendingUp}
          />
        </div>
        <div className="cursor-pointer" onClick={() => onNavigate("tokens")}>
          <KPICard
            title="AGRI Tokens"
            value={isLoading ? "..." : Number(tokenBalance).toLocaleString()}
            icon={Coins}
          />
        </div>
      </div>

      {/* Recent Activity + Wallet/Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity - takes 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 && recentNotifs.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No recent activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">Orders and notifications will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onNavigate("orders")}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{o.order_number} — {o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">₱{Number(o.total).toLocaleString()}</span>
                      <StatusChip status={o.status || "pending"} />
                    </div>
                  </div>
                ))}
                {recentNotifs.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? "border-primary/20 bg-primary/5" : ""}`}
                    onClick={() => onNavigate("notifications")}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{format(new Date(n.created_at), "MMM d")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet + Alerts stacked */}
        <div className="space-y-4">
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
                    <span className="font-bold">₱{Number(wallet?.available_balance ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Pending</span>
                    <span>₱{Number(wallet?.pending_balance ?? 0).toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => onNavigate("withdrawals")}>
                    Request Payout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" /> Alerts
                {unreadCount > 0 && <StatusChip status={`${unreadCount} unread`} />}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {unreadCount === 0 ? (
                <p className="text-xs text-muted-foreground">All caught up!</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-bold">{unreadCount}</span> unread alert{unreadCount > 1 ? "s" : ""}</p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => onNavigate("notifications")}>
                    View Alerts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {lowStockProducts.map((p) => (
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
