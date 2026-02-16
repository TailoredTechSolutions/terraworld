import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  XCircle,
  Search,
  FileText,
  MapPin,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_transit: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const ORDER_STEPS = [
  { key: "pending", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Clock },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const stepIndex = (status: string) => {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

const BuyerOrdersPanel = ({ userId }: { userId: string }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["buyer-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", (await supabase.auth.getUser()).data.user?.email)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch order items for expanded order
  const { data: orderItems } = useQuery({
    queryKey: ["order-items", expandedOrderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", expandedOrderId!);
      return data || [];
    },
    enabled: !!expandedOrderId,
  });

  // Fetch delivery booking for expanded order
  const { data: deliveryBooking } = useQuery({
    queryKey: ["delivery-booking", expandedOrderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("delivery_bookings")
        .select("*")
        .eq("order_id", expandedOrderId!)
        .maybeSingle();
      return data;
    },
    enabled: !!expandedOrderId,
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <Package className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            No orders yet. Start shopping to see your orders here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {filteredOrders?.length} of {orders.length} orders
      </p>

      {filteredOrders?.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const currentStep = stepIndex(order.status || "pending");
        const isCancelled = order.status === "cancelled";

        return (
          <Collapsible
            key={order.id}
            open={isExpanded}
            onOpenChange={(open) => setExpandedOrderId(open ? order.id : null)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base font-mono">
                        {order.order_number}
                      </CardTitle>
                      <Badge className={statusColors[order.status || "pending"]}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">
                        ₱{Number(order.total).toLocaleString()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>{format(new Date(order.created_at), "MMM d, yyyy h:mm a")}</span>
                    <span>{order.items_count} items</span>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-5">
                  <Separator />

                  {/* Status Timeline */}
                  {!isCancelled && (
                    <div className="py-2">
                      <div className="flex items-center justify-between max-w-lg mx-auto">
                        {ORDER_STEPS.map((step, idx) => {
                          const StepIcon = step.icon;
                          const isCompleted = idx <= currentStep;
                          const isCurrent = idx === currentStep;
                          return (
                            <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                                >
                                  {isCompleted && idx < currentStep ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : isCurrent ? (
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground animate-pulse" />
                                  ) : (
                                    <StepIcon className="h-4 w-4" />
                                  )}
                                </div>
                                <span
                                  className={`text-xs mt-1 ${
                                    isCompleted ? "text-primary font-medium" : "text-muted-foreground"
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                              {idx < ORDER_STEPS.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 mx-2 mt-[-16px] ${
                                    idx < currentStep ? "bg-primary" : "bg-border"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <XCircle className="h-4 w-4" />
                      This order was cancelled.
                    </div>
                  )}

                  {/* Order Items */}
                  {orderItems && orderItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" /> Items
                      </h4>
                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm py-1.5 border-b border-border last:border-0"
                          >
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                            </div>
                            <span className="font-medium">
                              ₱{Number(item.total_price).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Invoice Breakdown */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Invoice Breakdown
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₱{Number(order.subtotal).toLocaleString()}</span>
                      </div>
                      {Number(order.terra_fee) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Platform Fee</span>
                          <span>₱{Number(order.terra_fee).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>₱{Number(order.delivery_fee).toLocaleString()}</span>
                      </div>
                      {Number(order.discount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₱{Number(order.discount).toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₱{Number(order.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Delivery Address
                      </h4>
                      <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    </div>
                    {deliveryBooking && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5" /> Driver Info
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          {deliveryBooking.driver_name && <p>Driver: {deliveryBooking.driver_name}</p>}
                          {deliveryBooking.driver_phone && <p>Phone: {deliveryBooking.driver_phone}</p>}
                          {deliveryBooking.driver_plate && <p>Plate: {deliveryBooking.driver_plate}</p>}
                          {deliveryBooking.estimated_eta_minutes && (
                            <p>ETA: ~{deliveryBooking.estimated_eta_minutes} min</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment */}
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" /> Payment
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.delivery_provider || "Standard"} delivery
                      {order.payment_fee > 0 && ` • Payment fee: ₱${Number(order.payment_fee).toLocaleString()}`}
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default BuyerOrdersPanel;
