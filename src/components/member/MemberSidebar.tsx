import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Wallet,
  TrendingUp,
  ArrowUpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Menu,
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
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/member?tab=overview",
    icon: LayoutDashboard,
  },
  {
    title: "My Genealogy",
    href: "/member?tab=genealogy",
    icon: GitBranch,
  },
  {
    title: "My Earnings",
    href: "/member?tab=earnings",
    icon: TrendingUp,
  },
  {
    title: "Upgrade / Activation",
    href: "/member?tab=upgrade",
    icon: ArrowUpCircle,
  },
  {
    title: "Withdraw Funds",
    href: "/member?tab=withdraw",
    icon: Wallet,
  },
  {
    title: "Support",
    href: "/member?tab=support",
    icon: Ticket,
  },
  {
    title: "Settings",
    href: "/member?tab=settings",
    icon: Settings,
  },
];

interface MemberSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MemberSidebar = ({ activeTab, onTabChange }: MemberSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const getTabFromHref = (href: string) => {
    const params = new URLSearchParams(href.split("?")[1]);
    return params.get("tab") || "overview";
  };

  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full glass-card border-r border-glass-border",
      collapsed && !inSheet ? "w-16" : "w-64",
      "transition-all duration-300"
    )}>
      {/* Collapse Toggle - Desktop Only */}
      {!inSheet && (
        <div className="flex items-center justify-end p-2 border-b border-glass-border">
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
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const tab = getTabFromHref(item.href);
            const isActive = activeTab === tab;

            return (
              <button
                key={item.title}
                onClick={() => onTabChange(tab)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow-primary"
                    : "text-muted-foreground hover:bg-glass hover:text-foreground",
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
                {item.badge && (!collapsed || inSheet) && (
                  <span className="ml-auto text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {(!collapsed || inSheet) && (
        <div className="p-4 border-t border-glass-border">
          <p className="text-xs text-muted-foreground text-center">
            Terra Member Portal
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

export default MemberSidebar;
