import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2, Search, MessageSquare, AlertTriangle, Users, Shield, RotateCcw, ArrowLeftRight, FileText } from "lucide-react";

const BCCustomerService = () => {
  const { isAnyAdmin } = useUserRoles();
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["bc-cs-tickets"],
    queryFn: async () => {
      const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ["bc-cs-disputes"],
    queryFn: async () => {
      const { data } = await supabase.from("disputes")
        .select("*, orders:order_id(order_number), support_tickets:ticket_id(ticket_number)")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: refunds = [] } = useQuery({
    queryKey: ["bc-cs-refunds"],
    queryFn: async () => {
      const { data } = await supabase.from("refund_cases")
        .select("*, orders:order_id(order_number)")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: returns = [] } = useQuery({
    queryKey: ["bc-cs-returns"],
    queryFn: async () => {
      const { data } = await supabase.from("return_cases")
        .select("*, orders:order_id(order_number)")
        .order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["bc-cs-messages"],
    queryFn: async () => {
      const { data } = await supabase.from("ticket_messages")
        .select("*, support_tickets:ticket_id(ticket_number, subject)")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");
  const openDisputes = disputes.filter(d => d.resolution_status === "open");
  const pendingRefunds = refunds.filter((r: any) => r.status === "requested");
  const pendingReturns = returns.filter((r: any) => r.status === "requested");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" /> Customer Service & Disputes</h1>
        <p className="text-sm text-muted-foreground mt-1">Tickets, refunds, returns, disputes, and communication logs</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: "Open Tickets", value: openTickets.length.toString(), icon: MessageSquare, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Open Disputes", value: openDisputes.length.toString(), icon: AlertTriangle, accent: "text-destructive bg-destructive/10" },
          { title: "Pending Refunds", value: pendingRefunds.length.toString(), icon: RotateCcw, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Pending Returns", value: pendingReturns.length.toString(), icon: ArrowLeftRight, accent: "text-purple-600 bg-purple-500/10" },
          { title: "Total Tickets", value: tickets.length.toString(), icon: FileText, accent: "text-primary bg-primary/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-3">
              <div className={cn("p-1.5 rounded-lg w-fit mb-1", s.accent)}><s.icon className="h-3.5 w-3.5" /></div>
              <p className="text-lg font-bold font-display">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tickets">
        <TabsList className="grid w-full grid-cols-5 h-9">
          <TabsTrigger value="tickets" className="text-xs">Ticket Inbox</TabsTrigger>
          <TabsTrigger value="refunds" className="text-xs">Refund Queue</TabsTrigger>
          <TabsTrigger value="returns" className="text-xs">Returns</TabsTrigger>
          <TabsTrigger value="disputes" className="text-xs">Disputes</TabsTrigger>
          <TabsTrigger value="comms" className="text-xs">Comms Log</TabsTrigger>
        </TabsList>

        {/* Ticket Inbox */}
        <TabsContent value="tickets" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Support Tickets</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Filter..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {ticketsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Ticket</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Assigned</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {tickets.filter(t => !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_number?.toLowerCase().includes(search.toLowerCase())).map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-[10px]">{t.ticket_number}</TableCell>
                        <TableCell className="text-xs font-medium truncate max-w-[150px]">{t.subject}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", t.priority === "urgent" ? "border-destructive/30 text-destructive" : t.priority === "high" ? "border-amber-500/30 text-amber-600" : "")}>{t.priority}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", t.status === "open" ? "border-blue-500/30 text-blue-600" : t.status === "in_progress" ? "border-amber-500/30 text-amber-600" : t.status === "closed" ? "border-emerald-500/30 text-emerald-600" : "")}>{t.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{t.assigned_to ? "Yes" : "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Queue */}
        <TabsContent value="refunds" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> Refund Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {refunds.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No refund cases.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Order</TableHead>
                    <TableHead className="text-xs text-right">Requested</TableHead>
                    <TableHead className="text-xs text-right">Approved</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Processed By</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {refunds.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-[10px]">{r.orders?.order_number || "—"}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(r.requested_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{r.approved_amount ? `₱${Number(r.approved_amount).toLocaleString()}` : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">{r.reason || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", r.status === "requested" ? "border-amber-500/30 text-amber-600" : r.status === "approved" ? "border-emerald-500/30 text-emerald-600" : r.status === "rejected" ? "border-destructive/30 text-destructive" : "")}>{r.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{r.processed_by ? "Admin" : "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Return Approvals */}
        <TabsContent value="returns" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-primary" /> Return Approvals</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {returns.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No return cases.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Order</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Processed By</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {returns.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-[10px]">{r.orders?.order_number || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{r.reason || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", r.status === "requested" ? "border-amber-500/30 text-amber-600" : r.status === "approved" ? "border-emerald-500/30 text-emerald-600" : "")}>{r.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{r.processed_by ? "Admin" : "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispute Center */}
        <TabsContent value="disputes" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Dispute Center</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {disputes.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No disputes filed.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Order</TableHead>
                    <TableHead className="text-xs">Ticket</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Resolution</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {disputes.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs font-medium">{d.type}</TableCell>
                        <TableCell className="font-mono text-[10px]">{(d as any).orders?.order_number || "—"}</TableCell>
                        <TableCell className="font-mono text-[10px]">{(d as any).support_tickets?.ticket_number || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", d.resolution_status === "open" ? "border-amber-500/30 text-amber-600" : d.resolution_status === "resolved" ? "border-emerald-500/30 text-emerald-600" : "")}>{d.resolution_status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{d.resolution_notes || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Logs */}
        <TabsContent value="comms" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Communication Logs</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {messages.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No messages recorded.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Ticket</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Sender</TableHead>
                    <TableHead className="text-xs">Message</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {messages.slice(0, 50).map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-[10px]">{m.support_tickets?.ticket_number || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">{m.support_tickets?.subject || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", m.sender_type === "admin" ? "border-primary/30 text-primary" : "")}>{m.sender_type}</Badge></TableCell>
                        <TableCell className="text-xs truncate max-w-[200px]">{m.message}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCCustomerService;
