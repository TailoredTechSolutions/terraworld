import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Users, GitBranch, Crown, Award, Loader2, Search, Package,
  TrendingUp, Scale, CreditCard, ArrowLeftRight, Shield, Zap,
  CheckCircle2, XCircle, AlertTriangle, BarChart3 } from "lucide-react";

// ── Dummy data for empty tables ──
const DUMMY_MEMBERS = [
  { id: "m1", tier: "elite", placement_side: "left", membership_bv: 125000, left_leg_id: "x1", right_leg_id: "x2", created_at: "2025-06-15", profiles: { full_name: "Andrew Gwaltney", email: "gwaltn3y@gmail.com", referral_code: "TERRA001" }, ranks: { name: "Diamond", badge_color: "#f59e0b" }, package_price: 5000 },
  { id: "m2", tier: "pro", placement_side: "right", membership_bv: 75000, left_leg_id: "x3", right_leg_id: null, created_at: "2025-07-20", profiles: { full_name: "Maria Santos", email: "maria@terra.ph", referral_code: "MSANTOS" }, ranks: { name: "Gold", badge_color: "#10b981" }, package_price: 3000 },
  { id: "m3", tier: "basic", placement_side: "left", membership_bv: 25000, left_leg_id: null, right_leg_id: "x4", created_at: "2025-09-10", profiles: { full_name: "Juan Dela Cruz", email: "juan@terra.ph", referral_code: "JDCRUZ" }, ranks: { name: "Silver", badge_color: "#3b82f6" }, package_price: 1000 },
  { id: "m4", tier: "starter", placement_side: "right", membership_bv: 5000, left_leg_id: null, right_leg_id: null, created_at: "2025-11-01", profiles: { full_name: "Rosa Mendoza", email: "rosa@terra.ph", referral_code: "RMENDZ" }, ranks: { name: "Bronze", badge_color: "#a855f7" }, package_price: 500 },
  { id: "m5", tier: "elite", placement_side: "left", membership_bv: 250000, left_leg_id: "x5", right_leg_id: "x6", created_at: "2025-05-01", profiles: { full_name: "Ameer Saati", email: "ameer.saati@gmail.com", referral_code: "ASAATI" }, ranks: { name: "Diamond", badge_color: "#f59e0b" }, package_price: 5000 },
  { id: "m6", tier: "free", placement_side: null, membership_bv: 0, left_leg_id: null, right_leg_id: null, created_at: "2026-01-15", profiles: { full_name: "Pedro Garcia", email: "pedro@terra.ph", referral_code: "PGARCI" }, ranks: null, package_price: 0 },
  { id: "m7", tier: "pro", placement_side: "left", membership_bv: 45000, left_leg_id: "x7", right_leg_id: "x8", created_at: "2025-08-20", profiles: { full_name: "Liza Reyes", email: "liza@terra.ph", referral_code: "LREYES" }, ranks: { name: "Gold", badge_color: "#10b981" }, package_price: 3000 },
  { id: "m8", tier: "basic", placement_side: "right", membership_bv: 15000, left_leg_id: null, right_leg_id: null, created_at: "2025-12-01", profiles: { full_name: "Carlo Villanueva", email: "carlo@terra.ph", referral_code: "CVILLA" }, ranks: { name: "Silver", badge_color: "#3b82f6" }, package_price: 1000 },
];

const DUMMY_PACKAGES = [
  { id: "p1", name: "Starter", code: "STARTER", price: 500, bv: 500, pv: 500, binary_rate: 10, matching_levels: 1, direct_product_bonus_rate: 15, direct_membership_bonus_rate: 4, binary_cap_daily: 5000, is_active: true, sort_order: 1 },
  { id: "p2", name: "Basic", code: "BASIC", price: 1000, bv: 1000, pv: 1000, binary_rate: 10, matching_levels: 2, direct_product_bonus_rate: 18, direct_membership_bonus_rate: 6, binary_cap_daily: 15000, is_active: true, sort_order: 2 },
  { id: "p3", name: "Pro", code: "PRO", price: 3000, bv: 3000, pv: 3000, binary_rate: 10, matching_levels: 3, direct_product_bonus_rate: 22, direct_membership_bonus_rate: 8, binary_cap_daily: 50000, is_active: true, sort_order: 3 },
  { id: "p4", name: "Elite", code: "ELITE", price: 5000, bv: 5000, pv: 5000, binary_rate: 10, matching_levels: 5, direct_product_bonus_rate: 25, direct_membership_bonus_rate: 10, binary_cap_daily: 250000, is_active: true, sort_order: 4 },
];

const DUMMY_RANKS = [
  { id: "r1", name: "Bronze", badge_color: "#a855f7", binary_match_percent: 10, daily_cap: 5000, matching_bonus_depth: 1, required_personal_bv: 500, required_left_leg_bv: 1000, required_right_leg_bv: 1000, required_direct_referrals: 2, rank_order: 1 },
  { id: "r2", name: "Silver", badge_color: "#3b82f6", binary_match_percent: 10, daily_cap: 15000, matching_bonus_depth: 2, required_personal_bv: 1000, required_left_leg_bv: 5000, required_right_leg_bv: 5000, required_direct_referrals: 4, rank_order: 2 },
  { id: "r3", name: "Gold", badge_color: "#10b981", binary_match_percent: 10, daily_cap: 50000, matching_bonus_depth: 3, required_personal_bv: 3000, required_left_leg_bv: 25000, required_right_leg_bv: 25000, required_direct_referrals: 6, rank_order: 3 },
  { id: "r4", name: "Diamond", badge_color: "#f59e0b", binary_match_percent: 10, daily_cap: 250000, matching_bonus_depth: 5, required_personal_bv: 5000, required_left_leg_bv: 100000, required_right_leg_bv: 100000, required_direct_referrals: 10, rank_order: 4 },
];

const DUMMY_BV_LEDGER = [
  { id: "bv1", bv_type: "product", leg: "left", bv_amount: 5000, terra_fee: 500, source_description: "Order ORD-2026-042 — Vegetables", created_at: "2026-03-15T10:00:00Z" },
  { id: "bv2", bv_type: "membership", leg: "right", bv_amount: 3000, terra_fee: 300, source_description: "Pro package activation", created_at: "2026-03-14T14:00:00Z" },
  { id: "bv3", bv_type: "product", leg: "right", bv_amount: 2500, terra_fee: 250, source_description: "Order ORD-2026-039 — Fruits", created_at: "2026-03-13T11:00:00Z" },
  { id: "bv4", bv_type: "membership", leg: "left", bv_amount: 5000, terra_fee: 500, source_description: "Elite package activation", created_at: "2026-03-12T09:00:00Z" },
  { id: "bv5", bv_type: "product", leg: "left", bv_amount: 1500, terra_fee: 150, source_description: "Order ORD-2026-035 — Dairy", created_at: "2026-03-11T16:00:00Z" },
  { id: "bv6", bv_type: "product", leg: "right", bv_amount: 8000, terra_fee: 800, source_description: "Order ORD-2026-033 — Bulk produce", created_at: "2026-03-10T08:00:00Z" },
];

const DUMMY_ACTIVATIONS = [
  { id: "act1", packages: { name: "Elite", code: "ELITE" }, amount_paid: 5000, payment_reference: "GCash-TXN-8421", activation_status: "active", created_at: "2026-03-15T06:00:00Z" },
  { id: "act2", packages: { name: "Pro", code: "PRO" }, amount_paid: 3000, payment_reference: "GCash-TXN-7395", activation_status: "active", created_at: "2026-03-14T12:00:00Z" },
  { id: "act3", packages: { name: "Starter", code: "STARTER" }, amount_paid: 500, payment_reference: "GCash-TXN-6201", activation_status: "pending", created_at: "2026-03-13T09:30:00Z" },
  { id: "act4", packages: { name: "Basic", code: "BASIC" }, amount_paid: 1000, payment_reference: "Bank-REF-4521", activation_status: "active", created_at: "2026-03-10T15:00:00Z" },
];

const DUMMY_COMP_POOLS = [
  { id: "cp1", payout_period: "2026-W11", pool_amount: 125000, membership_bv_payout: 35000, failsafe_ratio: 0.65, is_processed: false },
  { id: "cp2", payout_period: "2026-W10", pool_amount: 98000, membership_bv_payout: 28000, failsafe_ratio: 0.72, is_processed: true },
  { id: "cp3", payout_period: "2026-W09", pool_amount: 112000, membership_bv_payout: 42000, failsafe_ratio: 0.78, is_processed: true },
];

const BCMLMSystem = () => {
  const { isAnyAdmin } = useUserRoles();
  const [search, setSearch] = useState("");

  const { data: realMembers = [] } = useQuery({
    queryKey: ["bc-mlm-members"],
    queryFn: async () => {
      const { data } = await supabase.from("memberships").select("*, profiles:user_id(full_name, email, referral_code), ranks:current_rank_id(name, badge_color)").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: realPackages = [] } = useQuery({
    queryKey: ["bc-mlm-packages"],
    queryFn: async () => {
      const { data } = await supabase.from("packages").select("*").order("sort_order");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: realRanks = [] } = useQuery({
    queryKey: ["bc-mlm-ranks"],
    queryFn: async () => {
      const { data } = await supabase.from("ranks").select("*").order("rank_order");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: realBvLedger = [] } = useQuery({
    queryKey: ["bc-mlm-bv"],
    queryFn: async () => {
      const { data } = await supabase.from("bv_ledger").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const members = realMembers.length > 0 ? realMembers : DUMMY_MEMBERS;
  const packages = realPackages.length > 0 ? realPackages : DUMMY_PACKAGES;
  const ranks = realRanks.length > 0 ? realRanks : DUMMY_RANKS;
  const bvLedger = realBvLedger.length > 0 ? realBvLedger : DUMMY_BV_LEDGER;
  const activations = DUMMY_ACTIVATIONS;
  const compensationPools = DUMMY_COMP_POOLS;

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const paidMembers = members.filter((m: any) => m.tier !== "free");
  const freeMembers = members.filter((m: any) => m.tier === "free");
  const totalBv = bvLedger.reduce((s: number, b: any) => s + Number(b.bv_amount || 0), 0);
  const productBv = bvLedger.filter((b: any) => b.bv_type === "product").reduce((s: number, b: any) => s + Number(b.bv_amount || 0), 0);
  const membershipBv = bvLedger.filter((b: any) => b.bv_type === "membership").reduce((s: number, b: any) => s + Number(b.bv_amount || 0), 0);
  const tierCaps: Record<string, number> = { starter: 5000, basic: 15000, pro: 50000, elite: 250000 };

  const tierColor = (tier: string) => {
    switch (tier) {
      case "elite": return "border-amber-500/30 text-amber-600 bg-amber-500/5";
      case "pro": return "border-emerald-500/30 text-emerald-600 bg-emerald-500/5";
      case "basic": return "border-blue-500/30 text-blue-600 bg-blue-500/5";
      case "starter": return "border-primary/30 text-primary bg-primary/5";
      default: return "";
    }
  };

  const tierDist = packages.map((p: any) => ({
    name: p.name,
    count: members.filter((m: any) => m.tier === (p.code as string).toLowerCase()).length,
  }));
  const rankDist = ranks.map((r: any) => ({
    name: r.name,
    count: members.filter((m: any) => m.current_rank_id === r.id || (m as any).ranks?.name === r.name).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" /> MLM System & Commission Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Members, packages, volumes, ranks, commission runs, and reports</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { icon: Users, label: "Members", value: `${paidMembers.length} paid / ${freeMembers.length} free`, accent: "text-primary" },
          { icon: TrendingUp, label: "Product BV", value: productBv.toLocaleString(), accent: "text-emerald-500" },
          { icon: ArrowLeftRight, label: "Membership BV", value: membershipBv.toLocaleString(), accent: "text-blue-500" },
          { icon: Package, label: "Packages", value: packages.length.toString(), accent: "text-amber-500" },
          { icon: Crown, label: "Ranks", value: ranks.length.toString(), accent: "text-purple-500" },
          { icon: Zap, label: "Activations", value: activations.length.toString(), accent: "text-primary" },
        ].map((k) => (
          <Card key={k.label} className="border-border/40">
            <CardContent className="p-4 text-center">
              <k.icon className={cn("h-5 w-5 mx-auto mb-1.5", k.accent)} />
              <p className="text-lg font-bold font-display">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rules */}
      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm">
        <strong>MLM Rules:</strong> ₱1 Terra Fee = 1 BV. Binary 1:1 at 10% lesser leg. Daily caps: Starter ₱5k, Basic ₱15k, Pro ₱50k, Elite ₱250k. Matching up to 5 levels. 75% fail-safe on membership-BV binary. 90-day BV expiry.
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1.5 bg-muted/50">
          {[
            { value: "members", label: "👥 Members" },
            { value: "packages", label: "📦 Packages" },
            { value: "activations", label: "⚡ Activations" },
            { value: "volumes", label: "📊 Volumes" },
            { value: "ranks", label: "👑 Ranks" },
            { value: "commissions", label: "💰 Commissions" },
            { value: "reports", label: "📈 Reports" },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm px-3 py-2 rounded-lg data-[state=active]:shadow-md">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Members */}
        <TabsContent value="members" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10" />
          </div>
          <Card className="border-border/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Member</TableHead>
                  <TableHead className="text-sm font-semibold">Code</TableHead>
                  <TableHead className="text-sm font-semibold">Package</TableHead>
                  <TableHead className="text-sm font-semibold">Rank</TableHead>
                  <TableHead className="text-sm font-semibold text-right">BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Daily Cap</TableHead>
                  <TableHead className="text-sm font-semibold">Side</TableHead>
                  <TableHead className="text-sm font-semibold">Left</TableHead>
                  <TableHead className="text-sm font-semibold">Right</TableHead>
                  <TableHead className="text-sm font-semibold">Joined</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {members.filter((m: any) => {
                    if (!search) return true;
                    const p = (m as any).profiles;
                    return p?.full_name?.toLowerCase().includes(search.toLowerCase()) || p?.email?.toLowerCase().includes(search.toLowerCase());
                  }).slice(0, 50).map((m: any) => {
                    const p = m.profiles;
                    const r = m.ranks;
                    return (
                      <TableRow key={m.id}>
                        <TableCell><p className="text-sm font-medium">{p?.full_name || "—"}</p><p className="text-xs text-muted-foreground">{p?.email}</p></TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{p?.referral_code || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", tierColor(m.tier))}>{m.tier}</Badge></TableCell>
                        <TableCell className="text-sm">{r ? <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.badge_color }} /><span>{r.name}</span></div> : "—"}</TableCell>
                        <TableCell className="text-right text-sm font-bold">{Number(m.membership_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">₱{(tierCaps[m.tier] || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm uppercase font-medium">{m.placement_side || "—"}</TableCell>
                        <TableCell>{m.left_leg_id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}</TableCell>
                        <TableCell>{m.right_leg_id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Packages */}
        <TabsContent value="packages" className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
            <strong>Package Rules:</strong> Free = no binary/matching. Starter ₱500 / 500 BV / 1 match. Basic ₱1,000 / 1,000 BV / 2 match. Pro ₱3,000 / 3,000 BV / 3 match. Elite ₱5,000 / 5,000 BV / 5 match.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Package Catalog</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Package</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Price</TableHead>
                  <TableHead className="text-sm font-semibold text-right">BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">PV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Binary %</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Match Levels</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Direct Prod %</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Direct Memb %</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Daily Cap</TableHead>
                  <TableHead className="text-sm font-semibold">Active</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {packages.map((pkg: any) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-bold text-sm">{pkg.name}</TableCell>
                      <TableCell className="text-right text-sm">₱{Number(pkg.price).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{Number(pkg.bv).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{Number(pkg.pv).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{Number(pkg.binary_rate)}%</TableCell>
                      <TableCell className="text-right text-sm">{pkg.matching_levels}</TableCell>
                      <TableCell className="text-right text-sm">{Number(pkg.direct_product_bonus_rate)}%</TableCell>
                      <TableCell className="text-right text-sm">{Number(pkg.direct_membership_bonus_rate)}%</TableCell>
                      <TableCell className="text-right text-sm">₱{Number(pkg.binary_cap_daily).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs", pkg.is_active ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-muted text-muted-foreground")}>{pkg.is_active ? "Active" : "Off"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activations */}
        <TabsContent value="activations" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Activation Ledger</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Package</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Amount Paid</TableHead>
                  <TableHead className="text-sm font-semibold">Payment Ref</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {activations.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm font-bold">{a.packages?.name || "—"}</TableCell>
                      <TableCell className="text-right text-sm">₱{Number(a.amount_paid).toLocaleString()}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{a.payment_reference || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", a.activation_status === "active" ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-amber-500/30 text-amber-600 bg-amber-500/5")}>{a.activation_status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volumes */}
        <TabsContent value="volumes" className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Product BV", value: productBv.toLocaleString(), accent: "text-emerald-600" },
              { label: "Membership BV", value: membershipBv.toLocaleString(), accent: "text-blue-600" },
              { label: "Total BV", value: totalBv.toLocaleString(), accent: "text-primary" },
              { label: "Volume Entries", value: bvLedger.length.toString(), accent: "text-muted-foreground" },
            ].map((v) => (
              <div key={v.label} className="text-center p-4 rounded-lg border border-border/40">
                <p className={cn("text-xl font-bold font-display", v.accent)}>{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base">BV Ledger (Source Entries)</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">BV Type</TableHead>
                  <TableHead className="text-sm font-semibold">Leg</TableHead>
                  <TableHead className="text-sm font-semibold text-right">BV Amount</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Terra Fee</TableHead>
                  <TableHead className="text-sm font-semibold">Source</TableHead>
                  <TableHead className="text-sm font-semibold">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {bvLedger.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell><Badge variant="outline" className={cn("text-xs", b.bv_type === "product" ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-blue-500/30 text-blue-600 bg-blue-500/5")}>{b.bv_type}</Badge></TableCell>
                      <TableCell className="text-sm uppercase font-medium">{b.leg || "—"}</TableCell>
                      <TableCell className="text-right text-sm font-bold">{Number(b.bv_amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">₱{Number(b.terra_fee || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{b.source_description || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranks */}
        <TabsContent value="ranks" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /> Rank Configuration & Manager</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Rank</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Binary %</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Daily Cap</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Match Depth</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Req Personal BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Req Left BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Req Right BV</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Req Referrals</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Members</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ranks.map((r: any) => {
                    const count = rankDist.find((rd: any) => rd.name === r.name)?.count || 0;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.badge_color }} />
                            <span className="font-bold text-sm">{r.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">{Number(r.binary_match_percent)}%</TableCell>
                        <TableCell className="text-right text-sm font-medium">₱{Number(r.daily_cap).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{r.matching_bonus_depth} levels</TableCell>
                        <TableCell className="text-right text-sm">{Number(r.required_personal_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{Number(r.required_left_leg_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{Number(r.required_right_leg_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm">{r.required_direct_referrals}</TableCell>
                        <TableCell className="text-right text-sm font-bold">{count}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions */}
        <TabsContent value="commissions" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Commission Run Console</CardTitle>
                <Button size="sm">Run New Cycle</Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 mb-4">
                <p className="text-sm font-medium mb-2">Execution Order (per spec):</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                  <li>Select period → compute pool (33% of Terra Fees)</li>
                  <li>Calculate membership payout ratio</li>
                  <li>Preview fail-safe (75% threshold on membership-BV binary)</li>
                  <li>Run binary pairing (10% lesser leg, separate product/membership)</li>
                  <li>Apply daily caps (Starter ₱5k, Basic ₱15k, Pro ₱50k, Elite ₱250k)</li>
                  <li>Compute matching bonuses (after caps, up to 5 levels)</li>
                  <li>Post wallet credits</li>
                  <li>Export statements</li>
                </ol>
              </div>
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-sm font-semibold">Period</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Pool</TableHead>
                  <TableHead className="text-sm font-semibold text-right">Membership Payout</TableHead>
                  <TableHead className="text-sm font-semibold">Fail-safe</TableHead>
                  <TableHead className="text-sm font-semibold">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {compensationPools.map((cp: any) => (
                    <TableRow key={cp.id}>
                      <TableCell className="text-sm font-bold">{cp.payout_period}</TableCell>
                      <TableCell className="text-right text-sm font-medium">₱{Number(cp.pool_amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">₱{Number(cp.membership_bv_payout).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs px-2 py-0.5", cp.failsafe_ratio >= 0.75 ? "border-amber-500/30 text-amber-600 bg-amber-500/5" : "border-emerald-500/30 text-emerald-600 bg-emerald-500/5")}>{cp.failsafe_ratio >= 0.75 ? "Triggered" : "OK"} ({(cp.failsafe_ratio * 100).toFixed(0)}%)</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={cn("text-xs", cp.is_processed ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-amber-500/30 text-amber-600")}>{cp.is_processed ? "Completed" : "Pending"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Package Distribution</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {tierDist.map((t: any) => (
                  <div key={t.name} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/20">
                    <span className="font-medium">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${members.length > 0 ? t.count / members.length * 100 : 0}%` }} />
                      </div>
                      <span className="font-bold w-8 text-right">{t.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /> Rank Distribution</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {rankDist.map((r: any) => (
                  <div key={r.name} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/20">
                    <span className="font-medium">{r.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${members.length > 0 ? r.count / members.length * 100 : 0}%` }} />
                      </div>
                      <span className="font-bold w-8 text-right">{r.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> BV Summary</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {[
                  { label: "Total BV", value: totalBv },
                  { label: "Product BV", value: productBv },
                  { label: "Membership BV", value: membershipBv },
                  { label: "Left Leg BV", value: bvLedger.filter((b: any) => b.leg === "left").reduce((s: number, b: any) => s + Number(b.bv_amount || 0), 0) },
                  { label: "Right Leg BV", value: bvLedger.filter((b: any) => b.leg === "right").reduce((s: number, b: any) => s + Number(b.bv_amount || 0), 0) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-bold">{r.value.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Activation Summary</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {[
                  { label: "Total Activations", value: activations.length },
                  { label: "Active", value: activations.filter((a: any) => a.activation_status === "active").length },
                  { label: "Pending", value: activations.filter((a: any) => a.activation_status === "pending").length },
                  { label: "Total Paid Members", value: paidMembers.length },
                  { label: "Free Members", value: freeMembers.length },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm p-3 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-bold">{r.value.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCMLMSystem;
