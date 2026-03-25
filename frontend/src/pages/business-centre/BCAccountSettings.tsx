import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, KeyRound, Loader2, Save, Link2 } from "lucide-react";
import DeleteAccountSection from "@/components/DeleteAccountSection";

const BCAccountSettings = () => {
  const { profile, refreshProfile, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name || null,
          phone: form.phone || null,
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      
      await refreshProfile();
      toast({ title: "Profile Updated" });
      setIsEditing(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 12) {
      toast({ title: "Password too short", description: "Minimum 12 characters required.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password Updated", description: "Your password has been changed." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // Determine role for delete account
  const userRole = profile?.role || "affiliate";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and account security
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Full Name</p>
                <p className="font-medium">{profile?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                <p className="font-medium">{profile?.email || user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                <p className="font-medium">{profile?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1"><Link2 className="h-3 w-3" /> Referral Code</p>
                <p className="font-medium font-mono">{profile?.referral_code || "—"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password. Must be at least 12 characters with uppercase, lowercase, number, and symbol.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 12 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            size="sm"
          >
            {changingPassword && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <DeleteAccountSection userRole={userRole} />
    </div>
  );
};

export default BCAccountSettings;
