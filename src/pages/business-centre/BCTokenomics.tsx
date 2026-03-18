import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Coins, Loader2, Flame, BookOpen, TrendingUp, Lock } from "lucide-react";

const TOTAL_SUPPLY = 250_000_000_000;

const BCTokenomics = () => {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [issuances, setIssuances] = useState<any[]>([]);
  const [burns, setBurns] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [tokenLedger, setTokenLedger] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [aRes, iRes, bRes, rRes, tlRes] = await Promise.all([
        supabase.from("token_allocations").select("*").order("allocation_percent", { ascending: false }),
        supabase.from("token_issuances").select("*").order("issued_at", { ascending: false }).limit(50),
        supabase.from("token_burn_events").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("token_reward_rules").select("*").order("created_at", { ascending: false }),
        supabase.from("token_ledger").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setAllocations(aRes.data || []);
      setIssuances(iRes.data || []);
      setBurns(bRes.data || []);
      setRules(rRes.data || []);
      setTokenLedger(tlRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalDistributed = allocations.reduce((s, a) => s + Number(a.distributed_amount || 0), 0);
  const totalBurned = burns.reduce((s, b) => s + Number(b.tokens_burned || 0), 0);
  const circulating = totalDistributed - totalBurned;
  const totalIssued = tokenLedger.reduce((s, t) => s + Number(t.tokens_issued || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Tokenomics & Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">AGRI token supply, allocations, issuance, and burns</p>
      </div>

      {/* Token Supply KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Total Supply", value: TOTAL_SUPPLY.toLocaleString(), sub: "Fixed • No inflation • Minting disabled", icon: Coins, accent: "text-primary bg-primary/10" },
          { title: "Distributed", value: (totalDistributed || totalIssued).toLocaleString(), sub: "From allocation buckets", icon: TrendingUp, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Burned", value: totalBurned.toLocaleString(), sub: "Permanently removed", icon: Flame, accent: "text-destructive bg-destructive/10" },
          { title: "Circulating", value: (circulating || totalIssued).toLocaleString(), sub: "Active in wallets", icon: Lock, accent: "text-blue-600 bg-blue-500/10" },
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

      {/* Token specs */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {[
              "Fixed 250B supply", "18 decimals", "EVM-compatible",
              "Burn enabled", "Minting permanently disabled",
              "Formula: tokens = reward_php / token_market_price",
              "Non-cash reward (never reduces compensation pool)"
            ].map((spec) => (
              <Badge key={spec} variant="outline" className="text-[10px] px-2 py-0.5">{spec}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="allocations">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="allocations" className="text-xs">Allocations</TabsTrigger>
          <TabsTrigger value="issuances" className="text-xs">Issuances</TabsTrigger>
          <TabsTrigger value="burns" className="text-xs">Burns</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs">Reward Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Whitepaper Allocation Buckets</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {allocations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No allocation buckets configured. Seed from whitepaper.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Bucket</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">%</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Allocated</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Released</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Distributed</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Remaining</th>
                    </tr></thead>
                    <tbody>
                      {allocations.map((a) => (
                        <tr key={a.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-medium">{a.bucket_name}</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.allocation_percent)}%</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.allocation_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.released_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right">{Number(a.distributed_amount).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right font-medium">{Number(a.remaining_amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issuances" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Token Issuance Log</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {issuances.length === 0 && tokenLedger.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No token issuances recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Reward ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Price ₱</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Tokens</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Source</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {(issuances.length > 0 ? issuances : tokenLedger).map((t) => (
                        <tr key={t.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 text-right">₱{Number(t.reward_php || t.php_reward_value || 0).toLocaleString()}</td>
                          <td className="py-1.5 px-1 text-right text-muted-foreground">₱{Number(t.token_price_php || t.token_market_price || 0).toFixed(4)}</td>
                          <td className="py-1.5 px-1 text-right font-medium">{Number(t.tokens_issued).toLocaleString()}</td>
                          <td className="py-1.5 px-1 truncate max-w-[120px] text-muted-foreground">{t.reference_type || t.source_description || "—"}</td>
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

        <TabsContent value="burns" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Burn Events</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {burns.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No burn events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Source</th>
                      <th className="text-right py-2 px-1 text-muted-foreground font-medium">Tokens Burned</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">TX Hash</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {burns.map((b) => (
                        <tr key={b.id} className="border-b border-border/20">
                          <td className="py-1.5 px-1">{b.source_type}</td>
                          <td className="py-1.5 px-1 text-right font-medium text-destructive">{Number(b.tokens_burned).toLocaleString()}</td>
                          <td className="py-1.5 px-1 font-mono text-[10px] truncate max-w-[100px]">{b.tx_hash || "—"}</td>
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

        <TabsContent value="rules" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Token Reward Rules</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {rules.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No reward rules configured yet.</p>
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
                          <td className="py-1.5 px-1 text-muted-foreground">{r.basis_type}</td>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCTokenomics;
