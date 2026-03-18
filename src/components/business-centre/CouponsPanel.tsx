import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Ticket, ShoppingBag, BarChart3, Loader2, Wallet, TrendingUp,
  Coins, CheckCircle2, ArrowUpRight, Zap
} from "lucide-react";
import { format } from "date-fns";

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
}

const CouponsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<CouponPackage[]>([]);
  const [purchases, setPurchases] = useState<CouponPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("buy");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [pkgRes, purchRes] = await Promise.all([
      supabase.from("coupon_packages").select("*").eq("is_active", true).order("price"),
      user
        ? supabase.from("coupon_purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);
    setPackages((pkgRes.data as CouponPackage[]) || []);
    setPurchases((purchRes.data as CouponPurchase[]) || []);
    setLoading(false);
  };

  const handlePurchase = async (pkg: CouponPackage) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }
    setPurchasing(pkg.id);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-coupon", {
        body: { package_id: pkg.id },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Purchase failed");

      toast({
        title: "Coupon Purchased! 🎉",
        description: `₱${data.breakdown.internal_wallet_credit.toLocaleString()} credited to your Internal Wallet. ${data.breakdown.bv_generated} BV generated.`,
      });
      setActiveTab("my");
      fetchData();
    } catch (err: any) {
      toast({ title: "Purchase Failed", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(null);
    }
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

  const consumerPkgs = packages.filter((p) => p.name.startsWith("Consumer") || p.name.startsWith("Farm"));
  const affiliatePkgs = packages.filter((p) => p.name.startsWith("Affiliate"));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
      <TabsList className="grid grid-cols-3 w-full max-w-md">
        <TabsTrigger value="buy" className="text-xs gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5" /> Buy Coupons
        </TabsTrigger>
        <TabsTrigger value="my" className="text-xs gap-1.5">
          <Ticket className="h-3.5 w-3.5" /> My Coupons
        </TabsTrigger>
        <TabsTrigger value="analytics" className="text-xs gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Analytics
        </TabsTrigger>
      </TabsList>

      {/* ── BUY COUPONS ── */}
      <TabsContent value="buy" className="space-y-6">
        {/* Consumer Coupons */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> Consumer & Farm Credit Coupons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {consumerPkgs.map((pkg) => (
              <CouponCard key={pkg.id} pkg={pkg} purchasing={purchasing} onPurchase={handlePurchase} />
            ))}
          </div>
        </div>

        {affiliatePkgs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Affiliate Coupons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {affiliatePkgs.map((pkg) => (
                <CouponCard key={pkg.id} pkg={pkg} purchasing={purchasing} onPurchase={handlePurchase} />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* ── MY COUPONS ── */}
      <TabsContent value="my" className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-lg font-bold text-emerald-600">₱{activeBalance.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Active Balance</p>
          </div>
          <div className="text-center p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <p className="text-lg font-bold text-blue-600">₱{totalUsed.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Used</p>
          </div>
          <div className="text-center p-3 rounded-xl border border-border/40">
            <p className="text-lg font-bold text-foreground">{purchases.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Purchases</p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No coupon purchases yet. Buy your first coupon to get started!
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
                      <th className="text-right py-2.5 px-3 text-muted-foreground font-medium">Remaining</th>
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
                          ₱{Number(p.balance_remaining).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">{Number(p.bv_generated).toLocaleString()}</td>
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
            <CardDescription className="text-xs">How your coupon purchases were allocated</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {[
              { label: "Usable Wallet Value", value: `₱${purchases.reduce((s, p) => s + p.usable_value, 0).toLocaleString()}` },
              { label: "Terra Fee → BV", value: `₱${purchases.reduce((s, p) => s + p.terra_fee, 0).toLocaleString()} → ${totalBV.toLocaleString()} BV` },
              { label: "Token Rewards", value: `${totalTokens.toFixed(1)} AGRI` },
              { label: "Bonus Credits", value: `₱${purchases.reduce((s, p) => s + p.bonus_value, 0).toLocaleString()}` },
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
  );
};

// ── Coupon Card Component ──
const CouponCard = ({
  pkg,
  purchasing,
  onPurchase,
}: {
  pkg: CouponPackage;
  purchasing: string | null;
  onPurchase: (pkg: CouponPackage) => void;
}) => {
  const usableValue = Math.round((pkg.price * pkg.usable_value_percent) / 100);
  const terraFee = Math.round((pkg.price * pkg.terra_fee_percent) / 100);
  const tokenReward = Math.round((pkg.price * pkg.token_reward_percent) / 100);
  const bonus = Math.round((pkg.price * pkg.bonus_percent) / 100);

  const isAffiliate = pkg.bv_type === "membership";

  return (
    <Card className={cn(
      "border-border/40 hover:border-primary/40 transition-all",
      isAffiliate && "border-purple-500/20"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold font-display">{pkg.name}</p>
            {pkg.description && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{pkg.description}</p>
            )}
          </div>
          <Badge variant="outline" className={cn(
            "text-[10px] px-1.5 py-0",
            isAffiliate ? "border-purple-500/30 text-purple-600" : "border-emerald-500/30 text-emerald-600"
          )}>
            {isAffiliate ? "Membership BV" : "Product BV"}
          </Badge>
        </div>

        <div className="text-center py-2">
          <p className="text-2xl font-bold text-primary">₱{pkg.price.toLocaleString()}</p>
        </div>

        <Separator />

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallet Credit</span>
            <span className="font-medium text-emerald-600">₱{(usableValue + bonus).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Terra Fee → BV</span>
            <span className="font-medium">₱{terraFee} → {terraFee} BV</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token Reward</span>
            <span className="font-medium text-accent">₱{tokenReward} value</span>
          </div>
          {bonus > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bonus Credit</span>
              <span className="font-medium text-primary">+₱{bonus}</span>
            </div>
          )}
          {pkg.expiry_days && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid For</span>
              <span className="font-medium">{pkg.expiry_days} days</span>
            </div>
          )}
        </div>

        <Button
          className="w-full h-9 text-xs"
          disabled={purchasing === pkg.id}
          onClick={() => onPurchase(pkg)}
        >
          {purchasing === pkg.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          )}
          {purchasing === pkg.id ? "Processing..." : "Buy Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CouponsPanel;
