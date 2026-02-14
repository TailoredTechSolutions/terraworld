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
    const GCASH_WEBHOOK_SECRET = Deno.env.get("GCASH_WEBHOOK_SECRET");
    if (!GCASH_WEBHOOK_SECRET) {
      console.error("GCASH_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate webhook signature
    const signature = req.headers.get("x-gcash-signature") || req.headers.get("x-paymongo-signature") || "";
    const body = await req.text();

    // PayMongo/GCash signature validation (HMAC-SHA256)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(GCASH_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature && signature !== expectedSignature) {
      console.error("GCash webhook signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(body);
    console.log("GCash webhook received:", JSON.stringify(payload).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log the webhook event in audit_log
    await supabase.from("audit_log").insert({
      entity_type: "payment",
      action: "gcash_webhook",
      entity_id: payload?.data?.id || null,
      details: { event_type: payload?.type, source: "gcash", payload_preview: JSON.stringify(payload).slice(0, 1000) },
    });

    // Process payment events
    const eventType = payload?.data?.attributes?.type || payload?.type || "";

    if (eventType === "payment.paid" || eventType === "source.chargeable") {
      const paymentId = payload?.data?.id;
      const amount = payload?.data?.attributes?.amount;
      const orderId = payload?.data?.attributes?.metadata?.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "preparing" })
          .eq("id", orderId)
          .eq("status", "pending");

        console.log(`Order ${orderId} marked as preparing after GCash payment ${paymentId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GCash webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
