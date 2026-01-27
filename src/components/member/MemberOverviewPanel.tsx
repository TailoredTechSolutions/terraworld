import { useState, useEffect } from "react";
import {
  Crown,
  Users,
  Wallet,
  TrendingUp,
  ArrowLeftCircle,
  ArrowRightCircle,
  DollarSign,
  CreditCard,
  Coins,
  Clock,
  Award,
  GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Progress } from "@/components/ui/progress";

interface MemberOverviewPanelProps {
  membership: {
    tier: string;
    package_price: number;
    current_rank_id?: string | null;
  } | null;
  walletData: {
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
  } | null;
  binaryStats: {
    left_bv: number;
    right_bv: number;
    matched_bv: number;
    carryforward_left: number;
    carryforward_right: number;
  };
  totalEarnings: number;
  payoutThisWeek: number;
  currentRank?: string;
}

const TIER_CONFIG: Record<string, { color: string; label: string; cap: number }> = {
  free: { color: "bg-muted text-muted-foreground", label: "Free", cap: 0 },
  starter: { color: "bg-secondary text-secondary-foreground", label: "Starter", cap: 5000 },
  basic: { color: "bg-accent/20 text-accent-foreground", label: "Basic", cap: 15000 },
  pro: { color: "bg-primary/20 text-primary", label: "Pro", cap: 50000 },
  elite: { color: "bg-gradient-to-r from-primary to-accent text-primary-foreground", label: "Elite", cap: 250000 },
};

// Generate sample earnings data
const generateEarningsData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    earnings: Math.floor(Math.random() * 500) + 100,
  }));
};

// Generate volume trend data
const generateVolumeTrend = () => {
  const weeks = ['W1', 'W2', 'W3', 'W4'];
  return weeks.map(week => ({
    week,
    left: Math.floor(Math.random() * 5000) + 1000,
    right: Math.floor(Math.random() * 5000) + 1000,
  }));
};

const MemberOverviewPanel = ({
  membership,
  walletData,
  binaryStats,
  totalEarnings,
  payoutThisWeek,
  currentRank = "Member",
}: MemberOverviewPanelProps) => {
  const [earningsData] = useState(generateEarningsData);
  const [volumeTrend] = useState(generateVolumeTrend);

  const tierConfig = membership ? TIER_CONFIG[membership.tier] : TIER_CONFIG.free;
  const dailyCap = tierConfig.cap;
  const matchedToday = Math.min(binaryStats.left_bv, binaryStats.right_bv);
  const capProgress = dailyCap > 0 ? Math.min((matchedToday / dailyCap) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings (Lifetime)</p>
                <p className="text-2xl font-bold">₱{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Earnings This Period</p>
                <p className="text-2xl font-bold">₱{payoutThisWeek.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-full bg-accent/20">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Balance</p>
                <p className="text-2xl font-bold">₱{(walletData?.pending_balance || 0).toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-full bg-secondary">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Rank</p>
                <p className="text-2xl font-bold">{currentRank}</p>
              </div>
              <div className="p-2 rounded-full bg-primary/20">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Binary Volume Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowLeftCircle className="h-4 w-4" />
            Binary Volume (Left)
          </div>
          <p className="text-2xl font-bold">{binaryStats.left_bv.toLocaleString()}</p>
          {binaryStats.carryforward_left > 0 && (
            <p className="text-xs text-primary">+{binaryStats.carryforward_left.toLocaleString()} carry-forward</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowRightCircle className="h-4 w-4" />
            Binary Volume (Right)
          </div>
          <p className="text-2xl font-bold">{binaryStats.right_bv.toLocaleString()}</p>
          {binaryStats.carryforward_right > 0 && (
            <p className="text-xs text-primary">+{binaryStats.carryforward_right.toLocaleString()} carry-forward</p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <GitBranch className="h-4 w-4" />
            Matched Volume (Today)
          </div>
          <p className="text-2xl font-bold text-primary">{matchedToday.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Period: {binaryStats.matched_bv.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Crown className="h-4 w-4" />
            Active Package
          </div>
          <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
          <p className="text-xs text-muted-foreground mt-1">₱{(membership?.package_price || 0).toLocaleString()}</p>
        </Card>
      </div>

      {/* Binary Cap Indicator */}
      {dailyCap > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily Binary Cap</span>
            <span className="text-sm text-muted-foreground">
              {matchedToday.toLocaleString()} / ₱{dailyCap.toLocaleString()}
            </span>
          </div>
          <Progress value={capProgress} className="h-2" />
          {capProgress >= 100 && (
            <p className="text-xs text-destructive mt-1 font-medium">Binary cap reached for today</p>
          )}
        </Card>
      )}

      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Commission Wallet</span>
              </div>
              <p className="text-2xl font-bold">₱{(walletData?.available_balance || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <span className="text-sm text-muted-foreground">Pending Wallet</span>
              </div>
              <p className="text-2xl font-bold text-amber-500">₱{(walletData?.pending_balance || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Coins className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Token Wallet</span>
              </div>
              <p className="text-2xl font-bold">0 AGRI</p>
              <p className="text-xs text-muted-foreground">Reward Tokens</p>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-secondary">
                  <CreditCard className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">External Wallet</span>
              </div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">On-Chain (Read-Only)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Snapshot */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Earnings This Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Earnings This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                earnings: { label: "Earnings", color: "hsl(var(--primary))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#earningsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-4 w-4 text-primary" />
              Volume Trend (Left vs Right)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                left: { label: "Left Leg", color: "hsl(var(--primary))" },
                right: { label: "Right Leg", color: "hsl(var(--accent))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeTrend}>
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="left" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="right" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberOverviewPanel;
