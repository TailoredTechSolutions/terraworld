import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store, Package, ShoppingCart, Loader2, Shield, Search,
  TrendingUp, CheckCircle2, Clock, AlertTriangle
} from "lucide-react";

const BCMarketplace = () => {
  const { isAnyAdmin } = useUserRoles();
  const [searchQuery, setSearchQuery] = useState("");

  // Orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["bc-marketplace-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email, status, total, items_count, created_at, farmer_id")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  // Farmers
  const { data: farmers = [], isLoading: farmersLoading } = useQuery({
    queryKey: ["bc-marketplace-farmers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("farmers")
        .select("id, name, location, status, rating, products_count, total_sales, email")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  // Products count
  const { data: productCount = 0 } = useQuery({
    queryKey: ["bc-marketplace-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("id", { count: "exact", head: true });
      return count || 0;
    },
    enabled: isAnyAdmin,
  });

  const statusColor = (s: string | null) => {
    switch (s) {
      case "delivered": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "in_transit": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "preparing": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "pending": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
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

  const ordersByStatus = {
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    in_transit: orders.filter(o => o.status === "in_transit").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          Marketplace Operations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor orders, farmers, products, and marketplace performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: ShoppingCart, label: "Total Orders", value: orders.length.toString(), accent: "text-primary" },
          { icon: TrendingUp, label: "Revenue", value: `₱${totalRevenue.toLocaleString()}`, accent: "text-emerald-500" },
          { icon: Store, label: "Farmers", value: farmers.length.toString(), accent: "text-blue-500" },
          { icon: Package, label: "Products", value: productCount.toString(), accent: "text-purple-500" },
          { icon: Clock, label: "Pending", value: ordersByStatus.pending.toString(), accent: "text-amber-500" },
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

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {ordersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders
                    .filter(o => !searchQuery || o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 50)
                    .map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                      <TableCell className="text-sm">{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusColor(order.status)}`}>
                          {order.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{order.items_count}</TableCell>
                      <TableCell className="text-right font-semibold text-xs">₱{Number(order.total).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="farmers" className="space-y-3">
          {farmersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map(farm => (
                    <TableRow key={farm.id}>
                      <TableCell className="font-medium text-sm">{farm.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{farm.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${
                          farm.status === "active" ? "text-emerald-600 border-emerald-500/30" : "text-amber-600 border-amber-500/30"
                        }`}>
                          {farm.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{farm.products_count}</TableCell>
                      <TableCell className="text-xs">⭐ {farm.rating}</TableCell>
                      <TableCell className="text-right font-semibold text-xs">₱{Number(farm.total_sales).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCMarketplace;
