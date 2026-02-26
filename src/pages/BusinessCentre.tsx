import { useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, GitBranch, DollarSign, Share2, Award, Megaphone,
  CreditCard, HelpCircle, Menu, TrendingUp, ArrowUpRight, ArrowDownRight,
  Copy, Download, ChevronRight, Crown, ExternalLink, Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TabKey = "dashboard" | "network" | "binary" | "commissions" | "referral" | "rank" | "marketing" | "payout" | "support";

const sidebarItems: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "network", label: "My Network", icon: Users },
  { key: "binary", label: "Binary Tree", icon: GitBranch },
  { key: "commissions", label: "Commissions", icon: DollarSign },
  { key: "referral", label: "Referral Program", icon: Share2 },
  { key: "rank", label: "Rank & Rewards", icon: Award },
  { key: "marketing", label: "Marketing Tools", icon: Megaphone },
  { key: "payout", label: "Payout Settings", icon: CreditCard },
  { key: "support", label: "Support", icon: HelpCircle },
];

// ─── Dashboard Panel ───
const DashboardPanel = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { title: "Total Earnings", value: "₱12,845.50", change: "+12.4%", up: true, icon: DollarSign },
        { title: "Active Network Members", value: "142", change: "+8 this week", up: true, icon: Users },
        { title: "Binary Volume (L / R)", value: "8,450 / 7,980", change: "470 carry", up: true, icon: GitBranch },
        { title: "Current Rank", value: "Gold Partner", change: "72% to Platinum", up: true, icon: Crown },
      ].map((stat) => (
        <Card key={stat.title} variant="glass" hover="lift" className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
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

    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Jan 15", type: "Direct Referral", amount: "₱120.00", status: "Approved" },
                { date: "Jan 16", type: "Binary Bonus", amount: "₱340.00", status: "Approved" },
                { date: "Jan 17", type: "Leadership Bonus", amount: "₱500.00", status: "Pending" },
                { date: "Jan 18", type: "Matching Bonus", amount: "₱85.00", status: "Approved" },
                { date: "Jan 19", type: "Direct Referral", amount: "₱200.00", status: "Approved" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">{row.date}</td>
                  <td className="py-3 px-2">{row.type}</td>
                  <td className="py-3 px-2 text-right font-medium">{row.amount}</td>
                  <td className="py-3 px-2 text-right">
                    <Badge variant={row.status === "Approved" ? "default" : "secondary"} className="text-xs">
                      {row.status}
                    </Badge>
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
        <p className="text-sm text-muted-foreground">Total Referrals: <span className="font-bold text-foreground">58</span></p>
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." className="pl-9" />
      </div>
    </div>
    <Card variant="glass">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Join Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Level</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "John Carter", date: "Jan 02", level: "L1", active: true },
                { name: "Maria Gonzales", date: "Jan 05", level: "L1", active: true },
                { name: "Daniel Cho", date: "Jan 07", level: "L2", active: true },
                { name: "Emily Johnson", date: "Jan 10", level: "L2", active: false },
                { name: "Alex Rivera", date: "Jan 14", level: "L1", active: true },
                { name: "Sophia Lee", date: "Jan 18", level: "L3", active: true },
              ].map((m, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{m.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{m.date}</td>
                  <td className="py-3 px-4"><Badge variant="outline">{m.level}</Badge></td>
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

// ─── Binary Tree Panel ───
const BinaryTreePanel = () => (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Binary Tree Structure</CardTitle>
        <CardDescription>Your network's binary placement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-8">
          {/* Root */}
          <div className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg">You</div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-start gap-0">
            <div className="flex flex-col items-center">
              <div className="w-24 h-px bg-border" />
              <div className="w-px h-6 bg-border" />
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm font-medium">Alex L</div>
              <div className="w-px h-6 bg-border" />
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <div className="px-3 py-1.5 rounded-md bg-muted text-xs">L1</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <div className="px-3 py-1.5 rounded-md bg-muted text-xs">L2</div>
                </div>
              </div>
            </div>
            <div className="w-12" />
            <div className="flex flex-col items-center">
              <div className="w-24 h-px bg-border" />
              <div className="w-px h-6 bg-border" />
              <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm font-medium">Brian R</div>
              <div className="w-px h-6 bg-border" />
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <div className="px-3 py-1.5 rounded-md bg-muted text-xs">R1</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <div className="px-3 py-1.5 rounded-md bg-muted text-xs">R2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-muted-foreground mb-1">Left Volume</p>
            <p className="text-xl font-bold text-emerald-600">8,450 pts</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1">Right Volume</p>
            <p className="text-xl font-bold text-blue-600">7,980 pts</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs text-muted-foreground mb-1">Carry Forward</p>
            <p className="text-xl font-bold text-accent">470 pts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Commissions Panel ───
const CommissionsPanel = () => (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Commission Structure</CardTitle>
        <CardDescription>How your earnings are calculated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { type: "Direct Referral", rate: "10%", color: "bg-emerald-500" },
          { type: "Binary Bonus", rate: "8%", color: "bg-blue-500" },
          { type: "Leadership Bonus", rate: "5%", color: "bg-purple-500" },
          { type: "Matching Bonus", rate: "3%", color: "bg-accent" },
        ].map((c) => (
          <div key={c.type} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${c.color}`} />
              <span className="font-medium text-sm">{c.type}</span>
            </div>
            <Badge variant="outline" className="font-bold">{c.rate}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Calculation Example</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Referral Purchase</span><span className="font-medium">₱1,000</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Direct Commission (10%)</span><span className="font-medium text-emerald-600">₱100</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Binary Bonus (8%)</span><span className="font-medium text-blue-600">₱80</span></div>
          <Separator />
          <div className="flex justify-between font-bold"><span>Total Earned</span><span className="text-primary">₱180</span></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Referral Panel ───
const ReferralPanel = () => {
  const { toast } = useToast();
  const referralLink = "https://terrafarming.app/register?ref=AMEER123";

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={referralLink} className="font-mono text-xs" />
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied!", description: "Referral link copied to clipboard" }); }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Clicks", value: "1,245" },
          { label: "Conversions", value: "58" },
          { label: "Conversion Rate", value: "4.6%" },
        ].map((s) => (
          <Card key={s.label} variant="glass" hover="lift">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Rank Panel ───
const RankPanel = () => {
  const ranks = ["Starter", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const currentRankIndex = 3;

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Crown className="h-5 w-5 text-accent" /> Your Rank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/30">
              <Award className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">Gold Partner</p>
              <p className="text-sm text-muted-foreground">Next: Platinum</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to Platinum</span>
              <span className="font-medium">72%</span>
            </div>
            <Progress value={72} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">7,200 / 10,000 binary volume required</p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {ranks.map((r, i) => (
              <Badge key={r} variant={i <= currentRankIndex ? "default" : "outline"} className={cn("text-xs", i === currentRankIndex && "ring-2 ring-accent ring-offset-2 ring-offset-background")}>
                {r}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Marketing Panel ───
const MarketingPanel = () => (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Marketing Assets</CardTitle>
        <CardDescription>Download materials to grow your network</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Terra Farming Presentation", type: "PDF" },
            { title: "Compensation Plan", type: "PDF" },
            { title: "Social Media Banners", type: "ZIP" },
            { title: "Email Templates", type: "ZIP" },
          ].map((asset) => (
            <div key={asset.title} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-medium text-sm">{asset.title}</p>
                <p className="text-xs text-muted-foreground">{asset.type}</p>
              </div>
              <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Payout Panel ───
const PayoutPanel = () => (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="text-lg">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Bank Transfer</span>
            <Badge>Active</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Global Trust Bank • **** 4832</p>
        </div>
        <div className="p-4 rounded-lg border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">GCash</span>
            <Badge variant="outline">Available</Badge>
          </div>
          <p className="text-xs text-muted-foreground">+63 9XX XXX X832</p>
        </div>
      </CardContent>
    </Card>
    <Card variant="glass">
      <CardContent className="p-5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Minimum Withdrawal</span>
          <span className="font-medium">₱500</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-muted-foreground">Withdrawal Fee</span>
          <span className="font-medium">2%</span>
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
              <SelectItem value="payout">Payout</SelectItem>
              <SelectItem value="network">Network</SelectItem>
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
      <CardContent>
        <div className="p-3 rounded-lg border border-border/50 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Ticket #1245</p>
            <p className="text-xs text-muted-foreground">Created: Jan 18</p>
          </div>
          <Badge>Open</Badge>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PANELS: Record<TabKey, React.FC> = {
  dashboard: DashboardPanel,
  network: NetworkPanel,
  binary: BinaryTreePanel,
  commissions: CommissionsPanel,
  referral: ReferralPanel,
  rank: RankPanel,
  marketing: MarketingPanel,
  payout: PayoutPanel,
  support: SupportPanel,
};

const BusinessCentre = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const isMobile = useIsMobile();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const ActivePanel = PANELS[activeTab];

  const SidebarNav = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn("flex flex-col gap-1 p-3", inSheet && "pt-6")}>
      <div className="px-3 mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">Business Centre</h2>
        <p className="text-xs text-muted-foreground">Partner Dashboard</p>
      </div>
      {sidebarItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveTab(item.key)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === item.key
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm">
            <SidebarNav />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl">
          {/* Mobile sidebar trigger */}
          {isMobile && (
            <div className="mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    {sidebarItems.find(i => i.key === activeTab)?.label}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarNav inSheet />
                </SheetContent>
              </Sheet>
            </div>
          )}

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ActivePanel />
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessCentre;
