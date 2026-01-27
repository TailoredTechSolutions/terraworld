import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Package,
  UserPlus,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Coins,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SystemMetrics {
  totalMembers: number;
  activeMembers: number;
  totalBVGenerated: number;
  totalCommissionsPaid: number;
  pendingWithdrawals: number;
  tokenIssuedTotal: number;
}

// Chart data
const salesData = [
  { date: "Mon", sales: 28, activations: 12 },
  { date: "Tue", sales: 35, activations: 18 },
  { date: "Wed", sales: 42, activations: 15 },
  { date: "Thu", sales: 30, activations: 22 },
  { date: "Fri", sales: 48, activations: 28 },
  { date: "Sat", sales: 52, activations: 32 },
  { date: "Sun", sales: 38, activations: 20 },
];

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
}

const AdminOverviewPanel = ({ membersCount, ordersCount, totalRevenue }: AdminOverviewPanelProps) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalMembers: membersCount,
    activeMembers: Math.floor(membersCount * 0.7),
    totalBVGenerated: 0,
    totalCommissionsPaid: 0,
    pendingWithdrawals: 0,
    tokenIssuedTotal: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, [membersCount]);

  const fetchMetrics = async () => {
    try {
      // Fetch BV totals
      const { data: bvData } = await supabase
        .from("bv_ledger")
        .select("bv_amount");
      
      const totalBV = bvData?.reduce((sum, r) => sum + Number(r.bv_amount), 0) || 0;

      // Fetch payout totals
      const { data: payoutData } = await supabase
        .from("payout_ledger")
        .select("net_amount");
      
      const totalPayouts = payoutData?.reduce((sum, r) => sum + Number(r.net_amount), 0) || 0;

      // Fetch pending withdrawals (wallets with pending balance)
      const { data: walletData } = await supabase
        .from("wallets")
        .select("pending_balance");
      
      const pendingTotal = walletData?.reduce((sum, w) => sum + Number(w.pending_balance), 0) || 0;

      // Fetch token totals
      const { data: tokenData } = await supabase
        .from("token_ledger")
        .select("tokens_issued");
      
      const tokensTotal = tokenData?.reduce((sum, t) => sum + Number(t.tokens_issued), 0) || 0;

      setMetrics({
        totalMembers: membersCount,
        activeMembers: Math.floor(membersCount * 0.7),
        totalBVGenerated: totalBV,
        totalCommissionsPaid: totalPayouts,
        pendingWithdrawals: pendingTotal,
        tokenIssuedTotal: tokensTotal,
      });

      // Fetch recent profiles for activity
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, referral_code")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(recentProfiles || []);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
    }
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
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> 12%
              </span>
            </div>
            <p className="text-2xl font-bold">{metrics.activeMembers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <p className="text-2xl font-bold">{metrics.totalBVGenerated.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total BV Generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <p className="text-2xl font-bold">₱{metrics.totalCommissionsPaid.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Commissions Paid</p>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Activations Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Sales & Activations This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sales: { label: "Sales", color: "hsl(var(--primary))" },
                activations: { label: "Activations", color: "hsl(var(--accent))" },
              }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="activationsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#salesGrad)" />
                  <Area type="monotone" dataKey="activations" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#activationsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Rank Distribution */}
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
                  <Pie
                    data={rankDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
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
        {/* New Registrations */}
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
                  <Badge variant="secondary" className="text-xs">
                    {member.referral_code}
                  </Badge>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent registrations</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Commission Run Status */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                Commission Run Status
              </CardTitle>
              <Badge variant="outline">Weekly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Last Run</span>
                  <Badge variant="default" className="bg-primary">Completed</Badge>
                </div>
                <p className="text-lg font-semibold">January 20, 2026</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Binary Paid</p>
                    <p className="font-semibold">₱45,230</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Matching Paid</p>
                    <p className="font-semibold">₱12,450</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-dashed">
                <div>
                  <p className="text-sm font-medium">Next Scheduled Run</p>
                  <p className="text-xs text-muted-foreground">January 27, 2026</p>
                </div>
                <Button size="sm" className="btn-primary-gradient">
                  Run Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewPanel;
