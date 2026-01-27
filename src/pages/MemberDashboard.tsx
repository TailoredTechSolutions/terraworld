import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  GitBranch,
  Users,
  Wallet,
  TrendingUp,
  ArrowLeftCircle,
  ArrowRightCircle,
  Loader2,
  User,
  Calendar,
  ShoppingBag,
  Award,
  RefreshCw,
  Shield,
  DollarSign,
  CreditCard,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletCard from "@/components/wallet/WalletCard";
import RankProgress from "@/components/rank/RankProgress";
import KYCStatusBadge from "@/components/kyc/KYCStatusBadge";
import KYCVerificationForm from "@/components/kyc/KYCVerificationForm";
import KYCDocumentUpload from "@/components/kyc/KYCDocumentUpload";
import KYCDocumentsList from "@/components/kyc/KYCDocumentsList";
import MemberSidebar from "@/components/member/MemberSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface Membership {
  id: string;
  user_id: string;
  tier: string;
  package_price: number;
  membership_bv: number;
  sponsor_id: string | null;
  left_leg_id: string | null;
  right_leg_id: string | null;
  placement_side: string | null;
  current_rank_id: string | null;
  created_at: string;
}

interface BVRecord {
  id: string;
  bv_type: string;
  leg: string | null;
  bv_amount: number;
  terra_fee: number | null;
  source_description: string | null;
  created_at: string;
}

interface PayoutRecord {
  id: string;
  payout_period: string;
  bonus_type: string;
  gross_amount: number;
  net_amount: number;
  level_depth: number | null;
  notes: string | null;
  created_at: string;
}

interface BinaryStats {
  left_bv: number;
  right_bv: number;
  matched_bv: number;
  carryforward_left: number;
  carryforward_right: number;
}

interface WalletData {
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
}

const TIER_CONFIG: Record<string, { color: string; label: string; cap: number }> = {
  free: { color: "bg-muted text-muted-foreground", label: "Free", cap: 0 },
  starter: { color: "bg-secondary text-secondary-foreground", label: "Starter", cap: 5000 },
  basic: { color: "bg-accent/20 text-accent-foreground", label: "Basic", cap: 15000 },
  pro: { color: "bg-primary/20 text-primary", label: "Pro", cap: 50000 },
  elite: { color: "bg-gradient-to-r from-primary to-accent text-primary-foreground", label: "Elite", cap: 250000 },
};

const BONUS_TYPE_LABELS: Record<string, string> = {
  direct_product: "Direct Product",
  direct_membership: "Direct Membership",
  binary: "Binary Match",
  matching: "Matching Bonus",
};

type KYCStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

interface KYCProfile {
  id: string;
  user_id: string;
  account_type: 'individual' | 'company';
  status: KYCStatus;
}

// Generate sample earnings data
const generateEarningsData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    earnings: Math.floor(Math.random() * 500) + 100,
  }));
};

const MemberDashboard = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [bvRecords, setBVRecords] = useState<BVRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [kycProfile, setKycProfile] = useState<KYCProfile | null>(null);
  const [kycRefreshTrigger, setKycRefreshTrigger] = useState(0);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [earningsData] = useState(generateEarningsData);
  const [binaryStats, setBinaryStats] = useState<BinaryStats>({
    left_bv: 0,
    right_bv: 0,
    matched_bv: 0,
    carryforward_left: 0,
    carryforward_right: 0,
  });
  const isMobile = useIsMobile();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({ id: session.user.id, email: session.user.email || "" });
      await fetchMemberData(session.user.id);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberData = async (userId: string) => {
    try {
      // Fetch membership
      const { data: membershipData, error: membershipError } = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) throw membershipError;
      setMembership(membershipData);

      // Fetch wallet
      const { data: walletResult } = await supabase
        .from("wallets")
        .select("available_balance, pending_balance, total_withdrawn")
        .eq("user_id", userId)
        .maybeSingle();
      
      setWalletData(walletResult);

      // Fetch BV records
      const { data: bvData, error: bvError } = await supabase
        .from("bv_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (bvError) throw bvError;
      setBVRecords(bvData || []);

      // Calculate BV totals by leg
      const leftBV = (bvData || [])
        .filter(r => r.leg === "left")
        .reduce((sum, r) => sum + Number(r.bv_amount), 0);
      const rightBV = (bvData || [])
        .filter(r => r.leg === "right")
        .reduce((sum, r) => sum + Number(r.bv_amount), 0);

      // Fetch latest binary ledger for carryforward
      const { data: binaryData } = await supabase
        .from("binary_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("payout_period", { ascending: false })
        .limit(1)
        .maybeSingle();

      setBinaryStats({
        left_bv: leftBV + (binaryData?.carryforward_left || 0),
        right_bv: rightBV + (binaryData?.carryforward_right || 0),
        matched_bv: binaryData?.matched_bv || 0,
        carryforward_left: binaryData?.carryforward_left || 0,
        carryforward_right: binaryData?.carryforward_right || 0,
      });

      // Fetch payouts
      const { data: payoutData, error: payoutError } = await supabase
        .from("payout_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (payoutError) throw payoutError;
      setPayouts(payoutData || []);

      // Fetch KYC profile
      const { data: kycData } = await supabase
        .from("kyc_profiles")
        .select("id, user_id, account_type, status")
        .eq("user_id", userId)
        .maybeSingle();

      setKycProfile(kycData);

    } catch (error) {
      console.error("Error fetching member data:", error);
      toast({
        title: "Error",
        description: "Failed to load member data",
        variant: "destructive",
      });
    }
  };

  const handleKYCFormSuccess = () => {
    if (user) {
      fetchMemberData(user.id);
    }
  };

  const handleKYCDocumentUpload = () => {
    setKycRefreshTrigger(prev => prev + 1);
  };

  const totalBV = bvRecords.reduce((sum, r) => sum + Number(r.bv_amount), 0);
  const totalEarnings = payouts.reduce((sum, p) => sum + Number(p.net_amount), 0);
  const tierConfig = membership ? TIER_CONFIG[membership.tier] : TIER_CONFIG.free;

  // Calculate payout this week (from payouts in last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const payoutThisWeek = payouts
    .filter(p => new Date(p.created_at) >= oneWeekAgo)
    .reduce((sum, p) => sum + Number(p.net_amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="max-w-md space-y-6">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Member Dashboard</h1>
            <p className="text-muted-foreground">
              Access your centralized dashboard displaying performance indicators, binary structure, earnings breakdown, rank progress, wallet balances, and activity history.
            </p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Binary Network</p>
                <p className="text-sm font-medium">Left & Right Legs</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Wallet System</p>
                <p className="text-sm font-medium">Multi-Currency</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Rank Progression</p>
                <p className="text-sm font-medium">7 Career Tiers</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Payouts</p>
                <p className="text-sm font-medium">Bank, GCash, Crypto</p>
              </div>
            </div>
            <Button className="btn-primary-gradient" asChild>
              <Link to="/auth">Sign In to Continue</Link>
            </Button>
          </div>
        </main>
        <Footer />
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
                <p className="text-sm text-muted-foreground">Total Membership</p>
                <p className="text-3xl font-bold">₱{(membership?.package_price || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <Crown className="h-6 w-6 text-primary" />
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
                <Users className="h-6 w-6 text-accent" />
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

      {/* Wallets Section */}
      <Card>
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Commission Wallet</span>
              </div>
              <p className="text-2xl font-bold">₱{(walletData?.available_balance || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Active 26d</p>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Main Wallet</span>
              </div>
              <p className="text-2xl font-bold">₱{(walletData?.pending_balance || 0).toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-secondary">
                  <Coins className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Vase Wallet</span>
              </div>
              <p className="text-2xl font-bold">₱{(walletData?.total_withdrawn || 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            My Earnings This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              earnings: { label: "Earnings", color: "hsl(var(--primary))" },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" />
                <YAxis />
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowLeftCircle className="h-4 w-4" />
            Left Leg BV
          </div>
          <p className="text-2xl font-bold">{binaryStats.left_bv.toLocaleString()}</p>
          {binaryStats.carryforward_left > 0 && (
            <p className="text-xs text-muted-foreground">+{binaryStats.carryforward_left.toLocaleString()} carryforward</p>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowRightCircle className="h-4 w-4" />
            Right Leg BV
          </div>
          <p className="text-2xl font-bold">{binaryStats.right_bv.toLocaleString()}</p>
          {binaryStats.carryforward_right > 0 && (
            <p className="text-xs text-muted-foreground">+{binaryStats.carryforward_right.toLocaleString()} carryforward</p>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <GitBranch className="h-4 w-4" />
            Matched BV
          </div>
          <p className="text-2xl font-bold text-primary">{binaryStats.matched_bv.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Lesser leg × 10%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            Pending Payout
          </div>
          <p className="text-2xl font-bold text-accent">
            ₱{(Math.min(binaryStats.left_bv, binaryStats.right_bv) * 0.10).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Estimated</p>
        </Card>
      </div>
    </div>
  );

  const renderGenealogyTab = () => (
    <div className="space-y-6">
      {/* Binary Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Your Downline (Left)</p>
          <p className="text-2xl font-bold">{binaryStats.left_bv.toLocaleString()}</p>
          <p className="text-xs text-primary">BV L SIDE</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Your Downline (Right)</p>
          <p className="text-2xl font-bold">{binaryStats.right_bv.toLocaleString()}</p>
          <p className="text-xs text-accent">BV R SIDE</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Payout</p>
          <p className="text-2xl font-bold">₱{totalEarnings.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total paid</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Your Spillover</p>
          <p className="text-2xl font-bold">115.0</p>
          <p className="text-xs text-muted-foreground">Saved_000d</p>
        </Card>
      </div>

      {/* Binary Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Binary Structure
          </CardTitle>
          <CardDescription>Your downline organization tree</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* You (Root) */}
            <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary text-center mb-4">
              <Crown className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="font-semibold">You</p>
              <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
            </div>
            
            {/* Connector Line */}
            <div className="h-8 w-px bg-border" />
            
            {/* Horizontal Connector */}
            <div className="flex items-center gap-0">
              <div className="w-24 md:w-32 h-px bg-border" />
              <div className="h-4 w-px bg-border" />
              <div className="w-24 md:w-32 h-px bg-border" />
            </div>
            
            {/* Left and Right Legs */}
            <div className="flex gap-8 md:gap-16 mt-4">
              {/* Left Leg */}
              <div className="flex flex-col items-center">
                <div className="h-4 w-px bg-border" />
                <div className={`p-4 rounded-xl border-2 text-center min-w-[120px] ${
                  membership?.left_leg_id ? "bg-secondary/50 border-secondary" : "bg-muted/30 border-dashed border-muted-foreground/30"
                }`}>
                  <ArrowLeftCircle className={`h-5 w-5 mx-auto mb-1 ${membership?.left_leg_id ? "text-foreground" : "text-muted-foreground"}`} />
                  <p className="font-medium text-sm">Left Leg</p>
                  <p className="text-lg font-bold text-primary">{binaryStats.left_bv.toLocaleString()} BV</p>
                  {membership?.left_leg_id ? (
                    <Badge variant="secondary" className="mt-1">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1">Open Slot 0</Badge>
                  )}
                </div>
              </div>
              
              {/* Right Leg */}
              <div className="flex flex-col items-center">
                <div className="h-4 w-px bg-border" />
                <div className={`p-4 rounded-xl border-2 text-center min-w-[120px] ${
                  membership?.right_leg_id ? "bg-secondary/50 border-secondary" : "bg-muted/30 border-dashed border-muted-foreground/30"
                }`}>
                  <ArrowRightCircle className={`h-5 w-5 mx-auto mb-1 ${membership?.right_leg_id ? "text-foreground" : "text-muted-foreground"}`} />
                  <p className="font-medium text-sm">Right Leg</p>
                  <p className="text-lg font-bold text-primary">{binaryStats.right_bv.toLocaleString()} BV</p>
                  {membership?.right_leg_id ? (
                    <Badge variant="secondary" className="mt-1">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1">Open Slot 0</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEarningsTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <WalletCard userId={user.id} />
        <RankProgress
          userId={user.id}
          currentRankId={membership?.current_rank_id || undefined}
          personalBV={totalBV}
          leftLegBV={binaryStats.left_bv}
          rightLegBV={binaryStats.right_bv}
          directReferrals={0}
        />
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Payout History
          </CardTitle>
          <CardDescription>Your recent payouts and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No payouts yet</p>
              <p className="text-sm">Complete sales and build your network to earn</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.slice(0, 10).map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="text-sm">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {BONUS_TYPE_LABELS[payout.bonus_type] || payout.bonus_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payout.notes || "Binary"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₱{Number(payout.net_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Credited</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderKYCTab = () => (
    <div className="space-y-6">
      {/* KYC Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                KYC Verification
              </CardTitle>
              <CardDescription>Complete your identity verification</CardDescription>
            </div>
            {kycProfile && <KYCStatusBadge status={kycProfile.status} />}
          </div>
        </CardHeader>
        <CardContent>
          {!kycProfile || kycProfile.status === 'not_started' ? (
            <KYCVerificationForm 
              userId={user.id} 
              onSubmitSuccess={handleKYCFormSuccess} 
            />
          ) : (
            <div className="space-y-6">
              <KYCDocumentUpload
                kycProfileId={kycProfile.id}
                userId={user.id}
                accountType={kycProfile.account_type}
                onUploadComplete={handleKYCDocumentUpload}
              />
              <KYCDocumentsList
                userId={user.id}
                kycProfileId={kycProfile.id}
                refreshTrigger={kycRefreshTrigger}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'genealogy':
        return renderGenealogyTab();
      case 'earnings':
        return renderEarningsTab();
      case 'settings':
        return renderKYCTab();
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
        <MemberSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{user.email.split('@')[0]}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
                    {kycProfile && <KYCStatusBadge status={kycProfile.status} />}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={checkAuthAndFetchData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Page Title */}
            <h2 className="text-2xl font-bold mb-6 capitalize">
              {activeTab === 'overview' ? 'Dashboard' : activeTab.replace('-', ' ')}
            </h2>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default MemberDashboard;
