import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Search, Plus, User, LogOut, ChevronDown, Shield, Home, Tractor, ShoppingCart, Truck, Settings } from "lucide-react";
import type { SectionId } from "@/pages/AdminBackOffice";
import terraLogo from "@/assets/terra-logo.png";

interface Props {
  sections: readonly { id: SectionId; label: string }[];
  activeTab: SectionId;
  onTabClick: (id: SectionId) => void;
}

const BackOfficeTopBar = ({ sections, activeTab, onTabClick }: Props) => {
  const { profile, signOut } = useAuth();
  const { roles } = useUserRoles();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/60 shadow-sm">
      {/* Row 1: Logo, Search, Actions */}
      <div className="flex items-center gap-4 px-4 lg:px-8 h-14 max-w-[1600px] mx-auto">
        {/* Left: Logo + env badge */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={terraLogo} alt="Terra" className="h-8 w-8" />
          <span className="font-display font-bold text-foreground text-lg hidden sm:inline">Terra</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary font-mono">
            DEV
          </Badge>
        </div>

        {/* Center: Global search */}
        <div className="flex-1 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members, orders, payouts, tickets…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/60 border-border/50 text-sm"
          />
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
          </Button>

          {/* Create dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Create <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>New User</DropdownMenuItem>
              <DropdownMenuItem>New Product</DropdownMenuItem>
              <DropdownMenuItem>New Payout Run</DropdownMenuItem>
              <DropdownMenuItem>New Ticket</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Manual Adjustment</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 gap-2 text-xs">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="hidden md:inline">{profile?.full_name || profile?.email || "Admin"}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-3">
                <p className="text-sm font-medium">{profile?.full_name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {roles.map(r => (
                    <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">{r}</Badge>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Navigate To</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Home className="h-3.5 w-3.5 mr-2" /> Main Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/farmer')}>
                <Tractor className="h-3.5 w-3.5 mr-2" /> Farmer Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/buyer')}>
                <ShoppingCart className="h-3.5 w-3.5 mr-2" /> Buyer Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/driver')}>
                <Truck className="h-3.5 w-3.5 mr-2" /> Driver Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/member')}>
                <User className="h-3.5 w-3.5 mr-2" /> Member Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/business-centre')}>
                <Settings className="h-3.5 w-3.5 mr-2" /> Business Centre
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onTabClick('users' as SectionId)}>
                <User className="h-3.5 w-3.5 mr-2" /> My Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 2: Navigation Tabs */}
      <div className="border-t border-border/30">
        <nav className="flex items-center gap-0.5 px-4 lg:px-8 max-w-[1600px] mx-auto overflow-x-auto scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => onTabClick(s.id)}
              className={`
                relative px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors
                ${activeTab === s.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {s.label}
              {activeTab === s.id && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default BackOfficeTopBar;
