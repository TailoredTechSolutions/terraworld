import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Eye, Tractor, MapPin, Star, Package } from "lucide-react";

interface AdminDashboardWrapperProps {
  roleFilter: string;
  title: string;
  description: string;
  children: (selectedUserId: string, selectedUserEmail: string) => React.ReactNode;
}

/**
 * Wraps a role dashboard to give admins a user-list view.
 * When admin hasn't selected a user, shows a searchable list.
 * When admin selects a user, renders the dashboard for that user.
 */
const AdminDashboardWrapper = ({ roleFilter, title, description, children }: AdminDashboardWrapperProps) => {
  const { isAnyAdmin } = useUserRoles();
  const [selectedUser, setSelectedUser] = useState<{ userId: string; email: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all users with the given role
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-role-users", roleFilter],
    queryFn: async () => {
      // Get user_ids with this role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", roleFilter);
      if (roleError) throw roleError;
      if (!roleData?.length) return [];

      const userIds = roleData.map(r => r.user_id);

      // Fetch profiles for those users
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone, created_at")
        .in("user_id", userIds);
      if (profileError) throw profileError;

      return profiles || [];
    },
    enabled: isAnyAdmin,
  });

  if (!isAnyAdmin) return null;

  if (selectedUser) {
    return (
      <div>
        <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Eye className="h-3 w-3 mr-1" />
            Admin View
          </Badge>
          <span className="text-sm text-muted-foreground">
            Viewing as: <strong>{selectedUser.name || selectedUser.email}</strong>
          </span>
          <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)} className="ml-auto">
            ← Back to {title}
          </Button>
        </div>
        {children(selectedUser.userId, selectedUser.email)}
      </div>
    );
  }

  const filtered = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-display">{title}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>

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
            <Badge variant="secondary">{users.length} total</Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchQuery ? "No matching users found." : `No ${roleFilter}s registered yet.`}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(u => (
                    <TableRow key={u.user_id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser({ userId: u.user_id, email: u.email, name: u.full_name || "" })}>
                      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone || "—"}</TableCell>
                      <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> View Dashboard
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardWrapper;
