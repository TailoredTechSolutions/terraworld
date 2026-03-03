import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Settings, Save, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
}

interface DeliveryZone {
  id: string;
  zone_name: string;
  base_fee: number;
  per_km_rate: number;
  min_distance_km: number;
  max_distance_km: number;
  is_active: boolean;
}

const SETTING_LABELS: Record<string, { label: string; suffix: string }> = {
  terra_fee_percent: { label: "Terra Service Fee", suffix: "%" },
  tax_rate_percent: { label: "Tax/VAT Rate", suffix: "%" },
  compensation_pool_percent: { label: "Compensation Pool", suffix: "% of Terra Fee" },
  min_withdrawal: { label: "Min Withdrawal", suffix: "₱" },
  max_daily_withdrawal: { label: "Max Daily Withdrawal", suffix: "₱" },
  withdrawal_fee_percent: { label: "Withdrawal Fee", suffix: "%" },
  bv_expiry_days: { label: "BV Expiry Period", suffix: "days" },
  token_market_price: { label: "AGRI Token Price", suffix: "₱" },
};

const PlatformSettingsPanel = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [settingsRes, zonesRes] = await Promise.all([
      supabase.from("platform_settings").select("*").order("setting_key"),
      supabase.from("delivery_zones").select("*").order("min_distance_km"),
    ]);
    setSettings(settingsRes.data || []);
    setZones((zonesRes.data || []) as DeliveryZone[]);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(editedValues)) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) continue;
        await supabase
          .from("platform_settings")
          .update({ setting_value: numValue })
          .eq("setting_key", key);
      }
      toast({ title: "Settings Saved", description: "Platform settings updated successfully." });
      setEditedValues({});
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateZone = async (id: string, field: string, value: any) => {
    await supabase.from("delivery_zones").update({ [field]: value }).eq("id", id);
    fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Platform Settings</CardTitle>
              <CardDescription>Configure pricing, fees, and system parameters</CardDescription>
            </div>
            {Object.keys(editedValues).length > 0 && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.map((setting) => {
              const config = SETTING_LABELS[setting.setting_key];
              if (!config) return null;
              const currentValue = editedValues[setting.setting_key] ?? String(setting.setting_value);
              return (
                <div key={setting.id} className="space-y-2 p-4 rounded-lg border">
                  <Label>{config.label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentValue}
                      onChange={(e) => setEditedValues({ ...editedValues, [setting.setting_key]: e.target.value })}
                      className="flex-1"
                    />
                    <Badge variant="outline">{config.suffix}</Badge>
                  </div>
                  {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Delivery Zones</CardTitle>
          <CardDescription>Configure zone-based delivery fees</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Base Fee (₱)</TableHead>
                <TableHead>Per KM Rate (₱)</TableHead>
                <TableHead>Min Distance</TableHead>
                <TableHead>Max Distance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.zone_name}</TableCell>
                  <TableCell>₱{Number(zone.base_fee).toLocaleString()}</TableCell>
                  <TableCell>₱{Number(zone.per_km_rate)}/km</TableCell>
                  <TableCell>{Number(zone.min_distance_km)} km</TableCell>
                  <TableCell>{Number(zone.max_distance_km)} km</TableCell>
                  <TableCell>
                    <Badge variant={zone.is_active ? "default" : "secondary"} className="cursor-pointer"
                      onClick={() => updateZone(zone.id, "is_active", !zone.is_active)}>
                      {zone.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
};

export default PlatformSettingsPanel;
