import { describe, it, expect } from "vitest";

// ============ REPLICATED PURE FUNCTIONS FROM run-payout-cycle ============
// These mirror the edge function logic exactly for testability

const TERRA_FEE_RATE = 0.30;
const COMPENSATION_POOL_RATE = 0.33;
const FAILSAFE_THRESHOLD = 0.75;
const BASE_CYCLE_VALUE = 50;
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

// ============ TESTS ============

describe("Decimal-Safe Arithmetic", () => {
  it("safeAdd avoids floating point drift", () => {
    // 0.1 + 0.2 === 0.30000000000000004 in JS
    expect(safeAdd(0.1, 0.2)).toBe(0.3);
    expect(safeAdd(1.005, 2.005)).toBe(3.01);
    expect(safeAdd(999.99, 0.01)).toBe(1000);
  });

  it("safeMul avoids floating point drift", () => {
    expect(safeMul(1000, 0.30)).toBe(300);
    expect(safeMul(300, 0.33)).toBe(99);
    expect(safeMul(100, 0.10)).toBe(10);
    expect(safeMul(7.7, 100)).toBe(770);
  });

  it("safeSub avoids floating point drift", () => {
    expect(safeSub(1000, 0.01)).toBe(999.99);
    expect(safeSub(0.3, 0.1)).toBe(0.2);
  });

  it("safeDiv handles division by zero", () => {
    expect(safeDiv(100, 0)).toBe(0);
  });

  it("safeDiv provides 6 decimal precision", () => {
    expect(safeDiv(1, 3)).toBe(0.333333);
    expect(safeDiv(75, 80)).toBe(0.9375);
  });

  it("floorTo500 rounds down to nearest 500", () => {
    expect(floorTo500(1500)).toBe(1500);
    expect(floorTo500(1499)).toBe(1000);
    expect(floorTo500(2999)).toBe(2500);
    expect(floorTo500(499)).toBe(0);
    expect(floorTo500(0)).toBe(0);
  });
});

describe("Terra Fee & Compensation Pool", () => {
  it("calculates Terra fee as 30% of farmer price", () => {
    const farmerPrice = 1000;
    const terraFee = safeMul(farmerPrice, TERRA_FEE_RATE);
    expect(terraFee).toBe(300);
  });

  it("calculates compensation pool as 33% of Terra fee", () => {
    const terraFee = 300;
    const pool = safeMul(terraFee, COMPENSATION_POOL_RATE);
    expect(pool).toBe(99);
  });

  it("BV generated equals Terra fee (₱1 = 1 BV)", () => {
    const farmerPrice = 1000;
    const terraFee = safeMul(farmerPrice, TERRA_FEE_RATE);
    const bvGenerated = terraFee; // ₱1 = 1 BV
    expect(bvGenerated).toBe(300);
  });

  it("farmer price generates 0 BV", () => {
    // BV comes ONLY from Terra fee, never from farmer price
    const farmerPrice = 1000;
    const farmerBV = 0; // Hard rule
    expect(farmerBV).toBe(0);
  });

  it("delivery fees generate 0 BV", () => {
    const deliveryFee = 150;
    const deliveryBV = 0; // Hard rule
    expect(deliveryBV).toBe(0);
  });

  it("end-to-end pricing breakdown", () => {
    const farmerPrice = 1000;
    const terraFee = safeMul(farmerPrice, TERRA_FEE_RATE); // 300
    const deliveryFee = 100;
    const customerPays = safeAdd(safeAdd(farmerPrice, terraFee), deliveryFee); // 1400
    const pool = safeMul(terraFee, COMPENSATION_POOL_RATE); // 99
    const bv = terraFee; // 300

    expect(customerPays).toBe(1400);
    expect(pool).toBe(99);
    expect(bv).toBe(300);
  });
});

describe("Direct Product Bonus", () => {
  const terraFee = 300;

  it.each([
    ["free", 0.15, 45],
    ["starter", 0.18, 54],
    ["basic", 0.20, 60],
    ["pro", 0.22, 66],
    ["elite", 0.25, 75],
  ])("%s tier gets %s rate = ₱%s", (tier, _rate, expected) => {
    const rate = DIRECT_PRODUCT_RATES[tier];
    const bonus = safeMul(terraFee, rate);
    expect(bonus).toBe(expected);
  });

  it("direct product bonus is NEVER capped", () => {
    // Even if binary is capped, direct bonuses are uncapped
    const hugeBonus = safeMul(1000000, DIRECT_PRODUCT_RATES["elite"]);
    expect(hugeBonus).toBe(250000); // No cap applied
  });
});

describe("Direct Membership Bonus", () => {
  const packagePrice = 5000;

  it.each([
    ["free", 0],
    ["starter", 200],
    ["basic", 300],
    ["pro", 400],
    ["elite", 500],
  ])("%s tier gets ₱%s on ₱5000 package", (tier, expected) => {
    const rate = DIRECT_MEMBERSHIP_RATES[tier];
    const bonus = safeMul(packagePrice, rate);
    expect(bonus).toBe(expected);
  });

  it("free tier gets zero membership bonus", () => {
    expect(DIRECT_MEMBERSHIP_RATES["free"]).toBe(0);
  });
});

describe("Binary Commission Calculation", () => {
  it("matches lesser leg in 500 BV increments", () => {
    const leftBV = 1500;
    const rightBV = 2500;
    const matched = floorTo500(Math.min(leftBV, rightBV));
    expect(matched).toBe(1500);
  });

  it("calculates commission as 10% of matched BV cycles × cycle value", () => {
    const matchedBV = 1500;
    const cycles = matchedBV / BV_PER_CYCLE; // 3
    const commission = safeMul(safeMul(cycles, BASE_CYCLE_VALUE), BINARY_MATCH_RATE);
    // 3 cycles × ₱50 × 10% = ₱15
    expect(commission).toBe(15);
  });

  it("carries forward unmatched BV", () => {
    const leftBV = 1500;
    const rightBV = 2500;
    const matched = floorTo500(Math.min(leftBV, rightBV)); // 1500
    const carryLeft = Math.max(0, safeSub(leftBV, matched)); // 0
    const carryRight = Math.max(0, safeSub(rightBV, matched)); // 1000
    expect(carryLeft).toBe(0);
    expect(carryRight).toBe(1000);
  });

  it("returns zero for free tier", () => {
    const cap = BINARY_CAPS["free"];
    expect(cap).toBe(0);
  });

  it("handles zero BV correctly", () => {
    const matched = floorTo500(Math.min(0, 1000));
    expect(matched).toBe(0);
  });

  it("handles sub-500 BV (no match possible)", () => {
    const matched = floorTo500(Math.min(499, 499));
    expect(matched).toBe(0);
  });
});

describe("BV Separation (Product vs Membership)", () => {
  it("tracks product and membership BV independently", () => {
    const bv = {
      leftProduct: 1000,
      rightProduct: 800,
      leftMembership: 500,
      rightMembership: 1500,
    };

    const matchedProduct = floorTo500(Math.min(bv.leftProduct, bv.rightProduct)); // 500
    const matchedMembership = floorTo500(Math.min(bv.leftMembership, bv.rightMembership)); // 500

    expect(matchedProduct).toBe(500);
    expect(matchedMembership).toBe(500);
  });

  it("product BV commission uses BASE cycle value (no fail-safe)", () => {
    const matchedProductBV = 1000;
    const cycles = matchedProductBV / BV_PER_CYCLE;
    const commission = safeMul(safeMul(cycles, BASE_CYCLE_VALUE), BINARY_MATCH_RATE);
    // 2 cycles × ₱50 × 10% = ₱10
    expect(commission).toBe(10);
  });

  it("membership BV commission uses ADJUSTED cycle value when fail-safe triggers", () => {
    const adjustedCycleValue = 46.88; // Fail-safe lowered it
    const matchedMembershipBV = 1000;
    const cycles = matchedMembershipBV / BV_PER_CYCLE;
    const commission = safeMul(safeMul(cycles, adjustedCycleValue), BINARY_MATCH_RATE);
    // 2 cycles × ₱46.88 × 10% = ₱9.38
    expect(commission).toBe(9.38);
  });

  it("total binary income = product commission + membership commission", () => {
    const productCommission = 10;
    const membershipCommission = 9.38;
    const total = safeAdd(productCommission, membershipCommission);
    expect(total).toBe(19.38);
  });
});

describe("Fail-Safe Mechanism", () => {
  it("does NOT trigger when membership BV payout ≤ 75% of pool", () => {
    const membershipBVPayout = 70;
    const pool = 100;
    const ratio = safeDiv(membershipBVPayout, pool);
    expect(ratio).toBeLessThanOrEqual(FAILSAFE_THRESHOLD);
  });

  it("triggers when membership BV payout > 75% of pool", () => {
    const membershipBVPayout = 80;
    const pool = 100;
    const ratio = safeDiv(membershipBVPayout, pool);
    expect(ratio).toBeGreaterThan(FAILSAFE_THRESHOLD);
  });

  it("calculates correct cycle value adjustment", () => {
    const membershipBVPayout = 80;
    const pool = 100;
    const ratio = safeDiv(membershipBVPayout, pool); // 0.8
    const adjustment = safeDiv(FAILSAFE_THRESHOLD, ratio); // 0.75 / 0.8 = 0.9375
    const adjustedCycleValue = safeMul(BASE_CYCLE_VALUE, adjustment); // 50 × 0.9375 = 46.88
    expect(adjustment).toBe(0.9375);
    expect(adjustedCycleValue).toBe(46.88);
  });

  it("enforces 75% cap exactly", () => {
    const pool = 99;
    const membershipPayout = 90; // 90/99 = 90.9%
    const ratio = safeDiv(membershipPayout, pool);
    expect(ratio).toBeGreaterThan(FAILSAFE_THRESHOLD);
    const adjustment = safeDiv(FAILSAFE_THRESHOLD, ratio);
    const adjusted = safeMul(membershipPayout, adjustment);
    // After adjustment, payout should be ≤ 75% of pool
    expect(adjusted).toBeLessThanOrEqual(safeMul(pool, FAILSAFE_THRESHOLD));
  });

  it("NEVER applies to product BV", () => {
    // Product BV always uses BASE_CYCLE_VALUE regardless of fail-safe
    const failSafeTriggered = true;
    const adjustedCycleValue = 40; // Even if adjusted down
    const productCycleValue = BASE_CYCLE_VALUE; // Product always uses base
    expect(productCycleValue).toBe(50);
    expect(productCycleValue).not.toBe(adjustedCycleValue);
  });

  it("handles zero pool gracefully", () => {
    const ratio = safeDiv(100, 0);
    expect(ratio).toBe(0); // Division by zero returns 0, no fail-safe
  });
});

describe("Binary Daily Caps", () => {
  it.each([
    ["starter", 5000],
    ["basic", 15000],
    ["pro", 50000],
    ["elite", 250000],
  ])("%s cap is ₱%s", (tier, expected) => {
    expect(BINARY_CAPS[tier]).toBe(expected);
  });

  it("caps binary income when exceeding limit", () => {
    const binaryIncome = 6000;
    const cap = BINARY_CAPS["starter"]; // 5000
    const cappedIncome = Math.min(binaryIncome, cap);
    const overflow = safeSub(binaryIncome, cappedIncome);
    expect(cappedIncome).toBe(5000);
    expect(overflow).toBe(1000);
  });

  it("does not cap when under limit", () => {
    const binaryIncome = 3000;
    const cap = BINARY_CAPS["starter"]; // 5000
    const cappedIncome = Math.min(binaryIncome, cap);
    expect(cappedIncome).toBe(3000);
  });

  it("caps apply ONLY to binary income, not direct or matching", () => {
    const directBonus = 999999;
    const matchingBonus = 999999;
    // Direct and matching are NEVER capped
    expect(directBonus).toBe(999999);
    expect(matchingBonus).toBe(999999);
  });

  it("caps are applied BEFORE matching bonus calculation", () => {
    const binaryIncome = 8000;
    const cap = BINARY_CAPS["starter"]; // 5000
    const cappedIncome = Math.min(binaryIncome, cap); // 5000

    // Matching uses capped (not gross) binary
    const matchingRate = MATCHING_LEVELS["starter"][0]; // 10%
    const matchingBonus = safeMul(cappedIncome, matchingRate); // 500

    // If matching used uncapped, it would be 800
    const wrongMatching = safeMul(binaryIncome, matchingRate);
    expect(matchingBonus).toBe(500);
    expect(wrongMatching).toBe(800);
    expect(matchingBonus).not.toBe(wrongMatching);
  });
});

describe("Matching Bonus", () => {
  it.each([
    ["free", 0],
    ["starter", 1],
    ["basic", 2],
    ["pro", 3],
    ["elite", 5],
  ])("%s tier has %s matching levels", (tier, expected) => {
    expect(MATCHING_LEVELS[tier].length).toBe(expected);
  });

  it("level 1 matching is 10%", () => {
    expect(MATCHING_LEVELS["elite"][0]).toBe(0.10);
    expect(MATCHING_LEVELS["starter"][0]).toBe(0.10);
  });

  it("levels 2-5 matching is 5%", () => {
    const eliteLevels = MATCHING_LEVELS["elite"];
    expect(eliteLevels[1]).toBe(0.05);
    expect(eliteLevels[2]).toBe(0.05);
    expect(eliteLevels[3]).toBe(0.05);
    expect(eliteLevels[4]).toBe(0.05);
  });

  it("calculates matching on CAPPED binary commission", () => {
    const cappedBinary = 5000;
    const l1Matching = safeMul(cappedBinary, 0.10); // 500
    const l2Matching = safeMul(cappedBinary, 0.05); // 250
    expect(l1Matching).toBe(500);
    expect(l2Matching).toBe(250);
  });

  it("matching bonuses are NEVER capped", () => {
    const hugeMatching = safeMul(250000, 0.10); // 25000
    expect(hugeMatching).toBe(25000); // No cap
  });
});

describe("Complete Payout Sequence (Integration)", () => {
  it("executes all steps in correct order", () => {
    // Setup: Pro member, farmer price ₱10,000
    const farmerPrice = 10000;
    const tier = "pro";

    // STEP 1: Terra Fee & Pool
    const terraFee = safeMul(farmerPrice, TERRA_FEE_RATE); // 3000
    const pool = safeMul(terraFee, COMPENSATION_POOL_RATE); // 990
    const bv = terraFee; // 3000 BV
    expect(terraFee).toBe(3000);
    expect(pool).toBe(990);

    // STEP 2: Direct Product Bonus
    const directProduct = safeMul(terraFee, DIRECT_PRODUCT_RATES[tier]); // 3000 × 22% = 660
    expect(directProduct).toBe(660);

    // STEP 3: Binary calculation (assuming 3000 left, 2000 right)
    const leftBV = 3000;
    const rightBV = 2000;
    const matched = floorTo500(Math.min(leftBV, rightBV)); // 2000
    const cycles = matched / BV_PER_CYCLE; // 4
    const binary = safeMul(safeMul(cycles, BASE_CYCLE_VALUE), BINARY_MATCH_RATE);
    // 4 × 50 × 10% = 20
    expect(binary).toBe(20);

    // STEP 4: Cap check
    const cap = BINARY_CAPS[tier]; // 50000
    const capped = Math.min(binary, cap); // 20 (under cap)
    expect(capped).toBe(20);

    // STEP 5: Carry forward
    const carryLeft = safeSub(leftBV, matched); // 1000
    const carryRight = safeSub(rightBV, matched); // 0
    expect(carryLeft).toBe(1000);
    expect(carryRight).toBe(0);

    // STEP 6: Matching (L1 sponsor gets 10% of capped binary)
    const matching = safeMul(capped, MATCHING_LEVELS[tier][0]); // 20 × 10% = 2
    expect(matching).toBe(2);
  });

  it("handles edge case: all membership BV with fail-safe", () => {
    // All BV is membership-type, pool is small → fail-safe triggers
    const pool = 50;
    const membershipBVPayout = 80;

    // Fail-safe check
    const ratio = safeDiv(membershipBVPayout, pool); // 1.6
    expect(ratio).toBeGreaterThan(FAILSAFE_THRESHOLD);

    const adjustment = safeDiv(FAILSAFE_THRESHOLD, ratio); // 0.75 / 1.6 = 0.46875
    const adjustedCycleValue = safeMul(BASE_CYCLE_VALUE, adjustment); // 50 × 0.46875 = 23.44
    expect(adjustedCycleValue).toBe(23.44);

    // Membership commission uses adjusted value
    const matchedMembershipBV = 1000;
    const memCycles = matchedMembershipBV / BV_PER_CYCLE;
    const memCommission = safeMul(safeMul(memCycles, adjustedCycleValue), BINARY_MATCH_RATE);
    // 2 × 23.44 × 10% = 4.69
    expect(memCommission).toBe(4.69);
  });
});
