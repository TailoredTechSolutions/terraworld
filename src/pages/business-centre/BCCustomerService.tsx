import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Search, MessageSquare, AlertTriangle, Users } from "lucide-react";

const BCCustomerService = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [tRes, dRes] = await Promise.all([
        supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("disputes").select("*, orders:order_id(order_number), support_tickets:ticket_id(ticket_number)").order("created_at", { ascending: false }).limit(50),
      ]);
      setTickets(tRes.data || []);
      setDisputes(dRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");
  const openDisputes = disputes.filter(d => d.resolution_status === "open");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Customer Service & Disputes</h1>
        <p className="text-sm text-muted-foreground mt-1">Support tickets, dispute resolution, and service queue</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Tickets", value: tickets.length.toString(), icon: MessageSquare, accent: "text-primary bg-primary/10" },
          { title: "Open Tickets", value: openTickets.length.toString(), icon: MessageSquare, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Open Disputes", value: openDisputes.length.toString(), icon: AlertTriangle, accent: "text-destructive bg-destructive/10" },
          { title: "Total Disputes", value: disputes.length.toString(), icon: Users, accent: "text-blue-600 bg-blue-500/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold font-display">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tickets">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="tickets" className="text-xs">Ticket Inbox</TabsTrigger>
          <TabsTrigger value="disputes" className="text-xs">Dispute Center</TabsTrigger>
        </TabsList>

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
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Ticket</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Subject</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Category</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Priority</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                  </tr></thead>
                  <tbody>
                    {tickets.filter(t => !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_number?.toLowerCase().includes(search.toLowerCase())).map((t) => (
                      <tr key={t.id} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="py-1.5 px-1 font-mono text-[10px]">{t.ticket_number}</td>
                        <td className="py-1.5 px-1 font-medium truncate max-w-[150px]">{t.subject}</td>
                        <td className="py-1.5 px-1 text-muted-foreground">{t.category}</td>
                        <td className="py-1.5 px-1">
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                            t.priority === "urgent" ? "border-destructive/30 text-destructive" :
                            t.priority === "high" ? "border-amber-500/30 text-amber-600" : ""
                          )}>{t.priority}</Badge>
                        </td>
                        <td className="py-1.5 px-1">
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                            t.status === "open" ? "border-blue-500/30 text-blue-600" :
                            t.status === "in_progress" ? "border-amber-500/30 text-amber-600" :
                            t.status === "closed" ? "border-emerald-500/30 text-emerald-600" : ""
                          )}>{t.status}</Badge>
                        </td>
                        <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Dispute Center</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {disputes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No disputes filed.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Order</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Ticket</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {disputes.map((d) => (
                        <tr key={d.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-medium">{d.type}</td>
                          <td className="py-1.5 px-1 font-mono text-[10px]">{(d as any).orders?.order_number || "—"}</td>
                          <td className="py-1.5 px-1 font-mono text-[10px]">{(d as any).support_tickets?.ticket_number || "—"}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              d.resolution_status === "open" ? "border-amber-500/30 text-amber-600" :
                              d.resolution_status === "resolved" ? "border-emerald-500/30 text-emerald-600" : ""
                            )}>{d.resolution_status}</Badge>
                          </td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCCustomerService;
