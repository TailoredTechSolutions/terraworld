import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Crown,
  Wallet,
  TrendingUp,
  Activity,
  DollarSign,
  UserPlus,
  ArrowUpRight,
  AlertCircle,
  Coins,
  Clock,
  Truck,
  Phone,
  Mail,
  MapPin,
  Package,
  AlertTriangle,
  Archive,
  Eye,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders"> & {
  farmers?: { name: string; location?: string; phone?: string; email?: string } | null;
  drivers?: { name: string; phone?: string; vehicle?: string; license_plate?: string } | null;
};

interface SystemMetrics {
  totalMembers: number;
  activeMembers: number;
  totalBVGenerated: number;
  totalCommissionsPaid: number;
  pendingWithdrawals: number;
  tokenIssuedTotal: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  inTransitOrders: number;
}

const rankDistribution = [
  { name: "Member", value: 450, color: "hsl(var(--muted))" },
  { name: "Bronze", value: 120, color: "#cd7f32" },
  { name: "Silver", value: 80, color: "#c0c0c0" },
  { name: "Gold", value: 45, color: "#ffd700" },
  { name: "Platinum", value: 20, color: "#e5e4e2" },
  { name: "Diamond", value: 8, color: "#60a5fa" },
  { name: "Crown", value: 2, color: "hsl(var(--primary))" },
];

interface AdminOverviewPanelProps {
  membersCount: number;
  ordersCount: number;
  totalRevenue: number;
  orders?: Order[];
  onRefresh?: () => void;
}

const AdminOverviewPanel = ({ membersCount, ordersCount, totalRevenue, orders = [], onRefresh }: AdminOverviewPanelProps) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalMembers: membersCount,
    activeMembers: 0,
    totalBVGenerated: 0,
    totalCommissionsPaid: 0,
    pendingWithdrawals: 0,
    tokenIssuedTotal: 0,
    totalOrders: ordersCount,
    totalRevenue: totalRevenue,
    pendingOrders: 0,
    inTransitOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [membersCount, ordersCount]);

  // Compute attention items from real orders
  const attentionItems = useMemo(() => {
    const items: { type: string; order: Order; label: string; severity: "warning" | "destructive" | "info"; icon: any; age?: string }[] = [];
    const now = new Date();

    orders.forEach((order) => {
      const createdAt = new Date(order.created_at);
      const ageMs = now.getTime() - createdAt.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      const ageStr = ageHours < 1 
        ? `${Math.floor(ageMs / 60000)}m ago` 
        : ageHours < 24 
          ? `${Math.floor(ageHours)}h ago` 
          : `${Math.floor(ageHours / 24)}d ago`;

      // Pending payment orders
      if (order.status === "pending") {
        if (ageHours > 2) {
          items.push({
            type: "failed_order",
            order,
            label: `${order.order_number} — Pending > 2hrs (auto-archive candidate)`,
            severity: "destructive",
            icon: AlertTriangle,
            age: ageStr,
          });
        } else {
          items.push({
            type: "pending_payment",
            order,
            label: `${order.order_number} — Payment Pending`,
            severity: "warning",
            icon: Clock,
            age: ageStr,
          });
        }
      }
    });

    // Sort by severity (destructive first)
    items.sort((a, b) => (a.severity === "destructive" ? -1 : 1) - (b.severity === "destructive" ? -1 : 1));
    return items;
  }, [orders]);

  // In-transit orders
  const inTransitOrders = useMemo(() => {
    return orders.filter((o) => o.status === "in_transit");
  }, [orders]);

  const fetchMetrics = async () => {
    try {
      const [bvRes, payoutRes, walletRes, tokenRes, profilesRes, withdrawalRes] = await Promise.all([
        supabase.from("bv_ledger").select("bv_amount"),
        supabase.from("payout_ledger").select("net_amount"),
        supabase.from("wallets").select("pending_balance"),
        supabase.from("token_ledger").select("tokens_issued"),
        supabase.from("profiles").select("id, full_name, email, created_at, referral_code").order("created_at", { ascending: false }).limit(5),
        supabase.from("withdrawal_requests").select("amount").eq("status", "pending"),
      ]);

      const totalBV = bvRes.data?.reduce((s, r) => s + Number(r.bv_amount), 0) || 0;
      const totalPayouts = payoutRes.data?.reduce((s, r) => s + Number(r.net_amount), 0) || 0;
      const pendingWd = withdrawalRes.data?.reduce((s, r) => s + Number(r.amount), 0) || 0;
      const tokensTotal = tokenRes.data?.reduce((s, t) => s + Number(t.tokens_issued), 0) || 0;

      const pendingOrders = orders.filter((o) => o.status === "pending").length;
      const inTransit = orders.filter((o) => o.status === "in_transit").length;

      // Build 7-day sales data from real orders
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });
      const chartData = last7.map((date) => {
        const dayOrders = orders.filter((o) => {
          const od = new Date(o.created_at);
          return od.toDateString() === date.toDateString();
        });
        return {
          date: days[date.getDay()],
          orders: dayOrders.length,
          revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        };
      });
      setSalesData(chartData);

      setMetrics({
        totalMembers: membersCount,
        activeMembers: membersCount, // all registered are counted
        totalBVGenerated: totalBV,
        totalCommissionsPaid: totalPayouts,
        pendingWithdrawals: pendingWd,
        tokenIssuedTotal: tokensTotal,
        totalOrders: ordersCount,
        totalRevenue,
        pendingOrders,
        inTransitOrders: inTransit,
      });

      setRecentActivity(profilesRes.data || []);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
    }
  };

  const archiveOrder = async (orderId: string) => {
    setArchiving(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" as any })
        .eq("id", orderId);
      if (error) throw error;
      toast({ title: "Order Archived", description: "Failed order has been cancelled and archived." });
      onRefresh?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setArchiving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      preparing: { variant: "secondary", label: "Preparing" },
      in_transit: { variant: "outline", label: "In Transit" },
      delivered: { variant: "default", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const c = map[status] || { variant: "secondary", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">Total</Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.totalMembers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{metrics.totalOrders.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">₱{metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <p className="text-2xl font-bold">{metrics.totalBVGenerated.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total BV</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="h-4 w-4 text-orange-500" />
              {metrics.pendingWithdrawals > 0 && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-2xl font-bold">₱{metrics.pendingWithdrawals.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <Coins className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{metrics.tokenIssuedTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Tokens Issued</p>
          </CardContent>
        </Card>
      </div>

      {/* Attention Needed + In Transit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attention Needed */}
        <Card className="border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Attention Needed
              {attentionItems.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">{attentionItems.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Pending payments & failed orders requiring action</CardDescription>
          </CardHeader>
          <CardContent>
            {attentionItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No items need attention right now
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {attentionItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.order.id + i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors group"
                      onClick={() => setSelectedOrder(item.order)}
                    >
                      <div className={`p-1.5 rounded-md ${item.severity === "destructive" ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-500"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.order.customer_name} • ₱{Number(item.order.total).toLocaleString()} • {item.age}
                        </p>
                      </div>
                      {item.type === "failed_order" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          disabled={archiving}
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveOrder(item.order.id);
                          }}
                        >
                          <Archive className="h-3 w-3 mr-1" />
                          Archive
                        </Button>
                      )}
                      <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Transit Orders */}
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              In Transit
              {inTransitOrders.length > 0 && (
                <Badge variant="outline" className="ml-auto text-xs">{inTransitOrders.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Orders currently being delivered</CardDescription>
          </CardHeader>
          <CardContent>
            {inTransitOrders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Truck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No orders in transit
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {inTransitOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_name} → {order.farmers?.name || "Unknown Farm"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₱{Number(order.total).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{order.drivers?.name || "No driver"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Orders & Revenue (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                orders: { label: "Orders", color: "hsl(var(--primary))" },
                revenue: { label: "Revenue (₱)", color: "hsl(var(--accent))" },
              }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#ordersGrad)" />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-accent" />
              Rank Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rankDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {rankDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {rankDistribution.slice(0, 4).map((rank) => (
                <div key={rank.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: rank.color }} />
                  <span className="text-muted-foreground">{rank.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                New Registrations
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {member.full_name?.slice(0, 2).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.full_name || "New Member"}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{member.referral_code}</Badge>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent registrations</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-orange-500">{metrics.pendingOrders}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-primary">{metrics.inTransitOrders}</p>
                <p className="text-xs text-muted-foreground">In Transit</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-2xl font-bold text-destructive">{orders.filter((o) => o.status === "cancelled").length}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commissions Paid</span>
              <span className="font-semibold">₱{metrics.totalCommissionsPaid.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order {selectedOrder?.order_number}
              {selectedOrder && getStatusBadge(selectedOrder.status || "pending")}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Buyer Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" /> Buyer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${selectedOrder.customer_phone}`} className="hover:text-primary underline">
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <a href={`mailto:${selectedOrder.customer_email}`} className="hover:text-primary underline">
                        {selectedOrder.customer_email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedOrder.delivery_address}
                  </div>
                </CardContent>
              </Card>

              {/* Farm Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" /> Farm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selectedOrder.farmers?.name || "Unknown Farm"}</p>
                  {selectedOrder.farmers?.location && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.farmers.location}</p>
                  )}
                  {selectedOrder.farmers?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${selectedOrder.farmers.phone}`} className="hover:text-primary underline">
                        {selectedOrder.farmers.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Driver Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Driver
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder.drivers ? (
                    <>
                      <p className="font-medium">{selectedOrder.drivers.name}</p>
                      {selectedOrder.drivers.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3.5 w-3.5" />
                          <a href={`tel:${selectedOrder.drivers.phone}`} className="hover:text-primary underline">
                            {selectedOrder.drivers.phone}
                          </a>
                        </div>
                      )}
                      {selectedOrder.drivers.vehicle && (
                        <p className="text-sm text-muted-foreground capitalize mt-1">
                          {selectedOrder.drivers.vehicle} • {selectedOrder.drivers.license_plate}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No driver assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedOrder.items_count} items</p>
                  <p className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <p className="text-2xl font-bold text-primary">₱{Number(selectedOrder.total).toLocaleString()}</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₱{Number(selectedOrder.delivery_fee).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.terra_fee) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span>₱{Number(selectedOrder.terra_fee).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`tel:${selectedOrder.customer_phone}`}>
                    <Phone className="h-4 w-4 mr-2" /> Call Buyer
                  </a>
                </Button>
                {selectedOrder.customer_email && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`mailto:${selectedOrder.customer_email}`}>
                      <Mail className="h-4 w-4 mr-2" /> Email Buyer
                    </a>
                  </Button>
                )}
              </div>

              {/* Archive action for failed orders */}
              {selectedOrder.status === "pending" && (() => {
                const ageHours = (Date.now() - new Date(selectedOrder.created_at).getTime()) / (1000 * 60 * 60);
                return ageHours > 2;
              })() && (
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={archiving}
                  onClick={() => archiveOrder(selectedOrder.id)}
                >
                  {archiving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
                  Archive Failed Order
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOverviewPanel;
