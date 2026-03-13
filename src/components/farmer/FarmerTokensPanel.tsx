import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Coins className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AGRI Token Balance</p>
              <p className="text-2xl font-bold">{Number(profile?.agri_token_balance || 0).toLocaleString()} AGRI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          {!tokenHistory?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No token rewards earned yet. Sell more products to earn AGRI tokens!</p>
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
