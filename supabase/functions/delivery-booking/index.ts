import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      return await handleCreateBooking(supabase, body, user.id);
    } else if (action === "cancel") {
      return await handleCancelBooking(supabase, body, user.id);
    } else if (action === "status") {
      return await handleGetStatus(supabase, body);
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("[delivery-booking] error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCreateBooking(supabase: any, body: any, userId: string) {
  const {
    order_id,
    provider_type,
    estimated_fee,
    estimated_eta_minutes,
    pickup_address,
    pickup_latitude,
    pickup_longitude,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    distance_km,
  } = body;

  if (!order_id || !provider_type) {
    return new Response(JSON.stringify({ error: "Missing order_id or provider_type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check for active booking (double booking prevention)
  const { data: existingBookings } = await supabase
    .from("delivery_bookings")
    .select("id, booking_status")
    .eq("order_id", order_id)
    .in("booking_status", ["pending", "confirmed", "in_transit"]);

  if (existingBookings && existingBookings.length > 0) {
    return new Response(
      JSON.stringify({
        error: "Active delivery booking already exists. Cancel before switching provider.",
        existing_status: existingBookings[0].booking_status,
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Mock external booking ID
  const externalId = `${provider_type.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("delivery_bookings")
    .insert({
      order_id,
      provider_type,
      external_booking_id: externalId,
      booking_status: "pending",
      estimated_fee: estimated_fee || 0,
      estimated_eta_minutes: estimated_eta_minutes || 45,
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      delivery_address,
      delivery_latitude,
      delivery_longitude,
      distance_km,
      provider_response: { mock: true, created_at: new Date().toISOString() },
    })
    .select()
    .single();

  if (bookingError) {
    // Could be unique constraint violation
    if (bookingError.message?.includes("idx_one_active_booking_per_order")) {
      return new Response(
        JSON.stringify({ error: "Active delivery booking already exists (DB constraint)." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    throw bookingError;
  }

  // Update order delivery status
  await supabase
    .from("orders")
    .update({
      delivery_booking_status: "pending",
      delivery_provider: provider_type,
      delivery_fee: estimated_fee || 0,
    })
    .eq("id", order_id);

  return new Response(
    JSON.stringify({ success: true, booking }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleCancelBooking(supabase: any, body: any, userId: string) {
  const { booking_id, order_id, reason } = body;

  if (!booking_id && !order_id) {
    return new Response(JSON.stringify({ error: "Missing booking_id or order_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Find the active booking
  let query = supabase
    .from("delivery_bookings")
    .select("*")
    .in("booking_status", ["pending", "confirmed", "in_transit"]);

  if (booking_id) {
    query = query.eq("id", booking_id);
  } else {
    query = query.eq("order_id", order_id);
  }

  const { data: bookings, error: findError } = await query;
  if (findError) throw findError;

  if (!bookings || bookings.length === 0) {
    return new Response(JSON.stringify({ error: "No active booking found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const activeBooking = bookings[0];

  // Mock: call provider cancellation API
  // In production: call Lalamove/Grab cancel endpoint

  // Update booking status
  const { error: updateError } = await supabase
    .from("delivery_bookings")
    .update({
      booking_status: "cancelled",
      cancellation_reason: reason || "User cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", activeBooking.id);

  if (updateError) throw updateError;

  // Update order status
  const targetOrderId = activeBooking.order_id;
  await supabase
    .from("orders")
    .update({
      delivery_booking_status: "cancelled",
      delivery_provider: null,
    })
    .eq("id", targetOrderId);

  return new Response(
    JSON.stringify({
      success: true,
      message: "Booking cancelled successfully",
      cancelled_booking_id: activeBooking.id,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleGetStatus(supabase: any, body: any) {
  const { order_id } = body;

  if (!order_id) {
    return new Response(JSON.stringify({ error: "Missing order_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: bookings, error } = await supabase
    .from("delivery_bookings")
    .select("*")
    .eq("order_id", order_id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const activeBooking = bookings?.find((b: any) =>
    ["pending", "confirmed", "in_transit"].includes(b.booking_status)
  );

  return new Response(
    JSON.stringify({
      success: true,
      active_booking: activeBooking || null,
      all_bookings: bookings || [],
      has_active: !!activeBooking,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
