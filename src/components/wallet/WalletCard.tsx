import { useState, useEffect } from "react";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WalletData {
  id: string;
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
}

interface WalletTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  status: string;
  created_at: string;
}

interface WalletCardProps {
  userId: string;
}

const TRANSACTION_ICONS: Record<string, React.ReactNode> = {
  credit: <ArrowDownCircle className="h-4 w-4 text-green-500" />,
  debit: <ArrowUpCircle className="h-4 w-4 text-red-500" />,
  withdrawal_request: <Clock className="h-4 w-4 text-amber-500" />,
  withdrawal_approved: <ArrowUpCircle className="h-4 w-4 text-green-500" />,
};

const WalletCard = ({ userId }: WalletCardProps) => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (walletError) throw walletError;
      setWallet(walletData);

      if (walletData) {
        // Fetch recent transactions
        const { data: txData, error: txError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (txError) throw txError;
        setTransactions(txData || []);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (!wallet || amount > wallet.available_balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available balance",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a message - actual withdrawal would need an edge function
    toast({
      title: "Withdrawal Request Submitted",
      description: `Your request for ₱${amount.toLocaleString()} is being processed.`,
    });
    setIsWithdrawOpen(false);
    setWithdrawAmount("");
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-12 w-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No wallet found</p>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = wallet.available_balance + wallet.pending_balance;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-card">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">My Wallet</CardTitle>
              <CardDescription>Internal fund balance</CardDescription>
            </div>
          </div>
          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Enter the amount you'd like to withdraw. Minimum ₱500.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₱)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: ₱{wallet.available_balance.toLocaleString()}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleWithdrawRequest}>
                  Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Balance Display */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              ₱{wallet.available_balance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">
              ₱{wallet.pending_balance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              ₱{wallet.total_withdrawn.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Withdrawn</p>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Recent Transactions */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Transactions
          </h4>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {TRANSACTION_ICONS[tx.transaction_type] || (
                      <Wallet className="h-4 w-4" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {tx.transaction_type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        tx.transaction_type === "credit"
                          ? "text-green-500"
                          : "text-foreground"
                      }`}
                    >
                      {tx.transaction_type === "credit" ? "+" : "-"}₱
                      {Math.abs(tx.amount).toLocaleString()}
                    </p>
                    <Badge
                      variant={tx.status === "completed" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
