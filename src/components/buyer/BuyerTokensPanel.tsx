import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Coins } from "lucide-react";
import { format } from "date-fns";

const BuyerTokensPanel = ({ userId }: { userId: string }) => {
  const { data: profile } = useQuery({
    queryKey: ["buyer-token-balance", userId],
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
    queryKey: ["buyer-token-history", userId],
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
          <CardTitle className="text-base">Token Reward History</CardTitle>
        </CardHeader>
        <CardContent>
          {!tokenHistory?.length ? (
            <div className="text-center py-6">
              <Coins className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No token rewards earned yet. Keep shopping to earn AGRI tokens!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">{entry.source_description || "Token Reward"}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs text-green-700 dark:text-green-400">
                          +{Number(entry.tokens_issued).toLocaleString()} AGRI
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        ₱{Number(entry.php_reward_value).toLocaleString()}
                      </TableCell>
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

export default BuyerTokensPanel;
