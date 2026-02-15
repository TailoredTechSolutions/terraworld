import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock delivery estimates for Lalamove and Grab
function getMockEstimate(provider: string, distanceKm: number) {
  if (provider === "lalamove") {
    const baseFee = 60;
    const perKm = 12;
    const fee = baseFee + distanceKm * perKm;
    const etaMinutes = Math.round(15 + (distanceKm / 20) * 60);
    return {
      provider: "lalamove",
      estimated_fee: Math.round(Math.min(fee, 350)),
      estimated_eta_minutes: etaMinutes,
      currency: "PHP",
      service_type: "MOTORCYCLE",
      status: "available",
    };
  } else {
    // Grab
    const baseFee = 55;
    const perKm = 10;
    const fee = baseFee + distanceKm * perKm;
    const etaMinutes = Math.round(20 + (distanceKm / 18) * 60);
    return {
      provider: "grab",
      estimated_fee: Math.round(Math.min(fee, 300)),
      estimated_eta_minutes: etaMinutes,
      currency: "PHP",
      service_type: "INSTANT",
      status: "available",
    };
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, pickup_lat, pickup_lng, delivery_lat, delivery_lng } = await req.json();

    if (!provider || !["lalamove", "grab"].includes(provider)) {
      return new Response(JSON.stringify({ error: "Invalid provider. Use 'lalamove' or 'grab'." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pickup_lat || !pickup_lng || !delivery_lat || !delivery_lng) {
      return new Response(JSON.stringify({ error: "Missing coordinates." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const distanceKm = haversineDistance(pickup_lat, pickup_lng, delivery_lat, delivery_lng);
    const estimate = getMockEstimate(provider, distanceKm);

    return new Response(
      JSON.stringify({
        success: true,
        estimate: {
          ...estimate,
          distance_km: Math.round(distanceKm * 10) / 10,
          pickup: { lat: pickup_lat, lng: pickup_lng },
          delivery: { lat: delivery_lat, lng: delivery_lng },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
