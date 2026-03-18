import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";

export interface BusinessData {
  walletData: { available_balance: number; pending_balance: number; total_withdrawn: number; internal_balance: number } | null;
  membership: { tier: string; package_price: number; membership_bv: number } | null;
  totalEarnings: number;
  binaryStats: { left_bv: number; right_bv: number; matched_bv: number };
  tokenBalance: number;
  referralCode: string;
  recentEarnings: Array<{ bonus_type: string; net_amount: number; payout_period: string; source_order_id: string | null }>;
  isAnyAdmin: boolean;
}

export interface AdminSystemData {
  totalMembers: number;
  activeMembers: number;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: number;
  systemTotalEarnings: number;
  systemTotalVolume: number;
  systemLeftBv: number;
  systemRightBv: number;
  systemMatchedBv: number;
  totalCouponSales: number;
  activeCoupons: number;
  totalTokensIssued: number;
  totalWalletBalance: number;
  totalActivationValue: number;
  recentSystemEarnings: Array<{ bonus_type: string; net_amount: number; payout_period: string; source_order_id: string | null }>;
}

interface ViewAsMember {
  userId: string;
  name: string;
  email: string;
}

interface BusinessCentreContextValue {
  data: BusinessData;
  loading: boolean;
  // View as Member
  viewAsMember: ViewAsMember | null;
  setViewAsMember: (m: ViewAsMember | null) => void;
  isViewingAsMember: boolean;
  effectiveUserId: string | null;
  // Admin system-wide data
  adminData: AdminSystemData;
  adminPendingWithdrawals: number;
  adminPendingAmount: number;
  adminTotalMembers: number;
}

const emptyAdminData: AdminSystemData = {
  totalMembers: 0,
  activeMembers: 0,
  pendingWithdrawals: 0,
  pendingWithdrawalAmount: 0,
  systemTotalEarnings: 0,
  systemTotalVolume: 0,
  systemLeftBv: 0,
  systemRightBv: 0,
  systemMatchedBv: 0,
  totalCouponSales: 0,
  activeCoupons: 0,
  totalTokensIssued: 0,
  totalWalletBalance: 0,
  totalActivationValue: 0,
  recentSystemEarnings: [],
};

const BusinessCentreContext = createContext<BusinessCentreContextValue | null>(null);

export const useBusinessCentre = () => {
  const ctx = useContext(BusinessCentreContext);
  if (!ctx) throw new Error("useBusinessCentre must be inside BusinessCentreProvider");
  return ctx;
};

export const BusinessCentreProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isAdmin, isAnyAdmin } = useUserRoles();

  const [viewAsMember, setViewAsMember] = useState<ViewAsMember | null>(null);
  const isViewingAsMember = viewAsMember !== null;
  const effectiveUserId = viewAsMember?.userId || user?.id || null;

  // Data state
  const [walletData, setWalletData] = useState<BusinessData["walletData"]>(null);
  const [membership, setMembership] = useState<BusinessData["membership"]>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [binaryStats, setBinaryStats] = useState({ left_bv: 0, right_bv: 0, matched_bv: 0 });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [recentEarnings, setRecentEarnings] = useState<BusinessData["recentEarnings"]>([]);
  const [loading, setLoading] = useState(true);

  // Admin system-wide data
  const [adminData, setAdminData] = useState<AdminSystemData>(emptyAdminData);

  const fetchData = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);

    const [walletRes, membershipRes, earningsRes, binaryRes, tokenRes] = await Promise.all([
      supabase.from("wallets").select("available_balance, pending_balance, total_withdrawn, internal_balance").eq("user_id", effectiveUserId).maybeSingle(),
      supabase.from("memberships").select("tier, package_price, membership_bv").eq("user_id", effectiveUserId).maybeSingle(),
      supabase.from("payout_ledger").select("bonus_type, net_amount, payout_period, source_order_id").eq("user_id", effectiveUserId).order("created_at", { ascending: false }).limit(20),
      supabase.from("binary_ledger").select("left_bv, right_bv, matched_bv").eq("user_id", effectiveUserId).order("created_at", { ascending: false }).limit(1),
      supabase.from("profiles").select("agri_token_balance, referral_code").eq("user_id", effectiveUserId).maybeSingle(),
    ]);

    if (walletRes.data) {
      setWalletData({
        available_balance: Number(walletRes.data.available_balance) || 0,
        pending_balance: Number(walletRes.data.pending_balance) || 0,
        total_withdrawn: Number(walletRes.data.total_withdrawn) || 0,
        internal_balance: Number(walletRes.data.internal_balance) || 0,
      });
    }

    if (membershipRes.data) {
      setMembership({
        tier: membershipRes.data.tier || "free",
        package_price: Number(membershipRes.data.package_price) || 0,
        membership_bv: Number(membershipRes.data.membership_bv) || 0,
      });
    }

    if (earningsRes.data) {
      setRecentEarnings(earningsRes.data);
      setTotalEarnings(earningsRes.data.reduce((s, r) => s + Number(r.net_amount), 0));
    }

    if (binaryRes.data && binaryRes.data.length > 0) {
      const b = binaryRes.data[0];
      setBinaryStats({
        left_bv: Number(b.left_bv) || 0,
        right_bv: Number(b.right_bv) || 0,
        matched_bv: Number(b.matched_bv) || 0,
      });
    }

    if (tokenRes.data) {
      setTokenBalance(Number(tokenRes.data.agri_token_balance) || 0);
      setReferralCode(tokenRes.data.referral_code || "");
    }

    setLoading(false);
  }, [effectiveUserId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Admin system-wide data fetch
  useEffect(() => {
    if (!user || !isAnyAdmin) return;

    const fetchAdminData = async () => {
      const [
        withdrawalRes,
        membershipsRes,
        activeMembersRes,
        systemEarningsRes,
        binaryLedgerRes,
        couponPurchasesRes,
        activeCouponsRes,
        tokenLedgerRes,
        walletsRes,
        recentPayoutsRes,
      ] = await Promise.all([
        // Pending withdrawals
        supabase.from("withdrawal_requests").select("amount", { count: "exact" }).eq("status", "pending"),
        // Total members
        supabase.from("memberships").select("id", { count: "exact", head: true }),
        // Active members (non-free tier)
        supabase.from("memberships").select("id", { count: "exact", head: true }).neq("tier", "free"),
        // System total earnings
        supabase.from("payout_ledger").select("net_amount"),
        // System BV totals
        supabase.from("binary_ledger").select("left_bv, right_bv, matched_bv").order("created_at", { ascending: false }).limit(100),
        // Coupon sales
        supabase.from("coupon_purchases").select("price_paid", { count: "exact" }),
        // Active coupons
        supabase.from("coupon_purchases").select("id", { count: "exact", head: true }).eq("status", "active"),
        // Token issuance
        supabase.from("token_ledger").select("tokens_issued"),
        // Total wallet balances
        supabase.from("wallets").select("available_balance"),
        // Recent system earnings
        supabase.from("payout_ledger").select("bonus_type, net_amount, payout_period, source_order_id").order("created_at", { ascending: false }).limit(20),
      ]);

      const pendingWithdrawals = withdrawalRes.count || 0;
      const pendingAmount = withdrawalRes.data ? withdrawalRes.data.reduce((s, r) => s + Number(r.amount), 0) : 0;
      const systemEarnings = systemEarningsRes.data ? systemEarningsRes.data.reduce((s, r) => s + Number(r.net_amount), 0) : 0;

      // Aggregate BV across all recent binary ledger entries
      let sysLeftBv = 0, sysRightBv = 0, sysMatchedBv = 0;
      if (binaryLedgerRes.data) {
        for (const b of binaryLedgerRes.data) {
          sysLeftBv += Number(b.left_bv) || 0;
          sysRightBv += Number(b.right_bv) || 0;
          sysMatchedBv += Number(b.matched_bv) || 0;
        }
      }

      const couponSales = couponPurchasesRes.data ? couponPurchasesRes.data.reduce((s, r) => s + Number(r.price_paid), 0) : 0;
      const tokensIssued = tokenLedgerRes.data ? tokenLedgerRes.data.reduce((s, r) => s + Number(r.tokens_issued), 0) : 0;
      const totalWalletBal = walletsRes.data ? walletsRes.data.reduce((s, r) => s + Number(r.available_balance), 0) : 0;

      setAdminData({
        totalMembers: membershipsRes.count || 0,
        activeMembers: activeMembersRes.count || 0,
        pendingWithdrawals,
        pendingWithdrawalAmount: pendingAmount,
        systemTotalEarnings: systemEarnings,
        systemTotalVolume: sysLeftBv + sysRightBv,
        systemLeftBv: sysLeftBv,
        systemRightBv: sysRightBv,
        systemMatchedBv: sysMatchedBv,
        totalCouponSales: couponSales,
        activeCoupons: activeCouponsRes.count || 0,
        totalTokensIssued: tokensIssued,
        totalWalletBalance: totalWalletBal,
        totalActivationValue: 0,
        recentSystemEarnings: recentPayoutsRes.data || [],
      });
    };

    fetchAdminData();
  }, [user, isAnyAdmin]);

  const businessData: BusinessData = {
    walletData,
    membership,
    totalEarnings,
    binaryStats,
    tokenBalance,
    referralCode,
    recentEarnings,
    isAnyAdmin,
  };

  return (
    <BusinessCentreContext.Provider value={{
      data: businessData,
      loading,
      viewAsMember,
      setViewAsMember,
      isViewingAsMember,
      effectiveUserId,
      adminData,
      adminPendingWithdrawals: adminData.pendingWithdrawals,
      adminPendingAmount: adminData.pendingWithdrawalAmount,
      adminTotalMembers: adminData.totalMembers,
    }}>
      {children}
    </BusinessCentreContext.Provider>
  );
};
