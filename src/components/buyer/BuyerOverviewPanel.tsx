import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  Coins,
  TrendingUp,
  ShoppingBag,
  Bell,
  Wallet,
  ArrowRight,
  Loader2,
  Ticket,
  Eye,
  Info,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface BuyerOverviewPanelProps {
  userId: string;
  onTabChange: (tab: string) => void;
}

const BuyerOverviewPanel = ({ userId, onTabChange }: BuyerOverviewPanelProps) => {
  const { data: profile } = useQuery({
    queryKey: ["buyer-overview-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("agri_token_balance, email, referral_code")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: orderStats, isLoading } = useQuery({
    queryKey: ["buyer-overview-orders", userId],
    queryFn: async () => {
      const email = profile?.email;
      if (!email) return { active: 0, pending: 0, delivered: 0, total: 0 };
      const { data } = await supabase
        .from("orders")
        .select("status")
        .eq("customer_email", email);
      const orders = data || [];
      return {
        active: orders.filter((o) => ["preparing", "in_transit"].includes(o.status || "")).length,
        pending: orders.filter((o) => o.status === "pending").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
        total: orders.length,
      };
    },
    enabled: !!profile?.email,
  });

  const { data: wallet } = useQuery({
    queryKey: ["buyer-overview-wallet", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallets")
        .select("available_balance, pending_balance")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: referralEarnings } = useQuery({
    queryKey: ["buyer-overview-referral-earnings", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payout_ledger")
        .select("net_amount")
        .eq("user_id", userId);
      return (data || []).reduce((sum, p) => sum + Number(p.net_amount), 0);
    },
  });

  const { data: unreadNotifs } = useQuery({
    queryKey: ["buyer-overview-notifs", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      return count || 0;
    },
  });

  // Recent activity: last 5 orders + last 5 notifications
  const { data: recentOrders } = useQuery({
    queryKey: ["buyer-overview-recent-orders", userId],
    queryFn: async () => {
      const email = profile?.email;
      if (!email) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!profile?.email,
  });

  const { data: recentNotifications } = useQuery({
    queryKey: ["buyer-overview-recent-notifs", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["buyer-overview-recent-tx", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallet_transactions")
        .select("id, transaction_type, amount, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    in_transit: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const notifIcons: Record<string, React.ElementType> = {
    order: Package,
    alert: AlertCircle,
    reward: Coins,
    info: Info,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("orders")}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-primary" />
              {(orderStats?.active || 0) > 0 && (
                <Badge variant="secondary" className="text-xs">{orderStats?.active} active</Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{orderStats?.total || 0}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("orders")}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{orderStats?.pending || 0}</p>
            <p className="text-xs text-muted-foreground">Pending Deliveries</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("tokens")}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <Coins className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">{Number(profile?.agri_token_balance || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">AGRI Tokens</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("referrals")}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">₱{Number(referralEarnings || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Referral Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet + Notifications Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">₱{Number(wallet?.available_balance || 0).toLocaleString()}</p>
                {Number(wallet?.pending_balance || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ₱{Number(wallet?.pending_balance).toLocaleString()} pending
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => onTabChange("wallet")}>
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
              {(unreadNotifs || 0) > 0 && (
                <Badge variant="destructive" className="text-xs ml-auto">
                  {unreadNotifs} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <p className="text-sm text-muted-foreground">
                {unreadNotifs ? `You have ${unreadNotifs} unread notification${unreadNotifs > 1 ? "s" : ""}` : "All caught up!"}
              </p>
              <Button variant="outline" size="sm" onClick={() => onTabChange("notifications")}>
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {(!recentOrders?.length && !recentNotifications?.length && !recentTransactions?.length) ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity yet. Start shopping!</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {/* Merge and sort by date */}
              {[
                ...(recentOrders || []).map((o) => ({
                  id: `order-${o.id}`,
                  type: "order" as const,
                  title: `Order ${o.order_number}`,
                  detail: `₱${Number(o.total).toLocaleString()}`,
                  status: o.status,
                  date: o.created_at,
                  tab: "orders",
                })),
                ...(recentTransactions || []).map((tx) => ({
                  id: `tx-${tx.id}`,
                  type: "wallet" as const,
                  title: tx.description || tx.transaction_type,
                  detail: `${Number(tx.amount) >= 0 ? "+" : ""}₱${Math.abs(Number(tx.amount)).toLocaleString()}`,
                  status: null,
                  date: tx.created_at,
                  tab: "wallet",
                })),
                ...(recentNotifications || []).map((n) => ({
                  id: `notif-${n.id}`,
                  type: "notification" as const,
                  title: n.title,
                  detail: n.message,
                  status: null,
                  date: n.created_at,
                  tab: "notifications",
                })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((item) => {
                  const Icon = item.type === "order" ? Package : item.type === "wallet" ? Wallet : (notifIcons[(recentNotifications?.find(n => `notif-${n.id}` === item.id))?.type || "info"] || Info);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onTabChange(item.tab)}
                    >
                      <div className="p-1.5 rounded-full bg-muted shrink-0">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.date), "MMM d, h:mm a")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {item.status ? (
                          <Badge className={`text-[10px] ${statusColors[item.status || "pending"] || ""}`}>
                            {item.status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{item.detail?.substring(0, 30)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Browse Products", icon: ShoppingBag, tab: "shop", color: "text-primary" },
              { label: "View Orders", icon: Package, tab: "orders", color: "text-blue-500" },
              { label: "Track Deliveries", icon: Truck, tab: "orders", color: "text-purple-500" },
              { label: "View Wallet", icon: Wallet, tab: "wallet", color: "text-emerald-500" },
              { label: "View Rewards", icon: Coins, tab: "tokens", color: "text-amber-500" },
              { label: "Get Support", icon: Ticket, tab: "support", color: "text-muted-foreground" },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => onTabChange(action.tab)}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerOverviewPanel;
