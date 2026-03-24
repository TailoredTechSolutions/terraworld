import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalRow {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  method: string;
  status: string;
  reference_code: string;
  created_at: string;
}

const BCWithdrawals = () => {
  const { data, adminData, effectiveUserId } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;
  const wallet = data.walletData;

  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);

  useEffect(() => {
    if (!effectiveUserId) return;
    const fetch = async () => {
      const query = supabase
        .from("withdrawal_requests")
        .select("id, amount, fee, net_amount, method, status, reference_code, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!isAdmin) query.eq("user_id", effectiveUserId);
      const { data: rows } = await query;
      setWithdrawals(rows || []);
    };
    fetch();
  }, [effectiveUserId, isAdmin]);

  const metrics = isAdmin
    ? [
        { label: "Pending Requests", value: adminData.pendingWithdrawals.toString(), icon: AlertTriangle },
        { label: "Pending Amount", value: `₱${adminData.pendingWithdrawalAmount.toLocaleString()}`, icon: Clock },
        { label: "Total Wallet Balances", value: `₱${adminData.totalWalletBalance.toLocaleString()}`, icon: CheckCircle },
      ]
    : [
        { label: "Available Balance", value: `₱${(wallet?.available_balance ?? 0).toLocaleString()}`, icon: ArrowUpRight },
        { label: "Pending", value: `₱${(wallet?.pending_balance ?? 0).toLocaleString()}`, icon: Clock },
        { label: "Total Withdrawn", value: `₱${(wallet?.total_withdrawn ?? 0).toLocaleString()}`, icon: CheckCircle },
      ];

  const fmt = (n: number) => `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Withdrawals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "System-wide withdrawal management" : "Request and track your withdrawals"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <m.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold font-display">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isAdmin && (
        <Card className="border-border/40">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold">Request Withdrawal</h3>
            <p className="text-xs text-muted-foreground">Minimum withdrawal: ₱500. Processing time: 1-3 business days.</p>
            <Button size="sm" className="h-9 text-sm" disabled={(wallet?.available_balance ?? 0) < 500}>
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm">
            {isAdmin ? "All Withdrawal Requests" : "Withdrawal History"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {isAdmin ? "No withdrawal requests in the system yet." : "No withdrawals yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Date</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Reference</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Method</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs">Amount</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs hidden sm:table-cell">Fee</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs hidden sm:table-cell">Net</th>
                    <th className="text-center py-2 px-2 text-muted-foreground font-medium text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-2 text-xs font-mono">{w.reference_code}</td>
                      <td className="py-2 px-2 text-xs">{w.method}</td>
                      <td className="py-2 px-2 text-right text-xs font-semibold">{fmt(Number(w.amount))}</td>
                      <td className="py-2 px-2 text-right text-xs text-muted-foreground hidden sm:table-cell">{fmt(Number(w.fee))}</td>
                      <td className="py-2 px-2 text-right text-xs font-semibold hidden sm:table-cell">{fmt(Number(w.net_amount))}</td>
                      <td className="py-2 px-2 text-center">
                        <Badge
                          variant={w.status === "pending" ? "default" : w.status === "completed" ? "secondary" : "outline"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {w.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BCWithdrawals;
