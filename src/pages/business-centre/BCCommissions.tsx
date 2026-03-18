import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DollarSign, Target, AlertTriangle, Info } from "lucide-react";

const BCCommissions = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold font-display">Commissions</h1>
      <p className="text-sm text-muted-foreground mt-1">Your commission structure and earnings breakdown</p>
    </div>

    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" /> Commission Structure (Pro Package)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        {[
          { type: "Direct Product Sales", rate: "22%", basis: "of Terra Fee", formula: "Terra Fee × 22%", color: "bg-emerald-500", earned: "₱14,520" },
          { type: "Direct Membership Sales", rate: "8%", basis: "of Package Price", formula: "Package Price × 8%", color: "bg-amber-500", earned: "₱3,200" },
          { type: "Binary Pairing Commission", rate: "10%", basis: "of Lesser Leg BV", formula: "min(Left BV, Right BV) × 10%", color: "bg-blue-500", earned: "₱21,800" },
          { type: "Matching Bonus (3 Levels)", rate: "10/5/5%", basis: "of downline binary paid", formula: "L1: 10% + L2: 5% + L3: 5%", color: "bg-purple-500", earned: "₱8,805" },
        ].map((c) => (
          <div key={c.type} className="p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", c.color)} />
                <span className="font-medium text-xs">{c.type}</span>
              </div>
              <Badge variant="outline" className="font-bold text-[10px] px-1.5 py-0">{c.rate}</Badge>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 pl-5">
              <span>{c.basis} • <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{c.formula}</code></span>
              <span className="font-semibold text-foreground">Total: {c.earned}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-primary" /> Daily Binary Cap — Pro Package
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Today's Binary Earned</span>
            <span className="font-bold">₱2,180 / ₱50,000</span>
          </div>
          <Progress value={4.36} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground">Cap applies to binary pairing commission only.</p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/20">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Fail-Safe Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Triggered", value: "No" },
              { label: "Pool Ratio", value: "62.4%" },
              { label: "Cycle Value", value: "₱50 / 500 BV" },
              { label: "Adjusted", value: "₱50 (no change)" },
            ].map((f) => (
              <div key={f.label} className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-xs font-bold">{f.value}</p>
                <p className="text-[10px] text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-xs">Commission Rates by Package</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground">Package</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Direct Product</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Direct Membership</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Binary</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Matching</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Daily Cap</th>
              </tr>
            </thead>
            <tbody>
              {[
                { pkg: "Free", dp: "15%", dm: "—", bin: "—", match: "—", cap: "—" },
                { pkg: "Starter", dp: "18%", dm: "4%", bin: "10%", match: "L1: 10%", cap: "₱5,000" },
                { pkg: "Basic", dp: "20%", dm: "6%", bin: "10%", match: "L1-L2", cap: "₱15,000" },
                { pkg: "Pro", dp: "22%", dm: "8%", bin: "10%", match: "L1-L3", cap: "₱50,000", current: true },
                { pkg: "Elite", dp: "25%", dm: "10%", bin: "10%", match: "L1-L5", cap: "₱250,000" },
              ].map((r) => (
                <tr key={r.pkg} className={cn("border-b border-border/30", r.current && "bg-primary/5")}>
                  <td className="py-2 px-2 font-medium">{r.pkg} {r.current && <Badge className="ml-1 text-[9px] px-1 py-0">You</Badge>}</td>
                  <td className="py-2 px-2 text-center">{r.dp}</td>
                  <td className="py-2 px-2 text-center">{r.dm}</td>
                  <td className="py-2 px-2 text-center">{r.bin}</td>
                  <td className="py-2 px-2 text-center">{r.match}</td>
                  <td className="py-2 px-2 text-center">{r.cap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default BCCommissions;
