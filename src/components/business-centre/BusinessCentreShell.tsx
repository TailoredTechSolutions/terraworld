import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useBusinessCentre } from "@/contexts/BusinessCentreContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard, Users, GitBranch, DollarSign, Share2, Award, Ticket,
  Wallet, Megaphone, HelpCircle, Search, BarChart3, CreditCard, Scale,
  Settings, Lock, FileText, Shield, Zap, Crown, UserCircle, X, Eye,
  ArrowLeft, Menu, ChevronLeft, Loader2, Coins, ArrowUpRight, Package,
  Globe, Store, Truck, Link2, ToggleLeft
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

// ─── 12-MODULE ADMIN SIDEBAR ───
// Members see a subset; admins see the full 12-module layout
const MEMBER_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/business-centre/overview" },
    ],
  },
  {
    title: "My Network",
    items: [
      { id: "binary-tree", label: "Binary Tree", icon: GitBranch, path: "/business-centre/binary-tree" },
      { id: "network", label: "Network", icon: Users, path: "/business-centre/network" },
      { id: "referrals", label: "Referrals", icon: Share2, path: "/business-centre/referrals" },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "earnings", label: "Earnings", icon: DollarSign, path: "/business-centre/earnings" },
      { id: "commissions", label: "Commissions", icon: BarChart3, path: "/business-centre/commissions" },
      { id: "wallet", label: "Wallet", icon: Wallet, path: "/business-centre/wallet" },
      { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight, path: "/business-centre/withdrawals" },
      { id: "statements", label: "Statements", icon: FileText, path: "/business-centre/statements" },
    ],
  },
  {
    title: "Growth",
    items: [
      { id: "rank-activation", label: "Rank & Activation", icon: Award, path: "/business-centre/rank-activation" },
      { id: "token-rewards", label: "Token Rewards", icon: Coins, path: "/business-centre/token-rewards" },
      { id: "coupons", label: "Coupons", icon: Ticket, path: "/business-centre/coupons" },
      { id: "marketing", label: "Marketing", icon: Megaphone, path: "/business-centre/marketing" },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "support", label: "Support", icon: HelpCircle, path: "/business-centre/support" },
    ],
  },
];

const ADMIN_SECTIONS: { title: string; moduleNumber: number; items: NavItem[] }[] = [
  {
    title: "1. Overview",
    moduleNumber: 1,
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/business-centre/overview" },
    ],
  },
  {
    title: "2. Users & Roles",
    moduleNumber: 2,
    items: [
      { id: "users", label: "User Management", icon: Users, path: "/business-centre/users", adminOnly: true },
    ],
  },
  {
    title: "3. Marketplace",
    moduleNumber: 3,
    items: [
      { id: "marketplace", label: "Marketplace Ops", icon: Store, path: "/business-centre/marketplace", adminOnly: true },
    ],
  },
  {
    title: "4. Logistics",
    moduleNumber: 4,
    items: [
      { id: "logistics", label: "Logistics & Delivery", icon: Truck, path: "/business-centre/logistics", adminOnly: true },
    ],
  },
  {
    title: "5. Financial Management",
    moduleNumber: 5,
    items: [
      { id: "financial-mgmt", label: "Financial Overview", icon: DollarSign, path: "/business-centre/financial-management", adminOnly: true },
      { id: "earnings", label: "Earnings", icon: DollarSign, path: "/business-centre/earnings" },
      { id: "wallet", label: "Wallet", icon: Wallet, path: "/business-centre/wallet" },
      { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight, path: "/business-centre/withdrawals" },
      { id: "statements", label: "Statements", icon: FileText, path: "/business-centre/statements" },
      { id: "payout-oversight", label: "Payout Oversight", icon: CreditCard, path: "/business-centre/payout-oversight", adminOnly: true },
      { id: "wallet-controls", label: "Wallet Controls", icon: Wallet, path: "/business-centre/wallet-controls", superAdminOnly: true },
    ],
  },
  {
    title: "6. MLM System",
    moduleNumber: 6,
    items: [
      { id: "binary-tree", label: "Binary Tree", icon: GitBranch, path: "/business-centre/binary-tree" },
      { id: "network", label: "Network", icon: Link2, path: "/business-centre/network" },
      { id: "referrals", label: "Referrals", icon: Share2, path: "/business-centre/referrals" },
      { id: "commissions", label: "Commissions", icon: BarChart3, path: "/business-centre/commissions" },
      { id: "commission-runs", label: "Commission Runs", icon: CreditCard, path: "/business-centre/commission-runs", adminOnly: true },
      { id: "rank-activation", label: "Rank & Activation", icon: Award, path: "/business-centre/rank-activation" },
      { id: "rank-manager", label: "Rank Manager", icon: Crown, path: "/business-centre/rank-manager", adminOnly: true },
      { id: "package-manager", label: "Package Manager", icon: Package, path: "/business-centre/package-manager", adminOnly: true },
      { id: "member-search", label: "Member Search", icon: Search, path: "/business-centre/member-search", adminOnly: true },
      { id: "genealogy-explorer", label: "Genealogy Explorer", icon: GitBranch, path: "/business-centre/genealogy-explorer", adminOnly: true },
      { id: "manual-placement", label: "Manual Placement", icon: GitBranch, path: "/business-centre/manual-placement", superAdminOnly: true },
    ],
  },
  {
    title: "7. Tokenomics",
    moduleNumber: 7,
    items: [
      { id: "token-rewards", label: "Token Rewards", icon: Coins, path: "/business-centre/token-rewards" },
    ],
  },
  {
    title: "8. Coupons & Promotions",
    moduleNumber: 8,
    items: [
      { id: "coupons", label: "Coupons", icon: Ticket, path: "/business-centre/coupons" },
      { id: "marketing", label: "Marketing", icon: Megaphone, path: "/business-centre/marketing" },
    ],
  },
  {
    title: "9. Customer Service",
    moduleNumber: 9,
    items: [
      { id: "support", label: "Support Queue", icon: HelpCircle, path: "/business-centre/support" },
    ],
  },
  {
    title: "10. Reports & Analytics",
    moduleNumber: 10,
    items: [
      { id: "reports", label: "Reports", icon: BarChart3, path: "/business-centre/reports", adminOnly: true },
    ],
  },
  {
    title: "11. Compliance & Security",
    moduleNumber: 11,
    items: [
      { id: "compliance", label: "Compliance", icon: Scale, path: "/business-centre/compliance", adminOnly: true },
      { id: "security-roles", label: "Security & Roles", icon: Lock, path: "/business-centre/security-roles", superAdminOnly: true },
    ],
  },
  {
    title: "12. Settings & Audit",
    moduleNumber: 12,
    items: [
      { id: "control-center", label: "Control Center", icon: Shield, path: "/business-centre/control-center", superAdminOnly: true },
      { id: "system-settings", label: "System Settings", icon: Settings, path: "/business-centre/system-settings", superAdminOnly: true },
      { id: "global-config", label: "Global Config", icon: Globe, path: "/business-centre/global-config", superAdminOnly: true },
      { id: "audit-logs", label: "Audit Logs", icon: FileText, path: "/business-centre/audit-logs", superAdminOnly: true },
    ],
  },
];

const BusinessCentreShell = () => {
  const { user } = useAuth();
  const { isAdmin, isAnyAdmin, isAdminReadonly } = useUserRoles();
  const { data, viewAsMember, setViewAsMember, isViewingAsMember } = useBusinessCentre();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ user_id: string; full_name: string; email: string }>>([]);
  const [searching, setSearching] = useState(false);

  const tier = data.membership?.tier || "free";
  const roleBadge = isAdmin ? "Super Admin" : isAdminReadonly ? "Read-Only Admin" : isAnyAdmin ? "Admin" : `${tier.charAt(0).toUpperCase() + tier.slice(1)} Member`;

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    const { data: results } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(8);
    setSearchResults(results || []);
    setSearching(false);
  };

  const selectMember = (m: { user_id: string; full_name: string; email: string }) => {
    setViewAsMember({ userId: m.user_id, name: m.full_name || m.email, email: m.email });
    setSearchResults([]);
    setSearchQuery("");
  };

  const isActive = (path: string) => location.pathname === path;

  // Determine which sections to show
  const useAdminLayout = isAnyAdmin && !isViewingAsMember;

  const getFilteredSections = () => {
    if (!useAdminLayout) {
      // Member view
      return MEMBER_SECTIONS.map(s => ({
        title: s.title,
        isAdmin: false,
        items: s.items,
      }));
    }

    // Admin view — 12 modules with permission filtering
    return ADMIN_SECTIONS.filter(section => {
      const items = section.items.filter(item => {
        if (item.superAdminOnly && !isAdmin) return false;
        if (item.adminOnly && !isAnyAdmin) return false;
        return true;
      });
      return items.length > 0;
    }).map(section => ({
      title: section.title,
      isAdmin: section.items.some(i => i.adminOnly || i.superAdminOnly),
      items: section.items.filter(item => {
        if (item.superAdminOnly && !isAdmin) return false;
        if (item.adminOnly && !isAnyAdmin) return false;
        return true;
      }),
    }));
  };

  const filteredSections = getFilteredSections();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold font-display truncate">Business Centre</p>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-0.5">{roleBadge}</Badge>
          </div>
        </div>
      </div>

      {/* View as Member Banner */}
      {isViewingAsMember && viewAsMember && (
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Viewing as Member</span>
          </div>
          <p className="text-xs font-medium truncate">{viewAsMember.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{viewAsMember.email}</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 h-7 text-[10px] border-amber-500/30 text-amber-700 dark:text-amber-400"
            onClick={() => setViewAsMember(null)}
          >
            <ArrowLeft className="h-3 w-3 mr-1" /> Return to Admin View
          </Button>
        </div>
      )}

      {/* Admin: View as Member search */}
      {isAnyAdmin && !isViewingAsMember && (
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-medium text-muted-foreground">
            <UserCircle className="h-3.5 w-3.5" /> View as Member
          </div>
          <div className="flex gap-1.5">
            <Input
              placeholder="Name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-7 text-[11px]"
            />
            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1.5 border border-border rounded-md overflow-hidden max-h-32 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={r.user_id}
                  className="w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0"
                  onClick={() => selectMember(r)}
                >
                  <span className="font-medium">{r.full_name || "—"}</span>
                  <span className="text-muted-foreground ml-1 text-[10px]">{r.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-3">
          {filteredSections.map((section) => (
            <div key={section.title}>
              {section.isAdmin && <Separator className="mb-2" />}
              <p className={cn(
                "px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider",
                section.isAdmin ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              )}>
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.id + item.path}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      (item.adminOnly || item.superAdminOnly) && !isActive(item.path) && "text-amber-600/70 dark:text-amber-400/70"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.superAdminOnly && (
                      <Crown className="h-2.5 w-2.5 ml-auto text-amber-500/50 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />

      {/* View as Member top banner */}
      {isViewingAsMember && viewAsMember && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Viewing Business Centre as <strong>{viewAsMember.name}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/30" onClick={() => setViewAsMember(null)}>
              Return to Admin View
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-0 lg:top-16 left-0 z-40 lg:z-auto h-screen lg:h-[calc(100vh-4rem)] w-64 bg-card border-r border-border/50 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default BusinessCentreShell;
