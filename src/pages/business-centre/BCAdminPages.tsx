import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BarChart3, CreditCard, Scale, Settings, Lock, FileText } from "lucide-react";

// ── Member Search ──
export const BCMemberSearch = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Member Search</h1>
      <p className="text-sm text-muted-foreground mt-1">Search and inspect any member in the system</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or referral code..." className="pl-9 h-9 text-sm" />
        </div>
        <p className="text-xs text-muted-foreground">Search all platform members, inspect volumes, activation state, and payout history.</p>
      </CardContent>
    </Card>
  </div>
);

// ── Commission Runs ──
export const BCCommissionRuns = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Commission Runs</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage and execute commission cycles</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Last Run", value: "Mar 15, 2026" },
            { label: "Total Distributed", value: "₱284,500" },
            { label: "Members Paid", value: "142" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
              <p className="text-sm font-bold font-display">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <Button size="sm" className="w-full h-9 text-sm">Run New Commission Cycle</Button>
      </CardContent>
    </Card>
  </div>
);

// ── Payout Oversight ──
export const BCPayoutOversight = () => {
  const { adminPendingWithdrawals, adminPendingAmount } = useBusinessCentre();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Payout Oversight</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and process pending payouts</p>
      </div>
      <Card className="border-border/40">
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending Withdrawals", value: adminPendingWithdrawals.toString() },
              { label: "Total Pending Amount", value: `₱${adminPendingAmount.toLocaleString()}` },
              { label: "Status", value: adminPendingWithdrawals > 0 ? "Action Needed" : "All Clear" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
                <p className="text-sm font-bold font-display">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ── Compliance ──
export const BCCompliance = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Compliance</h1>
      <p className="text-sm text-muted-foreground mt-1">Fraud detection and compliance monitoring</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">No anomalies detected in the current period. All fail-safe ratios within safe ranges.</p>
      </CardContent>
    </Card>
  </div>
);

// ── System Settings ──
export const BCSystemSettings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">System Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Configure Business Centre parameters</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5 space-y-2">
        {[
          { label: "Binary Match Rate", value: "10%" },
          { label: "Fail-safe Threshold", value: "75%" },
          { label: "BV Expiry", value: "90 days" },
          { label: "Compensation Pool %", value: "33% of Terra Fees" },
        ].map((s) => (
          <div key={s.label} className="flex justify-between text-xs p-2.5 rounded bg-muted/30">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium">{s.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// ── Security & Roles ──
export const BCSecurity = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Security & Roles</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage user roles and access controls</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">Manage user roles, manual placement overrides, and dual-approval wallet adjustments from this panel.</p>
      </CardContent>
    </Card>
  </div>
);

// ── Audit Logs ──
export const BCAuditLogs = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Audit Logs</h1>
      <p className="text-sm text-muted-foreground mt-1">Full system activity trail</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">Full audit trail visibility for all system actions, wallet adjustments, and compliance events.</p>
      </CardContent>
    </Card>
  </div>
);
