import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Smartphone,
  Bitcoin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MemberWithdrawPanelProps {
  userId: string;
  walletData: {
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
  } | null;
}

interface WithdrawalRequest {
  id: string;
  requestDate: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  referenceId: string;
}

// Mock withdrawal history
const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: '1',
    requestDate: '2024-01-20',
    amount: 5000,
    method: 'GCash',
    status: 'completed',
    referenceId: 'WD-2024-001',
  },
  {
    id: '2',
    requestDate: '2024-01-15',
    amount: 3000,
    method: 'Bank Transfer',
    status: 'completed',
    referenceId: 'WD-2024-002',
  },
];

const WITHDRAWAL_METHODS = [
  { id: 'gcash', label: 'GCash', icon: Smartphone, processingTime: '1-2 hours' },
  { id: 'bank', label: 'Bank Transfer', icon: CreditCard, processingTime: '1-3 business days' },
  { id: 'crypto', label: 'Crypto (USDT)', icon: Bitcoin, processingTime: '15-30 minutes' },
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', label: 'Pending' },
  processing: { icon: Clock, color: 'text-blue-500', label: 'Processing' },
  completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' },
  rejected: { icon: XCircle, color: 'text-red-500', label: 'Rejected' },
};

const MemberWithdrawPanel = ({
  userId,
  walletData,
}: MemberWithdrawPanelProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [walletType, setWalletType] = useState('commission');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('gcash');
  const [withdrawals] = useState<WithdrawalRequest[]>(mockWithdrawals);

  const availableBalance = walletData?.available_balance || 0;
  const minimumWithdrawal = 500;

  const selectedMethod = WITHDRAWAL_METHODS.find(m => m.id === withdrawMethod);

  const handleWithdrawSubmit = () => {
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount < minimumWithdrawal) {
      toast({
        title: "Invalid Amount",
        description: `Minimum withdrawal is ₱${minimumWithdrawal.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available balance",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Request Submitted",
      description: `Your request for ₱${amount.toLocaleString()} via ${selectedMethod?.label} is being processed.`,
    });

    setIsDialogOpen(false);
    setWithdrawAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Withdrawal Request Card */}
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
            {/* Left: Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Wallet Type</Label>
                <Select value={walletType} onValueChange={setWalletType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commission">Commission Wallet</SelectItem>
                    <SelectItem value="pending" disabled>Pending Wallet (locked)</SelectItem>
                    <SelectItem value="token" disabled>Token Wallet (coming soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Available Balance</Label>
                <div className="p-4 rounded-lg bg-primary/5 border">
                  <p className="text-2xl font-bold text-primary">₱{availableBalance.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Amount</Label>
                <Input
                  type="number"
                  placeholder={`Min ₱${minimumWithdrawal.toLocaleString()}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {WITHDRAWAL_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setWithdrawMethod(method.id)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        withdrawMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <method.icon className={`h-5 w-5 mx-auto mb-1 ${
                        withdrawMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs font-medium">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMethod && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="text-muted-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated Processing Time: <span className="font-medium text-foreground">{selectedMethod.processingTime}</span>
                  </p>
                </div>
              )}

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={availableBalance < minimumWithdrawal}>
                    Request Withdrawal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Withdrawal</DialogTitle>
                    <DialogDescription>
                      Please review your withdrawal details before confirming.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold">₱{parseFloat(withdrawAmount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium">{selectedMethod?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Time</span>
                      <span>{selectedMethod?.processingTime}</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleWithdrawSubmit}>
                      Confirm Withdrawal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Right: Summary */}
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-4">Withdrawal Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Withdrawn (Lifetime)</span>
                      <span className="font-medium">₱{(walletData?.total_withdrawn || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending Withdrawals</span>
                      <span className="font-medium">₱0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium">₱0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-2">Important Notes</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Minimum withdrawal: ₱{minimumWithdrawal.toLocaleString()}</li>
                  <li>• Maximum withdrawal: ₱50,000/day</li>
                  <li>• Processing fees may apply for some methods</li>
                  <li>• KYC verification required for withdrawals</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdrawal History
          </CardTitle>
          <CardDescription>Your past withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No withdrawals yet</p>
              <p className="text-sm">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => {
                    const statusConfig = STATUS_CONFIG[withdrawal.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="text-sm">
                          {new Date(withdrawal.requestDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₱{withdrawal.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                            <span className={statusConfig.color}>{statusConfig.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {withdrawal.referenceId}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberWithdrawPanel;
