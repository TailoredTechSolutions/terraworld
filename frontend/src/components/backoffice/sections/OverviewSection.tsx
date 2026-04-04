import KPICard from "../KPICard";
import StatusChip from "../StatusChip";
import { ShoppingCart, DollarSign, Users, Truck, TrendingUp, AlertTriangle, Ticket, Wallet, Package, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { useAdminStats } from "@/hooks/useApiData";
import { Skeleton } from "@/components/ui/skeleton";

const ordersOverTime = [
  { day: "Mon", orders: 42 }, { day: "Tue", orders: 58 }, { day: "Wed", orders: 35 },
  { day: "Thu", orders: 67 }, { day: "Fri", orders: 89 }, { day: "Sat", orders: 95 }, { day: "Sun", orders: 73 },
];

const revenueData = [
  { day: "Mon", revenue: 18400, fees: 2760 }, { day: "Tue", revenue: 24600, fees: 3690 },
  { day: "Wed", revenue: 15200, fees: 2280 }, { day: "Thu", revenue: 29800, fees: 4470 },
  { day: "Fri", revenue: 38500, fees: 5775 }, { day: "Sat", revenue: 41200, fees: 6180 },
  { day: "Sun", revenue: 31600, fees: 4740 },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const OverviewSection = ({ openDrawer }: Props) => {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(1)}K`;
    return `₱${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards - Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard icon={DollarSign} title="Total Revenue" value={formatCurrency(stats?.total_revenue || 0)} change="From all orders" changeType="up" />
        <KPICard icon={ShoppingCart} title="Total Orders" value={String(stats?.total_orders || 0)} change={`${stats?.pending_orders || 0} pending`} changeType="up" />
        <KPICard icon={Package} title="Products" value={String(stats?.total_products || 0)} change="Active listings" changeType="up" />
        <KPICard icon={Leaf} title="Farms" value={String(stats?.total_farms || 0)} change="Registered farms" changeType="up" />
        <KPICard icon={AlertTriangle} title="Pending Orders" value={String(stats?.pending_orders || 0)} change="Needs attention" changeType={stats?.pending_orders ? "down" : "neutral"} />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard icon={Truck} title="Active Drivers" value="38" change="-2" changeType="down" />
        <KPICard icon={Users} title="Active Buyers" value="3,284" change="+189" changeType="up" />
        <KPICard icon={Ticket} title="Open Tickets" value="14" change="3 urgent" changeType="neutral" />
        <KPICard icon={Wallet} title="Pending Withdrawals" value="23" change="₱184K total" changeType="neutral" />
        <KPICard icon={TrendingUp} title="Conversion Rate" value="12.4%" change="+2.1% vs last week" changeType="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/50 bg-card/60 p-4">
          <h3 className="text-sm font-semibold mb-3">Orders Over Time (7d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/60 p-4">
          <h3 className="text-sm font-semibold mb-3">Revenue & Fees (7d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fees" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders - Real Data */}
      <div className="rounded-lg border border-border/50 bg-card/60 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" /> Recent Orders
        </h3>
        <div className="space-y-2">
          {stats?.recent_orders?.slice(0, 5).map((order, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors gap-3"
              onClick={() => {
                openDrawer("order", { 
                  order_number: order.id.slice(0, 8), 
                  status: order.order_status, 
                  buyer: order.delivery_address.full_name, 
                  farmer: order.items[0]?.farm_name || "Multiple", 
                  total: order.total, 
                  subtotal: order.subtotal, 
                  platform_fee: 0, 
                  tax: 0, 
                  delivery_fee: order.delivery_fee, 
                  payment_status: order.payment_status,
                  items: order.items,
                  delivery_address: order.delivery_address,
                });
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusChip status={order.order_status} />
                <div className="min-w-0">
                  <p className="text-xs font-medium break-words">#{order.id.slice(0, 8)}</p>
                  <p className="text-[11px] text-muted-foreground break-words">
                    {order.delivery_address.full_name} • {order.items.length} item(s)
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-primary">₱{order.total.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">{order.payment_method}</p>
              </div>
            </div>
          ))}
          {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
