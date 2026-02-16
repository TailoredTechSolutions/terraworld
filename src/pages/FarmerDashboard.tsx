import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FarmerProductsPanel from "@/components/farmer/FarmerProductsPanel";
import FarmerProfilePanel from "@/components/farmer/FarmerProfilePanel";
import FarmerEarningsPanel from "@/components/farmer/FarmerEarningsPanel";
import FarmerWithdrawalPanel from "@/components/farmer/FarmerWithdrawalPanel";
import FarmerNotificationsPanel from "@/components/farmer/FarmerNotificationsPanel";
import FarmerSupportPanel from "@/components/farmer/FarmerSupportPanel";
import FarmerDeliveryPanel from "@/components/farmer/FarmerDeliveryPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tractor, Package, DollarSign, Star, MapPin, Phone, Mail,
  AlertCircle, Loader2, ShoppingBag, Coins, Users, Receipt,
  UserCircle, Wallet, Bell, LifeBuoy, Truck,
} from "lucide-react";
import FarmerOrdersPanel from "@/components/farmer/FarmerOrdersPanel";
import FarmerTokensPanel from "@/components/farmer/FarmerTokensPanel";
import FarmerReferralsPanel from "@/components/farmer/FarmerReferralsPanel";
import FarmerPricingPanel from "@/components/farmer/FarmerPricingPanel";
import type { Tables } from "@/integrations/supabase/types";

type Farmer = Tables<"farmers">;

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("products");

  // Fetch the farmer profile linked to this user (by matching email)
  const { data: farmer, isLoading: farmerLoading, error: farmerError } = useQuery({
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

  // Fetch product count
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

  // Fetch profile for referral code
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Farm Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {farmer.image_url ? (
              <img
                src={farmer.image_url}
                alt={farmer.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tractor className="h-10 w-10 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{farmer.name}</h1>
                <Badge className={statusColor[farmer.status || "pending"]}>
                  {farmer.status || "pending"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {farmer.description || "Welcome to your farmer dashboard"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {farmer.location}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {farmer.phone}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {farmer.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{productCount ?? farmer.products_count ?? 0}</p>
                </div>
                <Package className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">₱{(farmer.total_sales ?? 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {farmer.rating ?? 5.0}
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="text-lg font-medium truncate">{farmer.owner}</p>
                </div>
                <Tractor className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <Receipt className="h-4 w-4" /> Pricing
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <DollarSign className="h-4 w-4" /> Earnings
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-2">
              <Wallet className="h-4 w-4" /> Withdraw
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-2">
              <Truck className="h-4 w-4" /> Delivery
            </TabsTrigger>
            <TabsTrigger value="tokens" className="gap-2">
              <Coins className="h-4 w-4" /> Tokens
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Users className="h-4 w-4" /> Referrals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <LifeBuoy className="h-4 w-4" /> Support
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <UserCircle className="h-4 w-4" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <FarmerProductsPanel farmerId={farmer.id} />
          </TabsContent>

          <TabsContent value="pricing">
            <FarmerPricingPanel farmerId={farmer.id} />
          </TabsContent>

          <TabsContent value="orders">
            <FarmerOrdersPanel farmerId={farmer.id} />
          </TabsContent>

          <TabsContent value="earnings">
            <FarmerEarningsPanel farmerId={farmer.id} userId={user!.id} />
          </TabsContent>

          <TabsContent value="withdrawals">
            <FarmerWithdrawalPanel userId={user!.id} />
          </TabsContent>

          <TabsContent value="delivery">
            <FarmerDeliveryPanel farmerId={farmer.id} />
          </TabsContent>

          <TabsContent value="tokens">
            <FarmerTokensPanel userId={user!.id} />
          </TabsContent>

          <TabsContent value="referrals">
            <FarmerReferralsPanel userId={user!.id} referralCode={profile?.referral_code || ""} />
          </TabsContent>

          <TabsContent value="notifications">
            <FarmerNotificationsPanel userId={user!.id} />
          </TabsContent>

          <TabsContent value="support">
            <FarmerSupportPanel userId={user!.id} />
          </TabsContent>

          <TabsContent value="profile">
            <FarmerProfilePanel farmer={farmer} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
