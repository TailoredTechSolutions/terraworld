import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "../DataTable";
import { Search, Download, Filter, Eye } from "lucide-react";

const MOCK_AUDIT = [
  { id: "1", actor: "Lisa Gomez", action: "approve", entity_type: "product", entity_id: "PRD-034", reason: "Quality verified", timestamp: "2026-03-02 15:30", ip: "192.168.1.1", before: { status: "pending_approval" }, after: { status: "approved" } },
  { id: "2", actor: "Andrew Gwaltney", action: "update", entity_type: "user", entity_id: "USR-192", reason: "KYC documents verified", timestamp: "2026-03-02 14:15", ip: "10.0.0.5", before: { kyc_status: "pending" }, after: { kyc_status: "verified" } },
  { id: "3", actor: "System", action: "create", entity_type: "payout_run", entity_id: "PR-2026-012", reason: null, timestamp: "2026-03-01 00:00", ip: null, before: null, after: { status: "draft", total: 142500 } },
  { id: "4", actor: "Lisa Gomez", action: "approve", entity_type: "withdrawal", entity_id: "WD-A1B2C3D4", reason: "Verified account details", timestamp: "2026-03-01 11:20", ip: "192.168.1.1", before: { status: "reviewing" }, after: { status: "approved" } },
  { id: "5", actor: "Andrew Gwaltney", action: "manual_adjustment", entity_type: "wallet", entity_id: "WAL-0042", reason: "Compensation for delayed delivery", timestamp: "2026-02-28 16:45", ip: "10.0.0.5", before: { balance: 1500 }, after: { balance: 1650 } },
  { id: "6", actor: "System", action: "run", entity_type: "commission_run", entity_id: "CR-2026-011", reason: null, timestamp: "2026-02-28 00:05", ip: null, before: null, after: { status: "completed", total_commissions: 12500 } },
  { id: "7", actor: "Esteban Robles", action: "reject", entity_type: "product", entity_id: "PRD-041", reason: "Photo quality too low", timestamp: "2026-02-27 13:00", ip: "10.0.0.8", before: { status: "pending_approval" }, after: { status: "rejected" } },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const ComplianceAuditSection = ({ openDrawer }: Props) => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const actions = [...new Set(MOCK_AUDIT.map(a => a.action))];

  const filtered = MOCK_AUDIT.filter(a => {
    const matchSearch = !search || a.actor.toLowerCase().includes(search.toLowerCase()) || a.entity_type.includes(search.toLowerCase()) || a.entity_id.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || a.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-border/50 bg-muted/20 text-xs text-muted-foreground">
        <p className="font-medium text-foreground text-sm">Immutable Audit Trail</p>
        <p className="mt-1">All administrative actions are permanently logged. No hard deletes are permitted for financial data. Every entry includes actor, timestamp, before/after state, and reason.</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search actor, entity…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <div className="flex gap-1">
          <Button variant={actionFilter === "all" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setActionFilter("all")}>All</Button>
          {actions.map(a => (
            <Button key={a} variant={actionFilter === a ? "default" : "outline"} size="sm" className="h-7 text-xs capitalize" onClick={() => setActionFilter(a)}>
              {a.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
      </div>

      <DataTable
        columns={[
          { key: "timestamp", label: "Timestamp" },
          { key: "actor", label: "Actor" },
          { key: "action", label: "Action", render: (r) => <Badge variant="outline" className="text-[10px] capitalize">{r.action.replace(/_/g, " ")}</Badge> },
          { key: "entity_type", label: "Entity" },
          { key: "entity_id", label: "Entity ID" },
          { key: "reason", label: "Reason", render: (r) => r.reason || <span className="text-muted-foreground">—</span> },
          { key: "view", label: "", render: (r) => (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openDrawer("audit", r); }}>
              <Eye className="h-3 w-3" />
            </Button>
          )},
        ]}
        data={filtered}
        onRowClick={(row) => openDrawer("audit", row)}
      />
    </div>
  );
};

export default ComplianceAuditSection;
