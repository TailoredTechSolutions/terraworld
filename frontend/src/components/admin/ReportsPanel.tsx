import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Coins,
  BarChart3,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  lastGenerated?: string;
}

const availableReports: ReportCard[] = [
  {
    title: "BV Summary Report",
    description: "Total Business Volume by period, type, and member tier",
    icon: TrendingUp,
    category: "Volume",
    lastGenerated: "Jan 25, 2026",
  },
  {
    title: "Commission Breakdown",
    description: "Detailed commission payouts by bonus type and tier",
    icon: DollarSign,
    category: "Financial",
    lastGenerated: "Jan 25, 2026",
  },
  {
    title: "Rank Distribution",
    description: "Member distribution across all rank levels",
    icon: Users,
    category: "Members",
    lastGenerated: "Jan 25, 2026",
  },
  {
    title: "Token Issuance Report",
    description: "Token rewards issued, value calculations, and vesting status",
    icon: Coins,
    category: "Tokens",
    lastGenerated: "Jan 24, 2026",
  },
  {
    title: "Withdrawal Summary",
    description: "Withdrawal requests, methods, and processing times",
    icon: BarChart3,
    category: "Financial",
  },
  {
    title: "Audit Exceptions",
    description: "Flagged transactions and system anomalies",
    icon: AlertTriangle,
    category: "Audit",
  },
];

// Mock BV Summary data
const bvSummaryData = [
  { period: "Week 1", product: 12500, membership: 45000 },
  { period: "Week 2", product: 18200, membership: 52000 },
  { period: "Week 3", product: 15800, membership: 38000 },
  { period: "Week 4", product: 22100, membership: 61000 },
];

// Mock Commission data
const commissionData = [
  { type: "Direct Product", amount: 15230, percentage: 18 },
  { type: "Direct Membership", amount: 28450, percentage: 34 },
  { type: "Binary Matching", amount: 32100, percentage: 38 },
  { type: "Matching Bonus", amount: 8420, percentage: 10 },
];

// Mock Rank data
const rankData = [
  { rank: "Member", count: 450, color: "hsl(var(--muted))" },
  { rank: "Bronze", count: 120, color: "#cd7f32" },
  { rank: "Silver", count: 80, color: "#c0c0c0" },
  { rank: "Gold", count: 45, color: "#ffd700" },
  { rank: "Platinum", count: 20, color: "#e5e4e2" },
  { rank: "Diamond", count: 8, color: "#60a5fa" },
  { rank: "Crown", count: 2, color: "hsl(var(--primary))" },
];

// Mock Audit data
const auditExceptions = [
  { id: "AE001", type: "High Withdrawal", description: "Withdrawal exceeds daily limit", severity: "warning", date: "2026-01-25" },
  { id: "AE002", type: "Unusual Activity", description: "Multiple login attempts from different IPs", severity: "info", date: "2026-01-24" },
  { id: "AE003", type: "Binary Imbalance", description: "Extreme leg volume difference detected", severity: "warning", date: "2026-01-23" },
];

const ReportsPanel = () => {
  const [selectedReport, setSelectedReport] = useState<string>("bv-summary");
  const [periodFilter, setPeriodFilter] = useState("this-month");

  const renderReportContent = () => {
    switch (selectedReport) {
      case "bv-summary":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold">₱{(68600).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Product BV</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold">₱{(196000).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Membership BV</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold">₱{(264600).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Combined BV</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-primary">+18%</p>
                  <p className="text-xs text-muted-foreground">vs Last Period</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">BV by Week</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    product: { label: "Product BV", color: "hsl(var(--primary))" },
                    membership: { label: "Membership BV", color: "hsl(var(--accent))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bvSummaryData}>
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="product" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="membership" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "commission-breakdown":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {commissionData.map((item) => (
                <Card key={item.type}>
                  <CardContent className="pt-4">
                    <p className="text-xl font-bold">₱{item.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                    <Badge variant="secondary" className="mt-1">{item.percentage}%</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Commission Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commissionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="amount"
                        label={({ type, percentage }) => `${type}: ${percentage}%`}
                        labelLine={false}
                      >
                        {commissionData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"][index]} 
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "rank-distribution":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Members by Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Binary Cap</TableHead>
                      <TableHead>Matching Depth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { rank: "Member", count: 450, cap: "₱5,000", depth: 0 },
                      { rank: "Bronze", count: 120, cap: "₱10,000", depth: 1 },
                      { rank: "Silver", count: 80, cap: "₱20,000", depth: 2 },
                      { rank: "Gold", count: 45, cap: "₱35,000", depth: 3 },
                      { rank: "Platinum", count: 20, cap: "₱50,000", depth: 4 },
                      { rank: "Diamond", count: 8, cap: "₱100,000", depth: 5 },
                      { rank: "Crown Director", count: 2, cap: "₱250,000", depth: 7 },
                    ].map((row) => (
                      <TableRow key={row.rank}>
                        <TableCell className="font-medium">{row.rank}</TableCell>
                        <TableCell>{row.count}</TableCell>
                        <TableCell>{((row.count / 725) * 100).toFixed(1)}%</TableCell>
                        <TableCell>{row.cap}/day</TableCell>
                        <TableCell>{row.depth} levels</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "audit-exceptions":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Exceptions</CardTitle>
                <CardDescription>Flagged transactions and system anomalies requiring review</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditExceptions.map((exception) => (
                      <TableRow key={exception.id}>
                        <TableCell className="font-mono text-sm">{exception.id}</TableCell>
                        <TableCell className="font-medium">{exception.type}</TableCell>
                        <TableCell className="text-muted-foreground">{exception.description}</TableCell>
                        <TableCell>
                          <Badge variant={exception.severity === "warning" ? "destructive" : "secondary"}>
                            {exception.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{exception.date}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Review</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a report to view</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableReports.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.title.toLowerCase().replace(/ /g, "-");
          return (
            <Card
              key={report.title}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedReport(report.title.toLowerCase().replace(/ /g, "-"))}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <Badge variant="outline" className="text-xs">{report.category}</Badge>
                  {report.lastGenerated && (
                    <span className="text-xs text-muted-foreground">{report.lastGenerated}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              {availableReports.find((r) => r.title.toLowerCase().replace(/ /g, "-") === selectedReport)?.title || "Report"}
            </CardTitle>
            <div className="flex gap-2">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderReportContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPanel;
