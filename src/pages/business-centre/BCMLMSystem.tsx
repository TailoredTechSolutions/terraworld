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
  CheckCircle2, XCircle, AlertTriangle, BarChart3
} from "lucide-react";

const BCMLMSystem = () => {
  const { isAnyAdmin } = useUserRoles();
  const [search, setSearch] = useState("");

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["bc-mlm-members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("memberships")
        .select("*, profiles:user_id(full_name, email, referral_code), ranks:current_rank_id(name, badge_color)")
        .order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["bc-mlm-packages"],
    queryFn: async () => {
      const { data } = await supabase.from("packages").select("*").order("sort_order");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: ranks = [] } = useQuery({
    queryKey: ["bc-mlm-ranks"],
    queryFn: async () => {
      const { data } = await supabase.from("ranks").select("*").order("rank_order");
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: bvLedger = [] } = useQuery({
    queryKey: ["bc-mlm-bv"],
    queryFn: async () => {
      const { data } = await supabase.from("bv_ledger").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: volumes = [] } = useQuery({
    queryKey: ["bc-mlm-volumes"],
    queryFn: async () => {
      const { data } = await supabase.from("volumes").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: activations = [] } = useQuery({
    queryKey: ["bc-mlm-activations"],
    queryFn: async () => {
      const { data } = await supabase.from("activation_events").select("*, packages:package_id(name, code)").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: placements = [] } = useQuery({
    queryKey: ["bc-mlm-placements"],
    queryFn: async () => {
      const { data } = await supabase.from("placement_requests").select("*").order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  const { data: compensationPools = [] } = useQuery({
    queryKey: ["bc-mlm-pools"],
    queryFn: async () => {
      const { data } = await supabase.from("compensation_pools").select("*").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: isAnyAdmin,
  });

  if (!isAnyAdmin) return <div className="p-8 text-center"><Shield className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Access Restricted</h2></div>;

  const paidMembers = members.filter(m => m.tier !== "free");
  const freeMembers = members.filter(m => m.tier === "free");
  const totalBv = bvLedger.reduce((s, b) => s + Number(b.bv_amount || 0), 0);
  const productBv = bvLedger.filter(b => b.bv_type === "product").reduce((s, b) => s + Number(b.bv_amount || 0), 0);
  const membershipBv = bvLedger.filter(b => b.bv_type === "membership").reduce((s, b) => s + Number(b.bv_amount || 0), 0);
  const tierCaps: Record<string, number> = { starter: 5000, basic: 15000, pro: 50000, elite: 250000 };

  const tierColor = (tier: string) => {
    switch (tier) {
      case "elite": return "border-amber-500/30 text-amber-600";
      case "pro": return "border-emerald-500/30 text-emerald-600";
      case "basic": return "border-blue-500/30 text-blue-600";
      case "starter": return "border-primary/30 text-primary";
      default: return "";
    }
  };

  // Reports data
  const tierDist = packages.map(p => ({
    name: p.name,
    count: members.filter(m => m.tier === (p.code as string).toLowerCase()).length,
  }));
  const rankDist = ranks.map(r => ({
    name: r.name,
    count: members.filter(m => m.current_rank_id === r.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" /> MLM System
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Members, binary genealogy, packages, volumes, ranks, placement, and reports</p>
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
        ].map(k => (
          <Card key={k.label} className="border-border/40">
            <CardContent className="p-3 text-center">
              <k.icon className={cn("h-4 w-4 mx-auto mb-1", k.accent)} />
              <p className="text-sm font-bold font-display">{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BV Rule Banner */}
      <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
        <strong>MLM Rules:</strong> Only Terra Fee = BV. Binary 1:1 at 10% lesser leg. Paid members only for binary/matching. Left+right active + product volume required. Matching: upline rank ≥ downline rank. BV tracked separately: left/right × product/membership.
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 h-9">
          <TabsTrigger value="members" className="text-[10px]">Members</TabsTrigger>
          <TabsTrigger value="packages" className="text-[10px]">Packages</TabsTrigger>
          <TabsTrigger value="activations" className="text-[10px]">Activations</TabsTrigger>
          <TabsTrigger value="volumes" className="text-[10px]">Volumes</TabsTrigger>
          <TabsTrigger value="ranks" className="text-[10px]">Ranks</TabsTrigger>
          <TabsTrigger value="placement" className="text-[10px]">Placement</TabsTrigger>
          <TabsTrigger value="commissions" className="text-[10px]">Commissions</TabsTrigger>
          <TabsTrigger value="reports" className="text-[10px]">Reports</TabsTrigger>
        </TabsList>

        {/* Members Directory */}
        <TabsContent value="members" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          {membersLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
            <Card className="border-border/40">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs">Package</TableHead>
                    <TableHead className="text-xs">Rank</TableHead>
                    <TableHead className="text-xs text-right">BV</TableHead>
                    <TableHead className="text-xs text-right">Daily Cap</TableHead>
                    <TableHead className="text-xs">Side</TableHead>
                    <TableHead className="text-xs">Left</TableHead>
                    <TableHead className="text-xs">Right</TableHead>
                    <TableHead className="text-xs">Joined</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {members.filter(m => {
                      if (!search) return true;
                      const p = (m as any).profiles;
                      return p?.full_name?.toLowerCase().includes(search.toLowerCase()) || p?.email?.toLowerCase().includes(search.toLowerCase()) || p?.referral_code?.toLowerCase().includes(search.toLowerCase());
                    }).slice(0, 50).map(m => {
                      const p = (m as any).profiles;
                      const r = (m as any).ranks;
                      const hasLeft = !!m.left_leg_id;
                      const hasRight = !!m.right_leg_id;
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            <p className="text-xs font-medium">{p?.full_name || "—"}</p>
                            <p className="text-[10px] text-muted-foreground">{p?.email}</p>
                          </TableCell>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{p?.referral_code || "—"}</TableCell>
                          <TableCell><Badge variant="outline" className={cn("text-[9px]", tierColor(m.tier))}>{m.tier}</Badge></TableCell>
                          <TableCell className="text-xs">
                            {r ? (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.badge_color }} />
                                <span>{r.name}</span>
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium">{Number(m.membership_bv).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">₱{(tierCaps[m.tier] || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-xs uppercase">{m.placement_side || "—"}</TableCell>
                          <TableCell>{hasLeft ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</TableCell>
                          <TableCell>{hasRight ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/30" />}</TableCell>
                          <TableCell className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Packages */}
        <TabsContent value="packages" className="space-y-3">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
            <strong>Package Rules:</strong> Free = no binary/matching. Starter ₱500 / 500 BV / 1 match. Basic ₱1,000 / 1,000 BV / 2 match. Pro ₱3,000 / 3,000 BV / 3 match. Elite ₱5,000 / 5,000 BV / 5 match.
          </div>
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Package Catalog</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Package</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                  <TableHead className="text-xs text-right">BV</TableHead>
                  <TableHead className="text-xs text-right">PV</TableHead>
                  <TableHead className="text-xs text-right">Binary %</TableHead>
                  <TableHead className="text-xs text-right">Match Levels</TableHead>
                  <TableHead className="text-xs text-right">Direct Prod %</TableHead>
                  <TableHead className="text-xs text-right">Direct Memb %</TableHead>
                  <TableHead className="text-xs text-right">Daily Cap</TableHead>
                  <TableHead className="text-xs">Active</TableHead>
                  <TableHead className="text-xs text-right">Members</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {packages.map((pkg: any) => {
                    const count = members.filter(m => m.tier === (pkg.code as string).toLowerCase()).length;
                    return (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium text-sm">{pkg.name}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(pkg.price).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{pkg.bv.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{pkg.pv.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{Number(pkg.binary_rate)}%</TableCell>
                        <TableCell className="text-right text-xs">{pkg.matching_levels}</TableCell>
                        <TableCell className="text-right text-xs">{Number(pkg.direct_product_bonus_rate)}%</TableCell>
                        <TableCell className="text-right text-xs">{Number(pkg.direct_membership_bonus_rate)}%</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(pkg.binary_cap_daily).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", pkg.is_active ? "border-emerald-500/30 text-emerald-600" : "border-muted text-muted-foreground")}>{pkg.is_active ? "Active" : "Off"}</Badge></TableCell>
                        <TableCell className="text-right text-xs font-medium">{count}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activations */}
        <TabsContent value="activations" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Activation Ledger</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {activations.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">No activation events yet.</p> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Package</TableHead>
                    <TableHead className="text-xs text-right">Amount Paid</TableHead>
                    <TableHead className="text-xs">Payment Ref</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {activations.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs font-medium">{a.packages?.name || "—"}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(a.amount_paid).toLocaleString()}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">{a.payment_reference || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", a.activation_status === "active" ? "border-emerald-500/30 text-emerald-600" : a.activation_status === "pending" ? "border-amber-500/30 text-amber-600" : "")}>{a.activation_status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
              { label: "Volume Entries", value: volumes.length.toString(), accent: "text-muted-foreground" },
            ].map(v => (
              <div key={v.label} className="text-center p-3 rounded-lg border border-border/40">
                <p className={cn("text-lg font-bold font-display", v.accent)}>{v.value}</p>
                <p className="text-[10px] text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <strong>Volume Split:</strong> Product BV and Membership BV are tracked separately by left/right leg. Only Product BV flows at full cycle value. Membership BV is subject to the 75% fail-safe.
          </div>

          {/* BV Ledger */}
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">BV Ledger (Source Entries)</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">BV Type</TableHead>
                  <TableHead className="text-xs">Leg</TableHead>
                  <TableHead className="text-xs text-right">BV Amount</TableHead>
                  <TableHead className="text-xs text-right">Terra Fee</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {bvLedger.slice(0, 30).map(b => (
                    <TableRow key={b.id}>
                      <TableCell><Badge variant="outline" className={cn("text-[9px]", b.bv_type === "product" ? "border-emerald-500/30 text-emerald-600" : "border-blue-500/30 text-blue-600")}>{b.bv_type}</Badge></TableCell>
                      <TableCell className="text-xs uppercase">{b.leg || "—"}</TableCell>
                      <TableCell className="text-right text-xs font-medium">{Number(b.bv_amount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">₱{Number(b.terra_fee || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs truncate max-w-[120px] text-muted-foreground">{b.source_description || "—"}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detailed Volumes */}
          {volumes.length > 0 && (
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Volume Propagation Detail</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Source Type</TableHead>
                    <TableHead className="text-xs">Leg</TableHead>
                    <TableHead className="text-xs">BV Type</TableHead>
                    <TableHead className="text-xs text-right">BV</TableHead>
                    <TableHead className="text-xs text-right">PV</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Posted</TableHead>
                    <TableHead className="text-xs">Expires</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {volumes.slice(0, 30).map((v: any) => (
                      <TableRow key={v.id}>
                        <TableCell className="text-xs">{v.source_type}</TableCell>
                        <TableCell className="text-xs uppercase font-medium">{v.leg_side}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", v.bv_type === "product" ? "border-emerald-500/30 text-emerald-600" : "border-blue-500/30 text-blue-600")}>{v.bv_type}</Badge></TableCell>
                        <TableCell className="text-right text-xs font-medium">{v.bv_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{v.pv_amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", v.status === "posted" ? "border-emerald-500/30 text-emerald-600" : v.status === "expired" ? "border-destructive/30 text-destructive" : "")}>{v.status}</Badge></TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(v.posted_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{v.expires_at ? new Date(v.expires_at).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ranks */}
        <TabsContent value="ranks" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Rank Configuration</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">Rank</TableHead>
                  <TableHead className="text-xs text-right">Binary %</TableHead>
                  <TableHead className="text-xs text-right">Daily Cap</TableHead>
                  <TableHead className="text-xs text-right">Match Depth</TableHead>
                  <TableHead className="text-xs text-right">Req Personal BV</TableHead>
                  <TableHead className="text-xs text-right">Req Left BV</TableHead>
                  <TableHead className="text-xs text-right">Req Right BV</TableHead>
                  <TableHead className="text-xs text-right">Req Referrals</TableHead>
                  <TableHead className="text-xs text-right">Members</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ranks.map(r => {
                    const count = members.filter(m => m.current_rank_id === r.id).length;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.badge_color }} />
                            <span className="font-medium text-sm">{r.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs">{Number(r.binary_match_percent)}%</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(r.daily_cap).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{r.matching_bonus_depth} levels</TableCell>
                        <TableCell className="text-right text-xs">{Number(r.required_personal_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{Number(r.required_left_leg_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{Number(r.required_right_leg_bv).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{r.required_direct_referrals}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{count}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placement Console */}
        <TabsContent value="placement" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Placement Requests</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {placements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No placement requests. Manual placements from Super Admin will appear here.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Member</TableHead>
                    <TableHead className="text-xs">Parent</TableHead>
                    <TableHead className="text-xs">Side</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {placements.map((pl: any) => (
                      <TableRow key={pl.id}>
                        <TableCell className="text-[10px] font-mono">{pl.user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-[10px] font-mono">{pl.proposed_parent_user_id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-xs uppercase font-medium">{pl.proposed_side}</TableCell>
                        <TableCell className="text-xs">{pl.request_type}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", pl.status === "approved" || pl.status === "applied" ? "border-emerald-500/30 text-emerald-600" : pl.status === "pending" ? "border-amber-500/30 text-amber-600" : "border-destructive/30 text-destructive")}>{pl.status}</Badge></TableCell>
                        <TableCell className="text-xs truncate max-w-[100px] text-muted-foreground">{pl.reason || "—"}</TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">{new Date(pl.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions (existing) */}
        <TabsContent value="commissions" className="space-y-3">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Commission Run Console</CardTitle>
                <Button size="sm" className="h-7 text-xs">Run New Cycle</Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/40 mb-4">
                <p className="text-xs font-medium mb-2">Execution Order (per spec):</p>
                <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal pl-4">
                  <li>Select period → compute pool (33% of Terra Fees)</li>
                  <li>Calculate membership payout ratio</li>
                  <li>Preview fail-safe (75% threshold on membership-BV binary)</li>
                  <li>Run binary pairing (10% lesser leg, separate product/membership)</li>
                  <li>Apply daily caps (Starter ₱5k, Basic ₱15k, Pro ₱50k, Elite ₱250k)</li>
                  <li>Compute matching bonuses (after caps, up to 5 levels, upline rank ≥ downline)</li>
                  <li>Post wallet credits</li>
                  <li>Export statements</li>
                </ol>
              </div>
              {compensationPools.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No commission runs yet.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Period</TableHead>
                    <TableHead className="text-xs text-right">Pool</TableHead>
                    <TableHead className="text-xs text-right">Membership Payout</TableHead>
                    <TableHead className="text-xs">Fail-safe</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {compensationPools.map(cp => (
                      <TableRow key={cp.id}>
                        <TableCell className="text-xs">{cp.payout_period}</TableCell>
                        <TableCell className="text-right text-xs font-medium">₱{Number(cp.pool_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">₱{Number(cp.membership_bv_payout).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[9px]", cp.fail_safe_triggered ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600")}>{cp.fail_safe_triggered ? "Triggered" : "OK"}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">{cp.is_processed ? "Completed" : "Pending"}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MLM Reports */}
        <TabsContent value="reports" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Package Distribution */}
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Package Distribution</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                {tierDist.map(t => (
                  <div key={t.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20">
                    <span className="font-medium">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${members.length > 0 ? (t.count / members.length) * 100 : 0}%` }} />
                      </div>
                      <span className="font-bold w-8 text-right">{t.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rank Distribution */}
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Rank Distribution</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                {rankDist.map(r => (
                  <div key={r.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20">
                    <span className="font-medium">{r.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${members.length > 0 ? (r.count / members.length) * 100 : 0}%` }} />
                      </div>
                      <span className="font-bold w-8 text-right">{r.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* BV Summary */}
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> BV Summary</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                {[
                  { label: "Total BV", value: totalBv },
                  { label: "Product BV", value: productBv },
                  { label: "Membership BV", value: membershipBv },
                  { label: "Left Leg BV (all)", value: bvLedger.filter(b => b.leg === "left").reduce((s, b) => s + Number(b.bv_amount || 0), 0) },
                  { label: "Right Leg BV (all)", value: bvLedger.filter(b => b.leg === "right").reduce((s, b) => s + Number(b.bv_amount || 0), 0) },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs p-2 rounded-lg bg-muted/20">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-bold">{r.value.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activation Summary */}
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Activation Summary</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                {[
                  { label: "Total Activations", value: activations.length },
                  { label: "Active", value: activations.filter((a: any) => a.activation_status === "active").length },
                  { label: "Pending", value: activations.filter((a: any) => a.activation_status === "pending").length },
                  { label: "Total Paid Members", value: paidMembers.length },
                  { label: "Free Members", value: freeMembers.length },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs p-2 rounded-lg bg-muted/20">
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
