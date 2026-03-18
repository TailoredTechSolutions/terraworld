import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut, LogIn, ShoppingBag, Tractor, Truck, Shield, Crown, Users, Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { LOGO as terraLogo } from "@/lib/siteImages";
import ThemeToggle from "@/components/ThemeToggle";
import { DesktopNav, MobileMenuDrawer } from "@/components/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin, isAnyAdmin, isAdminReadonly, isDriver, isFarmer, isBuyer, isMember, isAffiliate } = useUserRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  const getDashboardLinks = () => {
    const links: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    if (isAnyAdmin) {
      // Admins/Super Admins get access to ALL dashboards
      links.push({ path: "/admin", label: "Admin Dashboard", icon: Shield });
      links.push({ path: "/buyer", label: "Buyer Dashboard", icon: ShoppingBag });
      links.push({ path: "/farmer", label: "Farmer Dashboard", icon: Tractor });
      links.push({ path: "/driver", label: "Driver Dashboard", icon: Truck });
      links.push({ path: "/business-centre", label: "Business Centre", icon: Briefcase });
    } else {
      if (isBuyer) links.push({ path: "/buyer", label: "Buyer Dashboard", icon: ShoppingBag });
      if (isFarmer) links.push({ path: "/farmer", label: "Farmer Dashboard", icon: Tractor });
      if (isDriver) links.push({ path: "/driver", label: "Driver Dashboard", icon: Truck });
      if (isMember) links.push({ path: "/member", label: "Member Dashboard", icon: Users });
      if (isAffiliate) links.push({ path: "/business-centre", label: "Business Centre", icon: Briefcase });
      if (links.length === 0 && user) links.push({ path: "/buyer", label: "My Dashboard", icon: ShoppingBag });
    }
    return links;
  };

  const extraDesktopLinks = user && isAnyAdmin
    ? [{ path: "/business-centre", label: "Business Centre" }]
    : [];

  return (
  <>
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <div className="container flex h-[68px] items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <img src={terraLogo} alt="Terra Farming" width={44} height={44} className="h-11 w-11 object-contain transition-transform group-hover:scale-105 rounded-lg" />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Terra Farming</span>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <span className="hidden sm:block text-[10px] font-semibold tracking-[0.25em] text-muted-foreground uppercase font-display animate-fade-in italic">From Dirt to Dessert</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav extraLinks={extraDesktopLinks} />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex rounded-full" aria-label="User menu">
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

          <Button variant="ghost" size="icon" className="relative" onClick={toggleCart} aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground shadow-glow-accent">
                {totalItems}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>

    {/* Mobile Full-Page Menu — rendered OUTSIDE header to avoid backdrop-filter containment */}
    {isMobileMenuOpen && (
      <MobileMenuDrawer
        user={user}
        profile={profile}
        userEmail={user?.email}
        dashboardLinks={getDashboardLinks()}
        onClose={closeMobile}
        onSignOut={handleSignOut}
      />
    )}
  </>
  );
};

export default Header;
