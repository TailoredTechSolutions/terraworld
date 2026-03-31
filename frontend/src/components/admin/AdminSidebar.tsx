import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  LogOut,
  User,
  UserCog,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  tab: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: "Dashboard", tab: "overview", icon: LayoutDashboard },
  { title: "User & Roles", tab: "users", icon: Users },
  { title: "Marketplace", tab: "marketplace", icon: ShoppingBag },
  { title: "Orders", tab: "orders", icon: ShoppingBag },
  { title: "Financial Engine", tab: "financial", icon: Wallet },
  { title: "Logistics", tab: "logistics", icon: Truck },
  { title: "MLM System", tab: "mlm", icon: GitBranch },
  { title: "Token Rewards", tab: "token-rewards", icon: Crown },
  { title: "Customer Service", tab: "customer-service", icon: Ticket },
  { title: "Reports", tab: "reports", icon: BarChart3 },
  { title: "Audit Logs", tab: "audit-logs", icon: FileText },
  { title: "Settings", tab: "settings", icon: Settings },
  { title: "Integrations", tab: "integrations", icon: Activity },
];

const secondaryNavItems: NavItem[] = [
  { title: "Farmers", tab: "farmers", icon: Tractor },
  { title: "Memberships", tab: "memberships", icon: Crown },
  { title: "Genealogy", tab: "genealogy", icon: GitBranch },
  { title: "BV Ledger", tab: "bv-ledger", icon: Activity },
  { title: "Payout Ledger", tab: "payout-ledger", icon: FileText },
  { title: "Commissions", tab: "compensation", icon: Play },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface UserProfile {
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

const SUPER_ADMIN_ROLES: string[] = ['admin', 'farmer', 'buyer', 'member', 'driver', 'business_buyer'];

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('user_id', user.id)
        .single();
      if (data) setProfile(data);

      // Check if user has ALL roles (super admin)
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (roles) {
        const userRoles: string[] = roles.map(r => r.role as string);
        setIsSuperAdmin(SUPER_ADMIN_ROLES.every(r => userRoles.includes(r)));
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border",
      collapsed && !inSheet ? "w-16" : "w-64",
      "transition-all duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {(!collapsed || inSheet) && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Admin Panel</span>
            {isSuperAdmin && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-1.5 py-0 text-[10px] font-bold">
                <Crown className="h-2.5 w-2.5 mr-0.5" />
                SUPER
              </Badge>
            )}
          </div>
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

      {/* Profile Section */}
      <div className="p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary transition-colors",
              collapsed && !inSheet && "justify-center"
            )}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(profile?.full_name || null, profile?.email || user?.email || '')}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || inSheet) && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">
                      {profile?.full_name || 'Admin User'}
                    </p>
                    {isSuperAdmin && (
                      <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] font-bold border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        DEV
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {isSuperAdmin ? 'Super Admin' : (profile?.email || user?.email)}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onTabChange('users')}>
              <UserCog className="h-4 w-4 mr-2" />
              Manage Users & Roles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/member')}>
              <User className="h-4 w-4 mr-2" />
              Member Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer */}
      {(!collapsed || inSheet) && (
        <div className="px-4 pb-3">
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
