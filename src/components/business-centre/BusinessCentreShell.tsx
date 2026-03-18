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
import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import {
  LayoutDashboard, Users, GitBranch, DollarSign, Share2, Award, Ticket,
  Wallet, Megaphone, HelpCircle, Search, BarChart3, CreditCard, Scale,
  Settings, Lock, FileText, Shield, Zap, Crown, UserCircle, X, Eye,
  ArrowLeft, Menu, ChevronUp, Loader2, Coins, ArrowUpRight, Package,
  Globe, Store, Truck, Link2
} from "lucide-react";

// ─── Lazy-loaded section components ───
const BCOverview = lazy(() => import("@/pages/business-centre/BCOverview"));
const BCUsersRoles = lazy(() => import("@/pages/business-centre/BCUsersRoles"));
const BCMarketplace = lazy(() => import("@/pages/business-centre/BCMarketplace"));
const BCLogistics = lazy(() => import("@/pages/business-centre/BCLogistics"));
const BCFinancialManagement = lazy(() => import("@/pages/business-centre/BCFinancialManagement"));
const BCEarnings = lazy(() => import("@/pages/business-centre/BCEarnings"));
const BCWallet = lazy(() => import("@/pages/business-centre/BCWallet"));
const BCWithdrawals = lazy(() => import("@/pages/business-centre/BCWithdrawals"));
const BCStatements = lazy(() => import("@/pages/business-centre/BCStatements"));
const BCMLMSystem = lazy(() => import("@/pages/business-centre/BCMLMSystem"));
const BCBinaryTree = lazy(() => import("@/pages/business-centre/BCBinaryTree"));
const BCNetwork = lazy(() => import("@/pages/business-centre/BCNetwork"));
const BCReferrals = lazy(() => import("@/pages/business-centre/BCReferrals"));
const BCCommissions = lazy(() => import("@/pages/business-centre/BCCommissions"));
const BCRankActivation = lazy(() => import("@/pages/business-centre/BCRankActivation"));
const BCTokenomics = lazy(() => import("@/pages/business-centre/BCTokenomics"));
const BCTokenRewards = lazy(() => import("@/pages/business-centre/BCTokenRewards"));
const BCCoupons = lazy(() => import("@/pages/business-centre/BCCoupons"));
const BCMarketing = lazy(() => import("@/pages/business-centre/BCMarketing"));
const BCCustomerService = lazy(() => import("@/pages/business-centre/BCCustomerService"));
const BCSupport = lazy(() => import("@/pages/business-centre/BCSupport"));
const BCReportsAnalytics = lazy(() => import("@/pages/business-centre/BCReportsAnalytics"));
const BCComplianceAudit = lazy(() => import("@/pages/business-centre/BCComplianceAudit"));
const BCControlCenter = lazy(() => import("@/pages/business-centre/BCControlCenter"));

// Admin extended
const BCPackageManager = lazy(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCPackageManager })));
const BCRankManager = lazy(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCRankManager })));
const BCWalletControls = lazy(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCWalletControls })));
const BCGlobalConfig = lazy(() => import("@/pages/business-centre/BCAdminExtended").then(m => ({ default: m.BCGlobalConfig })));

// Admin pages
const BCMemberSearch = lazy(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCMemberSearch })));
const BCCommissionRuns = lazy(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCCommissionRuns })));
const BCPayoutOversight = lazy(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCPayoutOversight })));
const BCSystemSettings = lazy(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCSystemSettings })));
const BCSecurity = lazy(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCSecurity })));
const BCAuditLogs = lazy(() => import("@/pages/business-centre/BCAdminPages").then(m => ({ default: m.BCAuditLogs })));

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  component: React.LazyExoticComponent<any>;
}

// ─── MEMBER SECTIONS (single-page scroll) ───
const MEMBER_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, component: BCOverview },
    ],
  },
  {
    title: "My Network",
    items: [
      { id: "binary-tree", label: "Binary Tree", icon: GitBranch, component: BCBinaryTree },
      { id: "network", label: "Network", icon: Users, component: BCNetwork },
      { id: "referrals", label: "Referrals", icon: Share2, component: BCReferrals },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "earnings", label: "Earnings", icon: DollarSign, component: BCEarnings },
      { id: "commissions", label: "Commissions", icon: BarChart3, component: BCCommissions },
      { id: "wallet", label: "Wallet", icon: Wallet, component: BCWallet },
      { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight, component: BCWithdrawals },
      { id: "statements", label: "Statements", icon: FileText, component: BCStatements },
    ],
  },
  {
    title: "Growth",
    items: [
      { id: "rank-activation", label: "Rank & Activation", icon: Award, component: BCRankActivation },
      { id: "token-rewards", label: "Token Rewards", icon: Coins, component: BCTokenRewards },
      { id: "coupons", label: "Coupons", icon: Ticket, component: BCCoupons },
      { id: "marketing", label: "Marketing", icon: Megaphone, component: BCMarketing },
    ],
  },
  {
    title: "Support",
    items: [
      { id: "support", label: "Support", icon: HelpCircle, component: BCSupport },
    ],
  },
];

const ADMIN_SECTIONS: { title: string; moduleNumber: number; items: NavItem[] }[] = [
  {
    title: "1. Overview",
    moduleNumber: 1,
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, component: BCOverview },
    ],
  },
  {
    title: "2. Users & Roles",
    moduleNumber: 2,
    items: [
      { id: "users", label: "User Management", icon: Users, adminOnly: true, component: BCUsersRoles },
    ],
  },
  {
    title: "3. Marketplace",
    moduleNumber: 3,
    items: [
      { id: "marketplace", label: "Marketplace Ops", icon: Store, adminOnly: true, component: BCMarketplace },
    ],
  },
  {
    title: "4. Logistics",
    moduleNumber: 4,
    items: [
      { id: "logistics", label: "Logistics & Delivery", icon: Truck, adminOnly: true, component: BCLogistics },
    ],
  },
  {
    title: "5. Financial Management",
    moduleNumber: 5,
    items: [
      { id: "financial-mgmt", label: "Financial Overview", icon: DollarSign, adminOnly: true, component: BCFinancialManagement },
      { id: "earnings", label: "Earnings", icon: DollarSign, component: BCEarnings },
      { id: "wallet", label: "Wallet", icon: Wallet, component: BCWallet },
      { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight, component: BCWithdrawals },
      { id: "statements", label: "Statements", icon: FileText, component: BCStatements },
      { id: "payout-oversight", label: "Payout Oversight", icon: CreditCard, adminOnly: true, component: BCPayoutOversight },
      { id: "wallet-controls", label: "Wallet Controls", icon: Wallet, superAdminOnly: true, component: BCWalletControls },
    ],
  },
  {
    title: "6. MLM System",
    moduleNumber: 6,
    items: [
      { id: "mlm-system", label: "MLM Console", icon: GitBranch, adminOnly: true, component: BCMLMSystem },
      { id: "binary-tree", label: "Binary Tree", icon: GitBranch, component: BCBinaryTree },
      { id: "network", label: "Network", icon: Link2, component: BCNetwork },
      { id: "referrals", label: "Referrals", icon: Share2, component: BCReferrals },
      { id: "commissions", label: "Commissions", icon: BarChart3, component: BCCommissions },
      { id: "commission-runs", label: "Commission Runs", icon: CreditCard, adminOnly: true, component: BCCommissionRuns },
      { id: "rank-activation", label: "Rank & Activation", icon: Award, component: BCRankActivation },
      { id: "rank-manager", label: "Rank Manager", icon: Crown, adminOnly: true, component: BCRankManager },
      { id: "package-manager", label: "Package Manager", icon: Package, adminOnly: true, component: BCPackageManager },
      { id: "member-search", label: "Member Search", icon: Search, adminOnly: true, component: BCMemberSearch },
      { id: "genealogy-explorer", label: "Genealogy Explorer", icon: GitBranch, adminOnly: true, component: BCBinaryTree },
      { id: "manual-placement", label: "Placement Console", icon: GitBranch, superAdminOnly: true, component: BCControlCenter },
    ],
  },
  {
    title: "7. Tokenomics",
    moduleNumber: 7,
    items: [
      { id: "tokenomics", label: "Tokenomics Admin", icon: Coins, adminOnly: true, component: BCTokenomics },
      { id: "token-rewards", label: "Token Rewards", icon: Coins, component: BCTokenRewards },
    ],
  },
  {
    title: "8. Coupons & Promotions",
    moduleNumber: 8,
    items: [
      { id: "coupons", label: "Coupons", icon: Ticket, component: BCCoupons },
      { id: "marketing", label: "Marketing", icon: Megaphone, component: BCMarketing },
    ],
  },
  {
    title: "9. Customer Service",
    moduleNumber: 9,
    items: [
      { id: "customer-service", label: "Service Console", icon: HelpCircle, adminOnly: true, component: BCCustomerService },
      { id: "support", label: "Support Queue", icon: HelpCircle, component: BCSupport },
    ],
  },
  {
    title: "10. Reports & Analytics",
    moduleNumber: 10,
    items: [
      { id: "reports", label: "Reports", icon: BarChart3, adminOnly: true, component: BCReportsAnalytics },
    ],
  },
  {
    title: "11. Compliance & Security",
    moduleNumber: 11,
    items: [
      { id: "compliance-audit", label: "Compliance & Audit", icon: Scale, adminOnly: true, component: BCComplianceAudit },
      { id: "security-roles", label: "Security & Roles", icon: Lock, superAdminOnly: true, component: BCSecurity },
    ],
  },
  {
    title: "12. Settings & Audit",
    moduleNumber: 12,
    items: [
      { id: "control-center", label: "Control Center", icon: Shield, superAdminOnly: true, component: BCControlCenter },
      { id: "system-settings", label: "System Settings", icon: Settings, superAdminOnly: true, component: BCSystemSettings },
      { id: "global-config", label: "Global Config", icon: Globe, superAdminOnly: true, component: BCGlobalConfig },
      { id: "audit-logs", label: "Audit Logs", icon: FileText, superAdminOnly: true, component: BCAuditLogs },
    ],
  },
];

const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const BusinessCentreShell = () => {
  const { user } = useAuth();
  const { isAdmin, isAnyAdmin, isAdminReadonly } = useUserRoles();
  const { data, viewAsMember, setViewAsMember, isViewingAsMember } = useBusinessCentre();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ user_id: string; full_name: string; email: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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

  // Determine which sections to show
  const useAdminLayout = isAnyAdmin && !isViewingAsMember;

  const getFilteredSections = useCallback(() => {
    if (!useAdminLayout) {
      return MEMBER_SECTIONS.map(s => ({
        title: s.title,
        isAdmin: false,
        items: s.items,
      }));
    }

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
  }, [useAdminLayout, isAdmin, isAnyAdmin]);

  const filteredSections = getFilteredSections();

  // Flatten all items for scroll spy and rendering
  const allItems = filteredSections.flatMap(s => s.items);

  // De-duplicate by id (admin layout has duplicates like earnings, wallet across modules)
  const seenIds = new Set<string>();
  const uniqueItems = allItems.filter(item => {
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  // Register section ref
  const registerRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  // Scroll to section
  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setActiveSection(id);
    setSidebarOpen(false);
  }, []);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const offset = 120;
      let current = uniqueItems[0]?.id || "overview";
      for (const item of uniqueItems) {
        const el = sectionRefs.current[item.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) current = item.id;
        }
      }
      setActiveSection(current);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [uniqueItems]);

  // Build sidebar items grouped by section, but deduplicate
  const sidebarSections = (() => {
    const seen = new Set<string>();
    return filteredSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }),
    })).filter(s => s.items.length > 0);
  })();

  const SidebarContentEl = () => (
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

      {/* Navigation — scroll spy anchors */}
      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="space-y-3">
          {sidebarSections.map((section) => (
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
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      (item.adminOnly || item.superAdminOnly) && activeSection !== item.id && "text-amber-600/70 dark:text-amber-400/70"
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

        {/* Sidebar — sticky left nav */}
        <aside className={cn(
          "fixed lg:sticky top-0 lg:top-16 left-0 z-40 lg:z-auto h-screen lg:h-[calc(100vh-4rem)] w-64 bg-card border-r border-border/50 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <SidebarContentEl />
        </aside>

        {/* Main content — single scrollable page with all sections */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-8">
            {uniqueItems.map((item) => (
              <section
                key={item.id}
                ref={registerRef(item.id)}
                id={`bc-section-${item.id}`}
                className="scroll-mt-20"
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold font-display text-foreground">{item.label}</h2>
                  <Separator className="flex-1" />
                </div>

                {/* Section content */}
                <Suspense fallback={<SectionLoader />}>
                  <item.component />
                </Suspense>
              </section>
            ))}
          </div>
        </main>
      </div>

      {/* Back to Top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <Footer />
    </div>
  );
};

export default BusinessCentreShell;
