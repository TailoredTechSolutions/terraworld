import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, MapPin, Menu, X, User, Truck, Crown, Shield, LogOut, LogIn, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import terraLogo from "@/assets/terra-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AppRole = 'farmer' | 'business_buyer' | 'member' | 'driver' | 'admin';

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
  const { roles, isAdmin, isDriver } = useUserRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  const navLinks: NavLink[] = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop", icon: Store },
    { path: "/map", label: "Find Farms" },
    { path: "/affiliate", label: "Earn" },
    { path: "/member", label: "Member", icon: Crown, authRequired: true },
    { path: "/driver", label: "Driver", icon: Truck, authRequired: true, roles: ['driver', 'admin'] },
    { path: "/admin", label: "Admin", icon: Shield, authRequired: true, roles: ['admin'] },
  ];

  const canAccessLink = (link: NavLink): boolean => {
    // Public links
    if (!link.authRequired) return true;
    // Auth required but not logged in
    if (!user) return false;
    // No specific roles required, just auth
    if (!link.roles) return true;
    // Check if user has any of the required roles (admins always have access)
    return isAdmin || link.roles.some(role => roles.includes(role));
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={terraLogo} 
            alt="Terra" 
            className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              Terra
            </span>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <span className="hidden sm:block text-xs font-medium tracking-wide text-muted-foreground uppercase">
              From Dirt to Dessert
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks
            .filter(canAccessLink)
            .map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5",
                  location.pathname === link.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <MapPin className="h-5 w-5" />
          </Button>
          
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
                      <p className="text-sm font-medium">{profile?.full_name || "Member"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {profile?.referral_code && (
                        <p className="text-xs text-accent font-mono">
                          Code: {profile.referral_code}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Dashboards</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/member" className="flex items-center gap-2 cursor-pointer">
                      <Crown className="h-4 w-4" />
                      Member Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/driver" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="h-4 w-4" />
                      Driver Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
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

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={toggleCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground shadow-glow-accent">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-glass-border bg-glass backdrop-blur-glass animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks
              .filter(canAccessLink)
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                    location.pathname === link.path
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
                    <p className="text-sm font-medium">{profile?.full_name || "Member"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {profile?.referral_code && (
                      <p className="text-xs text-accent font-mono mt-1">
                        Referral: {profile.referral_code}
                      </p>
                    )}
                  </div>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Dashboards</p>
                  <Link
                    to="/member"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Member Dashboard
                  </Link>
                  <Link
                    to="/driver"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Driver Dashboard
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 flex items-center gap-2 mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In / Sign Up
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
