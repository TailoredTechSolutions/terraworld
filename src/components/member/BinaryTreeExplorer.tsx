import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  GitBranch, ZoomIn, ZoomOut, Maximize2, Crown, Users, CircleDot,
  ArrowLeftCircle, ArrowRightCircle, Search, ChevronRight, RotateCcw,
  Move, Loader2, MousePointerClick, ChevronDown, X, Eye,
  Wallet, TrendingUp, Calendar, Shield, Award, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

const TIER_NODE_STYLES: Record<string, string> = {
  free: "border-muted-foreground/40 bg-muted/30",
  starter: "border-emerald-500/40 bg-emerald-500/10",
  basic: "border-blue-500/40 bg-blue-500/10",
  pro: "border-purple-500/40 bg-purple-500/10",
  elite: "border-amber-500/40 bg-amber-500/10",
};

const TIER_BADGE_STYLES: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  basic: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  pro: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  elite: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

// ── API helpers ──
async function fetchTree(userId: string, depth: number): Promise<TreeNode | null> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/binary-tree?action=root&userId=${userId}&depth=${depth}`;
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.tree || null;
}

async function fetchMemberDetail(userId: string): Promise<MemberDetail | null> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/binary-tree?action=member-detail&userId=${userId}`;
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!resp.ok) return null;
  const json = await resp.json();
  return json.detail || null;
}

async function searchMembers(query: string): Promise<SearchResult[]> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/binary-tree?action=search&q=${encodeURIComponent(query)}`;
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.results || [];
}

// ── Tree Node Component ──
const TreeNodeCard = ({
  node,
  depth,
  maxDepth,
  isRoot,
  side,
  selectedNodeId,
  onSelect,
  onOpenAsRoot,
}: {
  node: TreeNode | null;
  depth: number;
  maxDepth: number;
  isRoot?: boolean;
  side?: "left" | "right";
  selectedNodeId: string | null;
  onSelect: (node: TreeNode) => void;
  onOpenAsRoot: (node: TreeNode) => void;
}) => {
  if (depth > maxDepth) return null;

  const isEmpty = !node;
  const nodeStyle = isEmpty
    ? "border-dashed border-muted-foreground/20 bg-muted/10"
    : TIER_NODE_STYLES[node?.tier || "free"];
  const isSelected = node && selectedNodeId === node.user_id;

  return (
    <div className="flex flex-col items-center min-w-0">
      {/* Node Card */}
      <div
        className={cn(
          "p-3 rounded-xl border-2 text-center min-w-[130px] max-w-[170px] transition-all cursor-pointer select-none",
          nodeStyle,
          isRoot && "ring-2 ring-primary/40 shadow-lg",
          isSelected && "ring-2 ring-accent shadow-md",
          !isEmpty && "hover:shadow-md hover:scale-[1.02]"
        )}
        onClick={() => node && onSelect(node)}
        onDoubleClick={() => node && (node.has_left_child || node.has_right_child) && onOpenAsRoot(node)}
        title={node ? `Double-click to drill down into ${node.full_name}'s tree` : undefined}
      >
        {isRoot ? (
          <Crown className="h-5 w-5 text-primary mx-auto mb-1" />
        ) : isEmpty ? (
          <CircleDot className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
        ) : (
          <User className="h-4 w-4 text-foreground mx-auto mb-1" />
        )}
        <p className="font-semibold text-sm truncate">
          {isEmpty ? "Open" : node!.full_name}
        </p>
        {!isEmpty && (
          <>
            <Badge variant="outline" className={cn("mt-1 text-[10px] capitalize", TIER_BADGE_STYLES[node!.tier])}>
              {node!.tier}
            </Badge>
            {node!.rank_name && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{node!.rank_name}</p>
            )}
            <div className="flex justify-between text-[10px] mt-1.5 text-muted-foreground gap-1">
              <span className="flex items-center gap-0.5">
                <ArrowLeftCircle className="h-2.5 w-2.5 text-emerald-500" />
                {node!.left_bv.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5">
                {node!.right_bv.toLocaleString()}
                <ArrowRightCircle className="h-2.5 w-2.5 text-blue-500" />
              </span>
            </div>
            {(node!.has_left_child || node!.has_right_child) && (
              <div className="mt-1">
                <MousePointerClick className="h-3 w-3 text-muted-foreground/50 mx-auto" />
              </div>
            )}
          </>
        )}
        {isEmpty && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {side === "left" ? "Left" : "Right"} position
          </p>
        )}
      </div>

      {/* Children */}
      {depth < maxDepth && !isEmpty && (
        <>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-start gap-3 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <div className="w-6 md:w-10 h-px bg-border" />
                <div className="h-4 w-px bg-border" />
                <div className="w-6 md:w-10 h-px bg-transparent" />
              </div>
              <TreeNodeCard
                node={node!.left || null}
                depth={depth + 1}
                maxDepth={maxDepth}
                side="left"
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
                onOpenAsRoot={onOpenAsRoot}
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <div className="w-6 md:w-10 h-px bg-transparent" />
                <div className="h-4 w-px bg-border" />
                <div className="w-6 md:w-10 h-px bg-border" />
              </div>
              <TreeNodeCard
                node={node!.right || null}
                depth={depth + 1}
                maxDepth={maxDepth}
                side="right"
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
                onOpenAsRoot={onOpenAsRoot}
              />
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
              <Badge variant="outline" className={cn("capitalize", TIER_BADGE_STYLES[detail.tier])}>
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
                <InfoItem label="Placement Side" value={detail.placement_side || "—"} />
                <InfoItem label="Join Date" value={new Date(detail.created_at).toLocaleDateString()} />
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
                <VolumeCard label="Left BV" value={detail.left_bv} color="emerald" />
                <VolumeCard label="Right BV" value={detail.right_bv} color="blue" />
                <VolumeCard label="Matched BV" value={detail.matched_bv} color="primary" />
                <VolumeCard label="Product BV" value={detail.product_bv} color="accent" />
                <VolumeCard label="Membership BV" value={detail.membership_bv_total} color="purple" />
                <VolumeCard label="Carry-fwd Left" value={detail.carryforward_left} color="emerald" />
                <VolumeCard label="Carry-fwd Right" value={detail.carryforward_right} color="blue" />
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-primary">₱{detail.total_earnings.toLocaleString()}</p>
                </div>
                {detail.wallet && (
                  <>
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
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

const InfoItem = ({ label, value, badge }: { label: string; value: string; badge?: boolean }) => (
  <div className="p-2.5 rounded-lg bg-muted/30">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    {badge ? (
      <Badge variant={value === "active" ? "default" : "secondary"} className="mt-0.5 text-xs capitalize">{value}</Badge>
    ) : (
      <p className="text-sm font-medium mt-0.5 capitalize">{value}</p>
    )}
  </div>
);

const VolumeCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className={cn("p-3 rounded-lg text-center border", `bg-${color}-500/5 border-${color}-500/20`)}>
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className="text-lg font-bold">{value.toLocaleString()}</p>
  </div>
);

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
        setBreadcrumb(prev => {
          const existing = prev.findIndex(b => b.userId === addBreadcrumb.userId);
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

  // Initial load
  useEffect(() => {
    if (myUserId) {
      setBreadcrumb([{ userId: myUserId, name: "My Root" }]);
      loadTree(myUserId);
    }
  }, [myUserId]);

  // Reload on depth change
  useEffect(() => {
    if (currentRootUserId) {
      loadTree(currentRootUserId);
    }
  }, [maxDepth]);

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

  // Open as root (drill down)
  const handleOpenAsRoot = useCallback((node: TreeNode) => {
    loadTree(node.user_id, { userId: node.user_id, name: node.full_name });
  }, [loadTree]);

  const handleOpenAsRootFromDetail = useCallback((userId: string, name: string) => {
    setDetailOpen(false);
    loadTree(userId, { userId, name });
  }, [loadTree]);

  // Reset to my root
  const resetToMyRoot = useCallback(() => {
    if (myUserId) {
      setBreadcrumb([{ userId: myUserId, name: "My Root" }]);
      loadTree(myUserId);
    }
  }, [myUserId, loadTree]);

  // Breadcrumb navigate
  const navigateBreadcrumb = useCallback((item: BreadcrumbItem) => {
    loadTree(item.userId, item);
  }, [loadTree]);

  // Search
  useEffect(() => {
    if (!isAnyAdmin || searchQuery.length < 2) {
      setSearchResults([]);
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

  const fitToScreen = () => setZoom(100);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-3">
        {/* Top Row: Search + Controls */}
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
                  <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((r) => (
                      <button
                        key={r.user_id}
                        className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm"
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
            <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
              <span className="text-xs text-muted-foreground">Depth:</span>
              {[2, 3, 5].map((d) => (
                <Button
                  key={d}
                  variant={maxDepth === d ? "default" : "ghost"}
                  size="sm"
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => setMaxDepth(d)}
                >
                  {d}
                </Button>
              ))}
            </div>

            {/* Zoom */}
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(40, zoom - 10))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs w-9 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(150, zoom + 10))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fitToScreen}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Reset */}
            {currentRootUserId !== myUserId && (
              <Button variant="outline" size="sm" onClick={resetToMyRoot}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> My Root
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 1 && (
          <div className="flex items-center gap-1 text-sm flex-wrap">
            {breadcrumb.map((b, i) => (
              <div key={b.userId} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                <button
                  onClick={() => navigateBreadcrumb(b)}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-xs transition-colors",
                    i === breadcrumb.length - 1
                      ? "bg-primary/10 text-primary font-medium"
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
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
            <Crown className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{treeData.full_name}</p>
              <p className="text-xs text-muted-foreground">
                <Badge variant="outline" className={cn("mr-2 text-[10px] capitalize", TIER_BADGE_STYLES[treeData.tier])}>
                  {treeData.tier}
                </Badge>
                L: {treeData.left_bv.toLocaleString()} BV • R: {treeData.right_bv.toLocaleString()} BV • Matched: {treeData.matched_bv.toLocaleString()} BV
              </p>
            </div>
            <div className="flex gap-2 text-xs shrink-0">
              <div className="text-center px-2">
                <p className="text-muted-foreground">Carry L</p>
                <p className="font-bold">{treeData.carryforward_left.toLocaleString()}</p>
              </div>
              <div className="text-center px-2">
                <p className="text-muted-foreground">Carry R</p>
                <p className="font-bold">{treeData.carryforward_right.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tree Canvas */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={canvasRef}
            className={cn(
              "overflow-auto py-8 px-4 min-h-[400px] max-h-[600px]",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="flex justify-center transition-transform"
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
                />
              ) : (
                <div className="text-center py-16">
                  <GitBranch className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No tree data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Your binary network will appear here once you have downline members.</p>
                </div>
              )}
            </div>
          </div>

          {/* Legend & Instructions */}
          <div className="px-4 pb-4 border-t pt-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">Tips:</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Click to inspect</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Double-click to drill down</span>
              <span className="flex items-center gap-1"><Move className="h-3 w-3" /> Drag to pan</span>
              <span className="flex items-center gap-1"><ZoomIn className="h-3 w-3" /> Scroll to zoom</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground font-medium">Tiers:</span>
              {Object.entries(TIER_BADGE_STYLES).map(([tier, cls]) => (
                <Badge key={tier} variant="outline" className={cn("text-[10px] capitalize", cls)}>{tier}</Badge>
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
