import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  ShoppingBag,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Tractor,
  Truck,
  Crown,
  Activity,
  Play,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  title: string;
  tab: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    tab: "overview",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    tab: "users",
    icon: Users,
  },
  {
    title: "Genealogy",
    tab: "genealogy",
    icon: GitBranch,
  },
  {
    title: "Orders",
    tab: "orders",
    icon: ShoppingBag,
  },
  {
    title: "Commissions",
    tab: "compensation",
    icon: Play,
  },
  {
    title: "Withdrawals",
    tab: "payout-ledger",
    icon: Wallet,
  },
  {
    title: "Reports",
    tab: "reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    tab: "settings",
    icon: Settings,
  },
];

const secondaryNavItems: NavItem[] = [
  {
    title: "Farmers",
    tab: "farmers",
    icon: Tractor,
  },
  {
    title: "Drivers",
    tab: "drivers",
    icon: Truck,
  },
  {
    title: "Memberships",
    tab: "memberships",
    icon: Crown,
  },
  {
    title: "BV Ledger",
    tab: "bv-ledger",
    icon: Activity,
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border",
      collapsed && !inSheet ? "w-16" : "w-64",
      "transition-all duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {(!collapsed || inSheet) && (
          <span className="font-semibold text-foreground">Admin Panel</span>
        )}
        {!inSheet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-2">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {(!collapsed || inSheet) && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </p>
            )}
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.title}
                  onClick={() => onTabChange(item.tab)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && !inSheet && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  {(!collapsed || inSheet) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Secondary Navigation */}
          <nav className="space-y-1">
            {(!collapsed || inSheet) && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Management
              </p>
            )}
            {secondaryNavItems.map((item) => {
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.title}
                  onClick={() => onTabChange(item.tab)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && !inSheet && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  {(!collapsed || inSheet) && (
                    <span className="truncate">{item.title}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </ScrollArea>

      {/* Footer */}
      {(!collapsed || inSheet) && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Terra Admin v1.0
          </p>
        </div>
      )}
    </div>
  );

  // Mobile: Use Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed bottom-4 left-4 z-50 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 h-12 w-12 rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent inSheet />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return <SidebarContent />;
};

export default AdminSidebar;
