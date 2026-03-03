import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import { Search, Download, Users, Tractor, ShoppingBag, Truck, Shield } from "lucide-react";

const MOCK_USERS = [
  { id: "1", name: "Maria Santos", email: "maria@farm.ph", type: "farmer", status: "active", kyc: "verified", region: "Baguio", created_at: "2025-11-15" },
  { id: "2", name: "Juan dela Cruz", email: "juan@buyer.ph", type: "buyer", status: "active", kyc: "verified", region: "Manila", created_at: "2025-12-01" },
  { id: "3", name: "Pedro Reyes", email: "pedro@driver.ph", type: "driver", status: "active", kyc: "pending", region: "Baguio", created_at: "2026-01-10" },
  { id: "4", name: "Ana Lim", email: "ana@buyer.ph", type: "buyer", status: "suspended", kyc: "unverified", region: "Cebu", created_at: "2026-01-20" },
  { id: "5", name: "Rosa Mendoza", email: "rosa@farm.ph", type: "farmer", status: "active", kyc: "verified", region: "La Trinidad", created_at: "2025-10-05" },
  { id: "6", name: "Ben Torres", email: "ben@driver.ph", type: "driver", status: "active", kyc: "verified", region: "Baguio", created_at: "2026-02-01" },
  { id: "7", name: "Lisa Gomez", email: "lisa@admin.ph", type: "admin", status: "active", kyc: "verified", region: "Manila", created_at: "2025-08-01" },
  { id: "8", name: "Carlo Tan", email: "carlo@buyer.ph", type: "buyer", status: "active", kyc: "verified", region: "Davao", created_at: "2026-02-14" },
];

const MOCK_DRIVERS = [
  { id: "3", name: "Pedro Reyes", vehicle: "Motorcycle", plate: "ABC-1234", availability: "available", deliveries: 142, rating: 4.8, zone: "Baguio Central" },
  { id: "6", name: "Ben Torres", vehicle: "Van", plate: "XYZ-5678", availability: "busy", deliveries: 89, rating: 4.6, zone: "La Trinidad" },
  { id: "9", name: "Mike Ramos", vehicle: "Truck", plate: "DEF-9012", availability: "offline", deliveries: 234, rating: 4.9, zone: "Baguio-Itogon" },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const UsersRolesSection = ({ openDrawer }: Props) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || u.type === typeFilter;
    return matchSearch && matchType;
  });

  const counts = { farmer: MOCK_USERS.filter(u => u.type === "farmer").length, buyer: MOCK_USERS.filter(u => u.type === "buyer").length, driver: MOCK_USERS.filter(u => u.type === "driver").length, admin: MOCK_USERS.filter(u => u.type === "admin").length };

  return (
    <div className="space-y-4">
      {/* Role count chips */}
      <div className="flex flex-wrap gap-2">
        <Button variant={typeFilter === "all" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setTypeFilter("all")}>
          <Users className="h-3.5 w-3.5" /> All ({MOCK_USERS.length})
        </Button>
        <Button variant={typeFilter === "farmer" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setTypeFilter("farmer")}>
          <Tractor className="h-3.5 w-3.5" /> Farmers ({counts.farmer})
        </Button>
        <Button variant={typeFilter === "buyer" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setTypeFilter("buyer")}>
          <ShoppingBag className="h-3.5 w-3.5" /> Buyers ({counts.buyer})
        </Button>
        <Button variant={typeFilter === "driver" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setTypeFilter("driver")}>
          <Truck className="h-3.5 w-3.5" /> Drivers ({counts.driver})
        </Button>
        <Button variant={typeFilter === "admin" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => setTypeFilter("admin")}>
          <Shield className="h-3.5 w-3.5" /> Admins ({counts.admin})
        </Button>
      </div>

      {/* Search + export */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="h-8">
          <TabsTrigger value="users" className="text-xs h-7">All Users</TabsTrigger>
          <TabsTrigger value="drivers" className="text-xs h-7">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-3">
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "type", label: "Type", render: (r) => <Badge variant="secondary" className="text-[10px]">{r.type}</Badge> },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "kyc", label: "KYC", render: (r) => <StatusChip status={r.kyc} /> },
              { key: "region", label: "Region" },
              { key: "created_at", label: "Joined" },
            ]}
            data={filtered}
            onRowClick={(row) => openDrawer("user", row)}
          />
        </TabsContent>

        <TabsContent value="drivers" className="mt-3">
          <DataTable
            columns={[
              { key: "name", label: "Driver" },
              { key: "vehicle", label: "Vehicle" },
              { key: "plate", label: "Plate" },
              { key: "availability", label: "Status", render: (r) => <StatusChip status={r.availability} /> },
              { key: "zone", label: "Zone" },
              { key: "deliveries", label: "Deliveries" },
              { key: "rating", label: "Rating", render: (r) => <span>⭐ {r.rating}</span> },
            ]}
            data={MOCK_DRIVERS}
            onRowClick={(row) => openDrawer("user", { ...row, type: "driver", email: `${row.name.toLowerCase().replace(" ", ".")}@terra.ph`, kyc: "verified", created_at: "2026-01-01" })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersRolesSection;
