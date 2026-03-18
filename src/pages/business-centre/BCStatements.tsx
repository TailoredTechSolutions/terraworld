import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, DollarSign, TrendingUp, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LedgerRow {
  transaction_type: string;
  amount: number;
  description: string | null;
  created_at: string;
  balance_after: number;
}

const BCStatements = () => {
  const { data, adminData, effectiveUserId } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;

  const [ledger, setLedger] = useState<LedgerRow[]>([]);

  useEffect(() => {
    if (!effectiveUserId) return;
    const fetch = async () => {
      const query = supabase
        .from("wallet_transactions")
        .select("transaction_type, amount, description, created_at, balance_after")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!isAdmin) query.eq("user_id", effectiveUserId);
      const { data: rows } = await query;
      setLedger(rows || []);
    };
    fetch();
  }, [effectiveUserId, isAdmin]);

  const totalCredits = ledger.filter(l => Number(l.amount) > 0).reduce((s, l) => s + Number(l.amount), 0);
  const totalDebits = ledger.filter(l => Number(l.amount) < 0).reduce((s, l) => s + Math.abs(Number(l.amount)), 0);
  const fmt = (n: number) => `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Statements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "System-wide financial statements and transaction logs" : "Your financial statements and transaction logs"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold font-display text-emerald-600">{fmt(totalCredits)}</p>
            <p className="text-[10px] text-muted-foreground">Total Credits</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-lg font-bold font-display text-destructive">{fmt(totalDebits)}</p>
            <p className="text-[10px] text-muted-foreground">Total Debits</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold font-display">{ledger.length}</p>
            <p className="text-[10px] text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Ledger */}
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {isAdmin ? "System Transaction Ledger" : "Transaction Ledger"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {ledger.length === 0 ? (
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
                  {ledger.map((row, i) => {
                    const amt = Number(row.amount);
                    return (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {row.transaction_type.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-xs text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{row.description || "—"}</td>
                        <td className={`py-2 px-2 text-right text-xs font-semibold ${amt >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                          {amt >= 0 ? "+" : ""}{fmt(amt)}
                        </td>
                        <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden md:table-cell">{fmt(Number(row.balance_after))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BCStatements;
