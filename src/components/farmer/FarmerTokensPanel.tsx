import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Coins } from "lucide-react";
import { format } from "date-fns";

const FarmerTokensPanel = ({ userId }: { userId: string }) => {
  const { data: profile } = useQuery({
    queryKey: ["farmer-token-balance", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("agri_token_balance")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: tokenHistory, isLoading } = useQuery({
    queryKey: ["farmer-token-history", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("token_ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <Coins className="h-8 w-8 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AGRI Token Balance</p>
              <p className="text-3xl font-bold">{Number(profile?.agri_token_balance || 0).toLocaleString()} AGRI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Token Earning History</CardTitle>
        </CardHeader>
        <CardContent>
          {!tokenHistory?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No token rewards earned yet. Sell more products to earn AGRI tokens!</p>
          ) : (
            <div className="space-y-3">
              {tokenHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{entry.source_description || "Token Reward"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+{Number(entry.tokens_issued).toLocaleString()} AGRI</p>
                    <p className="text-xs text-muted-foreground">₱{Number(entry.php_reward_value).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerTokensPanel;
