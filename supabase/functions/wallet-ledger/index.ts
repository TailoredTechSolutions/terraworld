import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * WALLET LEDGER SERVICE
 * Handles: posting entries, reversals, balance queries
 * CRITICAL: All wallet changes go through this endpoint
 * Append-only enforcement is at database level via trigger
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
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "post_entry") {
      // Admin only
      const { data: adminRole } = await supabaseService
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Admin required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { target_user_id, transaction_type, amount, description, reference_id } = body;

      // Get wallet
      const { data: wallet } = await supabaseService
        .from("wallets")
        .select("id, available_balance")
        .eq("user_id", target_user_id)
        .maybeSingle();

      if (!wallet) {
        return new Response(JSON.stringify({ error: "Wallet not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const balanceBefore = Number(wallet.available_balance);
      const balanceAfter = Math.round((balanceBefore + amount) * 100) / 100;

      // Insert ledger entry with balance_before
      await supabaseService.from("wallet_transactions").insert({
        user_id: target_user_id,
        wallet_id: wallet.id,
        transaction_type,
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        reference_id,
        actor_id: user.id,
        metadata: { posted_by: user.email },
        status: "completed",
      });

      // Update wallet balance
      await supabaseService
        .from("wallets")
        .update({ available_balance: balanceAfter })
        .eq("id", wallet.id);

      return new Response(JSON.stringify({
        success: true,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
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
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Admin required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { original_entry_id, reason } = body;

      // Get original entry (read-only, cannot modify)
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

      // Get current wallet balance
      const { data: wallet } = await supabaseService
        .from("wallets")
        .select("id, available_balance")
        .eq("id", original.wallet_id)
        .maybeSingle();

      if (!wallet) {
        return new Response(JSON.stringify({ error: "Wallet not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const reversalAmount = -Number(original.amount);
      const balanceBefore = Number(wallet.available_balance);
      const balanceAfter = Math.round((balanceBefore + reversalAmount) * 100) / 100;

      // Post reversal entry (new row, append-only)
      await supabaseService.from("wallet_transactions").insert({
        user_id: original.user_id,
        wallet_id: original.wallet_id,
        transaction_type: `${original.transaction_type}_REVERSAL`,
        amount: reversalAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Reversal: ${reason}`,
        reference_id: original_entry_id,
        actor_id: user.id,
        metadata: { reversed_entry_id: original_entry_id, reason },
        status: "completed",
      });

      // Update wallet balance
      await supabaseService
        .from("wallets")
        .update({ available_balance: balanceAfter })
        .eq("id", wallet.id);

      return new Response(JSON.stringify({
        success: true,
        reversed_entry_id: original_entry_id,
        reversal_amount: reversalAmount,
        balance_after: balanceAfter,
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
