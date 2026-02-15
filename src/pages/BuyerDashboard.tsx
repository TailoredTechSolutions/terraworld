import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, User, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyerSidebar from "@/components/buyer/BuyerSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy panel imports
import BuyerShopPanel from "@/components/buyer/BuyerShopPanel";
import BuyerOrdersPanel from "@/components/buyer/BuyerOrdersPanel";
import BuyerWalletPanel from "@/components/buyer/BuyerWalletPanel";
import BuyerTokensPanel from "@/components/buyer/BuyerTokensPanel";
import BuyerReferralsPanel from "@/components/buyer/BuyerReferralsPanel";
import BuyerSupportPanel from "@/components/buyer/BuyerSupportPanel";

const BuyerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "shop";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Buyer Dashboard</h1>
            <p className="text-muted-foreground">
              Sign in to browse products, track orders, manage your wallet, and earn token rewards.
            </p>
            <Button className="btn-primary-gradient" asChild>
              <Link to="/auth?role=buyer">Register as Buyer</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      shop: "Shop",
      orders: "My Orders",
      wallet: "Wallet & Payments",
      tokens: "Token Rewards",
      referrals: "Referral Tracking",
      support: "Support & Disputes",
    };
    return titles[activeTab] || "Dashboard";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "shop":
        return <BuyerShopPanel />;
      case "orders":
        return <BuyerOrdersPanel userId={user.id} />;
      case "wallet":
        return <BuyerWalletPanel userId={user.id} />;
      case "tokens":
        return <BuyerTokensPanel userId={user.id} />;
      case "referrals":
        return <BuyerReferralsPanel userId={user.id} referralCode={profile?.referral_code || ""} />;
      case "support":
        return <BuyerSupportPanel />;
      default:
        return <BuyerShopPanel />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <BuyerSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{profile?.full_name || user.email?.split("@")[0]}</h1>
                  <Badge variant="secondary">Buyer</Badge>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-6">{getPageTitle()}</h2>
            {renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
