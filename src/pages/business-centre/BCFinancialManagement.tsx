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
  ArrowDownRight, Lock, XCircle, Package } from "lucide-react";

const fmt = (n: number | string) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtToken = (n: number | string) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 4 });
const dt = (d: string) => new Date(d).toLocaleDateString();

// ── Dummy Data Generators ──
const DUMMY_WALLETS = [
  { id: "w1", profiles: { full_name: "Maria Santos", email: "maria@terra.ph" }, available_balance: 45250.50, pending_balance: 5000, total_withdrawn: 12000 },
  { id: "w2", profiles: { full_name: "Juan Dela Cruz", email: "juan@terra.ph" }, available_balance: 128750.00, pending_balance: 15000, total_withdrawn: 85000 },
  { id: "w3", profiles: { full_name: "Andrew Gwaltney", email: "gwaltn3y@gmail.com" }, available_balance: 350000.00, pending_balance: 0, total_withdrawn: 200000 },
  { id: "w4", profiles: { full_name: "Rosa Mendoza", email: "rosa@terra.ph" }, available_balance: 8500.75, pending_balance: 2500, total_withdrawn: 3000 },
  { id: "w5", profiles: { full_name: "Pedro Garcia", email: "pedro@terra.ph" }, available_balance: 67890.25, pending_balance: 10000, total_withdrawn: 45000 },
  { id: "w6", profiles: { full_name: "Ameer Saati", email: "ameer.saati@gmail.com" }, available_balance: 275000.00, pending_balance: 8000, total_withdrawn: 150000 },
  { id: "w7", profiles: { full_name: "Liza Reyes", email: "liza@terra.ph" }, available_balance: 23450.00, pending_balance: 0, total_withdrawn: 7500 },
  { id: "w8", profiles: { full_name: "Carlo Villanueva", email: "carlo@terra.ph" }, available_balance: 91200.80, pending_balance: 12000, total_withdrawn: 60000 },
];

const DUMMY_TRANSACTIONS = [
  { id: "t1", amount: 5000, balance_before: 40250.50, balance_after: 45250.50, description: "Binary Commission Payout", transaction_type: "commission", created_at: "2026-03-15T10:00:00Z", status: "completed" },
  { id: "t2", amount: -12000, balance_before: 57250.50, balance_after: 45250.50, description: "Withdrawal to GCash", transaction_type: "withdrawal", created_at: "2026-03-14T14:30:00Z", status: "completed" },
  { id: "t3", amount: 15000, balance_before: 113750, balance_after: 128750, description: "Direct Sales Bonus", transaction_type: "bonus", created_at: "2026-03-13T09:00:00Z", status: "completed" },
  { id: "t4", amount: 2500, balance_before: 6000.75, balance_after: 8500.75, description: "Matching Bonus Level 2", transaction_type: "commission", created_at: "2026-03-12T16:00:00Z", status: "completed" },
  { id: "t5", amount: -5000, balance_before: 72890.25, balance_after: 67890.25, description: "Coupon Purchase", transaction_type: "purchase", created_at: "2026-03-11T11:00:00Z", status: "completed" },
  { id: "t6", amount: 25000, balance_before: 250000, balance_after: 275000, description: "Membership Activation BV Credit", transaction_type: "activation", created_at: "2026-03-10T08:00:00Z", status: "completed" },
  { id: "t7", amount: 8500, balance_before: 14950, balance_after: 23450, description: "Product BV Commission", transaction_type: "commission", created_at: "2026-03-09T13:00:00Z", status: "completed" },
  { id: "t8", amount: -3000, balance_before: 94200.80, balance_after: 91200.80, description: "Withdrawal to Bank", transaction_type: "withdrawal", created_at: "2026-03-08T15:30:00Z", status: "completed" },
];

const DUMMY_ADJUSTMENTS = [
  { id: "a1", wallet_id: "w1-abcdef12", adjustment_type: "credit", asset_type: "php", amount: 5000, reason: "Manual correction for missed commission", requested_by: "admin-001", first_approved_by: "admin-002", final_approved_by: null, status: "first_approved", created_at: "2026-03-15T09:00:00Z" },
  { id: "a2", wallet_id: "w3-abcdef12", adjustment_type: "debit", asset_type: "php", amount: 2500, reason: "Duplicate payout reversal", requested_by: "admin-001", first_approved_by: "admin-002", final_approved_by: "admin-003", status: "applied", created_at: "2026-03-14T11:00:00Z" },
  { id: "a3", wallet_id: "w5-abcdef12", adjustment_type: "credit", asset_type: "token", amount: 150, reason: "Promotional token grant", requested_by: "admin-002", first_approved_by: null, final_approved_by: null, status: "pending", created_at: "2026-03-13T14:00:00Z" },
];

const DUMMY_REVERSALS = [
  { id: "r1", original_entry_id: "txn-12345678", reversal_entry_id: "rev-87654321", reason: "Customer dispute — refund granted", created_by: "admin-001abcd", created_at: "2026-03-14T16:00:00Z" },
  { id: "r2", original_entry_id: "txn-23456789", reversal_entry_id: "rev-98765432", reason: "Duplicate binary payout correction", created_by: "admin-002abcd", created_at: "2026-03-12T10:30:00Z" },
];

const DUMMY_WITHDRAWALS = [
  { id: "wd1", profiles: { full_name: "Juan Dela Cruz", email: "juan@terra.ph" }, method: "gcash", amount: 15000, fee: 150, net_amount: 14850, status: "pending", created_at: "2026-03-15T08:00:00Z" },
  { id: "wd2", profiles: { full_name: "Maria Santos", email: "maria@terra.ph" }, method: "bank_transfer", amount: 12000, fee: 200, net_amount: 11800, status: "approved", created_at: "2026-03-14T12:00:00Z" },
  { id: "wd3", profiles: { full_name: "Pedro Garcia", email: "pedro@terra.ph" }, method: "e-wallet", amount: 5000, fee: 50, net_amount: 4950, status: "paid", created_at: "2026-03-13T09:00:00Z" },
  { id: "wd4", profiles: { full_name: "Liza Reyes", email: "liza@terra.ph" }, method: "gcash", amount: 7500, fee: 75, net_amount: 7425, status: "closed", created_at: "2026-03-10T14:00:00Z" },
];

const DUMMY_BATCHES = [
  { id: "b1", batch_code: "WDB-2026-001", method: "gcash", item_count: 15, gross_amount: 125000, fee_amount: 1250, net_amount: 123750, status: "processing", created_at: "2026-03-15T06:00:00Z" },
  { id: "b2", batch_code: "WDB-2026-002", method: "bank_transfer", item_count: 8, gross_amount: 85000, fee_amount: 1700, net_amount: 83300, status: "completed", created_at: "2026-03-12T06:00:00Z" },
];

const DUMMY_TREASURY = [
  { id: "tr1", treasury_type: "DAO Reserve", asset_type: "php", current_balance: 2500000, name: "DAO Reserve Fund", code: "DAO-PHP", status: "active" },
  { id: "tr2", treasury_type: "Network Rewards", asset_type: "token", current_balance: 5000000, name: "Network Reward Pool", code: "NRW-TKN", status: "active" },
  { id: "tr3", treasury_type: "Farmer Rewards", asset_type: "php", current_balance: 750000, name: "Farmer Incentive Fund", code: "FRM-PHP", status: "active" },
  { id: "tr4", treasury_type: "Ecosystem Liquidity", asset_type: "token", current_balance: 12500000, name: "Ecosystem Liquidity Pool", code: "ECO-TKN", status: "active" },
  { id: "tr5", treasury_type: "Marketing", asset_type: "php", current_balance: 350000, name: "Marketing Budget", code: "MKT-PHP", status: "active" },
];

const DUMMY_MOVEMENTS = [
  { id: "tm1", treasury_account_id: "tr1-dao-rs", movement_type: "credit", asset_type: "php", amount: 150000, reason_code: "Weekly Terra Fee allocation", created_by: "admin-001a", created_at: "2026-03-15T04:00:00Z" },
  { id: "tm2", treasury_account_id: "tr2-nrw-tk", movement_type: "credit", asset_type: "token", amount: 50000, reason_code: "Token minting for rewards", created_by: "admin-001a", created_at: "2026-03-14T04:00:00Z" },
  { id: "tm3", treasury_account_id: "tr5-mkt-ph", movement_type: "debit", asset_type: "php", amount: 25000, reason_code: "Marketing campaign disbursement", created_by: "admin-002a", created_at: "2026-03-13T10:00:00Z" },
  { id: "tm4", treasury_account_id: "tr4-eco-tk", movement_type: "burn", asset_type: "token", amount: 100000, reason_code: "Quarterly burn event", created_by: "admin-001a", created_at: "2026-03-10T04:00:00Z" },
];

const DUMMY_RELEASES = [
  { id: "rr1", treasury_account_id: "tr1-dao-rs", requested_amount: 100000, asset_type: "php", purpose: "Emergency farmer relief fund", governance_mode: "multisig", status: "pending", requested_by: "admin-001a", created_at: "2026-03-15T10:00:00Z" },
  { id: "rr2", treasury_account_id: "tr2-nrw-tk", requested_amount: 25000, asset_type: "token", purpose: "Community airdrop campaign", governance_mode: "dao_vote", status: "approved", requested_by: "admin-002a", created_at: "2026-03-12T09:00:00Z" },
];

const DUMMY_BURNS = [
  { id: "bn1", source_type: "transaction_fee", treasury_account_id: "tr4-eco-tk", token_amount: 50000, tx_hash: "0xabc123def456789", notes: "Weekly automated burn", created_at: "2026-03-15T00:00:00Z" },
  { id: "bn2", source_type: "settlement_fee", treasury_account_id: "tr4-eco-tk", token_amount: 25000, tx_hash: "0xdef789abc123456", notes: "Settlement cycle burn", created_at: "2026-03-12T00:00:00Z" },
  { id: "bn3", source_type: "buyback", treasury_account_id: "tr4-eco-tk", token_amount: 100000, tx_hash: "0x123456789abcdef", notes: "Quarterly buyback & burn", created_at: "2026-03-01T00:00:00Z" },
];

const DUMMY_SETTLEMENTS = [
  { id: "s1", cycle_code: "SET-2026-W11", period_start: "2026-03-10T00:00:00Z", period_end: "2026-03-16T23:59:59Z", gross_settlement_php: 850000, logistics_settlement_php: 125000, merchant_settlement_php: 600000, treasury_allocation_php: 125000, status: "processing" },
  { id: "s2", cycle_code: "SET-2026-W10", period_start: "2026-03-03T00:00:00Z", period_end: "2026-03-09T23:59:59Z", gross_settlement_php: 720000, logistics_settlement_php: 100000, merchant_settlement_php: 510000, treasury_allocation_php: 110000, status: "completed" },
];

const BCFinancialManagement = () => {
  const { isAdmin, isAnyAdmin } = useUserRoles();
  const [activeTab, setActiveTab] = useState("wallets");
  const [search, setSearch] = useState("");

  // Real queries with dummy fallback
  const { data: realWallets = [] } = useQuery({
    queryKey: ["bc-fin-wallets"],
    queryFn: async () => {
      const { data } = await supabase.from("wallets").select("*, profiles!inner(full_name, email)").order("available_balance", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const wallets = realWallets.length > 0 ? realWallets : DUMMY_WALLETS;
  const transactions = DUMMY_TRANSACTIONS;
  const adjustmentRequests = DUMMY_ADJUSTMENTS;
  const ledgerReversals = DUMMY_REVERSALS;
  const withdrawals = DUMMY_WITHDRAWALS;
  const withdrawalBatches = DUMMY_BATCHES;
  const treasuryAccounts = DUMMY_TREASURY;
  const treasuryMovements = DUMMY_MOVEMENTS;
  const releaseRequests = DUMMY_RELEASES;
  const burnEvents = DUMMY_BURNS;
  const settlementCycles = DUMMY_SETTLEMENTS;

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const totalBalance = wallets.reduce((s: number, w: any) => s + Number(w.available_balance || 0), 0);
  const totalPending = wallets.reduce((s: number, w: any) => s + Number(w.pending_balance || 0), 0);
  const pendingWd = withdrawals.filter((w: any) => w.status === "pending");
  const pendingAdj = adjustmentRequests.filter((a: any) => a.status === "pending" || a.status === "first_approved");
  const treasuryCash = treasuryAccounts.filter((t: any) => t.asset_type === "php").reduce((s: number, t: any) => s + Number(t.current_balance), 0);
  const treasuryToken = treasuryAccounts.filter((t: any) => t.asset_type === "token").reduce((s: number, t: any) => s + Number(t.current_balance), 0);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "border-amber-500/30 text-amber-600 bg-amber-500/5",
      first_approved: "border-blue-500/30 text-blue-600 bg-blue-500/5",
      approved: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
      applied: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
      rejected: "border-destructive/30 text-destructive",
      paid: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
      closed: "border-muted text-muted-foreground",
      completed: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
      released: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
      draft: "border-muted text-muted-foreground",
      processing: "border-blue-500/30 text-blue-600 bg-blue-500/5",
      failed: "border-destructive/30 text-destructive",
      requested: "border-amber-500/30 text-amber-600",
      active: "border-emerald-500/30 text-emerald-600 bg-emerald-500/5",
    };
    return map[s] || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /> Financial Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Wallets, ledger, withdrawals, treasury, burns, and settlement control</p>
      </div>

      {/* Rules */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="font-medium mb-1 text-sm">Financial Rules:</p>
        <ul className="text-xs text-muted-foreground grid grid-cols-2 lg:grid-cols-4 gap-1 list-disc pl-4">
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
        ].map((k) => (
          <Card key={k.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <k.icon className={cn("h-5 w-5 mx-auto mb-1.5", k.accent)} />
              <p className={cn("text-lg font-bold font-display", k.accent)}>{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1.5 bg-muted/50">
          {[
            { value: "wallets", label: "💰 Wallets" },
            { value: "ledger", label: "📒 Ledger" },
            { value: "adjustments", label: "⚖️ Adjustments" },
            { value: "reversals", label: "🔄 Reversals" },
            { value: "withdrawals", label: "📤 Withdrawals" },
            { value: "batches", label: "📦 Batches" },
            { value: "treasury", label: "🏦 Treasury" },
            { value: "movements", label: "📊 Movements" },
            { value: "releases", label: "🔓 Releases" },
            { value: "burns", label: "🔥 Burns" },
            { value: "settlements", label: "💳 Settlements" },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm px-3 py-2 rounded-lg data-[state=active]:shadow-md">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ═══ Wallets ═══ */}
        <TabsContent value="wallets" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Wallet Directory</CardTitle>
                <div className="relative w-56"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" /></div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Owner</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Available</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Pending</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Withdrawn</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {wallets.filter((w: any) => !search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase())).map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell><p className="text-sm font-medium">{w.profiles?.full_name || "—"}</p><p className="text-xs text-muted-foreground">{w.profiles?.email}</p></TableCell>
                      <TableCell className="text-right text-sm font-bold text-emerald-600">{fmt(w.available_balance)}</TableCell>
                      <TableCell className="text-right text-sm text-amber-600">{fmt(w.pending_balance)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmt(w.total_withdrawn)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Ledger ═══ */}
        <TabsContent value="ledger" className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <strong className="text-foreground">Append-only ledger.</strong> Every balance change creates a new record with before/after snapshots. No destructive overwrites.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base">Ledger Explorer</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Type</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Before</TableHead>
                  <TableHead className="text-sm font-semibold text-right">After</TableHead>
                  <TableHead className="text-sm font-semibold">Description</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {transactions.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", Number(t.amount) >= 0 ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-destructive/30 text-destructive")}>{Number(t.amount) >= 0 ? "Credit" : "Debit"}</Badge></TableCell>
                      <TableCell className="text-right text-sm font-bold">{fmt(Math.abs(Number(t.amount)))}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmt(t.balance_before || 0)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmt(t.balance_after)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{t.description || t.transaction_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(t.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Adjustments ═══ */}
        <TabsContent value="adjustments" className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
            <strong>Dual Approval Required:</strong> Wallet adjustments need first approval → final approval before being applied.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Wallet Adjustment Requests</CardTitle>
                {isAdmin && <Button size="sm" className="gap-1"><Scale className="h-4 w-4" /> New Adjustment</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Wallet</TableHead>
                  <TableHead className="text-sm font-semibold">Type</TableHead>
                  <TableHead className="text-sm font-semibold">Asset</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-sm font-semibold">Reason</TableHead>
                  <TableHead className="text-sm font-semibold">1st Approver</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {adjustmentRequests.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm font-mono">{a.wallet_id?.slice(0, 12)}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs", a.adjustment_type === "credit" ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-destructive/30 text-destructive")}>{a.adjustment_type}</Badge></TableCell>
                      <TableCell className="text-sm uppercase font-medium">{a.asset_type}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{a.asset_type === "token" ? fmtToken(a.amount) : fmt(a.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{a.reason}</TableCell>
                      <TableCell className="text-sm font-mono">{a.first_approved_by?.slice(0, 12) || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusBadge(a.status))}>{a.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(a.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Reversals ═══ */}
        <TabsContent value="reversals" className="space-y-3">
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-destructive">
            <strong>Reversals only.</strong> Ledger entries cannot be modified or deleted. Corrections create offsetting reversal entries.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base">Ledger Reversals</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Original Entry</TableHead>
                  <TableHead className="text-sm font-semibold">Reversal Entry</TableHead>
                  <TableHead className="text-sm font-semibold">Reason</TableHead>
                  <TableHead className="text-sm font-semibold">Actor</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ledgerReversals.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm font-mono">{r.original_entry_id}</TableCell>
                      <TableCell className="text-sm font-mono">{r.reversal_entry_id || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                      <TableCell className="text-sm font-mono">{r.created_by?.slice(0, 12)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(r.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Withdrawals ═══ */}
        <TabsContent value="withdrawals" className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <strong className="text-foreground">Withdrawal flow:</strong> Requested → Approved → Paid → Closed
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base">Withdrawal Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Member</TableHead>
                  <TableHead className="text-sm font-semibold">Method</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Fee</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Net</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {withdrawals.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell><p className="text-sm font-medium">{w.profiles?.full_name}</p><p className="text-xs text-muted-foreground">{w.profiles?.email}</p></TableCell>
                      <TableCell className="text-sm capitalize">{w.method?.replace("_", " ")}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(w.amount)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmt(w.fee || 0)}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{fmt(w.net_amount || w.amount)}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusBadge(w.status))}>{w.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(w.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Batches ═══ */}
        <TabsContent value="batches" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Withdrawal Batches</CardTitle>
                {isAdmin && <Button size="sm" className="gap-1"><Package className="h-4 w-4" /> Create Batch</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Batch Code</TableHead>
                  <TableHead className="text-sm font-semibold">Method</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Items</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Gross</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Fee</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Net</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {withdrawalBatches.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-sm font-mono font-bold">{b.batch_code}</TableCell>
                      <TableCell className="text-sm capitalize">{b.method?.replace("_", " ")}</TableCell>
                      <TableCell className="text-right text-sm">{b.item_count}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(b.gross_amount)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmt(b.fee_amount)}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{fmt(b.net_amount)}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusBadge(b.status))}>{b.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Treasury ═══ */}
        <TabsContent value="treasury" className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <strong className="text-foreground">Treasury / DAO Reserve</strong> — Separate from user wallets. Governs ecosystem expansion, governance, buyback/burn.
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {treasuryAccounts.map((t: any) => (
              <Card key={t.id} className="border-border/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.treasury_type}</p>
                  <p className="text-lg font-bold font-display mt-1">{t.asset_type === "token" ? fmtToken(t.current_balance) : fmt(t.current_balance)}</p>
                  <p className="text-sm mt-0.5">{t.name}</p>
                  <Badge variant="outline" className={cn("text-xs mt-1.5 px-2", statusBadge(t.status))}>{t.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ═══ Movements ═══ */}
        <TabsContent value="movements" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Treasury Movements</CardTitle>
                {isAdmin && <Button size="sm" className="gap-1"><ArrowDownRight className="h-4 w-4" /> Record Movement</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Account</TableHead>
                  <TableHead className="text-sm font-semibold">Type</TableHead>
                  <TableHead className="text-sm font-semibold">Asset</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-sm font-semibold">Reason</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {treasuryMovements.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm font-mono">{m.treasury_account_id}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs", m.movement_type === "credit" ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : m.movement_type === "burn" ? "border-destructive/30 text-destructive" : "border-muted text-muted-foreground")}>{m.movement_type}</Badge></TableCell>
                      <TableCell className="text-sm uppercase font-medium">{m.asset_type}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{m.asset_type === "token" ? fmtToken(m.amount) : fmt(m.amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.reason_code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(m.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Releases ═══ */}
        <TabsContent value="releases" className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
            <strong>Governance-gated releases.</strong> Treasury releases require multisig or DAO voting approval.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Release Approval Queue</CardTitle>
                {isAdmin && <Button size="sm" className="gap-1"><Lock className="h-4 w-4" /> Request Release</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Treasury Acct</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-sm font-semibold">Purpose</TableHead>
                  <TableHead className="text-sm font-semibold">Governance</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {releaseRequests.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm font-mono">{r.treasury_account_id}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{r.asset_type === "token" ? fmtToken(r.requested_amount) : fmt(r.requested_amount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.purpose}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{r.governance_mode}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusBadge(r.status))}>{r.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(r.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Burns ═══ */}
        <TabsContent value="burns" className="space-y-3">
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-destructive">
            <strong>Token Burns:</strong> Sources include transaction fees, settlement fees, and optional buybacks.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Flame className="h-5 w-5 text-destructive" /> Burn Events</CardTitle>
                {isAdmin && <Button variant="destructive" size="sm" className="gap-1"><Flame className="h-4 w-4" /> Record Burn</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Source Type</TableHead>
                  <TableHead className="text-sm font-semibold">Treasury Acct</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Tokens Burned</TableHead>
                  <TableHead className="text-sm font-semibold">TX Hash</TableHead>
                  <TableHead className="text-sm font-semibold">Notes</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {burnEvents.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell><Badge variant="outline" className="text-xs border-destructive/30 text-destructive">{b.source_type}</Badge></TableCell>
                      <TableCell className="text-sm font-mono">{b.treasury_account_id}</TableCell>
                      <TableCell className="text-right text-sm font-bold text-destructive">{fmtToken(b.token_amount)}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground truncate max-w-[120px]">{b.tx_hash || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.notes || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(b.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Settlements ═══ */}
        <TabsContent value="settlements" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Settlement Control</CardTitle>
                {isAdmin && <Button size="sm" className="gap-1"><CreditCard className="h-4 w-4" /> New Cycle</Button>}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Cycle Code</TableHead>
                  <TableHead className="text-sm font-semibold">Period</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Gross</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Logistics</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Merchant</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Treasury</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {settlementCycles.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-mono font-bold">{s.cycle_code}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{dt(s.period_start)} – {dt(s.period_end)}</TableCell>
                      <TableCell className="text-right text-sm">{fmt(s.gross_settlement_php)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmt(s.logistics_settlement_php)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmt(s.merchant_settlement_php)}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{fmt(s.treasury_allocation_php)}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", statusBadge(s.status))}>{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCFinancialManagement;
