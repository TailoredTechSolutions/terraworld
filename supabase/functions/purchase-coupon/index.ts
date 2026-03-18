import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Get user from token
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { package_id } = await req.json();
    if (!package_id) throw new Error("package_id is required");

    // Fetch coupon package
    const { data: pkg, error: pkgErr } = await supabaseAdmin
      .from("coupon_packages")
      .select("*")
      .eq("id", package_id)
      .eq("is_active", true)
      .single();

    if (pkgErr || !pkg) throw new Error("Coupon package not found or inactive");

    // Calculate financial breakdown
    const price = Number(pkg.price);
    const usableValue = Math.round((price * Number(pkg.usable_value_percent)) / 100 * 100) / 100;
    const terraFee = Math.round((price * Number(pkg.terra_fee_percent)) / 100 * 100) / 100;
    const bonusValue = Math.round((price * Number(pkg.bonus_percent)) / 100 * 100) / 100;
    const bvGenerated = terraFee; // ₱1 Terra Fee = 1 BV
    const tokenRewardPhp = Math.round((price * Number(pkg.token_reward_percent)) / 100 * 100) / 100;

    // Get token market price for conversion
    const { data: tokenSetting } = await supabaseAdmin
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "token_market_price")
      .single();
    const tokenMarketPrice = tokenSetting ? Number(tokenSetting.setting_value) : 10;
    const tokensIssued = tokenRewardPhp / tokenMarketPrice;

    // Calculate expiry
    let expiresAt: string | null = null;
    if (pkg.expiry_days) {
      const d = new Date();
      d.setDate(d.getDate() + pkg.expiry_days);
      expiresAt = d.toISOString();
    }

    // Total credit to internal wallet = usable value + bonus
    const totalWalletCredit = usableValue + bonusValue;

    // --- Begin transactional operations ---

    // 1. Credit internal wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from("wallets")
      .select("id, internal_balance")
      .eq("user_id", user.id)
      .single();

    if (walletErr || !wallet) throw new Error("Wallet not found");

    const newInternalBalance = Math.round((Number(wallet.internal_balance) + totalWalletCredit) * 100) / 100;

    await supabaseAdmin
      .from("wallets")
      .update({ internal_balance: newInternalBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    // 2. Record wallet transaction (internal credit)
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      wallet_id: wallet.id,
      transaction_type: "coupon_credit",
      amount: totalWalletCredit,
      balance_before: Number(wallet.internal_balance),
      balance_after: newInternalBalance,
      description: `Coupon purchase: ${pkg.name} (₱${usableValue} value + ₱${bonusValue} bonus)`,
      status: "completed",
    });

    // 3. Record BV entry (from Terra fee only)
    if (bvGenerated > 0) {
      await supabaseAdmin.from("bv_ledger").insert({
        user_id: user.id,
        bv_amount: bvGenerated,
        bv_type: pkg.bv_type,
        terra_fee: terraFee,
        source_description: `Coupon: ${pkg.name}`,
        leg: "left", // default placement; real placement logic applies elsewhere
      });
    }

    // 4. Issue token reward
    if (tokensIssued > 0) {
      await supabaseAdmin.from("token_ledger").insert({
        user_id: user.id,
        tokens_issued: tokensIssued,
        php_reward_value: tokenRewardPhp,
        token_market_price: tokenMarketPrice,
        source_description: `Coupon reward: ${pkg.name}`,
      });

      // Update profile token balance
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("agri_token_balance")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        await supabaseAdmin
          .from("profiles")
          .update({
            agri_token_balance: Math.round(((profile.agri_token_balance || 0) + tokensIssued) * 100) / 100,
          })
          .eq("user_id", user.id);
      }
    }

    // 5. Record coupon purchase
    const { data: purchase, error: purchaseErr } = await supabaseAdmin
      .from("coupon_purchases")
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        price_paid: price,
        usable_value: usableValue,
        terra_fee: terraFee,
        bv_generated: bvGenerated,
        token_reward: tokensIssued,
        bonus_value: bonusValue,
        balance_remaining: totalWalletCredit,
        expires_at: expiresAt,
        status: "active",
      })
      .select()
      .single();

    if (purchaseErr) throw new Error("Failed to record coupon purchase");

    return new Response(
      JSON.stringify({
        success: true,
        purchase,
        breakdown: {
          price_paid: price,
          usable_value: usableValue,
          terra_fee: terraFee,
          bv_generated: bvGenerated,
          token_reward: tokensIssued,
          bonus_value: bonusValue,
          internal_wallet_credit: totalWalletCredit,
          new_internal_balance: newInternalBalance,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
