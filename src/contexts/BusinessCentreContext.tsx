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
  // Admin data
  adminPendingWithdrawals: number;
  adminPendingAmount: number;
  adminTotalMembers: number;
}

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

  // Admin data
  const [adminPendingWithdrawals, setAdminPendingWithdrawals] = useState(0);
  const [adminPendingAmount, setAdminPendingAmount] = useState(0);
  const [adminTotalMembers, setAdminTotalMembers] = useState(0);

  const fetchData = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);

    const [walletRes, membershipRes, earningsRes, binaryRes, tokenRes, profileRes] = await Promise.all([
      supabase.from("wallets").select("available_balance, pending_balance, total_withdrawn, internal_balance").eq("user_id", effectiveUserId).maybeSingle(),
      supabase.from("memberships").select("tier, package_price, membership_bv").eq("user_id", effectiveUserId).maybeSingle(),
      supabase.from("payout_ledger").select("bonus_type, net_amount, payout_period, source_order_id").eq("user_id", effectiveUserId).order("created_at", { ascending: false }).limit(20),
      supabase.from("binary_ledger").select("left_bv, right_bv, matched_bv").eq("user_id", effectiveUserId).order("created_at", { ascending: false }).limit(1),
      supabase.from("profiles").select("agri_token_balance, referral_code").eq("user_id", effectiveUserId).maybeSingle(),
      Promise.resolve(null),
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

  // Admin data
  useEffect(() => {
    if (!user || !isAnyAdmin) return;
    supabase.from("withdrawal_requests").select("amount", { count: "exact" })
      .eq("status", "pending")
      .then(({ data, count }) => {
        setAdminPendingWithdrawals(count || 0);
        setAdminPendingAmount(data ? data.reduce((s, r) => s + Number(r.amount), 0) : 0);
      });
    supabase.from("memberships").select("id", { count: "exact", head: true })
      .then(({ count }) => setAdminTotalMembers(count || 0));
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
      adminPendingWithdrawals,
      adminPendingAmount,
      adminTotalMembers,
    }}>
      {children}
    </BusinessCentreContext.Provider>
  );
};
