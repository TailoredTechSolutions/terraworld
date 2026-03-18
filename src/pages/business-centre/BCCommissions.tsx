import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  DollarSign, Shield, Loader2, Play, RotateCcw, AlertTriangle,
  ArrowLeftRight, TrendingUp, Scale, FileText, CreditCard,
  Clock, Package, Crown, CheckCircle2, XCircle, Download
} from "lucide-react";

const fmt = (n: number | string) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtBv = (n: number | string) => Number(n).toLocaleString();
const pct = (n: number | string) => `${Number(n)}%`;
const dt = (d: string) => new Date(d).toLocaleDateString();

const BCCommissions = () => {
  const { isAnyAdmin, isAdmin } = useUserRoles();
  const [activeTab, setActiveTab] = useState("runs");

  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ["bc-commission-runs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("commission_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const latestRun = runs[0];

  const { data: commissionLines = [] } = useQuery({
    queryKey: ["bc-commission-lines", latestRun?.id],
    queryFn: async () => {
      if (!latestRun) return [];
      const { data } = await supabase
        .from("commission_lines")
        .select("*")
        .eq("run_id", latestRun.id)
        .order("binary_total_paid", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin && !!latestRun,
  });

  const { data: directLines = [] } = useQuery({
    queryKey: ["bc-direct-bonus-lines", latestRun?.id],
    queryFn: async () => {
      if (!latestRun) return [];
      const { data } = await supabase
        .from("direct_bonus_lines")
        .select("*")
        .eq("run_id", latestRun.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin && !!latestRun,
  });

  const { data: matchingLines = [] } = useQuery({
    queryKey: ["bc-matching-lines", latestRun?.id],
    queryFn: async () => {
      if (!latestRun) return [];
      const { data } = await supabase
        .from("matching_lines")
        .select("*")
        .eq("run_id", latestRun.id)
        .order("matching_paid", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin && !!latestRun,
  });

  const { data: carryForward = [] } = useQuery({
    queryKey: ["bc-carry-forward", latestRun?.id],
    queryFn: async () => {
      if (!latestRun) return [];
      const { data } = await supabase
        .from("carry_forward_ledger")
        .select("*")
        .eq("run_id", latestRun.id)
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin && !!latestRun,
  });

  const { data: expiryEvents = [] } = useQuery({
    queryKey: ["bc-bv-expiry"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bv_expiry_events")
        .select("*")
        .order("expired_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: statements = [] } = useQuery({
    queryKey: ["bc-commission-statements", latestRun?.id],
    queryFn: async () => {
      if (!latestRun) return [];
      const { data } = await supabase
        .from("commission_statements")
        .select("*")
        .eq("run_id", latestRun.id)
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin && !!latestRun,
  });

  const { data: payoutPostings = [] } = useQuery({
    queryKey: ["bc-payout-postings", latestRun?.id],
    queryFn: async () => {
      if (!latestRun) return [];
      const { data } = await supabase
        .from("payout_postings")
        .select("*")
        .eq("run_id", latestRun.id)
        .order("amount", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin && !!latestRun,
  });

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const directProduct = directLines.filter((d: any) => d.source_type === "product");
  const directMembership = directLines.filter((d: any) => d.source_type === "membership");

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "border-emerald-500/30 text-emerald-600";
      case "processing": return "border-blue-500/30 text-blue-600";
      case "draft": return "border-muted text-muted-foreground";
      case "reversed": return "border-destructive/30 text-destructive";
      case "failed": return "border-destructive/30 text-destructive";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" /> Commission Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Full payout cycle: Direct → Binary → Fail-Safe → Caps → Matching → Carry-Forward</p>
      </div>

      {/* Execution order reminder */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs font-medium mb-1.5">Required Payout Order:</p>
        <ol className="text-[10px] text-muted-foreground grid grid-cols-2 lg:grid-cols-4 gap-1 list-decimal pl-4">
          <li>Calculate Terra Fee + Pool (33%)</li>
          <li>Direct Product Bonuses</li>
          <li>Direct Membership Bonuses</li>
          <li>Binary BV Matching (1:1 lesser leg × 10%)</li>
          <li>Fail-Safe on Membership BV only (75%)</li>
          <li>Apply Binary Caps (Starter→Elite)</li>
          <li>Matching Bonuses (on actual paid)</li>
          <li>Record Carry-Forward + Expiry</li>
        </ol>
      </div>

      {/* KPIs from latest run */}
      {latestRun && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Terra Fee", value: fmt(latestRun.total_terra_fee), accent: "text-primary" },
            { label: "Pool (33%)", value: fmt(latestRun.compensation_pool), accent: "text-emerald-600" },
            { label: "Binary (after caps)", value: fmt(latestRun.binary_after_caps_total), accent: "text-blue-600" },
            { label: "Matching", value: fmt(latestRun.matching_total), accent: "text-purple-600" },
            { label: "Fail-Safe", value: latestRun.fail_safe_triggered ? "TRIGGERED" : "OK", accent: latestRun.fail_safe_triggered ? "text-amber-600" : "text-emerald-600" },
          ].map(k => (
            <Card key={k.label} className="border-border/40">
              <CardContent className="p-3 text-center">
                <p className={cn("text-sm font-bold font-display", k.accent)}>{k.value}</p>
                <p className="text-[9px] text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-9">
          <TabsTrigger value="runs" className="text-[9px]">Runs</TabsTrigger>
          <TabsTrigger value="direct-product" className="text-[9px]">Dir Product</TabsTrigger>
          <TabsTrigger value="direct-membership" className="text-[9px]">Dir Memb</TabsTrigger>
          <TabsTrigger value="binary" className="text-[9px]">Binary</TabsTrigger>
          <TabsTrigger value="failsafe" className="text-[9px]">Fail-Safe</TabsTrigger>
          <TabsTrigger value="matching" className="text-[9px]">Matching</TabsTrigger>
          <TabsTrigger value="carry" className="text-[9px]">Carry Fwd</TabsTrigger>
          <TabsTrigger value="expiry" className="text-[9px]">Expiry</TabsTrigger>
          <TabsTrigger value="statements" className="text-[9px]">Statements</TabsTrigger>
          <TabsTrigger value="postings" className="text-[9px]">Postings</TabsTrigger>
        </TabsList>

        {/* ═══ Commission Runs ═══ */}
        <TabsContent value="runs" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Commission Run Console</h3>
            {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><Play className="h-3 w-3" /> New Run</Button>}
          </div>
          {runsLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : runs.length === 0 ? (
            <Card className="border-border/40"><CardContent className="p-8 text-center text-xs text-muted-foreground">No commission runs yet. Execute the first cycle when orders with Terra Fees exist.</CardContent></Card>
          ) : (
            <Card className="border-border/40">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Run Code</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs text-right">Terra Fee</TableHead>
                    <TableHead className="text-xs text-right">Pool</TableHead>
                    <TableHead className="text-xs text-right">Dir Prod</TableHead>
                    <TableHead className="text-xs text-right">Dir Memb</TableHead>
                    <TableHead className="text-xs text-right">Binary (caps)</TableHead>
                    <TableHead className="text-xs text-right">Matching</TableHead>
                    <TableHead className="text-xs">Fail-Safe</TableHead>
                    <TableHead className="text-xs">Cycle Val</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {runs.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-[10px]">{r.run_code}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(r.period_start)} – {dt(r.period_end)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(r.total_terra_fee)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(r.compensation_pool)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(r.direct_product_bonus_total)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(r.direct_membership_bonus_total)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(r.binary_after_caps_total)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(r.matching_total)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[9px]", r.fail_safe_triggered ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600")}>
                            {r.fail_safe_triggered ? "Triggered" : "OK"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{fmt(r.adjusted_cycle_value)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", statusColor(r.status))}>{r.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ═══ Direct Product Bonuses ═══ */}
        <TabsContent value="direct-product" className="space-y-3">
          <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
            <strong>Formula:</strong> Product Bonus = Terra Fee × Package Rate. Free 15% · Starter 18% · Basic 20% · Pro 22% · Elite 25%. Free members earn this bonus.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Direct Product Bonus Lines</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {directProduct.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No direct product bonuses in this run.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs text-right">Terra Fee (Base)</TableHead>
                    <TableHead className="text-xs text-right">Rate</TableHead>
                    <TableHead className="text-xs text-right">Bonus Paid</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {directProduct.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-[10px] font-mono">{d.user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(d.base_amount)}</TableCell>
                        <TableCell className="text-right text-xs">{pct(d.rate)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(d.bonus_paid)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(d.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Direct Membership Bonuses ═══ */}
        <TabsContent value="direct-membership" className="space-y-3">
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <strong>Formula:</strong> Membership Bonus = Package Price × Package Rate. Starter 4% · Basic 6% · Pro 8% · Elite 10%. Free members do NOT earn membership bonuses.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Direct Membership Bonus Lines</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {directMembership.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No direct membership bonuses in this run.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs text-right">Pkg Price (Base)</TableHead>
                    <TableHead className="text-xs text-right">Rate</TableHead>
                    <TableHead className="text-xs text-right">Bonus Paid</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {directMembership.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-[10px] font-mono">{d.user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(d.base_amount)}</TableCell>
                        <TableCell className="text-right text-xs">{pct(d.rate)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(d.bonus_paid)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(d.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Binary Lines ═══ */}
        <TabsContent value="binary" className="space-y-3">
          <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400">
            <strong>Binary:</strong> 1:1 pairing. Commission = lesser leg BV × 10%. Product BV and Membership BV matched separately. Caps: Starter ₱5k · Basic ₱15k · Pro ₱50k · Elite ₱250k. Caps apply to binary only (not matching/direct).
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Binary Commission Lines</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {commissionLines.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No binary lines in this run.</p> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead className="text-xs">Member</TableHead>
                      <TableHead className="text-xs text-right">L Prod</TableHead>
                      <TableHead className="text-xs text-right">R Prod</TableHead>
                      <TableHead className="text-xs text-right">L Memb</TableHead>
                      <TableHead className="text-xs text-right">R Memb</TableHead>
                      <TableHead className="text-xs text-right">Match Prod</TableHead>
                      <TableHead className="text-xs text-right">Match Memb</TableHead>
                      <TableHead className="text-xs text-right">Bin Prod ₱</TableHead>
                      <TableHead className="text-xs text-right">Bin Memb ₱</TableHead>
                      <TableHead className="text-xs text-right">Before Cap</TableHead>
                      <TableHead className="text-xs text-right">Cap</TableHead>
                      <TableHead className="text-xs text-right">Cap Applied</TableHead>
                      <TableHead className="text-xs text-right font-bold">Paid</TableHead>
                      <TableHead className="text-xs">Qualified</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {commissionLines.map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-[10px] font-mono">{c.user_id?.slice(0, 8)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.left_product_bv)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.right_product_bv)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.left_membership_bv)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.right_membership_bv)}</TableCell>
                          <TableCell className="text-right text-[10px] font-medium">{fmtBv(c.matched_product_bv)}</TableCell>
                          <TableCell className="text-right text-[10px] font-medium">{fmtBv(c.matched_membership_bv)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmt(c.binary_product_paid)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmt(c.binary_membership_paid)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmt(c.binary_total_before_cap)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmt(c.binary_cap_limit)}</TableCell>
                          <TableCell className="text-right text-[10px] text-amber-600">{fmt(c.binary_cap_applied)}</TableCell>
                          <TableCell className="text-right text-xs font-bold">{fmt(c.binary_total_paid)}</TableCell>
                          <TableCell>{c.qualification_passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Fail-Safe Control ═══ */}
        <TabsContent value="failsafe" className="space-y-3">
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <strong>Fail-Safe:</strong> Membership BV payouts ≤ 75% of compensation pool. If ratio &gt; 75%, adjusted_cycle_value = base × (0.75 / actual_ratio). Does NOT affect product BV binary, direct bonuses, matching, or token rewards.
          </div>
          {latestRun ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border/40">
                <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-amber-500" /> Fail-Safe Status</CardTitle></CardHeader>
                <CardContent className="px-5 pb-4 space-y-3">
                  {[
                    { label: "Compensation Pool", value: fmt(latestRun.compensation_pool) },
                    { label: "Membership Binary Required", value: fmt(latestRun.membership_binary_required) },
                    { label: "Payout Ratio", value: `${(Number(latestRun.membership_payout_ratio) * 100).toFixed(2)}%` },
                    { label: "Threshold", value: "75%" },
                    { label: "Base Cycle Value", value: fmt(latestRun.base_cycle_value) },
                    { label: "Adjusted Cycle Value", value: fmt(latestRun.adjusted_cycle_value) },
                    { label: "Triggered", value: latestRun.fail_safe_triggered ? "YES" : "NO" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-xs p-2 rounded-lg bg-muted/20">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-bold">{r.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">QA Scenarios</CardTitle></CardHeader>
                <CardContent className="px-5 pb-4 space-y-2">
                  {[
                    { scenario: "Pool ₱1M, Required ₱700K", ratio: "70%", result: "Full pay — no adjustment", ok: true },
                    { scenario: "Pool ₱1M, Required ₱900K", ratio: "90%", result: "Adjust to ₱750K (cycle ₱41.67)", ok: false },
                    { scenario: "Pool ₱1M, Required ₱1.5M", ratio: "150%", result: "Adjust to ₱750K (cycle ₱25.00)", ok: false },
                  ].map(q => (
                    <div key={q.scenario} className="p-2 rounded-lg border border-border/40 text-[10px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{q.scenario}</span>
                        {q.ok ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      </div>
                      <p className="text-muted-foreground">Ratio: {q.ratio} → {q.result}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-border/40"><CardContent className="p-8 text-center text-xs text-muted-foreground">Run a commission cycle to see fail-safe metrics.</CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ Matching Bonuses ═══ */}
        <TabsContent value="matching" className="space-y-3">
          <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-400">
            <strong>Matching:</strong> Computed on actual binary paid (after fail-safe + caps). Starter: L1 10%. Basic: L1 10% + L2 5%. Pro: L1-L3. Elite: L1-L5. Gate: upline rank ≥ downline rank. Matching is NOT capped.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Matching Bonus Lines</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {matchingLines.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No matching bonuses in this run.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Upline</TableHead>
                    <TableHead className="text-xs">Downline</TableHead>
                    <TableHead className="text-xs text-right">Level</TableHead>
                    <TableHead className="text-xs text-right">DL Binary Paid</TableHead>
                    <TableHead className="text-xs text-right">Rate</TableHead>
                    <TableHead className="text-xs text-right font-bold">Matching Paid</TableHead>
                    <TableHead className="text-xs">Qualified</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {matchingLines.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-[10px] font-mono">{m.user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-[10px] font-mono">{m.downline_user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-right text-xs">L{m.level_no}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(m.downline_binary_paid)}</TableCell>
                        <TableCell className="text-right text-xs">{pct(m.matching_rate)}</TableCell>
                        <TableCell className="text-right text-xs font-bold">{fmt(m.matching_paid)}</TableCell>
                        <TableCell>{m.qualification_passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-destructive/50" />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Carry Forward ═══ */}
        <TabsContent value="carry" className="space-y-3">
          <div className="p-2 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
            <strong>Carry-Forward:</strong> Unmatched BV carries forward indefinitely. Tracked separately: left/right × product/membership. Underlying volume entries expire at 90 days FIFO.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Carry Forward Ledger</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {carryForward.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No carry-forward entries.</p> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead className="text-xs">Member</TableHead>
                      <TableHead className="text-xs text-right">L Prod Before</TableHead>
                      <TableHead className="text-xs text-right">R Prod Before</TableHead>
                      <TableHead className="text-xs text-right">L Memb Before</TableHead>
                      <TableHead className="text-xs text-right">R Memb Before</TableHead>
                      <TableHead className="text-xs text-right">Matched Prod</TableHead>
                      <TableHead className="text-xs text-right">Matched Memb</TableHead>
                      <TableHead className="text-xs text-right">L Prod After</TableHead>
                      <TableHead className="text-xs text-right">R Prod After</TableHead>
                      <TableHead className="text-xs text-right">L Memb After</TableHead>
                      <TableHead className="text-xs text-right">R Memb After</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {carryForward.map((c: any) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-[10px] font-mono">{c.user_id?.slice(0, 8)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.left_product_bv_before)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.right_product_bv_before)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.left_membership_bv_before)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.right_membership_bv_before)}</TableCell>
                          <TableCell className="text-right text-[10px] font-medium">{fmtBv(c.matched_product_bv)}</TableCell>
                          <TableCell className="text-right text-[10px] font-medium">{fmtBv(c.matched_membership_bv)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.left_product_bv_after)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.right_product_bv_after)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.left_membership_bv_after)}</TableCell>
                          <TableCell className="text-right text-[10px]">{fmtBv(c.right_membership_bv_after)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ BV Expiry ═══ */}
        <TabsContent value="expiry" className="space-y-3">
          <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive">
            <strong>Expiry:</strong> Volume entries older than 90 days expire via FIFO. Every expiry is logged. Carry-forward BV retains units but underlying volume entries are removed.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-destructive" /> BV Expiry Events</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {expiryEvents.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No BV expiry events.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">BV Type</TableHead>
                    <TableHead className="text-xs">Leg</TableHead>
                    <TableHead className="text-xs text-right">Expired BV</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {expiryEvents.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-[10px] font-mono">{e.user_id?.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", e.bv_type === "product" ? "border-emerald-500/30 text-emerald-600" : "border-blue-500/30 text-blue-600")}>{e.bv_type}</Badge></TableCell>
                        <TableCell className="text-xs uppercase">{e.leg_side}</TableCell>
                        <TableCell className="text-right text-xs font-medium text-destructive">{fmtBv(e.expired_bv)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[120px]">{e.reason || "90-day FIFO"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(e.expired_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Statements ═══ */}
        <TabsContent value="statements" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Commission Statements</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /> Export</Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {statements.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No statements generated yet.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs">Statement</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {statements.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-[10px] font-mono">{s.user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(s.statement_period_start)} – {dt(s.statement_period_end)}</TableCell>
                        <TableCell className="text-[10px] font-mono truncate max-w-[200px]">{JSON.stringify(s.statement_data).slice(0, 80)}…</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(s.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Payout Postings ═══ */}
        <TabsContent value="postings" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Payout Postings</h3>
            {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><CreditCard className="h-3 w-3" /> Post to Wallets</Button>}
          </div>
          <Card className="border-border/40">
            <CardContent className="px-5 pb-4 pt-4">
              {payoutPostings.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No payout postings yet.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Posted</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {payoutPostings.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-[10px] font-mono">{p.user_id?.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">{p.posting_type}</Badge></TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(p.amount)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", p.posting_status === "posted" ? "border-emerald-500/30 text-emerald-600" : "border-amber-500/30 text-amber-600")}>{p.posting_status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{p.posted_at ? dt(p.posted_at) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCCommissions;
