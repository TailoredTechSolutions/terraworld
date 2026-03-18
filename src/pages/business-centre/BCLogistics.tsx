import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck, MapPin, Loader2, Shield, Package, Clock,
  CheckCircle2, AlertTriangle, Route
} from "lucide-react";

const BCLogistics = () => {
  const { isAnyAdmin } = useUserRoles();

  // Delivery bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bc-logistics-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("delivery_bookings")
        .select("id, order_id, provider_type, booking_status, estimated_fee, final_fee, driver_name, driver_phone, distance_km, estimated_eta_minutes, created_at, pickup_address, delivery_address")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  // Drivers
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["bc-logistics-drivers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("drivers")
        .select("id, name, email, phone, vehicle, status, rating, deliveries_count, total_earnings, license_plate")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  // Delivery zones
  const { data: zones = [] } = useQuery({
    queryKey: ["bc-logistics-zones"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_zones").select("*").order("min_distance_km");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "confirmed": case "in_transit": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!isAnyAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
      </div>
    );
  }

  const activeDeliveries = bookings.filter(b => ["pending", "confirmed", "in_transit"].includes(b.booking_status)).length;
  const completedDeliveries = bookings.filter(b => b.booking_status === "completed").length;
  const onlineDrivers = drivers.filter(d => d.status === "available" || d.status === "busy").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          Logistics & Delivery
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor deliveries, drivers, and delivery zones
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Package, label: "Active Deliveries", value: activeDeliveries.toString(), accent: "text-blue-500" },
          { icon: CheckCircle2, label: "Completed", value: completedDeliveries.toString(), accent: "text-emerald-500" },
          { icon: Truck, label: "Total Drivers", value: drivers.length.toString(), accent: "text-primary" },
          { icon: Route, label: "Online Drivers", value: onlineDrivers.toString(), accent: "text-amber-500" },
        ].map(k => (
          <Card key={k.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <k.icon className={`h-5 w-5 mx-auto mb-1 ${k.accent}`} />
              <p className="text-lg font-bold font-display">{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="deliveries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries">
          {bookingsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 50).map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs font-medium uppercase">{b.provider_type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusColor(b.booking_status)}`}>
                          {b.booking_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{b.driver_name || "—"}</TableCell>
                      <TableCell className="text-xs">{b.distance_km ? `${Number(b.distance_km).toFixed(1)} km` : "—"}</TableCell>
                      <TableCell className="text-xs">{b.estimated_eta_minutes ? `${b.estimated_eta_minutes} min` : "—"}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">₱{Number(b.final_fee || b.estimated_fee).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drivers">
          {driversLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium text-sm">{d.name}</TableCell>
                      <TableCell className="text-xs capitalize">{d.vehicle}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${
                          d.status === "available" ? "text-emerald-600" :
                          d.status === "busy" ? "text-blue-600" : "text-muted-foreground"
                        }`}>
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{d.license_plate}</TableCell>
                      <TableCell className="text-xs">⭐ {d.rating}</TableCell>
                      <TableCell className="text-xs">{d.deliveries_count}</TableCell>
                      <TableCell className="text-right font-semibold text-xs">₱{Number(d.total_earnings).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="zones">
          <Card className="border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Distance Range</TableHead>
                  <TableHead>Base Fee</TableHead>
                  <TableHead>Per KM Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((z: any) => (
                  <TableRow key={z.id}>
                    <TableCell className="font-medium text-sm">{z.zone_name}</TableCell>
                    <TableCell className="text-xs">{z.min_distance_km} – {z.max_distance_km} km</TableCell>
                    <TableCell className="text-xs">₱{Number(z.base_fee).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">₱{Number(z.per_km_rate).toFixed(2)}/km</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${z.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {z.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCLogistics;
