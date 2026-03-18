import { useState, useCallback, useRef, useEffect } from "react";
import {
  GitBranch, ZoomIn, ZoomOut, Maximize2, Crown, Users, CircleDot,
  ArrowLeftCircle, ArrowRightCircle, Search, ChevronRight, RotateCcw,
  Move, Loader2, MousePointerClick, Eye, User, ChevronDown, ChevronUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";

// ── Types ──
interface TreeNode {
  id: string;
  user_id: string;
  full_name: string;
  tier: string;
  rank_name: string | null;
  left_leg_id: string | null;
  right_leg_id: string | null;
  sponsor_id: string | null;
  placement_side: string | null;
  membership_bv: number;
  left_bv: number;
  right_bv: number;
  matched_bv: number;
  carryforward_left: number;
  carryforward_right: number;
  product_bv: number;
  membership_bv_total: number;
  status: string;
  package_price: number;
  created_at: string;
  has_left_child: boolean;
  has_right_child: boolean;
  left?: TreeNode | null;
  right?: TreeNode | null;
  // Lazy-loading state
  _leftLoaded?: boolean;
  _rightLoaded?: boolean;
  _expanded?: boolean;
}

interface MemberDetail extends TreeNode {
  wallet: { available_balance: number; pending_balance: number; total_withdrawn: number };
  total_earnings: number;
  sponsor_name: string | null;
}

interface SearchResult {
  user_id: string;
  full_name: string;
  email: string;
  referral_code: string;
}

interface BreadcrumbItem {
  userId: string;
  name: string;
}

// ── Tier Styles ──
const TIER_STYLES = {
  free: {
    node: "border-muted-foreground/30 bg-card/60",
    badge: "bg-muted text-muted-foreground",
    glow: "transparent",
  },
  starter: {
    node: "border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    glow: "hsl(142 50% 50% / 0.08)",
  },
  basic: {
    node: "border-blue-500/40 bg-blue-50/80 dark:bg-blue-950/30",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    glow: "hsl(217 50% 55% / 0.08)",
  },
  pro: {
    node: "border-purple-500/40 bg-purple-50/80 dark:bg-purple-950/30",
    badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    glow: "hsl(270 50% 55% / 0.08)",
  },
  elite: {
    node: "border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    glow: "hsl(38 70% 55% / 0.08)",
  },
};

const getTierStyle = (tier: string) => TIER_STYLES[tier as keyof typeof TIER_STYLES] || TIER_STYLES.free;

const CONNECTOR_COLORS: Record<string, string> = {
  free: "hsl(var(--muted-foreground) / 0.25)",
  starter: "hsl(142 50% 50% / 0.5)",
  basic: "hsl(217 50% 55% / 0.5)",
  pro: "hsl(270 50% 55% / 0.5)",
  elite: "hsl(38 70% 55% / 0.5)",
};

// ── API helpers ──
function apiUrl(params: string): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${projectId}.supabase.co/functions/v1/binary-tree?${params}`;
}

async function apiHeaders(): Promise<Record<string, string>> {
  const session = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${session.data.session?.access_token}`,
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

async function fetchTree(userId: string, depth: number): Promise<TreeNode | null> {
  const resp = await fetch(apiUrl(`action=root&userId=${userId}&depth=${depth}`), { headers: await apiHeaders() });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.tree || null;
}

async function fetchBranch(userId: string): Promise<TreeNode | null> {
  const resp = await fetch(apiUrl(`action=children&userId=${userId}&depth=2`), { headers: await apiHeaders() });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.tree || null;
}

async function fetchMemberDetail(userId: string): Promise<MemberDetail | null> {
  const resp = await fetch(apiUrl(`action=member-detail&userId=${userId}`), { headers: await apiHeaders() });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.detail || null;
}

async function fetchAncestryPath(userId: string): Promise<BreadcrumbItem[]> {
  const resp = await fetch(apiUrl(`action=ancestry&userId=${userId}`), { headers: await apiHeaders() });
  if (!resp.ok) return [];
  const json = await resp.json();
  return (json.path || []).map((p: { user_id: string; full_name: string }) => ({
    userId: p.user_id,
    name: p.full_name,
  }));
}

async function searchMembers(query: string): Promise<SearchResult[]> {
  const resp = await fetch(apiUrl(`action=search&q=${encodeURIComponent(query)}`), { headers: await apiHeaders() });
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.results || [];
}

// ── SVG Connector Component ──
const NODE_WIDTH = 152;
const NODE_GAP_X = 24;
const NODE_GAP_Y = 56;

const SVGConnectors = ({
  parentTier,
  hasLeft,
  hasRight,
  leftWidth,
  rightWidth,
}: {
  parentTier: string;
  hasLeft: boolean;
  hasRight: boolean;
  leftWidth: number;
  rightWidth: number;
}) => {
  const color = CONNECTOR_COLORS[parentTier] || CONNECTOR_COLORS.free;
  const parentCenterX = (leftWidth + NODE_GAP_X / 2);
  const svgHeight = NODE_GAP_Y;
  const totalWidth = leftWidth + NODE_GAP_X + rightWidth;

  const leftChildCenterX = leftWidth / 2;
  const rightChildCenterX = leftWidth + NODE_GAP_X + rightWidth / 2;

  const startY = 0;
  const endY = svgHeight;
  const midY = svgHeight * 0.5;

  return (
    <svg
      width={totalWidth}
      height={svgHeight}
      className="shrink-0"
      style={{ display: "block", overflow: "visible" }}
    >
      {hasLeft && (
        <path
          d={`M ${parentCenterX} ${startY} C ${parentCenterX} ${midY}, ${leftChildCenterX} ${midY}, ${leftChildCenterX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      )}
      {hasRight && (
        <path
          d={`M ${parentCenterX} ${startY} C ${parentCenterX} ${midY}, ${rightChildCenterX} ${midY}, ${rightChildCenterX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      )}
      {/* Dot at parent end */}
      <circle cx={parentCenterX} cy={startY} r={3} fill={color} className="transition-all duration-500" />
    </svg>
  );
};

// ── Tree Node Card ──
const TreeNodeCard = ({
  node,
  depth,
  maxDepth,
  isRoot,
  side,
  selectedNodeId,
  onSelect,
  onOpenAsRoot,
  onExpandBranch,
}: {
  node: TreeNode | null;
  depth: number;
  maxDepth: number;
  isRoot?: boolean;
  side?: "left" | "right";
  selectedNodeId: string | null;
  onSelect: (node: TreeNode) => void;
  onOpenAsRoot: (node: TreeNode) => void;
  onExpandBranch: (node: TreeNode, side: "left" | "right") => Promise<void>;
}) => {
  const [expandingLeft, setExpandingLeft] = useState(false);
  const [expandingRight, setExpandingRight] = useState(false);

  if (depth > maxDepth) return null;

  const isEmpty = !node;
  const style = getTierStyle(node?.tier || "free");
  const isSelected = node && selectedNodeId === node.user_id;
  const canDrillDown = node && (node.has_left_child || node.has_right_child);

  // Calculate subtree widths for SVG connectors
  const hasLeftChild = !isEmpty && (node!.left !== undefined && node!.left !== null);
  const hasRightChild = !isEmpty && (node!.right !== undefined && node!.right !== null);
  const showLeftEmpty = !isEmpty && !hasLeftChild && depth < maxDepth && node!.has_left_child;
  const showRightEmpty = !isEmpty && !hasRightChild && depth < maxDepth && node!.has_right_child;
  const showChildren = depth < maxDepth && !isEmpty && (hasLeftChild || hasRightChild || showLeftEmpty || showRightEmpty);

  const leftSubWidth = NODE_WIDTH;
  const rightSubWidth = NODE_WIDTH;

  const handleExpandLeft = async () => {
    if (!node || expandingLeft) return;
    setExpandingLeft(true);
    await onExpandBranch(node, "left");
    setExpandingLeft(false);
  };

  const handleExpandRight = async () => {
    if (!node || expandingRight) return;
    setExpandingRight(true);
    await onExpandBranch(node, "right");
    setExpandingRight(false);
  };

  return (
    <div className="flex flex-col items-center min-w-0 animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Node Card */}
      <div
        className={cn(
          "relative p-3.5 rounded-2xl border-2 text-center transition-all duration-200 select-none",
          "backdrop-blur-sm shadow-sm",
          isEmpty
            ? "border-dashed border-muted-foreground/20 bg-muted/10 min-w-[120px] cursor-default"
            : cn(
                style.node,
                "min-w-[152px] max-w-[176px] cursor-pointer",
                "hover:shadow-lg hover:scale-[1.03] hover:-translate-y-0.5",
                "active:scale-[0.98]"
              ),
          isRoot && "ring-2 ring-primary/40 shadow-lg shadow-primary/10",
          isSelected && "ring-2 ring-accent shadow-md shadow-accent/10",
        )}
        style={!isEmpty ? { boxShadow: `0 4px 24px -4px ${style.glow}` } : undefined}
        onClick={() => node && onSelect(node)}
        onDoubleClick={() => node && canDrillDown && onOpenAsRoot(node)}
        title={canDrillDown ? `Double-click to drill into ${node!.full_name}'s tree` : undefined}
      >
        {/* Status indicator */}
        {!isEmpty && (
          <div className={cn(
            "absolute top-2 right-2 h-2 w-2 rounded-full",
            node!.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"
          )} />
        )}

        {isRoot ? (
          <div className="flex items-center justify-center gap-1 mb-1">
            <Crown className="h-4.5 w-4.5 text-primary" />
            {node?.tier === "elite" && <Sparkles className="h-3 w-3 text-amber-500" />}
          </div>
        ) : isEmpty ? (
          <CircleDot className="h-4 w-4 text-muted-foreground/50 mx-auto mb-1" />
        ) : (
          <User className="h-4 w-4 text-foreground/70 mx-auto mb-1" />
        )}

        <p className={cn(
          "font-semibold text-sm truncate",
          isEmpty && "text-muted-foreground/50"
        )}>
          {isEmpty ? "Open" : node!.full_name}
        </p>

        {!isEmpty && (
          <>
            <Badge
              variant="outline"
              className={cn("mt-1.5 text-[10px] capitalize font-medium", style.badge)}
            >
              {node!.tier}
            </Badge>
            {node!.rank_name && (
              <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{node!.rank_name}</p>
            )}

            {/* BV indicators */}
            <div className="flex justify-between items-center mt-2 gap-1">
              <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowLeftCircle className="h-2.5 w-2.5" />
                <span>{node!.left_bv.toLocaleString()}</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                <span>{node!.right_bv.toLocaleString()}</span>
                <ArrowRightCircle className="h-2.5 w-2.5" />
              </div>
            </div>

            {/* Expand indicator for lazy loading */}
            {canDrillDown && depth >= maxDepth && (
              <div className="mt-1.5 flex items-center justify-center gap-0.5 text-[9px] text-muted-foreground/60">
                <ChevronDown className="h-3 w-3" />
              </div>
            )}
          </>
        )}

        {isEmpty && (
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">
            {side === "left" ? "Left" : "Right"} leg
          </p>
        )}
      </div>

      {/* SVG Connectors + Children */}
      {showChildren && (
        <>
          <SVGConnectors
            parentTier={node!.tier}
            hasLeft={hasLeftChild || showLeftEmpty}
            hasRight={hasRightChild || showRightEmpty}
            leftWidth={leftSubWidth}
            rightWidth={rightSubWidth}
          />
          <div className="flex items-start" style={{ gap: `${NODE_GAP_X}px` }}>
            {/* Left child */}
            <div className="flex flex-col items-center">
              {hasLeftChild ? (
                <TreeNodeCard
                  node={node!.left!}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  side="left"
                  selectedNodeId={selectedNodeId}
                  onSelect={onSelect}
                  onOpenAsRoot={onOpenAsRoot}
                  onExpandBranch={onExpandBranch}
                />
              ) : showLeftEmpty ? (
                <button
                  onClick={handleExpandLeft}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 min-w-[120px] hover:bg-muted/20 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  {expandingLeft ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  )}
                  <span className="text-[10px] text-muted-foreground/50 group-hover:text-foreground/60 transition-colors">
                    {expandingLeft ? "Loading..." : "Expand left"}
                  </span>
                </button>
              ) : (
                <TreeNodeCard
                  node={null}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  side="left"
                  selectedNodeId={selectedNodeId}
                  onSelect={onSelect}
                  onOpenAsRoot={onOpenAsRoot}
                  onExpandBranch={onExpandBranch}
                />
              )}
            </div>

            {/* Right child */}
            <div className="flex flex-col items-center">
              {hasRightChild ? (
                <TreeNodeCard
                  node={node!.right!}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  side="right"
                  selectedNodeId={selectedNodeId}
                  onSelect={onSelect}
                  onOpenAsRoot={onOpenAsRoot}
                  onExpandBranch={onExpandBranch}
                />
              ) : showRightEmpty ? (
                <button
                  onClick={handleExpandRight}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 min-w-[120px] hover:bg-muted/20 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  {expandingRight ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  )}
                  <span className="text-[10px] text-muted-foreground/50 group-hover:text-foreground/60 transition-colors">
                    {expandingRight ? "Loading..." : "Expand right"}
                  </span>
                </button>
              ) : (
                <TreeNodeCard
                  node={null}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  side="right"
                  selectedNodeId={selectedNodeId}
                  onSelect={onSelect}
                  onOpenAsRoot={onOpenAsRoot}
                  onExpandBranch={onExpandBranch}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Member Detail Panel ──
const MemberDetailSheet = ({
  detail,
  loading,
  open,
  onClose,
  onOpenAsRoot,
  isAnyAdmin,
}: {
  detail: MemberDetail | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onOpenAsRoot: (userId: string, name: string) => void;
  isAnyAdmin: boolean;
}) => {
  if (!detail && !loading) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {loading ? "Loading..." : detail?.full_name}
          </SheetTitle>
          <SheetDescription>
            {detail && (
              <Badge variant="outline" className={cn("capitalize", getTierStyle(detail.tier).badge)}>
                {detail.tier} Package
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : detail ? (
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Member ID" value={detail.user_id.slice(0, 8) + "..."} />
                <InfoItem label="Rank" value={detail.rank_name || "Unranked"} />
                <InfoItem label="Package" value={`${detail.tier} (₱${detail.package_price.toLocaleString()})`} />
                <InfoItem label="Status" value={detail.status} badge />
                <InfoItem label="Sponsor" value={detail.sponsor_name || "None"} />
                <InfoItem label="Placement" value={detail.placement_side || "—"} />
                <InfoItem label="Joined" value={new Date(detail.created_at).toLocaleDateString()} />
                <InfoItem label="Membership BV" value={detail.membership_bv.toLocaleString()} />
              </div>

              {(detail.has_left_child || detail.has_right_child) && (
                <Button
                  className="w-full mt-2"
                  variant="outline"
                  onClick={() => onOpenAsRoot(detail.user_id, detail.full_name)}
                >
                  <Eye className="h-4 w-4 mr-2" /> View as Root
                </Button>
              )}
            </TabsContent>

            <TabsContent value="volume" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <VolumeCard label="Left BV" value={detail.left_bv} variant="emerald" />
                <VolumeCard label="Right BV" value={detail.right_bv} variant="blue" />
                <VolumeCard label="Matched BV" value={detail.matched_bv} variant="primary" />
                <VolumeCard label="Product BV" value={detail.product_bv} variant="accent" />
                <VolumeCard label="Membership BV" value={detail.membership_bv_total} variant="purple" />
                <VolumeCard label="Carry-fwd L" value={detail.carryforward_left} variant="emerald" />
                <VolumeCard label="Carry-fwd R" value={detail.carryforward_right} variant="blue" />
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-primary">₱{detail.total_earnings.toLocaleString()}</p>
              </div>
              {detail.wallet && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-[10px] text-muted-foreground">Available</p>
                    <p className="text-sm font-bold">₱{detail.wallet.available_balance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                    <p className="text-sm font-bold">₱{detail.wallet.pending_balance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-[10px] text-muted-foreground">Withdrawn</p>
                    <p className="text-sm font-bold">₱{detail.wallet.total_withdrawn.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

const InfoItem = ({ label, value, badge }: { label: string; value: string; badge?: boolean }) => (
  <div className="p-2.5 rounded-lg bg-muted/30 backdrop-blur-sm">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    {badge ? (
      <Badge variant={value === "active" ? "default" : "secondary"} className="mt-0.5 text-xs capitalize">{value}</Badge>
    ) : (
      <p className="text-sm font-medium mt-0.5 capitalize truncate">{value}</p>
    )}
  </div>
);

const VolumeCard = ({ label, value, variant }: { label: string; value: number; variant: string }) => {
  const variantStyles: Record<string, string> = {
    emerald: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    blue: "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-400",
    purple: "bg-purple-500/5 border-purple-500/20 text-purple-700 dark:text-purple-400",
    primary: "bg-primary/5 border-primary/20 text-primary",
    accent: "bg-accent/5 border-accent/20 text-accent",
  };

  return (
    <div className={cn("p-3 rounded-lg text-center border", variantStyles[variant] || variantStyles.primary)}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value.toLocaleString()}</p>
    </div>
  );
};

// ── Main Component ──
const BinaryTreeExplorer = () => {
  const { user } = useAuth();
  const { isAdmin, isAdminReadonly, isAnyAdmin } = useUserRoles();
  const { toast } = useToast();

  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxDepth, setMaxDepth] = useState(3);
  const [zoom, setZoom] = useState(100);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [currentRootUserId, setCurrentRootUserId] = useState<string | null>(null);

  // Selection / detail
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [memberDetail, setMemberDetail] = useState<MemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Search (admin only)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // Canvas drag
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  const myUserId = user?.id || null;

  // Load tree
  const loadTree = useCallback(async (rootId: string, addBreadcrumb?: BreadcrumbItem) => {
    setLoading(true);
    try {
      const tree = await fetchTree(rootId, maxDepth);
      setTreeData(tree);
      setCurrentRootUserId(rootId);

      if (addBreadcrumb) {
        setBreadcrumb((prev) => {
          const existing = prev.findIndex((b) => b.userId === addBreadcrumb.userId);
          if (existing >= 0) return prev.slice(0, existing + 1);
          return [...prev, addBreadcrumb];
        });
      }
    } catch (err) {
      console.error("Failed to load tree:", err);
      toast({ title: "Error", description: "Failed to load tree data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [maxDepth, toast]);

  // Lazy-load a specific branch
  const handleExpandBranch = useCallback(async (parentNode: TreeNode, side: "left" | "right") => {
    const targetId = side === "left" ? parentNode.left_leg_id : parentNode.right_leg_id;
    if (!targetId) return;

    try {
      const branch = await fetchBranch(targetId);
      if (!branch) return;

      // Immutably update the tree
      const updateTree = (node: TreeNode | null): TreeNode | null => {
        if (!node) return null;
        if (node.user_id === parentNode.user_id) {
          return {
            ...node,
            [side === "left" ? "left" : "right"]: branch,
          };
        }
        return {
          ...node,
          left: node.left ? updateTree(node.left) : null,
          right: node.right ? updateTree(node.right) : null,
        };
      };

      setTreeData((prev) => prev ? updateTree(prev) : null);
    } catch (err) {
      console.error("Failed to expand branch:", err);
      toast({ title: "Error", description: "Failed to load branch", variant: "destructive" });
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    if (myUserId) {
      setBreadcrumb([{ userId: myUserId, name: "My Root" }]);
      loadTree(myUserId);
    }
  }, [myUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload on depth change
  useEffect(() => {
    if (currentRootUserId) {
      loadTree(currentRootUserId);
    }
  }, [maxDepth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Node select
  const handleSelectNode = useCallback(async (node: TreeNode) => {
    setSelectedNodeId(node.user_id);
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const detail = await fetchMemberDetail(node.user_id);
      setMemberDetail(detail);
    } catch {
      setMemberDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleOpenAsRoot = useCallback((node: TreeNode) => {
    loadTree(node.user_id, { userId: node.user_id, name: node.full_name });
  }, [loadTree]);

  const handleOpenAsRootFromDetail = useCallback((userId: string, name: string) => {
    setDetailOpen(false);
    loadTree(userId, { userId, name });
  }, [loadTree]);

  const resetToMyRoot = useCallback(() => {
    if (myUserId) {
      setBreadcrumb([{ userId: myUserId, name: "My Root" }]);
      loadTree(myUserId);
    }
  }, [myUserId, loadTree]);

  const navigateBreadcrumb = useCallback((item: BreadcrumbItem) => {
    loadTree(item.userId, item);
  }, [loadTree]);

  // Search
  useEffect(() => {
    if (!isAnyAdmin || searchQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const timeout = setTimeout(async () => {
      const results = await searchMembers(searchQuery);
      setSearchResults(results);
      setSearchOpen(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, isAnyAdmin]);

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setSearchQuery("");
    setSearchOpen(false);
    setSearchResults([]);
    setBreadcrumb([{ userId: result.user_id, name: result.full_name || result.email }]);
    loadTree(result.user_id);
  }, [loadTree]);

  // Canvas drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    if (canvasRef.current) {
      setScrollStart({ x: canvasRef.current.scrollLeft, y: canvasRef.current.scrollTop });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    canvasRef.current.scrollLeft = scrollStart.x - (e.clientX - dragStart.x);
    canvasRef.current.scrollTop = scrollStart.y - (e.clientY - dragStart.y);
  };
  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.max(30, Math.min(200, z - e.deltaY * 0.5)));
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isAnyAdmin && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search any member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {searchResults.map((r) => (
                      <button
                        key={r.user_id}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors text-sm border-b last:border-b-0"
                        onClick={() => handleSearchSelect(r)}
                      >
                        <p className="font-medium">{r.full_name || r.email}</p>
                        <p className="text-xs text-muted-foreground">{r.email} • {r.referral_code}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Depth selector */}
            <div className="flex items-center gap-1 border rounded-xl px-2.5 py-1 bg-card/50 backdrop-blur-sm">
              <span className="text-xs text-muted-foreground font-medium">Depth:</span>
              {[2, 3, 5].map((d) => (
                <Button
                  key={d}
                  variant={maxDepth === d ? "default" : "ghost"}
                  size="sm"
                  className={cn("h-6 w-6 p-0 text-xs rounded-lg", maxDepth === d && "shadow-sm")}
                  onClick={() => setMaxDepth(d)}
                >
                  {d}
                </Button>
              ))}
            </div>

            {/* Zoom */}
            <div className="flex items-center border rounded-xl bg-card/50 backdrop-blur-sm">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-xl" onClick={() => setZoom(Math.max(30, zoom - 10))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs w-10 text-center font-medium text-muted-foreground">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-xl" onClick={() => setZoom(100)}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Reset */}
            {currentRootUserId !== myUserId && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={resetToMyRoot}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> My Root
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 1 && (
          <div className="flex items-center gap-1 text-sm flex-wrap px-1">
            {breadcrumb.map((b, i) => (
              <div key={b.userId} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                <button
                  onClick={() => navigateBreadcrumb(b)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg text-xs transition-all",
                    i === breadcrumb.length - 1
                      ? "bg-primary/10 text-primary font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {b.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Current Root Summary */}
        {treeData && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{treeData.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={cn("text-[10px] capitalize", getTierStyle(treeData.tier).badge)}>
                  {treeData.tier}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  L: {treeData.left_bv.toLocaleString()} • R: {treeData.right_bv.toLocaleString()} • Matched: {treeData.matched_bv.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3 text-xs shrink-0">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Carry L</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">{treeData.carryforward_left.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Carry R</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">{treeData.carryforward_right.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tree Canvas */}
      <Card className="overflow-hidden border shadow-sm">
        <CardContent className="p-0">
          <div
            ref={canvasRef}
            className={cn(
              "overflow-auto py-8 px-4 min-h-[420px] max-h-[650px]",
              isDragging ? "cursor-grabbing" : "cursor-grab",
              "bg-gradient-to-b from-transparent via-muted/10 to-muted/20"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              className="flex justify-center transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading tree...</p>
                </div>
              ) : treeData ? (
                <TreeNodeCard
                  node={treeData}
                  depth={1}
                  maxDepth={maxDepth}
                  isRoot
                  selectedNodeId={selectedNodeId}
                  onSelect={handleSelectNode}
                  onOpenAsRoot={handleOpenAsRoot}
                  onExpandBranch={handleExpandBranch}
                />
              ) : (
                <div className="text-center py-16">
                  <GitBranch className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No tree data available</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Your binary network will appear here once you have downline members.</p>
                </div>
              )}
            </div>
          </div>

          {/* Legend & Instructions */}
          <div className="px-4 pb-4 border-t pt-3 bg-card/50">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold">Tips:</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Click to inspect</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Double-click to drill down</span>
              <span className="flex items-center gap-1"><Move className="h-3 w-3" /> Drag to pan</span>
              <span className="flex items-center gap-1"><ZoomIn className="h-3 w-3" /> Ctrl+Scroll to zoom</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground font-semibold">Tiers:</span>
              {Object.keys(TIER_STYLES).map((tier) => (
                <Badge key={tier} variant="outline" className={cn("text-[10px] capitalize", getTierStyle(tier).badge)}>
                  {tier}
                </Badge>
              ))}
              <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                <CircleDot className="h-3 w-3" /> Open position
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <MemberDetailSheet
        detail={memberDetail}
        loading={detailLoading}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onOpenAsRoot={handleOpenAsRootFromDetail}
        isAnyAdmin={isAnyAdmin}
      />
    </div>
  );
};

export default BinaryTreeExplorer;
