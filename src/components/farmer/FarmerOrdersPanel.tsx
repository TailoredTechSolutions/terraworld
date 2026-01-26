import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingBag,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Package,
  User,
  Phone,
  MapPin,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Order = Tables<"orders"> & {
  drivers?: { name: string } | null;
};

type OrderStatus = Enums<"order_status">;

interface FarmerOrdersPanelProps {
  farmerId: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  preparing: { label: "Preparing", variant: "outline", icon: Package },
  in_transit: { label: "In Transit", variant: "default", icon: Truck },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const FarmerOrdersPanel = ({ farmerId }: FarmerOrdersPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders for this farmer
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

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-orders", farmerId] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
      console.error("Update error:", error);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const getStatusBadge = (status: OrderStatus | null) => {
    const config = STATUS_CONFIG[status || "pending"];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Calculate stats
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
      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            Pending
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            Preparing
          </div>
          <p className="text-2xl font-bold text-primary">{preparingCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Truck className="h-4 w-4" />
            In Transit
          </div>
          <p className="text-2xl font-bold text-accent">{inTransitCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            Delivered
          </div>
          <p className="text-2xl font-bold text-primary">{deliveredCount}</p>
        </Card>
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
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm">Orders for your products will appear here</p>
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
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "preparing")}
                                className="text-primary"
                              >
                                <Package className="h-4 w-4 mr-2" /> Start Preparing
                              </DropdownMenuItem>
                            )}
                            {order.status === "preparing" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "in_transit")}
                                className="text-accent"
                              >
                                <Truck className="h-4 w-4 mr-2" /> Mark Ready for Pickup
                              </DropdownMenuItem>
                            )}
                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "cancelled")}
                                className="text-destructive"
                              >
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
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status</span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer Info */}
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

              {/* Delivery Info */}
              <Card className="p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </h4>
                <p className="text-sm text-muted-foreground">{selectedOrder.delivery_address}</p>
                {selectedOrder.notes && (
                  <p className="text-sm text-muted-foreground italic">Note: {selectedOrder.notes}</p>
                )}
              </Card>

              {/* Order Summary */}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedOrder.items_count} items</p>
                  <p className="text-sm text-muted-foreground">
                    Driver: {selectedOrder.drivers?.name || "Unassigned"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    ₱{Number(selectedOrder.total).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <div className="flex flex-wrap gap-2">
                  <p className="w-full text-sm text-muted-foreground">Update Status:</p>
                  {selectedOrder.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder.id, "preparing")}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Package className="h-4 w-4 mr-2" /> Start Preparing
                    </Button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder.id, "in_transit")}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Truck className="h-4 w-4 mr-2" /> Ready for Pickup
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerOrdersPanel;
