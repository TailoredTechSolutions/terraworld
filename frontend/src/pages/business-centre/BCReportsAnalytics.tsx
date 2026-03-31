import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Loader2, BarChart3, TrendingUp, Users, Coins, ShoppingBag, Shield, Flame } from "lucide-react";

const BCReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [activations, setActivations] = useState<any[]>([]);
  const [bvSummary, setBvSummary] = useState<any[]>([]);
  const [rankDist, setRankDist] = useState<any[]>([]);
  const [pkgDist, setPkgDist] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [tokenAllocs, setTokenAllocs] = useState<any[]>([]);
  const [burns, setBurns] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [sR, aR, bR, rR, pR, fR, eR, tR, buR] = await Promise.all([
        supabase.from("vw_sales_summary_daily").select("*").limit(30),
        supabase.from("vw_activation_summary").select("*").limit(30),
        supabase.from("vw_bv_summary_daily").select("*").limit(30),
        supabase.from("vw_rank_distribution").select("*"),
        supabase.from("vw_package_distribution").select("*"),
        supabase.from("fraud_flags").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("report_exports").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("token_allocations").select("*").order("allocation_percent", { ascending: false }),
        supabase.from("token_burn_events").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      setSales(sR.data || []);
      setActivations(aR.data || []);
      setBvSummary(bR.data || []);
      setRankDist(rR.data || []);
      setPkgDist(pR.data || []);
      setFraudFlags(fR.data || []);
      setExports(eR.data || []);
      setTokenAllocs(tR.data || []);
      setBurns(buR.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalRevenue = sales.reduce((s, r) => s + Number(r.total_revenue || 0), 0);
  const totalOrders = sales.reduce((s, r) => s + Number(r.order_count || 0), 0);
  const totalFees = sales.reduce((s, r) => s + Number(r.total_fees || 0), 0);
  const totalActivations = activations.reduce((s, r) => s + Number(r.activation_count || 0), 0);

  const renderTable = (headers: string[], rows: any[][], emptyMsg: string) => (
    rows.length === 0 ? <p className="text-xs text-muted-foreground text-center py-6">{emptyMsg}</p> : (
      <div className="overflow-x-auto"><table className="w-full text-xs">
        <thead><tr className="border-b border-border">{headers.map(h => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-b border-border/20 hover:bg-muted/20">{row.map((c, j) => <td key={j} className="py-1.5 px-1">{c}</td>)}</tr>)}</tbody>
      </table></div>
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Enterprise reporting, exports, and operational metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: TrendingUp, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingBag, accent: "text-primary bg-primary/10" },
          { title: "Terra Fees", value: `₱${totalFees.toLocaleString()}`, icon: Coins, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Activations", value: totalActivations.toLocaleString(), icon: Users, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Fraud Flags", value: fraudFlags.filter(f => f.status === 'open').length, icon: Shield, accent: "text-destructive bg-destructive/10" },
        ].map(s => (
          <Card key={s.title} className="border-border/40"><CardContent className="p-4">
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
            <p className="text-sm font-bold font-display">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.title}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="executive">
        <TabsList className="grid w-full grid-cols-6 h-9">
          <TabsTrigger value="executive" className="text-[10px]">Executive</TabsTrigger>
          <TabsTrigger value="mlm" className="text-[10px]">MLM</TabsTrigger>
          <TabsTrigger value="financial" className="text-[10px]">Financial</TabsTrigger>
          <TabsTrigger value="tokenomics" className="text-[10px]">Token & Coupon</TabsTrigger>
          <TabsTrigger value="fraud" className="text-[10px]">Fraud Flags</TabsTrigger>
          <TabsTrigger value="exports" className="text-[10px]">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Daily Sales Summary</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Date", "Orders", "Revenue", "Terra Fees"],
                sales.map(r => [r.sale_date, r.order_count, `₱${Number(r.total_revenue).toLocaleString()}`, `₱${Number(r.total_fees).toLocaleString()}`]),
                "No sales data yet.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mlm" className="mt-4 space-y-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Activation Summary</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Date", "Activations", "Total Amount"],
                activations.map(r => [r.activation_date, r.activation_count, `₱${Number(r.total_amount).toLocaleString()}`]),
                "No activations yet.")}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Rank Distribution</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4">
                {renderTable(["Rank", "Members"],
                  rankDist.map(r => [r.rank_name || "Unranked", r.member_count]),
                  "No rank data.")}
              </CardContent>
            </Card>
            <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Package Distribution</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4">
                {renderTable(["Tier", "Members", "Revenue"],
                  pkgDist.map(r => [r.tier, r.member_count, `₱${Number(r.total_revenue).toLocaleString()}`]),
                  "No package data.")}
              </CardContent>
            </Card>
          </div>
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">BV Summary</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Date", "BV Type", "Total BV", "Entries"],
                bvSummary.map(r => [r.bv_date, r.bv_type, Number(r.total_bv).toLocaleString(), r.entry_count]),
                "No BV data.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Revenue by Period</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Revenue (30d)</span><span className="font-medium">₱{totalRevenue.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Terra Fees</span><span className="font-medium">₱{totalFees.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Orders</span><span className="font-medium">{totalOrders}</span></div>
              </CardContent>
            </Card>
            <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Activation Revenue</CardTitle></CardHeader>
              <CardContent className="px-5 pb-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Activations</span><span className="font-medium">{totalActivations}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total Activation Revenue</span><span className="font-medium">₱{activations.reduce((s, r) => s + Number(r.total_amount || 0), 0).toLocaleString()}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokenomics" className="mt-4 space-y-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Coins className="h-4 w-4 text-primary" /> Token Allocation Usage</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Bucket", "%", "Allocated", "Distributed", "Burned", "Remaining"],
                tokenAllocs.map(a => [a.bucket_name, `${Number(a.allocation_percent)}%`, Number(a.allocation_amount).toLocaleString(), Number(a.distributed_amount).toLocaleString(), Number(a.burned_amount || 0).toLocaleString(), Number(a.remaining_amount).toLocaleString()]),
                "No token allocations.")}
            </CardContent>
          </Card>
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Recent Burns</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Source", "Amount", "TX Hash", "Date"],
                burns.map(b => [b.source_type?.replace(/_/g, " "), Number(b.token_amount || b.tokens_burned || 0).toLocaleString(), b.tx_hash || "—", new Date(b.created_at).toLocaleDateString()]),
                "No burn events.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-destructive" /> Fraud Flags</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Module", "Severity", "Reason", "Status", "Date"],
                fraudFlags.map(f => [
                  f.module,
                  <Badge key="sev" variant="outline" className={cn("text-[9px]", f.severity === 'critical' ? "border-destructive/40 text-destructive" : f.severity === 'high' ? "border-amber-500/40 text-amber-600" : "border-border")}>{f.severity}</Badge>,
                  <span key="r" className="truncate max-w-[200px] block">{f.reason}</span>,
                  <Badge key="st" variant="outline" className={cn("text-[9px]", f.status === 'open' ? "border-destructive/30 text-destructive" : "border-emerald-500/30 text-emerald-600")}>{f.status}</Badge>,
                  new Date(f.created_at).toLocaleDateString()
                ]),
                "No fraud flags recorded.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Report Exports</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Report", "Format", "Status", "Requested", "Completed"],
                exports.map(e => [
                  e.report_type,
                  <Badge key="f" variant="outline" className="text-[9px]">{e.file_format}</Badge>,
                  <Badge key="s" variant="outline" className={cn("text-[9px]", e.status === 'completed' ? "border-emerald-500/30 text-emerald-600" : "border-amber-500/30 text-amber-600")}>{e.status}</Badge>,
                  new Date(e.created_at).toLocaleDateString(),
                  e.completed_at ? new Date(e.completed_at).toLocaleDateString() : "—"
                ]),
                "No report exports yet.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCReportsAnalytics;
