import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

const BCTokenRewards = () => {
  const { data } = useBusinessCentre();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Token Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">Your AGRI token balance and issuance history</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-accent/20">
          <CardContent className="p-5 text-center">
            <Coins className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold font-display text-accent">{data.tokenBalance.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total AGRI Tokens</p>
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
            <p className="text-2xl font-bold font-display">₱{(data.tokenBalance * 10).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Estimated Value</p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default BCTokenRewards;
