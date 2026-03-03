import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import KPICard from "../KPICard";
import { Search, Ticket, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const MOCK_TICKETS = [
  { id: "1", ticket_number: "TKT-2026-00142", subject: "Order not delivered after 2 days", user: "Ana Lim", category: "delivery", priority: "high", status: "open", assigned: "Support Team", created: "2026-03-02", sla: "4h remaining",
    messages: [
      { sender: "user", text: "My order ORD-2026-082 hasn't arrived. It's been 2 days already.", time: "Mar 2, 10:00" },
      { sender: "admin", text: "We're looking into this. The delivery was attempted but failed. We're reassigning a driver.", time: "Mar 2, 11:30" },
    ]},
  { id: "2", ticket_number: "TKT-2026-00141", subject: "Received wrong product", user: "Carlo Tan", category: "dispute", priority: "medium", status: "open", assigned: "Lisa G.", created: "2026-03-01", sla: "8h remaining",
    messages: [
      { sender: "user", text: "I ordered Baguio Lettuce but received Pechay instead.", time: "Mar 1, 15:00" },
    ]},
  { id: "3", ticket_number: "TKT-2026-00140", subject: "Refund request for cancelled order", user: "Mike Santos", category: "refund", priority: "low", status: "resolved", assigned: "Lisa G.", created: "2026-02-28", sla: "Resolved",
    messages: [
      { sender: "user", text: "Please process refund for ORD-2026-085", time: "Feb 28, 09:00" },
      { sender: "admin", text: "Refund of ₱680 has been processed to your GCash account.", time: "Feb 28, 14:00" },
    ]},
  { id: "4", ticket_number: "TKT-2026-00139", subject: "Cannot upload product photos", user: "Rosa Mendoza", category: "support", priority: "low", status: "closed", assigned: "System", created: "2026-02-27", sla: "Closed",
    messages: [] },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const SupportDisputesSection = ({ openDrawer }: Props) => {
  const [search, setSearch] = useState("");

  const openTickets = MOCK_TICKETS.filter(t => t.status === "open").length;
  const urgentTickets = MOCK_TICKETS.filter(t => t.priority === "high" && t.status === "open").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon={Ticket} title="Open Tickets" value={openTickets.toString()} change={`${urgentTickets} urgent`} changeType={urgentTickets > 0 ? "down" : "neutral"} />
        <KPICard icon={Clock} title="Avg Resolution" value="6.2h" change="-1.5h vs last week" changeType="up" />
        <KPICard icon={CheckCircle} title="Resolved (30d)" value="87" change="94% satisfaction" changeType="up" />
        <KPICard icon={AlertTriangle} title="SLA Breaches" value="2" change="This month" changeType="down" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
      </div>

      <DataTable
        columns={[
          { key: "ticket_number", label: "Ticket #" },
          { key: "subject", label: "Subject", className: "max-w-[200px] truncate" },
          { key: "user", label: "User" },
          { key: "category", label: "Category" },
          { key: "priority", label: "Priority", render: (r) => (
            <Badge variant={r.priority === "high" ? "destructive" : r.priority === "medium" ? "default" : "secondary"} className="text-[10px]">{r.priority}</Badge>
          )},
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          { key: "assigned", label: "Assigned" },
          { key: "sla", label: "SLA" },
        ]}
        data={MOCK_TICKETS.filter(t => !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticket_number.includes(search))}
        onRowClick={(row) => openDrawer("ticket", row)}
      />
    </div>
  );
};

export default SupportDisputesSection;
