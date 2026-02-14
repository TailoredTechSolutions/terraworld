import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, MoreHorizontal, Check, X, Flag, Eye, Download, Filter, Wallet, AlertTriangle, Loader2,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalRow {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  method: string;
  status: string;
  reference_code: string;
  review_note: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string } | null;
}

const WithdrawalsPanel = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean; action: "approved" | "rejected" | "flagged" | null; withdrawal: WithdrawalRow | null;
  }>({ open: false, action: null, withdrawal: null });
  const [actionNote, setActionNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile info for each unique user
      const userIds = [...new Set((data || []).map((w: any) => w.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setWithdrawals(
        (data || []).map((w: any) => ({
          ...w,
          profiles: profileMap.get(w.user_id) || null,
        }))
      );
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = (action: "approved" | "rejected" | "flagged", withdrawal: WithdrawalRow) => {
    setActionDialog({ open: true, action, withdrawal });
    setActionNote("");
  };

  const confirmAction = async () => {
    if (!actionDialog.action || !actionDialog.withdrawal) return;
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke("process-withdrawal", {
        body: {
          action: "review",
          withdrawal_id: actionDialog.withdrawal.id,
          decision: actionDialog.action,
          note: actionNote,
        },
      });
      if (error) throw error;

      toast({
        title: `Withdrawal ${actionDialog.action}`,
        description: `₱${actionDialog.withdrawal.amount.toLocaleString()} request has been ${actionDialog.action}.`,
      });
      setActionDialog({ open: false, action: null, withdrawal: null });
      fetchWithdrawals();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = withdrawals.filter((w) => {
    const name = w.profiles?.full_name || "";
    const email = w.profiles?.email || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.reference_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      pending: { variant: "secondary" },
      approved: { variant: "default", className: "bg-success" },
      completed: { variant: "default", className: "bg-success" },
      processing: { variant: "outline", className: "border-primary text-primary" },
      rejected: { variant: "destructive" },
      flagged: { variant: "outline", className: "border-orange-500 text-orange-500" },
    };
    const c = map[status] || { variant: "secondary" as const };
    return <Badge variant={c.variant} className={c.className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const pendingTotal = withdrawals.filter(w => w.status === "pending").reduce((s, w) => s + Number(w.amount), 0);
  const pendingCount = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10"><Wallet className="h-5 w-5 text-orange-500" /></div>
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
              <div className="p-2 rounded-lg bg-secondary"><AlertTriangle className="h-5 w-5 text-muted-foreground" /></div>
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
              <div className="p-2 rounded-lg bg-success/10"><Check className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-2xl font-bold">{withdrawals.filter(w => w.status === "approved" || w.status === "completed").length}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><Flag className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-2xl font-bold">{withdrawals.filter(w => w.status === "flagged").length}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <Input placeholder="Search member..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No withdrawal requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{w.profiles?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{w.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₱{Number(w.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">₱{Number(w.fee).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₱{Number(w.net_amount).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{w.method}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell>
                      {w.status === "pending" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction("approved", w)} className="text-success">
                              <Check className="h-4 w-4 mr-2" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("rejected", w)} className="text-destructive">
                              <X className="h-4 w-4 mr-2" /> Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("flagged", w)} className="text-orange-500">
                              <Flag className="h-4 w-4 mr-2" /> Flag
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "approved" && "Approve Withdrawal"}
              {actionDialog.action === "rejected" && "Reject Withdrawal"}
              {actionDialog.action === "flagged" && "Flag for Review"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.withdrawal && (
                <>Processing ₱{Number(actionDialog.withdrawal.amount).toLocaleString()} for {actionDialog.withdrawal.profiles?.full_name}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea placeholder="Add a note..." value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, withdrawal: null })}>Cancel</Button>
            <Button onClick={confirmAction} disabled={processing}
              className={actionDialog.action === "approved" ? "bg-success hover:bg-success/90" : actionDialog.action === "rejected" ? "bg-destructive hover:bg-destructive/90" : "bg-orange-500 hover:bg-orange-600"}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalsPanel;
