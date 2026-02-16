import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag, Package, DollarSign, Coins, Bell, Clock,
  Plus, Eye, Wallet, TrendingUp, AlertTriangle,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface FarmerOverviewPanelProps {
  farmerId: string;
  userId: string;
  onNavigate: (tab: string) => void;
}

const FarmerOverviewPanel = ({ farmerId, userId, onNavigate }: FarmerOverviewPanelProps) => {
  // Today's orders
  const { data: todayOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["farmer-today-orders", farmerId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .eq("farmer_id", farmerId)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Pending orders count
  const pendingOrders = todayOrders.filter((o) => o.status === "pending");

  // Wallet balance
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

  // Token balance
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

  // Low stock products
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

  // Unread notifications
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

  // Period earnings
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

  const isLoading = ordersLoading || walletLoading || tokenLoading;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("orders")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Orders</p>
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-2xl font-bold">{todayOrders.length}</p>
                )}
              </div>
              <ShoppingBag className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("orders")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-amber-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("earnings")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">30-Day Earnings</p>
                {isLoading ? <Skeleton className="h-8 w-20" /> : (
                  <p className="text-2xl font-bold">₱{periodEarnings.toLocaleString()}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("tokens")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AGRI Tokens</p>
                {isLoading ? <Skeleton className="h-8 w-16" /> : (
                  <p className="text-2xl font-bold">{Number(tokenBalance).toLocaleString()}</p>
                )}
              </div>
              <Coins className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Wallet + Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletLoading ? <Skeleton className="h-10 w-32" /> : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-bold text-lg">₱{Number(wallet?.available_balance ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unreadCount === 0 ? (
              <p className="text-sm text-muted-foreground">No new notifications</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">You have <span className="font-bold">{unreadCount}</span> unread alert{unreadCount > 1 ? "s" : ""}</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => onNavigate("notifications")}>
                  View Alerts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="outline" className="text-amber-600">{p.stock} {p.unit} left</Badge>
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => onNavigate("products")}>
              <Plus className="h-5 w-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => onNavigate("orders")}>
              <Eye className="h-5 w-5" />
              <span className="text-xs">View Orders</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => onNavigate("withdrawals")}>
              <Wallet className="h-5 w-5" />
              <span className="text-xs">Request Payout</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => onNavigate("delivery")}>
              <Package className="h-5 w-5" />
              <span className="text-xs">Track Delivery</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerOverviewPanel;
