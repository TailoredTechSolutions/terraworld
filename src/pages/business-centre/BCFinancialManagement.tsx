import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Wallet, ArrowUpRight, ArrowDownRight, DollarSign, FileText,
  Loader2, Search, CheckCircle2, XCircle, Clock, CreditCard, Shield
} from "lucide-react";

const BCFinancialManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || !isAdmin) return;
    const fetch = async () => {
      setLoading(true);
      const [wRes, tRes, wrRes, aRes] = await Promise.all([
        supabase.from("wallets").select("*, profiles!inner(full_name, email)").order("available_balance", { ascending: false }).limit(50),
        supabase.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("withdrawal_requests").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false }).limit(50),
        supabase.from("approval_requests").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setWallets(wRes.data || []);
      setTransactions(tRes.data || []);
      setWithdrawals(wrRes.data || []);
      setApprovals(aRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [user, isAdmin]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalBalance = wallets.reduce((s, w) => s + Number(w.available_balance || 0), 0);
  const totalPending = wallets.reduce((s, w) => s + Number(w.pending_balance || 0), 0);
  const pendingWd = withdrawals.filter(w => w.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Financial Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Wallets, ledger, withdrawals, and approval workflows</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Wallet Balance", value: `₱${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Pending Balance", value: `₱${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Pending Withdrawals", value: pendingWd.length.toString(), icon: ArrowUpRight, accent: "text-destructive bg-destructive/10" },
          { title: "Pending Approvals", value: approvals.filter(a => a.status === "pending").length.toString(), icon: Shield, accent: "text-purple-600 bg-purple-500/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold font-display">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="wallets">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="wallets" className="text-xs">Wallets</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs">Ledger</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs">Withdrawals</TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs">Approvals</TabsTrigger>
        </TabsList>

        {/* Wallets Tab */}
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
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Owner</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Available</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Pending</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Internal</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Withdrawn</th>
                  </tr></thead>
                  <tbody>
                    {wallets.filter(w => {
                      if (!search) return true;
                      const p = (w as any).profiles;
                      return p?.full_name?.toLowerCase().includes(search.toLowerCase()) || p?.email?.toLowerCase().includes(search.toLowerCase());
                    }).map((w) => {
                      const p = (w as any).profiles;
                      return (
                        <tr key={w.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1">
                            <p className="font-medium">{p?.full_name || "—"}</p>
                            <p className="text-[10px] text-muted-foreground">{p?.email}</p>
                          </td>
                          <td className="py-1.5 px-1 text-right font-medium">₱{Number(w.available_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(w.pending_balance).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(w.internal_balance).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(w.total_withdrawn).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Ledger Explorer</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Type</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Amount</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Before</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">After</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Description</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="py-1.5 px-1">
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0", Number(t.amount) >= 0 ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive")}>
                            {Number(t.amount) >= 0 ? "Credit" : "Debit"}
                          </Badge>
                        </td>
                        <td className="py-1.5 px-1 text-right font-medium">₱{Math.abs(Number(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(t.balance_before || 0).toLocaleString()}</td>
                        <td className="py-1.5 px-1 text-right">₱{Number(t.balance_after).toLocaleString()}</td>
                        <td className="py-1.5 px-1 truncate max-w-[150px] text-muted-foreground">{t.description || t.transaction_type}</td>
                        <td className="py-1.5 px-1 text-muted-foreground text-[10px]">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Withdrawal Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Reference</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Member</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Method</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Amount</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Fee</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Net</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                  </tr></thead>
                  <tbody>
                    {withdrawals.map((w) => {
                      const p = (w as any).profiles;
                      return (
                        <tr key={w.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-mono text-[10px]">{w.reference_code}</td>
                          <td className="py-1.5 px-1">{p?.full_name || "—"}</td>
                          <td className="py-1.5 px-1 uppercase">{w.method}</td>
                          <td className="py-1.5 px-1 text-right">₱{Number(w.amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(w.fee).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right font-medium">₱{Number(w.net_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              w.status === "pending" ? "border-amber-500/30 text-amber-600" :
                              w.status === "approved" ? "border-blue-500/30 text-blue-600" :
                              w.status === "paid" ? "border-emerald-500/30 text-emerald-600" : ""
                            )}>{w.status}</Badge>
                          </td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Dual-Approval Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {approvals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No pending approval requests.</p>
              ) : (
                <div className="space-y-2">
                  {approvals.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
                      <div>
                        <p className="text-xs font-medium">{a.module} — {a.entity_type}</p>
                        <p className="text-[10px] text-muted-foreground">{a.reason || "No reason provided"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                          a.status === "pending" ? "border-amber-500/30 text-amber-600" :
                          a.status === "approved" ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive"
                        )}>{a.status}</Badge>
                        {a.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-emerald-600">Approve</Button>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-destructive">Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCFinancialManagement;
