import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTable from "../DataTable";
import StatusChip from "../StatusChip";
import { Truck, Clock, MapPin, CheckCircle } from "lucide-react";
import KPICard from "../KPICard";

const MOCK_DELIVERIES = [
  { id: "1", order: "ORD-2026-089", driver: "—", status: "unassigned", pickup: "Aling Rosa Farm, Baguio", dropoff: "Session Rd, Baguio", eta: "—", sla: "2h remaining" },
  { id: "2", order: "ORD-2026-088", driver: "Pedro Reyes", status: "assigned", pickup: "Kuya Ben Farm, La Trinidad", dropoff: "Magsaysay Ave, Baguio", eta: "45 min", sla: "On time" },
  { id: "3", order: "ORD-2026-087", driver: "Ben Torres", status: "in_transit", pickup: "Rosa Mendoza, Baguio", dropoff: "Burnham Park, Baguio", eta: "15 min", sla: "On time" },
  { id: "4", order: "ORD-2026-086", driver: "Mike Ramos", status: "delivered", pickup: "Maria Santos, Cebu", dropoff: "IT Park, Cebu", eta: "—", sla: "Delivered" },
];

const AVAILABLE_DRIVERS = [
  { name: "Pedro Reyes", vehicle: "Motorcycle", zone: "Baguio Central", rating: 4.8 },
  { name: "Grace Lim", vehicle: "Van", zone: "La Trinidad", rating: 4.7 },
];

interface Props { openDrawer: (type: string, data: any) => void; }

const LogisticsSection = ({ openDrawer }: Props) => {
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard icon={Truck} title="Active Deliveries" value="8" change="3 in transit" changeType="neutral" />
        <KPICard icon={Clock} title="Avg Delivery Time" value="48 min" change="-5 min vs last week" changeType="up" />
        <KPICard icon={MapPin} title="Unassigned" value="2" change="Needs attention" changeType="down" />
        <KPICard icon={CheckCircle} title="Success Rate" value="96.2%" change="+1.1%" changeType="up" />
      </div>

      {/* Dispatch Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold mb-2">Delivery Board</h3>
          <DataTable
            columns={[
              { key: "order", label: "Order" },
              { key: "driver", label: "Driver" },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "pickup", label: "Pickup", className: "max-w-[140px] truncate" },
              { key: "dropoff", label: "Dropoff", className: "max-w-[140px] truncate" },
              { key: "eta", label: "ETA" },
              { key: "sla", label: "SLA" },
            ]}
            data={MOCK_DELIVERIES}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Available Drivers</h3>
          <div className="space-y-2">
            {AVAILABLE_DRIVERS.map((d, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-card/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">{d.vehicle} · {d.zone} · ⭐ {d.rating}</p>
                  </div>
                  <Button size="sm" className="h-7 text-xs">Assign</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsSection;
