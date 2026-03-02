import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Lock,
  Coins,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Users,
  GitBranch,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import WalletCard from "@/components/wallet/WalletCard";
import RankProgress from "@/components/rank/RankProgress";

// ─── Types ───
interface PayoutRecord {
  id: string;
  payout_period: string;
  bonus_type: string;
  gross_amount: number;
  net_amount: number;
  level_depth: number | null;
  notes: string | null;
  created_at: string;
  source_user_id?: string | null;
  source_order_id?: string | null;
}

interface BinaryLedgerRecord {
  id: string;
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
  adjusted_cycle_value: number | null;
  created_at: string;
}

interface TokenLedgerRecord {
  id: string;
  tokens_issued: number;
  php_reward_value: number;
  token_market_price: number;
  source_description: string | null;
  created_at: string;
}

interface MemberEarningsPanelProps {
  userId: string;
  membership: {
    tier: string;
    current_rank_id?: string | null;
    left_leg_id?: string | null;
    right_leg_id?: string | null;
    membership_bv?: number;
    package_price?: number;
  } | null;
  walletData: {
    available_balance: number;
    pending_balance: number;
    total_withdrawn: number;
  } | null;
  payouts: PayoutRecord[];
  totalBV: number;
  binaryStats: {
    left_bv: number;
    right_bv: number;
    matched_bv?: number;
    carryforward_left?: number;
    carryforward_right?: number;
  };
  binaryLedger?: BinaryLedgerRecord[];
  tokenLedger?: TokenLedgerRecord[];
  tokenBalance?: number;
  directReferrals?: number;
  profileData?: {
    agri_token_balance: number | null;
    external_wallet_address: string | null;
  } | null;
}

// ─── Constants ───
const TIER_RATES = {
  free:    { directProduct: 0.15, directMembership: 0,    binaryMatch: 0,    matchingLevels: 0, dailyCap: 0,      label: "Free",    price: 0,    bv: 0 },
  starter: { directProduct: 0.18, directMembership: 0.04, binaryMatch: 0.10, matchingLevels: 1, dailyCap: 5000,   label: "Starter", price: 500,  bv: 500 },
  basic:   { directProduct: 0.20, directMembership: 0.06, binaryMatch: 0.10, matchingLevels: 2, dailyCap: 15000,  label: "Basic",   price: 1000, bv: 1000 },
  pro:     { directProduct: 0.22, directMembership: 0.08, binaryMatch: 0.10, matchingLevels: 3, dailyCap: 50000,  label: "Pro",     price: 3000, bv: 3000 },
  elite:   { directProduct: 0.25, directMembership: 0.10, binaryMatch: 0.10, matchingLevels: 5, dailyCap: 250000, label: "Elite",   price: 5000, bv: 5000 },
} as const;

const MATCHING_RATES: Record<number, number> = {
  1: 0.10, // L1 = 10%
  2: 0.05, // L2 = 5%
  3: 0.05, // L3 = 5%
  4: 0.05, // L4 = 5%
  5: 0.05, // L5 = 5%
};

const BONUS_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  direct_product: { label: "Direct Product", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  direct_membership: { label: "Direct Membership", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  binary: { label: "Binary Match", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  matching: { label: "Matching Bonus", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  token: { label: "Token Reward", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
};

const MemberEarningsPanel = ({
  userId,
  membership,
  walletData,
  payouts,
  totalBV,
  binaryStats,
  binaryLedger = [],
  tokenLedger = [],
  tokenBalance = 0,
  directReferrals = 0,
  profileData,
}: MemberEarningsPanelProps) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedSection, setExpandedSection] = useState<string | null>("commissions");

  const tier = (membership?.tier || "free") as keyof typeof TIER_RATES;
  const rates = TIER_RATES[tier] || TIER_RATES.free;
  const isPaid = tier !== "free";

  // ─── Computed earnings by type ───
  const earningsByType = useMemo(() => {
    const result = { direct_product: 0, direct_membership: 0, binary: 0, matching: 0, token: 0 };
    payouts.forEach(p => {
      if (p.bonus_type in result) {
        result[p.bonus_type as keyof typeof result] += Number(p.net_amount);
      }
    });
    return result;
  }, [payouts]);

  // ─── Latest binary ledger entry ───
  const latestBinary = binaryLedger.length > 0 ? binaryLedger[0] : null;

  // ─── Binary cap usage today ───
  const todayBinaryEarned = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return payouts
      .filter(p => p.bonus_type === "binary" && p.created_at.startsWith(today))
      .reduce((sum, p) => sum + Number(p.net_amount), 0);
  }, [payouts]);

  const capPercent = rates.dailyCap > 0 ? Math.min((todayBinaryEarned / rates.dailyCap) * 100, 100) : 0;

  // ─── Qualification checklist ───
  const qualifications = [
    { label: "Paid membership activated", met: isPaid, required: true },
    { label: "At least one active left leg", met: !!membership?.left_leg_id, required: true },
    { label: "At least one active right leg", met: !!membership?.right_leg_id, required: true },
    { label: "Product BV generated", met: totalBV > 0, required: true },
  ];
  const allQualified = qualifications.every(q => q.met);

  // ─── Filtered payouts ───
  const filteredPayouts = typeFilter === "all"
    ? payouts
    : payouts.filter(p => p.bonus_type === typeFilter);

  const agriTokenBalance = profileData?.agri_token_balance ?? tokenBalance;

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* ═══ Wallet Balance Cards ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            Available Balance
          </div>
          <p className="text-2xl font-bold text-primary">₱{(walletData?.available_balance || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            Pending Balance
          </div>
          <p className="text-2xl font-bold text-amber-500">₱{(walletData?.pending_balance || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Processing</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Lock className="h-4 w-4" />
            Total Withdrawn
          </div>
          <p className="text-2xl font-bold">₱{(walletData?.total_withdrawn || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">All-time</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Coins className="h-4 w-4" />
            AGRI Token Balance
          </div>
          <p className="text-2xl font-bold">{Number(agriTokenBalance).toLocaleString()} AGRI</p>
          <p className="text-xs text-muted-foreground">Non-cash rewards</p>
        </Card>
      </div>

      {/* ═══ Qualification Checklist ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Earning Qualification Status
          </CardTitle>
          <CardDescription>You must meet all criteria to earn binary & matching commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {qualifications.map((q, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  q.met
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                {q.met ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <span className="text-sm font-medium">{q.label}</span>
              </div>
            ))}
          </div>
          {!allQualified && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Complete all qualifications above to unlock binary and matching commissions. Direct product bonuses are still available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ Commission Breakdown ═══ */}
      <Collapsible open={expandedSection === "commissions"} onOpenChange={() => toggleSection("commissions")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Commission Breakdown — {rates.label} Package
                </CardTitle>
                {expandedSection === "commissions" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {/* Direct Product Sales */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Direct Product Sales Bonus
                  </h4>
                  <Badge variant="outline" className="font-bold text-emerald-600">{(rates.directProduct * 100).toFixed(0)}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Formula: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">Terra Fee × {(rates.directProduct * 100).toFixed(0)}%</code>
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total earned</span>
                  <span className="font-bold text-emerald-600">₱{earningsByType.direct_product.toLocaleString()}</span>
                </div>
              </div>

              {/* Direct Membership Sales */}
              <div className={`p-4 rounded-xl border ${isPaid ? "border-blue-500/20 bg-blue-500/5" : "border-muted bg-muted/30 opacity-60"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Direct Membership Sales Bonus
                  </h4>
                  <Badge variant="outline" className={`font-bold ${isPaid ? "text-blue-600" : "text-muted-foreground"}`}>
                    {isPaid ? `${(rates.directMembership * 100).toFixed(0)}%` : "N/A"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Formula: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">Package Price × {isPaid ? `${(rates.directMembership * 100).toFixed(0)}%` : "—"}</code>
                </p>
                {!isPaid && (
                  <p className="text-xs text-amber-600">Upgrade to a paid package to unlock membership commissions.</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total earned</span>
                  <span className="font-bold text-blue-600">₱{earningsByType.direct_membership.toLocaleString()}</span>
                </div>
              </div>

              {/* Binary Commission */}
              <div className={`p-4 rounded-xl border ${isPaid ? "border-purple-500/20 bg-purple-500/5" : "border-muted bg-muted/30 opacity-60"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Binary Commission (Pairing)
                  </h4>
                  <Badge variant="outline" className={`font-bold ${isPaid ? "text-purple-600" : "text-muted-foreground"}`}>
                    {isPaid ? "10%" : "N/A"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Formula: <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">Lesser Leg BV × 10%</code>
                </p>

                {/* BV breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                    <p className="text-xs text-muted-foreground">Left Leg BV</p>
                    <p className="text-lg font-bold text-emerald-600">{binaryStats.left_bv.toLocaleString()}</p>
                    {latestBinary && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Product: {Number(latestBinary.left_product_bv).toLocaleString()} | Membership: {Number(latestBinary.left_membership_bv).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-xs text-muted-foreground">Right Leg BV</p>
                    <p className="text-lg font-bold text-blue-600">{binaryStats.right_bv.toLocaleString()}</p>
                    {latestBinary && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Product: {Number(latestBinary.right_product_bv).toLocaleString()} | Membership: {Number(latestBinary.right_membership_bv).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Matched & Carryforward */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Matched BV</p>
                    <p className="text-sm font-bold">{(binaryStats.matched_bv || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Carry Left</p>
                    <p className="text-sm font-bold">{(binaryStats.carryforward_left || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Carry Right</p>
                    <p className="text-sm font-bold">{(binaryStats.carryforward_right || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-muted-foreground">Total binary earned</span>
                  <span className="font-bold text-purple-600">₱{earningsByType.binary.toLocaleString()}</span>
                </div>
              </div>

              {/* Matching Bonus */}
              <div className={`p-4 rounded-xl border ${isPaid ? "border-amber-500/20 bg-amber-500/5" : "border-muted bg-muted/30 opacity-60"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Matching Bonus (Downline Binary)
                  </h4>
                  <Badge variant="outline" className={`font-bold ${isPaid ? "text-amber-600" : "text-muted-foreground"}`}>
                    {isPaid ? `${rates.matchingLevels} Level${rates.matchingLevels > 1 ? "s" : ""}` : "N/A"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Paid on downline binary income actually received. Uncapped.
                </p>
                {isPaid && (
                  <div className="space-y-1.5">
                    {Array.from({ length: rates.matchingLevels }, (_, i) => i + 1).map(level => (
                      <div key={level} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-md bg-muted/50">
                        <span>Level {level}</span>
                        <span className="font-bold">{(MATCHING_RATES[level] * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Eligibility: your rank/package must ≥ downline rank/package
                </p>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-muted-foreground">Total matching earned</span>
                  <span className="font-bold text-amber-600">₱{earningsByType.matching.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ═══ Binary Daily Cap Status ═══ */}
      {isPaid && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Binary Daily Cap — {rates.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Today's binary earnings</span>
              <span className="font-bold">₱{todayBinaryEarned.toLocaleString()} / ₱{rates.dailyCap.toLocaleString()}</span>
            </div>
            <Progress value={capPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {capPercent >= 100
                ? "Daily cap reached. Excess binary earnings are deferred per admin policy."
                : `${(100 - capPercent).toFixed(1)}% remaining capacity today.`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" /> Caps apply only to binary income. Direct bonuses and matching are uncapped.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ═══ Fail-Safe Transparency ═══ */}
      {latestBinary && (
        <Card className={latestBinary.fail_safe_triggered ? "border-amber-500/30" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${latestBinary.fail_safe_triggered ? "text-amber-500" : "text-muted-foreground"}`} />
              Fail-Safe Status — {latestBinary.payout_period}
            </CardTitle>
            <CardDescription>
              Ensures Membership BV payouts never exceed 75% of the Compensation Pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Triggered</p>
                <p className={`text-sm font-bold ${latestBinary.fail_safe_triggered ? "text-amber-500" : "text-emerald-500"}`}>
                  {latestBinary.fail_safe_triggered ? "Yes" : "No"}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Adjusted Cycle Value</p>
                <p className="text-sm font-bold">
                  ₱{latestBinary.adjusted_cycle_value != null ? Number(latestBinary.adjusted_cycle_value).toFixed(2) : "50.00"}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Base Cycle Value</p>
                <p className="text-sm font-bold">₱50.00</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Binary Income</p>
                <p className="text-sm font-bold">₱{Number(latestBinary.binary_income).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              Fail-safe affects Membership BV only. Product bonuses, matching bonuses, and token rewards are not affected.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ═══ Token Rewards ═══ */}
      <Collapsible open={expandedSection === "tokens"} onOpenChange={() => toggleSection("tokens")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="h-5 w-5 text-cyan-500" />
                  AGRI Token Rewards
                </CardTitle>
                {expandedSection === "tokens" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Token Balance</p>
                    <p className="text-2xl font-bold">{Number(agriTokenBalance).toLocaleString()} AGRI</p>
                  </div>
                  <Badge variant="outline" className="text-cyan-600">Non-Cash Reward</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Formula: Tokens Issued = Reward PHP ÷ Token Market Price. Tokens do not reduce the cash commission pool.
                </p>
              </div>

              {tokenLedger.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">PHP Value</TableHead>
                        <TableHead className="text-right">Price/Token</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokenLedger.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">{entry.source_description || "—"}</TableCell>
                          <TableCell className="text-right text-sm">₱{Number(entry.php_reward_value).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm">₱{Number(entry.token_market_price).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">{Number(entry.tokens_issued).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No token rewards yet</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ═══ Wallet & Rank Cards ═══ */}
      <div className="grid md:grid-cols-2 gap-6">
        <WalletCard userId={userId} />
        <RankProgress
          userId={userId}
          currentRankId={membership?.current_rank_id || undefined}
          personalBV={totalBV}
          leftLegBV={binaryStats.left_bv}
          rightLegBV={binaryStats.right_bv}
          directReferrals={directReferrals}
        />
      </div>

      {/* ═══ Transaction History ═══ */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>Your earnings and payout records</CardDescription>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="binary">Binary Match</SelectItem>
                <SelectItem value="direct_product">Direct Product</SelectItem>
                <SelectItem value="direct_membership">Direct Membership</SelectItem>
                <SelectItem value="matching">Matching Bonus</SelectItem>
                <SelectItem value="token">Token Reward</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Complete sales and build your network to earn</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source / Notes</TableHead>
                    <TableHead>BV Source</TableHead>
                    <TableHead className="text-right">Gross (PHP)</TableHead>
                    <TableHead className="text-right">Net (PHP)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => {
                    const typeConfig = BONUS_TYPE_LABELS[payout.bonus_type] || {
                      label: payout.bonus_type,
                      color: "bg-muted text-muted-foreground",
                    };

                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {payout.notes || "—"}
                          {payout.level_depth != null && ` (L${payout.level_depth})`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payout.bonus_type.includes("membership") ? "Membership" : "Product"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₱{Number(payout.gross_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₱{Number(payout.net_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Paid</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberEarningsPanel;
