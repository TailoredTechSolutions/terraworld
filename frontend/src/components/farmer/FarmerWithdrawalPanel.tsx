import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusChip from "@/components/backoffice/StatusChip";
import { toast } from "@/hooks/use-toast";
import { Loader2, Wallet, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

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
      const { data } = await supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle();
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

      const fee = Math.round(amt * 0.02 * 100) / 100;
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Request Withdrawal
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
              Fee (2%): ₱{(parseFloat(amount) * 0.02).toFixed(2)} · Net: ₱{(parseFloat(amount) * 0.98).toFixed(2)}
            </div>
          )}
          <Button onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending || !amount} className="gap-2">
            {withdrawMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            Submit Withdrawal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {!requests?.length ? (
            <div className="text-center py-8">
              <Wallet className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No withdrawal requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Submit a withdrawal to see history here</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-xs">{r.reference_code}</TableCell>
                      <TableCell className="text-sm">{format(new Date(r.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-sm capitalize">{r.method.replace("_", " ")}</TableCell>
                      <TableCell className="text-right text-sm">₱{Number(r.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm font-medium">₱{Number(r.net_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusChip status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerWithdrawalPanel;
