import KPICard from "../KPICard";
import StatusChip from "../StatusChip";
import { ShoppingCart, DollarSign, Users, Truck, TrendingUp, AlertTriangle, Ticket, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

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

const attentionItems = [
  { type: "Flagged Order", id: "ORD-2026-089", reason: "Payment mismatch", status: "pending" },
  { type: "Failed Payment", id: "PAY-8812", reason: "GCash timeout", status: "failed" },
  { type: "Overdue Delivery", id: "DEL-445", reason: "ETA exceeded by 3hrs", status: "in_transit" },
  { type: "KYC Pending", id: "USR-192", reason: "Docs submitted 5d ago", status: "pending" },
  { type: "Low Stock", id: "PRD-034", reason: "Lettuce — 2kg remaining", status: "pending" },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const OverviewSection = ({ openDrawer }: Props) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard icon={DollarSign} title="GMV (30d)" value="₱2.4M" change="+12.3% vs last month" changeType="up" />
        <KPICard icon={TrendingUp} title="Service Fees (30d)" value="₱362K" change="+8.1%" changeType="up" />
        <KPICard icon={ShoppingCart} title="Total Orders" value="1,847" change="+15.2%" changeType="up" />
        <KPICard icon={Users} title="Active Farmers" value="142" change="+6" changeType="up" />
        <KPICard icon={Users} title="Active Buyers" value="3,284" change="+189" changeType="up" />
        <KPICard icon={Truck} title="Active Drivers" value="38" change="-2" changeType="down" />
        <KPICard icon={Ticket} title="Open Tickets" value="14" change="3 urgent" changeType="neutral" />
        <KPICard icon={Wallet} title="Pending Withdrawals" value="23" change="₱184K total" changeType="neutral" />
        <KPICard icon={DollarSign} title="Payout Status" value="Ready" change="Next run: Mar 5" changeType="neutral" />
        <KPICard icon={AlertTriangle} title="Attention Items" value="5" change="2 critical" changeType="down" />
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

      {/* Attention Queue */}
      <div className="rounded-lg border border-border/50 bg-card/60 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" /> Attention Needed
        </h3>
        <div className="space-y-2">
          {attentionItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
              onClick={() => openDrawer("order", { order_number: item.id, status: item.status, buyer: "Customer", farmer: "Farm", total: 1500, subtotal: 1200, platform_fee: 180, tax: 60, delivery_fee: 60, payment_status: item.status })}
            >
              <div className="flex items-center gap-3">
                <StatusChip status={item.status} />
                <div>
                  <p className="text-xs font-medium">{item.type}: {item.id}</p>
                  <p className="text-[11px] text-muted-foreground">{item.reason}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">View →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
