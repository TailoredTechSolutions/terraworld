import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Wallet, ArrowUpRight, DollarSign, Loader2, Search, Shield, Clock,
  CreditCard, CheckCircle2, FileText, Settings, Scale, Flame, Building2,
  ArrowDownRight, Lock, XCircle, Package
} from "lucide-react";

const fmt = (n: number | string) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtToken = (n: number | string) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 4 });
const dt = (d: string) => new Date(d).toLocaleDateString();

const BCFinancialManagement = () => {
  const { isAdmin, isAnyAdmin } = useUserRoles();
  const [activeTab, setActiveTab] = useState("wallets");
  const [search, setSearch] = useState("");

  // ─── Existing wallet/ledger queries ───
  const { data: wallets = [], isLoading: walletsLoading } = useQuery({
    queryKey: ["bc-fin-wallets"],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("*, profiles!inner(full_name, email)")
        .order("available_balance", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["bc-fin-transactions"],
    queryFn: async () => {
      const { data } = await supabase.from("wallet_transactions").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: withdrawals = [], isLoading: wdLoading } = useQuery({
    queryKey: ["bc-fin-withdrawals"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawal_requests")
        .select("*, profiles:user_id(full_name, email)")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  // ─── Phase 5 queries ───
  const { data: adjustmentRequests = [] } = useQuery({
    queryKey: ["bc-fin-adjustments"],
    queryFn: async () => {
      const { data } = await supabase.from("wallet_adjustment_requests").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: ledgerReversals = [] } = useQuery({
    queryKey: ["bc-fin-reversals"],
    queryFn: async () => {
      const { data } = await supabase.from("ledger_reversals").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: withdrawalBatches = [] } = useQuery({
    queryKey: ["bc-fin-batches"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawal_batches").select("*")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: treasuryAccounts = [] } = useQuery({
    queryKey: ["bc-fin-treasury"],
    queryFn: async () => {
      const { data } = await supabase.from("treasury_accounts").select("*")
        .order("code", { ascending: true });
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: treasuryMovements = [] } = useQuery({
    queryKey: ["bc-fin-treasury-movements"],
    queryFn: async () => {
      const { data } = await supabase.from("treasury_movements").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: releaseRequests = [] } = useQuery({
    queryKey: ["bc-fin-release-requests"],
    queryFn: async () => {
      const { data } = await supabase.from("treasury_release_requests").select("*")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: burnEvents = [] } = useQuery({
    queryKey: ["bc-fin-burns"],
    queryFn: async () => {
      const { data } = await supabase.from("burn_events").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: settlementCycles = [] } = useQuery({
    queryKey: ["bc-fin-settlements"],
    queryFn: async () => {
      const { data } = await supabase.from("settlement_cycles").select("*")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const totalBalance = wallets.reduce((s: number, w: any) => s + Number(w.available_balance || 0), 0);
  const totalPending = wallets.reduce((s: number, w: any) => s + Number(w.pending_balance || 0), 0);
  const pendingWd = withdrawals.filter((w: any) => w.status === "pending");
  const pendingAdj = adjustmentRequests.filter((a: any) => a.status === "pending" || a.status === "first_approved");
  const treasuryCash = treasuryAccounts.filter((t: any) => t.asset_type === "php").reduce((s: number, t: any) => s + Number(t.current_balance), 0);
  const treasuryToken = treasuryAccounts.filter((t: any) => t.asset_type === "token").reduce((s: number, t: any) => s + Number(t.current_balance), 0);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "border-amber-500/30 text-amber-600",
      first_approved: "border-blue-500/30 text-blue-600",
      approved: "border-emerald-500/30 text-emerald-600",
      applied: "border-emerald-500/30 text-emerald-600",
      rejected: "border-destructive/30 text-destructive",
      paid: "border-emerald-500/30 text-emerald-600",
      closed: "border-muted text-muted-foreground",
      completed: "border-emerald-500/30 text-emerald-600",
      released: "border-emerald-500/30 text-emerald-600",
      draft: "border-muted text-muted-foreground",
      processing: "border-blue-500/30 text-blue-600",
      failed: "border-destructive/30 text-destructive",
      requested: "border-amber-500/30 text-amber-600",
      active: "border-emerald-500/30 text-emerald-600",
    };
    return map[s] || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /> Financial Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Wallets, ledger, withdrawals, treasury, burns, and settlement control</p>
      </div>

      {/* Hard rules reminder */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs font-medium mb-1">Financial Rules:</p>
        <ul className="text-[10px] text-muted-foreground grid grid-cols-2 lg:grid-cols-4 gap-1 list-disc pl-4">
          <li>Append-only ledger — no hard deletes</li>
          <li>Wallet adjustments require dual approval</li>
          <li>Withdrawals: requested → approved → paid → closed</li>
          <li>Token flows separate from cash pool</li>
          <li>Treasury/DAO reserve tracked separately</li>
          <li>Burns: txn fees, settlement fees, buybacks</li>
          <li>Rollbacks only via reversal entries</li>
          <li>All money edits fully auditable</li>
        </ul>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Balance", value: fmt(totalBalance), icon: Wallet, accent: "text-primary" },
          { label: "Pending", value: fmt(totalPending), icon: Clock, accent: "text-amber-600" },
          { label: "Pending WD", value: String(pendingWd.length), icon: ArrowUpRight, accent: "text-destructive" },
          { label: "Pending Adj", value: String(pendingAdj.length), icon: Shield, accent: "text-purple-600" },
          { label: "Treasury ₱", value: fmt(treasuryCash), icon: Building2, accent: "text-emerald-600" },
          { label: "Treasury TKN", value: fmtToken(treasuryToken), icon: Package, accent: "text-blue-600" },
        ].map(k => (
          <Card key={k.label} className="border-border/40">
            <CardContent className="p-3 text-center">
              <k.icon className={cn("h-4 w-4 mx-auto mb-1", k.accent)} />
              <p className={cn("text-sm font-bold font-display", k.accent)}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11 h-9">
          <TabsTrigger value="wallets" className="text-[9px]">Wallets</TabsTrigger>
          <TabsTrigger value="ledger" className="text-[9px]">Ledger</TabsTrigger>
          <TabsTrigger value="adjustments" className="text-[9px]">Adjustments</TabsTrigger>
          <TabsTrigger value="reversals" className="text-[9px]">Reversals</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-[9px]">Withdrawals</TabsTrigger>
          <TabsTrigger value="batches" className="text-[9px]">Batches</TabsTrigger>
          <TabsTrigger value="treasury" className="text-[9px]">Treasury</TabsTrigger>
          <TabsTrigger value="movements" className="text-[9px]">Movements</TabsTrigger>
          <TabsTrigger value="releases" className="text-[9px]">Releases</TabsTrigger>
          <TabsTrigger value="burns" className="text-[9px]">Burns</TabsTrigger>
          <TabsTrigger value="settlements" className="text-[9px]">Settlements</TabsTrigger>
        </TabsList>

        {/* ═══ Wallets ═══ */}
        <TabsContent value="wallets" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Wallet Directory</CardTitle>
                <div className="relative w-48"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" /></div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {walletsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs text-right">Available</TableHead>
                    <TableHead className="text-xs text-right">Pending</TableHead>
                    <TableHead className="text-xs text-right">Withdrawn</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {wallets.filter((w: any) => !search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase())).map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell><p className="text-xs font-medium">{w.profiles?.full_name || "—"}</p><p className="text-[10px] text-muted-foreground">{w.profiles?.email}</p></TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(w.available_balance)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(w.pending_balance)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(w.total_withdrawn)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Ledger ═══ */}
        <TabsContent value="ledger" className="space-y-3">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <strong className="text-foreground">Append-only ledger.</strong> Every balance change creates a new record with before/after snapshots. No destructive overwrites. No hard deletes.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Ledger Explorer</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {txLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs text-right">Before</TableHead>
                    <TableHead className="text-xs text-right">After</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {transactions.slice(0, 50).map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", Number(t.amount) >= 0 ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive")}>{Number(t.amount) >= 0 ? "Credit" : "Debit"}</Badge></TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(Math.abs(Number(t.amount)))}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(t.balance_before || 0)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(t.balance_after)}</TableCell>
                        <TableCell className="text-xs truncate max-w-[120px] text-muted-foreground">{t.description || t.transaction_type}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(t.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Adjustment Requests (Dual Approval) ═══ */}
        <TabsContent value="adjustments" className="space-y-3">
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <strong>Dual Approval Required:</strong> Wallet adjustments need first approval → final approval before being applied. Same actor cannot approve both steps.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Wallet Adjustment Requests</CardTitle>
                {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><Scale className="h-3 w-3" /> New Adjustment</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {adjustmentRequests.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No adjustment requests.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Wallet</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Asset</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Requested By</TableHead>
                    <TableHead className="text-xs">1st Approver</TableHead>
                    <TableHead className="text-xs">Final Approver</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {adjustmentRequests.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-[10px] font-mono">{a.wallet_id?.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", a.adjustment_type === "credit" ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive")}>{a.adjustment_type}</Badge></TableCell>
                        <TableCell className="text-xs uppercase">{a.asset_type}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(a.amount)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[100px]">{a.reason}</TableCell>
                        <TableCell className="text-[10px] font-mono">{a.requested_by?.slice(0, 8)}</TableCell>
                        <TableCell className="text-[10px] font-mono">{a.first_approved_by?.slice(0, 8) || "—"}</TableCell>
                        <TableCell className="text-[10px] font-mono">{a.final_approved_by?.slice(0, 8) || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", statusBadge(a.status))}>{a.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(a.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Reversals ═══ */}
        <TabsContent value="reversals" className="space-y-3">
          <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive">
            <strong>Reversals only.</strong> Ledger entries cannot be modified or deleted. Corrections create offsetting reversal entries.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Ledger Reversals</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {ledgerReversals.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No reversals.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Original Entry</TableHead>
                    <TableHead className="text-xs">Reversal Entry</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Actor</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {ledgerReversals.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-[10px] font-mono">{r.original_entry_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-[10px] font-mono">{r.reversal_entry_id?.slice(0, 8) || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{r.reason}</TableCell>
                        <TableCell className="text-[10px] font-mono">{r.created_by?.slice(0, 8)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(r.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Withdrawals ═══ */}
        <TabsContent value="withdrawals" className="space-y-3">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <strong className="text-foreground">Withdrawal flow:</strong> Requested → Approved → Paid → Closed. Methods: bank transfer, e-wallet, token, mixed. KYC gate and minimum configurable.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Withdrawal Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {wdLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : withdrawals.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No withdrawal requests.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs text-right">Fee</TableHead>
                    <TableHead className="text-xs text-right">Net</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {withdrawals.map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell><p className="text-xs font-medium">{w.profiles?.full_name || "—"}</p><p className="text-[10px] text-muted-foreground">{w.profiles?.email}</p></TableCell>
                        <TableCell className="text-xs capitalize">{w.method || "e-wallet"}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(w.amount)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(w.fee || 0)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(w.net_amount || w.amount)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", statusBadge(w.status))}>{w.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(w.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Withdrawal Batches ═══ */}
        <TabsContent value="batches" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Withdrawal Batches</h3>
            {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><Package className="h-3 w-3" /> Create Batch</Button>}
          </div>
          <Card className="border-border/40">
            <CardContent className="px-5 pb-4 pt-4">
              {withdrawalBatches.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No withdrawal batches.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Batch Code</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs text-right">Items</TableHead>
                    <TableHead className="text-xs text-right">Gross</TableHead>
                    <TableHead className="text-xs text-right">Fee</TableHead>
                    <TableHead className="text-xs text-right">Net</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {withdrawalBatches.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-xs font-mono font-medium">{b.batch_code}</TableCell>
                        <TableCell className="text-xs capitalize">{b.method}</TableCell>
                        <TableCell className="text-right text-xs">{b.item_count}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(b.gross_amount)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(b.fee_amount)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(b.net_amount)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", statusBadge(b.status))}>{b.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(b.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Treasury Dashboard ═══ */}
        <TabsContent value="treasury" className="space-y-3">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <strong className="text-foreground">Treasury / DAO Reserve</strong> — tracked separately from user wallets. Governs ecosystem expansion, governance, emergencies, buyback/burn. Releases via multisig/DAO approval.
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {treasuryAccounts.map((t: any) => (
              <Card key={t.id} className="border-border/40">
                <CardContent className="p-3">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{t.treasury_type}</p>
                  <p className="text-sm font-bold font-display mt-1">{t.asset_type === "token" ? fmtToken(t.current_balance) : fmt(t.current_balance)}</p>
                  <p className="text-xs mt-0.5">{t.name}</p>
                  <Badge variant="outline" className={cn("text-[8px] mt-1", statusBadge(t.status))}>{t.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          {treasuryAccounts.length === 0 && (
            <Card className="border-border/40"><CardContent className="p-8 text-center text-xs text-muted-foreground">Treasury accounts will appear after the seed migration runs.</CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ Treasury Movements ═══ */}
        <TabsContent value="movements" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Treasury Movements</CardTitle>
                {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><ArrowDownRight className="h-3 w-3" /> Record Movement</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {treasuryMovements.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No treasury movements.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Account</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Asset</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Actor</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {treasuryMovements.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-[10px] font-mono">{m.treasury_account_id?.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", m.movement_type === "credit" ? "border-emerald-500/30 text-emerald-600" : m.movement_type === "burn" ? "border-destructive/30 text-destructive" : "border-muted text-muted-foreground")}>{m.movement_type}</Badge></TableCell>
                        <TableCell className="text-xs uppercase">{m.asset_type}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{m.asset_type === "token" ? fmtToken(m.amount) : fmt(m.amount)}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{m.reason_code}</TableCell>
                        <TableCell className="text-[10px] font-mono">{m.created_by?.slice(0, 8) || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(m.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Treasury Release Requests ═══ */}
        <TabsContent value="releases" className="space-y-3">
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <strong>Governance-gated releases.</strong> Treasury releases require multisig or DAO voting approval before funds are released.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Release Approval Queue</CardTitle>
                {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><Lock className="h-3 w-3" /> Request Release</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {releaseRequests.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No release requests.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Treasury Acct</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Asset</TableHead>
                    <TableHead className="text-xs">Purpose</TableHead>
                    <TableHead className="text-xs">Governance</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Requested By</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {releaseRequests.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-[10px] font-mono">{r.treasury_account_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{r.asset_type === "token" ? fmtToken(r.requested_amount) : fmt(r.requested_amount)}</TableCell>
                        <TableCell className="text-xs uppercase">{r.asset_type}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[120px]">{r.purpose}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">{r.governance_mode}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", statusBadge(r.status))}>{r.status}</Badge></TableCell>
                        <TableCell className="text-[10px] font-mono">{r.requested_by?.slice(0, 8) || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(r.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Burn Events ═══ */}
        <TabsContent value="burns" className="space-y-3">
          <div className="p-2 rounded-lg bg-destructive/5 border border-destructive/20 text-xs text-destructive">
            <strong>Token Burns:</strong> Sources include transaction fees, settlement fees, and optional buybacks. Every burn is logged immutably with tx hash when on-chain.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Burn Events</CardTitle>
                {isAdmin && <Button variant="destructive" size="sm" className="h-7 text-xs gap-1"><Flame className="h-3 w-3" /> Record Burn</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {burnEvents.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No burn events recorded.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Source Type</TableHead>
                    <TableHead className="text-xs">Treasury Acct</TableHead>
                    <TableHead className="text-xs text-right">Tokens Burned</TableHead>
                    <TableHead className="text-xs">TX Hash</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {burnEvents.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell><Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">{b.source_type}</Badge></TableCell>
                        <TableCell className="text-[10px] font-mono">{b.treasury_account_id?.slice(0, 8) || "—"}</TableCell>
                        <TableCell className="text-right text-xs font-bold text-destructive">{fmtToken(b.token_amount)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">{b.tx_hash || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[100px]">{b.notes || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(b.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Settlement Cycles ═══ */}
        <TabsContent value="settlements" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Settlement Control</CardTitle>
                {isAdmin && <Button size="sm" className="h-7 text-xs gap-1"><CreditCard className="h-3 w-3" /> New Cycle</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {settlementCycles.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No settlement cycles.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Cycle Code</TableHead>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs text-right">Gross</TableHead>
                    <TableHead className="text-xs text-right">Logistics</TableHead>
                    <TableHead className="text-xs text-right">Merchant</TableHead>
                    <TableHead className="text-xs text-right">Treasury</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {settlementCycles.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-mono font-medium">{s.cycle_code}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{dt(s.period_start)} – {dt(s.period_end)}</TableCell>
                        <TableCell className="text-right text-xs">{fmt(s.gross_settlement_php)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(s.logistics_settlement_php)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{fmt(s.merchant_settlement_php)}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{fmt(s.treasury_allocation_php)}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", statusBadge(s.status))}>{s.status}</Badge></TableCell>
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

export default BCFinancialManagement;
