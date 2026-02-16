import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Ticket,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  "Order Issue",
  "Delivery Problem",
  "Payment",
  "Refund Request",
  "Product Quality",
  "Account",
  "Technical Issue",
  "Other",
];

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  open: { icon: AlertCircle, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  in_progress: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  resolved: { icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  closed: { icon: CheckCircle2, color: "text-muted-foreground", bgColor: "bg-muted" },
};

interface TicketRow {
  id: string;
  ticket_number: string;
  category: string;
  subject: string;
  status: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

const BuyerSupportPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const userId = user?.id;

  // Fetch tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["support-tickets", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as TicketRow[];
    },
    enabled: !!userId,
  });

  // Fetch messages for selected ticket
  const { data: messages } = useQuery({
    queryKey: ["ticket-messages", selectedTicketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicketId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as MessageRow[];
    },
    enabled: !!selectedTicketId,
  });

  // Create ticket
  const createTicket = useMutation({
    mutationFn: async () => {
      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: userId!,
          category: newCategory,
          subject: newSubject,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Add initial message
      const { error: msgError } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: ticket.id,
          user_id: userId!,
          message: newMessage,
          sender_type: "user",
        });

      if (msgError) throw msgError;
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast({ title: "Ticket Created", description: "We'll respond within 24 hours." });
      setIsNewTicketOpen(false);
      setNewCategory("");
      setNewSubject("");
      setNewMessage("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Reply to ticket
  const sendReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("ticket_messages")
        .insert({
          ticket_id: selectedTicketId!,
          user_id: userId!,
          message: replyMessage,
          sender_type: "user",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages"] });
      setReplyMessage("");
      toast({ title: "Reply Sent" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const selectedTicket = tickets?.find((t) => t.id === selectedTicketId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Support & Disputes</h3>
          <p className="text-sm text-muted-foreground">Get help from our support team</p>
        </div>
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue and we'll get back to you within 24 hours.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createTicket.mutate()}
                disabled={createTicket.isPending || !newCategory || !newSubject || !newMessage}
              >
                {createTicket.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Submit Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ticket className="h-4 w-4 text-primary" />
                Your Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !tickets?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No tickets yet</p>
                  <p className="text-sm">Create a new ticket to get support</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => {
                        const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                        const StatusIcon = config.icon;
                        return (
                          <TableRow
                            key={ticket.id}
                            className={`cursor-pointer hover:bg-muted/50 ${selectedTicketId === ticket.id ? "bg-muted/50" : ""}`}
                            onClick={() => setSelectedTicketId(ticket.id)}
                          >
                            <TableCell className="font-mono text-xs">{ticket.ticket_number}</TableCell>
                            <TableCell><Badge variant="outline" className="text-xs">{ticket.category}</Badge></TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm">{ticket.subject}</TableCell>
                            <TableCell>
                              <Badge className={`${config.bgColor} ${config.color} text-xs`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {ticket.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {format(new Date(ticket.created_at), "MMM d")}
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

        {/* Detail panel */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID</span>
                      <span className="font-mono">{selectedTicket.ticket_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span>{selectedTicket.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {selectedTicket.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm font-medium">{selectedTicket.subject}</p>

                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {messages?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender_type === "user" ? "bg-primary/10 ml-4" : "bg-muted mr-4"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-xs">
                              {msg.sender_type === "user" ? "You" : "Support Team"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p>{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && replyMessage.trim() && sendReply.mutate()}
                      />
                      <Button
                        size="icon"
                        onClick={() => sendReply.mutate()}
                        disabled={sendReply.isPending || !replyMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a ticket to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerSupportPanel;
