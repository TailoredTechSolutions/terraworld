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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Farmer = Tables<"farmers">;
type Driver = Tables<"drivers">;
type Order = Tables<"orders"> & {
  farmers?: { name: string } | null;
  drivers?: { name: string } | null;
};

// Static analytics data (would be calculated from real orders in production)
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 132 },
  { month: "Apr", revenue: 61000, orders: 178 },
  { month: "May", revenue: 55000, orders: 156 },
  { month: "Jun", revenue: 67000, orders: 189 },
];

const categoryData = [
  { name: "Vegetables", value: 35 },
  { name: "Fruits", value: 28 },
  { name: "Dairy", value: 20 },
  { name: "Honey", value: 10 },
  { name: "Other", value: 7 },
];

const COLORS = ["hsl(152, 45%, 28%)", "hsl(18, 65%, 55%)", "hsl(38, 92%, 50%)", "hsl(152, 35%, 45%)", "hsl(45, 20%, 60%)"];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch farmers and drivers directly (public read access)
      const [farmersRes, driversRes] = await Promise.all([
        supabase.from("farmers").select("*").order("created_at", { ascending: false }),
        supabase.from("drivers").select("*").order("created_at", { ascending: false }),
      ]);

      if (farmersRes.error) throw farmersRes.error;
      if (driversRes.error) throw driversRes.error;

      setFarmers(farmersRes.data || []);
      setDrivers(driversRes.data || []);

      // Fetch orders via secure edge function (orders table no longer publicly readable)
      const { data: ordersData, error: ordersError } = await supabase.functions.invoke('get-orders', {
        method: 'GET',
      });

      if (ordersError) {
        console.error("Error fetching orders via edge function:", ordersError);
        // Don't throw - orders might fail but we can still show other data
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

  const stats = [
    {
      title: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      change: "+8.2%",
      icon: ShoppingBag,
      color: "text-accent",
    },
    {
      title: "Active Farmers",
      value: activeFarmers.toString(),
      change: `+${farmers.filter(f => f.status === "pending").length} pending`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Drivers",
      value: activeDrivers.toString(),
      change: `${drivers.length} total`,
      icon: Truck,
      color: "text-accent",
    },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your marketplace</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-primary mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-secondary ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Monthly revenue over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "hsl(152, 45%, 28%)" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(152, 45%, 28%)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(152, 45%, 28%)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent" />
                    Orders by Month
                  </CardTitle>
                  <CardDescription>Total orders processed each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      orders: { label: "Orders", color: "hsl(18, 65%, 55%)" },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="orders" fill="hsl(18, 65%, 55%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Product category distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="p-2 rounded-full bg-secondary">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_name} - ₱{Number(order.total).toLocaleString()}</p>
                      </div>
                      {getStatusBadge(order.status || "pending")}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Farmers Tab */}
          <TabsContent value="farmers">
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
              <CardContent>
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
                            <Star className="h-4 w-4 fill-warning text-warning" />
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
                                <DropdownMenuItem className="text-primary">
                                  <Check className="h-4 w-4 mr-2" /> Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
                                <X className="h-4 w-4 mr-2" /> Suspend
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
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
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
              <CardContent>
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
                            <Star className="h-4 w-4 fill-warning text-warning" />
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>View and manage customer orders ({orders.length} total)</CardDescription>
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
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Farm</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                        <TableCell className="font-medium">{order.customer_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.farmers?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {order.drivers?.name || (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>{order.items_count}</TableCell>
                        <TableCell>₱{Number(order.total).toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
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
                                <DropdownMenuItem>
                                  <Truck className="h-4 w-4 mr-2" /> Assign Driver
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
                                <X className="h-4 w-4 mr-2" /> Cancel Order
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Farmer Details Dialog */}
      <Dialog open={!!selectedFarmer} onOpenChange={() => setSelectedFarmer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedFarmer?.name}</DialogTitle>
          </DialogHeader>
          {selectedFarmer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedFarmer.owner}</p>
                  <p className="text-sm text-muted-foreground">Owner</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedFarmer.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {selectedFarmer.phone}
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {selectedFarmer.location}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">{selectedFarmer.products_count}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">₱{(Number(selectedFarmer.total_sales) / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <p className="text-xl font-bold">{Number(selectedFarmer.rating).toFixed(1)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joined:</span>
                <span>{new Date(selectedFarmer.created_at).toLocaleDateString()}</span>
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
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="p-2 rounded-full bg-accent/10">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium capitalize">{selectedDriver.vehicle}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.license_plate}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedDriver.status || "offline")}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selectedDriver.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {selectedDriver.phone}
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {selectedDriver.current_location || "Unknown"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">{selectedDriver.deliveries_count}</p>
                  <p className="text-xs text-muted-foreground">Deliveries</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">₱{(Number(selectedDriver.total_earnings) / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <p className="text-xl font-bold">{Number(selectedDriver.rating).toFixed(1)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
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
