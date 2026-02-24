import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tractor, Package, DollarSign, Star, MapPin, Phone, Mail,
  AlertCircle, Loader2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Farmer = Tables<"farmers">;

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

  const statusColor = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const renderContent = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <FarmerSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            {/* Farm Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {farmer.image_url ? (
                  <img src={farmer.image_url} alt={farmer.name} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Tractor className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold truncate">{farmer.name}</h1>
                    <Badge className={statusColor[farmer.status || "pending"]}>
                      {farmer.status || "pending"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {farmer.description || "Welcome to your farmer dashboard"}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{farmer.location}</div>
                    <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{farmer.phone}</div>
                    <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /><span className="truncate max-w-[150px]">{farmer.email}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Products</p>
                      <p className="text-xl sm:text-2xl font-bold">{productCount ?? farmer.products_count ?? 0}</p>
                    </div>
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Sales</p>
                      <p className="text-xl sm:text-2xl font-bold">₱{(farmer.total_sales ?? 0).toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Rating</p>
                      <p className="text-xl sm:text-2xl font-bold flex items-center gap-1">
                        {farmer.rating ?? 5.0}
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
                      </p>
                    </div>
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Owner</p>
                      <p className="text-sm sm:text-lg font-medium truncate">{farmer.owner}</p>
                    </div>
                    <Tractor className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tab Content */}
            {renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
