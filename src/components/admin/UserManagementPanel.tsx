import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Shield, 
  Truck, 
  Crown, 
  Sprout, 
  Building2,
  Loader2,
  UserCog,
  RefreshCw
} from "lucide-react";

type AppRole = 'farmer' | 'business_buyer' | 'member' | 'driver' | 'admin' | 'buyer' | 'affiliate';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  referral_code: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

interface UserWithRoles extends UserProfile {
  roles: AppRole[];
}

const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  admin: { label: "Admin", icon: Shield, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  driver: { label: "Driver", icon: Truck, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  farmer: { label: "Farmer", icon: Sprout, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  member: { label: "Member", icon: Crown, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  business_buyer: { label: "Business", icon: Building2, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  buyer: { label: "Buyer", icon: Users, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
};

const ALL_ROLES: AppRole[] = ['admin', 'driver', 'farmer', 'member', 'business_buyer', 'buyer'];

const UserManagementPanel = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [editingRoles, setEditingRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        ...profile,
        roles: (roles || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRoles = (user: UserWithRoles) => {
    setSelectedUser(user);
    setEditingRoles([...user.roles]);
  };

  const handleRoleToggle = (role: AppRole) => {
    setEditingRoles(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const currentRoles = selectedUser.roles;
      const rolesToAdd = editingRoles.filter(r => !currentRoles.includes(r));
      const rolesToRemove = currentRoles.filter(r => !editingRoles.includes(r));

      // Remove roles
      for (const role of rolesToRemove) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.user_id)
          .eq('role', role);

        if (error) throw error;
      }

      // Add roles
      for (const role of rolesToAdd) {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.user_id,
            role: role,
          });

        if (error) throw error;
      }

      toast({
        title: "Roles updated",
        description: `Successfully updated roles for ${selectedUser.full_name || selectedUser.email}`,
      });

      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating roles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update roles",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.full_name?.toLowerCase().includes(query)) ||
      user.referral_code.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                View and manage user roles across the platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {ALL_ROLES.map(role => {
              const config = ROLE_CONFIG[role];
              const count = users.filter(u => u.roles.includes(role)).length;
              return (
                <div key={role} className={`p-3 rounded-lg ${config.color}`}>
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || "Unnamed"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {user.referral_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No roles</span>
                          ) : (
                            user.roles.map(role => {
                              const config = ROLE_CONFIG[role as AppRole];
                              if (!config) return (
                                <Badge key={role} variant="secondary" className="gap-1">
                                  {role}
                                </Badge>
                              );
                              return (
                                <Badge key={role} variant="secondary" className={`gap-1 ${config.color}`}>
                                  <config.icon className="h-3 w-3" />
                                  {config.label}
                                </Badge>
                              );
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRoles(user)}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Edit Roles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </CardContent>
      </Card>

      {/* Edit Roles Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              Manage roles for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {ALL_ROLES.map(role => {
              const config = ROLE_CONFIG[role];
              const isChecked = editingRoles.includes(role);
              return (
                <div key={role} className="flex items-center space-x-3">
                  <Checkbox
                    id={`role-${role}`}
                    checked={isChecked}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <Label
                    htmlFor={`role-${role}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className={`p-1.5 rounded ${config.color}`}>
                      <config.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {role === 'admin' && "Full access to all features and admin panel"}
                        {role === 'driver' && "Access to driver dashboard and deliveries"}
                        {role === 'farmer' && "Can manage farm products and orders"}
                        {role === 'member' && "Standard member with affiliate features"}
                        {role === 'business_buyer' && "Business account for bulk purchases"}
                      </p>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserManagementPanel;
