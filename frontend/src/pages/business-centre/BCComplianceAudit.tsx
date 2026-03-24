import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Shield, Loader2, Search, Lock, AlertTriangle, Globe, Eye, Flag, Settings, Users, Activity } from "lucide-react";

const BCComplianceAudit = () => {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [kycProfiles, setKycProfiles] = useState<any[]>([]);
  const [countryRules, setCountryRules] = useState<any[]>([]);
  const [placementLocks, setPlacementLocks] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [integrityChecks, setIntegrityChecks] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [securitySettings, setSecuritySettings] = useState<any[]>([]);
  const [adminSessions, setAdminSessions] = useState<any[]>([]);
  const [highRiskActions, setHighRiskActions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [alR, apR, kR, crR, plR, ffR, icR, fgR, ssR, asR, hrR] = await Promise.all([
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("approval_requests").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("kyc_profiles").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("country_rules").select("*").order("country_code"),
        supabase.from("placement_lock_events").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("fraud_flags").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("data_integrity_checks").select("*").order("executed_at", { ascending: false }).limit(50),
        supabase.from("feature_flags").select("*").order("flag_code"),
        supabase.from("security_settings").select("*").order("setting_code"),
        supabase.from("admin_sessions").select("*").order("started_at", { ascending: false }).limit(50),
        supabase.from("high_risk_actions").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setAuditLogs(alR.data || []);
      setApprovals(apR.data || []);
      setKycProfiles(kR.data || []);
      setCountryRules(crR.data || []);
      setPlacementLocks(plR.data || []);
      setFraudFlags(ffR.data || []);
      setIntegrityChecks(icR.data || []);
      setFeatureFlags(fgR.data || []);
      setSecuritySettings(ssR.data || []);
      setAdminSessions(asR.data || []);
      setHighRiskActions(hrR.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const filteredLogs = auditLogs.filter(l =>
    !search || [l.action, l.entity_type, l.actor_id].some(f => f?.toLowerCase?.().includes(search.toLowerCase()))
  );

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
        <h1 className="text-2xl font-bold font-display">Compliance, Audit & Admin Hardening</h1>
        <p className="text-sm text-muted-foreground mt-1">KYC review, audit trail, fraud monitoring, feature flags, and security controls</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { title: "Audit Entries", value: auditLogs.length, icon: Eye, accent: "text-primary bg-primary/10" },
          { title: "KYC Pending", value: kycProfiles.filter(k => k.status === 'pending' || k.status === 'submitted').length, icon: Users, accent: "text-amber-600 bg-amber-500/10" },
          { title: "Fraud Flags", value: fraudFlags.filter(f => f.status === 'open').length, icon: AlertTriangle, accent: "text-destructive bg-destructive/10" },
          { title: "Country Rules", value: countryRules.length, icon: Globe, accent: "text-blue-600 bg-blue-500/10" },
          { title: "Feature Flags", value: featureFlags.filter(f => f.is_enabled).length + "/" + featureFlags.length, icon: Flag, accent: "text-emerald-600 bg-emerald-500/10" },
          { title: "High-Risk Pending", value: highRiskActions.filter(h => h.approval_status === 'pending').length, icon: Shield, accent: "text-destructive bg-destructive/10" },
        ].map(s => (
          <Card key={s.title} className="border-border/40"><CardContent className="p-3">
            <div className={cn("p-1.5 rounded-lg w-fit mb-1", s.accent)}><s.icon className="h-3.5 w-3.5" /></div>
            <p className="text-sm font-bold font-display">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.title}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="audit">
        <TabsList className="grid w-full grid-cols-8 h-9">
          <TabsTrigger value="audit" className="text-[9px]">Audit Log</TabsTrigger>
          <TabsTrigger value="approvals" className="text-[9px]">Approvals</TabsTrigger>
          <TabsTrigger value="kyc" className="text-[9px]">KYC Review</TabsTrigger>
          <TabsTrigger value="country" className="text-[9px]">Country Rules</TabsTrigger>
          <TabsTrigger value="fraud" className="text-[9px]">Fraud & Risk</TabsTrigger>
          <TabsTrigger value="integrity" className="text-[9px]">Integrity</TabsTrigger>
          <TabsTrigger value="flags" className="text-[9px]">Feature Flags</TabsTrigger>
          <TabsTrigger value="hardening" className="text-[9px]">Hardening</TabsTrigger>
        </TabsList>

        {/* Audit Log */}
        <TabsContent value="audit" className="mt-4 space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="Search audit logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" /></div>
          <Card className="border-border/40"><CardContent className="p-4">
            {renderTable(["Actor", "Action", "Entity", "Entity ID", "IP", "Date"],
              filteredLogs.map(l => [
                <span key="a" className="font-mono text-[10px]">{l.actor_id?.slice(0, 8) || "system"}</span>,
                l.action,
                l.entity_type,
                <span key="e" className="font-mono text-[10px]">{l.entity_id?.slice(0, 8) || "—"}</span>,
                l.ip_address || "—",
                new Date(l.created_at).toLocaleString()
              ]),
              "No audit logs.")}
          </CardContent></Card>
        </TabsContent>

        {/* Approvals */}
        <TabsContent value="approvals" className="mt-4">
          <Card className="border-border/40"><CardContent className="p-4">
            {renderTable(["Module", "Entity Type", "Status", "Requester", "Approver", "Date"],
              approvals.map(a => [
                a.module,
                a.entity_type,
                <Badge key="s" variant="outline" className={cn("text-[9px]", a.status === 'approved' ? "border-emerald-500/30 text-emerald-600" : a.status === 'rejected' ? "border-destructive/30 text-destructive" : "border-amber-500/30 text-amber-600")}>{a.status}</Badge>,
                <span key="r" className="font-mono text-[10px]">{a.requested_by?.slice(0, 8)}</span>,
                a.approved_by ? <span key="ab" className="font-mono text-[10px]">{a.approved_by.slice(0, 8)}</span> : "—",
                new Date(a.created_at).toLocaleDateString()
              ]),
              "No approval requests.")}
          </CardContent></Card>
        </TabsContent>

        {/* KYC Review */}
        <TabsContent value="kyc" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> KYC Profiles</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["User ID", "Account Type", "Status", "Submitted", "Reviewed"],
                kycProfiles.map(k => [
                  <span key="u" className="font-mono text-[10px]">{k.user_id?.slice(0, 8)}</span>,
                  k.account_type,
                  <Badge key="s" variant="outline" className={cn("text-[9px]", k.status === 'approved' ? "border-emerald-500/30 text-emerald-600" : k.status === 'rejected' ? "border-destructive/30 text-destructive" : "border-amber-500/30 text-amber-600")}>{k.status}</Badge>,
                  k.submitted_at ? new Date(k.submitted_at).toLocaleDateString() : "—",
                  k.reviewed_at ? new Date(k.reviewed_at).toLocaleDateString() : "—"
                ]),
                "No KYC profiles.")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Country Rules */}
        <TabsContent value="country" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Country Rules</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Country", "Allowed", "KYC Required", "Withdrawals", "Notes"],
                countryRules.map(c => [
                  <span key="cc" className="font-bold">{c.country_code}</span>,
                  c.is_allowed ? <Badge key="a" variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600">Yes</Badge> : <Badge key="a" variant="outline" className="text-[9px] border-destructive/30 text-destructive">No</Badge>,
                  c.kyc_required ? "Required" : "Optional",
                  c.withdrawals_allowed ? "Enabled" : "Disabled",
                  c.notes || "—"
                ]),
                "No country rules configured.")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud & Risk */}
        <TabsContent value="fraud" className="mt-4 space-y-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Fraud Flags</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Module", "Entity", "Severity", "Reason", "Status", "Date"],
                fraudFlags.map(f => [
                  f.module,
                  f.entity_type,
                  <Badge key="sv" variant="outline" className={cn("text-[9px]", f.severity === 'critical' ? "border-destructive/40 text-destructive" : f.severity === 'high' ? "border-amber-500/40 text-amber-600" : "border-border")}>{f.severity}</Badge>,
                  <span key="r" className="truncate max-w-[150px] block">{f.reason}</span>,
                  <Badge key="st" variant="outline" className={cn("text-[9px]", f.status === 'open' ? "border-destructive/30 text-destructive" : "border-emerald-500/30 text-emerald-600")}>{f.status}</Badge>,
                  new Date(f.created_at).toLocaleDateString()
                ]),
                "No fraud flags.")}
            </CardContent>
          </Card>
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm">Placement Lock Events</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Member", "Run", "Status", "Reason", "Date"],
                placementLocks.map(p => [
                  <span key="m" className="font-mono text-[10px]">{p.member_id?.slice(0, 8)}</span>,
                  <span key="r" className="font-mono text-[10px]">{p.commission_run_id?.slice(0, 8) || "—"}</span>,
                  <Badge key="s" variant="outline" className={cn("text-[9px]", p.lock_status === 'locked' ? "border-amber-500/30 text-amber-600" : "border-emerald-500/30 text-emerald-600")}>{p.lock_status}</Badge>,
                  p.reason || "—",
                  new Date(p.created_at).toLocaleDateString()
                ]),
                "No placement lock events.")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrity */}
        <TabsContent value="integrity" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Data Integrity Checks</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Check", "Module", "Status", "Executed"],
                integrityChecks.map(c => [
                  c.check_code,
                  c.module,
                  <Badge key="s" variant="outline" className={cn("text-[9px]", c.status === 'pass' ? "border-emerald-500/30 text-emerald-600" : c.status === 'fail' ? "border-destructive/30 text-destructive" : "border-amber-500/30 text-amber-600")}>{c.status}</Badge>,
                  new Date(c.executed_at).toLocaleString()
                ]),
                "No integrity checks run yet.")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="flags" className="mt-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flag className="h-4 w-4 text-primary" /> Feature Flags</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Code", "Name", "Enabled", "Config", "Updated"],
                featureFlags.map(f => [
                  <span key="c" className="font-mono text-[10px]">{f.flag_code}</span>,
                  f.flag_name,
                  <Badge key="e" variant="outline" className={cn("text-[9px]", f.is_enabled ? "border-emerald-500/30 text-emerald-600" : "border-muted-foreground/30")}>{f.is_enabled ? "On" : "Off"}</Badge>,
                  <span key="cfg" className="text-[10px] text-muted-foreground truncate max-w-[150px] block">{JSON.stringify(f.config).slice(0, 40)}</span>,
                  new Date(f.updated_at).toLocaleDateString()
                ]),
                "No feature flags.")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hardening */}
        <TabsContent value="hardening" className="mt-4 space-y-4">
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4 text-primary" /> Security Settings</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Setting", "Value", "Updated"],
                securitySettings.map(s => [
                  <span key="c" className="font-mono text-[10px]">{s.setting_code}</span>,
                  <span key="v" className="text-[10px] text-muted-foreground">{JSON.stringify(s.setting_value).slice(0, 50)}</span>,
                  new Date(s.updated_at).toLocaleDateString()
                ]),
                "No security settings.")}
            </CardContent>
          </Card>
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> High-Risk Actions</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["Module", "Action", "Entity", "Requester", "Approval", "Date"],
                highRiskActions.map(h => [
                  h.module,
                  h.action_code,
                  h.entity_type || "—",
                  <span key="r" className="font-mono text-[10px]">{h.requested_by?.slice(0, 8) || "—"}</span>,
                  <Badge key="a" variant="outline" className={cn("text-[9px]", h.approval_status === 'approved' ? "border-emerald-500/30 text-emerald-600" : h.approval_status === 'rejected' ? "border-destructive/30 text-destructive" : "border-amber-500/30 text-amber-600")}>{h.approval_status}</Badge>,
                  new Date(h.created_at).toLocaleDateString()
                ]),
                "No high-risk actions.")}
            </CardContent>
          </Card>
          <Card className="border-border/40"><CardHeader className="px-5 pt-4 pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Admin Sessions</CardTitle></CardHeader>
            <CardContent className="px-5 pb-4">
              {renderTable(["User", "IP", "User Agent", "Started", "Active"],
                adminSessions.map(s => [
                  <span key="u" className="font-mono text-[10px]">{s.user_id?.slice(0, 8)}</span>,
                  s.ip_address || "—",
                  <span key="ua" className="text-[10px] truncate max-w-[150px] block">{s.user_agent || "—"}</span>,
                  new Date(s.started_at).toLocaleString(),
                  s.is_active ? <Badge key="a" variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600">Active</Badge> : <Badge key="a" variant="outline" className="text-[9px]">Ended</Badge>
                ]),
                "No admin sessions.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCComplianceAudit;
