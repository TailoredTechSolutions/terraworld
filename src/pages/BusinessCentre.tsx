import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, GitBranch, DollarSign, Share2, Award, Megaphone,
  CreditCard, HelpCircle, Menu, TrendingUp, ArrowUpRight, ArrowDownRight,
  Copy, Download, ChevronRight, Crown, ExternalLink, Search, Wallet,
  CheckCircle2, XCircle, AlertTriangle, Coins, Shield, Zap, Target,
  BarChart3, Clock, Calendar, Star, Gift, ArrowRight, Info, Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import BinaryTreeExplorer from "@/components/member/BinaryTreeExplorer";
import RankActivationPanel from "@/components/business-centre/RankActivationPanel";
import CouponsPanel from "@/components/business-centre/CouponsPanel";


// ─── Dashboard Panel ───
const DashboardPanel = () => (
  <div className="space-y-6">
    {/* Welcome Banner */}
    <Card className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/20">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">Welcome back, Partner!</h2>
            <p className="text-sm text-muted-foreground">Pro Package • Binary Active • <span className="text-primary font-medium">3 Matching Levels</span></p>
          </div>
          <Badge className="ml-auto hidden sm:flex bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Qualified
          </Badge>
        </div>
      </CardContent>
    </Card>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { title: "Total Earnings", value: "₱48,325.50", change: "+₱6,240 this week", up: true, icon: DollarSign, accent: "text-emerald-600 bg-emerald-500/10" },
        { title: "Active Downline", value: "142", change: "+12 this month", up: true, icon: Users, accent: "text-blue-600 bg-blue-500/10" },
        { title: "Binary BV (L / R)", value: "24,500 / 21,800", change: "2,700 carry-forward", up: true, icon: GitBranch, accent: "text-purple-600 bg-purple-500/10" },
        { title: "AGRI Tokens", value: "1,247.5", change: "≈ ₱12,475 value", up: true, icon: Coins, accent: "text-accent bg-accent/10" },
      ].map((stat) => (
        <Card key={stat.title} variant="glass" hover="lift" className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-xl", stat.accent)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="text-xs gap-1">
                {stat.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                {stat.change}
              </Badge>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Qualification Checklist */}
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Qualification Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Paid Member", met: true, detail: "Pro Package Active" },
            { label: "Left Leg Active", met: true, detail: "Alex Rivera (L1)" },
            { label: "Right Leg Active", met: true, detail: "Maria Santos (L1)" },
            { label: "Product BV Generated", met: true, detail: "3,200 BV this period" },
          ].map((q) => (
            <div key={q.label} className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
              q.met ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"
            )}>
              {q.met ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
              <div>
                <p className="text-sm font-medium">{q.label}</p>
                <p className="text-xs text-muted-foreground">{q.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Recent Earnings Table */}
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Recent Earnings</CardTitle>
        <CardDescription>Latest commission transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Source</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Mar 01", type: "Direct Product", source: "Order #TF-8842", amount: "₱660.00", status: "Paid", color: "bg-emerald-500" },
                { date: "Mar 01", type: "Binary Pairing", source: "Matched 4,500 BV", amount: "₱450.00", status: "Paid", color: "bg-blue-500" },
                { date: "Feb 28", type: "Matching Bonus", source: "L1 – Alex Rivera", amount: "₱45.00", status: "Paid", color: "bg-purple-500" },
                { date: "Feb 28", type: "Direct Membership", source: "Emily Cruz (Basic)", amount: "₱80.00", status: "Paid", color: "bg-amber-500" },
                { date: "Feb 27", type: "Direct Product", source: "Order #TF-8801", amount: "₱396.00", status: "Paid", color: "bg-emerald-500" },
                { date: "Feb 27", type: "Binary Pairing", source: "Matched 3,200 BV", amount: "₱320.00", status: "Paid", color: "bg-blue-500" },
                { date: "Feb 26", type: "Token Reward", source: "BV Activity Bonus", amount: "12.5 AGRI", status: "Issued", color: "bg-accent" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 text-muted-foreground">{row.date}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", row.color)} />
                      <span className="font-medium">{row.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{row.source}</td>
                  <td className="py-3 px-2 text-right font-semibold">{row.amount}</td>
                  <td className="py-3 px-2 text-right">
                    <Badge variant={row.status === "Paid" ? "default" : "secondary"} className="text-xs">{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Network Panel ───
const NetworkPanel = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">My Network</h3>
        <p className="text-sm text-muted-foreground">Direct Referrals: <span className="font-bold text-foreground">24</span> • Total Downline: <span className="font-bold text-foreground">142</span></p>
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." className="pl-9" />
      </div>
    </div>

    {/* Network Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Left Leg Total", value: "78", icon: ArrowDownRight },
        { label: "Right Leg Total", value: "64", icon: ArrowUpRight },
        { label: "Active Members", value: "118", icon: CheckCircle2 },
        { label: "New This Month", value: "12", icon: Star },
      ].map((s) => (
        <Card key={s.label} variant="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card variant="glass">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Join Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Leg</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Package</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product BV</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Alex Rivera", date: "Jan 02", leg: "Left", pkg: "Pro", bv: "4,200", active: true },
                { name: "Maria Santos", date: "Jan 05", leg: "Right", pkg: "Elite", bv: "8,750", active: true },
                { name: "Daniel Cho", date: "Jan 10", leg: "Left", pkg: "Basic", bv: "1,800", active: true },
                { name: "Emily Cruz", date: "Jan 14", leg: "Right", pkg: "Basic", bv: "1,200", active: true },
                { name: "Jake Tan", date: "Jan 18", leg: "Left", pkg: "Starter", bv: "650", active: true },
                { name: "Sophia Lee", date: "Jan 22", leg: "Right", pkg: "Pro", bv: "3,100", active: true },
                { name: "Carlos Reyes", date: "Feb 01", leg: "Left", pkg: "Starter", bv: "320", active: false },
                { name: "Lena Park", date: "Feb 08", leg: "Right", pkg: "Free", bv: "0", active: false },
              ].map((m, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{m.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{m.date}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={m.leg === "Left" ? "border-emerald-500/50 text-emerald-600" : "border-blue-500/50 text-blue-600"}>
                      {m.leg}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={cn("text-xs",
                      m.pkg === "Elite" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                      m.pkg === "Pro" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                      m.pkg === "Basic" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                      m.pkg === "Starter" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                      m.pkg === "Free" && "bg-muted text-muted-foreground",
                    )} variant="outline">{m.pkg}</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{m.bv}</td>
                  <td className="py-3 px-4">
                    <Badge variant={m.active ? "default" : "secondary"}>{m.active ? "Active" : "Inactive"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Binary Tree Panel ── now uses the interactive explorer

const BinaryTreePanel = () => <BinaryTreeExplorer />;

// ─── Commissions Panel (Spec-Correct Rates) ───
const CommissionsPanel = () => (
  <div className="space-y-6">
    {/* Commission Types */}
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" /> Commission Structure (Pro Package)
        </CardTitle>
        <CardDescription>Your current rates based on Pro tier membership</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { type: "Direct Product Sales", rate: "22%", basis: "of Terra Fee", formula: "Terra Fee × 22%", color: "bg-emerald-500", earned: "₱14,520" },
          { type: "Direct Membership Sales", rate: "8%", basis: "of Package Price", formula: "Package Price × 8%", color: "bg-amber-500", earned: "₱3,200" },
          { type: "Binary Pairing Commission", rate: "10%", basis: "of Lesser Leg BV", formula: "min(Left BV, Right BV) × 10%", color: "bg-blue-500", earned: "₱21,800" },
          { type: "Matching Bonus (3 Levels)", rate: "10/5/5%", basis: "of downline binary paid", formula: "L1: 10% + L2: 5% + L3: 5%", color: "bg-purple-500", earned: "₱8,805" },
        ].map((c) => (
          <div key={c.type} className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", c.color)} />
                <span className="font-semibold text-sm">{c.type}</span>
              </div>
              <Badge variant="outline" className="font-bold">{c.rate}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pl-6">
              <span>{c.basis} • <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.formula}</code></span>
              <span className="font-semibold text-foreground">Total: {c.earned}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* Daily Binary Cap */}
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Daily Binary Cap — Pro Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Today's Binary Earned</span>
          <span className="font-bold">₱2,180 / ₱50,000</span>
        </div>
        <Progress value={4.36} className="h-2" />
        <p className="text-xs text-muted-foreground">Cap applies to binary pairing commission only. Direct, matching, and token rewards are uncapped.</p>
      </CardContent>
    </Card>

    {/* Fail-safe Transparency */}
    <Card variant="glass" className="border-amber-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Fail-Safe Status (Membership BV)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Fail-safe Triggered", value: "No", ok: true },
            { label: "Pool Ratio", value: "62.4%", ok: true },
            { label: "Base Cycle Value", value: "₱50 / 500 BV", ok: true },
            { label: "Adjusted Cycle Value", value: "₱50 (no change)", ok: true },
          ].map((f) => (
            <div key={f.label} className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-bold text-foreground">{f.value}</p>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            The fail-safe ensures Membership BV payouts never exceed 75% of the Compensation Pool (33% of Terra Fee). If the ratio exceeds 75%, the cycle value is adjusted proportionally. This does not affect product bonuses, matching, or token rewards.
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Calculation Example */}
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-sm">Example: ₱1,000 Order with ₱300 Terra Fee</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Farmer Base Price</span><span>₱700.00</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Terra Fee (30% markup)</span><span className="font-medium">₱300.00</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">BV Created</span><span className="font-medium">300 BV</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Compensation Pool (33% of ₱300)</span><span>₱99.00</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Your Direct Product Bonus (22%)</span><span className="text-emerald-600 font-semibold">₱66.00</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">BV credited to binary tree</span><span className="text-blue-600 font-semibold">300 BV</span></div>
        </div>
      </CardContent>
    </Card>

    {/* Rate Comparison by Package */}
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-sm">Commission Rates by Package</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground">Package</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Direct Product</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Direct Membership</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Binary</th>
                <th className="text-center py-2 px-2 text-muted-foreground">Matching Levels</th>
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
                <tr key={r.pkg} className={cn("border-b border-border/50", r.current && "bg-primary/5")}>
                  <td className="py-2 px-2 font-medium">{r.pkg} {r.current && <Badge className="ml-1 text-[10px]">You</Badge>}</td>
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

// ─── Referral Panel ───
const ReferralPanel = () => {
  const { toast } = useToast();
  const referralLink = "https://terrafarming.app/register?ref=TERRA-PRO-7X4K";

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input readOnly value={referralLink} className="font-mono text-xs" />
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied!", description: "Referral link copied to clipboard" }); }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Share this link. When someone registers and activates a package, you earn Direct Membership Bonus (8% as Pro).</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Link Clicks", value: "1,847", icon: TrendingUp },
          { label: "Registrations", value: "86", icon: Users },
          { label: "Activated (Paid)", value: "58", icon: CheckCircle2 },
          { label: "Conversion Rate", value: "3.1%", icon: Target },
        ].map((s) => (
          <Card key={s.label} variant="glass" hover="lift">
            <CardContent className="p-5 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Referrals */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-sm">Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Carlos Reyes", date: "Feb 01", pkg: "Starter", bonus: "₱20.00" },
              { name: "Emily Cruz", date: "Jan 28", pkg: "Basic", bonus: "₱60.00" },
              { name: "Sophia Lee", date: "Jan 22", pkg: "Pro", bonus: "₱240.00" },
              { name: "Jake Tan", date: "Jan 18", pkg: "Starter", bonus: "₱20.00" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.date} • {r.pkg} Package</p>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">+{r.bonus}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// RankPanel now uses the unified RankActivationPanel component
// (imported at top)
// ─── Marketing Panel ───
const MarketingPanel = () => (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Marketing Assets</CardTitle>
        <CardDescription>Download materials to grow your network</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Terra Farming Presentation", type: "PDF", size: "2.4 MB", downloads: 342 },
            { title: "Compensation Plan Overview", type: "PDF", size: "1.8 MB", downloads: 567 },
            { title: "Social Media Banner Pack", type: "ZIP", size: "8.2 MB", downloads: 189 },
            { title: "Email Swipe Templates", type: "ZIP", size: "512 KB", downloads: 94 },
            { title: "Product Catalog", type: "PDF", size: "5.1 MB", downloads: 423 },
            { title: "Video Testimonials", type: "MP4", size: "45 MB", downloads: 76 },
          ].map((asset) => (
            <div key={asset.title} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-medium text-sm">{asset.title}</p>
                <p className="text-xs text-muted-foreground">{asset.type} • {asset.size} • {asset.downloads} downloads</p>
              </div>
              <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Wallet & Payout Panel ───
const PayoutPanel = () => (
  <div className="space-y-6">
    {/* Wallet Overview */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Available Balance", value: "₱18,425.50", icon: Wallet, accent: "text-emerald-600 bg-emerald-500/10" },
        { label: "Pending Commissions", value: "₱3,280.00", icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
        { label: "Total Withdrawn", value: "₱26,620.00", icon: ArrowUpRight, accent: "text-blue-600 bg-blue-500/10" },
      ].map((w) => (
        <Card key={w.label} variant="glass" hover="lift">
          <CardContent className="p-5">
            <div className={cn("p-2 rounded-xl w-fit mb-3", w.accent)}>
              <w.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{w.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{w.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Payment Methods */}
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Bank Transfer</span>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">Primary</Badge>
          </div>
          <p className="text-xs text-muted-foreground">BDO Unibank • **** 4832 • Juan Dela Cruz</p>
        </div>
        <div className="p-4 rounded-lg border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">GCash</span>
            <Badge variant="outline">Available</Badge>
          </div>
          <p className="text-xs text-muted-foreground">+63 917 XXX X832</p>
        </div>
        <div className="flex justify-between text-sm p-3 rounded-lg bg-muted/30">
          <span className="text-muted-foreground">Minimum Withdrawal</span>
          <span className="font-medium">₱500</span>
        </div>
      </CardContent>
    </Card>

    {/* Withdrawal History */}
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-sm">Recent Withdrawals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { date: "Feb 25", method: "Bank Transfer", amount: "₱10,000", fee: "₱200", net: "₱9,800", status: "Paid" },
            { date: "Feb 10", method: "GCash", amount: "₱5,000", fee: "₱100", net: "₱4,900", status: "Paid" },
            { date: "Jan 28", method: "Bank Transfer", amount: "₱8,000", fee: "₱160", net: "₱7,840", status: "Paid" },
            { date: "Jan 15", method: "GCash", amount: "₱3,620", fee: "₱72.40", net: "₱3,547.60", status: "Paid" },
          ].map((w, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-medium text-sm">{w.method}</p>
                <p className="text-xs text-muted-foreground">{w.date} • Fee: {w.fee}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{w.net}</p>
                <Badge variant="default" className="text-[10px]">{w.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* AGRI Token Wallet */}
    <Card variant="glass" className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Coins className="h-4 w-4 text-accent" /> AGRI Token Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-accent/5 text-center">
            <p className="text-xl font-bold text-accent">1,247.5</p>
            <p className="text-xs text-muted-foreground">Token Balance</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-xl font-bold text-foreground">₱10.00</p>
            <p className="text-xs text-muted-foreground">Current Market Price</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { date: "Feb 28", reason: "BV Activity Reward", php: "₱125", tokens: "12.5 AGRI" },
            { date: "Feb 21", reason: "Consumer Onboarding", php: "₱50", tokens: "5.0 AGRI" },
            { date: "Feb 14", reason: "Farmer Referral Reward", php: "₱200", tokens: "20.0 AGRI" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/20">
              <div>
                <span className="text-muted-foreground">{t.date}</span>
                <span className="ml-2 font-medium">{t.reason}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">{t.php} → </span>
                <span className="font-bold text-accent">{t.tokens}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Support Panel ───
const SupportPanel = () => (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Submit a Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="Brief description of your issue" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="commission">Commission Issues</SelectItem>
              <SelectItem value="binary">Binary Tree / BV</SelectItem>
              <SelectItem value="payout">Payout & Withdrawals</SelectItem>
              <SelectItem value="membership">Membership / Package</SelectItem>
              <SelectItem value="tokens">Token Rewards</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Describe your issue..." rows={4} />
        </div>
        <Button className="w-full">Submit Ticket</Button>
      </CardContent>
    </Card>
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-sm">Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { id: "#TK-1245", subject: "Binary volume not updating", date: "Feb 28", status: "Open" },
          { id: "#TK-1198", subject: "Withdrawal delayed", date: "Feb 20", status: "Resolved" },
          { id: "#TK-1142", subject: "Package upgrade question", date: "Feb 10", status: "Closed" },
        ].map((t, i) => (
          <div key={i} className="p-3 rounded-lg border border-border/50 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div>
              <p className="font-medium text-sm">{t.id} — {t.subject}</p>
              <p className="text-xs text-muted-foreground">{t.date}</p>
            </div>
            <Badge variant={t.status === "Open" ? "default" : t.status === "Resolved" ? "secondary" : "outline"}>{t.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);


const SectionHeader = ({ icon: Icon, title, id }: { icon: React.ElementType; title: string; id: string }) => (
  <div id={id} className="flex items-center gap-3 pt-8 pb-4 scroll-mt-20">
    <div className="p-2 rounded-xl bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <h2 className="text-xl font-bold font-display text-foreground">{title}</h2>
    <Separator className="flex-1" />
  </div>
);

const BusinessCentre = () => {
  const { user, loading } = useAuth();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          {/* Dashboard */}
          <SectionHeader icon={LayoutDashboard} title="Dashboard" id="dashboard" />
          <DashboardPanel />

          {/* My Network */}
          <SectionHeader icon={Users} title="My Network" id="network" />
          <NetworkPanel />

          {/* Binary Tree */}
          <SectionHeader icon={GitBranch} title="Binary Tree" id="binary" />
          <BinaryTreePanel />

          {/* Commissions */}
          <SectionHeader icon={DollarSign} title="Commissions" id="commissions" />
          <CommissionsPanel />

          {/* Referrals */}
          <SectionHeader icon={Share2} title="Referrals" id="referral" />
          <ReferralPanel />

          {/* Rank & Packages */}
          <SectionHeader icon={Crown} title="Rank & Packages" id="rank" />
          <RankPanel />

          {/* Marketing Tools */}
          <SectionHeader icon={Megaphone} title="Marketing Tools" id="marketing" />
          <MarketingPanel />

          {/* Wallet & Payouts */}
          <SectionHeader icon={Wallet} title="Wallet & Payouts" id="payout" />
          <PayoutPanel />

          {/* Support */}
          <SectionHeader icon={HelpCircle} title="Support" id="support" />
          <SupportPanel />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessCentre;
