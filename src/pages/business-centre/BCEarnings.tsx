import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Layers } from "lucide-react";

const BCEarnings = () => {
  const { data, adminData } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;
  const wallet = data.walletData;

  const metrics = isAdmin
    ? [
        { label: "System Total Earnings", value: `₱${adminData.systemTotalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign },
        { label: "System Volume", value: `₱${adminData.systemTotalVolume.toLocaleString()}`, icon: TrendingUp },
        { label: "Active Members", value: adminData.activeMembers.toLocaleString(), icon: Users },
        { label: "Matched BV", value: adminData.systemMatchedBv.toLocaleString(), icon: Layers },
      ]
    : [
        { label: "Total Earnings", value: `₱${data.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign },
        { label: "Binary Earnings", value: "₱0", icon: TrendingUp },
        { label: "Matching Bonus", value: "₱0", icon: Users },
        { label: "Commission", value: "₱0", icon: Layers },
      ];

  const displayEarnings = isAdmin ? adminData.recentSystemEarnings : data.recentEarnings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "System-wide earnings breakdown" : "Your complete earnings breakdown and history"}
        </p>
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
          <h3 className="text-sm font-semibold mb-3">
            {isAdmin ? "Recent System Payouts" : "Earnings History"}
          </h3>
          {displayEarnings.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "No system payouts recorded yet." : "Your earnings will appear here as they are processed."}
            </p>
          ) : (
            <div className="space-y-1">
              {displayEarnings.slice(0, 15).map((row, i) => (
                <div key={i} className="flex justify-between text-xs p-2.5 rounded bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{row.payout_period}</span>
                    <span className="font-medium">{row.bonus_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </div>
                  <span className="font-semibold">₱{Number(row.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BCEarnings;
