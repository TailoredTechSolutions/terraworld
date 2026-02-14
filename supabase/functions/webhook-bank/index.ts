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
    const BANK_WEBHOOK_SECRET = Deno.env.get("BANK_WEBHOOK_SECRET");
    if (!BANK_WEBHOOK_SECRET) {
      console.error("BANK_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("x-bank-signature") || "";
    const body = await req.text();

    // HMAC-SHA256 signature validation
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(BANK_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (signature && signature !== expectedSignature) {
      console.error("Bank webhook signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(body);
    console.log("Bank webhook received:", JSON.stringify(payload).slice(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log in audit_log
    await supabase.from("audit_log").insert({
      entity_type: "payment",
      action: "bank_webhook",
      entity_id: payload?.reference_id || null,
      details: { event_type: payload?.event || "unknown", source: "bank_transfer", payload_preview: JSON.stringify(payload).slice(0, 1000) },
    });

    // Process bank transfer status updates
    const event = payload?.event || "";
    if (event === "transfer.completed") {
      const withdrawalRef = payload?.reference_id;
      if (withdrawalRef) {
        await supabase
          .from("withdrawal_requests")
          .update({ status: "paid" })
          .eq("reference_code", withdrawalRef)
          .eq("status", "approved");
        console.log(`Withdrawal ${withdrawalRef} marked as paid`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bank webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
