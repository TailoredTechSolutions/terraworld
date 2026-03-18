import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Ticket, Loader2, Megaphone, AlertTriangle, BarChart3, ShoppingBag } from "lucide-react";
import CouponsPanel from "@/components/business-centre/CouponsPanel";

const BCCoupons = () => {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [abuseFlags, setAbuseFlags] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cR, rR, cmR, afR] = await Promise.all([
        supabase.from("coupons").select("*").order("created_at", { ascending: false }),
        supabase.from("coupon_redemptions").select("*").order("redeemed_at", { ascending: false }).limit(50),
        supabase.from("promotion_campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("coupon_abuse_flags").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setCoupons(cR.data || []);
      setRedemptions(rR.data || []);
      setCampaigns(cmR.data || []);
      setAbuseFlags(afR.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Coupons & Promotions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage coupon codes, campaigns, redemptions, and abuse monitoring</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Coupons", value: coupons.length, sub: `${coupons.filter(c => c.status === 'active').length} active`, icon: Ticket, accent: "text-primary bg-primary/10" },
          { title: "Redemptions", value: redemptions.length, sub: "Total redeemed", icon: ShoppingBag, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Campaigns", value: campaigns.length, sub: `${campaigns.filter(c => c.status === 'active').length} running`, icon: Megaphone, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Abuse Flags", value: abuseFlags.filter(f => f.status === 'open').length, sub: "Open flags", icon: AlertTriangle, accent: "text-destructive bg-destructive/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
              <p className="text-lg font-bold font-display">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.title}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="packages">
        <TabsList className="grid w-full grid-cols-5 h-9">
          <TabsTrigger value="packages" className="text-[10px]">Coupon Packages</TabsTrigger>
          <TabsTrigger value="manager" className="text-[10px]">Coupon Manager</TabsTrigger>
          <TabsTrigger value="redemptions" className="text-[10px]">Redemptions</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-[10px]">Campaigns</TabsTrigger>
          <TabsTrigger value="abuse" className="text-[10px]">Abuse Monitor</TabsTrigger>
        </TabsList>

        {/* ─── Coupon Packages (existing) ─── */}
        <TabsContent value="packages" className="mt-4">
          <CouponsPanel />
        </TabsContent>

        {/* ─── Coupon Manager ─── */}
        <TabsContent value="manager" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> Promotion Coupons</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {coupons.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No promotion coupons created yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Code</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Applies To</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Audience</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Discount</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Limit</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Period</th>
                      <th className="text-center py-2 px-1 text-muted-foreground font-medium">Stack</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-mono text-[10px] font-medium">{c.code}</td>
                          <td className="py-1.5 px-1">{c.name}</td>
                          <td className="py-1.5 px-1 text-muted-foreground capitalize">{c.type?.replace(/_/g, " ")}</td>
                          <td className="py-1.5 px-1 text-muted-foreground capitalize">{c.applies_to}</td>
                          <td className="py-1.5 px-1 text-muted-foreground capitalize">{c.audience_type}</td>
                          <td className="py-1.5 px-1 text-right">{c.discount_value ? `₱${Number(c.discount_value).toLocaleString()}` : c.token_bonus_php ? `₱${Number(c.token_bonus_php).toLocaleString()} tokens` : "—"}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">{c.usage_limit || "∞"}{c.per_user_limit ? ` (${c.per_user_limit}/user)` : ""}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{c.starts_at ? new Date(c.starts_at).toLocaleDateString() : "—"} – {c.ends_at ? new Date(c.ends_at).toLocaleDateString() : "—"}</td>
                          <td className="py-1.5 px-1 text-center">{c.is_stackable ? "✓" : "—"}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              c.status === 'active' ? "border-emerald-500/30 text-emerald-600" :
                              c.status === 'expired' ? "border-destructive/30 text-destructive" :
                              "border-amber-500/30 text-amber-600"
                            )}>{c.status}</Badge>
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

        {/* ─── Redemptions ─── */}
        <TabsContent value="redemptions" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Coupon Redemptions</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {redemptions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No redemptions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Coupon</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">User</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Reference</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Discount</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Token Bonus</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Redeemed</th>
                    </tr></thead>
                    <tbody>
                      {redemptions.map((r) => {
                        const coupon = coupons.find(c => c.id === r.coupon_id);
                        return (
                          <tr key={r.id} className="border-b border-border/20">
                            <td className="py-1.5 px-1 font-mono text-[10px]">{coupon?.code || r.coupon_id?.slice(0,8)}</td>
                            <td className="py-1.5 px-1 font-mono text-[10px]">{r.user_id?.slice(0,8)}</td>
                            <td className="py-1.5 px-1 text-muted-foreground">{r.reference_type || "—"}</td>
                            <td className="py-1.5 px-1 text-right">₱{Number(r.discount_applied).toLocaleString()}</td>
                            <td className="py-1.5 px-1 text-right text-muted-foreground">{r.token_bonus_issued ? Number(r.token_bonus_issued).toLocaleString() : "—"}</td>
                            <td className="py-1.5 px-1">
                              <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                                r.status === 'redeemed' ? "border-emerald-500/30 text-emerald-600" :
                                r.status === 'flagged' ? "border-destructive/30 text-destructive" :
                                "border-amber-500/30 text-amber-600"
                              )}>{r.status}</Badge>
                            </td>
                            <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(r.redeemed_at).toLocaleDateString()}</td>
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

        {/* ─── Campaigns ─── */}
        <TabsContent value="campaigns" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Promotion Campaigns</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {campaigns.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No campaigns created yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Description</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Period</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">KPI Target</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-medium">{c.name}</td>
                          <td className="py-1.5 px-1 text-muted-foreground truncate max-w-[150px]">{c.description || "—"}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{c.starts_at ? new Date(c.starts_at).toLocaleDateString() : "—"} – {c.ends_at ? new Date(c.ends_at).toLocaleDateString() : "—"}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{c.kpi_target && Object.keys(c.kpi_target).length > 0 ? JSON.stringify(c.kpi_target).slice(0,40) : "—"}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              c.status === 'active' ? "border-emerald-500/30 text-emerald-600" :
                              c.status === 'completed' ? "border-blue-500/30 text-blue-600" :
                              "border-amber-500/30 text-amber-600"
                            )}>{c.status}</Badge>
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

        {/* ─── Abuse ─── */}
        <TabsContent value="abuse" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Abuse Monitoring</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {abuseFlags.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No abuse flags recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Coupon</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">User</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Reason</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Flagged</th>
                    </tr></thead>
                    <tbody>
                      {abuseFlags.map((f) => (
                        <tr key={f.id} className="border-b border-border/20">
                          <td className="py-1.5 px-1 font-mono text-[10px]">{f.coupon_id?.slice(0,8) || "—"}</td>
                          <td className="py-1.5 px-1 font-mono text-[10px]">{f.user_id?.slice(0,8) || "—"}</td>
                          <td className="py-1.5 px-1 text-muted-foreground">{f.reason}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              f.status === 'open' ? "border-destructive/30 text-destructive" :
                              "border-emerald-500/30 text-emerald-600"
                            )}>{f.status}</Badge>
                          </td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
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

export default BCCoupons;
