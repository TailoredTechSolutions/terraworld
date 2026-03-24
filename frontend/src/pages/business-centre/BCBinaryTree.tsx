import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  GitBranch, ZoomIn, ZoomOut, Maximize2, Crown, Users, CircleDot,
  ArrowLeftCircle, ArrowRightCircle, Search, ChevronRight, RotateCcw,
  Move, MousePointerClick, Eye, User, Sparkles, Shield, ShieldCheck,
  Crosshair, TrendingUp, Wallet, Star
} from "lucide-react";

// ── Dummy Tree Data ──
interface DemoNode {
  id: string;
  name: string;
  tier: string;
  rank: string;
  leftBv: number;
  rightBv: number;
  matchedBv: number;
  carryL: number;
  carryR: number;
  personalBv: number;
  status: string;
  packagePrice: number;
  side?: string;
  joinDate: string;
  sponsor: string;
  earnings: number;
  walletBalance: number;
  left?: DemoNode | null;
  right?: DemoNode | null;
}

const DEMO_TREE: DemoNode = {
  id: "root", name: "Andrew Gwaltney", tier: "elite", rank: "Diamond", leftBv: 125000, rightBv: 98000, matchedBv: 98000, carryL: 27000, carryR: 0, personalBv: 5000, status: "active", packagePrice: 5000, joinDate: "2025-06-15", sponsor: "—", earnings: 450000, walletBalance: 350000,
  left: {
    id: "l1", name: "Ameer Saati", tier: "elite", rank: "Diamond", leftBv: 75000, rightBv: 50000, matchedBv: 50000, carryL: 25000, carryR: 0, personalBv: 5000, status: "active", packagePrice: 5000, side: "left", joinDate: "2025-07-01", sponsor: "Andrew Gwaltney", earnings: 275000, walletBalance: 275000,
    left: {
      id: "ll1", name: "Maria Santos", tier: "pro", rank: "Gold", leftBv: 25000, rightBv: 18000, matchedBv: 18000, carryL: 7000, carryR: 0, personalBv: 3000, status: "active", packagePrice: 3000, side: "left", joinDate: "2025-08-15", sponsor: "Ameer Saati", earnings: 95000, walletBalance: 67890,
      left: { id: "lll1", name: "Pedro Garcia", tier: "starter", rank: "Bronze", leftBv: 2000, rightBv: 1500, matchedBv: 1500, carryL: 500, carryR: 0, personalBv: 500, status: "active", packagePrice: 500, side: "left", joinDate: "2025-11-01", sponsor: "Maria Santos", earnings: 8500, walletBalance: 8500, left: null, right: null },
      right: { id: "llr1", name: "Carlo Villanueva", tier: "basic", rank: "Silver", leftBv: 8000, rightBv: 5000, matchedBv: 5000, carryL: 3000, carryR: 0, personalBv: 1000, status: "active", packagePrice: 1000, side: "right", joinDate: "2025-10-10", sponsor: "Maria Santos", earnings: 23450, walletBalance: 23450, left: null, right: null },
    },
    right: {
      id: "lr1", name: "Juan Dela Cruz", tier: "basic", rank: "Silver", leftBv: 12000, rightBv: 8000, matchedBv: 8000, carryL: 4000, carryR: 0, personalBv: 1000, status: "active", packagePrice: 1000, side: "right", joinDate: "2025-09-20", sponsor: "Ameer Saati", earnings: 45000, walletBalance: 45250,
      left: { id: "lrl1", name: "Ana Lopez", tier: "starter", rank: "Bronze", leftBv: 3000, rightBv: 2000, matchedBv: 2000, carryL: 1000, carryR: 0, personalBv: 500, status: "active", packagePrice: 500, side: "left", joinDate: "2026-01-10", sponsor: "Juan Dela Cruz", earnings: 5000, walletBalance: 5000, left: null, right: null },
      right: null,
    },
  },
  right: {
    id: "r1", name: "Liza Reyes", tier: "pro", rank: "Gold", leftBv: 45000, rightBv: 32000, matchedBv: 32000, carryL: 13000, carryR: 0, personalBv: 3000, status: "active", packagePrice: 3000, side: "right", joinDate: "2025-07-20", sponsor: "Andrew Gwaltney", earnings: 128750, walletBalance: 91200,
    left: {
      id: "rl1", name: "Rosa Mendoza", tier: "starter", rank: "Bronze", leftBv: 5000, rightBv: 3500, matchedBv: 3500, carryL: 1500, carryR: 0, personalBv: 500, status: "active", packagePrice: 500, side: "left", joinDate: "2025-10-01", sponsor: "Liza Reyes", earnings: 12000, walletBalance: 8500, left: null, right: null,
    },
    right: {
      id: "rr1", name: "Ben Torres", tier: "basic", rank: "Silver", leftBv: 10000, rightBv: 7500, matchedBv: 7500, carryL: 2500, carryR: 0, personalBv: 1000, status: "active", packagePrice: 1000, side: "right", joinDate: "2025-09-05", sponsor: "Liza Reyes", earnings: 35000, walletBalance: 28000, left: null, right: null,
    },
  },
};

const TIER_STYLES: Record<string, { node: string; badge: string; glow: string }> = {
  free: { node: "border-muted-foreground/30 bg-card/60", badge: "bg-muted text-muted-foreground", glow: "transparent" },
  starter: { node: "border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30", badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", glow: "hsl(142 50% 50% / 0.08)" },
  basic: { node: "border-blue-500/40 bg-blue-50/80 dark:bg-blue-950/30", badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30", glow: "hsl(217 50% 55% / 0.08)" },
  pro: { node: "border-purple-500/40 bg-purple-50/80 dark:bg-purple-950/30", badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30", glow: "hsl(270 50% 55% / 0.08)" },
  elite: { node: "border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", glow: "hsl(38 70% 55% / 0.08)" },
};

const getTierStyle = (tier: string) => TIER_STYLES[tier] || TIER_STYLES.free;

const CONNECTOR_COLORS: Record<string, string> = {
  free: "hsl(var(--muted-foreground) / 0.25)", starter: "hsl(142 50% 50% / 0.5)", basic: "hsl(217 50% 55% / 0.5)", pro: "hsl(270 50% 55% / 0.5)", elite: "hsl(38 70% 55% / 0.5)",
};

// ── Node Card ──
const DemoNodeCard = ({ node, depth, maxDepth, isRoot, onSelect, onDrillDown, selectedId }: {
  node: DemoNode | null; depth: number; maxDepth: number; isRoot?: boolean;
  onSelect: (n: DemoNode) => void; onDrillDown: (n: DemoNode) => void; selectedId: string | null;
}) => {
  if (depth > maxDepth || !node) {
    if (!node && depth <= maxDepth) {
      return (
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 min-w-[160px] text-center">
            <CircleDot className="h-4 w-4 text-muted-foreground/50 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground/50">Open Position</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const style = getTierStyle(node.tier);
  const hasChildren = node.left || node.right;
  const showChildren = depth < maxDepth && hasChildren;
  const color = CONNECTOR_COLORS[node.tier] || CONNECTOR_COLORS.free;

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative p-4 rounded-2xl border-2 text-center transition-all duration-200 select-none backdrop-blur-sm shadow-sm min-w-[170px] max-w-[200px]",
          style.node, "cursor-pointer hover:shadow-lg hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98]",
          isRoot && "ring-2 ring-primary/40 shadow-lg shadow-primary/10",
          selectedId === node.id && "ring-2 ring-accent shadow-md shadow-accent/10",
        )}
        style={{ boxShadow: `0 4px 24px -4px ${style.glow}` }}
        onClick={() => onSelect(node)}
        onDoubleClick={() => hasChildren && onDrillDown(node)}
        title={hasChildren ? `Double-click to drill into ${node.name}'s tree` : undefined}
      >
        <div className={cn("absolute top-2 right-2 h-2.5 w-2.5 rounded-full", node.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40")} />
        {isRoot ? (
          <div className="flex items-center justify-center gap-1 mb-1">
            <Crown className="h-5 w-5 text-primary" />
            {node.tier === "elite" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
          </div>
        ) : <User className="h-4 w-4 text-foreground/70 mx-auto mb-1" />}

        <p className="font-bold text-sm truncate">{node.name}</p>
        <Badge variant="outline" className={cn("mt-1.5 text-xs capitalize font-medium px-2", style.badge)}>{node.tier}</Badge>
        {node.rank && <p className="text-xs text-muted-foreground/70 mt-0.5">{node.rank}</p>}

        <div className="flex justify-between items-center mt-2.5 gap-1">
          <div className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowLeftCircle className="h-3 w-3" />
            <span>{node.leftBv.toLocaleString()}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span>{node.rightBv.toLocaleString()}</span>
            <ArrowRightCircle className="h-3 w-3" />
          </div>
        </div>
      </div>

      {showChildren && (
        <>
          <svg width={400} height={50} className="shrink-0" style={{ display: "block", overflow: "visible" }}>
            {node.left && <path d={`M 200 0 C 200 25, 100 25, 100 50`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />}
            {node.right && <path d={`M 200 0 C 200 25, 300 25, 300 50`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />}
            <circle cx={200} cy={0} r={3} fill={color} />
          </svg>
          <div className="flex items-start gap-6">
            <DemoNodeCard node={node.left || null} depth={depth + 1} maxDepth={maxDepth} onSelect={onSelect} onDrillDown={onDrillDown} selectedId={selectedId} />
            <DemoNodeCard node={node.right || null} depth={depth + 1} maxDepth={maxDepth} onSelect={onSelect} onDrillDown={onDrillDown} selectedId={selectedId} />
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Component ──
const BCBinaryTree = () => {
  const { isAdmin, isAdminReadonly, isAnyAdmin } = useUserRoles();
  const [zoom, setZoom] = useState(85);
  const [maxDepth, setMaxDepth] = useState(4);
  const [selectedNode, setSelectedNode] = useState<DemoNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rootNode, setRootNode] = useState<DemoNode>(DEMO_TREE);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([{ id: "root", name: "Andrew Gwaltney" }]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  const handleSelect = (node: DemoNode) => {
    setSelectedNode(node);
    setDetailOpen(true);
  };

  const handleDrillDown = (node: DemoNode) => {
    setRootNode(node);
    setBreadcrumb(prev => [...prev, { id: node.id, name: node.name }]);
  };

  const resetToRoot = () => {
    setRootNode(DEMO_TREE);
    setBreadcrumb([{ id: "root", name: "Andrew Gwaltney" }]);
  };

  const centerOnRoot = () => {
    if (canvasRef.current) {
      canvasRef.current.scrollLeft = (canvasRef.current.scrollWidth - canvasRef.current.clientWidth) / 2;
      canvasRef.current.scrollTop = 0;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => { if (e.button !== 0) return; setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); if (canvasRef.current) setScrollStart({ x: canvasRef.current.scrollLeft, y: canvasRef.current.scrollTop }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging || !canvasRef.current) return; canvasRef.current.scrollLeft = scrollStart.x - (e.clientX - dragStart.x); canvasRef.current.scrollTop = scrollStart.y - (e.clientY - dragStart.y); };
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = useCallback((e: React.WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(z => Math.max(30, Math.min(200, z - e.deltaY * 0.5))); } }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" /> Binary Tree Explorer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Interactive genealogy tree — click to inspect, double-click to drill down, drag to pan, Ctrl+scroll to zoom</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isAnyAdmin && (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" variant="outline">
              <ShieldCheck className="h-3 w-3 mr-1" /> {isAdmin ? "Admin" : "Read-Only Admin"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border rounded-xl px-3 py-1.5 bg-card/50">
            <span className="text-sm text-muted-foreground font-medium">Depth:</span>
            {[2, 3, 4, 5].map(d => (
              <Button key={d} variant={maxDepth === d ? "default" : "ghost"} size="sm" className={cn("h-7 w-7 p-0 text-sm rounded-lg", maxDepth === d && "shadow-sm")} onClick={() => setMaxDepth(d)}>{d}</Button>
            ))}
          </div>
          <div className="flex items-center border rounded-xl bg-card/50">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(30, zoom - 10))}><ZoomOut className="h-4 w-4" /></Button>
            <span className="text-sm w-12 text-center font-medium">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(200, zoom + 10))}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setZoom(85); setTimeout(centerOnRoot, 50); }}><Maximize2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={centerOnRoot}><Crosshair className="h-4 w-4" /></Button>
          </div>
          {rootNode.id !== "root" && (
            <Button variant="outline" size="sm" onClick={resetToRoot}><RotateCcw className="h-3.5 w-3.5 mr-1" /> My Root</Button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 1 && (
        <div className="flex items-center gap-1 text-sm flex-wrap">
          {breadcrumb.map((b, i) => (
            <div key={b.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
              <span className={cn("px-2.5 py-0.5 rounded-lg text-sm", i === breadcrumb.length - 1 ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground")}>{b.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Root Summary */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-card/80 border shadow-sm">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Crown className="h-5 w-5 text-primary" /></div>
        <div className="flex-1">
          <p className="font-bold text-sm">{rootNode.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className={cn("text-xs capitalize", getTierStyle(rootNode.tier).badge)}>{rootNode.tier}</Badge>
            <span className="text-sm text-muted-foreground">L: {rootNode.leftBv.toLocaleString()} • R: {rootNode.rightBv.toLocaleString()} • Matched: {rootNode.matchedBv.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center"><p className="text-xs text-muted-foreground">Carry L</p><p className="font-bold text-emerald-600">{rootNode.carryL.toLocaleString()}</p></div>
          <div className="text-center"><p className="text-xs text-muted-foreground">Carry R</p><p className="font-bold text-blue-600">{rootNode.carryR.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Canvas */}
      <Card className="overflow-hidden border shadow-sm">
        <CardContent className="p-0">
          <div
            ref={canvasRef}
            className={cn("overflow-auto py-8 px-4 min-h-[450px] max-h-[700px]", isDragging ? "cursor-grabbing" : "cursor-grab", "bg-gradient-to-b from-transparent via-muted/10 to-muted/20")}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}
          >
            <div className="flex justify-center transition-transform duration-200" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
              <DemoNodeCard node={rootNode} depth={1} maxDepth={maxDepth} isRoot onSelect={handleSelect} onDrillDown={handleDrillDown} selectedId={selectedNode?.id || null} />
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 pb-4 border-t pt-3 bg-card/50">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold">Tips:</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" /> Click to inspect</span>
              <span className="flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" /> Double-click to drill down</span>
              <span className="flex items-center gap-1"><Move className="h-3.5 w-3.5" /> Drag to pan</span>
              <span className="flex items-center gap-1"><ZoomIn className="h-3.5 w-3.5" /> Ctrl+Scroll to zoom</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground font-semibold">Tiers:</span>
              {Object.keys(TIER_STYLES).map(tier => (
                <Badge key={tier} variant="outline" className={cn("text-xs capitalize", getTierStyle(tier).badge)}>{tier}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> {selectedNode?.name}</SheetTitle>
            <SheetDescription>{selectedNode && <Badge variant="outline" className={cn("capitalize", getTierStyle(selectedNode.tier).badge)}>{selectedNode.tier} Package</Badge>}</SheetDescription>
          </SheetHeader>
          {selectedNode && (
            <div className="space-y-6 mt-4">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Rank", value: selectedNode.rank },
                  { label: "Package", value: `${selectedNode.tier} (₱${selectedNode.packagePrice.toLocaleString()})` },
                  { label: "Status", value: selectedNode.status },
                  { label: "Sponsor", value: selectedNode.sponsor },
                  { label: "Side", value: selectedNode.side || "Root" },
                  { label: "Joined", value: selectedNode.joinDate },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground uppercase">{item.label}</p>
                    <p className="text-sm font-medium mt-0.5 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Volume */}
              <div>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-primary" /> Volume</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Left BV", value: selectedNode.leftBv, color: "text-emerald-600" },
                    { label: "Right BV", value: selectedNode.rightBv, color: "text-blue-600" },
                    { label: "Matched BV", value: selectedNode.matchedBv, color: "text-primary" },
                    { label: "Personal BV", value: selectedNode.personalBv, color: "text-purple-600" },
                    { label: "Carry-fwd L", value: selectedNode.carryL, color: "text-emerald-600" },
                    { label: "Carry-fwd R", value: selectedNode.carryR, color: "text-blue-600" },
                  ].map(v => (
                    <div key={v.label} className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">{v.label}</p>
                      <p className={cn("text-lg font-bold", v.color)}>{v.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-sm font-bold mb-2 flex items-center gap-1"><Wallet className="h-4 w-4 text-primary" /> Earnings</h3>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-primary">₱{selectedNode.earnings.toLocaleString()}</p>
                </div>
                <div className="mt-2 p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                  <p className="text-lg font-bold">₱{selectedNode.walletBalance.toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              {(selectedNode.left || selectedNode.right) && (
                <Button className="w-full" variant="outline" onClick={() => { handleDrillDown(selectedNode); setDetailOpen(false); }}>
                  <Eye className="h-4 w-4 mr-2" /> View as Root
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BCBinaryTree;
