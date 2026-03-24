const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

function isValidLat(v: unknown): v is number {
  return typeof v === "number" && isFinite(v) && v >= -90 && v <= 90;
}

function isValidLng(v: unknown): v is number {
  return typeof v === "number" && isFinite(v) && v >= -180 && v <= 180;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { provider, pickup_lat, pickup_lng, delivery_lat, delivery_lng } = body;

    // Validate provider
    if (typeof provider !== "string" || !["lalamove", "grab"].includes(provider)) {
      return new Response(
        JSON.stringify({ error: "Invalid provider. Use 'lalamove' or 'grab'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate coordinates with bounds checking
    if (!isValidLat(pickup_lat) || !isValidLng(pickup_lng) ||
        !isValidLat(delivery_lat) || !isValidLng(delivery_lng)) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Philippines bounding box check (rough: 4-22°N, 116-127°E)
    const inPhilippines = (lat: number, lng: number) =>
      lat >= 4 && lat <= 22 && lng >= 116 && lng <= 127;

    if (!inPhilippines(pickup_lat, pickup_lng) || !inPhilippines(delivery_lat, delivery_lng)) {
      return new Response(
        JSON.stringify({ error: "Coordinates must be within the Philippines service area." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const distanceKm = haversineDistance(pickup_lat, pickup_lng, delivery_lat, delivery_lng);

    // Reject unreasonable distances (>500km)
    if (distanceKm > 500) {
      return new Response(
        JSON.stringify({ error: "Distance exceeds maximum delivery range." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
