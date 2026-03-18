import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Shield, FileText, Loader2, Search, CheckCircle2, XCircle,
  Clock, Eye, Lock, AlertTriangle
} from "lucide-react";

const BCComplianceAudit = () => {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [kycProfiles, setKycProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [alRes, apRes, kRes] = await Promise.all([
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("approval_requests").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("kyc_profiles").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false }).limit(50),
      ]);
      setAuditLogs(alRes.data || []);
      setApprovals(apRes.data || []);
      setKycProfiles(kRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const pendingKyc = kycProfiles.filter(k => k.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Compliance & Security</h1>
        <p className="text-sm text-muted-foreground mt-1">Audit logs, approval queue, KYC review, and security settings</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Audit Events", value: auditLogs.length.toString(), icon: FileText, accent: "text-primary bg-primary/10" },
          { title: "Pending Approvals", value: approvals.filter(a => a.status === "pending").length.toString(), icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
          { title: "KYC Pending", value: pendingKyc.length.toString(), icon: Eye, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Security", value: "Active", icon: Shield, accent: "text-emerald-600 bg-emerald-500/10" },
        ].map((s) => (
          <Card key={s.title} className="border-border/40">
            <CardContent className="p-4">
              <div className={cn("p-1.5 rounded-lg w-fit mb-2", s.accent)}><s.icon className="h-4 w-4" /></div>
              <p className="text-xl font-bold font-display">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audit">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="audit" className="text-xs">Audit Log</TabsTrigger>
          <TabsTrigger value="approvals" className="text-xs">Approvals</TabsTrigger>
          <TabsTrigger value="kyc" className="text-xs">KYC Review</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        </TabsList>

        {/* Audit Log */}
        <TabsContent value="audit" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Audit Log Viewer</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Filter..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No audit events recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Action</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Entity</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Entity ID</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">IP</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Date</th>
                    </tr></thead>
                    <tbody>
                      {auditLogs.filter(a => {
                        if (!search) return true;
                        return a.action?.toLowerCase().includes(search.toLowerCase()) || a.entity_type?.toLowerCase().includes(search.toLowerCase());
                      }).map((a) => (
                        <tr key={a.id} className="border-b border-border/20 hover:bg-muted/20">
                          <td className="py-1.5 px-1 font-medium">{a.action}</td>
                          <td className="py-1.5 px-1 text-muted-foreground">{a.entity_type}</td>
                          <td className="py-1.5 px-1 font-mono text-[10px] truncate max-w-[80px]">{a.entity_id || "—"}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{a.ip_address || "—"}</td>
                          <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals */}
        <TabsContent value="approvals" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Dual-Approval Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {approvals.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No approval requests.</p>
              ) : (
                <div className="space-y-2">
                  {approvals.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
                      <div>
                        <p className="text-xs font-medium">{a.module} — {a.entity_type}</p>
                        <p className="text-[10px] text-muted-foreground">{a.reason || "No reason"}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                          a.status === "pending" ? "border-amber-500/30 text-amber-600" :
                          a.status === "approved" ? "border-emerald-500/30 text-emerald-600" : "border-destructive/30 text-destructive"
                        )}>{a.status}</Badge>
                        {a.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-emerald-600">Approve</Button>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-destructive">Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Review */}
        <TabsContent value="kyc" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">KYC Review Queue</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {kycProfiles.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No KYC submissions.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Account Type</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Country</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-1 text-muted-foreground font-medium">Submitted</th>
                    </tr></thead>
                    <tbody>
                      {kycProfiles.map((k) => {
                        const p = (k as any).profiles;
                        return (
                          <tr key={k.id} className="border-b border-border/20 hover:bg-muted/20">
                            <td className="py-1.5 px-1">
                              <p className="font-medium">{k.first_name} {k.last_name}</p>
                              <p className="text-[10px] text-muted-foreground">{p?.email}</p>
                            </td>
                            <td className="py-1.5 px-1">{k.account_type}</td>
                            <td className="py-1.5 px-1 text-muted-foreground">{k.country || "—"}</td>
                            <td className="py-1.5 px-1">
                              <Badge variant="outline" className={cn("text-[9px] px-1 py-0",
                                k.status === "approved" ? "border-emerald-500/30 text-emerald-600" :
                                k.status === "pending" ? "border-amber-500/30 text-amber-600" :
                                k.status === "rejected" ? "border-destructive/30 text-destructive" : ""
                              )}>{k.status}</Badge>
                            </td>
                            <td className="py-1.5 px-1 text-[10px] text-muted-foreground">{k.submitted_at ? new Date(k.submitted_at).toLocaleDateString() : "—"}</td>
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

        {/* Security Settings */}
        <TabsContent value="security" className="mt-4">
          <Card className="border-border/40">
            <CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Security Settings</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4 space-y-3">
              {[
                { label: "No hard delete of financial data", status: "Enforced", ok: true },
                { label: "Append-only ledgers", status: "Active (triggers)", ok: true },
                { label: "Dual approval for wallet adjustments", status: "Enabled", ok: true },
                { label: "RLS on all tables", status: "34+ tables protected", ok: true },
                { label: "Service role restricted to backend", status: "Enforced", ok: true },
                { label: "Email lock trigger (anti-hijack)", status: "Active", ok: true },
                { label: "HMAC webhook validation", status: "All endpoints", ok: true },
                { label: "Price integrity checks", status: "create-order function", ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    {s.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    <span className="text-xs">{s.label}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] px-1 py-0", s.ok ? "border-emerald-500/30 text-emerald-600" : "border-amber-500/30 text-amber-600")}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCComplianceAudit;
