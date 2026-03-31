import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Truck, Loader2, Shield, Package, Clock,
  CheckCircle2, Route, MapPin, AlertTriangle, BarChart3
} from "lucide-react";

const BCLogistics = () => {
  const { isAnyAdmin } = useUserRoles();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["bc-log-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("delivery_bookings")
        .select("id, order_id, provider_type, booking_status, estimated_fee, final_fee, driver_name, driver_phone, driver_plate, distance_km, estimated_eta_minutes, created_at, pickup_address, delivery_address, completed_at")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["bc-log-drivers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("drivers")
        .select("id, name, email, phone, vehicle, status, rating, deliveries_count, total_earnings, license_plate, current_location")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["bc-log-zones"],
    queryFn: async () => {
      const { data } = await supabase.from("delivery_zones").select("*").order("min_distance_km");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: perfDaily = [] } = useQuery({
    queryKey: ["bc-log-perf"],
    queryFn: async () => {
      const { data } = await supabase.from("driver_performance_daily").select("*").order("stat_date", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": case "delivered": return "border-emerald-500/30 text-emerald-600";
      case "confirmed": case "in_transit": case "online": case "delivering": return "border-blue-500/30 text-blue-600";
      case "pending": return "border-amber-500/30 text-amber-600";
      case "cancelled": case "failed": return "border-destructive/30 text-destructive";
      default: return "";
    }
  };

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const unassigned = bookings.filter(b => b.booking_status === "pending" && !b.driver_name);
  const activeDeliveries = bookings.filter(b => ["pending", "confirmed", "in_transit"].includes(b.booking_status)).length;
  const completedDeliveries = bookings.filter(b => b.booking_status === "completed").length;
  const onlineDrivers = drivers.filter(d => d.status === "online" || d.status === "delivering").length;
  const failedDeliveries = bookings.filter(b => b.booking_status === "cancelled").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2"><Truck className="h-6 w-6 text-primary" /> Logistics & Delivery</h1>
        <p className="text-sm text-muted-foreground mt-1">Drivers, dispatch, route tracking, confirmations, and performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Package, label: "Active", value: activeDeliveries.toString(), accent: "text-blue-500" },
          { icon: CheckCircle2, label: "Completed", value: completedDeliveries.toString(), accent: "text-emerald-500" },
          { icon: AlertTriangle, label: "Unassigned", value: unassigned.length.toString(), accent: "text-amber-500" },
          { icon: Truck, label: "Online Drivers", value: `${onlineDrivers}/${drivers.length}`, accent: "text-primary" },
          { icon: AlertTriangle, label: "Failed", value: failedDeliveries.toString(), accent: "text-destructive" },
        ].map(k => (
          <Card key={k.label} className="border-border/40">
            <CardContent className="p-3 text-center">
              <k.icon className={cn("h-4 w-4 mx-auto mb-1", k.accent)} />
              <p className="text-sm font-bold font-display">{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dispatch" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-9">
          <TabsTrigger value="dispatch" className="text-xs">Dispatch</TabsTrigger>
          <TabsTrigger value="drivers" className="text-xs">Drivers</TabsTrigger>
          <TabsTrigger value="routes" className="text-xs">Route Tracking</TabsTrigger>
          <TabsTrigger value="confirmations" className="text-xs">Confirmations</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
        </TabsList>

        {/* Dispatch Board */}
        <TabsContent value="dispatch">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Dispatch Board</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {bookingsLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Provider</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Driver</TableHead>
                    <TableHead className="text-xs">Pickup</TableHead>
                    <TableHead className="text-xs">Delivery</TableHead>
                    <TableHead className="text-xs">Distance</TableHead>
                    <TableHead className="text-xs">ETA</TableHead>
                    <TableHead className="text-xs text-right">Fee</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {bookings.slice(0, 50).map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="text-xs font-medium uppercase">{b.provider_type}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", statusColor(b.booking_status))}>{b.booking_status}</Badge></TableCell>
                        <TableCell className="text-xs">{b.driver_name || <span className="text-amber-600 font-medium">Unassigned</span>}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[100px]">{b.pickup_address || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[100px]">{b.delivery_address || "—"}</TableCell>
                        <TableCell className="text-xs">{b.distance_km ? `${Number(b.distance_km).toFixed(1)} km` : "—"}</TableCell>
                        <TableCell className="text-xs">{b.estimated_eta_minutes ? `${b.estimated_eta_minutes} min` : "—"}</TableCell>
                        <TableCell className="text-right text-xs font-semibold">₱{Number(b.final_fee || b.estimated_fee).toLocaleString()}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers */}
        <TabsContent value="drivers">
          {driversLoading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
            <Card className="border-border/40">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Vehicle</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Plate</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Deliveries</TableHead>
                  <TableHead className="text-xs text-right">Earnings</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow key={d.id}>
                      <TableCell><p className="text-sm font-medium">{d.name}</p><p className="text-[10px] text-muted-foreground">{d.email}</p></TableCell>
                      <TableCell className="text-xs capitalize">{d.vehicle}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-[10px]", statusColor(d.status || "offline"))}>{d.status}</Badge></TableCell>
                      <TableCell className="text-xs font-mono">{d.license_plate}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[80px]">{d.current_location || "—"}</TableCell>
                      <TableCell className="text-xs">⭐ {d.rating}</TableCell>
                      <TableCell className="text-xs">{d.deliveries_count}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">₱{Number(d.total_earnings).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Route Tracking */}
        <TabsContent value="routes">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Route className="h-4 w-4 text-primary" /> Route Tracking</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Delivery</TableHead>
                  <TableHead className="text-xs">Driver</TableHead>
                  <TableHead className="text-xs">Distance</TableHead>
                  <TableHead className="text-xs">ETA</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Pickup → Drop</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {bookings.filter(b => ["confirmed", "in_transit"].includes(b.booking_status)).map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="text-[10px] font-mono">{b.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{b.driver_name || "—"}</TableCell>
                      <TableCell className="text-xs">{b.distance_km ? `${Number(b.distance_km).toFixed(1)} km` : "—"}</TableCell>
                      <TableCell className="text-xs">{b.estimated_eta_minutes ? `${b.estimated_eta_minutes} min` : "—"}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-[10px]", statusColor(b.booking_status))}>{b.booking_status}</Badge></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground truncate max-w-[150px]">{b.pickup_address || "?"} → {b.delivery_address || "?"}</TableCell>
                    </TableRow>
                  ))}
                  {bookings.filter(b => ["confirmed", "in_transit"].includes(b.booking_status)).length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">No active routes.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Confirmations */}
        <TabsContent value="confirmations">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Delivery Confirmations</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Delivery</TableHead>
                  <TableHead className="text-xs">Driver</TableHead>
                  <TableHead className="text-xs">Provider</TableHead>
                  <TableHead className="text-xs text-right">Final Fee</TableHead>
                  <TableHead className="text-xs">Completed</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {bookings.filter(b => b.booking_status === "completed").slice(0, 30).map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="text-[10px] font-mono">{b.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{b.driver_name || "—"}</TableCell>
                      <TableCell className="text-xs uppercase">{b.provider_type}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">₱{Number(b.final_fee || b.estimated_fee).toLocaleString()}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{b.completed_at ? new Date(b.completed_at).toLocaleString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {bookings.filter(b => b.booking_status === "completed").length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">No completed deliveries.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Performance */}
        <TabsContent value="performance">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Driver Performance</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {perfDaily.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground text-center py-2">No daily performance data yet. Summary from driver records:</p>
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead className="text-xs">Driver</TableHead>
                      <TableHead className="text-xs text-right">Total Deliveries</TableHead>
                      <TableHead className="text-xs text-right">Total Earnings</TableHead>
                      <TableHead className="text-xs text-right">Rating</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {drivers.map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="text-xs font-medium">{d.name}</TableCell>
                          <TableCell className="text-right text-xs">{d.deliveries_count}</TableCell>
                          <TableCell className="text-right text-xs font-semibold">₱{Number(d.total_earnings).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs">⭐ {d.rating}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs text-right">Assigned</TableHead>
                    <TableHead className="text-xs text-right">Delivered</TableHead>
                    <TableHead className="text-xs text-right">Failed</TableHead>
                    <TableHead className="text-xs text-right">Avg Min</TableHead>
                    <TableHead className="text-xs text-right">Completion %</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {perfDaily.map((p: any) => {
                      const completion = p.assigned_count > 0 ? ((p.delivered_count / p.assigned_count) * 100).toFixed(0) : "0";
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{p.stat_date}</TableCell>
                          <TableCell className="text-right text-xs">{p.assigned_count}</TableCell>
                          <TableCell className="text-right text-xs">{p.delivered_count}</TableCell>
                          <TableCell className="text-right text-xs text-destructive">{p.failed_count}</TableCell>
                          <TableCell className="text-right text-xs">{p.avg_delivery_minutes ? `${Number(p.avg_delivery_minutes).toFixed(0)}` : "—"}</TableCell>
                          <TableCell className="text-right text-xs font-medium">{completion}%</TableCell>
                        </TableRow>
                      );
                    })}
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

export default BCLogistics;
