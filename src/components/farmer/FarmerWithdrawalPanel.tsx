import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Wallet, ArrowUpRight } from "lucide-react";

interface FarmerWithdrawalPanelProps {
  userId: string;
}

const FarmerWithdrawalPanel = ({ userId }: FarmerWithdrawalPanelProps) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("gcash");

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["farmer-wallet-wd", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["farmer-wd-requests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Wallet not found");
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) throw new Error("Invalid amount");
      if (amt > Number(wallet.available_balance)) throw new Error("Insufficient balance");

      const fee = Math.round(amt * 0.02 * 100) / 100; // 2% fee
      const net = amt - fee;

      const { error } = await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: userId,
          wallet_id: wallet.id,
          amount: amt,
          fee,
          net_amount: net,
          method,
          status: "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-wd-requests"] });
      queryClient.invalidateQueries({ queryKey: ["farmer-wallet"] });
      toast({ title: "Withdrawal Requested", description: "Your request is being processed." });
      setAmount("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const balance = Number(wallet?.available_balance || 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Request Withdrawal
          </CardTitle>
          <CardDescription>Available balance: ₱{balance.toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₱)</Label>
              <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {amount && parseFloat(amount) > 0 && (
            <div className="text-sm text-muted-foreground">
              Fee (2%): ₱{(parseFloat(amount) * 0.02).toFixed(2)} • Net: ₱{(parseFloat(amount) * 0.98).toFixed(2)}
            </div>
          )}
          <Button onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending || !amount} className="gap-2">
            {withdrawMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            Submit Withdrawal
          </Button>
        </CardContent>
      </Card>

      {requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.reference_code}</p>
                    <p className="text-xs text-muted-foreground">{r.method} • {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₱{Number(r.net_amount).toLocaleString()}</p>
                    <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "secondary" : "outline"} className="text-xs">
                      {r.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerWithdrawalPanel;
