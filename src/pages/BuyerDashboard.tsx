import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, User, ShoppingBag, Wallet, Coins, Users, TrendingUp, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import AdminDashboardWrapper from "@/components/admin/AdminDashboardWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyerSidebar from "@/components/buyer/BuyerSidebar";
import DashboardHero from "@/components/DashboardHero";
import { SHOP_HERO as shopHero } from "@/lib/siteImages";

// Panel imports
import BuyerOverviewPanel from "@/components/buyer/BuyerOverviewPanel";
import BuyerShopPanel from "@/components/buyer/BuyerShopPanel";
import BuyerOrdersPanel from "@/components/buyer/BuyerOrdersPanel";
import BuyerWalletPanel from "@/components/buyer/BuyerWalletPanel";
import BuyerTokensPanel from "@/components/buyer/BuyerTokensPanel";
import BuyerReferralsPanel from "@/components/buyer/BuyerReferralsPanel";
import BuyerProfilePanel from "@/components/buyer/BuyerProfilePanel";
import BuyerNotificationsPanel from "@/components/buyer/BuyerNotificationsPanel";
import BuyerSupportPanel from "@/components/buyer/BuyerSupportPanel";

const SCROLL_OFFSET = 80;

const BuyerDashboardInner = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { user, profile, loading } = useAuth();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mainRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Fetch real-time KPI data for hero badges
  const { data: kpiData } = useQuery({
    queryKey: ["buyer-hero-kpis", user?.id],
    queryFn: async () => {
      if (!user?.id) return { orders: 0, wallet: 0, tokens: 0, referrals: 0 };
      const email = profile?.email || user.email;
      const [ordersRes, walletRes, tokensRes, referralsRes] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("customer_email", email || ""),
        supabase.from("wallets").select("available_balance").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("agri_token_balance").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", profile?.id || ""),
      ]);
      return {
        orders: ordersRes.count || 0,
        wallet: Number(walletRes.data?.available_balance || 0),
        tokens: Number(tokensRes.data?.agri_token_balance || 0),
        referrals: referralsRes.count || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const registerSection = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el && mainRef.current) {
      const containerTop = mainRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const offset = elTop - containerTop + mainRef.current.scrollTop - SCROLL_OFFSET;
      mainRef.current.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, []);

  // Scroll spy
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 400);

      const sectionIds = Object.keys(sectionRefs.current);
      let currentSection = sectionIds[0];

      for (const id of sectionIds) {
        const el = sectionRefs.current[id];
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          if (rect.top - containerRect.top <= SCROLL_OFFSET + 100) {
            currentSection = id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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

  const sections = [
    { id: "home", label: "Overview", component: <BuyerOverviewPanel userId={user.id} onTabChange={scrollToSection} /> },
    { id: "shop", label: "Shop", component: <BuyerShopPanel /> },
    { id: "orders", label: "My Orders", component: <BuyerOrdersPanel userId={user.id} /> },
    { id: "wallet", label: "Wallet & Payments", component: <BuyerWalletPanel userId={user.id} /> },
    { id: "tokens", label: "Token Rewards", component: <BuyerTokensPanel userId={user.id} /> },
    { id: "referrals", label: "Referral Tracking", component: <BuyerReferralsPanel userId={user.id} referralCode={profile?.referral_code || ""} /> },
    { id: "notifications", label: "Notifications", component: <BuyerNotificationsPanel userId={user.id} /> },
    { id: "support", label: "Support & Disputes", component: <BuyerSupportPanel /> },
    { id: "profile", label: "My Profile", component: <BuyerProfilePanel userId={user.id} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <BuyerSidebar activeTab={activeSection} onTabChange={scrollToSection} />
        <main ref={mainRef} className="flex-1 overflow-auto relative">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Cinematic Hero Banner */}
            <DashboardHero
              title={profile?.full_name || user.email?.split("@")[0] || "Buyer Dashboard"}
              subtitle="Browse farm-fresh products, track orders, and earn rewards"
              badge="🛒 Buyer Account"
              backgroundImage={shopHero}
              kpis={[
                { icon: ShoppingBag, label: "Orders", value: (kpiData?.orders ?? 0).toString() },
                { icon: Wallet, label: "Wallet", value: `₱${(kpiData?.wallet ?? 0).toLocaleString()}` },
                { icon: Coins, label: "AGRI", value: (kpiData?.tokens ?? 0).toLocaleString() },
                { icon: Users, label: "Referrals", value: (kpiData?.referrals ?? 0).toString() },
              ]}
            />

            {/* All sections rendered vertically */}
            <div className="space-y-10">
              {sections.map((section) => (
                <div
                  key={section.id}
                  id={`buyer-${section.id}`}
                  ref={registerSection(section.id)}
                  className="scroll-mt-20"
                >
                  <h2 className="text-xl font-bold mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b border-border">
                    {section.label}
                  </h2>
                  {section.component}
                </div>
              ))}
            </div>
          </div>

          {/* Back to Top */}
          {showBackToTop && (
            <Button
              size="icon"
              className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
              onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

const BuyerDashboard = () => {
  const { isAnyAdmin } = useUserRoles();

  if (isAnyAdmin) {
    return (
      <AdminDashboardWrapper
        roleFilter="buyer"
        title="Buyer Management"
        description="View and manage all registered buyers on the platform"
      >
        {() => <BuyerDashboardInner />}
      </AdminDashboardWrapper>
    );
  }

  return <BuyerDashboardInner />;
};

export default BuyerDashboard;
