import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, MapPin, Phone, Mail, Save, Upload } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Farmer = Tables<"farmers">;

interface FarmerProfilePanelProps {
  farmer: Farmer;
}

const FarmerProfilePanel = ({ farmer }: FarmerProfilePanelProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    name: farmer.name,
    owner: farmer.owner,
    phone: farmer.phone,
    location: farmer.location,
    description: farmer.description || "",
    latitude: farmer.latitude?.toString() || "",
    longitude: farmer.longitude?.toString() || "",
    image_url: farmer.image_url || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Farmer>) => {
      const { error } = await supabase
        .from("farmers")
        .update(data)
        .eq("id", farmer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-profile"] });
      toast({ title: "Profile Updated", description: "Your farm profile has been saved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/farm-profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm({ ...form, image_url: urlData.publicUrl });
    setIsUploading(false);
  };

  const handleSave = () => {
    updateMutation.mutate({
      name: form.name,
      owner: form.owner,
      phone: form.phone,
      location: form.location,
      description: form.description || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      image_url: form.image_url || null,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Farm Profile</CardTitle>
          <CardDescription>Update your farm details, location, and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Farm Image */}
          <div className="space-y-2">
            <Label>Farm Image</Label>
            <div className="flex items-center gap-4">
              {form.image_url ? (
                <img src={form.image_url} alt="Farm" className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <Button variant="outline" size="sm" asChild disabled={isUploading}>
                  <label className="cursor-pointer">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farm-name">Farm Name</Label>
              <Input id="farm-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner Name</Label>
              <Input id="owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone"><Phone className="inline h-3 w-3 mr-1" />Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email"><Mail className="inline h-3 w-3 mr-1" />Email</Label>
              <Input id="email" value={farmer.email} disabled className="opacity-60" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location"><MapPin className="inline h-3 w-3 mr-1" />Farm Location</Label>
            <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., La Trinidad, Benguet" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude (GPS)</Label>
              <Input id="lat" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="e.g., 16.4566" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude (GPS)</Label>
              <Input id="lng" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="e.g., 120.5891" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Farm Description</Label>
            <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your farm..." />
          </div>

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerProfilePanel;
