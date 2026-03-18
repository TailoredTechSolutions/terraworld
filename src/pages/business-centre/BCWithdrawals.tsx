import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock, CheckCircle } from "lucide-react";

const BCWithdrawals = () => {
  const { data } = useBusinessCentre();
  const wallet = data.wallet;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Withdrawals</h1>
        <p className="text-sm text-muted-foreground mt-1">Request and track your withdrawals</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Available Balance", value: `₱${(wallet?.available_balance ?? 0).toLocaleString()}`, icon: ArrowUpRight },
          { label: "Pending", value: `₱${(wallet?.pending_balance ?? 0).toLocaleString()}`, icon: Clock },
          { label: "Total Withdrawn", value: `₱${(wallet?.total_withdrawn ?? 0).toLocaleString()}`, icon: CheckCircle },
        ].map((m) => (
          <Card key={m.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <m.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold font-display">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold">Request Withdrawal</h3>
          <p className="text-xs text-muted-foreground">Minimum withdrawal: ₱500. Processing time: 1-3 business days.</p>
          <Button size="sm" className="h-9 text-sm" disabled={(wallet?.available_balance ?? 0) < 500}>
            Request Withdrawal
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">Withdrawal History</h3>
          <p className="text-xs text-muted-foreground">Your past withdrawal requests and their statuses will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BCWithdrawals;
