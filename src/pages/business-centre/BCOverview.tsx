import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DollarSign, GitBranch, Wallet, Coins, Crown, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, Shield, Loader2, Users, AlertTriangle
} from "lucide-react";

const BCOverview = () => {
  const { data, loading, adminTotalMembers, adminPendingWithdrawals } = useBusinessCentre();

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const tier = data.membership?.tier || "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const carryForward = Math.abs(data.binaryStats.left_bv - data.binaryStats.right_bv);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.isAnyAdmin ? "System-wide performance snapshot" : "Your business performance at a glance"}
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
                {data.isAnyAdmin ? "System Overview" : "Welcome back, Partner!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tierLabel} Package • Binary {data.binaryStats.matched_bv > 0 ? "Active" : "Inactive"}
              </p>
            </div>
            <Badge className="hidden sm:flex bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {tier !== "free" ? "Qualified" : "Free Tier"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Earnings", value: `₱${data.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: "All time", up: true, icon: DollarSign, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Binary BV (L / R)", value: `${data.binaryStats.left_bv.toLocaleString()} / ${data.binaryStats.right_bv.toLocaleString()}`, change: `${carryForward.toLocaleString()} carry-forward`, up: true, icon: GitBranch, accent: "text-purple-600 bg-purple-500/10" },
          { title: "Wallet Balance", value: `₱${(data.walletData?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: `₱${(data.walletData?.pending_balance || 0).toLocaleString()} pending`, up: true, icon: Wallet, accent: "text-blue-600 bg-blue-500/10" },
          { title: "AGRI Tokens", value: data.tokenBalance.toLocaleString(), change: "Non-cash reward", up: true, icon: Coins, accent: "text-accent bg-accent/10" },
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
      {data.isAnyAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold font-display">{adminTotalMembers.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total Members</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
              <p className="text-xl font-bold font-display">{adminPendingWithdrawals}</p>
              <p className="text-[10px] text-muted-foreground">Pending Withdrawals</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <Shield className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-xl font-bold font-display">Healthy</p>
              <p className="text-[10px] text-muted-foreground">System Status</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Qualification Status */}
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

      {/* Recent Earnings */}
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm">Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {data.recentEarnings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No earnings recorded yet.</p>
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
                  {data.recentEarnings.slice(0, 10).map((row, i) => (
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
