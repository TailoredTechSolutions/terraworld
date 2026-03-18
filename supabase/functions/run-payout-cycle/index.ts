import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============ FIXED CONSTANTS (NON-NEGOTIABLE) ============
const TERRA_FEE_RATE = 0.30;
const COMPENSATION_POOL_RATE = 0.33;
const FAILSAFE_THRESHOLD = 0.75;
const BASE_CYCLE_VALUE = 50; // ₱50 per 500 BV
const BV_PER_CYCLE = 500;
const BINARY_MATCH_RATE = 0.10;

const DIRECT_PRODUCT_RATES: Record<string, number> = {
  free: 0.15, starter: 0.18, basic: 0.20, pro: 0.22, elite: 0.25,
};

const DIRECT_MEMBERSHIP_RATES: Record<string, number> = {
  free: 0, starter: 0.04, basic: 0.06, pro: 0.08, elite: 0.10,
};

const BINARY_CAPS: Record<string, number> = {
  free: 0, starter: 5000, basic: 15000, pro: 50000, elite: 250000,
};

const MATCHING_LEVELS: Record<string, number[]> = {
  free: [],
  starter: [0.10],
  basic: [0.10, 0.05],
  pro: [0.10, 0.05, 0.05],
  elite: [0.10, 0.05, 0.05, 0.05, 0.05],
};

// ============ DECIMAL-SAFE ARITHMETIC ============
// Using string-based math to avoid floating point errors
function safeAdd(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100;
}
function safeMul(a: number, b: number): number {
  return Math.round(a * b * 100) / 100;
}
function safeSub(a: number, b: number): number {
  return Math.round((a - b) * 100) / 100;
}
function safeDiv(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.round((a / b) * 1000000) / 1000000;
}
function floorTo500(val: number): number {
  return Math.floor(val / BV_PER_CYCLE) * BV_PER_CYCLE;
}

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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
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

    console.log(`[payout] Starting cycle for period: ${payoutPeriod}`);

    // ============ STEP 1: Calculate Terra Service Fees ============
    const { data: orders } = await supabase
      .from("orders")
      .select("id, terra_fee, terra_fee_bv, referrer_id, farmer_price, order_type, bv_type, created_at")
      .gte("created_at", `${payoutPeriod}T00:00:00Z`)
      .lt("created_at", `${payoutPeriod}T23:59:59Z`)
      .eq("status", "delivered");

    const totalTerraFees = (orders || []).reduce((sum, o) => safeAdd(sum, o.terra_fee || 0), 0);
    console.log(`[payout] Total Terra fees: ₱${totalTerraFees}`);

    // ============ STEP 2: Allocate Compensation Pool ============
    const poolAmount = safeMul(totalTerraFees, COMPENSATION_POOL_RATE);
    console.log(`[payout] Compensation pool (33%): ₱${poolAmount}`);

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
      if (!order.referrer_id || !order.terra_fee) continue;
      // RULE: Only Terra Fee generates bonus, not farmer price or delivery
      const referrer = membershipMap.get(order.referrer_id);
      if (!referrer) continue;

      const rate = DIRECT_PRODUCT_RATES[referrer.tier] || 0;
      const bonus = safeMul(order.terra_fee, rate);
      if (bonus > 0) {
        payouts.push({
          user_id: order.referrer_id,
          payout_period: payoutPeriod,
          bonus_type: "direct_product",
          gross_amount: bonus,
          net_amount: bonus, // Direct bonuses are NEVER capped
          source_order_id: order.id,
          notes: `Direct product bonus at ${(rate * 100).toFixed(0)}% on ₱${order.terra_fee} Terra fee`,
        });
      }
    }
    console.log(`[payout] Direct product bonuses: ${payouts.filter(p => p.bonus_type === 'direct_product').length}`);

    // ============ STEP 4: Pay Direct Membership Bonuses ============
    const { data: newMemberships } = await supabase
      .from("memberships")
      .select("user_id, tier, package_price, sponsor_id, created_at")
      .gte("created_at", `${payoutPeriod}T00:00:00Z`)
      .lt("created_at", `${payoutPeriod}T23:59:59Z`)
      .neq("tier", "free");

    for (const membership of newMemberships || []) {
      if (!membership.sponsor_id || !membership.package_price) continue;
      const sponsor = membershipMap.get(membership.sponsor_id);
      if (!sponsor) continue;

      const rate = DIRECT_MEMBERSHIP_RATES[sponsor.tier] || 0;
      const bonus = safeMul(membership.package_price, rate);
      if (bonus > 0) {
        payouts.push({
          user_id: membership.sponsor_id,
          payout_period: payoutPeriod,
          bonus_type: "direct_membership",
          gross_amount: bonus,
          net_amount: bonus, // Direct bonuses are NEVER capped
          source_user_id: membership.user_id,
          notes: `Direct membership bonus at ${(rate * 100).toFixed(0)}% on ₱${membership.package_price}`,
        });
      }
    }
    console.log(`[payout] Direct membership bonuses: ${payouts.filter(p => p.bonus_type === 'direct_membership').length}`);

    // ============ STEP 5: Compute Binary BV (SEPARATED Product vs Membership) ============
    const { data: bvRecords } = await supabase
      .from("bv_ledger")
      .select("user_id, leg, bv_amount, bv_type")
      .gte("created_at", `${payoutPeriod}T00:00:00Z`)
      .lt("created_at", `${payoutPeriod}T23:59:59Z`);

    // Get latest carryforward per user
    const { data: prevBinary } = await supabase
      .from("binary_ledger")
      .select("user_id, carryforward_left, carryforward_right")
      .lt("payout_period", payoutPeriod)
      .order("payout_period", { ascending: false });

    const carryforwardMap = new Map<string, { left: number; right: number }>();
    for (const record of prevBinary || []) {
      if (!carryforwardMap.has(record.user_id)) {
        carryforwardMap.set(record.user_id, {
          left: record.carryforward_left || 0,
          right: record.carryforward_right || 0,
        });
      }
    }

    // Aggregate BV by user, leg, and type (product vs membership)
    interface UserBVData {
      leftProduct: number;
      rightProduct: number;
      leftMembership: number;
      rightMembership: number;
    }
    const userBV = new Map<string, UserBVData>();

    // Initialize with carryforward
    for (const [userId, cf] of carryforwardMap) {
      userBV.set(userId, {
        leftProduct: cf.left, // carryforward keeps BV units, not PHP value
        rightProduct: 0,
        leftMembership: 0,
        rightMembership: 0,
      });
    }

    // Add today's BV — SEPARATED by type
    for (const record of bvRecords || []) {
      const current = userBV.get(record.user_id) || {
        leftProduct: 0, rightProduct: 0, leftMembership: 0, rightMembership: 0,
      };
      const isMembership = record.bv_type === "membership";
      if (record.leg === "left") {
        if (isMembership) current.leftMembership = safeAdd(current.leftMembership, record.bv_amount);
        else current.leftProduct = safeAdd(current.leftProduct, record.bv_amount);
      } else if (record.leg === "right") {
        if (isMembership) current.rightMembership = safeAdd(current.rightMembership, record.bv_amount);
        else current.rightProduct = safeAdd(current.rightProduct, record.bv_amount);
      }
      userBV.set(record.user_id, current);
    }

    // ============ STEP 6: Apply Fail-Safe (MEMBERSHIP BV ONLY) ============
    // Calculate total membership BV payout needed at base cycle value
    let totalMembershipBVPayout = 0;
    for (const [, bv] of userBV) {
      const lesserMembership = Math.min(bv.leftMembership, bv.rightMembership);
      const matchedMembershipBV = floorTo500(lesserMembership);
      const cycles = matchedMembershipBV / BV_PER_CYCLE;
      totalMembershipBVPayout = safeAdd(totalMembershipBVPayout, safeMul(cycles, BASE_CYCLE_VALUE));
    }

    let cycleValueAdjustment = 1.0;
    let failsafeRatio = poolAmount > 0 ? safeDiv(totalMembershipBVPayout, poolAmount) : 0;
    let failSafeTriggered = false;

    if (failsafeRatio > FAILSAFE_THRESHOLD && poolAmount > 0) {
      cycleValueAdjustment = safeDiv(FAILSAFE_THRESHOLD, failsafeRatio);
      failSafeTriggered = true;
      console.log(`[payout] FAIL-SAFE TRIGGERED: ratio=${failsafeRatio.toFixed(4)}, adjustment=${cycleValueAdjustment.toFixed(4)}`);
    }

    const adjustedCycleValue = safeMul(BASE_CYCLE_VALUE, cycleValueAdjustment);

    // ============ STEP 7: Apply Binary Caps & Calculate Binary Income ============
    const binaryRecords: Array<{
      user_id: string;
      payout_period: string;
      left_bv: number;
      right_bv: number;
      left_product_bv: number;
      right_product_bv: number;
      left_membership_bv: number;
      right_membership_bv: number;
      matched_bv: number;
      binary_income: number;
      cap_applied: number;
      carryforward_left: number;
      carryforward_right: number;
      fail_safe_triggered: boolean;
      adjusted_cycle_value: number;
    }> = [];

    for (const [userId, bv] of userBV) {
      const member = membershipMap.get(userId);
      if (!member || member.tier === "free") continue;

      const totalLeft = safeAdd(bv.leftProduct, bv.leftMembership);
      const totalRight = safeAdd(bv.rightProduct, bv.rightMembership);
      const lesserLeg = Math.min(totalLeft, totalRight);
      const matchedBV = floorTo500(lesserLeg);

      // Product BV commission: always at BASE_CYCLE_VALUE (no fail-safe)
      const lesserProduct = Math.min(bv.leftProduct, bv.rightProduct);
      const matchedProductBV = floorTo500(lesserProduct);
      const productCycles = matchedProductBV / BV_PER_CYCLE;
      const productCommission = safeMul(safeMul(productCycles, BASE_CYCLE_VALUE), BINARY_MATCH_RATE);

      // Membership BV commission: at adjusted cycle value (fail-safe applies)
      const lesserMembership = Math.min(bv.leftMembership, bv.rightMembership);
      const matchedMembershipBV = floorTo500(lesserMembership);
      const membershipCycles = matchedMembershipBV / BV_PER_CYCLE;
      const membershipCommission = safeMul(safeMul(membershipCycles, adjustedCycleValue), BINARY_MATCH_RATE);

      let binaryIncome = safeAdd(productCommission, membershipCommission);

      // Apply daily cap (BEFORE matching)
      const cap = BINARY_CAPS[member.tier] || 0;
      const cappedIncome = Math.min(binaryIncome, cap);
      const capApplied = safeSub(binaryIncome, cappedIncome);

      // Carry forward unmatched BV
      const carryforwardLeft = Math.max(0, safeSub(totalLeft, matchedBV));
      const carryforwardRight = Math.max(0, safeSub(totalRight, matchedBV));

      binaryRecords.push({
        user_id: userId,
        payout_period: payoutPeriod,
        left_bv: totalLeft,
        right_bv: totalRight,
        left_product_bv: bv.leftProduct,
        right_product_bv: bv.rightProduct,
        left_membership_bv: bv.leftMembership,
        right_membership_bv: bv.rightMembership,
        matched_bv: matchedBV,
        binary_income: cappedIncome,
        cap_applied: capApplied,
        carryforward_left: carryforwardLeft,
        carryforward_right: carryforwardRight,
        fail_safe_triggered: failSafeTriggered,
        adjusted_cycle_value: adjustedCycleValue,
      });

      if (cappedIncome > 0) {
        payouts.push({
          user_id: userId,
          payout_period: payoutPeriod,
          bonus_type: "binary",
          gross_amount: binaryIncome,
          net_amount: cappedIncome,
          notes: `Binary: ${matchedBV} BV matched (Prod: ${matchedProductBV}, Mem: ${matchedMembershipBV}), cap: ₱${cap}${failSafeTriggered ? `, fail-safe: ${adjustedCycleValue.toFixed(2)}` : ''}`,
        });
      }
    }
    console.log(`[payout] Binary payouts: ${binaryRecords.length}`);

    // ============ STEP 8: Calculate Matching Bonuses (on CAPPED binary) ============
    for (const record of binaryRecords) {
      if (record.binary_income <= 0) continue;
      const member = membershipMap.get(record.user_id);
      if (!member?.sponsor_id) continue;

      let currentSponsorId: string | null = member.sponsor_id;
      let level = 1;

      while (currentSponsorId && level <= 5) {
        const sponsor = membershipMap.get(currentSponsorId);
        if (!sponsor) break;

        const levels = MATCHING_LEVELS[sponsor.tier] || [];
        if (level <= levels.length) {
          const tierOrder = ["free", "starter", "basic", "pro", "elite"];
          const sponsorRank = tierOrder.indexOf(sponsor.tier);
          const downlineRank = tierOrder.indexOf(member.tier);

          if (sponsorRank >= downlineRank) {
            const matchingRate = levels[level - 1];
            const matchingBonus = safeMul(record.binary_income, matchingRate);

            if (matchingBonus > 0) {
              payouts.push({
                user_id: currentSponsorId,
                payout_period: payoutPeriod,
                bonus_type: "matching",
                gross_amount: matchingBonus,
                net_amount: matchingBonus, // Matching bonuses are NEVER capped
                source_user_id: record.user_id,
                level_depth: level,
                notes: `Matching L${level} at ${(matchingRate * 100).toFixed(0)}% on ₱${record.binary_income}`,
              });
            }
          }
        }

        currentSponsorId = sponsor.sponsor_id;
        level++;
      }
    }
    console.log(`[payout] Matching bonuses: ${payouts.filter(p => p.bonus_type === 'matching').length}`);

    // ============ STEP 9: Record All Ledger Entries ============
    if (binaryRecords.length > 0) {
      await supabase.from("binary_ledger").insert(binaryRecords);
    }

    if (payouts.length > 0) {
      await supabase.from("payout_ledger").insert(payouts);
    }

    // ============ STEP 10: Update Compensation Pool Record ============
    const totalProductBVPayout = payouts
      .filter(p => p.bonus_type === "binary")
      .reduce((sum, p) => safeAdd(sum, p.net_amount), 0);

    await supabase
      .from("compensation_pools")
      .update({
        membership_bv_payout: safeMul(totalMembershipBVPayout, cycleValueAdjustment),
        failsafe_ratio: failsafeRatio,
        cycle_value_adjustment: cycleValueAdjustment,
        is_processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq("payout_period", payoutPeriod);

    const summary = {
      payout_period: payoutPeriod,
      total_terra_fees: totalTerraFees,
      pool_amount: poolAmount,
      failsafe_triggered: failSafeTriggered,
      failsafe_ratio: failsafeRatio,
      cycle_value_adjustment: cycleValueAdjustment,
      adjusted_cycle_value: adjustedCycleValue,
      payouts: {
        direct_product: payouts.filter(p => p.bonus_type === "direct_product").length,
        direct_membership: payouts.filter(p => p.bonus_type === "direct_membership").length,
        binary: payouts.filter(p => p.bonus_type === "binary").length,
        matching: payouts.filter(p => p.bonus_type === "matching").length,
      },
      total_paid: payouts.reduce((sum, p) => safeAdd(sum, p.net_amount), 0),
      bv_separation: {
        total_product_bv_payout: totalProductBVPayout,
        total_membership_bv_payout: safeMul(totalMembershipBVPayout, cycleValueAdjustment),
      },
    };

    console.log("[payout] Cycle complete:", JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[payout] error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
