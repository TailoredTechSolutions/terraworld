import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Truck, MapPin, Phone, User, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

interface FarmerDeliveryPanelProps {
  farmerId: string;
}

const FarmerDeliveryPanel = ({ farmerId }: FarmerDeliveryPanelProps) => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["farmer-deliveries", farmerId],
    queryFn: async () => {
      // Get orders for this farmer, then get their delivery bookings
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

      // Merge booking data with order info
      return (deliveryBookings || []).map(b => ({
        ...b,
        order: orders.find(o => o.id === b.order_id),
      }));
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const statusColors: Record<string, string> = {
    pending: "secondary",
    confirmed: "default",
    in_transit: "default",
    completed: "default",
    cancelled: "destructive",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-5 w-5" /> Delivery & Logistics
          </CardTitle>
          <CardDescription>Track pickups, driver assignments, and delivery status for your orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {!bookings?.length ? (
            <p className="text-center text-muted-foreground py-8">No active deliveries. Delivery bookings appear when orders are dispatched.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <Card key={b.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{b.order?.order_number || "Order"}</p>
                      <p className="text-xs text-muted-foreground">{b.order?.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase">{b.provider_type}</Badge>
                      <Badge variant={statusColors[b.booking_status] as any || "secondary"}>{b.booking_status}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {/* Pickup */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</p>
                      <p>{b.pickup_address || "Farm location"}</p>
                    </div>
                    {/* Delivery */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Delivery</p>
                      <p>{b.delivery_address || b.order?.delivery_address || "—"}</p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {b.driver_name && (
                    <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg text-sm">
                      <div className="flex items-center gap-1"><User className="h-3 w-3" /> {b.driver_name}</div>
                      {b.driver_phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {b.driver_phone}</div>}
                      {b.driver_plate && <div className="text-muted-foreground">{b.driver_plate}</div>}
                    </div>
                  )}

                  {/* ETA & Fee */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {b.estimated_eta_minutes && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ETA: {b.estimated_eta_minutes} min</span>
                    )}
                    {b.distance_km && <span>{Number(b.distance_km).toFixed(1)} km</span>}
                    <span>Fee: ₱{Number(b.final_fee || b.estimated_fee).toLocaleString()}</span>
                    {b.completed_at && (
                      <span className="flex items-center gap-1 text-primary"><CheckCircle className="h-3 w-3" /> {format(new Date(b.completed_at), "MMM d, h:mm a")}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerDeliveryPanel;
