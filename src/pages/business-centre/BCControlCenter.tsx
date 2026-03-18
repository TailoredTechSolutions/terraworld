import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePermissions } from "@/hooks/usePermissions";
import { useSystemToggles } from "@/hooks/useSystemToggles";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, Users, Settings, Zap, Search, Loader2, UserPlus,
  Check, X, Crown, Eye, Lock, ToggleLeft, Key
} from "lucide-react";

type AdminUser = {
  user_id: string;
  full_name: string | null;
  email: string;
  roles: string[];
  created_at: string;
};

const BCControlCenter = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const { allPermissions } = usePermissions();
  const { toggles, updateToggle, isLoading: togglesLoading } = useSystemToggles();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch all admin/admin_readonly users with their roles
  const { data: adminUsers = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["control-center-admins"],
    queryFn: async () => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "admin_readonly"]);

      if (!roleData?.length) return [];

      const userIds = [...new Set(roleData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, created_at")
        .in("user_id", userIds);

      return (profiles || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        created_at: p.created_at,
        roles: roleData.filter(r => r.user_id === p.user_id).map(r => r.role),
      })) as AdminUser[];
    },
    enabled: isAdmin,
  });

  // Fetch permissions for selected admin
  const { data: adminPermissions = [], isLoading: permLoading } = useQuery({
    queryKey: ["admin-permissions", selectedAdmin?.user_id],
    queryFn: async () => {
      if (!selectedAdmin) return [];
      const { data } = await supabase
        .from("role_permissions")
        .select("permission_key")
        .eq("user_id", selectedAdmin.user_id);
      return (data || []).map(p => p.permission_key);
    },
    enabled: !!selectedAdmin,
  });

  // When admin is selected, sync checkboxes
  const handleSelectAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setSelectedPermissions([]);
  };

  // Save permissions
  const savePermissions = useMutation({
    mutationFn: async () => {
      if (!selectedAdmin) return;
      // Delete existing
      await supabase
        .from("role_permissions")
        .delete()
        .eq("user_id", selectedAdmin.user_id);
      // Insert new
      if (selectedPermissions.length > 0) {
        const inserts = selectedPermissions.map(pk => ({
          user_id: selectedAdmin.user_id,
          permission_key: pk,
          granted_by: user?.id,
        }));
        const { error } = await supabase.from("role_permissions").insert(inserts);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Permissions updated", description: `Permissions saved for ${selectedAdmin?.full_name || selectedAdmin?.email}` });
      queryClient.invalidateQueries({ queryKey: ["admin-permissions", selectedAdmin?.user_id] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Sync selectedPermissions when adminPermissions loads
  if (adminPermissions.length > 0 && selectedPermissions.length === 0 && !permLoading) {
    setSelectedPermissions(adminPermissions);
  }

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce<Record<string, typeof allPermissions>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  const filteredAdmins = adminUsers.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.full_name?.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
  });

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-muted-foreground">Only Super Admins can access the Control Center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin accounts, assign permissions, and control system features
        </p>
      </div>

      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admins" className="gap-1.5">
            <Users className="h-4 w-4" /> Admin Management
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5">
            <Key className="h-4 w-4" /> Permission Assignment
          </TabsTrigger>
          <TabsTrigger value="toggles" className="gap-1.5">
            <ToggleLeft className="h-4 w-4" /> System Toggles
          </TabsTrigger>
        </TabsList>

        {/* Admin Management Tab */}
        <TabsContent value="admins" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{adminUsers.length} admins</Badge>
          </div>

          {adminsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map(admin => (
                    <TableRow key={admin.user_id}>
                      <TableCell className="font-medium">{admin.full_name || "—"}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {admin.roles.map(r => (
                            <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="text-xs">
                              {r === "admin" ? "Super Admin" : "Read-Only"}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleSelectAdmin(admin)}>
                          <Key className="h-3 w-3 mr-1" /> Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Permission Assignment Tab */}
        <TabsContent value="permissions" className="space-y-4">
          {!selectedAdmin ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Key className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Select an admin from the Admin Management tab to assign permissions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Permissions for {selectedAdmin.full_name || selectedAdmin.email}
                      </CardTitle>
                      <CardDescription>{selectedAdmin.email}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedAdmin(null); setSelectedPermissions([]); }}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => savePermissions.mutate()} disabled={savePermissions.isPending}>
                        {savePermissions.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                        Save Permissions
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {permLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {perms.map(perm => (
                          <div key={perm.key} className="flex items-center gap-2">
                            <Checkbox
                              id={perm.key}
                              checked={selectedPermissions.includes(perm.key)}
                              onCheckedChange={() => togglePermission(perm.key)}
                            />
                            <Label htmlFor={perm.key} className="text-sm cursor-pointer">{perm.label}</Label>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* System Toggles Tab */}
        <TabsContent value="toggles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features globally. Changes take effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {togglesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  {toggles.map(toggle => (
                    <div key={toggle.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">{toggle.label}</Label>
                        <p className="text-xs text-muted-foreground">{toggle.description}</p>
                      </div>
                      <Switch
                        checked={toggle.is_enabled}
                        onCheckedChange={(checked) => updateToggle.mutate({ featureKey: toggle.feature_key, isEnabled: checked })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BCControlCenter;
