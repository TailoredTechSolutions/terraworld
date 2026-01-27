import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Check,
  X,
  Flag,
  Eye,
  Download,
  Filter,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalRequest {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  amount: number;
  method: string;
  kyc_status: string;
  request_date: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  reference_id?: string;
}

// Mock data - in production this would come from wallet_transactions with type='withdrawal'
const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: "1",
    member_id: "M001",
    member_name: "Maria Santos",
    member_email: "maria@example.com",
    amount: 5000,
    method: "GCash",
    kyc_status: "approved",
    request_date: "2026-01-25T10:30:00Z",
    status: "pending",
  },
  {
    id: "2",
    member_id: "M002",
    member_name: "Juan dela Cruz",
    member_email: "juan@example.com",
    amount: 15000,
    method: "Bank Transfer",
    kyc_status: "approved",
    request_date: "2026-01-24T14:20:00Z",
    status: "pending",
  },
  {
    id: "3",
    member_id: "M003",
    member_name: "Ana Reyes",
    member_email: "ana@example.com",
    amount: 2500,
    method: "Maya",
    kyc_status: "pending",
    request_date: "2026-01-24T09:15:00Z",
    status: "flagged",
  },
  {
    id: "4",
    member_id: "M004",
    member_name: "Pedro Gomez",
    member_email: "pedro@example.com",
    amount: 8000,
    method: "Bank Transfer",
    kyc_status: "approved",
    request_date: "2026-01-23T16:45:00Z",
    status: "approved",
    reference_id: "REF-2026-0123",
  },
];

const WithdrawalsPanel = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(mockWithdrawals);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "flag" | null;
    withdrawal: WithdrawalRequest | null;
  }>({ open: false, action: null, withdrawal: null });
  const [actionNote, setActionNote] = useState("");

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch = 
      w.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.member_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.member_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      pending: { variant: "secondary" },
      approved: { variant: "default", className: "bg-success" },
      rejected: { variant: "destructive" },
      flagged: { variant: "outline", className: "border-orange-500 text-orange-500" },
    };
    const config = variants[status] || { variant: "secondary" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getKYCBadge = (status: string) => {
    if (status === "approved") {
      return <Badge variant="default" className="bg-success text-xs">Verified</Badge>;
    }
    return <Badge variant="outline" className="text-orange-500 border-orange-500 text-xs">Pending</Badge>;
  };

  const handleAction = (action: "approve" | "reject" | "flag", withdrawal: WithdrawalRequest) => {
    setActionDialog({ open: true, action, withdrawal });
    setActionNote("");
  };

  const confirmAction = () => {
    if (!actionDialog.action || !actionDialog.withdrawal) return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === actionDialog.withdrawal!.id
          ? { ...w, status: actionDialog.action === "flag" ? "flagged" : actionDialog.action === "approve" ? "approved" : "rejected" }
          : w
      )
    );

    toast({
      title: `Withdrawal ${actionDialog.action === "approve" ? "Approved" : actionDialog.action === "reject" ? "Rejected" : "Flagged"}`,
      description: `Withdrawal request for ₱${actionDialog.withdrawal.amount.toLocaleString()} has been ${actionDialog.action}d.`,
    });

    setActionDialog({ open: false, action: null, withdrawal: null });
  };

  const pendingTotal = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);
  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₱{pendingTotal.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{withdrawals.filter(w => w.status === "approved").length}</p>
                <p className="text-xs text-muted-foreground">Approved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Flag className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{withdrawals.filter(w => w.status === "flagged").length}</p>
                <p className="text-xs text-muted-foreground">Flagged for Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Review and process member withdrawal requests</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-mono text-sm">{withdrawal.member_id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{withdrawal.member_name}</p>
                      <p className="text-xs text-muted-foreground">{withdrawal.member_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">₱{withdrawal.amount.toLocaleString()}</TableCell>
                  <TableCell>{withdrawal.method}</TableCell>
                  <TableCell>{getKYCBadge(withdrawal.kyc_status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(withdrawal.request_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedWithdrawal(withdrawal)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {withdrawal.status === "pending" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleAction("approve", withdrawal)}
                              className="text-success"
                            >
                              <Check className="h-4 w-4 mr-2" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction("reject", withdrawal)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" /> Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction("flag", withdrawal)}
                              className="text-orange-500"
                            >
                              <Flag className="h-4 w-4 mr-2" /> Flag for Review
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approve" && "Approve Withdrawal"}
              {actionDialog.action === "reject" && "Reject Withdrawal"}
              {actionDialog.action === "flag" && "Flag for Review"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.withdrawal && (
                <>
                  Processing withdrawal of <strong>₱{actionDialog.withdrawal.amount.toLocaleString()}</strong> for{" "}
                  <strong>{actionDialog.withdrawal.member_name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (optional)</label>
              <Textarea
                placeholder="Add a note for this action..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, withdrawal: null })}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={
                actionDialog.action === "approve"
                  ? "bg-success hover:bg-success/90"
                  : actionDialog.action === "reject"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-orange-500 hover:bg-orange-600"
              }
            >
              Confirm {actionDialog.action?.charAt(0).toUpperCase()}{actionDialog.action?.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Details Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Request Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member ID</p>
                  <p className="font-medium">{selectedWithdrawal.member_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedWithdrawal.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold">₱{selectedWithdrawal.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">{selectedWithdrawal.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  {getKYCBadge(selectedWithdrawal.kyc_status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{new Date(selectedWithdrawal.request_date).toLocaleString()}</p>
                </div>
              </div>
              {selectedWithdrawal.reference_id && (
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Reference ID</p>
                  <p className="font-mono">{selectedWithdrawal.reference_id}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalsPanel;
