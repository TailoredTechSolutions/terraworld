import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletCard from "@/components/wallet/WalletCard";
import RankProgress from "@/components/rank/RankProgress";

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

const MemberDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [bvRecords, setBVRecords] = useState<BVRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [binaryStats, setBinaryStats] = useState<BinaryStats>({
    left_bv: 0,
    right_bv: 0,
    matched_bv: 0,
    carryforward_left: 0,
    carryforward_right: 0,
  });

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

    } catch (error) {
      console.error("Error fetching member data:", error);
      toast({
        title: "Error",
        description: "Failed to load member data",
        variant: "destructive",
      });
    }
  };

  const totalBV = bvRecords.reduce((sum, r) => sum + Number(r.bv_amount), 0);
  const totalEarnings = payouts.reduce((sum, p) => sum + Number(p.net_amount), 0);
  const tierConfig = membership ? TIER_CONFIG[membership.tier] : TIER_CONFIG.free;

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
              Sign in to view your membership details, BV tracking, binary structure, and earnings.
            </p>
            <Button className="btn-primary-gradient" asChild>
              <Link to="/auth">Sign In to Continue</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Member Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={checkAuthAndFetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Membership Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-card">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
                    {membership?.sponsor_id && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        Sponsored
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {membership ? new Date(membership.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalBV.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total BV</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">₱{totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">₱{tierConfig.cap.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Daily Cap</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        {/* Binary Structure Visualization */}
        <Card className="mb-8">
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
                      <Badge variant="outline" className="mt-1">Empty</Badge>
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
                      <Badge variant="outline" className="mt-1">Empty</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet & Rank Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <WalletCard userId={user.id} />
          <RankProgress
            userId={user.id}
            currentRankId={membership?.current_rank_id || undefined}
            personalBV={totalBV}
            leftLegBV={binaryStats.left_bv}
            rightLegBV={binaryStats.right_bv}
            directReferrals={0} // TODO: Calculate from profiles table
          />
        </div>

        {/* Tabs for History */}
        <Tabs defaultValue="bv" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="bv" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              BV History
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2">
              <Wallet className="h-4 w-4" />
              Payouts
            </TabsTrigger>
          </TabsList>

          {/* BV History Tab */}
          <TabsContent value="bv">
            <Card>
              <CardHeader>
                <CardTitle>Business Volume History</CardTitle>
                <CardDescription>{bvRecords.length} records</CardDescription>
              </CardHeader>
              <CardContent>
                {bvRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No BV records yet</p>
                    <p className="text-sm">Make referral purchases to earn BV</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Leg</TableHead>
                        <TableHead>BV Amount</TableHead>
                        <TableHead>Terra Fee</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bvRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.bv_type === "product" ? "secondary" : "default"}>
                              {record.bv_type === "product" ? (
                                <ShoppingBag className="h-3 w-3 mr-1" />
                              ) : (
                                <Crown className="h-3 w-3 mr-1" />
                              )}
                              {record.bv_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.leg ? (
                              <Badge variant="outline" className="capitalize">
                                {record.leg === "left" ? (
                                  <ArrowLeftCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowRightCircle className="h-3 w-3 mr-1" />
                                )}
                                {record.leg}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            +{Number(record.bv_amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.terra_fee ? `₱${Number(record.terra_fee).toLocaleString()}` : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {record.source_description || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  {payouts.length} payouts • Total: ₱{totalEarnings.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No payouts yet</p>
                    <p className="text-sm">Build your network to start earning</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Bonus Type</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Net</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {payout.payout_period}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {BONUS_TYPE_LABELS[payout.bonus_type] || payout.bonus_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            ₱{Number(payout.gross_amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            ₱{Number(payout.net_amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {payout.level_depth ? (
                              <Badge variant="outline">L{payout.level_depth}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {payout.notes || "—"}
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
      </main>

      <Footer />
    </div>
  );
};

export default MemberDashboard;
