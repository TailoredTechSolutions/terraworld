import { useState } from "react";
import {
  ArrowUpCircle,
  Crown,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MemberUpgradePanelProps {
  membership: {
    tier: string;
    package_price: number;
  } | null;
}

interface Package {
  id: string;
  name: string;
  price: number;
  bv: number;
  binaryEligible: boolean;
  matchingLevels: number;
  dailyCap: number;
  features: string[];
  popular?: boolean;
}

const PACKAGES: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1500,
    bv: 500,
    binaryEligible: true,
    matchingLevels: 3,
    dailyCap: 5000,
    features: [
      'Binary commission eligible',
      '3 levels matching bonus',
      '₱5,000 daily binary cap',
      'Basic member support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 5000,
    bv: 2000,
    binaryEligible: true,
    matchingLevels: 5,
    dailyCap: 15000,
    features: [
      'Binary commission eligible',
      '5 levels matching bonus',
      '₱15,000 daily binary cap',
      'Priority member support',
      'Product discounts',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    bv: 6000,
    binaryEligible: true,
    matchingLevels: 7,
    dailyCap: 50000,
    features: [
      'Binary commission eligible',
      '7 levels matching bonus',
      '₱50,000 daily binary cap',
      'VIP member support',
      'Exclusive product access',
      'Leadership bonuses',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 50000,
    bv: 20000,
    binaryEligible: true,
    matchingLevels: 10,
    dailyCap: 250000,
    features: [
      'Binary commission eligible',
      '10 levels matching bonus',
      '₱250,000 daily binary cap',
      'Dedicated account manager',
      'All product access',
      'Leadership bonuses',
      'Global pool sharing',
      'Incentive trip eligibility',
    ],
  },
];

const TIER_ORDER = ['free', 'starter', 'basic', 'pro', 'elite'];

const MemberUpgradePanel = ({ membership }: MemberUpgradePanelProps) => {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentTier = membership?.tier || 'free';
  const currentTierIndex = TIER_ORDER.indexOf(currentTier);

  const handleUpgrade = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };

  const confirmUpgrade = () => {
    toast({
      title: "Upgrade Request Submitted",
      description: `Your upgrade to ${selectedPackage?.name} package is being processed.`,
    });
    setIsDialogOpen(false);
  };

  const canUpgrade = (pkgId: string) => {
    const pkgIndex = TIER_ORDER.indexOf(pkgId);
    return pkgIndex > currentTierIndex;
  };

  const isCurrentPackage = (pkgId: string) => pkgId === currentTier;

  return (
    <div className="space-y-6">
      {/* Current Package Status */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Package</p>
                <p className="text-2xl font-bold capitalize">{currentTier}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Package Value</p>
              <p className="text-2xl font-bold">₱{(membership?.package_price || 0).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Packages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Packages</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACKAGES.map((pkg) => {
            const isCurrent = isCurrentPackage(pkg.id);
            const available = canUpgrade(pkg.id);

            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden ${
                  isCurrent
                    ? 'border-primary border-2'
                    : pkg.popular
                    ? 'border-accent border-2'
                    : ''
                } ${!available && !isCurrent ? 'opacity-60' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                    Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                    Current
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₱{pkg.price.toLocaleString()}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground text-xs">Included BV</p>
                      <p className="font-bold">{pkg.bv.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground text-xs">Daily Cap</p>
                      <p className="font-bold">₱{pkg.dailyCap.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Binary: {pkg.binaryEligible ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Matching: {pkg.matchingLevels} Levels</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5">
                    {pkg.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    {pkg.features.length > 4 && (
                      <p className="text-xs text-muted-foreground pl-5">
                        +{pkg.features.length - 4} more benefits
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : available ? (
                    <Button className="w-full" onClick={() => handleUpgrade(pkg)}>
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Not Available
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Package Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Package Comparison
          </CardTitle>
          <CardDescription>Compare benefits across all packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Feature</th>
                  {PACKAGES.map((pkg) => (
                    <th key={pkg.id} className="text-center py-3 px-2">
                      <span className={pkg.id === currentTier ? 'text-primary font-bold' : ''}>
                        {pkg.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">Price</td>
                  {PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-2 font-medium">
                      ₱{pkg.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">Included BV</td>
                  {PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-2">
                      {pkg.bv.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">Matching Levels</td>
                  {PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-2">
                      {pkg.matchingLevels}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 text-muted-foreground">Daily Binary Cap</td>
                  {PACKAGES.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-2">
                      ₱{pkg.dailyCap.toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Package Upgrade</DialogTitle>
            <DialogDescription>
              You are about to upgrade to the {selectedPackage?.name} package.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package</span>
              <span className="font-bold">{selectedPackage?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold">₱{selectedPackage?.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BV Credit</span>
              <span className="font-bold">{selectedPackage?.bv.toLocaleString()} BV</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p>This upgrade will be processed after payment confirmation. Your new benefits will be activated immediately.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpgrade}>
              <Zap className="h-4 w-4 mr-2" />
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberUpgradePanel;
