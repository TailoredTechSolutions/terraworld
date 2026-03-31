import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign, GitBranch, Wallet, Coins, Crown, CheckCircle2, XCircle,
  ArrowUpRight, Shield, Loader2, Users, AlertTriangle,
  Ticket, TrendingUp, Activity, ShoppingCart, Truck, Scale, FileText
} from "lucide-react";

interface OverviewStats {
  totalOrders: number;
  pendingOrders: number;
  totalFarmers: number;
  activeFarmers: number;
  totalDrivers: number;
  onlineDrivers: number;
  totalBuyers: number;
  openTickets: number;
  terraFeeVolume: number;
  pendingApprovals: number;
  kycPending: number;
  recentOrders: Array<{ id: string; order_number: string; status: string; total: number; created_at: string; customer_name: string }>;
  recentAudit: Array<{ id: string; action: string; entity_type: string; created_at: string }>;
}

const BCOverview = () => {
  const { data, loading, adminData } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetch = async () => {
      const [
        ordersRes, pendingOrdersRes, farmersRes, activeFarmersRes,
        driversRes, onlineDriversRes, buyerCountRes, ticketsRes,
        terraFeeRes, approvalRes, kycRes, recentOrdersRes, auditRes
      ] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "preparing"]),
        supabase.from("farmers").select("id", { count: "exact", head: true }),
        supabase.from("farmers").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("drivers").select("id", { count: "exact", head: true }).eq("status", "online"),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "buyer"),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("orders").select("terra_fee"),
        supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("kyc_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id, order_number, status, total, created_at, customer_name").order("created_at", { ascending: false }).limit(8),
        supabase.from("audit_log").select("id, action, entity_type, created_at").order("created_at", { ascending: false }).limit(8),
      ]);

      const terraTotal = terraFeeRes.data?.reduce((s, r) => s + Number(r.terra_fee || 0), 0) || 0;

      setStats({
        totalOrders: ordersRes.count || 0,
        pendingOrders: pendingOrdersRes.count || 0,
        totalFarmers: farmersRes.count || 0,
        activeFarmers: activeFarmersRes.count || 0,
        totalDrivers: driversRes.count || 0,
        onlineDrivers: onlineDriversRes.count || 0,
        totalBuyers: buyerCountRes.count || 0,
        openTickets: ticketsRes.count || 0,
        terraFeeVolume: terraTotal,
        pendingApprovals: approvalRes.count || 0,
        kycPending: kycRes.count || 0,
        recentOrders: (recentOrdersRes.data || []) as any,
        recentAudit: (auditRes.data || []) as any,
      });
    };
    fetch();
  }, [isAdmin]);

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const tier = data.membership?.tier || "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  // --- Member view ---
  if (!isAdmin) {
    const carryForward = Math.abs(data.binaryStats.left_bv - data.binaryStats.right_bv);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Your business performance at a glance</p>
        </div>
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/20"><Crown className="h-7 w-7 text-primary" /></div>
              <div className="flex-1">
                <h2 className="text-lg font-bold font-display">Welcome back, Partner!</h2>
                <p className="text-sm text-muted-foreground">
                  {tierLabel} Package • Binary {data.binaryStats.matched_bv > 0 ? "Active" : "Inactive"}
                </p>
              </div>
              <Badge className="hidden sm:flex bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {tier !== "free" ? "Qualified" : "Free Tier"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "Total Earnings", value: `₱${data.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, accent: "text-emerald-600 bg-emerald-500/10" },
            { title: "Binary BV (L / R)", value: `${data.binaryStats.left_bv.toLocaleString()} / ${data.binaryStats.right_bv.toLocaleString()}`, icon: GitBranch, accent: "text-purple-600 bg-purple-500/10" },
            { title: "Wallet Balance", value: `₱${(data.walletData?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, accent: "text-blue-600 bg-blue-500/10" },
            { title: "AGRI Tokens", value: data.tokenBalance.toLocaleString(), icon: Coins, accent: "text-accent bg-accent/10" },
          ].map((s) => (
            <Card key={s.title} className="border-border/40">
              <CardContent className="p-4">
                <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
                <p className="text-xl font-bold font-display leading-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Qualification Status */}
        <Card className="border-border/40">
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Qualification Status</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { label: "Paid Member", met: tier !== "free", detail: tier !== "free" ? `${tierLabel} Active` : "No package" },
                { label: "Left Leg BV", met: data.binaryStats.left_bv > 0, detail: `${data.binaryStats.left_bv.toLocaleString()} BV` },
                { label: "Right Leg BV", met: data.binaryStats.right_bv > 0, detail: `${data.binaryStats.right_bv.toLocaleString()} BV` },
                { label: "Carry Forward", met: true, detail: `${carryForward.toLocaleString()} BV` },
              ].map((q) => (
                <div key={q.label} className={cn("flex items-center gap-2 p-2.5 rounded-lg border", q.met ? "border-emerald-500/20 bg-emerald-500/5" : "border-destructive/20 bg-destructive/5")}>
                  {q.met ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  <div>
                    <p className="text-xs font-medium leading-tight">{q.label}</p>
                    <p className="text-[10px] text-muted-foreground">{q.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Recent Earnings */}
        <Card className="border-border/40">
          <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Recent Earnings</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            {data.recentEarnings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No earnings recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Period</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Type</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs">Amount</th>
                  </tr></thead>
                  <tbody>
                    {data.recentEarnings.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="py-2 px-2 text-xs text-muted-foreground">{row.payout_period}</td>
                        <td className="py-2 px-2 text-xs font-medium">{row.bonus_type.replace(/_/g, " ")}</td>
                        <td className="py-2 px-2 text-right font-semibold text-xs">₱{Number(row.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Admin Overview ---
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Business Centre Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide performance snapshot</p>
      </div>

      {/* Row 1: Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Members", value: adminData.totalMembers.toLocaleString(), sub: `${adminData.activeMembers} active`, icon: Users, accent: "text-primary bg-primary/10" },
          { title: "Terra Fee Volume", value: `₱${(stats?.terraFeeVolume || 0).toLocaleString()}`, sub: "Commission base", icon: DollarSign, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Total Wallet Balance", value: `₱${adminData.totalWalletBalance.toLocaleString()}`, sub: `₱${adminData.pendingWithdrawalAmount.toLocaleString()} pending`, icon: Wallet, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Tokens Issued", value: adminData.totalTokensIssued.toLocaleString(), sub: "Non-cash rewards", icon: Coins, accent: "text-accent bg-accent/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-1.5 rounded-lg", s.accent)}><s.icon className="h-4 w-4" /></div>
              </div>
              <p className="text-xl font-bold font-display leading-tight">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.title}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Operations KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: ShoppingCart, value: (stats?.totalOrders || 0).toString(), label: "Total Orders", sub: `${stats?.pendingOrders || 0} pending`, accent: "text-primary" },
          { icon: TrendingUp, value: adminData.systemMatchedBv.toLocaleString(), label: "Matched BV", sub: `L: ${adminData.systemLeftBv.toLocaleString()} R: ${adminData.systemRightBv.toLocaleString()}`, accent: "text-purple-500" },
          { icon: Activity, value: `₱${adminData.systemTotalEarnings.toLocaleString()}`, label: "Total Paid Out", sub: "All commissions", accent: "text-emerald-500" },
          { icon: AlertTriangle, value: (adminData.pendingWithdrawals).toString(), label: "Pending Withdrawals", sub: `₱${adminData.pendingWithdrawalAmount.toLocaleString()}`, accent: "text-amber-500" },
        ].map((m) => (
          <Card key={m.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <m.icon className={cn("h-5 w-5 mx-auto mb-2", m.accent)} />
              <p className="text-lg font-bold font-display">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-[9px] text-muted-foreground">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Operational Counters */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Farmers", value: `${stats?.activeFarmers || 0}/${stats?.totalFarmers || 0}`, icon: Users },
          { label: "Drivers", value: `${stats?.onlineDrivers || 0}/${stats?.totalDrivers || 0}`, icon: Truck },
          { label: "Buyers", value: (stats?.totalBuyers || 0).toString(), icon: ShoppingCart },
          { label: "Open Tickets", value: (stats?.openTickets || 0).toString(), icon: Ticket },
          { label: "KYC Pending", value: (stats?.kycPending || 0).toString(), icon: FileText },
          { label: "Coupon Sales", value: `₱${adminData.totalCouponSales.toLocaleString()}`, icon: Ticket },
        ].map((c) => (
          <Card key={c.label} className="border-border/40">
            <CardContent className="p-3 text-center">
              <c.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm font-bold font-display">{c.value}</p>
              <p className="text-[9px] text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 4: Fail-safe & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="border-border/40">
          <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Fail-safe Status</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {[
              { label: "Threshold", value: "75% of compensation pool" },
              { label: "Binary Match Rate", value: "10% weak leg" },
              { label: "Compensation Pool", value: "33% of Terra Fees" },
              { label: "Status", value: "Healthy" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/40 lg:col-span-2">
          <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Recent Orders</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            {(stats?.recentOrders || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Order</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Total</th>
                  </tr></thead>
                  <tbody>
                    {stats!.recentOrders.slice(0, 6).map((o) => (
                      <tr key={o.id} className="border-b border-border/20">
                        <td className="py-1.5 px-1 font-mono text-[10px]">{o.order_number}</td>
                        <td className="py-1.5 px-1 truncate max-w-[120px]">{o.customer_name}</td>
                        <td className="py-1.5 px-1">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">{o.status}</Badge>
                        </td>
                        <td className="py-1.5 px-1 text-right font-medium">₱{Number(o.total).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Recent Audit + Recent Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/40">
          <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Recent Audit Events</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            {(stats?.recentAudit || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No audit events.</p>
            ) : (
              <div className="space-y-1.5">
                {stats!.recentAudit.map((a) => (
                  <div key={a.id} className="flex justify-between text-xs p-2 rounded bg-muted/20">
                    <div>
                      <span className="font-medium">{a.action}</span>
                      <span className="text-muted-foreground ml-2">{a.entity_type}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Recent System Payouts</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            {adminData.recentSystemEarnings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No payouts recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Period</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Type</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Amount</th>
                  </tr></thead>
                  <tbody>
                    {adminData.recentSystemEarnings.slice(0, 6).map((r, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="py-1.5 px-1 text-muted-foreground">{r.payout_period}</td>
                        <td className="py-1.5 px-1 font-medium">{r.bonus_type.replace(/_/g, " ")}</td>
                        <td className="py-1.5 px-1 text-right font-semibold">₱{Number(r.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BCOverview;
