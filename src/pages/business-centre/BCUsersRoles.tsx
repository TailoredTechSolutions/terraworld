import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, Loader2, Shield, UserPlus, Eye, Crown,
  Tractor, ShoppingCart, Truck, Star, UserCheck, Pencil, Trash2, Plus
} from "lucide-react";

const ALL_ROLES = ["admin", "admin_readonly", "farmer", "buyer", "business_buyer", "driver", "member", "affiliate"] as const;

const BCUsersRoles = () => {
  const { isAdmin, isAnyAdmin } = useUserRoles();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addRoleDialog, setAddRoleDialog] = useState<{ userId: string; name: string } | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; role: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const canManage = isAdmin || hasPermission("manage_roles");

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
      case "admin": return <Crown className="h-3.5 w-3.5" />;
      case "admin_readonly": return <Eye className="h-3.5 w-3.5" />;
      case "farmer": return <Tractor className="h-3.5 w-3.5" />;
      case "buyer": case "business_buyer": return <ShoppingCart className="h-3.5 w-3.5" />;
      case "driver": return <Truck className="h-3.5 w-3.5" />;
      case "member": case "affiliate": return <Star className="h-3.5 w-3.5" />;
      default: return <Users className="h-3.5 w-3.5" />;
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "border-amber-500/40 text-amber-600 bg-amber-500/5";
      case "admin_readonly": return "border-purple-500/40 text-purple-600 bg-purple-500/5";
      case "farmer": return "border-emerald-500/40 text-emerald-600 bg-emerald-500/5";
      case "buyer": case "business_buyer": return "border-blue-500/40 text-blue-600 bg-blue-500/5";
      case "driver": return "border-orange-500/40 text-orange-600 bg-orange-500/5";
      case "member": case "affiliate": return "border-primary/40 text-primary bg-primary/5";
      default: return "";
    }
  };

  const handleAddRole = async () => {
    if (!addRoleDialog || !selectedNewRole) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: addRoleDialog.userId,
        role: selectedNewRole as any,
      });
      if (error) throw error;
      toast({ title: "Role Added", description: `Added ${selectedNewRole} role to ${addRoleDialog.name}` });
      queryClient.invalidateQueries({ queryKey: ["bc-users"] });
      queryClient.invalidateQueries({ queryKey: ["bc-role-counts"] });
      setAddRoleDialog(null);
      setSelectedNewRole("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add role", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("user_roles")
        .delete()
        .eq("user_id", deleteConfirm.userId)
        .eq("role", deleteConfirm.role as any);
      if (error) throw error;
      toast({ title: "Role Removed", description: `Removed ${deleteConfirm.role} from ${deleteConfirm.name}` });
      queryClient.invalidateQueries({ queryKey: ["bc-users"] });
      queryClient.invalidateQueries({ queryKey: ["bc-role-counts"] });
      setDeleteConfirm(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to remove role", variant: "destructive" });
    } finally {
      setSaving(false);
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
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { role: "all", label: "All Users", count: Object.values(roleCounts).reduce((a: number, b: number) => a + b, 0), icon: Users },
          { role: "admin", label: "Admins", count: (roleCounts["admin"] || 0) + (roleCounts["admin_readonly"] || 0), icon: Crown },
          { role: "farmer", label: "Farmers", count: roleCounts["farmer"] || 0, icon: Tractor },
          { role: "buyer", label: "Buyers", count: roleCounts["buyer"] || 0, icon: ShoppingCart },
          { role: "driver", label: "Drivers", count: roleCounts["driver"] || 0, icon: Truck },
          { role: "affiliate", label: "Affiliates", count: (roleCounts["affiliate"] || 0) + (roleCounts["member"] || 0), icon: Star },
        ].map(r => (
          <button
            key={r.role}
            onClick={() => setRoleFilter(r.role)}
            className={`p-4 rounded-xl border text-center transition-all ${
              roleFilter === r.role
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/40 hover:border-primary/30"
            }`}
          >
            <r.icon className="h-5 w-5 mx-auto mb-1.5 opacity-70" />
            <p className="text-xl font-bold font-display">{r.count}</p>
            <p className="text-xs text-muted-foreground">{r.label}</p>
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
            className="pl-10 h-10"
          />
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">{filteredUsers.length} users</Badge>
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Card className="border-border/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm font-semibold">Name</TableHead>
                <TableHead className="text-sm font-semibold">Email</TableHead>
                <TableHead className="text-sm font-semibold">Roles</TableHead>
                <TableHead className="text-sm font-semibold">Phone</TableHead>
                <TableHead className="text-sm font-semibold">Joined</TableHead>
                {canManage && <TableHead className="text-sm font-semibold text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user_row => (
                <TableRow key={user_row.user_id}>
                  <TableCell className="font-medium text-sm">{user_row.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user_row.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {user_row.roles.map((r: string) => (
                        <Badge key={r} variant="outline" className={`text-xs gap-1 px-2 py-0.5 ${roleColor(r)}`}>
                          {roleIcon(r)} {r}
                          {canManage && (
                            <button
                              onClick={() => setDeleteConfirm({ userId: user_row.user_id, role: r, name: user_row.full_name || user_row.email })}
                              className="ml-0.5 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user_row.phone || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user_row.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => {
                          setAddRoleDialog({ userId: user_row.user_id, name: user_row.full_name || user_row.email });
                          setSelectedNewRole("");
                        }}
                      >
                        <Plus className="h-3 w-3" /> Add Role
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Role Dialog */}
      <Dialog open={!!addRoleDialog} onOpenChange={(o) => !o && setAddRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role to {addRoleDialog?.name}</DialogTitle>
            <DialogDescription>Select a role to assign to this user.</DialogDescription>
          </DialogHeader>
          <Select value={selectedNewRole} onValueChange={setSelectedNewRole}>
            <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
            <SelectContent>
              {ALL_ROLES.map(r => (
                <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRoleDialog(null)}>Cancel</Button>
            <Button onClick={handleAddRole} disabled={!selectedNewRole || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the <strong>{deleteConfirm?.role}</strong> role from <strong>{deleteConfirm?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Remove Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BCUsersRoles;
