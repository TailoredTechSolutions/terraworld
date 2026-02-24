import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  DollarSign,
  Wallet,
  Truck,
  Coins,
  Users,
  Bell,
  LifeBuoy,
  UserCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  title: string;
  tab: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: "Home", tab: "overview", icon: LayoutDashboard },
  { title: "Products", tab: "products", icon: Package },
  { title: "Pricing", tab: "pricing", icon: Receipt },
  { title: "Orders", tab: "orders", icon: ShoppingBag },
  { title: "Earnings", tab: "earnings", icon: DollarSign },
  { title: "Withdraw", tab: "withdrawals", icon: Wallet },
  { title: "Delivery", tab: "delivery", icon: Truck },
  { title: "Tokens", tab: "tokens", icon: Coins },
  { title: "Referrals", tab: "referrals", icon: Users },
  { title: "Alerts", tab: "notifications", icon: Bell },
  { title: "Support", tab: "support", icon: LifeBuoy },
  { title: "Profile", tab: "profile", icon: UserCircle },
];

interface FarmerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FarmerSidebar = ({ activeTab, onTabChange }: FarmerSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full glass-card border-r border-glass-border",
      collapsed && !inSheet ? "w-16" : "w-64",
      "transition-all duration-300"
    )}>
      {!inSheet && (
        <div className="flex items-center justify-end p-2 border-b border-glass-border">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onTabChange(item.tab)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow-primary"
                    : "text-muted-foreground hover:bg-glass hover:text-foreground",
                  collapsed && !inSheet && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {(!collapsed || inSheet) && <span className="truncate">{item.title}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
      {(!collapsed || inSheet) && (
        <div className="p-4 border-t border-glass-border">
          <p className="text-xs text-muted-foreground text-center">Terra Farmer Portal</p>
        </div>
      )}
    </div>
  );

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

  return <SidebarContent />;
};

export default FarmerSidebar;
