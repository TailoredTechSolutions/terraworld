import { useState } from "react";
import {
  GitBranch,
  ArrowLeftCircle,
  ArrowRightCircle,
  Crown,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberGenealogyPanelProps {
  userId: string;
  membership: {
    tier: string;
    left_leg_id: string | null;
    right_leg_id: string | null;
  } | null;
  binaryStats: {
    left_bv: number;
    right_bv: number;
    matched_bv: number;
    carryforward_left: number;
    carryforward_right: number;
  };
  totalEarnings: number;
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-secondary text-secondary-foreground",
  basic: "bg-accent/20 text-accent-foreground",
  pro: "bg-primary/20 text-primary",
  elite: "bg-gradient-to-r from-primary to-accent text-primary-foreground",
};

interface TreeNode {
  id: string;
  username: string;
  package: string;
  status: 'active' | 'inactive';
  leftBV: number;
  rightBV: number;
  isOpen: boolean;
}

// Mock downline data for visualization
const mockLeftDownline: TreeNode[] = [
  { id: 'L1', username: 'maria_santos', package: 'starter', status: 'active', leftBV: 1500, rightBV: 1200, isOpen: false },
  { id: 'L2', username: 'juan_dela_cruz', package: 'basic', status: 'active', leftBV: 3000, rightBV: 2800, isOpen: false },
];

const mockRightDownline: TreeNode[] = [
  { id: 'R1', username: 'ana_reyes', package: 'pro', status: 'active', leftBV: 5000, rightBV: 4500, isOpen: false },
];

const MemberGenealogyPanel = ({
  userId,
  membership,
  binaryStats,
  totalEarnings,
}: MemberGenealogyPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placementView, setPlacementView] = useState<"sponsor" | "placement">("placement");
  const [expandedLevels, setExpandedLevels] = useState(1);

  const tierConfig = membership ? TIER_COLORS[membership.tier] : TIER_COLORS.free;
  const matchedToday = Math.min(binaryStats.left_bv, binaryStats.right_bv);
  const binaryEarningsToday = matchedToday * 0.10;

  const renderTreeNode = (node: TreeNode, side: 'left' | 'right') => (
    <div
      key={node.id}
      className={`p-3 rounded-lg border-2 text-center min-w-[140px] ${
        node.status === 'active' 
          ? "bg-secondary/50 border-secondary" 
          : "bg-muted/30 border-dashed border-muted-foreground/30"
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{node.id}</span>
      </div>
      <p className="font-medium text-sm truncate">{node.username}</p>
      <Badge variant="outline" className={`mt-1 text-xs ${TIER_COLORS[node.package]}`}>
        {node.package}
      </Badge>
      <div className="flex justify-between text-xs mt-2 text-muted-foreground">
        <span>L: {node.leftBV.toLocaleString()}</span>
        <span>R: {node.rightBV.toLocaleString()}</span>
      </div>
      <Badge variant={node.status === 'active' ? 'secondary' : 'outline'} className="mt-1 text-xs">
        {node.status}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <GitBranch className="h-4 w-4" />
            Today's Matched BV
          </div>
          <p className="text-2xl font-bold text-primary">{matchedToday.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ArrowLeftCircle className="h-4 w-4" />
            Carry-Forward BV
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-lg font-bold">{binaryStats.carryforward_left.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Left</p>
            </div>
            <div>
              <p className="text-lg font-bold">{binaryStats.carryforward_right.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Right</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Wallet className="h-4 w-4" />
            Binary Earnings (Today)
          </div>
          <p className="text-2xl font-bold text-accent">₱{binaryEarningsToday.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            Binary Earnings (Period)
          </div>
          <p className="text-2xl font-bold">₱{(binaryStats.matched_bv * 0.10).toLocaleString()}</p>
        </Card>
      </div>

      {/* Tree Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Binary Genealogy
              </CardTitle>
              <CardDescription>Your downline organization tree</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Member"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Select value={placementView} onValueChange={(v: "sponsor" | "placement") => setPlacementView(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placement">Placement View</SelectItem>
                  <SelectItem value="sponsor">Sponsor View</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedLevels(prev => prev === 1 ? 3 : 1)}
              >
                {expandedLevels > 1 ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center overflow-x-auto py-4">
            {/* You (Root) */}
            <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary text-center mb-4 min-w-[160px]">
              <Crown className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="font-semibold">You</p>
              <p className="text-xs text-muted-foreground">{userId.slice(0, 8)}...</p>
              <Badge className={tierConfig}>{membership?.tier || 'free'}</Badge>
              <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                <span>L: {binaryStats.left_bv.toLocaleString()}</span>
                <span>R: {binaryStats.right_bv.toLocaleString()}</span>
              </div>
            </div>

            {/* Connector Line */}
            <div className="h-8 w-px bg-border" />

            {/* Horizontal Connector */}
            <div className="flex items-center gap-0">
              <div className="w-28 md:w-40 h-px bg-border" />
              <div className="h-4 w-px bg-border" />
              <div className="w-28 md:w-40 h-px bg-border" />
            </div>

            {/* Left and Right Legs */}
            <div className="flex gap-8 md:gap-16 mt-4">
              {/* Left Leg */}
              <div className="flex flex-col items-center">
                <div className="h-4 w-px bg-border" />
                <div
                  className={`p-4 rounded-xl border-2 text-center min-w-[140px] ${
                    membership?.left_leg_id
                      ? "bg-secondary/50 border-secondary"
                      : "bg-muted/30 border-dashed border-muted-foreground/30"
                  }`}
                >
                  <ArrowLeftCircle
                    className={`h-5 w-5 mx-auto mb-1 ${
                      membership?.left_leg_id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  />
                  <p className="font-medium text-sm">Left Leg</p>
                  <p className="text-lg font-bold text-primary">{binaryStats.left_bv.toLocaleString()} BV</p>
                  {membership?.left_leg_id ? (
                    <Badge variant="secondary" className="mt-1">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1 flex items-center gap-1">
                      <CircleDot className="h-3 w-3" />
                      Open Position
                    </Badge>
                  )}
                </div>

                {/* Left Downline */}
                {expandedLevels > 1 && membership?.left_leg_id && (
                  <div className="mt-4 space-y-2">
                    {mockLeftDownline.map(node => renderTreeNode(node, 'left'))}
                  </div>
                )}
              </div>

              {/* Right Leg */}
              <div className="flex flex-col items-center">
                <div className="h-4 w-px bg-border" />
                <div
                  className={`p-4 rounded-xl border-2 text-center min-w-[140px] ${
                    membership?.right_leg_id
                      ? "bg-secondary/50 border-secondary"
                      : "bg-muted/30 border-dashed border-muted-foreground/30"
                  }`}
                >
                  <ArrowRightCircle
                    className={`h-5 w-5 mx-auto mb-1 ${
                      membership?.right_leg_id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  />
                  <p className="font-medium text-sm">Right Leg</p>
                  <p className="text-lg font-bold text-primary">{binaryStats.right_bv.toLocaleString()} BV</p>
                  {membership?.right_leg_id ? (
                    <Badge variant="secondary" className="mt-1">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1 flex items-center gap-1">
                      <CircleDot className="h-3 w-3" />
                      Open Position
                    </Badge>
                  )}
                </div>

                {/* Right Downline */}
                {expandedLevels > 1 && membership?.right_leg_id && (
                  <div className="mt-4 space-y-2">
                    {mockRightDownline.map(node => renderTreeNode(node, 'right'))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberGenealogyPanel;
