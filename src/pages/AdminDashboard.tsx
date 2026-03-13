import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Truck,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Package,
  ArrowLeft,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  Star,
  Loader2,
  RefreshCw,
  Crown,
  Activity,
  Wallet,
  Play,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

// Terra Compensation Components
import { PayoutCyclePanel } from "@/components/admin/PayoutCyclePanel";
import { MembershipsPanel } from "@/components/admin/MembershipsPanel";
import { BVLedgerPanel } from "@/components/admin/BVLedgerPanel";
import { PayoutsLedgerPanel } from "@/components/admin/PayoutsLedgerPanel";
import UserManagementPanel from "@/components/admin/UserManagementPanel";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverviewPanel from "@/components/admin/AdminOverviewPanel";
import WithdrawalsPanel from "@/components/admin/WithdrawalsPanel";
import ReportsPanel from "@/components/admin/ReportsPanel";
import GenealogyPanel from "@/components/admin/GenealogyPanel";
import PlatformSettingsPanel from "@/components/admin/PlatformSettingsPanel";
import IntegrationManagerPanel from "@/components/admin/IntegrationManagerPanel";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import CustomerServicePanel from "@/components/admin/CustomerServicePanel";
import TokenRewardsPanel from "@/components/admin/TokenRewardsPanel";
import ProductApprovalPanel from "@/components/admin/ProductApprovalPanel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Farmer = Tables<"farmers">;
type Driver = Tables<"drivers">;
type Order = Tables<"orders"> & {
  farmers?: { name: string } | null;
  drivers?: { name: string } | null;
};

// Sales and Activations chart data
const salesData = [
  { date: "Mon", sales: 28, activations: 12 },
  { date: "Tue", sales: 35, activations: 18 },
  { date: "Wed", sales: 42, activations: 15 },
  { date: "Thu", sales: 30, activations: 22 },
  { date: "Fri", sales: 48, activations: 28 },
  { date: "Sat", sales: 52, activations: 32 },
  { date: "Sun", sales: 38, activations: 20 },
];

const categoryData = [
  { name: "Vegetables", value: 35 },
  { name: "Fruits", value: 28 },
  { name: "Dairy", value: 20 },
  { name: "Honey", value: 10 },
  { name: "Other", value: 7 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))", "hsl(var(--border))"];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [membersCount, setMembersCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch farmers, drivers, and profiles count
      const [farmersRes, driversRes, profilesRes] = await Promise.all([
        supabase.from("farmers").select("*").order("created_at", { ascending: false }),
        supabase.from("drivers").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      if (farmersRes.error) throw farmersRes.error;
      if (driversRes.error) throw driversRes.error;

      setFarmers(farmersRes.data || []);
      setDrivers(driversRes.data || []);
      setMembersCount(profilesRes.count || 0);

      // Fetch orders via secure edge function
      const { data: ordersData, error: ordersError } = await supabase.functions.invoke('get-orders', {
        method: 'GET',
      });

      if (ordersError) {
        console.error("Error fetching orders via edge function:", ordersError);
        setOrders([]);
      } else {
        setOrders(ordersData?.orders || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Farmer Actions ─────────────────────────────
  const updateFarmerStatus = async (farmerId: string, newStatus: "active" | "pending" | "suspended") => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("farmers")
        .update({ status: newStatus })
        .eq("id", farmerId);
      if (error) throw error;
      toast({ title: "Success", description: `Farmer ${newStatus === "active" ? "approved" : newStatus}` });
      setSelectedFarmer(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Order Actions ──────────────────────────────
  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "preparing" | "in_transit" | "delivered" | "cancelled") => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);
      if (error) throw error;
      toast({ title: "Success", description: `Order status updated to ${newStatus}` });
      setSelectedOrder(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const assignDriverToOrder = async (orderId: string, driverId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ driver_id: driverId })
        .eq("id", orderId);
      if (error) throw error;
      toast({ title: "Success", description: "Driver assigned to order" });
      setSelectedOrder(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      pending: { variant: "secondary", label: "Pending" },
      suspended: { variant: "destructive", label: "Suspended" },
      online: { variant: "default", label: "Online" },
      offline: { variant: "secondary", label: "Offline" },
      delivering: { variant: "outline", label: "Delivering" },
      delivered: { variant: "default", label: "Delivered" },
      in_transit: { variant: "outline", label: "In Transit" },
      preparing: { variant: "secondary", label: "Preparing" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orderFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  // Calculate stats from real data
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const activeFarmers = farmers.filter(f => f.status === "active").length;
  const activeDrivers = drivers.filter(d => d.status === "online" || d.status === "delivering").length;

  // Calculate payout this week (simulated)
  const payoutThisWeek = Math.floor(totalRevenue * 0.15);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members/Export</p>
                <p className="text-3xl font-bold">{membersCount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending UFC Members (TCB)</p>
                <p className="text-3xl font-bold">320</p>
              </div>
              <div className="p-3 rounded-full bg-accent/20">
                <Crown className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary to-secondary/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payout This Week</p>
                <p className="text-3xl font-bold">₱{payoutThisWeek.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending payout</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales & Activations Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sales & Activations This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Sales", color: "hsl(var(--primary))" },
              activations: { label: "Activations", color: "hsl(var(--accent))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="activations"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#activationsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Members</CardTitle>
          <CardDescription>Newest members on the platform</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="overflow-x-auto">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Bisted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { member: "17203.000", sponsor: "Coperniser", package: "Sarto1", bisted: "Promozxtiou", status: "Resumed" },
                { member: "17216.000", sponsor: "Coperniser", package: "Somxrt", bisted: "Promozxtiou", status: "Rollnner" },
                { member: "17305.000", sponsor: "Coperniser", package: "1465,L64", bisted: "Promozxtiou", status: "Rollane" },
                { member: "17108.000", sponsor: "Coperniser", package: "sarto1", bisted: "Promozxtiou", status: "Rollaner" },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.member}</TableCell>
                  <TableCell>{row.sponsor}</TableCell>
                  <TableCell>{row.package}</TableCell>
                  <TableCell>{row.bisted}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFarmersTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Farmers</CardTitle>
            <CardDescription>Manage farmer accounts and approvals ({farmers.length} total)</CardDescription>
          </div>
          <Button className="btn-primary-gradient">Add Farmer</Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farm Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell className="font-medium">{farmer.name}</TableCell>
                <TableCell>{farmer.owner}</TableCell>
                <TableCell className="text-muted-foreground">{farmer.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {Number(farmer.rating).toFixed(1)}
                  </div>
                </TableCell>
                <TableCell>{farmer.products_count}</TableCell>
                <TableCell>₱{Number(farmer.total_sales).toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(farmer.status || "pending")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedFarmer(farmer)}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {farmer.status === "pending" && (
                        <DropdownMenuItem className="text-primary" onClick={() => updateFarmerStatus(farmer.id, "active")}>
                          <Check className="h-4 w-4 mr-2" /> Approve
                        </DropdownMenuItem>
                      )}
                      {farmer.status === "active" && (
                        <DropdownMenuItem className="text-destructive" onClick={() => updateFarmerStatus(farmer.id, "suspended")}>
                          <X className="h-4 w-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                      )}
                      {farmer.status === "suspended" && (
                        <DropdownMenuItem className="text-primary" onClick={() => updateFarmerStatus(farmer.id, "active")}>
                          <Check className="h-4 w-4 mr-2" /> Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderDriversTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Drivers</CardTitle>
            <CardDescription>Manage driver accounts and assignments ({drivers.length} total)</CardDescription>
          </div>
          <Button className="btn-primary-gradient">Add Driver</Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Deliveries</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>
                  <div>
                    <p className="capitalize">{driver.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{driver.license_plate}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{driver.current_location || "Unknown"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {Number(driver.rating).toFixed(1)}
                  </div>
                </TableCell>
                <TableCell>{driver.deliveries_count}</TableCell>
                <TableCell>₱{Number(driver.total_earnings).toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(driver.status || "offline")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedDriver(driver)}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderOrdersTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Track and manage all marketplace orders ({orders.length} total)</CardDescription>
          </div>
          <Select value={orderFilter} onValueChange={setOrderFilter}>
            <SelectTrigger className="w-[180px]">
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
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Farm</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>
                  <div>
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>{order.farmers?.name || "Unknown"}</TableCell>
                <TableCell>{order.drivers?.name || "Unassigned"}</TableCell>
                <TableCell>{order.items_count}</TableCell>
                <TableCell className="font-medium">₱{Number(order.total).toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(order.status || "pending")}</TableCell>
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
                      {!order.driver_id && (
                        <DropdownMenuItem className="text-primary">
                          <Truck className="h-4 w-4 mr-2" /> Assign Driver
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderMarketplaceTab = () => (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>Marketplace Management</CardTitle><CardDescription>Product approvals, category management, inventory oversight, pricing</CardDescription></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('farmers')}><CardContent className="pt-6 text-center"><Package className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Product Approvals</p><p className="text-xs text-muted-foreground">Review & approve farmer products</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Category Management</p><p className="text-xs text-muted-foreground">Manage product categories</p></CardContent></Card>
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('settings')}><CardContent className="pt-6 text-center"><DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Pricing Rules</p><p className="text-xs text-muted-foreground">Platform fee, commission, VAT config</p></CardContent></Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>Financial Management Engine</CardTitle><CardDescription>Transaction processing, payment reconciliation, payouts, tax reporting</CardDescription></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('orders')}><CardContent className="pt-6 text-center"><DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Transactions</p><p className="text-xs text-muted-foreground">Process & reconcile payments</p></CardContent></Card>
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('payout-ledger')}><CardContent className="pt-6 text-center"><TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Payout Tracking</p><p className="text-xs text-muted-foreground">Withdrawals & disbursements</p></CardContent></Card>
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('reports')}><CardContent className="pt-6 text-center"><Package className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Tax & Reporting</p><p className="text-xs text-muted-foreground">VAT configuration & reports</p></CardContent></Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderLogisticsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logistics Management</CardTitle>
          <CardDescription>Delivery oversight via Lalamove & Grab APIs — Philippines only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Truck className="h-6 w-6 text-primary" /></div>
                  <div><p className="font-semibold">Lalamove</p><Badge variant="secondary">Mock API</Badge></div>
                </div>
                <p className="text-sm text-muted-foreground">Real-time delivery via Lalamove fleet. Fees calculated per order.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent/10"><Truck className="h-6 w-6 text-accent" /></div>
                  <div><p className="font-semibold">Grab</p><Badge variant="secondary">Mock API</Badge></div>
                </div>
                <p className="text-sm text-muted-foreground">GrabExpress delivery integration. Zone-based transport fees.</p>
              </CardContent>
            </Card>
          </div>

          {/* Safeguards Summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">System Safeguards</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Double booking prevention (DB constraint)</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>409 Conflict on duplicate API calls</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Mandatory cancel before provider switch</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Transport fee locked per booking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderMLMTab = () => (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>MLM System Management</CardTitle><CardDescription>Referral structure rules, commission percentages, earnings adjustments</CardDescription></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('genealogy')}><CardContent className="pt-6 text-center"><Users className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Genealogy Tree</p><p className="text-xs text-muted-foreground">View binary tree structure</p></CardContent></Card>
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('compensation')}><CardContent className="pt-6 text-center"><DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">Commission Rules</p><p className="text-xs text-muted-foreground">Configure payout cycles</p></CardContent></Card>
          <Card className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setActiveTab('bv-ledger')}><CardContent className="pt-6 text-center"><TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" /><p className="font-semibold">BV & Adjustments</p><p className="text-xs text-muted-foreground">Override controls</p></CardContent></Card>
        </CardContent>
      </Card>
    </div>
  );

  const renderTokenRewardsTab = () => (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>Token Rewards Management</CardTitle><CardDescription>Reward configuration, distribution monitoring, balance adjustments</CardDescription></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5"><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Total Tokens Issued</p><p className="text-2xl font-bold">0 AGRI</p></CardContent></Card>
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5"><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Active Holders</p><p className="text-2xl font-bold">0</p></CardContent></Card>
            <Card className="bg-gradient-to-br from-secondary to-secondary/50"><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Pending Distributions</p><p className="text-2xl font-bold">0</p></CardContent></Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCustomerServiceTab = () => (
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>Customer Service Management</CardTitle><CardDescription>Refund processing, return approvals, case management</CardDescription></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Open Cases</p><p className="text-2xl font-bold">0</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Pending Refunds</p><p className="text-2xl font-bold">0</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Return Requests</p><p className="text-2xl font-bold">0</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-sm text-muted-foreground">Resolved This Week</p><p className="text-2xl font-bold">0</p></CardContent></Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverviewPanel membersCount={membersCount} ordersCount={orders.length} totalRevenue={totalRevenue} />;
      case 'users':
        return <UserManagementPanel />;
      case 'marketplace':
        return <ProductApprovalPanel />;
      case 'genealogy':
        return <GenealogyPanel />;
      case 'compensation':
        return <PayoutCyclePanel />;
      case 'memberships':
        return <MembershipsPanel />;
      case 'bv-ledger':
        return <BVLedgerPanel />;
      case 'payout-ledger':
        return <WithdrawalsPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'farmers':
        return renderFarmersTab();
      case 'orders':
        return renderOrdersTab();
      case 'financial':
        return renderFinancialTab();
      case 'logistics':
        return renderLogisticsTab();
      case 'mlm':
        return renderMLMTab();
      case 'token-rewards':
        return <TokenRewardsPanel />;
      case 'customer-service':
        return <CustomerServicePanel />;
      case 'audit-logs':
        return <AuditLogPanel />;
      case 'settings':
        return <PlatformSettingsPanel />;
      case 'integrations':
        return <IntegrationManagerPanel />;
      default:
        return (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">This section is coming soon.</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your marketplace</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Page Title */}
            <h2 className="text-xl font-semibold mb-6 capitalize">
              {activeTab === 'overview' ? 'Dashboard' : activeTab.replace('-', ' ')}
            </h2>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>

      <Footer />

      {/* Farmer Details Dialog */}
      <Dialog open={!!selectedFarmer} onOpenChange={() => setSelectedFarmer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedFarmer?.name}</DialogTitle>
          </DialogHeader>
          {selectedFarmer && (
            <div className="space-y-4">
              {selectedFarmer.image_url && (
                <img 
                  src={selectedFarmer.image_url} 
                  alt={selectedFarmer.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(selectedFarmer.status || "pending")}
              </div>
              <p className="text-sm text-muted-foreground">{selectedFarmer.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Owner: {selectedFarmer.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedFarmer.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedFarmer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedFarmer.email}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedFarmer.products_count}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {Number(selectedFarmer.rating).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-lg font-bold">₱{Number(selectedFarmer.total_sales).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Edit Profile</Button>
                <Button className="flex-1 btn-primary-gradient">View Products</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Driver Details Dialog */}
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(selectedDriver.status || "offline")}
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{selectedDriver.vehicle}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Plate: {selectedDriver.license_plate}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDriver.current_location || "Location unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedDriver.email}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedDriver.deliveries_count}</p>
                  <p className="text-xs text-muted-foreground">Deliveries</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {Number(selectedDriver.rating).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <p className="text-lg font-bold">₱{Number(selectedDriver.total_earnings).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Edit Profile</Button>
                <Button className="flex-1 btn-primary-gradient">View History</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(selectedOrder.status || "pending")}
              </div>
              <div className="p-3 bg-secondary rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {selectedOrder.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedOrder.delivery_address}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Farm</p>
                  <p className="font-medium">{selectedOrder.farmers?.name || "Unknown"}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-medium">{selectedOrder.drivers?.name || "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedOrder.items_count} items</p>
                  <p className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-2xl font-bold text-primary">₱{Number(selectedOrder.total).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {!selectedOrder.driver_id && (
                  <Button variant="outline" className="flex-1">Assign Driver</Button>
                )}
                <Button className="flex-1 btn-primary-gradient">Update Status</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
