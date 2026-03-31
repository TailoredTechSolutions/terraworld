import { useState } from "react";
import { Play, Calendar, AlertTriangle, CheckCircle2, Loader2, TrendingUp, Coins, Users, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PayoutSummary {
  payout_period: string;
  total_terra_fees: number;
  pool_amount: number;
  failsafe_triggered: boolean;
  failsafe_ratio: number;
  cycle_value_adjustment: number;
  payouts: {
    direct_product: number;
    direct_membership: number;
    binary: number;
    matching: number;
  };
  total_paid: number;
}

export function PayoutCyclePanel() {
  const { toast } = useToast();
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<PayoutSummary | null>(null);

  const runPayoutCycle = async () => {
    setRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in as an admin to run payout cycles",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("run-payout-cycle", {
        body: { payout_date: payoutDate },
      });

      if (error) throw error;

      setLastResult(data);
      toast({
        title: "Payout Cycle Complete",
        description: `Processed ${data.payouts.direct_product + data.payouts.direct_membership + data.payouts.binary + data.payouts.matching} total payouts`,
      });
    } catch (error) {
      console.error("Payout cycle error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run payout cycle",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Run Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Run Payout Cycle
          </CardTitle>
          <CardDescription>
            Execute the compensation engine for a specific date. This will calculate all bonuses and record ledger entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="payout-date">Payout Period</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payout-date"
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  className="pl-10 w-[200px]"
                />
              </div>
            </div>
            <Button 
              onClick={runPayoutCycle} 
              disabled={running}
              className="btn-primary-gradient"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Cycle
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              The payout cycle processes orders marked as "delivered" for the selected date. Ensure all order statuses are correct before running.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Last Result */}
      {lastResult && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Payout Cycle Results - {lastResult.payout_period}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Failsafe Alert */}
            {lastResult.failsafe_triggered && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fail-Safe Triggered</AlertTitle>
                <AlertDescription>
                  Membership BV payout ratio ({(lastResult.failsafe_ratio * 100).toFixed(1)}%) exceeded 75%. 
                  Cycle value adjusted to {(lastResult.cycle_value_adjustment * 100).toFixed(1)}% of base value.
                </AlertDescription>
              </Alert>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Coins className="h-4 w-4" />
                  Terra Fees
                </div>
                <p className="text-2xl font-bold">₱{lastResult.total_terra_fees.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Comp Pool
                </div>
                <p className="text-2xl font-bold">₱{lastResult.pool_amount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  Total Payouts
                </div>
                <p className="text-2xl font-bold">
                  {lastResult.payouts.direct_product + lastResult.payouts.direct_membership + lastResult.payouts.binary + lastResult.payouts.matching}
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <GitBranch className="h-4 w-4" />
                  Total Paid
                </div>
                <p className="text-2xl font-bold text-primary">₱{lastResult.total_paid.toLocaleString()}</p>
              </div>
            </div>

            {/* Payout Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Payout Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm text-muted-foreground">Direct Product</span>
                  <Badge variant="secondary">{lastResult.payouts.direct_product}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm text-muted-foreground">Direct Membership</span>
                  <Badge variant="secondary">{lastResult.payouts.direct_membership}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm text-muted-foreground">Binary</span>
                  <Badge variant="secondary">{lastResult.payouts.binary}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm text-muted-foreground">Matching</span>
                  <Badge variant="secondary">{lastResult.payouts.matching}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
