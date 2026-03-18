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
    const LALAMOVE_WEBHOOK_SECRET = Deno.env.get("LALAMOVE_WEBHOOK_SECRET");
    if (!LALAMOVE_WEBHOOK_SECRET) {
      console.error("LALAMOVE_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("x-lalamove-signature") || "";
    const body = await req.text();

    // Signature validation
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(LALAMOVE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!signature || signature !== expectedSignature) {
      console.error("Lalamove webhook signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(body);
    console.log("Lalamove webhook received:", JSON.stringify(payload).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log event
    await supabase.from("audit_log").insert({
      entity_type: "delivery",
      action: "lalamove_webhook",
      entity_id: payload?.orderId || null,
      details: { event_type: payload?.eventType || "unknown", source: "lalamove", payload_preview: JSON.stringify(payload).slice(0, 1000) },
    });

    // Process delivery status updates
    const eventType = payload?.eventType;
    const orderId = payload?.metadata?.terra_order_id;

    if (orderId && eventType) {
      const statusMap: Record<string, string> = {
        PICKED_UP: "preparing",
        ON_GOING: "in_transit",
        COMPLETED: "delivered",
        REJECTED: "cancelled",
        EXPIRED: "cancelled",
      };
      const mappedStatus = statusMap[eventType];
      if (mappedStatus) {
        await supabase.from("orders").update({ status: mappedStatus }).eq("id", orderId);
        console.log(`Order ${orderId} updated to ${mappedStatus} via Lalamove`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Lalamove webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
