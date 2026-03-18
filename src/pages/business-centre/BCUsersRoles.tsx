import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Search, Loader2, Shield, UserPlus, Eye, Crown,
  Tractor, ShoppingCart, Truck, Star, UserCheck
} from "lucide-react";

const BCUsersRoles = () => {
  const { isAdmin, isAnyAdmin, isAdminReadonly } = useUserRoles();
  const { hasPermission } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const canManage = isAdmin || hasPermission("manage_roles");

  // Fetch all profiles with roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["bc-users", roleFilter],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, created_at, phone")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!profiles?.length) return [];

      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const roleMap = new Map<string, string[]>();
      (roles || []).forEach(r => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      return profiles.map(p => ({
        ...p,
        roles: roleMap.get(p.user_id) || [],
      })).filter(u => {
        if (roleFilter === "all") return true;
        return u.roles.includes(roleFilter);
      });
    },
    enabled: isAnyAdmin,
  });

  // Role counts
  const { data: roleCounts = {} } = useQuery({
    queryKey: ["bc-role-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      const counts: Record<string, number> = {};
      (data || []).forEach(r => {
        counts[r.role] = (counts[r.role] || 0) + 1;
      });
      return counts;
    },
    enabled: isAnyAdmin,
  });

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const roleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-3 w-3" />;
      case "admin_readonly": return <Eye className="h-3 w-3" />;
      case "farmer": return <Tractor className="h-3 w-3" />;
      case "buyer": return <ShoppingCart className="h-3 w-3" />;
      case "driver": return <Truck className="h-3 w-3" />;
      case "member": case "affiliate": return <Star className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  if (!isAnyAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-muted-foreground">You don't have permission to view this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Users & Role Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all platform users, roles, and permissions
        </p>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { role: "all", label: "All Users", count: Object.values(roleCounts).reduce((a, b) => a + b, 0) },
          { role: "admin", label: "Admins", count: (roleCounts["admin"] || 0) + (roleCounts["admin_readonly"] || 0) },
          { role: "farmer", label: "Farmers", count: roleCounts["farmer"] || 0 },
          { role: "buyer", label: "Buyers", count: roleCounts["buyer"] || 0 },
          { role: "driver", label: "Drivers", count: roleCounts["driver"] || 0 },
          { role: "affiliate", label: "Affiliates", count: (roleCounts["affiliate"] || 0) + (roleCounts["member"] || 0) },
        ].map(r => (
          <button
            key={r.role}
            onClick={() => setRoleFilter(r.role)}
            className={`p-3 rounded-xl border text-center transition-all ${
              roleFilter === r.role
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 hover:border-primary/30"
            }`}
          >
            <p className="text-lg font-bold font-display">{r.count}</p>
            <p className="text-[10px] text-muted-foreground">{r.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">{filteredUsers.length} users</Badge>
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Card className="border-border/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((r: string) => (
                        <Badge key={r} variant="outline" className="text-[10px] gap-1">
                          {roleIcon(r)} {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{user.phone || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default BCUsersRoles;
