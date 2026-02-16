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
} from "lucide-react";

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
      if (!email) return { active: 0, pending: 0, delivered: 0 };

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
                    ₱{Number(wallet.pending_balance).toLocaleString()} pending
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

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onTabChange("shop")}
            >
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-xs">Browse Products</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onTabChange("orders")}
            >
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-xs">View Orders</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onTabChange("tokens")}
            >
              <Coins className="h-5 w-5 text-amber-500" />
              <span className="text-xs">View Rewards</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onTabChange("support")}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs">Get Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerOverviewPanel;
