import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Copy, Users, TrendingUp, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const BuyerReferralsPanel = ({ userId, referralCode }: { userId: string; referralCode: string }) => {
  const { toast } = useToast();

  const { data: referrals, isLoading } = useQuery({
    queryKey: ["buyer-referrals", userId],
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
    queryKey: ["buyer-referral-earnings", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("payout_ledger")
        .select("net_amount, bonus_type")
        .eq("user_id", userId)
        .in("bonus_type", ["direct_product", "direct_membership", "matching"]);
      return (data || []).reduce((sum, p) => sum + Number(p.net_amount), 0);
    },
  });

  const referralLink = `${window.location.origin}/auth?ref=${referralCode}&role=buyer`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Referral Link */}
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
            Share this link with friends. When they sign up and make purchases, you earn commissions.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
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

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {!referrals?.length ? (
            <div className="text-center py-6">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Join Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{ref.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(ref.created_at), "MMM d, yyyy")}
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

export default BuyerReferralsPanel;
