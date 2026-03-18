import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coins, Loader2, Flame, BookOpen, TrendingUp, Lock, Shield, ArrowUpRight, AlertTriangle, Settings } from "lucide-react";

const TOTAL_SUPPLY = 250_000_000_000;

const BCTokenomics = () => {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [issuances, setIssuances] = useState<any[]>([]);
  const [burns, setBurns] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [marketPrice, setMarketPrice] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [aR, iR, bR, rR, rlR, mpR] = await Promise.all([
        supabase.from("token_allocations").select("*").order("allocation_percent", { ascending: false }),
        supabase.from("token_issuances").select("*").order("issued_at", { ascending: false }).limit(50),
        supabase.from("token_burn_events").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("token_reward_rules").select("*").order("created_at", { ascending: false }),
        supabase.from("token_reserve_releases").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("token_market_snapshots").select("*").order("captured_at", { ascending: false }).limit(1),
      ]);
      setAllocations(aR.data || []);
      setIssuances(iR.data || []);
      setBurns(bR.data || []);
      setRules(rR.data || []);
      setReleases(rlR.data || []);
      setMarketPrice(mpR.data?.[0] || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalDistributed = allocations.reduce((s, a) => s + Number(a.distributed_amount || 0), 0);
  const totalBurned = allocations.reduce((s, a) => s + Number(a.burned_amount || 0), 0);
  const totalRemaining = allocations.reduce((s, a) => s + Number(a.remaining_amount || 0), 0);
  const circulating = totalDistributed - totalBurned;
  const circulatingPct = ((circulating / TOTAL_SUPPLY) * 100).toFixed(2);
  const under15 = circulating / TOTAL_SUPPLY < 0.15;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Tokenomics & Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">AGRI token supply, allocations, issuance, burns, and reserve governance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: "Total Supply", value: TOTAL_SUPPLY.toLocaleString(), sub: "Fixed • No inflation", icon: Coins, accent: "text-primary bg-primary/10" },
          { title: "Distributed", value: totalDistributed.toLocaleString(), sub: "From allocation buckets", icon: TrendingUp, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Burned", value: totalBurned.toLocaleString(), sub: "Permanently removed", icon: Flame, accent: "text-destructive bg-destructive/10" },
          { title: "Circulating", value: `${circulating.toLocaleString()} (${circulatingPct}%)`, sub: under15 ? "✓ Under 15% launch target" : "⚠ Above 15%", icon: Lock, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Market Price", value: marketPrice ? `₱${Number(marketPrice.price_php).toFixed(4)}` : "—", sub: marketPrice ? `Source: ${marketPrice.source}` : "No snapshot", icon: TrendingUp, accent: "text-amber-600 bg-amber-500/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
              <p className="text-sm font-bold font-display truncate">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.title}</p>
              <p className="text-[9px] text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Token specs */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {["Fixed 250B supply", "18 decimals", "EVM-compatible", "Burn enabled", "Minting permanently disabled",
              "Formula: tokens = reward_php / token_market_price", "Non-cash reward (never reduces compensation pool)",
              "Fail-safe does NOT affect token rewards"
            ].map((spec) => (
              <Badge key={spec} variant="outline" className="text-[10px] px-2 py-0.5">{spec}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="allocations">
        <TabsList className="grid w-full grid-cols-7 h-9">
          <TabsTrigger value="allocations" className="text-[10px]">Allocations</TabsTrigger>
          <TabsTrigger value="rules" className="text-[10px]">Reward Rules</TabsTrigger>
          <TabsTrigger value="issuance-queue" className="text-[10px]">Issuance Queue</TabsTrigger>
          <TabsTrigger value="issuance-ledger" className="text-[10px]">Issuance Ledger</TabsTrigger>
          <TabsTrigger value="burns" className="text-[10px]">Burns</TabsTrigger>
          <TabsTrigger value="reserves" className="text-[10px]">Reserve Releases</TabsTrigger>
          <TabsTrigger value="reports" className="text-[10px]">Reports</TabsTrigger>
        </TabsList>

        {/* ─── Allocations ─── */}
        <TabsContent value="allocations" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Whitepaper Allocation Buckets</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {allocations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No allocation buckets configured.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Bucket</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">%</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Allocated</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Released</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Distributed</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Burned</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Remaining</th>
                      <th className="text-center py-2 px-1 text-muted-foreground font-medium">Locked</th>
                    </tr></thead>
                    <tbody>
                      {allocations.map((a) => (
                        <tr key={a.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-medium">{a.bucket_name}</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.allocation_percent)}%</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.allocation_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.released_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.distributed_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-destructive">{Number(a.burned_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right font-medium">{Number(a.remaining_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-center">
                            <Badge variant="outline" className={cn("text-[9px]", a.is_locked ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600")}>
                              {a.is_locked ? "Locked" : "Open"}
                            </Badge>
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

        {/* ─── Reward Rules ─── */}
        <TabsContent value="rules" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Token Reward Rules</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {rules.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No reward rules configured.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Code</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Basis</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Reward ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Daily Cap</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Active</th>
                    </tr></thead>
                    <tbody>
                      {rules.map((r) => (
                        <tr key={r.id} className="border-b border-border/20">
                          <td className="py-1.5 px-1 font-mono text-[10px]">{r.code}</td>
                          <td className="py-1.5 px-1 font-medium">{r.name}</td>
                          <td className="py-1.5 px-1 text-muted-foreground">{r.basis_type?.replace(/_/g, " ")}</td>
                          <td className="py-1.5 px-1 text-right">₱{Number(r.reward_php).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">{r.daily_cap ? `₱${Number(r.daily_cap).toLocaleString()}` : "None"}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0", r.is_active ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive")}>
                              {r.is_active ? "Active" : "Disabled"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground"><strong>Formula:</strong> tokens_issued = reward_php ÷ token_market_price</p>
                <p className="text-[10px] text-muted-foreground mt-1"><strong>Supported sources:</strong> Farmers onboarded, End consumers onboarded, BV from Terra service fees</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Issuance Queue ─── */}
        <TabsContent value="issuance-queue" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-primary" /> Issuance Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {issuances.filter(i => i.status === 'pending').length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No pending issuances in the queue.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Recipient</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Reward ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Price ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Tokens</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Source</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {issuances.filter(i => i.status === 'pending').map((t) => (
                        <tr key={t.id} className="border-b border-border/20">
                          <td className="py-1.5 px-1 font-mono text-[10px] truncate max-w-[100px]">{t.recipient_id?.slice(0,8) || t.recipient_user_id?.slice(0,8) || "—"}</td>
                          <td className="py-1.5 px-1 text-right">₱{Number(t.reward_php || 0).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(t.token_price_php || 0).toFixed(4)}</td>
                          <td className="py-1.5 px-1 text-right font-medium">{Number(t.tokens_issued).toLocaleString()}</td>
                          <td className="py-1.5 px-1 truncate max-w-[100px] text-muted-foreground">{t.reference_type || "—"}</td>
                          <td className="py-1.5 px-1"><Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600">Pending</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Issuance Ledger ─── */}
        <TabsContent value="issuance-ledger" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Token Issuance Ledger</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {issuances.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No token issuances recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">ID</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Type</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Reward ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Price ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Tokens</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Source</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {issuances.map((t) => (
                        <tr key={t.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-mono text-[10px]">{t.id?.slice(0,8)}</td>
                          <td className="py-1.5 px-1 text-muted-foreground">{t.recipient_type || "member"}</td>
                          <td className="py-1.5 px-1 text-right">₱{Number(t.reward_php || 0).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(t.token_price_php || 0).toFixed(4)}</td>
                          <td className="py-1.5 px-1 text-right font-medium">{Number(t.tokens_issued).toLocaleString()}</td>
                          <td className="py-1.5 px-1 truncate max-w-[100px] text-muted-foreground">{t.reference_type || "—"}</td>
                          <td className="py-1.5 px-1">
                            <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                              t.status === 'posted' ? "border-emerald-500/30 text-emerald-600" :
                              t.status === 'reversed' ? "border-destructive/30 text-destructive" :
                              "border-amber-500/30 text-amber-600"
                            )}>{t.status}</Badge>
                          </td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(t.issued_at || t.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Burns ─── */}
        <TabsContent value="burns" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Burn Events</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="mb-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground"><strong>Burn sources:</strong> Transaction fees, Settlement fees, Optional buybacks</p>
              </div>
              {burns.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No burn events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Source</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Tokens Burned</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">TX Hash</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Notes</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {burns.map((b) => (
                        <tr key={b.id} className="border-b border-border/20">
                          <td className="py-1.5 px-1 capitalize">{b.source_type?.replace(/_/g, " ")}</td>
                          <td className="py-1.5 px-1 text-right font-medium text-destructive">{Number(b.token_amount || b.tokens_burned || 0).toLocaleString()}</td>
                          <td className="py-1.5 px-1 font-mono text-[10px] truncate max-w-[100px]">{b.tx_hash || "—"}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground truncate max-w-[100px]">{b.notes || "—"}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Reserve Releases ─── */}
        <TabsContent value="reserves" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Reserve Release Requests</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="mb-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground"><strong>Governance:</strong> Treasury / DAO Reserve releases require multisig or DAO vote approval before tokens are released.</p>
              </div>
              {releases.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No reserve release requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Allocation</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Amount</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Purpose</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Governance</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {releases.map((r) => {
                        const bucket = allocations.find(a => a.id === r.allocation_id);
                        return (
                          <tr key={r.id} className="border-b border-border/20">
                            <td className="py-1.5 px-1 font-medium">{bucket?.bucket_name || r.allocation_id?.slice(0,8)}</td>
                            <td className="py-1.5 px-1 text-right">{Number(r.requested_amount).toLocaleString()}</td>
                            <td className="py-1.5 px-1 text-muted-foreground truncate max-w-[120px]">{r.purpose}</td>
                            <td className="py-1.5 px-1"><Badge variant="outline" className="text-[9px]">{r.governance_mode}</Badge></td>
                            <td className="py-1.5 px-1">
                              <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                                r.status === 'released' ? "border-emerald-500/30 text-emerald-600" :
                                r.status === 'rejected' ? "border-destructive/30 text-destructive" :
                                "border-amber-500/30 text-amber-600"
                              )}>{r.status}</Badge>
                            </td>
                            <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
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

        {/* ─── Reports ─── */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Token Distribution Summary</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Issuances</span><span className="font-medium">{issuances.length}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Tokens Issued</span><span className="font-medium">{issuances.reduce((s, i) => s + Number(i.tokens_issued || 0), 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Reward PHP</span><span className="font-medium">₱{issuances.reduce((s, i) => s + Number(i.reward_php || 0), 0).toLocaleString()}</span></div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Burn Summary</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Burn Events</span><span className="font-medium">{burns.length}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Tokens Burned</span><span className="font-medium text-destructive">{burns.reduce((s, b) => s + Number(b.token_amount || b.tokens_burned || 0), 0).toLocaleString()}</span></div>
                {["transaction_fee", "settlement_fee", "buyback"].map(src => {
                  const count = burns.filter(b => b.source_type === src).length;
                  return count > 0 ? <div key={src} className="flex justify-between text-xs"><span className="text-muted-foreground capitalize">{src.replace(/_/g, " ")}</span><span>{count} events</span></div> : null;
                })}
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Reserve Usage</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Remaining</span><span className="font-medium">{totalRemaining.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Pending Releases</span><span className="font-medium">{releases.filter(r => r.status === 'pending').length}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Approved Releases</span><span className="font-medium">{releases.filter(r => r.status === 'released').length}</span></div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Active Reward Rules</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                {rules.filter(r => r.is_active).map(r => (
                  <div key={r.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{r.name}</span>
                    <span className="font-medium">₱{Number(r.reward_php).toLocaleString()}</span>
                  </div>
                ))}
                {rules.filter(r => r.is_active).length === 0 && <p className="text-xs text-muted-foreground">No active rules</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCTokenomics;
