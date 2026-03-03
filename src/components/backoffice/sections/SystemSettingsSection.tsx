import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, MapPin, Coins, DollarSign } from "lucide-react";

const PACKAGES = [
  { name: "Free", price: 0, bv: 0, matching_levels: 0, status: "active" },
  { name: "Starter", price: 500, bv: 500, matching_levels: 1, status: "active" },
  { name: "Basic", price: 1000, bv: 1000, matching_levels: 2, status: "active" },
  { name: "Pro", price: 3000, bv: 3000, matching_levels: 3, status: "active" },
  { name: "Elite", price: 5000, bv: 5000, matching_levels: 5, status: "active" },
];

const FEATURE_FLAGS = [
  { key: "kyc_enabled", label: "KYC Verification", description: "Require identity verification for transactions", enabled: true },
  { key: "token_payouts", label: "Token Payouts", description: "Enable AgriToken reward distributions", enabled: true },
  { key: "mlm_engine", label: "MLM Commission Engine", description: "Enable binary commission calculations", enabled: true },
  { key: "gcash_payments", label: "GCash Payments", description: "Accept GCash as payment method", enabled: true },
  { key: "card_payments", label: "Card Payments", description: "Accept credit/debit cards", enabled: false },
  { key: "fraud_detection", label: "Fraud Detection", description: "Automated fraud flagging system", enabled: false },
];

const SystemSettingsSection = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="packages">
        <TabsList className="h-8">
          <TabsTrigger value="packages" className="text-xs h-7">Packages & Ranks</TabsTrigger>
          <TabsTrigger value="fees" className="text-xs h-7">Fees & Tax</TabsTrigger>
          <TabsTrigger value="regions" className="text-xs h-7">Regions & Zones</TabsTrigger>
          <TabsTrigger value="features" className="text-xs h-7">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="mt-3">
          <div className="space-y-2">
            {PACKAGES.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">₱{p.price.toLocaleString()} · {p.bv} BV · {p.matching_levels} matching levels</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50 bg-card/60 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Platform Fees</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs">Global Fee (%)</label>
                  <Input defaultValue="15" className="w-20 h-7 text-xs text-right" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs">Binary Match Rate (%)</label>
                  <Input defaultValue="10" className="w-20 h-7 text-xs text-right" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs">Fail-safe Threshold (%)</label>
                  <Input defaultValue="75" className="w-20 h-7 text-xs text-right" />
                </div>
              </div>
              <Button size="sm" className="text-xs">Save Changes</Button>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-card/60 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5"><Coins className="h-4 w-4" /> Tax Config</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs">VAT Rate (%)</label>
                  <Input defaultValue="12" className="w-20 h-7 text-xs text-right" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs">Withholding Tax (%)</label>
                  <Input defaultValue="2" className="w-20 h-7 text-xs text-right" />
                </div>
              </div>
              <Button size="sm" className="text-xs">Save Changes</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="mt-3">
          <div className="p-4 rounded-lg border border-border/50 bg-card/60 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Delivery Zones</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <span>Baguio Central</span><span>0-10km · Base ₱45 + ₱5/km</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <span>La Trinidad</span><span>10-25km · Base ₱65 + ₱8/km</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                <span>Benguet Extended</span><span>25-50km · Base ₱120 + ₱12/km</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs">Manage Zones</Button>
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-3">
          <div className="space-y-2">
            {FEATURE_FLAGS.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60">
                <div>
                  <p className="text-xs font-medium">{f.label}</p>
                  <p className="text-[11px] text-muted-foreground">{f.description}</p>
                </div>
                <Switch defaultChecked={f.enabled} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsSection;
