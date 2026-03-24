import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import KPICard from "../KPICard";
import { GitBranch, DollarSign, Users, TrendingUp, Lock, Play, Download } from "lucide-react";

const MOCK_COMMISSION_RUNS = [
  { id: "1", period: "Feb 24-28, 2026", status: "completed", matched_bv: 125000, total_commissions: 12500, members: 48, fail_safe: false, date: "2026-03-01" },
  { id: "2", period: "Mar 1-3, 2026", status: "draft", matched_bv: 0, total_commissions: 0, members: 0, fail_safe: false, date: "2026-03-03" },
];

const MOCK_COMMISSIONS = [
  { id: "1", member: "Andrew G.", matched_bv: 5000, commission: 500, cap_applied: 0, carryover_l: 200, carryover_r: 0, rank: "Pro" },
  { id: "2", member: "Esteban R.", matched_bv: 3500, commission: 350, cap_applied: 0, carryover_l: 0, carryover_r: 150, rank: "Basic" },
  { id: "3", member: "Rune E.", matched_bv: 2000, commission: 200, cap_applied: 0, carryover_l: 500, carryover_r: 0, rank: "Starter" },
  { id: "4", member: "Maria S.", matched_bv: 1500, commission: 150, cap_applied: 0, carryover_l: 0, carryover_r: 300, rank: "Starter" },
];

const MOCK_WITHDRAWALS = [
  { id: "1", member: "Andrew G.", amount: 2500, method: "GCash", status: "approved", requested: "2026-03-01", ref: "WD-A1B2C3D4" },
  { id: "2", member: "Esteban R.", amount: 1200, method: "Bank", status: "pending", requested: "2026-03-02", ref: "WD-E5F6G7H8" },
  { id: "3", member: "Maria S.", amount: 800, method: "GCash", status: "paid", requested: "2026-02-28", ref: "WD-I9J0K1L2" },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const MLMCommissionsSection = ({ openDrawer }: Props) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon={GitBranch} title="Network Size" value="248" change="+12 this month" changeType="up" />
        <KPICard icon={DollarSign} title="Total Commissions (30d)" value="₱38.4K" change="+18.2%" changeType="up" />
        <KPICard icon={Users} title="Active Members" value="142" change="57% of network" changeType="neutral" />
        <KPICard icon={TrendingUp} title="Avg Commission" value="₱271" change="Per qualifying member" changeType="neutral" />
      </div>

      <Tabs defaultValue="runs">
        <TabsList className="h-8">
          <TabsTrigger value="runs" className="text-xs h-7">Commission Runs</TabsTrigger>
          <TabsTrigger value="results" className="text-xs h-7">Latest Results</TabsTrigger>
          <TabsTrigger value="genealogy" className="text-xs h-7">Genealogy</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs h-7">Withdrawals</TabsTrigger>
          <TabsTrigger value="wallet" className="text-xs h-7">Wallet & Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-3 space-y-3">
          <DataTable
            columns={[
              { key: "period", label: "Period" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "matched_bv", label: "Matched BV", render: (r) => r.matched_bv.toLocaleString() },
              { key: "total_commissions", label: "Commissions", render: (r) => `₱${r.total_commissions.toLocaleString()}` },
              { key: "members", label: "Members" },
              { key: "fail_safe", label: "Fail-safe", render: (r) => r.fail_safe ? <Badge variant="destructive" className="text-[10px]">Triggered</Badge> : "No" },
              { key: "date", label: "Date" },
            ]}
            data={MOCK_COMMISSION_RUNS}
          />
          <div className="flex gap-2">
            <Button size="sm" className="text-xs gap-1"><Play className="h-3 w-3" /> Create Run</Button>
            <Button variant="outline" size="sm" className="text-xs gap-1"><Lock className="h-3 w-3" /> Lock & Execute</Button>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Binary Math Reference</p>
            <p>Matched Volume = min(Left BV, Right BV) · Commission = Matched × 10% · Carryover = Remainder on stronger leg</p>
            <p className="mt-1">500 BV increments · Cycle Value: ₱50 per 500 BV · Fail-safe: 75% threshold on Membership BV pool (33% of Terra Fees)</p>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-3">
          <DataTable
            columns={[
              { key: "member", label: "Member" },
              { key: "rank", label: "Rank", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.rank}</Badge> },
              { key: "matched_bv", label: "Matched BV", render: (r) => r.matched_bv.toLocaleString() },
              { key: "commission", label: "Commission", render: (r) => `₱${r.commission.toLocaleString()}` },
              { key: "cap_applied", label: "Cap", render: (r) => r.cap_applied > 0 ? `₱${r.cap_applied}` : "—" },
              { key: "carryover_l", label: "Carry L", render: (r) => r.carryover_l > 0 ? r.carryover_l : "—" },
              { key: "carryover_r", label: "Carry R", render: (r) => r.carryover_r > 0 ? r.carryover_r : "—" },
            ]}
            data={MOCK_COMMISSIONS}
          />
        </TabsContent>

        <TabsContent value="genealogy" className="mt-3">
          <div className="p-8 text-center border border-dashed border-border/50 rounded-lg">
            <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Binary tree genealogy viewer</p>
            <p className="text-xs text-muted-foreground mt-1">Interactive tree with volume counters and carryover display</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs">Open Genealogy Viewer</Button>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-3">
          <DataTable
            columns={[
              { key: "ref", label: "Reference" },
              { key: "member", label: "Member" },
              { key: "amount", label: "Amount", render: (r) => `₱${r.amount.toLocaleString()}` },
              { key: "method", label: "Method" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "requested", label: "Requested" },
            ]}
            data={MOCK_WITHDRAWALS}
          />
        </TabsContent>

        <TabsContent value="wallet" className="mt-3">
          <div className="p-4 rounded-lg border border-border/50 bg-card/60 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-sm mb-2">Append-Only Ledger</p>
            <p>Every balance change creates a new ledger record with a reference. Corrections happen via reversal entries only. Dual approval required for manual adjustments above configurable thresholds.</p>
            <p className="mt-2">Wallet types: Commission / Cash / Token / Pending</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLMCommissionsSection;
