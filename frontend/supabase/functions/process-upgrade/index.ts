import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await userClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { target_tier } = await req.json();
    if (!target_tier) throw new Error("target_tier is required");

    const TIER_PRICES: Record<string, number> = {
      starter: 500,
      basic: 1000,
      pro: 3000,
      elite: 5000,
    };

    const targetPrice = TIER_PRICES[target_tier];
    if (!targetPrice) throw new Error("Invalid target tier");

    // Get current membership
    const { data: membership, error: memError } = await supabase
      .from("memberships")
      .select("id, tier, package_price, membership_bv")
      .eq("user_id", user.id)
      .single();

    if (memError || !membership) throw new Error("Membership not found");

    const currentPrice = Number(membership.package_price) || 0;
    const upgradeCost = targetPrice - currentPrice;

    if (upgradeCost <= 0) {
      throw new Error("Cannot downgrade or upgrade to same level");
    }

    const TIER_ORDER = ["free", "starter", "basic", "pro", "elite"];
    if (TIER_ORDER.indexOf(target_tier) <= TIER_ORDER.indexOf(membership.tier)) {
      throw new Error("Target tier must be higher than current tier");
    }

    // 1. Update membership
    const { error: updateError } = await supabase
      .from("memberships")
      .update({
        tier: target_tier,
        package_price: targetPrice,
        membership_bv: targetPrice, // cumulative BV = total activation value
        updated_at: new Date().toISOString(),
      })
      .eq("id", membership.id);

    if (updateError) throw new Error("Failed to update membership: " + updateError.message);

    // 2. Record BV from upgrade difference only
    const { error: bvError } = await supabase
      .from("bv_ledger")
      .insert({
        user_id: user.id,
        bv_amount: upgradeCost,
        bv_type: "membership",
        source_description: `Rank upgrade: ${membership.tier} → ${target_tier} (difference: ₱${upgradeCost})`,
        terra_fee: upgradeCost,
      });

    if (bvError) console.error("BV ledger error:", bvError);

    // 3. Record wallet transaction for the upgrade payment
    const { error: walletError } = await supabase.rpc("post_wallet_entry", {
      p_user_id: user.id,
      p_transaction_type: "rank_upgrade",
      p_amount: -upgradeCost,
      p_description: `Rank upgrade to ${target_tier}: ₱${upgradeCost}`,
    });

    if (walletError) console.error("Wallet entry error:", walletError);

    // 4. Audit log
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      entity_type: "membership",
      entity_id: membership.id,
      action: "rank_upgrade",
      details: {
        from_tier: membership.tier,
        to_tier: target_tier,
        upgrade_cost: upgradeCost,
        bv_generated: upgradeCost,
        previous_price: currentPrice,
        new_price: targetPrice,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        upgrade: {
          from: membership.tier,
          to: target_tier,
          cost: upgradeCost,
          bv_generated: upgradeCost,
          new_price: targetPrice,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[process-upgrade] error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
