import { useState } from "react";
import {
  TrendingUp,
  Wallet,
  DollarSign,
  Clock,
  Lock,
  Coins,
  Filter,
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
import WalletCard from "@/components/wallet/WalletCard";
import RankProgress from "@/components/rank/RankProgress";

interface PayoutRecord {
  id: string;
  payout_period: string;
  bonus_type: string;
  gross_amount: number;
  net_amount: number;
  level_depth: number | null;
  notes: string | null;
  created_at: string;
}

interface MemberEarningsPanelProps {
  userId: string;
  membership: {
    current_rank_id?: string | null;
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
  };
}

const BONUS_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  direct_product: { label: "Direct Product", color: "bg-green-500/10 text-green-600" },
  direct_membership: { label: "Direct Membership", color: "bg-blue-500/10 text-blue-600" },
  binary: { label: "Binary Match", color: "bg-purple-500/10 text-purple-600" },
  matching: { label: "Matching Bonus", color: "bg-amber-500/10 text-amber-600" },
  token: { label: "Token Reward", color: "bg-cyan-500/10 text-cyan-600" },
};

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  posted: { label: "Posted", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
};

const MemberEarningsPanel = ({
  userId,
  membership,
  walletData,
  payouts,
  totalBV,
  binaryStats,
}: MemberEarningsPanelProps) => {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredPayouts = typeFilter === "all" 
    ? payouts 
    : payouts.filter(p => p.bonus_type === typeFilter);

  const lockedBalance = 0; // Placeholder for vesting balance

  return (
    <div className="space-y-6">
      {/* Wallet Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
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
            Locked / Vesting
          </div>
          <p className="text-2xl font-bold">₱{lockedBalance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Token vesting</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Coins className="h-4 w-4" />
            Token Balance
          </div>
          <p className="text-2xl font-bold">0 AGRI</p>
          <p className="text-xs text-muted-foreground">≈ ₱0.00</p>
        </Card>
      </div>

      {/* Wallet & Rank Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <WalletCard userId={userId} />
        <RankProgress
          userId={userId}
          currentRankId={membership?.current_rank_id || undefined}
          personalBV={totalBV}
          leftLegBV={binaryStats.left_bv}
          rightLegBV={binaryStats.right_bv}
          directReferrals={0}
        />
      </div>

      {/* Transaction Table */}
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
                    <TableHead>Source Member</TableHead>
                    <TableHead>BV Source</TableHead>
                    <TableHead className="text-right">Amount (PHP)</TableHead>
                    <TableHead className="text-right">Token Amount</TableHead>
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
                          <Badge className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payout.notes || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payout.bonus_type.includes('membership') ? 'Membership' : 'Product'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₱{Number(payout.net_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          —
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
