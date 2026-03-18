import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GRAB_WEBHOOK_SECRET = Deno.env.get("GRAB_WEBHOOK_SECRET");
    if (!GRAB_WEBHOOK_SECRET) {
      console.error("GRAB_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("x-grab-signature") || "";
    const body = await req.text();

    // Signature validation
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(GRAB_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!signature || signature !== expectedSignature) {
      console.error("Grab webhook signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(body);
    console.log("Grab webhook received:", JSON.stringify(payload).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log event
    await supabase.from("audit_log").insert({
      entity_type: "delivery",
      action: "grab_webhook",
      entity_id: payload?.delivery_id || null,
      details: { event_type: payload?.status || "unknown", source: "grab", payload_preview: JSON.stringify(payload).slice(0, 1000) },
    });

    // Process delivery status updates
    const status = payload?.status;
    const orderId = payload?.metadata?.order_id;

    if (orderId && status) {
      const statusMap: Record<string, string> = {
        PICKING_UP: "preparing",
        IN_DELIVERY: "in_transit",
        COMPLETED: "delivered",
        CANCELLED: "cancelled",
      };
      const mappedStatus = statusMap[status];
      if (mappedStatus) {
        await supabase.from("orders").update({ status: mappedStatus }).eq("id", orderId);
        console.log(`Order ${orderId} updated to ${mappedStatus} via Grab`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Grab webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
