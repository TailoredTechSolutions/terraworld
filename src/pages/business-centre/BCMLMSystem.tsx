import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Users, GitBranch, Crown, Award, Loader2, Search, Package,
  TrendingUp, Scale, CreditCard, ArrowLeftRight
} from "lucide-react";

const BCMLMSystem = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);
  const [bvLedger, setBvLedger] = useState<any[]>([]);
  const [compensationPools, setCompensationPools] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [mRes, rRes, bRes, cpRes] = await Promise.all([
        supabase.from("memberships").select("*, profiles:user_id(full_name, email), ranks:current_rank_id(name, badge_color)").order("created_at", { ascending: false }).limit(100),
        supabase.from("ranks").select("*").order("rank_order", { ascending: true }),
        supabase.from("bv_ledger").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("compensation_pools").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setMembers(mRes.data || []);
      setRanks(rRes.data || []);
      setBvLedger(bRes.data || []);
      setCompensationPools(cpRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const paidMembers = members.filter(m => m.tier !== "free");
  const freeMembers = members.filter(m => m.tier === "free");
  const totalBv = bvLedger.reduce((s, b) => s + Number(b.bv_amount || 0), 0);
  const productBv = bvLedger.filter(b => b.bv_type === "product").reduce((s, b) => s + Number(b.bv_amount || 0), 0);
  const membershipBv = bvLedger.filter(b => b.bv_type === "membership").reduce((s, b) => s + Number(b.bv_amount || 0), 0);

  const tierCaps: Record<string, number> = { starter: 5000, basic: 15000, pro: 50000, elite: 250000 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">MLM System</h1>
        <p className="text-sm text-muted-foreground mt-1">Members, binary tree, volumes, commissions, ranks, and fail-safe</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Members", value: members.length.toString(), sub: `${paidMembers.length} paid / ${freeMembers.length} free`, icon: Users, accent: "text-primary bg-primary/10" },
          { title: "Total BV Generated", value: totalBv.toLocaleString(), sub: `Product: ${productBv.toLocaleString()} | Membership: ${membershipBv.toLocaleString()}`, icon: TrendingUp, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Ranks Configured", value: ranks.length.toString(), sub: "Active rank tiers", icon: Crown, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Commission Pools", value: compensationPools.length.toString(), sub: "Historical periods", icon: CreditCard, accent: "text-purple-600 bg-purple-500/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold font-display">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.title}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-5 h-9">
          <TabsTrigger value="members" className="text-xs">Members</TabsTrigger>
          <TabsTrigger value="volumes" className="text-xs">Volumes</TabsTrigger>
          <TabsTrigger value="commissions" className="text-xs">Commissions</TabsTrigger>
          <TabsTrigger value="ranks" className="text-xs">Ranks</TabsTrigger>
          <TabsTrigger value="failsafe" className="text-xs">Fail-safe</TabsTrigger>
        </TabsList>

        {/* Members */}
        <TabsContent value="members" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Members Directory</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Member</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Tier</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Rank</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Package ₱</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">BV</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Daily Cap</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Side</th>
                  </tr></thead>
                  <tbody>
                    {members.filter(m => {
                      if (!search) return true;
                      const p = (m as any).profiles;
                      return p?.full_name?.toLowerCase().includes(search.toLowerCase()) || p?.email?.toLowerCase().includes(search.toLowerCase());
                    }).map((m) => {
                      const p = (m as any).profiles;
                      const r = (m as any).ranks;
                      return (
                        <tr key={m.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1">
                            <p className="font-medium">{p?.full_name || "—"}</p>
                            <p className="text-[10px] text-muted-foreground">{p?.email}</p>
                          </td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              m.tier === "elite" ? "border-amber-500/30 text-amber-600" :
                              m.tier === "pro" ? "border-emerald-500/30 text-emerald-600" :
                              m.tier === "basic" ? "border-blue-500/30 text-blue-600" :
                              m.tier === "starter" ? "border-primary/30 text-primary" : ""
                            )}>{m.tier}</Badge>
                          </td>
                          <td className="py-1.5 px-1 text-muted-foreground">{r?.name || "—"}</td>
                          <td className="py-1.5 px-1 text-right">₱{Number(m.package_price).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right font-medium">{Number(m.membership_bv).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{(tierCaps[m.tier] || 0).toLocaleString()}</td>
                          <td className="py-1.5 px-1">{m.placement_side || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volumes */}
        <TabsContent value="volumes" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-primary" /> Volume Explorer (L/R × Product/Membership)</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Product BV", value: productBv.toLocaleString(), accent: "text-emerald-600" },
                  { label: "Membership BV", value: membershipBv.toLocaleString(), accent: "text-blue-600" },
                  { label: "Total BV", value: totalBv.toLocaleString(), accent: "text-primary" },
                  { label: "Entries", value: bvLedger.length.toString(), accent: "text-muted-foreground" },
                ].map((v) => (
                  <div key={v.label} className="text-center p-3 rounded-lg border border-border/40">
                    <p className={cn("text-lg font-bold font-display", v.accent)}>{v.value}</p>
                    <p className="text-[10px] text-muted-foreground">{v.label}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Leg</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">BV</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Terra Fee</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Source</th>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                  </tr></thead>
                  <tbody>
                    {bvLedger.slice(0, 30).map((b) => (
                      <tr key={b.id} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="py-1.5 px-1">
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                            b.bv_type === "product" ? "border-emerald-500/30 text-emerald-600" : "border-blue-500/30 text-blue-600"
                          )}>{b.bv_type}</Badge>
                        </td>
                        <td className="py-1.5 px-1 uppercase">{b.leg || "—"}</td>
                        <td className="py-1.5 px-1 text-right font-medium">{Number(b.bv_amount).toLocaleString()}</td>
                        <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(b.terra_fee || 0).toLocaleString()}</td>
                        <td className="py-1.5 px-1 truncate max-w-[120px] text-muted-foreground">{b.source_description || "—"}</td>
                        <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions */}
        <TabsContent value="commissions" className="mt-4">
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
                  <li>Preview fail-safe (75% threshold)</li>
                  <li>Run binary pairing (10% weak leg, separate product/membership)</li>
                  <li>Apply daily caps (Starter ₱5k, Basic ₱15k, Pro ₱50k, Elite ₱250k)</li>
                  <li>Compute matching bonuses (after caps, up to 5 levels)</li>
                  <li>Post wallet credits</li>
                  <li>Export statements</li>
                </ol>
              </div>
              {compensationPools.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No commission runs yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Period</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Pool</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Membership Payout</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Fail-safe</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {compensationPools.map((cp) => (
                        <tr key={cp.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1">{cp.payout_period}</td>
                          <td className="py-1.5 px-1 text-right font-medium">₱{Number(cp.pool_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right">₱{Number(cp.membership_bv_payout).toLocaleString()}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              cp.fail_safe_triggered ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600"
                            )}>{cp.fail_safe_triggered ? "Triggered" : "OK"}</Badge>
                          </td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className="text-[9px] px-1 py-0">{cp.is_processed ? "Completed" : "Pending"}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranks */}
        <TabsContent value="ranks" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Rank Configuration</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium">Rank</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Binary %</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Daily Cap</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Matching Depth</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Req Personal BV</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Req Left BV</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Req Right BV</th>
                    <th className="text-right py-2 px-1 text-muted-foreground font-medium">Req Referrals</th>
                  </tr></thead>
                  <tbody>
                    {ranks.map((r) => (
                      <tr key={r.id} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="py-1.5 px-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.badge_color }} />
                            <span className="font-medium">{r.name}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-1 text-right">{Number(r.binary_match_percent)}%</td>
                        <td className="py-1.5 px-1 text-right">₱{Number(r.daily_cap).toLocaleString()}</td>
                        <td className="py-1.5 px-1 text-right">{r.matching_bonus_depth} levels</td>
                        <td className="py-1.5 px-1 text-right">{Number(r.required_personal_bv).toLocaleString()}</td>
                        <td className="py-1.5 px-1 text-right">{Number(r.required_left_leg_bv).toLocaleString()}</td>
                        <td className="py-1.5 px-1 text-right">{Number(r.required_right_leg_bv).toLocaleString()}</td>
                        <td className="py-1.5 px-1 text-right">{r.required_direct_referrals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fail-safe */}
        <TabsContent value="failsafe" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Fail-safe Monitor</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40">
                <h3 className="text-xs font-semibold mb-3">Fail-safe Rules (Non-negotiable)</h3>
                <div className="space-y-2">
                  {[
                    { label: "Applies to", value: "Membership-BV binary payouts ONLY" },
                    { label: "Threshold", value: "75% of compensation pool" },
                    { label: "Compensation pool", value: "33% of total Terra Fees collected" },
                    { label: "Base cycle value", value: "₱50 per 500 BV increment" },
                    { label: "When triggered", value: "Adjusts cycle value downward proportionally" },
                    { label: "Product BV binary", value: "NOT subject to fail-safe" },
                    { label: "Matching computed", value: "After fail-safe AND caps applied" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-medium text-right max-w-[60%]">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {compensationPools.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Period</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Pool Amount</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Membership Payout</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Ratio</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Adjusted Cycle</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Triggered</th>
                    </tr></thead>
                    <tbody>
                      {compensationPools.map((cp) => {
                        const ratio = Number(cp.pool_amount) > 0 ? Number(cp.membership_bv_payout) / Number(cp.pool_amount) : 0;
                        return (
                          <tr key={cp.id} className="border-b border-border/20 hover:bg-muted/20">
                            <td className="py-1.5 px-1">{cp.payout_period}</td>
                            <td className="py-1.5 px-1 text-right">₱{Number(cp.pool_amount).toLocaleString()}</td>
                            <td className="py-1.5 px-1 text-right">₱{Number(cp.membership_bv_payout).toLocaleString()}</td>
                            <td className="py-1.5 px-1 text-right">{(ratio * 100).toFixed(1)}%</td>
                            <td className="py-1.5 px-1 text-right">₱{Number(cp.cycle_value_adjustment || 50).toLocaleString()}</td>
                            <td className="py-1.5 px-1">
                              <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                                cp.fail_safe_triggered ? "border-destructive/30 text-destructive" : "border-emerald-500/30 text-emerald-600"
                              )}>{cp.fail_safe_triggered ? "YES" : "NO"}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCMLMSystem;
