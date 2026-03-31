import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
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
import DashboardHero from "@/components/DashboardHero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tractor, MapPin, Phone, Mail,
  AlertCircle, Loader2, Package, DollarSign, Star, Truck, ArrowUp,
} from "lucide-react";
import farmsHero from "@/assets/farms-hero.jpg";
import type { Tables } from "@/integrations/supabase/types";

type Farmer = Tables<"farmers">;

const SCROLL_OFFSET = 80;

const FarmerDashboardInner = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mainRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  const sections = [
    { id: "overview", label: "Farm Overview", component: <FarmerOverviewPanel farmerId={farmer.id} userId={user!.id} onNavigate={scrollToSection} /> },
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
        <FarmerSidebar activeTab={activeSection} onTabChange={scrollToSection} />
        <main ref={mainRef} className="flex-1 overflow-auto relative">
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

            {/* All sections rendered vertically */}
            <div className="space-y-10">
              {sections.map((section) => (
                <div
                  key={section.id}
                  id={`farmer-${section.id}`}
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

const FarmerDashboard = () => {
  const { isAnyAdmin } = useUserRoles();

  if (isAnyAdmin) {
    return (
      <AdminDashboardWrapper
        roleFilter="farmer"
        title="Farmer Management"
        description="View and manage all registered farmers on the platform"
      >
        {() => <FarmerDashboardInner />}
      </AdminDashboardWrapper>
    );
  }

  return <FarmerDashboardInner />;
};

export default FarmerDashboard;
