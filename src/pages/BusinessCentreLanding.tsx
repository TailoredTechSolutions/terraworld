import { Navigate } from "react-router-dom";
import { HERO_BADGE as terraHeroBadge, BUSINESS_CENTRE_HERO as businessCentreHero } from "@/lib/siteImages";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CouponsPanel from "@/components/business-centre/CouponsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  LayoutDashboard, Users, GitBranch, DollarSign, Share2, Award, Megaphone,
  CreditCard, HelpCircle, TrendingUp, ArrowUpRight, ArrowDownRight,
  Copy, Download, Crown, Search, Wallet, Ticket,
  CheckCircle2, XCircle, AlertTriangle, Coins, Shield, Zap, Target,
  BarChart3, Clock, Star, Info, Settings, FileText, Scale, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState, useEffect } from "react";

const cubicSmooth = [0.22, 1, 0.36, 1] as const;

// ─── Section Navigation (base items for all roles) ───
const BASE_NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "network", label: "Network", icon: Users },
  { id: "binary", label: "Binary Tree", icon: GitBranch },
  { id: "commissions", label: "Commissions", icon: DollarSign },
  { id: "referral", label: "Referrals", icon: Share2 },
  { id: "rank", label: "Rank & Activation", icon: Award },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "payout", label: "Wallet", icon: Wallet },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "support", label: "Support", icon: HelpCircle },
];

// Admin-only sections shown below a divider
const ADMIN_NAV_ITEMS = [
  { id: "admin-members", label: "Member Search", icon: Search },
  { id: "admin-commissions", label: "Commission Runs", icon: BarChart3 },
  { id: "admin-payouts", label: "Payout Oversight", icon: CreditCard },
  { id: "admin-compliance", label: "Compliance", icon: Scale },
  { id: "admin-settings", label: "System Settings", icon: Settings },
];

// Super Admin additional sections
const SUPERADMIN_NAV_ITEMS = [
  { id: "admin-security", label: "Security & Roles", icon: Lock },
  { id: "admin-audit", label: "Audit Logs", icon: FileText },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ─── Section Header ───
const SectionHeader = ({ icon: Icon, title, id }: { icon: React.ElementType; title: string; id: string }) => (
  <div id={id} className="flex items-center gap-3 scroll-mt-28">
    <div className="p-2.5 rounded-xl bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <h2 className="text-xl font-bold font-display text-foreground">{title}</h2>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ─── Types for data-driven panels ───
interface BusinessData {
  walletData: { available_balance: number; pending_balance: number; total_withdrawn: number; internal_balance: number } | null;
  membership: { tier: string; package_price: number; membership_bv: number } | null;
  totalEarnings: number;
  binaryStats: { left_bv: number; right_bv: number; matched_bv: number };
  tokenBalance: number;
  referralCode: string;
  recentEarnings: Array<{ bonus_type: string; net_amount: number; payout_period: string; source_order_id: string | null }>;
  isAnyAdmin: boolean;
}

// ─── Dashboard Panel ───
const DashboardPanel = ({ data }: { data: BusinessData }) => {
  const tier = data.membership?.tier || "free";
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
  const carryForward = Math.abs(data.binaryStats.left_bv - data.binaryStats.right_bv);

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold font-display text-foreground">
                {data.isAnyAdmin ? "System Overview" : "Welcome back, Partner!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tierLabel} Package • Binary {data.binaryStats.matched_bv > 0 ? "Active" : "Inactive"}
              </p>
            </div>
            <Badge className="hidden sm:flex bg-emerald-500/10 text-emerald-600 border-emerald-500/30" variant="outline">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {tier !== "free" ? "Qualified" : "Free Tier"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Earnings", value: `₱${data.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: "All time", up: true, icon: DollarSign, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Binary BV (L / R)", value: `${data.binaryStats.left_bv.toLocaleString()} / ${data.binaryStats.right_bv.toLocaleString()}`, change: `${carryForward.toLocaleString()} carry-forward`, up: true, icon: GitBranch, accent: "text-purple-600 bg-purple-500/10" },
          { title: "Wallet Balance", value: `₱${(data.walletData?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: `₱${(data.walletData?.pending_balance || 0).toLocaleString()} pending`, up: true, icon: Wallet, accent: "text-blue-600 bg-blue-500/10" },
          { title: "AGRI Tokens", value: data.tokenBalance.toLocaleString(), change: "Non-cash reward", up: true, icon: Coins, accent: "text-accent bg-accent/10" },
        ].map((stat) => (
          <Card key={stat.title} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-1.5 rounded-lg", stat.accent)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  {stat.up ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold font-display text-foreground leading-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2 px-5 pt-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Qualification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { label: "Paid Member", met: tier !== "free", detail: tier !== "free" ? `${tierLabel} Package Active` : "No package" },
              { label: "Left Leg BV", met: data.binaryStats.left_bv > 0, detail: `${data.binaryStats.left_bv.toLocaleString()} BV` },
              { label: "Right Leg BV", met: data.binaryStats.right_bv > 0, detail: `${data.binaryStats.right_bv.toLocaleString()} BV` },
              { label: "Matched BV", met: data.binaryStats.matched_bv > 0, detail: `${data.binaryStats.matched_bv.toLocaleString()} BV matched` },
            ].map((q) => (
              <div key={q.label} className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border",
                q.met ? "border-emerald-500/20 bg-emerald-500/5" : "border-destructive/20 bg-destructive/5"
              )}>
                {q.met ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                <div>
                  <p className="text-xs font-medium leading-tight">{q.label}</p>
                  <p className="text-[10px] text-muted-foreground">{q.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm">Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          {data.recentEarnings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No earnings recorded yet. Start building your network!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-medium text-xs">Period</th>
                    <th className="text-left py-2.5 px-2 text-muted-foreground font-medium text-xs">Type</th>
                    <th className="text-right py-2.5 px-2 text-muted-foreground font-medium text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEarnings.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.payout_period}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full",
                            row.bonus_type === "direct_product" ? "bg-emerald-500" :
                            row.bonus_type === "binary" ? "bg-blue-500" :
                            row.bonus_type === "matching" ? "bg-purple-500" : "bg-amber-500"
                          )} />
                          <span className="text-xs font-medium">{row.bonus_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-xs">₱{Number(row.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
// ─── Network Panel ───
const NetworkPanel = () => (
  <div className="space-y-5">
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <p className="text-sm text-muted-foreground">Direct Referrals: <span className="font-bold text-foreground">24</span> • Total Downline: <span className="font-bold text-foreground">142</span></p>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." className="pl-9 h-9 text-sm" />
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Left Leg Total", value: "78" },
        { label: "Right Leg Total", value: "64" },
        { label: "Active Members", value: "118" },
        { label: "New This Month", value: "12" },
      ].map((s) => (
        <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
          <p className="text-xl font-bold font-display text-foreground">{s.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>

    <Card className="border-border/40">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Name</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs hidden sm:table-cell">Join Date</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Leg</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Package</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs hidden md:table-cell">Product BV</th>
                <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Status</th>
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
                <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-xs">{m.name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs hidden sm:table-cell">{m.date}</td>
                  <td className="py-2.5 px-4">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", m.leg === "Left" ? "border-emerald-500/40 text-emerald-600" : "border-blue-500/40 text-blue-600")}>
                      {m.leg}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge className={cn("text-[10px] px-1.5 py-0",
                      m.pkg === "Elite" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                      m.pkg === "Pro" && "bg-purple-500/10 text-purple-600 border-purple-500/30",
                      m.pkg === "Basic" && "bg-blue-500/10 text-blue-600 border-blue-500/30",
                      m.pkg === "Starter" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                      m.pkg === "Free" && "bg-muted text-muted-foreground",
                    )} variant="outline">{m.pkg}</Badge>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-xs hidden md:table-cell">{m.bv}</td>
                  <td className="py-2.5 px-4">
                    <Badge variant={m.active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">{m.active ? "Active" : "Inactive"}</Badge>
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
  <div className="space-y-5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Left Product BV", value: "16,200", color: "text-emerald-600 bg-emerald-500/5 border-emerald-500/20" },
        { label: "Left Membership BV", value: "8,300", color: "text-emerald-700 bg-emerald-500/10 border-emerald-500/30" },
        { label: "Right Product BV", value: "14,500", color: "text-blue-600 bg-blue-500/5 border-blue-500/20" },
        { label: "Right Membership BV", value: "7,300", color: "text-blue-700 bg-blue-500/10 border-blue-500/30" },
      ].map((s) => (
        <div key={s.label} className={cn("text-center p-3 rounded-xl border", s.color)}>
          <p className="text-lg font-bold font-display">{s.value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>

    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-sm">Binary Tree Structure</CardTitle>
        <CardDescription className="text-xs">Product & Membership BV tracked separately</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex flex-col items-center py-6">
          <div className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md flex items-center gap-2">
            <Crown className="h-4 w-4" /> You (Pro)
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-start gap-0">
            {/* Left */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-px bg-border" />
              <div className="w-px h-5 bg-border" />
              <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-center">
                <p>Alex Rivera</p>
                <p className="text-[10px] text-muted-foreground">Pro • 4,200 BV</p>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex gap-4">
                {[{ name: "Daniel", tier: "Basic" }, { name: "Jake", tier: "Starter" }].map((n) => (
                  <div key={n.name} className="flex flex-col items-center">
                    <div className="w-px h-3 bg-border" />
                    <div className="px-2.5 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-center">
                      <p className="font-medium">{n.name}</p>
                      <p className="text-muted-foreground">{n.tier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-10" />
            {/* Right */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-px bg-border" />
              <div className="w-px h-5 bg-border" />
              <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs font-medium text-center">
                <p>Maria Santos</p>
                <p className="text-[10px] text-muted-foreground">Elite • 8,750 BV</p>
              </div>
              <div className="w-px h-5 bg-border" />
              <div className="flex gap-4">
                {[{ name: "Emily", tier: "Basic" }, { name: "Sophia", tier: "Pro" }].map((n) => (
                  <div key={n.name} className="flex flex-col items-center">
                    <div className="w-px h-3 bg-border" />
                    <div className="px-2.5 py-1 rounded-md bg-blue-500/5 border border-blue-500/15 text-[10px] text-center">
                      <p className="font-medium">{n.name}</p>
                      <p className="text-muted-foreground">{n.tier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Left BV</p>
            <p className="text-lg font-bold text-emerald-600">24,500</p>
            <p className="text-[10px] text-muted-foreground">Product: 16,200 • Membership: 8,300</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Right BV</p>
            <p className="text-lg font-bold text-blue-600">21,800</p>
            <p className="text-[10px] text-muted-foreground">Product: 14,500 • Membership: 7,300</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-[10px] text-muted-foreground mb-0.5">Carry Forward</p>
            <p className="text-lg font-bold text-accent">2,700</p>
            <p className="text-[10px] text-muted-foreground">Matched: 21,800 BV</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Commissions Panel ───
const CommissionsPanel = () => (
  <div className="space-y-5">
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
                <p className="text-xs font-bold text-foreground">{f.value}</p>
                <p className="text-[10px] text-muted-foreground">{f.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-xs">Example: ₱1,000 Order with ₱300 Terra Fee</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="space-y-1.5 text-xs">
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

// ─── Referral Panel ───
const ReferralPanel = ({ referralCode }: { referralCode: string }) => {
  const { toast } = useToast();
  const referralLink = referralCode ? `https://terrafarming.app/register?ref=${referralCode}` : "";

  return (
    <div className="space-y-5">
      <Card className="border-border/40">
        <CardHeader className="px-5 pt-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Share2 className="h-4 w-4 text-primary" /> Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          <div className="flex gap-2">
            <Input readOnly value={referralLink || "Loading..."} className="font-mono text-[11px] h-9" />
            <Button size="sm" variant="outline" className="h-9 px-3" disabled={!referralCode} onClick={() => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied!", description: "Referral link copied to clipboard" }); }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Share this link. When someone registers and activates a package, you earn Direct Membership Bonus.</p>
          {referralCode && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground">Your Code:</span>
              <code className="text-xs font-bold font-mono text-primary">{referralCode}</code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Rank & Packages Panel ───
const RankPanel = () => (
  <div className="space-y-5">
    <Card className="bg-gradient-to-br from-purple-500/10 via-primary/5 to-transparent border-purple-500/20">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30">
            <Award className="h-7 w-7 text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-bold font-display">Pro Partner</p>
            <p className="text-xs text-muted-foreground">₱3,000 Package • 3,000 Membership BV • 3 Matching Levels</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { name: "Free", price: "₱0", bv: "0 BV", binary: "—", matching: "—", cap: "—", color: "border-muted", active: false },
        { name: "Starter", price: "₱500", bv: "500 BV", binary: "10%", matching: "L1: 10%", cap: "₱5,000/day", color: "border-emerald-500/30", active: false },
        { name: "Basic", price: "₱1,000", bv: "1,000 BV", binary: "10%", matching: "L1: 10%, L2: 5%", cap: "₱15,000/day", color: "border-blue-500/30", active: false },
        { name: "Pro", price: "₱3,000", bv: "3,000 BV", binary: "10%", matching: "L1: 10%, L2-L3: 5%", cap: "₱50,000/day", color: "border-purple-500/30", active: true },
        { name: "Elite", price: "₱5,000", bv: "5,000 BV", binary: "10%", matching: "L1: 10%, L2-L5: 5%", cap: "₱250,000/day", color: "border-amber-500/30", active: false },
      ].map((pkg) => (
        <Card key={pkg.name} className={cn("relative overflow-hidden", pkg.color, pkg.active && "ring-2 ring-primary")}>
          {pkg.active && (
            <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-bl-lg">CURRENT</div>
          )}
          <CardContent className="p-4 space-y-2.5">
            <div>
              <p className="text-sm font-bold font-display">{pkg.name}</p>
              <p className="text-xl font-bold text-primary">{pkg.price}</p>
            </div>
            <Separator />
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Membership BV</span><span className="font-medium">{pkg.bv}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Binary Rate</span><span className="font-medium">{pkg.binary}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Matching</span><span className="font-medium">{pkg.matching}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Daily Cap</span><span className="font-medium">{pkg.cap}</span></div>
            </div>
            {!pkg.active && pkg.name !== "Free" && (
              <Button size="sm" variant="outline" className="w-full mt-1 text-xs h-8">
                {pkg.name === "Elite" ? "Upgrade" : "Select"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ─── Wallet & Payout Panel ───
const PayoutPanel = ({ data }: { data: BusinessData }) => {
  const fmt = (n: number) => `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Cash Balance", value: fmt(data.walletData?.available_balance || 0), icon: Wallet, accent: "text-emerald-600 bg-emerald-500/10" },
          { label: "Internal Wallet", value: fmt(data.walletData?.internal_balance || 0), icon: Ticket, accent: "text-primary bg-primary/10" },
          { label: "Pending", value: fmt(data.walletData?.pending_balance || 0), icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
          { label: "Total Withdrawn", value: fmt(data.walletData?.total_withdrawn || 0), icon: ArrowUpRight, accent: "text-blue-600 bg-blue-500/10" },
        ].map((w) => (
          <Card key={w.label} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", w.accent)}>
                <w.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold font-display text-foreground">{w.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{w.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-sm">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            <div className="p-3 rounded-lg border border-border/40 space-y-1">
              <span className="font-medium text-xs">Bank Transfer</span>
              <p className="text-[10px] text-muted-foreground">Configure your bank details for withdrawals</p>
            </div>
            <div className="p-3 rounded-lg border border-border/40 space-y-1">
              <span className="font-medium text-xs">GCash</span>
              <p className="text-[10px] text-muted-foreground">Configure your GCash for faster payouts</p>
            </div>
            <div className="flex justify-between text-xs p-2.5 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">Minimum Withdrawal</span>
              <span className="font-medium">₱500</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="px-5 pt-4 pb-2">
            <CardTitle className="text-xs flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-accent" /> AGRI Token Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-accent/5 text-center">
                <p className="text-xl font-bold text-accent">{data.tokenBalance.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Token Balance</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xl font-bold text-foreground">₱10.00</p>
                <p className="text-[10px] text-muted-foreground">Current Market Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ─── Marketing Panel ───
const MarketingPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Marketing Assets</CardTitle>
      <CardDescription className="text-xs">Download materials to grow your network</CardDescription>
    </CardHeader>
    <CardContent className="px-5 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { title: "Terra Farming Presentation", type: "PDF", size: "2.4 MB", downloads: 342 },
          { title: "Compensation Plan Overview", type: "PDF", size: "1.8 MB", downloads: 567 },
          { title: "Social Media Banner Pack", type: "ZIP", size: "8.2 MB", downloads: 189 },
          { title: "Email Swipe Templates", type: "ZIP", size: "512 KB", downloads: 94 },
          { title: "Product Catalog", type: "PDF", size: "5.1 MB", downloads: 423 },
          { title: "Video Testimonials", type: "MP4", size: "45 MB", downloads: 76 },
        ].map((asset) => (
          <div key={asset.title} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
            <div>
              <p className="font-medium text-xs">{asset.title}</p>
              <p className="text-[10px] text-muted-foreground">{asset.type} • {asset.size} • {asset.downloads} downloads</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ─── Support Panel ───
const SupportPanel = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-sm">Submit a Ticket</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-xs">Subject</Label>
          <Input id="subject" placeholder="Brief description of your issue" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs">Category</Label>
          <Select>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
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
        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-xs">Message</Label>
          <Textarea id="message" placeholder="Describe your issue..." rows={3} className="text-sm" />
        </div>
        <Button className="w-full h-9 text-sm">Submit Ticket</Button>
      </CardContent>
    </Card>

    <Card className="border-border/40">
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-xs">Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-2">
        {[
          { id: "#TK-1245", subject: "Binary volume not updating", date: "Feb 28", status: "Open" },
          { id: "#TK-1198", subject: "Withdrawal delayed", date: "Feb 20", status: "Resolved" },
          { id: "#TK-1142", subject: "Package upgrade question", date: "Feb 10", status: "Closed" },
        ].map((t, i) => (
          <div key={i} className="p-2.5 rounded-lg border border-border/30 flex items-center justify-between hover:bg-muted/20 transition-colors">
            <div>
              <p className="font-medium text-xs">{t.id} — {t.subject}</p>
              <p className="text-[10px] text-muted-foreground">{t.date}</p>
            </div>
            <Badge variant={t.status === "Open" ? "default" : t.status === "Resolved" ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{t.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

// ─── Admin Panels ───
const AdminMemberSearchPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Member Search & Inspect</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or referral code..." className="pl-9 h-9 text-sm" />
      </div>
      <p className="text-xs text-muted-foreground">Search all platform members, inspect volumes, activation state, and payout history.</p>
    </CardContent>
  </Card>
);

const AdminCommissionRunsPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Commission Runs</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Last Run", value: "Mar 15, 2026" },
          { label: "Total Distributed", value: "₱284,500" },
          { label: "Members Paid", value: "142" },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
            <p className="text-sm font-bold font-display text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <Button size="sm" className="w-full h-9 text-sm">Run New Commission Cycle</Button>
    </CardContent>
  </Card>
);

const AdminPayoutOversightPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Payout Oversight</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending Withdrawals", value: "18" },
          { label: "Total Pending Amount", value: "₱127,840" },
          { label: "Avg Processing Time", value: "1.2 days" },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
            <p className="text-sm font-bold font-display text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AdminCompliancePanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Compliance & Fraud Flags</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4">
      <p className="text-xs text-muted-foreground">No anomalies detected in the current period. All fail-safe ratios within safe ranges.</p>
    </CardContent>
  </Card>
);

const AdminSystemSettingsPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Business Centre Settings</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4 space-y-3">
      <div className="space-y-2 text-xs">
        <div className="flex justify-between p-2.5 rounded bg-muted/30"><span className="text-muted-foreground">Binary Match Rate</span><span className="font-medium">10%</span></div>
        <div className="flex justify-between p-2.5 rounded bg-muted/30"><span className="text-muted-foreground">Fail-safe Threshold</span><span className="font-medium">75%</span></div>
        <div className="flex justify-between p-2.5 rounded bg-muted/30"><span className="text-muted-foreground">BV Expiry</span><span className="font-medium">90 days</span></div>
        <div className="flex justify-between p-2.5 rounded bg-muted/30"><span className="text-muted-foreground">Compensation Pool %</span><span className="font-medium">33% of Terra Fees</span></div>
      </div>
    </CardContent>
  </Card>
);

const AdminSecurityPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Security & Roles</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4">
      <p className="text-xs text-muted-foreground">Manage user roles, manual placement overrides, and dual-approval wallet adjustments from this panel.</p>
    </CardContent>
  </Card>
);

const AdminAuditPanel = () => (
  <Card className="border-border/40">
    <CardHeader className="px-5 pt-4 pb-2">
      <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Audit Logs</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-4">
      <p className="text-xs text-muted-foreground">Full audit trail visibility for all system actions, wallet adjustments, and compliance events.</p>
    </CardContent>
  </Card>
);

// ─── Main Page ───
const BusinessCentreLanding = () => {
  const { user, loading } = useAuth();
  const { isAdmin, isAnyAdmin } = useUserRoles();
  const [activeNav, setActiveNav] = useState("dashboard");
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.15]);

  // Real data state
  const [walletData, setWalletData] = useState<{ available_balance: number; pending_balance: number; total_withdrawn: number; internal_balance: number } | null>(null);
  const [membership, setMembership] = useState<{ tier: string; package_price: number; membership_bv: number } | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [binaryStats, setBinaryStats] = useState({ left_bv: 0, right_bv: 0, matched_bv: 0 });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [recentEarnings, setRecentEarnings] = useState<Array<{ bonus_type: string; net_amount: number; payout_period: string; source_order_id: string | null }>>([]);
  // Admin data state
  const [adminPendingWithdrawals, setAdminPendingWithdrawals] = useState(0);
  const [adminPendingAmount, setAdminPendingAmount] = useState(0);
  const [adminTotalMembers, setAdminTotalMembers] = useState(0);
  const [adminAuditLogs, setAdminAuditLogs] = useState<Array<{ action: string; entity_type: string; created_at: string }>>([]);

  // Build nav items based on role
  const NAV_ITEMS = [
    ...BASE_NAV_ITEMS,
    ...(isAnyAdmin ? ADMIN_NAV_ITEMS : []),
    ...(isAdmin ? SUPERADMIN_NAV_ITEMS : []),
  ];

  // Fetch real data
  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    // Fetch wallet
    supabase.from("wallets").select("available_balance, pending_balance, total_withdrawn, internal_balance")
      .eq("user_id", uid).maybeSingle().then(({ data }) => { if (data) setWalletData(data); });

    // Fetch membership
    supabase.from("memberships").select("tier, package_price, membership_bv")
      .eq("user_id", uid).maybeSingle().then(({ data }) => { if (data) setMembership(data); });

    // Fetch total earnings
    supabase.from("payout_ledger").select("net_amount, bonus_type, payout_period, source_order_id").eq("user_id", uid)
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => {
        if (data) {
          setTotalEarnings(data.reduce((s, r) => s + Number(r.net_amount), 0));
          setRecentEarnings(data as any);
        }
      });

    // Fetch BV stats
    supabase.from("bv_ledger").select("bv_amount, leg").eq("user_id", uid)
      .then(({ data }) => {
        if (data) {
          const left = data.filter(r => r.leg === "left").reduce((s, r) => s + Number(r.bv_amount), 0);
          const right = data.filter(r => r.leg === "right").reduce((s, r) => s + Number(r.bv_amount), 0);
          setBinaryStats({ left_bv: left, right_bv: right, matched_bv: Math.min(left, right) });
        }
      });

    // Fetch token balance + referral code
    supabase.from("profiles").select("agri_token_balance, referral_code")
      .eq("user_id", uid).maybeSingle().then(({ data }) => {
        if (data) {
          setTokenBalance(data.agri_token_balance || 0);
          setReferralCode(data.referral_code || "");
        }
      });
  }, [user]);

  // Admin-only: fetch system-wide data
  useEffect(() => {
    if (!user || !isAnyAdmin) return;

    // Pending withdrawals
    supabase.from("withdrawal_requests").select("amount", { count: "exact" })
      .eq("status", "pending")
      .then(({ data, count }) => {
        setAdminPendingWithdrawals(count || 0);
        setAdminPendingAmount(data ? data.reduce((s, r) => s + Number(r.amount), 0) : 0);
      });

    // Total members
    supabase.from("memberships").select("id", { count: "exact", head: true })
      .then(({ count }) => setAdminTotalMembers(count || 0));

    // Recent audit logs (super admin only)
    if (isAdmin) {
      supabase.from("audit_log").select("action, entity_type, created_at")
        .order("created_at", { ascending: false }).limit(10)
        .then(({ data }) => { if (data) setAdminAuditLogs(data); });
    }
  }, [user, isAnyAdmin, isAdmin]);

  // Build shared data object for panels
  const businessData: BusinessData = {
    walletData,
    membership,
    totalEarnings,
    binaryStats,
    tokenBalance,
    referralCode,
    recentEarnings,
    isAnyAdmin,
  };

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map(n => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [NAV_ITEMS.length]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const roleBadge = isAdmin ? "Super Admin" : isAnyAdmin ? "Admin" : membership?.tier ? `${membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)} Member` : "Member";

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />
      <CartDrawer />

      {/* ===== CINEMATIC HERO WITH PARALLAX ===== */}
      <section className="relative h-[280px] sm:h-[340px] lg:h-[380px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ y: heroImageY, scale: heroScale }}
        >
          <img
            src={businessCentreHero}
            alt="Philippine rice terraces at golden hour"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent" />

        <motion.div
          className="relative container h-full flex flex-col justify-end pb-8 sm:pb-10 max-w-6xl mx-auto px-4 md:px-8"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: cubicSmooth }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-1.5 mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Business Centre</span>
              <Badge variant="outline" className="text-[10px] ml-1 border-primary/30 text-primary">{roleBadge}</Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 max-w-2xl leading-tight">
              Business Centre
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
              {isAnyAdmin
                ? "Manage the entire affiliate network, commissions, payouts, and compliance — all in one place."
                : "Manage your network, track commissions, and grow your Terra Farming business — all in one place."}
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 mt-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: cubicSmooth }}
          >
            {[
              { icon: Users, value: "—", label: "Network" },
              { icon: DollarSign, value: totalEarnings > 0 ? `₱${totalEarnings.toLocaleString()}` : "₱0", label: "Earnings" },
              { icon: Coins, value: tokenBalance > 0 ? tokenBalance.toLocaleString() : "0", label: "AGRI Tokens" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STICKY SECTION NAV ===== */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-hide">
            {NAV_ITEMS.map((item, idx) => {
              const isAdminSection = ADMIN_NAV_ITEMS.some(a => a.id === item.id) || SUPERADMIN_NAV_ITEMS.some(a => a.id === item.id);
              const isFirstAdmin = isAdminSection && idx > 0 && !ADMIN_NAV_ITEMS.some(a => a.id === NAV_ITEMS[idx - 1]?.id) && !SUPERADMIN_NAV_ITEMS.some(a => a.id === NAV_ITEMS[idx - 1]?.id);
              return (
                <div key={item.id} className="flex items-center shrink-0">
                  {isFirstAdmin && <div className="w-px h-5 bg-border mx-1.5 shrink-0" />}
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border shrink-0",
                      activeNav === item.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border",
                      isAdminSection && activeNav !== item.id && "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="space-y-10 pt-6">
          {/* Dashboard */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={LayoutDashboard} title="Business Centre Overview" id="dashboard" />
            <div className="mt-4"><DashboardPanel data={businessData} /></div>
          </motion.section>

          {/* Network */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={Users} title="My Network" id="network" />
            <div className="mt-4"><NetworkPanel /></div>
          </motion.section>

          {/* Binary Tree */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={GitBranch} title="Binary Tree" id="binary" />
            <div className="mt-4"><BinaryTreePanel /></div>
          </motion.section>

          {/* Commissions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={DollarSign} title="Commissions" id="commissions" />
            <div className="mt-4"><CommissionsPanel /></div>
          </motion.section>

          {/* Referrals */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={Share2} title="Referrals" id="referral" />
            <div className="mt-4"><ReferralPanel referralCode={referralCode} /></div>
          </motion.section>

          {/* Rank & Packages */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={Crown} title="Rank & Activation" id="rank" />
            <div className="mt-4"><RankPanel /></div>
          </motion.section>

          {/* Coupons */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={Ticket} title="Coupons" id="coupons" />
            <div className="mt-4"><CouponsPanel /></div>
          </motion.section>

          {/* Wallet & Payouts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={Wallet} title="Wallet & Payouts" id="payout" />
            <div className="mt-4"><PayoutPanel data={businessData} /></div>
          </motion.section>

          {/* Marketing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={Megaphone} title="Marketing Tools" id="marketing" />
            <div className="mt-4"><MarketingPanel /></div>
          </motion.section>

          {/* Support */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: cubicSmooth }}
          >
            <SectionHeader icon={HelpCircle} title="Support" id="support" />
            <div className="mt-4"><SupportPanel /></div>
          </motion.section>

          {/* ===== ADMIN SECTIONS ===== */}
          {isAnyAdmin && (
            <>
              <div className="pt-4">
                <Separator />
                <div className="flex items-center gap-3 mt-4 mb-2">
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30" variant="outline">
                    <Shield className="h-3 w-3 mr-1" /> Admin Tools
                  </Badge>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={Search} title="Member Search" id="admin-members" />
                <div className="mt-4"><AdminMemberSearchPanel /></div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={BarChart3} title="Commission Runs" id="admin-commissions" />
                <div className="mt-4"><AdminCommissionRunsPanel /></div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={CreditCard} title="Payout Oversight" id="admin-payouts" />
                <div className="mt-4"><AdminPayoutOversightPanel /></div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={Scale} title="Compliance" id="admin-compliance" />
                <div className="mt-4"><AdminCompliancePanel /></div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={Settings} title="System Settings" id="admin-settings" />
                <div className="mt-4"><AdminSystemSettingsPanel /></div>
              </motion.section>
            </>
          )}

          {/* ===== SUPER ADMIN SECTIONS ===== */}
          {isAdmin && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={Lock} title="Security & Roles" id="admin-security" />
                <div className="mt-4"><AdminSecurityPanel /></div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: cubicSmooth }}
              >
                <SectionHeader icon={FileText} title="Audit Logs" id="admin-audit" />
                <div className="mt-4"><AdminAuditPanel /></div>
              </motion.section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessCentreLanding;
