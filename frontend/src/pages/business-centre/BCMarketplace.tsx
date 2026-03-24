import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Store, Package, ShoppingCart, Loader2, Shield, Search,
  TrendingUp, CheckCircle2, Clock, Users, Tag, Layers, DollarSign, Archive
} from "lucide-react";

const BCMarketplace = () => {
  const { isAnyAdmin } = useUserRoles();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["bc-mkt-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_email, status, subtotal, terra_fee, delivery_fee, total, items_count, created_at, farmer_id")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: farmers = [], isLoading: farmersLoading } = useQuery({
    queryKey: ["bc-mkt-farmers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("farmers")
        .select("id, name, location, status, rating, products_count, total_sales, email, description")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["bc-mkt-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, category, price, stock, is_paused, is_organic, farmer_id, created_at, unit, harvest_date")
        .order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["bc-mkt-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: pricingRules = [] } = useQuery({
    queryKey: ["bc-mkt-pricing"],
    queryFn: async () => {
      const { data } = await supabase.from("pricing_rules").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: buyerCount = 0 } = useQuery({
    queryKey: ["bc-mkt-buyers"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "buyer");
      return count || 0;
    },
    enabled: isAnyAdmin,
  });

  const statusColor = (s: string | null) => {
    switch (s) {
      case "delivered": case "completed": case "active": return "border-emerald-500/30 text-emerald-600";
      case "in_transit": case "preparing": return "border-blue-500/30 text-blue-600";
      case "pending": return "border-amber-500/30 text-amber-600";
      case "cancelled": case "rejected": return "border-destructive/30 text-destructive";
      default: return "";
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

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalTerraFee = orders.reduce((s, o) => s + Number(o.terra_fee || 0), 0);
  const activeFarmers = farmers.filter(f => f.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" /> Marketplace Operations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Farmers, buyers, products, orders, categories, inventory, and pricing</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { icon: ShoppingCart, label: "Orders", value: orders.length.toString(), accent: "text-primary" },
          { icon: TrendingUp, label: "Revenue", value: `₱${totalRevenue.toLocaleString()}`, accent: "text-emerald-500" },
          { icon: DollarSign, label: "Terra Fees (BV Base)", value: `₱${totalTerraFee.toLocaleString()}`, accent: "text-purple-500" },
          { icon: Store, label: "Farmers", value: `${activeFarmers}/${farmers.length}`, accent: "text-blue-500" },
          { icon: Package, label: "Products", value: products.length.toString(), accent: "text-amber-500" },
          { icon: Users, label: "Buyers", value: buyerCount.toString(), accent: "text-primary" },
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

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 h-9">
          <TabsTrigger value="orders" className="text-xs">Orders</TabsTrigger>
          <TabsTrigger value="farmers" className="text-xs">Farmers</TabsTrigger>
          <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs">Inventory</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
        </TabsList>

        {/* Orders — shows fee separation */}
        <TabsContent value="orders" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <strong>BV Rule:</strong> Only the Terra Fee column is commissionable (₱1 = 1 BV). Farmer subtotal & delivery fees never generate BV.
          </div>
          {ordersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Order #</TableHead>
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Farmer Subtotal</TableHead>
                      <TableHead className="text-xs text-right font-bold">Terra Fee ⚡</TableHead>
                      <TableHead className="text-xs text-right">Delivery</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter(o => !searchQuery || o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 50)
                      .map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-[10px]">{order.order_number}</TableCell>
                        <TableCell className="text-xs">{order.customer_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]", statusColor(order.status))}>{order.status || "unknown"}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">₱{Number(order.subtotal).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-semibold text-purple-600">₱{Number(order.terra_fee || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">₱{Number(order.delivery_fee || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-bold">₱{Number(order.total).toLocaleString()}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Farmers */}
        <TabsContent value="farmers" className="space-y-3">
          {farmersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Farm</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Verification</TableHead>
                    <TableHead className="text-xs">Products</TableHead>
                    <TableHead className="text-xs">Rating</TableHead>
                    <TableHead className="text-xs text-right">Total Sales</TableHead>
                    <TableHead className="text-xs">Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map(farm => (
                    <TableRow key={farm.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{farm.name}</p>
                        <p className="text-[10px] text-muted-foreground">{farm.email}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{farm.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", statusColor(farm.status))}>{farm.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{farm.products_count}</TableCell>
                      <TableCell className="text-xs">⭐ {farm.rating}</TableCell>
                      <TableCell className="text-right text-xs font-semibold">₱{Number(farm.total_sales).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">—</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Products */}
        <TabsContent value="products" className="space-y-3">
          {productsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card className="border-border/40">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">Base Price</TableHead>
                    <TableHead className="text-xs text-right">Stock</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Organic</TableHead>
                    <TableHead className="text-xs">Harvest</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                      <TableCell className="text-right text-xs">₱{Number(p.price).toLocaleString()}/{p.unit}</TableCell>
                      <TableCell className="text-right text-xs">{p.stock}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", p.is_paused ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600")}>
                          {p.is_paused ? "Paused" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.is_organic ? "✅" : "—"}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{p.harvest_date || "—"}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Category Management</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Slug</TableHead>
                    <TableHead className="text-xs">Product Count</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c: any) => {
                    const count = products.filter(p => p.category?.toLowerCase() === c.name?.toLowerCase()).length;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-sm">{c.name}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{c.slug}</TableCell>
                        <TableCell className="text-xs">{count}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]", c.status === "active" ? "border-emerald-500/30 text-emerald-600" : "border-muted text-muted-foreground")}>
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Archive className="h-4 w-4 text-primary" /> Inventory Oversight</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs text-right">On Hand</TableHead>
                    <TableHead className="text-xs text-right">Price</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                      <TableCell className={cn("text-right text-xs font-medium", p.stock <= 5 ? "text-destructive" : "")}>{p.stock}</TableCell>
                      <TableCell className="text-right text-xs">₱{Number(p.price).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]",
                          p.stock === 0 ? "border-destructive/30 text-destructive" :
                          p.stock <= 10 ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600"
                        )}>
                          {p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low" : "In Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Rules */}
        <TabsContent value="pricing" className="space-y-3">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
            <strong>Pricing Formula:</strong> Total = Farmer Base Price + Platform Fee (Terra Fee) + Tax (VAT) + Transport Fee. Only the Terra Fee is commissionable.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Pricing Rules</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {pricingRules.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No pricing rules configured.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Rule Name</TableHead>
                      <TableHead className="text-xs">Terra Fee</TableHead>
                      <TableHead className="text-xs">Tax</TableHead>
                      <TableHead className="text-xs">Transport</TableHead>
                      <TableHead className="text-xs">Active</TableHead>
                      <TableHead className="text-xs">Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingRules.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-sm">{r.rule_name}</TableCell>
                        <TableCell className="text-xs">
                          {r.terra_fee_mode === "percent" ? `${Number(r.terra_fee_value)}%` : `₱${Number(r.terra_fee_value).toLocaleString()}`}
                          <span className="text-[9px] text-muted-foreground ml-1">({r.terra_fee_mode})</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.tax_mode === "percent" ? `${Number(r.tax_value)}%` : `₱${Number(r.tax_value).toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-xs capitalize">{r.transport_mode}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]", r.is_active ? "border-emerald-500/30 text-emerald-600" : "border-muted text-muted-foreground")}>
                            {r.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {r.starts_at ? new Date(r.starts_at).toLocaleDateString() : "—"} → {r.ends_at ? new Date(r.ends_at).toLocaleDateString() : "∞"}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default BCMarketplace;
