import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, LifeBuoy, MessageSquare, Plus, Send } from "lucide-react";
import { format } from "date-fns";

interface FarmerSupportPanelProps {
  userId: string;
}

const FarmerSupportPanel = ({ userId }: FarmerSupportPanelProps) => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [form, setForm] = useState({ subject: "", category: "order_issue", message: "" });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["farmer-tickets", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["ticket-messages", selectedTicket],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTicket,
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({ user_id: userId, subject: form.subject, category: form.category })
        .select()
        .single();
      if (ticketError) throw ticketError;

      if (form.message.trim()) {
        const { error: msgError } = await supabase
          .from("ticket_messages")
          .insert({ ticket_id: ticket.id, user_id: userId, message: form.message, sender_type: "user" });
        if (msgError) throw msgError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-tickets"] });
      toast({ title: "Ticket Created" });
      setShowCreate(false);
      setForm({ subject: "", category: "order_issue", message: "" });
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTicket || !newMessage.trim()) return;
      const { error } = await supabase
        .from("ticket_messages")
        .insert({ ticket_id: selectedTicket, user_id: userId, message: newMessage.trim(), sender_type: "user" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", selectedTicket] });
      setNewMessage("");
    },
    onError: (error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><LifeBuoy className="h-5 w-5" /> Support Tickets</CardTitle>
              <CardDescription>Submit and track support requests or respond to disputes.</CardDescription>
            </div>
            <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1"><Plus className="h-4 w-4" /> New Ticket</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!tickets?.length ? (
            <p className="text-center text-muted-foreground py-8">No tickets yet.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicket(t.id)}>
                  <div>
                    <p className="text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.ticket_number} • {t.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === "open" ? "default" : t.status === "closed" ? "outline" : "secondary"}>{t.status}</Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(t.created_at), "MMM d")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your issue" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_issue">Order Issue</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Describe your issue in detail..." />
            </div>
            <Button onClick={() => createTicketMutation.mutate()} disabled={createTicketMutation.isPending || !form.subject.trim()} className="w-full">
              {createTicketMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Messages Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Ticket Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages?.map((m) => (
              <div key={m.id} className={`p-3 rounded-lg text-sm ${m.sender_type === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                <p>{m.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(m.created_at), "MMM d, h:mm a")}</p>
              </div>
            ))}
            {!messages?.length && <p className="text-center text-muted-foreground text-sm py-4">No messages yet.</p>}
          </div>
          <div className="flex gap-2">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a response..." onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessageMutation.mutate()} />
            <Button size="icon" onClick={() => sendMessageMutation.mutate()} disabled={sendMessageMutation.isPending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerSupportPanel;
