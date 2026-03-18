import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Users, GitBranch, TrendingUp, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NetworkMember {
  user_id: string;
  full_name: string;
  email: string;
  tier: string;
  placement_side: string | null;
  created_at: string;
  membership_bv: number;
}

const BCNetwork = () => {
  const { data, adminData, effectiveUserId } = useBusinessCentre();
  const isAdmin = data.isAnyAdmin;
  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, left: 0, right: 0, active: 0 });

  useEffect(() => {
    if (!effectiveUserId) return;
    const fetchNetwork = async () => {
      // For admin: show all members; for member: show their downline via get_subtree_flat
      if (isAdmin) {
        const { data: rows } = await supabase
          .from("memberships")
          .select("user_id, tier, placement_side, membership_bv, created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        if (rows) {
          // Fetch profile names
          const userIds = rows.map(r => r.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", userIds);

          const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
          const mapped: NetworkMember[] = rows.map(r => ({
            user_id: r.user_id,
            full_name: profileMap.get(r.user_id)?.full_name || "Member",
            email: profileMap.get(r.user_id)?.email || "",
            tier: r.tier,
            placement_side: r.placement_side,
            created_at: r.created_at,
            membership_bv: Number(r.membership_bv) || 0,
          }));
          setMembers(mapped);
          setStats({
            total: mapped.length,
            left: mapped.filter(m => m.placement_side === "left").length,
            right: mapped.filter(m => m.placement_side === "right").length,
            active: mapped.filter(m => m.tier !== "free").length,
          });
        }
      } else {
        const { data: tree } = await supabase.rpc("get_subtree_flat", { p_root_user_id: effectiveUserId, p_max_depth: 5 });
        if (tree) {
          const mapped: NetworkMember[] = tree.filter((n: any) => n.user_id !== effectiveUserId).map((n: any) => ({
            user_id: n.user_id,
            full_name: n.full_name || "Member",
            email: n.email || "",
            tier: n.tier,
            placement_side: n.child_side,
            created_at: n.created_at,
            membership_bv: Number(n.membership_bv) || 0,
          }));
          setMembers(mapped);
          setStats({
            total: mapped.length,
            left: mapped.filter(m => m.placement_side === "left").length,
            right: mapped.filter(m => m.placement_side === "right").length,
            active: mapped.filter(m => m.tier !== "free").length,
          });
        }
      }
    };
    fetchNetwork();
  }, [effectiveUserId, isAdmin]);

  const filtered = searchQuery
    ? members.filter(m => m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : members;

  const tierColor = (t: string) => {
    switch (t) {
      case "elite": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "pro": return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "basic": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "starter": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Network</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? `${adminData.totalMembers} total members • ${adminData.activeMembers} active`
              : `${stats.total} downline members • ${stats.active} active`}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-9 h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Left Leg", value: stats.left.toString(), icon: GitBranch },
          { label: "Right Leg", value: stats.right.toString(), icon: GitBranch },
          { label: "Active Members", value: stats.active.toString(), icon: Activity },
          { label: "Total Network", value: stats.total.toString(), icon: Users },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl border border-border/40 bg-card">
            <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold font-display">{s.value}</p>
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
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs hidden md:table-cell">BV</th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No members found</td></tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.user_id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-xs">{m.full_name}</p>
                        {isAdmin && <p className="text-[10px] text-muted-foreground">{m.email}</p>}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground text-xs hidden sm:table-cell">
                        {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", m.placement_side === "left" ? "border-emerald-500/40 text-emerald-600" : "border-blue-500/40 text-blue-600")}>
                          {m.placement_side ? m.placement_side.charAt(0).toUpperCase() + m.placement_side.slice(1) : "—"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge className={cn("text-[10px] px-1.5 py-0", tierColor(m.tier))} variant="outline">
                          {m.tier.charAt(0).toUpperCase() + m.tier.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-xs hidden md:table-cell">{m.membership_bv.toLocaleString()}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={m.tier !== "free" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {m.tier !== "free" ? "Active" : "Free"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BCNetwork;
