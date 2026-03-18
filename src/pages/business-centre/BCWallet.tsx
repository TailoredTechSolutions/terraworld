import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Wallet, Ticket, Clock, ArrowUpRight, Coins, Users, DollarSign, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BCWallet = () => {
  const { data, adminData, effectiveUserId } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;
  const fmt = (n: number) => `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  // Transaction history
  const [transactions, setTransactions] = useState<Array<{ transaction_type: string; amount: number; description: string | null; created_at: string; balance_after: number }>>([]);

  useEffect(() => {
    if (!effectiveUserId) return;
    const fetchTx = async () => {
      const query = supabase
        .from("wallet_transactions")
        .select("transaction_type, amount, description, created_at, balance_after")
        .order("created_at", { ascending: false })
        .limit(15);
      if (!isAdmin) query.eq("user_id", effectiveUserId);
      const { data: rows } = await query;
      setTransactions(rows || []);
    };
    fetchTx();
  }, [effectiveUserId, isAdmin]);

  const cards = isAdmin
    ? [
        { label: "Total Wallet Balances", value: fmt(adminData.totalWalletBalance), icon: Wallet, accent: "text-emerald-600 bg-emerald-500/10" },
        { label: "Total Members", value: adminData.totalMembers.toLocaleString(), icon: Users, accent: "text-primary bg-primary/10" },
        { label: "Pending Withdrawals", value: adminData.pendingWithdrawals.toString(), icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
        { label: "Pending Amount", value: fmt(adminData.pendingWithdrawalAmount), icon: ArrowUpRight, accent: "text-destructive bg-destructive/10" },
      ]
    : [
        { label: "Cash Balance", value: fmt(data.walletData?.available_balance || 0), icon: Wallet, accent: "text-emerald-600 bg-emerald-500/10" },
        { label: "Internal Wallet", value: fmt(data.walletData?.internal_balance || 0), icon: Ticket, accent: "text-primary bg-primary/10" },
        { label: "Pending", value: fmt(data.walletData?.pending_balance || 0), icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
        { label: "Total Withdrawn", value: fmt(data.walletData?.total_withdrawn || 0), icon: ArrowUpRight, accent: "text-blue-600 bg-blue-500/10" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "System-wide wallet overview and balances" : "Your balances and payment methods"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((w) => (
          <Card key={w.label} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", w.accent)}>
                <w.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold font-display">{w.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{w.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transaction History */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm">
              {isAdmin ? "Recent System Transactions" : "Recent Transactions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Date</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Type</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs hidden sm:table-cell">Description</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs">Amount</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs hidden md:table-cell">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {tx.transaction_type.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-xs text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{tx.description || "—"}</td>
                        <td className={cn("py-2 px-2 text-right text-xs font-semibold", Number(tx.amount) >= 0 ? "text-emerald-600" : "text-destructive")}>
                          {Number(tx.amount) >= 0 ? "+" : ""}{fmt(Number(tx.amount))}
                        </td>
                        <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden md:table-cell">{fmt(Number(tx.balance_after))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <CardTitle className="text-sm">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-3">
              <div className="p-3 rounded-lg border border-border/40 space-y-1">
                <span className="font-medium text-xs">Bank Transfer</span>
                <p className="text-[10px] text-muted-foreground">Configure your bank details for withdrawals</p>
              </div>
              <div className="p-3 rounded-lg border border-border/40 space-y-1">
                <span className="font-medium text-xs">GCash</span>
                <p className="text-[10px] text-muted-foreground">Configure your GCash for faster payouts</p>
              </div>
              <div className="flex justify-between text-xs p-2.5 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Minimum Withdrawal</span>
                <span className="font-medium">₱500</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="px-5 pt-4 pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Coins className="h-3.5 w-3.5 text-accent" /> AGRI Token Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-accent/5 text-center">
                  <p className="text-xl font-bold text-accent">{data.tokenBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Token Balance</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-xl font-bold">₱10.00</p>
                  <p className="text-[10px] text-muted-foreground">Current Market Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BCWallet;
