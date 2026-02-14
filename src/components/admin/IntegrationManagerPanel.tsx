import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Shield, ExternalLink, CheckCircle2, AlertCircle, Clock, Loader2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredSecrets: string[];
  webhookEndpoint: string | null;
  docsUrl: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "google_maps",
    name: "Google Maps",
    category: "Logistics",
    description: "Address validation, distance calculation, routing, driver tracking",
    requiredSecrets: ["GOOGLE_MAPS_API_KEY"],
    webhookEndpoint: null,
    docsUrl: "https://developers.google.com/maps/documentation",
  },
  {
    id: "gcash",
    name: "GCash (PayMongo)",
    category: "Payments",
    description: "Checkout, payment confirmation, webhook validation, payout tracking",
    requiredSecrets: ["GCASH_PUBLIC_KEY", "GCASH_SECRET_KEY", "GCASH_WEBHOOK_SECRET"],
    webhookEndpoint: "/functions/v1/webhook-gcash",
    docsUrl: "https://developers.paymongo.com/docs",
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    category: "Payments",
    description: "Direct bank payouts, withdrawal processing, reconciliation",
    requiredSecrets: ["BANK_TRANSFER_API_KEY", "BANK_WEBHOOK_SECRET", "BANK_MERCHANT_ID"],
    webhookEndpoint: "/functions/v1/webhook-bank",
    docsUrl: "",
  },
  {
    id: "crypto",
    name: "Crypto / EVM Token",
    category: "Token",
    description: "AGRI token reward issuance, on-chain verification, treasury wallet",
    requiredSecrets: ["CRYPTO_RPC_URL", "CRYPTO_PRIVATE_KEY", "CRYPTO_CONTRACT_ADDRESS", "CRYPTO_CHAIN_ID"],
    webhookEndpoint: null,
    docsUrl: "",
  },
  {
    id: "grab",
    name: "Grab Delivery",
    category: "Logistics",
    description: "Order creation, status updates, delivery tracking, cost estimation",
    requiredSecrets: ["GRAB_API_KEY", "GRAB_WEBHOOK_SECRET"],
    webhookEndpoint: "/functions/v1/webhook-grab",
    docsUrl: "https://developer.grab.com",
  },
  {
    id: "lalamove",
    name: "Lalamove",
    category: "Logistics",
    description: "Order creation, driver assignment, status callback, price quotation",
    requiredSecrets: ["LALAMOVE_API_KEY", "LALAMOVE_SECRET_KEY", "LALAMOVE_WEBHOOK_SECRET"],
    webhookEndpoint: "/functions/v1/webhook-lalamove",
    docsUrl: "https://developers.lalamove.com",
  },
  {
    id: "smtp",
    name: "Email (SMTP)",
    category: "Notifications",
    description: "Transactional emails, order confirmations, payout notifications",
    requiredSecrets: ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"],
    webhookEndpoint: null,
    docsUrl: "",
  },
  {
    id: "sms",
    name: "SMS Gateway",
    category: "Notifications",
    description: "OTP delivery, order status SMS, delivery alerts",
    requiredSecrets: ["SMS_API_KEY"],
    webhookEndpoint: null,
    docsUrl: "",
  },
];

const IntegrationManagerPanel = () => {
  const { toast } = useToast();
  const [configuredSecrets, setConfiguredSecrets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const projectUrl = import.meta.env.VITE_SUPABASE_URL || "";

  useEffect(() => {
    checkConfiguredSecrets();
  }, []);

  const checkConfiguredSecrets = async () => {
    setLoading(true);
    try {
      // Check platform_settings for integration_status
      const { data } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("setting_key", "configured_integrations")
        .maybeSingle();

      if (data?.setting_value && typeof data.setting_value === "object" && !Array.isArray(data.setting_value)) {
        const val = data.setting_value as Record<string, unknown>;
        setConfiguredSecrets(
          Object.entries(val)
            .filter(([, v]) => v === true)
            .map(([k]) => k)
        );
      }
    } catch (err) {
      console.error("Error checking integrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationStatus = (integration: Integration) => {
    const allConfigured = integration.requiredSecrets.every((s) =>
      configuredSecrets.includes(s)
    );
    const someConfigured = integration.requiredSecrets.some((s) =>
      configuredSecrets.includes(s)
    );
    if (allConfigured) return "configured";
    if (someConfigured) return "partial";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "configured":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Configured
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Partial
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const markSecretConfigured = async (secretName: string) => {
    const updated = [...configuredSecrets, secretName];
    const configMap = Object.fromEntries(updated.map((s) => [s, true]));

    await supabase
      .from("platform_settings")
      .upsert({
        setting_key: "configured_integrations",
        setting_value: configMap as any,
        description: "Tracks which external integration secrets have been configured",
      }, { onConflict: "setting_key" });

    setConfiguredSecrets(updated);
    toast({ title: "Updated", description: `${secretName} marked as configured.` });
  };

  const copyWebhookUrl = (endpoint: string) => {
    const fullUrl = `${projectUrl}${endpoint}`;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: "Copied", description: "Webhook URL copied to clipboard." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">
              {INTEGRATIONS.filter((i) => getIntegrationStatus(i) === "configured").length}
            </p>
            <p className="text-sm text-muted-foreground">Configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-muted-foreground">
              {INTEGRATIONS.filter((i) => getIntegrationStatus(i) === "partial").length}
            </p>
            <p className="text-sm text-muted-foreground">Partially Set Up</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-destructive">
              {INTEGRATIONS.filter((i) => getIntegrationStatus(i) === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Table by Category */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {category}
            </CardTitle>
            <CardDescription>External service integrations for {category.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Integration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keys Needed</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INTEGRATIONS.filter((i) => i.category === category).map((integration) => {
                  const status = getIntegrationStatus(integration);
                  return (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {integration.requiredSecrets.length} secret{integration.requiredSecrets.length > 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        {integration.webhookEndpoint ? (
                          <Badge
                            variant="outline"
                            className="cursor-pointer gap-1"
                            onClick={() => copyWebhookUrl(integration.webhookEndpoint!)}
                          >
                            <Copy className="h-3 w-3" /> Copy URL
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Integration Detail Modal */}
      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedIntegration?.name} Integration</DialogTitle>
            <DialogDescription>{selectedIntegration?.description}</DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Required Secrets</p>
                <div className="space-y-2">
                  {selectedIntegration.requiredSecrets.map((secret) => {
                    const isConfigured = configuredSecrets.includes(secret);
                    return (
                      <div
                        key={secret}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          {isConfigured ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <code className="text-sm">{secret}</code>
                        </div>
                        {!isConfigured && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markSecretConfigured(secret)}
                          >
                            Mark Configured
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedIntegration.webhookEndpoint && (
                <div>
                  <p className="text-sm font-medium mb-2">Webhook Endpoint</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                    <code className="text-xs flex-1 break-all">
                      {projectUrl}{selectedIntegration.webhookEndpoint}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyWebhookUrl(selectedIntegration.webhookEndpoint!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure this URL in your {selectedIntegration.name} dashboard as the webhook callback.
                  </p>
                </div>
              )}

              {selectedIntegration.docsUrl && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={selectedIntegration.docsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> View Documentation
                  </a>
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                Secrets are stored securely as backend environment variables and are never exposed to the frontend.
                Add them via Lovable Cloud → Settings → Secrets.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationManagerPanel;
