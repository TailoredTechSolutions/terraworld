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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // Member: Create withdrawal request
    if (action === "create") {
      const { amount, method, account_details } = body;

      if (!amount || !method || amount <= 0) {
        return new Response(JSON.stringify({ error: "Invalid amount or method" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get min/max settings
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["min_withdrawal", "max_daily_withdrawal", "withdrawal_fee_percent"]);

      const settingsMap: Record<string, number> = {};
      (settings || []).forEach((s: any) => settingsMap[s.setting_key] = Number(s.setting_value));

      const minWithdrawal = settingsMap.min_withdrawal || 500;
      const maxDaily = settingsMap.max_daily_withdrawal || 50000;
      const feePercent = settingsMap.withdrawal_fee_percent || 2;

      if (amount < minWithdrawal) {
        return new Response(JSON.stringify({ error: `Minimum withdrawal is ₱${minWithdrawal}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("id, available_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wallet || Number(wallet.available_balance) < amount) {
        return new Response(JSON.stringify({ error: "Insufficient balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check daily limit
      const today = new Date().toISOString().split("T")[0];
      const { data: todayWithdrawals } = await supabase
        .from("withdrawal_requests")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", today)
        .neq("status", "rejected");

      const todayTotal = (todayWithdrawals || []).reduce((s: number, w: any) => s + Number(w.amount), 0);
      if (todayTotal + amount > maxDaily) {
        return new Response(JSON.stringify({ error: `Daily withdrawal limit is ₱${maxDaily}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fee = Math.round(amount * feePercent) / 100;
      const netAmount = amount - fee;

      const { data: withdrawal, error: wErr } = await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: user.id,
          wallet_id: wallet.id,
          amount,
          fee,
          net_amount: netAmount,
          method,
          account_details: account_details || {},
        })
        .select()
        .single();

      if (wErr) throw wErr;

      return new Response(JSON.stringify({ success: true, withdrawal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin: Approve/Reject withdrawal
    if (action === "review") {
      // Check admin role
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { withdrawal_id, decision, note } = body;
      if (!withdrawal_id || !["approved", "rejected", "flagged"].includes(decision)) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: wd } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("id", withdrawal_id)
        .single();

      if (!wd) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update status
      await supabase
        .from("withdrawal_requests")
        .update({
          status: decision,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_note: note || null,
        })
        .eq("id", withdrawal_id);

      // If approved, debit wallet via ledger
      if (decision === "approved") {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, available_balance")
          .eq("id", wd.wallet_id)
          .single();

        if (wallet) {
          const balBefore = Number(wallet.available_balance);
          const balAfter = balBefore - Number(wd.amount);

          // Create wallet transaction
          await supabase.from("wallet_transactions").insert({
            user_id: wd.user_id,
            wallet_id: wallet.id,
            transaction_type: "withdrawal",
            amount: -Number(wd.amount),
            balance_before: balBefore,
            balance_after: balAfter,
            description: `Withdrawal via ${wd.method} - ${wd.reference_code}`,
            reference_id: wd.id,
            actor_id: user.id,
          });

          // Update wallet balance
          await supabase
            .from("wallets")
            .update({ available_balance: balAfter })
            .eq("id", wallet.id);
        }
      }

      // Log audit
      await supabase.from("audit_log").insert({
        actor_id: user.id,
        action: `withdrawal_${decision}`,
        entity_type: "withdrawal_requests",
        entity_id: withdrawal_id,
        details: { note, amount: wd.amount, method: wd.method },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-withdrawal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
