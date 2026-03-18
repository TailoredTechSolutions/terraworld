import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DollarSign, GitBranch, Wallet, Coins, Crown, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, Shield, Loader2, Users, AlertTriangle,
  Ticket, TrendingUp, Activity
} from "lucide-react";

const BCOverview = () => {
  const { data, loading, adminData } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const tier = data.membership?.tier || "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  // Admin sees system-wide data; member sees personal
  const displayEarnings = isAdmin ? adminData.systemTotalEarnings : data.totalEarnings;
  const displayLeftBv = isAdmin ? adminData.systemLeftBv : data.binaryStats.left_bv;
  const displayRightBv = isAdmin ? adminData.systemRightBv : data.binaryStats.right_bv;
  const displayMatchedBv = isAdmin ? adminData.systemMatchedBv : data.binaryStats.matched_bv;
  const displayWallet = isAdmin ? adminData.totalWalletBalance : (data.walletData?.available_balance || 0);
  const displayPending = isAdmin ? adminData.pendingWithdrawalAmount : (data.walletData?.pending_balance || 0);
  const displayTokens = isAdmin ? adminData.totalTokensIssued : data.tokenBalance;
  const displayRecentEarnings = isAdmin ? adminData.recentSystemEarnings : data.recentEarnings;
  const carryForward = Math.abs(displayLeftBv - displayRightBv);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "System-wide performance snapshot" : "Your business performance at a glance"}
        </p>
      </div>

      {/* Welcome Banner */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold font-display">
                {isAdmin ? "System Overview" : "Welcome back, Partner!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? `${adminData.totalMembers} members • ${adminData.activeMembers} active`
                  : `${tierLabel} Package • Binary ${data.binaryStats.matched_bv > 0 ? "Active" : "Inactive"}`}
              </p>
            </div>
            <Badge className="hidden sm:flex bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isAdmin ? "Admin" : tier !== "free" ? "Qualified" : "Free Tier"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: isAdmin ? "System Earnings" : "Total Earnings",
            value: `₱${displayEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            change: isAdmin ? "All members combined" : "All time",
            up: true, icon: DollarSign, accent: "text-emerald-600 bg-emerald-500/10",
          },
          {
            title: isAdmin ? "System BV (L / R)" : "Binary BV (L / R)",
            value: `${displayLeftBv.toLocaleString()} / ${displayRightBv.toLocaleString()}`,
            change: `${carryForward.toLocaleString()} ${isAdmin ? "net difference" : "carry-forward"}`,
            up: true, icon: GitBranch, accent: "text-purple-600 bg-purple-500/10",
          },
          {
            title: isAdmin ? "Total Wallet Balance" : "Wallet Balance",
            value: `₱${displayWallet.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            change: `₱${displayPending.toLocaleString()} pending`,
            up: true, icon: Wallet, accent: "text-blue-600 bg-blue-500/10",
          },
          {
            title: isAdmin ? "Total Tokens Issued" : "AGRI Tokens",
            value: displayTokens.toLocaleString(),
            change: isAdmin ? "Platform-wide" : "Non-cash reward",
            up: true, icon: Coins, accent: "text-accent bg-accent/10",
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-1.5 rounded-lg", stat.accent)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  {stat.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold font-display leading-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin extra KPIs */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Users, value: adminData.totalMembers.toLocaleString(), label: "Total Members", accent: "text-primary" },
            { icon: Activity, value: adminData.activeMembers.toLocaleString(), label: "Active Members", accent: "text-emerald-500" },
            { icon: AlertTriangle, value: adminData.pendingWithdrawals.toString(), label: "Pending Withdrawals", accent: "text-amber-500" },
            { icon: Ticket, value: `₱${adminData.totalCouponSales.toLocaleString()}`, label: "Coupon Sales", accent: "text-blue-500" },
            { icon: TrendingUp, value: adminData.systemMatchedBv.toLocaleString(), label: "System Matched BV", accent: "text-purple-500" },
            { icon: Coins, value: adminData.activeCoupons.toString(), label: "Active Coupons", accent: "text-accent" },
            { icon: DollarSign, value: `₱${adminData.pendingWithdrawalAmount.toLocaleString()}`, label: "Pending Amount", accent: "text-destructive" },
            { icon: Shield, value: "Healthy", label: "System Status", accent: "text-emerald-500" },
          ].map((m) => (
            <Card key={m.label} className="border-border/40">
              <CardContent className="p-4 text-center">
                <m.icon className={cn("h-5 w-5 mx-auto mb-2", m.accent)} />
                <p className="text-lg font-bold font-display">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Qualification Status (member only) */}
      {!isAdmin && (
        <Card className="border-border/40">
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Qualification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { label: "Paid Member", met: tier !== "free", detail: tier !== "free" ? `${tierLabel} Package Active` : "No package" },
                { label: "Left Leg BV", met: data.binaryStats.left_bv > 0, detail: `${data.binaryStats.left_bv.toLocaleString()} BV` },
                { label: "Right Leg BV", met: data.binaryStats.right_bv > 0, detail: `${data.binaryStats.right_bv.toLocaleString()} BV` },
                { label: "Matched BV", met: data.binaryStats.matched_bv > 0, detail: `${data.binaryStats.matched_bv.toLocaleString()} BV matched` },
              ].map((q) => (
                <div key={q.label} className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border",
                  q.met ? "border-emerald-500/20 bg-emerald-500/5" : "border-destructive/20 bg-destructive/5"
                )}>
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
      )}

      {/* Recent Earnings */}
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm">
            {isAdmin ? "Recent System Payouts" : "Recent Earnings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {displayRecentEarnings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {isAdmin ? "No system payouts recorded yet." : "No earnings recorded yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-medium text-xs">Period</th>
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-medium text-xs">Type</th>
                    <th className="text-right py-2.5 px-2 text-muted-foreground font-medium text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecentEarnings.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.payout_period}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full",
                            row.bonus_type === "direct_product" ? "bg-emerald-500" :
                            row.bonus_type === "binary" ? "bg-blue-500" :
                            row.bonus_type === "matching" ? "bg-purple-500" : "bg-amber-500"
                          )} />
                          <span className="text-xs font-medium">{row.bonus_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-xs">₱{Number(row.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
};

export default BCOverview;
