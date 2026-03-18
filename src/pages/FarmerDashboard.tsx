import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useIsMobile } from "@/hooks/use-mobile";
import AdminDashboardWrapper from "@/components/admin/AdminDashboardWrapper";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FarmerSidebar from "@/components/farmer/FarmerSidebar";
import FarmerOverviewPanel from "@/components/farmer/FarmerOverviewPanel";
import FarmerProductsPanel from "@/components/farmer/FarmerProductsPanel";
import FarmerProfilePanel from "@/components/farmer/FarmerProfilePanel";
import FarmerEarningsPanel from "@/components/farmer/FarmerEarningsPanel";
import FarmerWithdrawalPanel from "@/components/farmer/FarmerWithdrawalPanel";
import FarmerNotificationsPanel from "@/components/farmer/FarmerNotificationsPanel";
import FarmerSupportPanel from "@/components/farmer/FarmerSupportPanel";
import FarmerDeliveryPanel from "@/components/farmer/FarmerDeliveryPanel";
import FarmerOrdersPanel from "@/components/farmer/FarmerOrdersPanel";
import FarmerTokensPanel from "@/components/farmer/FarmerTokensPanel";
import FarmerReferralsPanel from "@/components/farmer/FarmerReferralsPanel";
import FarmerPricingPanel from "@/components/farmer/FarmerPricingPanel";
import StatusChip from "@/components/backoffice/StatusChip";
import DashboardHero from "@/components/DashboardHero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tractor, MapPin, Phone, Mail,
  AlertCircle, Loader2, Package, DollarSign, Star, Truck,
} from "lucide-react";
import farmsHero from "@/assets/farms-hero.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Farmer = Tables<"farmers">;

const FarmerDashboardInner = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerSection = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    if (isMobile) {
      // On mobile, scroll to section
      const el = sectionRefs.current[tab];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setActiveTab(tab);
    }
  }, [isMobile]);

  const { data: farmer, isLoading: farmerLoading } = useQuery({
    queryKey: ["farmer-profile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from("farmers")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();
      if (error) throw error;
      return data as Farmer | null;
    },
    enabled: !!user?.email,
  });

  const { data: productCount } = useQuery({
    queryKey: ["farmer-product-count", farmer?.id],
    queryFn: async () => {
      if (!farmer?.id) return 0;
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("farmer_id", farmer.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!farmer?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["farmer-profile-ref", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || farmerLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Farmer Profile Not Found</CardTitle>
              <CardDescription>
                Your account is not linked to a farmer profile. Please contact support
                to register as a farmer on Terra.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Desktop: tab-based rendering (unchanged)
  const renderDesktopContent = () => {
    switch (activeTab) {
      case "overview":
        return <FarmerOverviewPanel farmerId={farmer.id} userId={user!.id} onNavigate={setActiveTab} />;
      case "products":
        return <FarmerProductsPanel farmerId={farmer.id} />;
      case "pricing":
        return <FarmerPricingPanel farmerId={farmer.id} />;
      case "orders":
        return <FarmerOrdersPanel farmerId={farmer.id} />;
      case "earnings":
        return <FarmerEarningsPanel farmerId={farmer.id} userId={user!.id} />;
      case "withdrawals":
        return <FarmerWithdrawalPanel userId={user!.id} />;
      case "delivery":
        return <FarmerDeliveryPanel farmerId={farmer.id} />;
      case "tokens":
        return <FarmerTokensPanel userId={user!.id} />;
      case "referrals":
        return <FarmerReferralsPanel userId={user!.id} referralCode={profile?.referral_code || ""} />;
      case "notifications":
        return <FarmerNotificationsPanel userId={user!.id} />;
      case "support":
        return <FarmerSupportPanel userId={user!.id} />;
      case "profile":
        return <FarmerProfilePanel farmer={farmer} />;
      default:
        return <FarmerOverviewPanel farmerId={farmer.id} userId={user!.id} onNavigate={setActiveTab} />;
    }
  };

  // Mobile: all sections stacked
  const mobileSections = [
    { id: "overview", label: "Farm Overview", component: <FarmerOverviewPanel farmerId={farmer.id} userId={user!.id} onNavigate={handleTabChange} /> },
    { id: "products", label: "Product Listings", component: <FarmerProductsPanel farmerId={farmer.id} /> },
    { id: "pricing", label: "Pricing", component: <FarmerPricingPanel farmerId={farmer.id} /> },
    { id: "orders", label: "Orders", component: <FarmerOrdersPanel farmerId={farmer.id} /> },
    { id: "delivery", label: "Delivery Status", component: <FarmerDeliveryPanel farmerId={farmer.id} /> },
    { id: "earnings", label: "Revenue & Earnings", component: <FarmerEarningsPanel farmerId={farmer.id} userId={user!.id} /> },
    { id: "withdrawals", label: "Withdrawals", component: <FarmerWithdrawalPanel userId={user!.id} /> },
    { id: "tokens", label: "Token Rewards", component: <FarmerTokensPanel userId={user!.id} /> },
    { id: "referrals", label: "Referrals", component: <FarmerReferralsPanel userId={user!.id} referralCode={profile?.referral_code || ""} /> },
    { id: "notifications", label: "Notifications", component: <FarmerNotificationsPanel userId={user!.id} /> },
    { id: "support", label: "Support", component: <FarmerSupportPanel userId={user!.id} /> },
    { id: "profile", label: "Profile", component: <FarmerProfilePanel farmer={farmer} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <FarmerSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Cinematic Hero Banner */}
            <DashboardHero
              title={farmer.name}
              subtitle={`${farmer.location} — ${farmer.description || "Farm-fresh produce direct to buyers"}`}
              badge={`🌾 ${farmer.status === "active" ? "Active Farm" : farmer.status === "pending" ? "Pending Approval" : "Suspended"}`}
              backgroundImage={farmer.image_url || farmsHero}
              kpis={[
                { icon: Package, label: "Products", value: (productCount || 0).toString() },
                { icon: DollarSign, label: "Sales", value: `₱${Number(farmer.total_sales || 0).toLocaleString()}` },
                { icon: Star, label: "Rating", value: Number(farmer.rating || 0).toFixed(1) },
                { icon: MapPin, label: "Location", value: farmer.location.split(",")[0] },
              ]}
            />

            {/* Content */}
            {isMobile ? (
              <div className="space-y-8">
                {mobileSections.map((section) => (
                  <div
                    key={section.id}
                    ref={registerSection(section.id)}
                    className="scroll-mt-4"
                  >
                    <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b border-border">
                      {section.label}
                    </h2>
                    {section.component}
                  </div>
                ))}
              </div>
            ) : (
              renderDesktopContent()
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

const FarmerDashboard = () => {
  const { isAnyAdmin } = useUserRoles();

  if (isAnyAdmin) {
    return (
      <AdminDashboardWrapper
        roleFilter="farmer"
        title="Farmer Management"
        description="View and manage all registered farmers on the platform"
      >
        {(/* selectedUserId, selectedUserEmail */) => <FarmerDashboardInner />}
      </AdminDashboardWrapper>
    );
  }

  return <FarmerDashboardInner />;
};

export default FarmerDashboard;
