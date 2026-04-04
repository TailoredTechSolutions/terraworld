import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyticsApi, AnalyticsOverview, RevenueChartData, TopProduct, TopFarm } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#f97316',
  out_for_delivery: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const AnalyticsDashboardPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topFarms, setTopFarms] = useState<TopFarm[]>([]);
  const [orderDistribution, setOrderDistribution] = useState<Record<string, number>>({});
  const [chartDays, setChartDays] = useState(30);

  const fetchData = async () => {
    try {
      const [overviewData, chartData, productsData, farmsData, distributionData] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getRevenueChart(chartDays),
        analyticsApi.getTopProducts(10),
        analyticsApi.getTopFarms(10),
        analyticsApi.getOrderStatusDistribution(),
      ]);

      setOverview(overviewData);
      setRevenueChart(chartData);
      setTopProducts(productsData);
      setTopFarms(farmsData);
      setOrderDistribution(distributionData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chartDays]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(1)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const pieData = Object.entries(orderDistribution).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: statusColors[status] || '#6b7280',
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track performance and insights
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary">
            <Calendar className="h-3 w-3 mr-1" />
            Last {chartDays} days
          </Badge>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(overview.total_revenue)}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {formatCurrency(overview.weekly_revenue)} this week
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{overview.total_orders}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {overview.weekly_orders} this week
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(overview.average_order_value)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per transaction
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold">{overview.total_farms}</span>
                      <span className="text-xs text-muted-foreground">farms</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">{overview.total_products}</span>
                      <span className="text-xs text-muted-foreground">products</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="farms">Top Farms</TabsTrigger>
            <TabsTrigger value="orders">Order Status</TabsTrigger>
          </TabsList>

          {/* Revenue Chart */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Daily revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {[7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setChartDays(days)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        chartDays === days
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: 12, 
                        borderRadius: 8, 
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))"
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={false}
                      name="Revenue"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2} 
                      dot={false}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Products */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 11 }} 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="product_name" 
                      tick={{ fontSize: 11 }} 
                      width={150}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ 
                        fontSize: 12, 
                        borderRadius: 8,
                        backgroundColor: "hsl(var(--background))"
                      }}
                    />
                    <Bar dataKey="total_revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Farms */}
          <TabsContent value="farms">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Farms</CardTitle>
                <CardDescription>Farms by total revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFarms.map((farm, index) => (
                    <div key={farm._id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{farm._id}</p>
                        <p className="text-sm text-muted-foreground">
                          {farm.total_orders} orders • {farm.total_items} items sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{formatCurrency(farm.total_revenue)}</p>
                      </div>
                    </div>
                  ))}
                  {topFarms.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Status Distribution */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current status of all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <span className="text-lg font-bold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AnalyticsDashboardPage;
