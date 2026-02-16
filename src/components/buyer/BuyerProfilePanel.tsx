import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
  Save,
  Building2,
  Shield,
  KeyRound,
} from "lucide-react";

interface BuyerAddress {
  id: string;
  label: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const BuyerProfilePanel = ({ userId }: { userId: string }) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    business_name: "",
    tax_id: "",
  });
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BuyerAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    is_default: false,
  });

  // Fetch profile with business fields
  const { data: fullProfile } = useQuery({
    queryKey: ["buyer-full-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  // Fetch addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["buyer-addresses", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("buyer_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });
      return (data || []) as BuyerAddress[];
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates: Record<string, string | null>) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["buyer-full-profile"] });
      toast({ title: "Profile Updated" });
      setIsEditing(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Save/update address mutation
  const saveAddress = useMutation({
    mutationFn: async (address: typeof addressForm & { id?: string }) => {
      if (address.is_default) {
        // Unset other defaults
        await supabase
          .from("buyer_addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }

      if (editingAddress) {
        const { error } = await supabase
          .from("buyer_addresses")
          .update({ ...address, user_id: userId })
          .eq("id", editingAddress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("buyer_addresses")
          .insert({ ...address, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-addresses"] });
      toast({ title: editingAddress ? "Address Updated" : "Address Added" });
      setAddressDialogOpen(false);
      setEditingAddress(null);
      resetAddressForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Delete address
  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buyer_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer-addresses"] });
      toast({ title: "Address Removed" });
    },
  });

  const resetAddressForm = () => {
    setAddressForm({
      label: "Home",
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state_province: "",
      postal_code: "",
      is_default: false,
    });
  };

  const openEditAddress = (addr: BuyerAddress) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state_province: addr.state_province || "",
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setAddressDialogOpen(true);
  };

  const openNewAddress = () => {
    setEditingAddress(null);
    resetAddressForm();
    setAddressDialogOpen(true);
  };

  const startEditing = () => {
    setEditForm({
      full_name: fullProfile?.full_name || "",
      phone: fullProfile?.phone || "",
      business_name: (fullProfile as any)?.business_name || "",
      tax_id: (fullProfile as any)?.tax_id || "",
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Business Name <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                    placeholder="If you're a merchant"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    value={editForm.tax_id}
                    onChange={(e) => setEditForm({ ...editForm, tax_id: e.target.value })}
                    placeholder="TIN"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button
                  onClick={() =>
                    updateProfile.mutate({
                      full_name: editForm.full_name || null,
                      phone: editForm.phone || null,
                      business_name: editForm.business_name || null,
                      tax_id: editForm.tax_id || null,
                    })
                  }
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name</p>
                <p className="font-medium">{fullProfile?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{fullProfile?.email || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{fullProfile?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Referral Code</p>
                <p className="font-medium font-mono">{fullProfile?.referral_code || "—"}</p>
              </div>
              {(fullProfile as any)?.business_name && (
                <div>
                  <p className="text-muted-foreground">Business Name</p>
                  <p className="font-medium">{(fullProfile as any).business_name}</p>
                </div>
              )}
              {(fullProfile as any)?.tax_id && (
                <div>
                  <p className="text-muted-foreground">Tax ID</p>
                  <p className="font-medium">{(fullProfile as any).tax_id}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Addresses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Delivery Addresses
          </CardTitle>
          <Button size="sm" onClick={openNewAddress}>
            <Plus className="h-3 w-3 mr-1" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {addressesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !addresses?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No delivery addresses saved. Add one to speed up checkout.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start justify-between p-3 rounded-lg border border-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{addr.label}</p>
                      {addr.is_default && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Star className="h-2.5 w-2.5" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}
                      {addr.state_province ? `, ${addr.state_province}` : ""} {addr.postal_code}
                    </p>
                    {addr.phone && (
                      <p className="text-xs text-muted-foreground">{addr.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAddress(addr)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteAddress.mutate(addr.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <SecuritySettingsCard />
    </div>
  );
};

const SecuritySettingsCard = () => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <KeyRound className="h-3 w-3" />
              New Password
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
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
  );
};

export default BuyerProfilePanel;
