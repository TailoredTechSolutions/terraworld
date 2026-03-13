import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home, Package, History, ToggleLeft, Wallet,
  Bell, LifeBuoy, User, Truck, Menu, ChevronLeft, ChevronRight,
} from "lucide-react";

interface NavItem { title: string; tab: string; icon: React.ElementType; }
interface NavGroup { label: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
  {
    label: "DELIVERIES",
    items: [
      { title: "Home", tab: "home", icon: Home },
      { title: "Assigned", tab: "assigned", icon: Package },
      { title: "History", tab: "history", icon: History },
      { title: "Availability", tab: "availability", icon: ToggleLeft },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { title: "Earnings", tab: "earnings", icon: Wallet },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { title: "Notifications", tab: "notifications", icon: Bell },
      { title: "Support", tab: "support", icon: LifeBuoy },
      { title: "Profile", tab: "profile", icon: User },
    ],
  },
];

interface DriverSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DriverSidebar = ({ activeTab, onTabChange }: DriverSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className="flex flex-col h-full py-4 gap-1">
      {!inSheet && (
        <div className="flex items-center gap-2 px-3 mb-4">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          {!collapsed && <span className="font-semibold text-sm">Driver Portal</span>}
        </div>
      )}
      {navGroups.map((group) => (
        <div key={group.label} className="mb-2">
          {!collapsed && (
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-3 mb-1">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <Button
                key={item.tab}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`w-full justify-start gap-2 h-9 px-3 ${isActive ? "font-semibold" : "font-normal text-muted-foreground"} ${collapsed && !inSheet ? "justify-center px-2" : ""}`}
                onClick={() => onTabChange(item.tab)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {(!collapsed || inSheet) && <span className="truncate">{item.title}</span>}
              </Button>
            );
          })}
        </div>
      ))}
      {!inSheet && (
        <div className="mt-auto px-2">
          <Button variant="ghost" size="icon" className="w-full h-8" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <aside className="flex flex-col h-full w-14 shrink-0 border-r border-border bg-background">
        <div className="flex items-center justify-center py-3">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <nav className="flex flex-col items-center gap-1 px-1">
            {navGroups.map((group) => (
              <div key={group.label} className="w-full">
                <div className="h-px bg-border mx-2 my-1" />
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;
                  return (
                    <Button
                      key={item.tab}
                      variant={isActive ? "secondary" : "ghost"}
                      size="icon"
                      title={item.title}
                      className={`w-full h-10 ${isActive ? "font-semibold" : "text-muted-foreground"}`}
                      onClick={() => onTabChange(item.tab)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${collapsed ? "w-14" : "w-52"} border-r border-border bg-background shrink-0 transition-all duration-200 hidden md:block`}>
      <SidebarContent />
    </aside>
  );
};

export default DriverSidebar;
