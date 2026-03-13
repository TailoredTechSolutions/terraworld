import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusChip from "@/components/backoffice/StatusChip";
import { Loader2, Truck } from "lucide-react";
import { format } from "date-fns";

interface FarmerDeliveryPanelProps {
  farmerId: string;
}

const FarmerDeliveryPanel = ({ farmerId }: FarmerDeliveryPanelProps) => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["farmer-deliveries", farmerId],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, delivery_address, status")
        .eq("farmer_id", farmerId)
        .in("status", ["preparing", "in_transit", "delivered"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (!orders?.length) return [];

      const orderIds = orders.map(o => o.id);
      const { data: deliveryBookings } = await supabase
        .from("delivery_bookings")
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false });

      return (deliveryBookings || []).map(b => ({
        ...b,
        order: orders.find(o => o.id === b.order_id),
      }));
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" /> Delivery & Logistics
          </CardTitle>
          <CardDescription>Track pickups, driver assignments, and delivery status for your orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {!bookings?.length ? (
            <div className="text-center py-8">
              <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No active deliveries</p>
              <p className="text-xs text-muted-foreground mt-1">Delivery bookings appear when orders are dispatched</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{b.order?.order_number || "—"}</p>
                          <p className="text-xs text-muted-foreground">{b.order?.customer_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {b.driver_name ? (
                          <div>
                            <p className="text-sm font-medium">{b.driver_name}</p>
                            {b.driver_phone && <p className="text-xs text-muted-foreground">{b.driver_phone}</p>}
                            {b.driver_plate && <p className="text-xs text-muted-foreground">{b.driver_plate}</p>}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Awaiting assignment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={b.provider_type} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {b.estimated_eta_minutes ? `${b.estimated_eta_minutes} min` : "—"}
                        {b.distance_km && <span className="text-xs text-muted-foreground block">{Number(b.distance_km).toFixed(1)} km</span>}
                      </TableCell>
                      <TableCell className="text-sm">₱{Number(b.final_fee || b.estimated_fee).toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusChip status={b.booking_status} />
                        {b.completed_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(b.completed_at), "MMM d, h:mm a")}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerDeliveryPanel;
