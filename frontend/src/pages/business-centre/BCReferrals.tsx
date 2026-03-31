import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, TrendingUp, Users, CheckCircle2, Target } from "lucide-react";

const BCReferrals = () => {
  const { data } = useBusinessCentre();
  const { toast } = useToast();
  const referralLink = data.referralCode ? `https://terrafarming.app/register?ref=${data.referralCode}` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Referrals</h1>
        <p className="text-sm text-muted-foreground mt-1">Share your link and grow your network</p>
      </div>

      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Share2 className="h-4 w-4 text-primary" /> Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          <div className="flex gap-2">
            <Input readOnly value={referralLink || "Loading..."} className="font-mono text-[11px] h-9" />
            <Button size="sm" variant="outline" className="h-9 px-3" disabled={!data.referralCode} onClick={() => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied!", description: "Referral link copied to clipboard" }); }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Share this link. When someone registers and activates a package, you earn Direct Membership Bonus.</p>
          {data.referralCode && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground">Your Code:</span>
              <code className="text-xs font-bold font-mono text-primary">{data.referralCode}</code>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Link Clicks", value: "—", icon: TrendingUp },
          { label: "Registrations", value: "—", icon: Users },
          { label: "Activated", value: "—", icon: CheckCircle2 },
          { label: "Conversion", value: "—", icon: Target },
        ].map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold font-display">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BCReferrals;
