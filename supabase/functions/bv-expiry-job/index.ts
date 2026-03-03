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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- Authentication: require valid JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // --- Authorization: require admin role ---
    const serviceClient = createClient(supabaseUrl, serviceKey);

    const { data: adminCheck } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Business logic (uses service client) ---
    const { data: setting } = await serviceClient
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "bv_expiry_days")
      .maybeSingle();

    const expiryDays = setting ? Number(setting.setting_value) : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - expiryDays);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const { data: expiredEntries, error: fetchErr } = await serviceClient
      .from("binary_ledger")
      .select("id, user_id, carryforward_left, carryforward_right, payout_period")
      .lt("payout_period", cutoffStr)
      .or("carryforward_left.gt.0,carryforward_right.gt.0");

    if (fetchErr) throw fetchErr;

    let expiredCount = 0;
    let totalExpiredBV = 0;

    for (const entry of (expiredEntries || [])) {
      const leftCarry = Number(entry.carryforward_left);
      const rightCarry = Number(entry.carryforward_right);

      if (leftCarry > 0 || rightCarry > 0) {
        if (leftCarry > 0) {
          await serviceClient.from("bv_ledger").insert({
            user_id: entry.user_id,
            bv_amount: -leftCarry,
            bv_type: "expiry",
            leg: "left",
            source_description: `BV expired (${expiryDays}-day FIFO) from period ${entry.payout_period}`,
          });
          totalExpiredBV += leftCarry;
        }

        if (rightCarry > 0) {
          await serviceClient.from("bv_ledger").insert({
            user_id: entry.user_id,
            bv_amount: -rightCarry,
            bv_type: "expiry",
            leg: "right",
            source_description: `BV expired (${expiryDays}-day FIFO) from period ${entry.payout_period}`,
          });
          totalExpiredBV += rightCarry;
        }

        await serviceClient
          .from("binary_ledger")
          .update({ carryforward_left: 0, carryforward_right: 0 })
          .eq("id", entry.id);

        expiredCount++;
      }
    }

    await serviceClient.from("audit_log").insert({
      action: "bv_expiry_job",
      entity_type: "binary_ledger",
      actor_id: userId,
      details: {
        expiry_days: expiryDays,
        cutoff_date: cutoffStr,
        entries_processed: expiredCount,
        total_bv_expired: totalExpiredBV,
      },
    });

    console.log(`BV Expiry: ${expiredCount} entries, ${totalExpiredBV} BV expired`);

    return new Response(
      JSON.stringify({
        success: true,
        entries_processed: expiredCount,
        total_bv_expired: totalExpiredBV,
        cutoff_date: cutoffStr,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("BV expiry error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
