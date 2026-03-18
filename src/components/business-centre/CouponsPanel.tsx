import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import {
  Ticket, ShoppingBag, BarChart3, Loader2, TrendingUp,
  Coins, ArrowUpRight, Zap, Star, Crown, Rocket, ShoppingCart,
  Search, UserCircle, X
} from "lucide-react";
import { format } from "date-fns";

import starterBg from "@/assets/coupons/starter-coupon-bg.jpg";
import basicBg from "@/assets/coupons/basic-coupon-bg.jpg";
import proBg from "@/assets/coupons/pro-coupon-bg.jpg";
import eliteBg from "@/assets/coupons/elite-coupon-bg.jpg";

interface CouponPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  usable_value_percent: number;
  terra_fee_percent: number;
  token_reward_percent: number;
  bonus_percent: number;
  bv_type: string;
  is_active: boolean;
  expiry_days: number | null;
}

interface CouponPurchase {
  id: string;
  package_id: string;
  price_paid: number;
  usable_value: number;
  terra_fee: number;
  bv_generated: number;
  token_reward: number;
  bonus_value: number;
  balance_remaining: number;
  status: string;
  expires_at: string | null;
  created_at: string;
  user_id: string;
}

const TIER_CONFIG: Record<string, {
  bg: string;
  accent: string;
  accentBg: string;
  border: string;
  gradient: string;
  icon: typeof Star;
  reward: string;
  bv: number;
}> = {
  "Starter Coupon": {
    bg: starterBg,
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    gradient: "from-emerald-900/90 via-emerald-800/70 to-emerald-900/90",
    icon: Zap,
    reward: "Activation",
    bv: 500,
  },
  "Basic Coupon": {
    bg: basicBg,
    accent: "text-amber-400",
    accentBg: "bg-amber-500/20",
    border: "border-amber-500/30",
    gradient: "from-amber-900/90 via-stone-800/70 to-amber-900/90",
    icon: Star,
    reward: "Unlock Level",
    bv: 1000,
  },
  "Pro Coupon": {
    bg: proBg,
    accent: "text-green-400",
    accentBg: "bg-green-500/20",
    border: "border-green-500/30",
    gradient: "from-green-900/90 via-green-800/70 to-green-900/90",
    icon: Rocket,
    reward: "Higher Matching",
    bv: 3000,
  },
  "Elite Coupon": {
    bg: eliteBg,
    accent: "text-yellow-400",
    accentBg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    gradient: "from-yellow-900/90 via-amber-800/70 to-yellow-900/90",
    icon: Crown,
    reward: "Max Earning",
    bv: 5000,
  },
};

const CouponsPanel = () => {
  const { user } = useAuth();
  const { isAdmin, isAnyAdmin, isAdminReadonly } = useUserRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const addCoupon = useCartStore((s) => s.addCoupon);
  const [packages, setPackages] = useState<CouponPackage[]>([]);
  const [purchases, setPurchases] = useState<CouponPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("buy");

  // Admin context
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewUserName, setViewUserName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ user_id: string; full_name: string; email: string }>>([]);
  const [searching, setSearching] = useState(false);

  const effectiveUserId = viewUserId || user?.id;
  const isViewingOther = viewUserId !== null && viewUserId !== user?.id;

  useEffect(() => {
    fetchData();
  }, [effectiveUserId]);

  const fetchData = async () => {
    setLoading(true);
    const [pkgRes, purchRes] = await Promise.all([
      supabase.from("coupon_packages").select("*").eq("is_active", true).order("price"),
      effectiveUserId
        ? (isAnyAdmin && isViewingOther
          ? supabase.from("coupon_purchases").select("*").eq("user_id", effectiveUserId).order("created_at", { ascending: false })
          : supabase.from("coupon_purchases").select("*").eq("user_id", effectiveUserId).order("created_at", { ascending: false })
        )
        : Promise.resolve({ data: [] }),
    ]);
    setPackages((pkgRes.data as CouponPackage[]) || []);
    setPurchases((purchRes.data as CouponPurchase[]) || []);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(10);
    setSearchResults(data || []);
    setSearching(false);
  };

  const selectUser = (u: { user_id: string; full_name: string; email: string }) => {
    setViewUserId(u.user_id);
    setViewUserName(u.full_name || u.email);
    setSearchResults([]);
    setSearchQuery("");
  };

  const resetView = () => {
    setViewUserId(null);
    setViewUserName(null);
  };

  const handleAddToBasket = (pkg: CouponPackage) => {
    if (isViewingOther || isAdminReadonly) return;
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    const config = TIER_CONFIG[pkg.name];
    addCoupon({
      id: `coupon-${pkg.id}-${Date.now()}`,
      packageId: pkg.id,
      name: pkg.name,
      price: pkg.price,
      bv: config?.bv || pkg.price,
      reward: config?.reward || pkg.description || "",
      image: config?.bg || starterBg,
      recipient: "self",
    });

    toast({
      title: "Added to Basket 🛒",
      description: `${pkg.name} added. Redirecting to checkout…`,
    });

    navigate("/checkout");
  };

  // Analytics
  const totalPurchased = purchases.reduce((s, p) => s + p.price_paid, 0);
  const totalUsed = purchases.reduce((s, p) => s + (p.usable_value + p.bonus_value - p.balance_remaining), 0);
  const totalBV = purchases.reduce((s, p) => s + p.bv_generated, 0);
  const totalTokens = purchases.reduce((s, p) => s + p.token_reward, 0);
  const activeBalance = purchases
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + p.balance_remaining, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Admin: Member Context Switcher */}
      {isAnyAdmin && (
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Search className="h-4 w-4" />
              View Member Coupons
            </div>
            {isViewingOther && viewUserName && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <UserCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium flex-1">{viewUserName}</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={resetView}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-sm"
              />
              <Button size="sm" variant="outline" onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.user_id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                    onClick={() => selectUser(r)}
                  >
                    <span className="font-medium">{r.full_name || "—"}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{r.email}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-display text-foreground">{purchases.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Coupons</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-display text-emerald-600">₱{activeBalance.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Active Balance</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-display text-foreground">{totalBV.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total BV</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-display text-foreground">₱{totalUsed.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Used</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="buy" className="text-xs gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" /> Buy Coupons
          </TabsTrigger>
          <TabsTrigger value="my" className="text-xs gap-1.5">
            <Ticket className="h-3.5 w-3.5" /> {isViewingOther ? "Their Coupons" : "My Coupons"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* ── BUY COUPONS ── */}
        <TabsContent value="buy" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <CouponHeroCard
                key={pkg.id}
                pkg={pkg}
                onAddToBasket={handleAddToBasket}
                disabled={isViewingOther || isAdminReadonly}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── MY COUPONS ── */}
        <TabsContent value="my" className="space-y-4">
          {purchases.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {isViewingOther ? "This member has no coupon purchases." : "No coupon purchases yet. Buy your first coupon to get started!"}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Date</th>
                        <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Package</th>
                        <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Paid</th>
                        <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">BV</th>
                        <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => (
                        <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-3 text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                          <td className="py-2.5 px-3 font-medium">
                            {packages.find((pk) => pk.id === p.package_id)?.name || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right">₱{Number(p.price_paid).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                            {Number(p.bv_generated).toLocaleString()} BV
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Badge
                              variant={p.status === "active" ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── ANALYTICS ── */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Purchased", value: `₱${totalPurchased.toLocaleString()}`, icon: ShoppingBag, accent: "text-primary bg-primary/10" },
              { label: "Total Used", value: `₱${totalUsed.toLocaleString()}`, icon: ArrowUpRight, accent: "text-blue-600 bg-blue-500/10" },
              { label: "BV Generated", value: totalBV.toLocaleString(), icon: TrendingUp, accent: "text-emerald-600 bg-emerald-500/10" },
              { label: "Tokens Earned", value: totalTokens.toFixed(1), icon: Coins, accent: "text-accent bg-accent/10" },
            ].map((s) => (
              <Card key={s.label} className="border-border/40">
                <CardContent className="p-4 text-center">
                  <div className={cn("p-1.5 rounded-lg w-fit mx-auto mb-2", s.accent)}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="text-lg font-bold font-display text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <CardTitle className="text-sm">Financial Breakdown</CardTitle>
              <CardDescription className="text-xs">How coupon purchases were allocated</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-2">
              {[
                { label: "Total BV Generated", value: `${totalBV.toLocaleString()} BV` },
                { label: "Token Rewards", value: `${totalTokens.toFixed(1)} AGRI` },
                { label: "Total Invested", value: `₱${totalPurchased.toLocaleString()}` },
                { label: "Coupon Purchases", value: `${purchases.length} coupon(s)` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-xs p-2.5 rounded bg-muted/30">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{r.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ── Premium Coupon Hero Card ──
const CouponHeroCard = ({
  pkg,
  onAddToBasket,
  disabled = false,
}: {
  pkg: CouponPackage;
  onAddToBasket: (pkg: CouponPackage) => void;
  disabled?: boolean;
}) => {
  const config = TIER_CONFIG[pkg.name];
  const fallbackGradient = "from-stone-900/90 via-stone-800/70 to-stone-900/90";
  const gradient = config?.gradient || fallbackGradient;
  const bgImage = config?.bg;
  const Icon = config?.icon || Star;
  const reward = config?.reward || pkg.description || "";
  const bv = config?.bv || pkg.price;
  const accent = config?.accent || "text-emerald-400";
  const accentBg = config?.accentBg || "bg-emerald-500/20";
  const border = config?.border || "border-border/40";

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]",
        "border",
        border
      )}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt={pkg.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      <div className={cn("absolute inset-0 bg-gradient-to-t", gradient)} />

      <div className="relative z-10 p-5 flex flex-col min-h-[280px] justify-between">
        <div className="flex justify-between items-start">
          <div className={cn("p-2 rounded-xl backdrop-blur-sm", accentBg)}>
            <Icon className={cn("h-5 w-5", accent)} />
          </div>
          <Badge className={cn(
            "text-[10px] px-2 py-0.5 backdrop-blur-sm border-0",
            accentBg, accent
          )}>
            {bv.toLocaleString()} BV
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-white font-display tracking-tight">
              {pkg.name.replace(" Coupon", "")}
            </h3>
            <p className="text-white/70 text-xs mt-0.5">{reward}</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className={cn("text-2xl font-bold font-display", accent)}>
                ₱{pkg.price.toLocaleString()}
              </p>
            </div>
          </div>

          <Button
            className={cn(
              "w-full h-10 text-sm font-semibold backdrop-blur-sm transition-all",
              "bg-white/15 hover:bg-white/25 text-white border border-white/20"
            )}
            variant="ghost"
            onClick={() => onAddToBasket(pkg)}
            disabled={disabled}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {disabled ? "View Only" : "Add to Basket"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CouponsPanel;
