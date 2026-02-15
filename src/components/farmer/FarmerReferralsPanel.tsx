import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Users, TrendingUp, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FarmerReferralsPanel = ({ userId, referralCode }: { userId: string; referralCode: string }) => {
  const { toast } = useToast();

  const { data: referrals, isLoading } = useQuery({
    queryKey: ["farmer-referrals", userId],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (!profile) return [];

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .eq("referred_by", profile.id);
      
      return data || [];
    },
  });

  const { data: earnings } = useQuery({
    queryKey: ["farmer-referral-earnings", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payout_ledger")
        .select("net_amount, bonus_type")
        .eq("user_id", userId)
        .in("bonus_type", ["direct_product", "direct_membership", "matching"]);
      
      return (data || []).reduce((sum, p) => sum + Number(p.net_amount), 0);
    },
  });

  const referralLink = `${window.location.origin}/auth?ref=${referralCode}&role=farmer`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share this link with other farmers. When they join and sell products, you earn commissions.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary/60" />
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{referrals?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-600/60" />
              <div>
                <p className="text-sm text-muted-foreground">Referral Earnings</p>
                <p className="text-2xl font-bold">₱{Number(earnings || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {referrals && referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{ref.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{ref.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmerReferralsPanel;
