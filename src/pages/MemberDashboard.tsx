import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Loader2,
  User,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KYCStatusBadge from "@/components/kyc/KYCStatusBadge";
import KYCVerificationForm from "@/components/kyc/KYCVerificationForm";
import KYCDocumentUpload from "@/components/kyc/KYCDocumentUpload";
import KYCDocumentsList from "@/components/kyc/KYCDocumentsList";
import MemberSidebar from "@/components/member/MemberSidebar";
import MemberOverviewPanel from "@/components/member/MemberOverviewPanel";
import MemberGenealogyPanel from "@/components/member/MemberGenealogyPanel";
import MemberEarningsPanel from "@/components/member/MemberEarningsPanel";
import MemberWithdrawPanel from "@/components/member/MemberWithdrawPanel";
import MemberUpgradePanel from "@/components/member/MemberUpgradePanel";
import MemberSupportPanel from "@/components/member/MemberSupportPanel";
import MemberShopPanel from "@/components/member/MemberShopPanel";
import BinaryTreeVisualization from "@/components/member/BinaryTreeVisualization";
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

type KYCStatus = 'not_started' | 'pending' | 'in_review' | 'approved' | 'rejected';

interface KYCProfile {
  id: string;
  user_id: string;
  account_type: 'individual' | 'company';
  status: KYCStatus;
}

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
  const [profileData, setProfileData] = useState<{
    agri_token_balance: number | null;
    external_wallet_address: string | null;
  } | null>(null);
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

      // Fetch profile for AGRI token balance
      const { data: profileResult } = await supabase
        .from("profiles")
        .select("agri_token_balance, external_wallet_address")
        .eq("user_id", userId)
        .maybeSingle();
      
      setProfileData(profileResult);

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

  const renderKYCTab = () => (
    <div className="space-y-6">
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
        return (
          <MemberOverviewPanel
            userId={user.id}
            membership={membership}
            walletData={walletData}
            binaryStats={binaryStats}
            totalEarnings={totalEarnings}
            payoutThisWeek={payoutThisWeek}
            currentRank="Member"
            profileData={profileData}
          />
        );
      case 'genealogy':
        return (
          <div className="space-y-6">
            <BinaryTreeVisualization
              userId={user.id}
              membership={membership}
              binaryStats={binaryStats}
            />
          </div>
        );
      case 'earnings':
        return (
          <MemberEarningsPanel
            userId={user.id}
            membership={membership}
            walletData={walletData}
            payouts={payouts}
            totalBV={totalBV}
            binaryStats={binaryStats}
          />
        );
      case 'withdraw':
        return (
          <MemberWithdrawPanel
            userId={user.id}
            walletData={walletData}
          />
        );
      case 'upgrade':
        return (
          <MemberUpgradePanel membership={membership} />
        );
      case 'support':
        return <MemberSupportPanel />;
      case 'shop':
        return <MemberShopPanel userId={user.id} />;
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

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: 'Dashboard',
      genealogy: 'Binary Genealogy',
      earnings: 'Earnings & Wallet',
      withdraw: 'Withdraw Funds',
      upgrade: 'Upgrade / Activation',
      support: 'Support & Tickets',
      shop: 'Shop',
      settings: 'Settings & KYC',
    };
    return titles[activeTab] || 'Dashboard';
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
            <h2 className="text-2xl font-bold mb-6">{getPageTitle()}</h2>

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
