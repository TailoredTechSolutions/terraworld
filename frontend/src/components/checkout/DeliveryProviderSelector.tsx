import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useMapProvider } from "@/hooks/useMapProvider";

interface DeliveryEstimate {
  provider: string;
  estimated_fee: number;
  estimated_eta_minutes: number;
  distance_km: number;
  status: string;
}

interface DeliveryProviderSelectorProps {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  onProviderSelect: (provider: string, estimate: DeliveryEstimate) => void;
  selectedProvider?: string;
}

const DeliveryProviderSelector = ({
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  onProviderSelect,
  selectedProvider,
}: DeliveryProviderSelectorProps) => {
  const [lalamoveEstimate, setLalamoveEstimate] = useState<DeliveryEstimate | null>(null);
  const [grabEstimate, setGrabEstimate] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { provider: mapProvider } = useMapProvider();

  useEffect(() => {
    if (pickupLat && pickupLng && deliveryLat && deliveryLng) {
      fetchEstimates();
    }
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng]);

  const fetchEstimates = async () => {
    setLoading(true);
    setError(null);

    try {
      const [lalamoveRes, grabRes] = await Promise.all([
        supabase.functions.invoke("delivery-estimate", {
          body: {
            provider: "lalamove",
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            delivery_lat: deliveryLat,
            delivery_lng: deliveryLng,
          },
        }),
        supabase.functions.invoke("delivery-estimate", {
          body: {
            provider: "grab",
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
            delivery_lat: deliveryLat,
            delivery_lng: deliveryLng,
          },
        }),
      ]);

      if (lalamoveRes.data?.success) setLalamoveEstimate(lalamoveRes.data.estimate);
      if (grabRes.data?.success) setGrabEstimate(grabRes.data.estimate);
    } catch (err) {
      setError("Failed to fetch delivery estimates");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (provider: string) => {
    const estimate = provider === "lalamove" ? lalamoveEstimate : grabEstimate;
    if (estimate) {
      onProviderSelect(provider, estimate);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Delivery Service
        </h2>
        <div className="flex items-center justify-center py-8 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Fetching delivery estimates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Delivery Service
        </h2>
        <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-xl">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchEstimates} className="ml-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Choose Delivery Service
        </h2>
        <Badge variant="outline" className="text-xs">
          <MapPin className="h-3 w-3 mr-1" />
          {mapProvider === "apple" ? "Apple Maps" : "Google Maps"}
        </Badge>
      </div>

      <RadioGroup
        value={selectedProvider || ""}
        onValueChange={handleSelect}
        className="space-y-3"
      >
        {/* Lalamove */}
        {lalamoveEstimate && (
          <label
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover ${
              selectedProvider === "lalamove"
                ? "border-2 border-primary bg-primary/10 shadow-glow-primary"
                : "border border-glass-border glass-card"
            }`}
          >
            <RadioGroupItem value="lalamove" id="lalamove" />
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Truck className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Lalamove</p>
                <Badge variant="secondary" className="text-xs">
                  {lalamoveEstimate.distance_km} km
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{lalamoveEstimate.estimated_eta_minutes} min
                </span>
                <span>Motorcycle</span>
              </div>
            </div>
            <p className="font-bold text-lg">₱{lalamoveEstimate.estimated_fee}</p>
          </label>
        )}

        {/* Grab */}
        {grabEstimate && (
          <label
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all glass-hover ${
              selectedProvider === "grab"
                ? "border-2 border-primary bg-primary/10 shadow-glow-primary"
                : "border border-glass-border glass-card"
            }`}
          >
            <RadioGroupItem value="grab" id="grab" />
            <div className="p-2 rounded-lg bg-green-500/10">
              <Truck className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Grab</p>
                <Badge variant="secondary" className="text-xs">
                  {grabEstimate.distance_km} km
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{grabEstimate.estimated_eta_minutes} min
                </span>
                <span>Instant</span>
              </div>
            </div>
            <p className="font-bold text-lg">₱{grabEstimate.estimated_fee}</p>
          </label>
        )}
      </RadioGroup>

      {!lalamoveEstimate && !grabEstimate && !loading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Enter your delivery address to see available providers and fees.
        </p>
      )}
    </div>
  );
};

export default DeliveryProviderSelector;
