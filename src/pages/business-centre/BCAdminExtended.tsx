import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, Crown, Wallet, GitBranch, FileText, Shield, Globe } from "lucide-react";

// ── Reports ──
export const BCReports = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Reports</h1>
      <p className="text-sm text-muted-foreground mt-1">Platform analytics and performance reports</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Sales Report", desc: "Revenue, orders, and growth metrics" },
        { label: "Volume Report", desc: "BV distribution across the network" },
        { label: "Member Report", desc: "Registration, activation, and retention" },
        { label: "Payout Report", desc: "Commission and withdrawal summaries" },
      ].map((r) => (
        <Card key={r.label} className="border-border/40">
          <CardContent className="p-4">
            <BarChart3 className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-sm font-semibold">{r.label}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{r.desc}</p>
            <Button variant="outline" size="sm" className="mt-3 h-7 text-xs">Generate</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ── Package Manager ──
export const BCPackageManager = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Package Manager</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage membership packages and pricing</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5 space-y-2">
        {[
          { tier: "Starter", price: "₱1,500", bv: "1,200 BV" },
          { tier: "Basic", price: "₱5,000", bv: "4,000 BV" },
          { tier: "Pro", price: "₱15,000", bv: "12,000 BV" },
          { tier: "Elite", price: "₱50,000", bv: "40,000 BV" },
        ].map((p) => (
          <div key={p.tier} className="flex justify-between items-center text-xs p-2.5 rounded bg-muted/30">
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{p.tier}</span>
            </div>
            <div className="flex gap-4">
              <span>{p.price}</span>
              <span className="text-muted-foreground">{p.bv}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// ── Rank Manager ──
export const BCRankManager = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Rank Manager</h1>
      <p className="text-sm text-muted-foreground mt-1">Configure rank requirements and benefits</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">Manage rank tiers, qualification criteria, binary match percentages, and daily caps from this panel.</p>
      </CardContent>
    </Card>
  </div>
);

// ── Wallet Controls (Super Admin) ──
export const BCWalletControls = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Wallet Controls</h1>
      <p className="text-sm text-muted-foreground mt-1">Manual wallet adjustments and overrides</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">Dual-approval wallet adjustments, credit/debit overrides, and balance reconciliation tools.</p>
      </CardContent>
    </Card>
  </div>
);

// ── Manual Placement (Super Admin) ──
export const BCManualPlacement = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Manual Placement</h1>
      <p className="text-sm text-muted-foreground mt-1">Override binary tree placement for members</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground">Manual placement overrides, structural corrections, and placement lock controls.</p>
      </CardContent>
    </Card>
  </div>
);

// ── Global Config (Super Admin) ──
export const BCGlobalConfig = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Global Config</h1>
      <p className="text-sm text-muted-foreground mt-1">Platform-wide configuration settings</p>
    </div>
    <Card className="border-border/40">
      <CardContent className="p-5 space-y-2">
        {[
          { label: "Platform Fee", value: "30%" },
          { label: "Tax Rate", value: "12%" },
          { label: "Token Price", value: "₱1.00" },
          { label: "Min Withdrawal", value: "₱500" },
          { label: "Max Daily Withdrawal", value: "₱50,000" },
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
