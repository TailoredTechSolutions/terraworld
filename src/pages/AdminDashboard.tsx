import { useState } from "react";
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
  Trash2,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  AlertCircle,
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

// Mock data for analytics
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

// Mock farmers data
const mockFarmers = [
  {
    id: "f1",
    name: "Green Valley Farm",
    owner: "Maria Santos",
    email: "maria@greenvalley.ph",
    phone: "+63 912 345 6789",
    location: "Tagaytay, Cavite",
    rating: 4.8,
    products: 24,
    totalSales: 156000,
    status: "active",
    joinedDate: "2024-01-15",
  },
  {
    id: "f2",
    name: "Sunrise Organic",
    owner: "Juan Cruz",
    email: "juan@sunriseorganic.ph",
    phone: "+63 917 654 3210",
    location: "Baguio City",
    rating: 4.9,
    products: 18,
    totalSales: 234000,
    status: "active",
    joinedDate: "2023-11-20",
  },
  {
    id: "f3",
    name: "Mountain Fresh",
    owner: "Ana Reyes",
    email: "ana@mountainfresh.ph",
    phone: "+63 922 111 2233",
    location: "La Trinidad, Benguet",
    rating: 4.6,
    products: 31,
    totalSales: 189000,
    status: "pending",
    joinedDate: "2024-06-01",
  },
  {
    id: "f4",
    name: "Happy Hens Farm",
    owner: "Pedro Garcia",
    email: "pedro@happyhens.ph",
    phone: "+63 933 444 5566",
    location: "Batangas City",
    rating: 4.7,
    products: 8,
    totalSales: 87000,
    status: "active",
    joinedDate: "2024-02-28",
  },
];

// Mock drivers data
const mockDrivers = [
  {
    id: "d1",
    name: "Carlo Mendoza",
    email: "carlo@driver.ph",
    phone: "+63 945 678 9012",
    vehicle: "Motorcycle",
    licensePlate: "ABC 1234",
    rating: 4.9,
    deliveries: 342,
    earnings: 45600,
    status: "online",
    currentLocation: "Makati City",
  },
  {
    id: "d2",
    name: "Luis Bautista",
    email: "luis@driver.ph",
    phone: "+63 956 789 0123",
    vehicle: "Van",
    licensePlate: "XYZ 5678",
    rating: 4.7,
    deliveries: 289,
    earnings: 52300,
    status: "delivering",
    currentLocation: "Quezon City",
  },
  {
    id: "d3",
    name: "Ramon dela Cruz",
    email: "ramon@driver.ph",
    phone: "+63 967 890 1234",
    vehicle: "Motorcycle",
    licensePlate: "DEF 9012",
    rating: 4.5,
    deliveries: 156,
    earnings: 23400,
    status: "offline",
    currentLocation: "Pasig City",
  },
  {
    id: "d4",
    name: "Mark Villanueva",
    email: "mark@driver.ph",
    phone: "+63 978 901 2345",
    vehicle: "Motorcycle",
    licensePlate: "GHI 3456",
    rating: 4.8,
    deliveries: 421,
    earnings: 61200,
    status: "online",
    currentLocation: "Taguig City",
  },
];

// Mock orders data
const mockOrders = [
  {
    id: "ORD-2024-001",
    customer: "Elena Rodriguez",
    customerPhone: "+63 912 111 2222",
    farm: "Green Valley Farm",
    driver: "Carlo Mendoza",
    items: 4,
    total: 1250,
    status: "delivered",
    date: "2024-06-15",
    deliveryAddress: "123 Ayala Ave, Makati City",
  },
  {
    id: "ORD-2024-002",
    customer: "Miguel Santos",
    customerPhone: "+63 917 333 4444",
    farm: "Sunrise Organic",
    driver: "Luis Bautista",
    items: 2,
    total: 680,
    status: "in_transit",
    date: "2024-06-15",
    deliveryAddress: "456 EDSA, Quezon City",
  },
  {
    id: "ORD-2024-003",
    customer: "Sofia Lim",
    customerPhone: "+63 922 555 6666",
    farm: "Mountain Fresh",
    driver: null,
    items: 6,
    total: 2100,
    status: "pending",
    date: "2024-06-15",
    deliveryAddress: "789 Ortigas Ave, Pasig City",
  },
  {
    id: "ORD-2024-004",
    customer: "David Cruz",
    customerPhone: "+63 933 777 8888",
    farm: "Happy Hens Farm",
    driver: "Mark Villanueva",
    items: 3,
    total: 890,
    status: "preparing",
    date: "2024-06-14",
    deliveryAddress: "321 BGC, Taguig City",
  },
  {
    id: "ORD-2024-005",
    customer: "Angela Torres",
    customerPhone: "+63 945 999 0000",
    farm: "Green Valley Farm",
    driver: "Carlo Mendoza",
    items: 5,
    total: 1780,
    status: "delivered",
    date: "2024-06-14",
    deliveryAddress: "654 Alabang, Muntinlupa City",
  },
];

const AdminDashboard = () => {
  const [selectedFarmer, setSelectedFarmer] = useState<typeof mockFarmers[0] | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<typeof mockDrivers[0] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

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
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orderFilter === "all" 
    ? mockOrders 
    : mockOrders.filter(o => o.status === orderFilter);

  const stats = [
    {
      title: "Total Revenue",
      value: "₱328,000",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Total Orders",
      value: "920",
      change: "+8.2%",
      icon: ShoppingBag,
      color: "text-accent",
    },
    {
      title: "Active Farmers",
      value: "42",
      change: "+3",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Drivers",
      value: "18",
      change: "+2",
      icon: Truck,
      color: "text-accent",
    },
  ];

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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Demo Mode
              </Badge>
            </div>
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
                    <p className="text-xs text-primary mt-1">{stat.change} this month</p>
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

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { action: "New order placed", detail: "ORD-2024-003 - ₱2,100", time: "2 min ago", icon: ShoppingBag },
                    { action: "Farmer approved", detail: "Mountain Fresh joined", time: "1 hour ago", icon: Check },
                    { action: "Delivery completed", detail: "ORD-2024-001 delivered", time: "2 hours ago", icon: Truck },
                    { action: "New driver registered", detail: "Mark Villanueva", time: "5 hours ago", icon: Users },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="p-2 rounded-full bg-secondary">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
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
                    <CardDescription>Manage farmer accounts and approvals</CardDescription>
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
                    {mockFarmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell className="font-medium">{farmer.name}</TableCell>
                        <TableCell>{farmer.owner}</TableCell>
                        <TableCell className="text-muted-foreground">{farmer.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            {farmer.rating}
                          </div>
                        </TableCell>
                        <TableCell>{farmer.products}</TableCell>
                        <TableCell>₱{farmer.totalSales.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(farmer.status)}</TableCell>
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
                    <CardDescription>Manage driver accounts and assignments</CardDescription>
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
                    {mockDrivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>
                          <div>
                            <p>{driver.vehicle}</p>
                            <p className="text-xs text-muted-foreground">{driver.licensePlate}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{driver.currentLocation}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            {driver.rating}
                          </div>
                        </TableCell>
                        <TableCell>{driver.deliveries}</TableCell>
                        <TableCell>₱{driver.earnings.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(driver.status)}</TableCell>
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
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Remove
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
                    <CardDescription>View and manage customer orders</CardDescription>
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
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell className="font-medium">{order.customer}</TableCell>
                        <TableCell className="text-muted-foreground">{order.farm}</TableCell>
                        <TableCell>
                          {order.driver || (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>₱{order.total.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{order.date}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                              {!order.driver && (
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
                  <p className="text-xl font-bold text-primary">{selectedFarmer.products}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">₱{(selectedFarmer.totalSales / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <p className="text-xl font-bold">{selectedFarmer.rating}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joined:</span>
                <span>{selectedFarmer.joinedDate}</span>
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
                  <p className="font-medium">{selectedDriver.vehicle}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.licensePlate}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedDriver.status)}
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
                  {selectedDriver.currentLocation}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">{selectedDriver.deliveries}</p>
                  <p className="text-xs text-muted-foreground">Deliveries</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-xl font-bold text-primary">₱{(selectedDriver.earnings / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <p className="text-xl font-bold">{selectedDriver.rating}</p>
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
            <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="p-3 bg-secondary rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedOrder.customer}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {selectedOrder.customerPhone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedOrder.deliveryAddress}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Farm</p>
                  <p className="font-medium">{selectedOrder.farm}</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-medium">{selectedOrder.driver || "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedOrder.items} items</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.date}</p>
                </div>
                <p className="text-2xl font-bold text-primary">₱{selectedOrder.total.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {!selectedOrder.driver && (
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
