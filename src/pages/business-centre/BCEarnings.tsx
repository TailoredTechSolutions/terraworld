import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Layers } from "lucide-react";

const BCEarnings = () => {
  const { data } = useBusinessCentre();
  const wallet = data.wallet;

  const metrics = [
    { label: "Total Earnings", value: `₱${(wallet?.total_withdrawn ?? 0 + (wallet?.available_balance ?? 0)).toLocaleString()}`, icon: DollarSign },
    { label: "Binary Earnings", value: "₱0", icon: TrendingUp },
    { label: "Matching Bonus", value: "₱0", icon: Users },
    { label: "Commission", value: "₱0", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">Your complete earnings breakdown and history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <m.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold font-display">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">Earnings History</h3>
          <p className="text-xs text-muted-foreground">Your earnings from binary matching, referral bonuses, and commissions will appear here as they are processed.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BCEarnings;
