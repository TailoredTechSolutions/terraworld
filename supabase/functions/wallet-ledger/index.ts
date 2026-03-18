import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * WALLET LEDGER SERVICE
 * Handles: posting entries, reversals, balance queries
 * CRITICAL: All wallet changes go through this endpoint
 * Uses atomic post_wallet_entry() DB function with row locking
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !data?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = data.claims.sub as string;
    const userEmail = data.claims.email as string;

    const body = await req.json();
    const { action } = body;

    if (action === "post_entry") {
      // Admin only
      const { data: adminRole } = await supabaseService
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Admin required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { target_user_id, transaction_type, amount, description, reference_id } = body;

      // Use atomic DB function with row locking
      const { data: result, error: rpcError } = await supabaseService.rpc("post_wallet_entry", {
        p_user_id: target_user_id,
        p_transaction_type: transaction_type,
        p_amount: amount,
        p_description: description || null,
        p_reference_id: reference_id || null,
        p_actor_id: userId,
      });

      if (rpcError) {
        console.error("[wallet-ledger] RPC error:", rpcError);
        return new Response(JSON.stringify({ error: "Failed to process wallet entry. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const entry = Array.isArray(result) ? result[0] : result;

      return new Response(JSON.stringify({
        success: true,
        balance_before: entry.balance_before,
        balance_after: entry.balance_after,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reverse_entry") {
      // Admin only
      const { data: adminRole } = await supabaseService
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Admin required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { original_entry_id, reason } = body;

      // Get original entry (read-only)
      const { data: original } = await supabaseService
        .from("wallet_transactions")
        .select("*")
        .eq("id", original_entry_id)
        .maybeSingle();

      if (!original) {
        return new Response(JSON.stringify({ error: "Entry not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const reversalAmount = -Number(original.amount);

      // Use atomic DB function for reversal too
      const { data: result, error: rpcError } = await supabaseService.rpc("post_wallet_entry", {
        p_user_id: original.user_id,
        p_transaction_type: `${original.transaction_type}_REVERSAL`,
        p_amount: reversalAmount,
        p_description: `Reversal: ${reason}`,
        p_reference_id: original_entry_id,
        p_actor_id: userId,
      });

      if (rpcError) {
        console.error("[wallet-ledger] Reversal RPC error:", rpcError);
        return new Response(JSON.stringify({ error: "Failed to process reversal. Please try again." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const entry = Array.isArray(result) ? result[0] : result;

      return new Response(JSON.stringify({
        success: true,
        reversed_entry_id: original_entry_id,
        reversal_amount: reversalAmount,
        balance_after: entry.balance_after,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[wallet-ledger] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
