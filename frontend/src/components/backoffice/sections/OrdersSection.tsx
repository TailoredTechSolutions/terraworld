import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import { Search, Download, Filter } from "lucide-react";

const MOCK_ORDERS = [
  { id: "1", order_number: "ORD-2026-089", buyer: "Juan dela Cruz", farmer: "Aling Rosa Farm", total: 1850, subtotal: 1500, platform_fee: 225, tax: 60, delivery_fee: 65, status: "pending", payment_status: "paid", delivery_status: "unassigned", zone: "Baguio", date: "2026-03-02" },
  { id: "2", order_number: "ORD-2026-088", buyer: "Carlo Tan", farmer: "Kuya Ben Farm", total: 3200, subtotal: 2600, platform_fee: 390, tax: 104, delivery_fee: 106, status: "preparing", payment_status: "paid", delivery_status: "assigned", zone: "La Trinidad", date: "2026-03-02" },
  { id: "3", order_number: "ORD-2026-087", buyer: "Lisa Gomez", farmer: "Rosa Mendoza", total: 950, subtotal: 750, platform_fee: 112, tax: 30, delivery_fee: 58, status: "in_transit", payment_status: "paid", delivery_status: "in_transit", zone: "Baguio", date: "2026-03-01" },
  { id: "4", order_number: "ORD-2026-086", buyer: "Ana Lim", farmer: "Maria Santos", total: 2100, subtotal: 1700, platform_fee: 255, tax: 68, delivery_fee: 77, status: "delivered", payment_status: "paid", delivery_status: "delivered", zone: "Cebu", date: "2026-03-01" },
  { id: "5", order_number: "ORD-2026-085", buyer: "Mike Santos", farmer: "Pedro Farm", total: 680, subtotal: 540, platform_fee: 81, tax: 22, delivery_fee: 37, status: "cancelled", payment_status: "refunded", delivery_status: "cancelled", zone: "Manila", date: "2026-02-28" },
  { id: "6", order_number: "ORD-2026-084", buyer: "Joy Reyes", farmer: "Aling Rosa Farm", total: 1450, subtotal: 1150, platform_fee: 173, tax: 46, delivery_fee: 81, status: "delivered", payment_status: "paid", delivery_status: "delivered", zone: "Baguio", date: "2026-02-28" },
];

const statusFilters = ["all", "pending", "preparing", "in_transit", "delivered", "cancelled"];

interface Props { openDrawer: (type: string, data: any) => void; }

const OrdersSection = ({ openDrawer }: Props) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK_ORDERS.filter(o => {
    const matchSearch = !search || o.order_number.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {statusFilters.map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" className="h-7 text-xs capitalize" onClick={() => setStatusFilter(s)}>
            {s === "all" ? "All" : s.replace(/_/g, " ")}
            {s !== "all" && <span className="ml-1 opacity-60">({MOCK_ORDERS.filter(o => o.status === s).length})</span>}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
      </div>

      <DataTable
        columns={[
          { key: "order_number", label: "Order #" },
          { key: "buyer", label: "Buyer" },
          { key: "farmer", label: "Farmer" },
          { key: "total", label: "Total", render: (r) => `₱${r.total.toLocaleString()}` },
          { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          { key: "payment_status", label: "Payment", render: (r) => <StatusChip status={r.payment_status} /> },
          { key: "delivery_status", label: "Delivery", render: (r) => <StatusChip status={r.delivery_status} /> },
          { key: "zone", label: "Zone" },
          { key: "date", label: "Date" },
        ]}
        data={filtered}
        onRowClick={(row) => openDrawer("order", row)}
      />
    </div>
  );
};

export default OrdersSection;
