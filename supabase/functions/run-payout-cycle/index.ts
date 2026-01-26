import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ FIXED CONSTANTS (NON-NEGOTIABLE) ============
const TERRA_FEE_RATE = 0.30; // 30% service fee
const COMPENSATION_POOL_RATE = 0.33; // 33% to pool
const FAILSAFE_THRESHOLD = 0.75; // 75% max for membership BV
const BASE_CYCLE_VALUE = 50; // ₱50 per 500 BV
const BV_PER_CYCLE = 500;
const BINARY_MATCH_RATE = 0.10; // 10% of lesser leg

// Direct Product Bonus rates by tier
const DIRECT_PRODUCT_RATES: Record<string, number> = {
  free: 0.15,
  starter: 0.18,
  basic: 0.20,
  pro: 0.22,
  elite: 0.25,
};

// Direct Membership Bonus rates by tier
const DIRECT_MEMBERSHIP_RATES: Record<string, number> = {
  free: 0,
  starter: 0.04,
  basic: 0.06,
  pro: 0.08,
  elite: 0.10,
};

// Binary daily caps by tier (PHP)
const BINARY_CAPS: Record<string, number> = {
  free: 0,
  starter: 5000,
  basic: 15000,
  pro: 50000,
  elite: 250000,
};

// Matching bonus levels by tier
const MATCHING_LEVELS: Record<string, number[]> = {
  free: [],
  starter: [0.10], // L1 only
  basic: [0.10, 0.05], // L1 + L2
  pro: [0.10, 0.05, 0.05], // L1 + L2 + L3
  elite: [0.10, 0.05, 0.05, 0.05, 0.05], // L1-L5
};

interface MembershipRow {
  user_id: string;
  tier: string;
  sponsor_id: string | null;
  left_leg_id: string | null;
  right_leg_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Check admin role
    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { payout_date } = await req.json();
    const payoutPeriod = payout_date || new Date().toISOString().split("T")[0];

    console.log(`Starting payout cycle for period: ${payoutPeriod}`);

    // ============ STEP 1: Calculate Terra Service Fees ============
    const { data: orders } = await supabase
      .from("orders")
      .select("id, terra_fee, terra_fee_bv, referrer_id, farmer_price, created_at")
      .gte("created_at", `${payoutPeriod}T00:00:00Z`)
      .lt("created_at", `${payoutPeriod}T23:59:59Z`)
      .eq("status", "delivered");

    const totalTerraFees = orders?.reduce((sum, o) => sum + (o.terra_fee || 0), 0) || 0;
    console.log(`Total Terra fees: ₱${totalTerraFees}`);

    // ============ STEP 2: Allocate Compensation Pool ============
    const poolAmount = totalTerraFees * COMPENSATION_POOL_RATE;
    console.log(`Compensation pool: ₱${poolAmount}`);

    // Create/update compensation pool record
    await supabase.from("compensation_pools").upsert({
      payout_period: payoutPeriod,
      total_terra_fees: totalTerraFees,
      pool_amount: poolAmount,
    }, { onConflict: "payout_period" });

    // Get all memberships
    const { data: memberships } = await supabase
      .from("memberships")
      .select("user_id, tier, sponsor_id, left_leg_id, right_leg_id");

    const membershipMap = new Map<string, MembershipRow>();
    memberships?.forEach((m) => membershipMap.set(m.user_id, m));

    const payouts: Array<{
      user_id: string;
      payout_period: string;
      bonus_type: string;
      gross_amount: number;
      net_amount: number;
      source_order_id?: string;
      source_user_id?: string;
      level_depth?: number;
      notes?: string;
    }> = [];

    // ============ STEP 3: Pay Direct Product Bonuses ============
    for (const order of orders || []) {
      if (order.referrer_id && order.terra_fee) {
        const referrer = membershipMap.get(order.referrer_id);
        if (referrer) {
          const rate = DIRECT_PRODUCT_RATES[referrer.tier] || 0;
          const bonus = order.terra_fee * rate;
          if (bonus > 0) {
            payouts.push({
              user_id: order.referrer_id,
              payout_period: payoutPeriod,
              bonus_type: "direct_product",
              gross_amount: bonus,
              net_amount: bonus, // Direct bonuses are never capped
              source_order_id: order.id,
              notes: `Direct product bonus at ${rate * 100}%`,
            });
          }
        }
      }
    }
    console.log(`Direct product bonuses: ${payouts.filter(p => p.bonus_type === 'direct_product').length}`);

    // ============ STEP 4: Pay Direct Membership Bonuses ============
    // Get new memberships purchased today
    const { data: newMemberships } = await supabase
      .from("memberships")
      .select("user_id, tier, package_price, sponsor_id, created_at")
      .gte("created_at", `${payoutPeriod}T00:00:00Z`)
      .lt("created_at", `${payoutPeriod}T23:59:59Z`)
      .neq("tier", "free");

    for (const membership of newMemberships || []) {
      if (membership.sponsor_id && membership.package_price) {
        const sponsor = membershipMap.get(membership.sponsor_id);
        if (sponsor) {
          const rate = DIRECT_MEMBERSHIP_RATES[sponsor.tier] || 0;
          const bonus = membership.package_price * rate;
          if (bonus > 0) {
            payouts.push({
              user_id: membership.sponsor_id,
              payout_period: payoutPeriod,
              bonus_type: "direct_membership",
              gross_amount: bonus,
              net_amount: bonus, // Direct bonuses are never capped
              source_user_id: membership.user_id,
              notes: `Direct membership bonus at ${rate * 100}%`,
            });
          }
        }
      }
    }
    console.log(`Direct membership bonuses: ${payouts.filter(p => p.bonus_type === 'direct_membership').length}`);

    // ============ STEP 5: Compute Binary BV Matches ============
    // Get BV for each user's legs
    const { data: bvRecords } = await supabase
      .from("bv_ledger")
      .select("user_id, leg, bv_amount, bv_type")
      .gte("created_at", `${payoutPeriod}T00:00:00Z`)
      .lt("created_at", `${payoutPeriod}T23:59:59Z`);

    // Aggregate BV by user and leg
    const userBV: Map<string, { left: number; right: number; membershipBV: number }> = new Map();

    // Include carryforward from previous period
    const { data: prevBinary } = await supabase
      .from("binary_ledger")
      .select("user_id, carryforward_left, carryforward_right")
      .lt("payout_period", payoutPeriod)
      .order("payout_period", { ascending: false });

    // Get latest carryforward per user
    const carryforwardMap = new Map<string, { left: number; right: number }>();
    for (const record of prevBinary || []) {
      if (!carryforwardMap.has(record.user_id)) {
        carryforwardMap.set(record.user_id, {
          left: record.carryforward_left || 0,
          right: record.carryforward_right || 0,
        });
      }
    }

    // Initialize with carryforward
    for (const [userId, cf] of carryforwardMap) {
      userBV.set(userId, { left: cf.left, right: cf.right, membershipBV: 0 });
    }

    // Add today's BV
    for (const record of bvRecords || []) {
      const current = userBV.get(record.user_id) || { left: 0, right: 0, membershipBV: 0 };
      if (record.leg === "left") {
        current.left += record.bv_amount;
      } else if (record.leg === "right") {
        current.right += record.bv_amount;
      }
      if (record.bv_type === "membership") {
        current.membershipBV += record.bv_amount;
      }
      userBV.set(record.user_id, current);
    }

    // ============ STEP 6: Apply Fail-Safe Adjustment ============
    let totalMembershipBVPayout = 0;
    const membershipBVPayoutNeeded = new Map<string, number>();

    for (const [userId, bv] of userBV) {
      // Calculate PHP value for membership BV portion
      const cycles = Math.floor(bv.membershipBV / BV_PER_CYCLE);
      const phpValue = cycles * BASE_CYCLE_VALUE;
      membershipBVPayoutNeeded.set(userId, phpValue);
      totalMembershipBVPayout += phpValue;
    }

    let cycleValueAdjustment = 1.0;
    let failsafeRatio = poolAmount > 0 ? totalMembershipBVPayout / poolAmount : 0;

    if (failsafeRatio > FAILSAFE_THRESHOLD) {
      // Fail-safe triggered: adjust cycle value
      cycleValueAdjustment = FAILSAFE_THRESHOLD / failsafeRatio;
      console.log(`FAIL-SAFE TRIGGERED: ratio=${failsafeRatio}, adjustment=${cycleValueAdjustment}`);
    }

    // ============ STEP 7: Apply Binary Caps & Calculate Binary Income ============
    const binaryRecords: Array<{
      user_id: string;
      payout_period: string;
      left_bv: number;
      right_bv: number;
      matched_bv: number;
      binary_income: number;
      cap_applied: number;
      carryforward_left: number;
      carryforward_right: number;
    }> = [];

    for (const [userId, bv] of userBV) {
      const member = membershipMap.get(userId);
      if (!member || member.tier === "free") continue;

      const lesserLeg = Math.min(bv.left, bv.right);
      const matchedBV = lesserLeg;
      let binaryIncome = matchedBV * BINARY_MATCH_RATE;

      // Apply fail-safe to membership portion
      const membershipPortion = membershipBVPayoutNeeded.get(userId) || 0;
      const adjustedMembershipPayout = membershipPortion * cycleValueAdjustment;

      // Apply cap
      const cap = BINARY_CAPS[member.tier] || 0;
      const cappedIncome = Math.min(binaryIncome, cap);
      const capApplied = binaryIncome - cappedIncome;

      // Calculate carryforward
      const usedBV = matchedBV;
      const carryforwardLeft = bv.left - usedBV;
      const carryforwardRight = bv.right - usedBV;

      binaryRecords.push({
        user_id: userId,
        payout_period: payoutPeriod,
        left_bv: bv.left,
        right_bv: bv.right,
        matched_bv: matchedBV,
        binary_income: cappedIncome,
        cap_applied: capApplied,
        carryforward_left: Math.max(0, carryforwardLeft),
        carryforward_right: Math.max(0, carryforwardRight),
      });

      if (cappedIncome > 0) {
        payouts.push({
          user_id: userId,
          payout_period: payoutPeriod,
          bonus_type: "binary",
          gross_amount: binaryIncome,
          net_amount: cappedIncome,
          notes: `Binary match: ${matchedBV} BV, cap: ₱${cap}`,
        });
      }
    }

    console.log(`Binary payouts: ${binaryRecords.length}`);

    // ============ STEP 8: Calculate Matching Bonuses ============
    // Matching is paid on actual binary paid (after caps)
    for (const record of binaryRecords) {
      if (record.binary_income <= 0) continue;

      const member = membershipMap.get(record.user_id);
      if (!member?.sponsor_id) continue;

      // Walk up the sponsor chain
      let currentSponsorId: string | null = member.sponsor_id;
      let level = 1;

      while (currentSponsorId && level <= 5) {
        const sponsor = membershipMap.get(currentSponsorId);
        if (!sponsor) break;

        const levels = MATCHING_LEVELS[sponsor.tier] || [];
        if (level <= levels.length) {
          // Check rank qualification: sponsor rank >= downline rank
          const tierOrder = ["free", "starter", "basic", "pro", "elite"];
          const sponsorRank = tierOrder.indexOf(sponsor.tier);
          const downlineRank = tierOrder.indexOf(member.tier);

          if (sponsorRank >= downlineRank) {
            const matchingRate = levels[level - 1];
            const matchingBonus = record.binary_income * matchingRate;

            if (matchingBonus > 0) {
              payouts.push({
                user_id: currentSponsorId,
                payout_period: payoutPeriod,
                bonus_type: "matching",
                gross_amount: matchingBonus,
                net_amount: matchingBonus, // Matching bonuses are never capped
                source_user_id: record.user_id,
                level_depth: level,
                notes: `Matching L${level} at ${matchingRate * 100}%`,
              });
            }
          }
        }

        currentSponsorId = sponsor.sponsor_id;
        level++;
      }
    }

    console.log(`Matching bonuses: ${payouts.filter(p => p.bonus_type === 'matching').length}`);

    // ============ STEP 9-10: Record All Ledger Entries ============
    // Insert binary ledger
    if (binaryRecords.length > 0) {
      await supabase.from("binary_ledger").insert(binaryRecords);
    }

    // Insert payout ledger
    if (payouts.length > 0) {
      await supabase.from("payout_ledger").insert(payouts);
    }

    // Update compensation pool
    await supabase
      .from("compensation_pools")
      .update({
        membership_bv_payout: totalMembershipBVPayout * cycleValueAdjustment,
        failsafe_ratio: failsafeRatio,
        cycle_value_adjustment: cycleValueAdjustment,
        is_processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("payout_period", payoutPeriod);

    // Summary
    const summary = {
      payout_period: payoutPeriod,
      total_terra_fees: totalTerraFees,
      pool_amount: poolAmount,
      failsafe_triggered: failsafeRatio > FAILSAFE_THRESHOLD,
      failsafe_ratio: failsafeRatio,
      cycle_value_adjustment: cycleValueAdjustment,
      payouts: {
        direct_product: payouts.filter(p => p.bonus_type === "direct_product").length,
        direct_membership: payouts.filter(p => p.bonus_type === "direct_membership").length,
        binary: payouts.filter(p => p.bonus_type === "binary").length,
        matching: payouts.filter(p => p.bonus_type === "matching").length,
      },
      total_paid: payouts.reduce((sum, p) => sum + p.net_amount, 0),
    };

    console.log("Payout cycle complete:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Payout cycle error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
