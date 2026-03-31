import { useState } from "react";
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
import {
  GitBranch,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  TrendingUp,
  ArrowLeftCircle,
  ArrowRightCircle,
  Layers,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface TreeNode {
  id: string;
  username: string;
  name: string;
  package: string;
  status: "active" | "inactive";
  leftBV: number;
  rightBV: number;
  left?: TreeNode;
  right?: TreeNode;
  isOpenPosition?: boolean;
}

// Mock genealogy data
const mockTree: TreeNode = {
  id: "M001",
  username: "terramember01",
  name: "Andrew Gwaltney",
  package: "Elite",
  status: "active",
  leftBV: 45000,
  rightBV: 38000,
  left: {
    id: "M002",
    username: "mariasantos",
    name: "Maria Santos",
    package: "Pro",
    status: "active",
    leftBV: 22000,
    rightBV: 15000,
    left: {
      id: "M004",
      username: "juandc",
      name: "Juan dela Cruz",
      package: "Basic",
      status: "active",
      leftBV: 8000,
      rightBV: 5000,
    },
    right: {
      id: "M005",
      username: "anareyes",
      name: "Ana Reyes",
      package: "Starter",
      status: "active",
      leftBV: 3000,
      rightBV: 2500,
    },
  },
  right: {
    id: "M003",
    username: "pedrogomez",
    name: "Pedro Gomez",
    package: "Pro",
    status: "active",
    leftBV: 18000,
    rightBV: 20000,
    left: {
      id: "M006",
      username: "carlostan",
      name: "Carlos Tan",
      package: "Basic",
      status: "inactive",
      leftBV: 0,
      rightBV: 0,
    },
    right: {
      id: "",
      username: "",
      name: "Open Position",
      package: "",
      status: "inactive",
      leftBV: 0,
      rightBV: 0,
      isOpenPosition: true,
    },
  },
};

const GenealogyPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [depthLevel, setDepthLevel] = useState("3");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["M001", "M002", "M003"]));
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getPackageBadge = (pkg: string) => {
    const colors: Record<string, string> = {
      Elite: "bg-gradient-to-r from-primary to-accent text-primary-foreground",
      Pro: "bg-primary text-primary-foreground",
      Basic: "bg-secondary text-secondary-foreground",
      Starter: "bg-muted text-muted-foreground",
    };
    return <Badge className={colors[pkg] || "bg-muted"}>{pkg}</Badge>;
  };

  const TreeNodeComponent = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.left || node.right;

    if (node.isOpenPosition) {
      return (
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 min-w-[140px]">
            <div className="flex items-center justify-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Open Position</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`p-3 rounded-xl border bg-card shadow-sm min-w-[160px] cursor-pointer transition-all hover:shadow-md ${
            selectedNode?.id === node.id ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setSelectedNode(node)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-muted-foreground">{node.id}</span>
            {getPackageBadge(node.package)}
          </div>
          <p className="font-medium text-sm">{node.name}</p>
          <p className="text-xs text-muted-foreground">@{node.username}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div className="flex items-center gap-1 text-xs">
              <ArrowLeftCircle className="h-3 w-3 text-primary" />
              <span>{node.leftBV.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span>{node.rightBV.toLocaleString()}</span>
              <ArrowRightCircle className="h-3 w-3 text-accent" />
            </div>
          </div>
          <Badge
            variant={node.status === "active" ? "default" : "secondary"}
            className="w-full justify-center mt-2 text-xs"
          >
            {node.status}
          </Badge>
        </div>

        {/* Expand/Collapse Toggle */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mt-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(node.id);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex gap-8 mt-4 relative">
            {/* Connecting Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
            <div className="absolute top-4 left-1/4 right-1/4 h-px bg-border" />

            {/* Left Child */}
            <div className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
              {node.left && <TreeNodeComponent node={node.left} level={level + 1} />}
            </div>

            {/* Right Child */}
            <div className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
              {node.right && <TreeNodeComponent node={node.right} level={level + 1} />}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate totals for header
  const totalMatchedBV = Math.min(mockTree.leftBV, mockTree.rightBV);
  const carryForwardLeft = mockTree.leftBV - totalMatchedBV;
  const carryForwardRight = mockTree.rightBV - totalMatchedBV;

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Today's Matched BV</span>
            </div>
            <p className="text-2xl font-bold">{totalMatchedBV.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftCircle className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Carry-Forward (Left)</span>
            </div>
            <p className="text-2xl font-bold">{carryForwardLeft.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightCircle className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Carry-Forward (Right)</span>
            </div>
            <p className="text-2xl font-bold">{carryForwardRight.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Binary Earnings (Today)</span>
            </div>
            <p className="text-2xl font-bold text-primary">₱{(totalMatchedBV * 0.1).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Binary Genealogy Tree
              </CardTitle>
              <CardDescription>View and manage the binary network structure</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={depthLevel} onValueChange={setDepthLevel}>
                <SelectTrigger className="w-28">
                  <Layers className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Level</SelectItem>
                  <SelectItem value="2">2 Levels</SelectItem>
                  <SelectItem value="3">3 Levels</SelectItem>
                  <SelectItem value="5">5 Levels</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tree View */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[600px] flex justify-center py-8">
              <TreeNodeComponent node={mockTree} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && !selectedNode.isOpenPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Member Details: {selectedNode.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Member ID</p>
                <p className="font-mono">{selectedNode.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p>@{selectedNode.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Package Level</p>
                {getPackageBadge(selectedNode.package)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedNode.status === "active" ? "default" : "secondary"}>
                  {selectedNode.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Left Leg Volume</p>
                <p className="font-semibold">{selectedNode.leftBV.toLocaleString()} BV</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Right Leg Volume</p>
                <p className="font-semibold">{selectedNode.rightBV.toLocaleString()} BV</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matched Volume</p>
                <p className="font-semibold text-primary">
                  {Math.min(selectedNode.leftBV, selectedNode.rightBV).toLocaleString()} BV
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weaker Leg</p>
                <Badge variant="outline">
                  {selectedNode.leftBV < selectedNode.rightBV ? "Left" : "Right"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GenealogyPanel;
