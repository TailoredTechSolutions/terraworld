import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { Download, Calendar, Mail } from "lucide-react";

const salesByCategory = [
  { name: "Vegetables", value: 42 },
  { name: "Fruits", value: 28 },
  { name: "Specialty", value: 15 },
  { name: "Meat", value: 10 },
  { name: "Dairy", value: 5 },
];
const COLORS = ["hsl(218,72%,38%)", "hsl(2,72%,48%)", "hsl(44,92%,50%)", "hsl(148,55%,38%)", "hsl(26,36%,36%)"];

const monthlySales = [
  { month: "Oct", sales: 180000 }, { month: "Nov", sales: 220000 }, { month: "Dec", sales: 310000 },
  { month: "Jan", sales: 280000 }, { month: "Feb", sales: 350000 }, { month: "Mar", sales: 240000 },
];

const userGrowth = [
  { month: "Oct", farmers: 98, buyers: 1200 }, { month: "Nov", farmers: 110, buyers: 1580 },
  { month: "Dec", farmers: 125, buyers: 2100 }, { month: "Jan", farmers: 132, buyers: 2600 },
  { month: "Feb", farmers: 138, buyers: 3100 }, { month: "Mar", farmers: 142, buyers: 3284 },
];

const REPORT_TEMPLATES = [
  { name: "Monthly Sales Summary", description: "Revenue, orders, and fees breakdown" },
  { name: "Farmer Performance", description: "Sales per farmer, product rankings" },
  { name: "MLM Commission Report", description: "Commission runs, payouts, network growth" },
  { name: "Financial Reconciliation", description: "Payments vs payouts vs fees" },
  { name: "Logistics Performance", description: "Delivery times, success rates, driver metrics" },
];

const ReportsAnalyticsSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date Range</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3.5 w-3.5" /> Export PDF</Button>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Mail className="h-3.5 w-3.5" /> Schedule Email</Button>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="h-8">
          <TabsTrigger value="sales" className="text-xs h-7">Sales</TabsTrigger>
          <TabsTrigger value="users" className="text-xs h-7">User Growth</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs h-7">Categories</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs h-7">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-3">
          <div className="rounded-lg border border-border/50 bg-card/60 p-4">
            <h3 className="text-sm font-semibold mb-3">Monthly Sales (6 months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₱${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`₱${v.toLocaleString()}`, "Sales"]} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-3">
          <div className="rounded-lg border border-border/50 bg-card/60 p-4">
            <h3 className="text-sm font-semibold mb-3">User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="farmers" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="buyers" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-3">
          <div className="rounded-lg border border-border/50 bg-card/60 p-4">
            <h3 className="text-sm font-semibold mb-3">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesByCategory} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-3">
          <div className="space-y-2">
            {REPORT_TEMPLATES.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60">
                <div>
                  <p className="text-xs font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">Generate</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs"><Download className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalyticsSection;
