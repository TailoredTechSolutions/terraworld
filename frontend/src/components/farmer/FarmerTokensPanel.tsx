import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import KPICard from "@/components/backoffice/KPICard";
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
      {/* Balance — shared KPICard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KPICard
          title="AGRI Token Balance"
          value={`${Number(profile?.agri_token_balance || 0).toLocaleString()} AGRI`}
          icon={Coins}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          {!tokenHistory?.length ? (
            <div className="text-center py-8">
              <Coins className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No token rewards yet</p>
              <p className="text-xs text-muted-foreground mt-1">Sell more products to earn AGRI tokens!</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Tokens Earned</TableHead>
                    <TableHead className="text-right">Value (₱)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokenHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">{format(new Date(entry.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-sm">{entry.source_description || "Token Reward"}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">+{Number(entry.tokens_issued).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">₱{Number(entry.php_reward_value).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerTokensPanel;
