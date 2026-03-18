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
  Wallet, ArrowUpRight, DollarSign, Loader2, Search,
  Shield, Clock, CreditCard, CheckCircle2, FileText, Settings
} from "lucide-react";

const BCFinancialManagement = () => {
  const { isAdmin, isAnyAdmin } = useUserRoles();
  const [search, setSearch] = useState("");

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

  const { data: approvals = [] } = useQuery({
    queryKey: ["bc-fin-approvals"],
    queryFn: async () => {
      const { data } = await supabase.from("approval_requests").select("*")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: payoutRecords = [] } = useQuery({
    queryKey: ["bc-fin-payouts"],
    queryFn: async () => {
      const { data } = await supabase.from("payout_records").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: paymentTx = [] } = useQuery({
    queryKey: ["bc-fin-payment-tx"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_transactions").select("*")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: reconciliations = [] } = useQuery({
    queryKey: ["bc-fin-reconciliation"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_reconciliation").select("*")
        .order("reconciled_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: platformSettings = [] } = useQuery({
    queryKey: ["bc-fin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const totalBalance = wallets.reduce((s, w) => s + Number(w.available_balance || 0), 0);
  const totalPending = wallets.reduce((s, w) => s + Number(w.pending_balance || 0), 0);
  const pendingWd = withdrawals.filter(w => w.status === "pending");
  const pendingApprovals = approvals.filter(a => a.status === "pending");

  const getSetting = (key: string) => platformSettings.find((s: any) => s.setting_key === key);
  const feePercent = getSetting("terra_fee_percent");
  const taxPercent = getSetting("tax_rate_percent");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" /> Financial Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Wallets, transactions, reconciliation, payouts, fees, and tax config</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: "Total Balance", value: `₱${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Pending Balance", value: `₱${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Pending Withdrawals", value: pendingWd.length.toString(), icon: ArrowUpRight, accent: "text-destructive bg-destructive/10" },
          { title: "Pending Approvals", value: pendingApprovals.length.toString(), icon: Shield, accent: "text-purple-600 bg-purple-500/10" },
          { title: "Payment Txns", value: paymentTx.length.toString(), icon: CreditCard, accent: "text-primary bg-primary/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-3">
              <div className={cn("p-1.5 rounded-lg w-fit mb-1", s.accent)}><s.icon className="h-3.5 w-3.5" /></div>
              <p className="text-lg font-bold font-display">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="wallets">
        <TabsList className="grid w-full grid-cols-7 h-9">
          <TabsTrigger value="wallets" className="text-[10px]">Wallets</TabsTrigger>
          <TabsTrigger value="ledger" className="text-[10px]">Ledger</TabsTrigger>
          <TabsTrigger value="payments" className="text-[10px]">Payments</TabsTrigger>
          <TabsTrigger value="reconciliation" className="text-[10px]">Reconciliation</TabsTrigger>
          <TabsTrigger value="payouts" className="text-[10px]">Payouts</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-[10px]">Withdrawals</TabsTrigger>
          <TabsTrigger value="config" className="text-[10px]">Fee & Tax</TabsTrigger>
        </TabsList>

        {/* Wallets */}
        <TabsContent value="wallets" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Wallet Accounts</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
                </div>
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
                    {wallets.filter(w => !search || (w as any).profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || (w as any).profiles?.email?.toLowerCase().includes(search.toLowerCase())).map(w => {
                      const p = (w as any).profiles;
                      return (
                        <TableRow key={w.id}>
                          <TableCell><p className="text-xs font-medium">{p?.full_name || "—"}</p><p className="text-[10px] text-muted-foreground">{p?.email}</p></TableCell>
                          <TableCell className="text-right text-xs font-medium">₱{Number(w.available_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">₱{Number(w.pending_balance).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">₱{Number(w.total_withdrawn).toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledger */}
        <TabsContent value="ledger" className="mt-4">
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
                    {transactions.slice(0, 50).map(t => (
                      <TableRow key={t.id}>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", Number(t.amount) >= 0 ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive")}>{Number(t.amount) >= 0 ? "Credit" : "Debit"}</Badge></TableCell>
                        <TableCell className="text-right text-xs font-medium">₱{Math.abs(Number(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">₱{Number(t.balance_before || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(t.balance_after).toLocaleString()}</TableCell>
                        <TableCell className="text-xs truncate max-w-[120px] text-muted-foreground">{t.description || t.transaction_type}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Transactions */}
        <TabsContent value="payments" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Payment Transactions</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {paymentTx.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No payment transactions recorded.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Provider</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Currency</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {paymentTx.map((pt: any) => (
                      <TableRow key={pt.id}>
                        <TableCell className="text-xs font-medium uppercase">{pt.provider}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">{pt.provider_reference || "—"}</TableCell>
                        <TableCell className="text-right text-xs font-semibold">₱{Number(pt.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{pt.currency}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", pt.status === "completed" ? "border-emerald-500/30 text-emerald-600" : pt.status === "pending" ? "border-amber-500/30 text-amber-600" : "")}>{pt.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(pt.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation */}
        <TabsContent value="reconciliation" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Payment Reconciliation</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {reconciliations.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No reconciliations yet.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Transaction</TableHead>
                    <TableHead className="text-xs text-right">Reconciled</TableHead>
                    <TableHead className="text-xs text-right">Variance</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Notes</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {reconciliations.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-[10px] font-mono">{r.payment_transaction_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(r.reconciled_amount).toLocaleString()}</TableCell>
                        <TableCell className={cn("text-right text-xs", Number(r.variance_amount) !== 0 ? "text-destructive" : "text-emerald-600")}>₱{Number(r.variance_amount).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", r.reconciliation_status === "reconciled" ? "border-emerald-500/30 text-emerald-600" : "border-amber-500/30 text-amber-600")}>{r.reconciliation_status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">{r.notes || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{r.reconciled_at ? new Date(r.reconciled_at).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Tracking */}
        <TabsContent value="payouts" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Payout Tracking</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {payoutRecords.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No payout records.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Recipient Type</TableHead>
                    <TableHead className="text-xs">Source</TableHead>
                    <TableHead className="text-xs text-right">Gross</TableHead>
                    <TableHead className="text-xs text-right">Fee</TableHead>
                    <TableHead className="text-xs text-right">Net</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Ref</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {payoutRecords.map((pr: any) => (
                      <TableRow key={pr.id}>
                        <TableCell className="text-xs capitalize">{pr.recipient_type}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{pr.source_type}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(pr.gross_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">₱{Number(pr.fee_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-medium">₱{Number(pr.net_amount).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", pr.status === "paid" ? "border-emerald-500/30 text-emerald-600" : "border-amber-500/30 text-amber-600")}>{pr.status}</Badge></TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{pr.payment_reference || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals */}
        <TabsContent value="withdrawals" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Withdrawal Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {wdLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Method</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs text-right">Fee</TableHead>
                    <TableHead className="text-xs text-right">Net</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {withdrawals.map(w => {
                      const p = (w as any).profiles;
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="font-mono text-[10px]">{w.reference_code}</TableCell>
                          <TableCell className="text-xs">{p?.full_name || "—"}</TableCell>
                          <TableCell className="text-xs uppercase">{w.method}</TableCell>
                          <TableCell className="text-right text-xs">₱{Number(w.amount).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">₱{Number(w.fee).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs font-medium">₱{Number(w.net_amount).toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline" className={cn("text-[10px]", w.status === "pending" ? "border-amber-500/30 text-amber-600" : w.status === "paid" ? "border-emerald-500/30 text-emerald-600" : "")}>{w.status}</Badge></TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee & Tax Config */}
        <TabsContent value="config" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Platform Fee Config</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                <div className="flex justify-between text-xs p-2.5 rounded-lg bg-muted/20">
                  <span className="text-muted-foreground">Terra Fee %</span>
                  <span className="font-medium">{feePercent ? JSON.stringify(feePercent.setting_value) : "20"}%</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-400">
                  <strong>Rule:</strong> Only the Terra Fee is commissionable. ₱1 Terra Fee = 1 BV. Farmer price + delivery never generate BV.
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Tax Config</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                <div className="flex justify-between text-xs p-2.5 rounded-lg bg-muted/20">
                  <span className="text-muted-foreground">VAT Rate</span>
                  <span className="font-medium">{taxPercent ? JSON.stringify(taxPercent.setting_value) : "12"}%</span>
                </div>
                <div className="flex justify-between text-xs p-2.5 rounded-lg bg-muted/20">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium">Percent (applied to subtotal + fee)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCFinancialManagement;
