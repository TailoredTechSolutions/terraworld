import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusChip from "@/components/backoffice/StatusChip";
import KPICard from "@/components/backoffice/KPICard";
import {
  ShoppingBag, MoreHorizontal, Eye, XCircle, Truck, Clock,
  Package, User, Phone, MapPin, Loader2, RefreshCw, CheckCircle,
} from "lucide-react";
import type { Tables, Enums, Json } from "@/integrations/supabase/types";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  farmerId?: string;
  farmName?: string;
}

type Order = Tables<"orders"> & {
  drivers?: { name: string } | null;
};

type OrderStatus = Enums<"order_status">;

interface FarmerOrdersPanelProps {
  farmerId: string;
}

const parseOrderItems = (items: Json): OrderItem[] => {
  if (!items) return [];
  if (Array.isArray(items)) return items as unknown as OrderItem[];
  return [];
};

const FarmerOrdersPanel = ({ farmerId }: FarmerOrdersPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["farmer-orders", farmerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, drivers(name)")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!farmerId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-orders", farmerId] });
      toast({ title: "Status Updated", description: "Order status has been updated successfully." });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const inTransitCount = orders.filter((o) => o.status === "in_transit").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Stats — shared KPICard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="Pending" value={pendingCount} icon={Clock} />
        <KPICard title="Preparing" value={preparingCount} icon={Package} />
        <KPICard title="In Transit" value={inTransitCount} icon={Truck} />
        <KPICard title="Delivered" value={deliveredCount} icon={CheckCircle} />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Incoming Orders
              </CardTitle>
              <CardDescription>
                Manage orders for your products ({orders.length} total)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No orders found</p>
              <p className="text-xs text-muted-foreground mt-1">Orders for your products will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.items_count} items</TableCell>
                      <TableCell className="font-medium">₱{Number(order.total).toLocaleString()}</TableCell>
                      <TableCell>
                        {order.drivers?.name || (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusChip status={order.status || "pending"} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {order.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, "preparing")} className="text-primary">
                                <Package className="h-4 w-4 mr-2" /> Start Preparing
                              </DropdownMenuItem>
                            )}
                            {order.status === "preparing" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, "in_transit")} className="text-accent">
                                <Truck className="h-4 w-4 mr-2" /> Mark Ready for Pickup
                              </DropdownMenuItem>
                            )}
                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelled")} className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" /> Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status</span>
                <StatusChip status={selectedOrder.status || "pending"} />
              </div>

              <Card className="p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Customer Details
                </h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" /> {selectedOrder.customer_phone}
                  </p>
                  {selectedOrder.customer_email && (
                    <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                  )}
                </div>
              </Card>

              <Card className="p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </h4>
                <p className="text-sm text-muted-foreground">{selectedOrder.delivery_address}</p>
                {selectedOrder.notes && (
                  <p className="text-sm text-muted-foreground italic">Note: {selectedOrder.notes}</p>
                )}
              </Card>

              <Card className="p-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Order Items
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parseOrderItems(selectedOrder.items).length > 0 ? (
                    parseOrderItems(selectedOrder.items).map((item, index) => (
                      <div key={item.id || index} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × ₱{Number(item.price).toLocaleString()} / {item.unit}
                          </p>
                        </div>
                        <p className="font-medium text-sm">₱{(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No item details available</p>
                  )}
                </div>
                
                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₱{Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₱{Number(selectedOrder.delivery_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t">
                    <span>Total</span>
                    <span className="text-primary">₱{Number(selectedOrder.total).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1 mt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Your Earnings</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Farmer Price</span>
                    <span>₱{Number(selectedOrder.farmer_price ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Terra Service Fee</span>
                    <span className="text-destructive">-₱{Number(selectedOrder.terra_fee ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.status === "pending" && (
                  <Button onClick={() => handleStatusChange(selectedOrder.id, "preparing")} disabled={updateStatusMutation.isPending}>
                    <Package className="h-4 w-4 mr-2" /> Start Preparing
                  </Button>
                )}
                {selectedOrder.status === "preparing" && (
                  <Button onClick={() => handleStatusChange(selectedOrder.id, "in_transit")} disabled={updateStatusMutation.isPending}>
                    <Truck className="h-4 w-4 mr-2" /> Ready for Pickup
                  </Button>
                )}
                {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                  <Button variant="destructive" onClick={() => handleStatusChange(selectedOrder.id, "cancelled")} disabled={updateStatusMutation.isPending}>
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerOrdersPanel;
