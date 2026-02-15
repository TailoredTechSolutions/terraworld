import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, MapPin, Menu, X, User, Truck, Crown, Shield, LogOut, LogIn, Store, ShoppingBag, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import terraLogo from "@/assets/terra-logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AppRole = 'farmer' | 'business_buyer' | 'member' | 'driver' | 'admin' | 'buyer';

interface NavLink {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  authRequired?: boolean;
  roles?: AppRole[];
}

const Header = () => {
  const location = useLocation();
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, profile, signOut, loading } = useAuth();
  const { roles, isAdmin, isDriver, isFarmer, isBuyer } = useUserRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  // Public nav links only — role-specific dashboards go in user dropdown
  const navLinks: NavLink[] = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop", icon: Store },
    { path: "/map", label: "Find Farms" },
    { path: "/affiliate", label: "Earn" },
  ];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  // Build dashboard links based on user roles
  const getDashboardLinks = () => {
    const links: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];
    
    if (isBuyer) {
      links.push({ path: "/buyer", label: "Buyer Dashboard", icon: ShoppingBag });
    }
    if (isFarmer) {
      links.push({ path: "/farmer", label: "Farmer Dashboard", icon: Tractor });
    }
    if (isDriver) {
      links.push({ path: "/driver", label: "Driver Dashboard", icon: Truck });
    }
    if (isAdmin) {
      links.push({ path: "/admin", label: "Admin Dashboard", icon: Shield });
    }
    // Fallback: if no specific role, show member
    if (links.length === 0 && user) {
      links.push({ path: "/member", label: "Member Dashboard", icon: Crown });
    }
    
    return links;
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={terraLogo} alt="Terra" className="h-9 w-9 object-contain transition-transform group-hover:scale-105" />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Terra</span>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <span className="hidden sm:block text-xs font-medium tracking-wide text-muted-foreground uppercase">From Dirt to Dessert</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn("nav-link-animated", location.pathname === link.path && "active")}
            >
              {link.icon && <link.icon className="h-4 w-4 nav-icon" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(profile?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {profile?.referral_code && (
                        <p className="text-xs text-accent font-mono">Code: {profile.referral_code}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Dashboards</DropdownMenuLabel>
                  {getDashboardLinks().map((dl) => (
                    <DropdownMenuItem key={dl.path} asChild>
                      <Link to={dl.path} className="flex items-center gap-2 cursor-pointer">
                        <dl.icon className="h-4 w-4" />
                        {dl.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="hidden md:flex gap-2 btn-liquid text-sm py-2 px-4 h-auto">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )
          )}

          <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground shadow-glow-accent">
                {totalItems}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-glass-border bg-glass backdrop-blur-glass animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2",
                  location.pathname === link.path
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:translate-x-1"
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            
            <div className="border-t border-border pt-2 mt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Dashboards</p>
                  {getDashboardLinks().map((dl) => (
                    <Link
                      key={dl.path}
                      to={dl.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"
                    >
                      <dl.icon className="h-4 w-4" />
                      {dl.label}
                    </Link>
                  ))}
                  <button onClick={handleSignOut} className="w-full px-4 py-3 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 flex items-center gap-2 mt-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
