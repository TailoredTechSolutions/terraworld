import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Zap, Star, Rocket, Crown, CheckCircle2, ArrowRight, Loader2,
  Shield, TrendingUp, Award
} from "lucide-react";

import starterImg from "@/assets/ranks/starter-rank.jpg";
import basicImg from "@/assets/ranks/basic-rank.jpg";
import proImg from "@/assets/ranks/pro-rank.jpg";
import eliteImg from "@/assets/ranks/elite-rank.jpg";

const TIER_ORDER = ["free", "starter", "basic", "pro", "elite"];

const TIER_CONFIG: Record<string, {
  price: number;
  bv: number;
  image: string;
  icon: typeof Star;
  accent: string;
  accentBg: string;
  border: string;
  gradient: string;
  benefits: string;
  matching: string;
  cap: string;
}> = {
  starter: {
    price: 500, bv: 500, image: starterImg, icon: Zap,
    accent: "text-emerald-400", accentBg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    gradient: "from-emerald-900/90 via-emerald-800/70 to-emerald-900/90",
    benefits: "Activation", matching: "L1: 10%", cap: "₱5,000/day",
  },
  basic: {
    price: 1000, bv: 1000, image: basicImg, icon: Star,
    accent: "text-amber-400", accentBg: "bg-amber-500/20",
    border: "border-amber-500/30",
    gradient: "from-amber-900/90 via-stone-800/70 to-amber-900/90",
    benefits: "Unlock Level", matching: "L1-L2", cap: "₱15,000/day",
  },
  pro: {
    price: 3000, bv: 3000, image: proImg, icon: Rocket,
    accent: "text-green-400", accentBg: "bg-green-500/20",
    border: "border-green-500/30",
    gradient: "from-green-900/90 via-green-800/70 to-green-900/90",
    benefits: "Higher Matching", matching: "L1-L3", cap: "₱50,000/day",
  },
  elite: {
    price: 5000, bv: 5000, image: eliteImg, icon: Crown,
    accent: "text-yellow-400", accentBg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    gradient: "from-yellow-900/90 via-amber-800/70 to-yellow-900/90",
    benefits: "Max Earning", matching: "L1-L5", cap: "₱250,000/day",
  },
};

const RankActivationPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const setUpgrade = useCartStore((s) => s.setUpgrade);

  const [currentTier, setCurrentTier] = useState<string>("free");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("memberships")
        .select("tier, package_price")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setCurrentTier(data.tier || "free");
        setCurrentPrice(Number(data.package_price) || 0);
      }
      setLoading(false);
    })();
  }, [user]);

  const currentIndex = TIER_ORDER.indexOf(currentTier);

  const handleUpgrade = (targetTier: string) => {
    const config = TIER_CONFIG[targetTier];
    if (!config) return;

    const upgradeCost = config.price - currentPrice;
    if (upgradeCost <= 0) return;

    setUpgrade({
      id: `upgrade-${targetTier}-${Date.now()}`,
      targetTier,
      targetPrice: config.price,
      currentTier,
      currentValue: currentPrice,
      upgradeCost,
      bvGenerated: upgradeCost, // 1:1 BV from difference only
      image: config.image,
      benefits: config.benefits,
    });

    toast({
      title: "Upgrade Added to Checkout",
      description: `Upgrade to ${targetTier.charAt(0).toUpperCase() + targetTier.slice(1)} for ₱${upgradeCost.toLocaleString()}`,
    });

    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
              <Award className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold font-display capitalize">{currentTier} Partner</p>
              <p className="text-xs text-muted-foreground">
                ₱{currentPrice.toLocaleString()} Activation Value • {currentPrice.toLocaleString()} Membership BV
              </p>
            </div>
            {currentTier !== "elite" && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Upgradeable
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rank Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["starter", "basic", "pro", "elite"] as const).map((tier) => {
          const config = TIER_CONFIG[tier];
          const tierIndex = TIER_ORDER.indexOf(tier);
          const isCurrent = tier === currentTier;
          const isBelow = tierIndex <= currentIndex;
          const upgradeCost = config.price - currentPrice;
          const Icon = config.icon;

          return (
            <div
              key={tier}
              className={cn(
                "group relative rounded-2xl overflow-hidden transition-all duration-300 border",
                config.border,
                isCurrent && "ring-2 ring-primary",
                isBelow && !isCurrent && "opacity-50"
              )}
            >
              {/* Hero Background */}
              <img
                src={config.image}
                alt={tier}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={cn("absolute inset-0 bg-gradient-to-t", config.gradient)} />

              {/* Current badge */}
              {isCurrent && (
                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> CURRENT
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-5 flex flex-col min-h-[320px] justify-between">
                <div className="flex justify-between items-start">
                  <div className={cn("p-2 rounded-xl backdrop-blur-sm", config.accentBg)}>
                    <Icon className={cn("h-5 w-5", config.accent)} />
                  </div>
                  <Badge className={cn("text-[10px] px-2 py-0.5 backdrop-blur-sm border-0", config.accentBg, config.accent)}>
                    {config.bv.toLocaleString()} BV
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-white font-display tracking-tight capitalize">
                      {tier}
                    </h3>
                    <p className="text-white/70 text-xs mt-0.5">{config.benefits}</p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-1 text-[11px] text-white/60">
                    <div className="flex justify-between">
                      <span>Matching</span>
                      <span className="text-white/90 font-medium">{config.matching}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Cap</span>
                      <span className="text-white/90 font-medium">{config.cap}</span>
                    </div>
                  </div>

                  <div>
                    <p className={cn("text-2xl font-bold font-display", config.accent)}>
                      ₱{config.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Upgrade section */}
                  {isCurrent ? (
                    <div className="w-full h-10 flex items-center justify-center text-sm text-white/60 border border-white/10 rounded-lg backdrop-blur-sm">
                      <Shield className="h-4 w-4 mr-2" /> Active
                    </div>
                  ) : isBelow ? (
                    <div className="w-full h-10 flex items-center justify-center text-sm text-white/40 border border-white/10 rounded-lg backdrop-blur-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Completed
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] text-white/50 flex justify-between px-1">
                        <span>Upgrade Cost</span>
                        <span className="text-white font-semibold">₱{upgradeCost.toLocaleString()}</span>
                      </div>
                      <Button
                        className={cn(
                          "w-full h-10 text-sm font-semibold backdrop-blur-sm transition-all",
                          "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                        )}
                        variant="ghost"
                        onClick={() => handleUpgrade(tier)}
                      >
                        Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Info */}
      <Card className="border-border/40">
        <CardContent className="p-5 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            How Upgrades Work
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• You only pay the <span className="font-semibold text-foreground">difference</span> between your current rank and the target rank.</p>
            <p>• BV is generated only from the upgrade amount, not the full target price.</p>
            <p>• Your cumulative activation value is preserved — no double payments.</p>
            <p>• Matching level, daily cap, and earning eligibility upgrade instantly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankActivationPanel;
