import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Users, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BCTokenRewards = () => {
  const { data, adminData, effectiveUserId } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;

  const [history, setHistory] = useState<Array<{ tokens_issued: number; php_reward_value: number; source_description: string | null; created_at: string }>>([]);

  useEffect(() => {
    if (!effectiveUserId) return;
    const fetch = async () => {
      const query = supabase
        .from("token_ledger")
        .select("tokens_issued, php_reward_value, source_description, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!isAdmin) query.eq("user_id", effectiveUserId);
      const { data: rows } = await query;
      setHistory(rows || []);
    };
    fetch();
  }, [effectiveUserId, isAdmin]);

  const displayTokens = isAdmin ? adminData.totalTokensIssued : data.tokenBalance;
  const totalPhpValue = history.reduce((s, r) => s + Number(r.php_reward_value), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Token Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "Platform-wide AGRI token issuance and tracking" : "Your AGRI token balance and issuance history"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-accent/20">
          <CardContent className="p-5 text-center">
            <Coins className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold font-display text-accent">{displayTokens.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{isAdmin ? "Total Tokens Issued" : "Your AGRI Tokens"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold font-display">₱10.00</p>
            <p className="text-[10px] text-muted-foreground">Market Price</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold font-display">₱{(displayTokens * 10).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Estimated Value</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold font-display">{history.length}</p>
            <p className="text-[10px] text-muted-foreground">Issuance Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Issuance History */}
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm">{isAdmin ? "System Token Issuance Log" : "Token Issuance History"}</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No token issuance events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Date</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Source</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs">Tokens</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium text-xs">PHP Value</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-2 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-2 text-xs">{row.source_description || "Activity reward"}</td>
                      <td className="py-2 px-2 text-right text-xs font-semibold text-accent">+{Number(row.tokens_issued).toLocaleString()}</td>
                      <td className="py-2 px-2 text-right text-xs text-muted-foreground">₱{Number(row.php_reward_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="border-border/40">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm">How Tokens Are Earned</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2 text-xs text-muted-foreground">
            <p>• AGRI tokens are issued based on the PHP reward value from platform activity.</p>
            <p>• Token issuance is calculated at the current market price at time of activity.</p>
            <p>• Tokens are non-transferable and accumulate in your profile balance.</p>
            <p>• Coupon purchases also generate token rewards based on the token_reward_percent.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BCTokenRewards;
