import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, Crown, Shield, LogOut, LogIn, ShoppingBag, Tractor, Truck } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

type AppRole = 'farmer' | 'business_buyer' | 'member' | 'driver' | 'admin' | 'buyer' | 'affiliate';

// ── Shared nav config ──────────────────────────────────────────
interface NavSection {
  heading: string;
  links: { path: string; label: string }[];
}

const siteNavSections: NavSection[] = [
  {
    heading: "Terra",
    links: [
      { path: "/", label: "Home" },
      { path: "/about", label: "About Terra" },
      { path: "/how-it-works", label: "How Terra Works" },
      { path: "/mission-impact", label: "Mission / Impact" },
      { path: "/pilot-program-baguio", label: "Pilot Program (Baguio)" },
      { path: "/careers", label: "Careers" },
    ],
  },
  {
    heading: "Marketplace",
    links: [
      { path: "/shop", label: "Browse Products" },
      { path: "/marketplace/categories", label: "Categories" },
      { path: "/marketplace/pricing-breakdown", label: "Pricing Breakdown" },
      { path: "/marketplace/order-tracking", label: "Order Tracking" },
      { path: "/marketplace/quality-policy", label: "Quality Policy" },
    ],
  },
  {
    heading: "For Farmers",
    links: [
      { path: "/farmers/onboarding", label: "Farmer Onboarding" },
      { path: "/farmers/upload-products", label: "Upload Products" },
      { path: "/farmers/payouts-settlement", label: "Payouts & Settlement" },
      { path: "/farmers/logistics-options", label: "Logistics Options" },
      { path: "/farmers/faq", label: "Farmer FAQ" },
    ],
  },
  {
    heading: "For Drivers",
    links: [
      { path: "/drivers", label: "Driver Overview" },
      { path: "/drivers/register", label: "Driver Registration" },
      { path: "/drivers/assignments", label: "Delivery Assignments" },
      { path: "/drivers/route-tracking", label: "Route Tracking" },
      { path: "/drivers/earnings-payouts", label: "Earnings & Payouts" },
      { path: "/drivers/guidelines", label: "Delivery Guidelines" },
      { path: "/drivers/faq", label: "Driver FAQ" },
    ],
  },
  {
    heading: "For Buyers",
    links: [
      { path: "/buyers/onboarding", label: "Buyer Onboarding" },
      { path: "/buyers/wholesale", label: "Wholesale / Restaurant Supply" },
      { path: "/faq/buyers", label: "Buyer FAQ" },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────
const Header = () => {
  const location = useLocation();
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin, isDriver, isFarmer, isBuyer } = useUserRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const totalItems = getTotalItems();

  const publicNavLinks = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop" },
    { path: "/map", label: "Find Farms" },
  ];

  const navLinks = user && isAdmin
    ? [...publicNavLinks, { path: "/business-centre", label: "Business Centre" }]
    : publicNavLinks;

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
    if (isBuyer) links.push({ path: "/buyer", label: "Buyer Dashboard", icon: ShoppingBag });
    if (isFarmer) links.push({ path: "/farmer", label: "Farmer Dashboard", icon: Tractor });
    if (isDriver) links.push({ path: "/driver", label: "Driver Dashboard", icon: Truck });
    if (isAdmin) {
      links.push({ path: "/admin", label: "Admin Dashboard", icon: Shield });
      links.push({ path: "/business-centre", label: "Business Centre", icon: Crown });
    }
    if (links.length === 0 && user) links.push({ path: "/member", label: "Member Dashboard", icon: Crown });
    return links;
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <div className="container flex h-[68px] items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <img src={terraLogo} alt="Terra Farming" className="h-11 w-11 object-contain transition-transform group-hover:scale-105 rounded-lg" />
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Terra Farming</span>
            <span className="hidden sm:block h-4 w-px bg-border" />
            <span className="hidden sm:block text-[10px] font-semibold tracking-[0.25em] text-muted-foreground uppercase font-display animate-fade-in italic">From Dirt to Dessert</span>
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

      {/* ── Mobile Full-Page Menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[68px] z-40 bg-background">
          <ScrollArea className="h-full">
            <nav className="container py-6 pb-24" aria-label="Site navigation">
              {/* Site nav sections — all links visible, no accordions */}
              {siteNavSections.map((section) => (
                <div key={section.heading} className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                    {section.heading}
                  </p>
                  <div className="space-y-0.5">
                    {section.links.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeMobile}
                        className={cn(
                          "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                          location.pathname === link.path
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="h-px bg-border mt-4" />
                </div>
              ))}

              {/* Account section */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                  Account
                </p>
                {user ? (
                  <div className="space-y-0.5">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-foreground">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {getDashboardLinks().map((dl) => (
                      <Link
                        key={dl.path}
                        to={dl.path}
                        onClick={closeMobile}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                          location.pathname === dl.path
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <dl.icon className="h-4 w-4" />
                        {dl.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In / Register
                  </Link>
                )}
              </div>
            </nav>
          </ScrollArea>
        </div>
      )}
    </header>
  );
};

export default Header;
