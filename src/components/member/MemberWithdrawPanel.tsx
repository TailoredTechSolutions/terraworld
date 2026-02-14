import { useState, useEffect } from "react";
import {
  Wallet, ArrowUpCircle, Clock, CheckCircle2, XCircle, CreditCard, Smartphone, Bitcoin, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MemberWithdrawPanelProps {
  userId: string;
  walletData: {
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
  } | null;
}

const WITHDRAWAL_METHODS = [
  { id: "gcash", label: "GCash", icon: Smartphone, processingTime: "1-2 hours" },
  { id: "bank", label: "Bank Transfer", icon: CreditCard, processingTime: "1-3 business days" },
  { id: "crypto", label: "Crypto (USDT)", icon: Bitcoin, processingTime: "15-30 minutes" },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  approved: { icon: CheckCircle2, color: "text-green-500", label: "Approved" },
  processing: { icon: Clock, color: "text-blue-500", label: "Processing" },
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Completed" },
  rejected: { icon: XCircle, color: "text-red-500", label: "Rejected" },
  flagged: { icon: Clock, color: "text-orange-500", label: "Flagged" },
};

const MemberWithdrawPanel = ({ userId, walletData }: MemberWithdrawPanelProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("gcash");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableBalance = walletData?.available_balance || 0;
  const minimumWithdrawal = 500;
  const selectedMethod = WITHDRAWAL_METHODS.find((m) => m.id === withdrawMethod);

  useEffect(() => {
    fetchWithdrawals();
  }, [userId]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < minimumWithdrawal) {
      toast({ title: "Invalid Amount", description: `Minimum withdrawal is ₱${minimumWithdrawal.toLocaleString()}`, variant: "destructive" });
      return;
    }
    if (amount > availableBalance) {
      toast({ title: "Insufficient Balance", description: "Not enough available balance", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-withdrawal", {
        body: { action: "create", amount, method: withdrawMethod, account_details: {} },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Withdrawal Submitted", description: `₱${amount.toLocaleString()} via ${selectedMethod?.label} is being processed.` });
      setIsDialogOpen(false);
      setWithdrawAmount("");
      fetchWithdrawals();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingAmount = withdrawals.filter((w) => w.status === "pending").reduce((s: number, w: any) => s + Number(w.amount), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Withdrawal Request
          </CardTitle>
          <CardDescription>Request a withdrawal from your available balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Available Balance</Label>
                <div className="p-4 rounded-lg bg-primary/5 border">
                  <p className="text-2xl font-bold text-primary">₱{availableBalance.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Withdrawal Amount</Label>
                <Input type="number" placeholder={`Min ₱${minimumWithdrawal.toLocaleString()}`} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Withdrawal Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {WITHDRAWAL_METHODS.map((method) => (
                    <button key={method.id} type="button" onClick={() => setWithdrawMethod(method.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${withdrawMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <method.icon className={`h-5 w-5 mx-auto mb-1 ${withdrawMethod === method.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs font-medium">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              {selectedMethod && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Est. Processing: <span className="font-medium">{selectedMethod.processingTime}</span>
                </div>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={availableBalance < minimumWithdrawal}>Request Withdrawal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Withdrawal</DialogTitle>
                    <DialogDescription>Review your withdrawal details before confirming.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold">₱{parseFloat(withdrawAmount || "0").toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{selectedMethod?.label}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Processing Time</span><span>{selectedMethod?.processingTime}</span></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleWithdrawSubmit} disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirm Withdrawal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-4">Withdrawal Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Withdrawn (Lifetime)</span><span className="font-medium">₱{(walletData?.total_withdrawn || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pending Withdrawals</span><span className="font-medium">₱{pendingAmount.toLocaleString()}</span></div>
                  </div>
                </CardContent>
              </Card>
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-2">Important Notes</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Minimum withdrawal: ₱{minimumWithdrawal.toLocaleString()}</li>
                  <li>• Maximum: ₱50,000/day</li>
                  <li>• Processing fees may apply</li>
                  <li>• KYC verification required</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" />Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No withdrawals yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => {
                  const sc = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
                  const Icon = sc.icon;
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-medium">₱{Number(w.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground">₱{Number(w.fee).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{w.method}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Icon className={`h-4 w-4 ${sc.color}`} />
                          <span className={sc.color}>{sc.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{w.reference_code}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberWithdrawPanel;
