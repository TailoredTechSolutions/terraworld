import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crown,
  Users,
  CircleDot,
  ArrowLeftCircle,
  ArrowRightCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface TreeNodeData {
  id: string;
  userId: string;
  fullName: string;
  tier: string;
  leftBV: number;
  rightBV: number;
  isActive: boolean;
  left: TreeNodeData | null;
  right: TreeNodeData | null;
}

interface BinaryTreeVisualizationProps {
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
}

const TIER_COLORS: Record<string, string> = {
  free: "border-muted-foreground/30 bg-muted/20",
  starter: "border-secondary bg-secondary/30",
  basic: "border-accent/50 bg-accent/10",
  pro: "border-primary/50 bg-primary/10",
  elite: "border-primary bg-primary/20",
};

const TIER_BADGE: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-secondary text-secondary-foreground",
  basic: "bg-accent/20 text-accent-foreground",
  pro: "bg-primary/20 text-primary",
  elite: "bg-primary text-primary-foreground",
};

const TreeNode = ({
  node,
  depth,
  maxDepth,
  isRoot,
  side,
}: {
  node: TreeNodeData | null;
  depth: number;
  maxDepth: number;
  isRoot?: boolean;
  side?: "left" | "right";
}) => {
  if (depth > maxDepth) return null;

  const isEmpty = !node;
  const tierClass = isEmpty ? "border-dashed border-muted-foreground/20 bg-muted/10" : TIER_COLORS[node?.tier || "free"];
  const badgeClass = isEmpty ? "" : TIER_BADGE[node?.tier || "free"];

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className={`p-3 rounded-xl border-2 text-center min-w-[120px] max-w-[160px] transition-all ${tierClass} ${isRoot ? "ring-2 ring-primary/30" : ""}`}>
        {isRoot ? (
          <Crown className="h-5 w-5 text-primary mx-auto mb-1" />
        ) : isEmpty ? (
          <CircleDot className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
        ) : (
          <Users className="h-4 w-4 text-foreground mx-auto mb-1" />
        )}
        <p className="font-medium text-sm truncate">
          {isRoot ? "You" : isEmpty ? "Open" : node!.fullName || "Member"}
        </p>
        {!isEmpty && (
          <>
            <Badge className={`${badgeClass} mt-1 text-xs`}>{node!.tier}</Badge>
            <div className="flex justify-between text-xs mt-2 text-muted-foreground gap-2">
              <span className="flex items-center gap-0.5">
                <ArrowLeftCircle className="h-3 w-3" />
                {node!.leftBV.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5">
                {node!.rightBV.toLocaleString()}
                <ArrowRightCircle className="h-3 w-3" />
              </span>
            </div>
          </>
        )}
        {isEmpty && (
          <p className="text-xs text-muted-foreground mt-1">
            {side === "left" ? "Left" : "Right"} position
          </p>
        )}
      </div>

      {/* Children */}
      {depth < maxDepth && (
        <>
          {/* Vertical connector */}
          <div className="h-6 w-px bg-border" />
          {/* Horizontal connector + children */}
          <div className="flex items-start gap-4 md:gap-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <div className="w-8 md:w-12 h-px bg-border" />
                <div className="h-4 w-px bg-border" />
                <div className="w-8 md:w-12 h-px bg-transparent" />
              </div>
              <TreeNode
                node={node?.left || null}
                depth={depth + 1}
                maxDepth={maxDepth}
                side="left"
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <div className="w-8 md:w-12 h-px bg-transparent" />
                <div className="h-4 w-px bg-border" />
                <div className="w-8 md:w-12 h-px bg-border" />
              </div>
              <TreeNode
                node={node?.right || null}
                depth={depth + 1}
                maxDepth={maxDepth}
                side="right"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const BinaryTreeVisualization = ({
  userId,
  membership,
  binaryStats,
}: BinaryTreeVisualizationProps) => {
  const [maxDepth, setMaxDepth] = useState(3);
  const [zoom, setZoom] = useState(100);
  const [period, setPeriod] = useState("current");
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [loading, setLoading] = useState(false);

  const buildTree = useCallback(async () => {
    setLoading(true);
    try {
      // Build root node from current user's data
      const rootNode: TreeNodeData = {
        id: userId,
        userId,
        fullName: "You",
        tier: membership?.tier || "free",
        leftBV: binaryStats.left_bv,
        rightBV: binaryStats.right_bv,
        isActive: true,
        left: null,
        right: null,
      };

      // Fetch downline memberships (up to depth levels)
      const { data: downline } = await supabase
        .from("memberships")
        .select("user_id, tier, left_leg_id, right_leg_id, membership_bv, sponsor_id")
        .limit(100);

      if (downline) {
        const memberMap = new Map(downline.map(m => [m.user_id, m]));

        // Fetch profiles for names
        const userIds = downline.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name || "Member"]) || []);

        const buildSubTree = (legId: string | null, depth: number): TreeNodeData | null => {
          if (!legId || depth > maxDepth) return null;
          const m = memberMap.get(legId);
          if (!m) return null;

          return {
            id: m.user_id,
            userId: m.user_id,
            fullName: nameMap.get(m.user_id) || "Member",
            tier: m.tier,
            leftBV: 0,
            rightBV: 0,
            isActive: true,
            left: buildSubTree(m.left_leg_id, depth + 1),
            right: buildSubTree(m.right_leg_id, depth + 1),
          };
        };

        rootNode.left = buildSubTree(membership?.left_leg_id || null, 2);
        rootNode.right = buildSubTree(membership?.right_leg_id || null, 2);
      }

      setTreeData(rootNode);
    } catch (error) {
      console.error("Error building tree:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, membership, binaryStats, maxDepth]);

  useEffect(() => {
    buildTree();
  }, [buildTree]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Binary Tree
            </CardTitle>
            <CardDescription>Interactive genealogy visualization</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={String(maxDepth)} onValueChange={(v) => setMaxDepth(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Depth: 2</SelectItem>
                <SelectItem value="3">Depth: 3</SelectItem>
                <SelectItem value="5">Depth: 5</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">This Period</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs w-10 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(100)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Period Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground">Left BV</p>
            <p className="text-lg font-bold text-primary">{binaryStats.left_bv.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground">Right BV</p>
            <p className="text-lg font-bold text-primary">{binaryStats.right_bv.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/5 text-center">
            <p className="text-xs text-muted-foreground">Matched</p>
            <p className="text-lg font-bold">{binaryStats.matched_bv.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <p className="text-xs text-muted-foreground">Carry Fwd</p>
            <p className="text-sm font-bold">
              L:{binaryStats.carryforward_left.toLocaleString()} R:{binaryStats.carryforward_right.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tree Container with zoom */}
        <div className="overflow-auto py-4">
          <div
            className="flex justify-center transition-transform"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {treeData ? (
              <TreeNode node={treeData} depth={1} maxDepth={maxDepth} isRoot />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Loading tree data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <span className="font-medium">Legend:</span>
          {Object.entries(TIER_BADGE).map(([tier, cls]) => (
            <Badge key={tier} className={`${cls} text-xs`}>{tier}</Badge>
          ))}
          <span className="flex items-center gap-1">
            <CircleDot className="h-3 w-3" /> Open position
          </span>
        </div>

        {/* FIFO Notice */}
        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <strong>Note:</strong> Matched BV pays out unless value &lt; ₱10 → carry both legs forward (90-day expiry). 
          Carry-forward BV keeps units; PHP value floats with cycle value adjustments.
        </div>
      </CardContent>
    </Card>
  );
};

export default BinaryTreeVisualization;
