import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Ticket, Search, Loader2, MoreHorizontal, MessageSquare, Check, X, AlertCircle, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TicketRow {
  id: string;
  user_id: string;
  ticket_number: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; email: string } | null;
}

interface TicketMessage {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

const CustomerServicePanel = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((t: any) => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setTickets((data || []).map((t: any) => ({
        ...t,
        profiles: profileMap.get(t.user_id) || null,
      })));
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const openTicketDetail = async (ticket: TicketRow) => {
    setSelectedTicket(ticket);
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setReplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: replyText,
        sender_type: "admin",
      });
      if (error) throw error;

      // Update ticket status to in_progress
      await supabase.from("support_tickets")
        .update({ status: "in_progress" })
        .eq("id", selectedTicket.id);

      setReplyText("");
      openTicketDetail(selectedTicket);
      fetchTickets();
      toast({ title: "Reply sent" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setReplying(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    await supabase.from("support_tickets")
      .update({ status, ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}) })
      .eq("id", ticketId);
    fetchTickets();
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status });
    }
    toast({ title: `Ticket ${status}` });
  };

  const filtered = tickets.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.profiles?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "destructive", in_progress: "secondary", resolved: "default", closed: "outline",
    };
    return <Badge variant={map[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "urgent") return <Badge variant="destructive">Urgent</Badge>;
    if (priority === "high") return <Badge className="bg-destructive/80 text-destructive-foreground">High</Badge>;
    return <Badge variant="outline">{priority}</Badge>;
  };

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-destructive">{openCount}</p><p className="text-xs text-muted-foreground">Open Cases</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{inProgressCount}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-primary">{resolvedCount}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{tickets.length}</p><p className="text-xs text-muted-foreground">Total Tickets</p></CardContent></Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" />Support Tickets</CardTitle>
              <CardDescription>Manage customer disputes, refunds, and support cases</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No tickets found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer" onClick={() => openTicketDetail(ticket)}>
                    <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{ticket.profiles?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{ticket.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openTicketDetail(ticket)}><MessageSquare className="h-4 w-4 mr-2" />View & Reply</DropdownMenuItem>
                          {ticket.status !== "resolved" && <DropdownMenuItem onClick={() => updateTicketStatus(ticket.id, "resolved")} className="text-primary"><Check className="h-4 w-4 mr-2" />Mark Resolved</DropdownMenuItem>}
                          {ticket.status !== "closed" && <DropdownMenuItem onClick={() => updateTicketStatus(ticket.id, "closed")}><X className="h-4 w-4 mr-2" />Close</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              {selectedTicket?.ticket_number} — {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {selectedTicket && getStatusBadge(selectedTicket.status)}
              {selectedTicket && getPriorityBadge(selectedTicket.priority)}
              <span className="text-muted-foreground">• {selectedTicket?.profiles?.full_name} ({selectedTicket?.profiles?.email})</span>
            </DialogDescription>
          </DialogHeader>

          {/* Messages */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto border rounded-lg p-4 bg-secondary/20">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-lg ${msg.sender_type === "admin" ? "bg-primary/10 ml-8" : "bg-card mr-8 border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={msg.sender_type === "admin" ? "default" : "outline"} className="text-xs">
                      {msg.sender_type === "admin" ? "Admin" : "User"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Reply */}
          {selectedTicket && selectedTicket.status !== "closed" && (
            <div className="space-y-3">
              <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} />
              <div className="flex justify-between">
                <div className="flex gap-2">
                  {selectedTicket.status === "open" && (
                    <Button variant="outline" size="sm" onClick={() => updateTicketStatus(selectedTicket.id, "in_progress")}>
                      <Clock className="h-4 w-4 mr-1" />Mark In Progress
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}>
                    <Check className="h-4 w-4 mr-1" />Resolve
                  </Button>
                </div>
                <Button onClick={handleReply} disabled={replying || !replyText.trim()}>
                  {replying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerServicePanel;
