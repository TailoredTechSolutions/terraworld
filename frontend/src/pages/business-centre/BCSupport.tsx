import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, MessageSquare, Clock, CheckCircle } from "lucide-react";

interface TicketRow {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
}

const BCSupport = () => {
  const { data, effectiveUserId } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;
  const { toast } = useToast();

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!effectiveUserId) return;
    const fetchTickets = async () => {
      const query = supabase
        .from("support_tickets")
        .select("id, ticket_number, subject, category, status, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!isAdmin) query.eq("user_id", effectiveUserId);
      const { data: rows } = await query;
      setTickets(rows || []);
    };
    fetchTickets();
  }, [effectiveUserId, isAdmin]);

  const handleSubmit = async () => {
    if (!subject.trim() || !category || !message.trim() || !effectiveUserId) return;
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: effectiveUserId,
      subject: subject.trim(),
      category,
      priority: "normal",
    });
    if (!error) {
      toast({ title: "Ticket submitted", description: "We'll get back to you soon." });
      setSubject(""); setCategory(""); setMessage("");
      // Refresh
      const { data: rows } = await supabase
        .from("support_tickets")
        .select("id, ticket_number, subject, category, status, priority, created_at")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false })
        .limit(20);
      setTickets(rows || []);
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const stats = {
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => ["resolved", "closed"].includes(t.status)).length,
    total: tickets.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Support</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "System-wide support ticket management" : "Get help with your Business Centre"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", value: stats.open.toString(), icon: HelpCircle, accent: "text-amber-500" },
          { label: "In Progress", value: stats.inProgress.toString(), icon: Clock, accent: "text-blue-500" },
          { label: "Resolved", value: stats.resolved.toString(), icon: CheckCircle, accent: "text-emerald-500" },
          { label: "Total", value: stats.total.toString(), icon: MessageSquare, accent: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.accent}`} />
              <p className="text-xl font-bold font-display">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!isAdmin && (
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <CardTitle className="text-sm">Submit a Ticket</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" className="h-9 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commission">Commission Issues</SelectItem>
                    <SelectItem value="binary">Binary Tree / BV</SelectItem>
                    <SelectItem value="payout">Payout & Withdrawals</SelectItem>
                    <SelectItem value="membership">Membership / Package</SelectItem>
                    <SelectItem value="tokens">Token Rewards</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs">Message</Label>
                <Textarea id="message" placeholder="Describe your issue..." rows={3} className="text-sm" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleSubmit} disabled={submitting || !subject.trim() || !category}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className={`border-border/40 ${isAdmin ? "lg:col-span-2" : ""}`}>
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm">{isAdmin ? "All Support Tickets" : "Your Tickets"}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tickets found.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg border border-border/30 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="font-medium text-xs">{t.ticket_number} — {t.subject}</p>
                      <p className="text-[10px] text-muted-foreground">{t.category} • {new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge
                      variant={t.status === "open" ? "default" : t.status === "in_progress" ? "secondary" : "outline"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {t.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BCSupport;
