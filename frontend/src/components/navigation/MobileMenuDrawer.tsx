import { Link } from "react-router-dom";
import { LogIn, LogOut, User, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavLinkItem from "./NavLinkItem";

interface DashboardLink {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MobileMenuDrawerProps {
  user: unknown;
  profile: { full_name?: string | null; email?: string } | null;
  userEmail?: string;
  dashboardLinks: DashboardLink[];
  onClose: () => void;
  onSignOut: () => void;
}

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Browse Products" },
  { href: "/map", label: "Find Farms" },
];

const MobileMenuDrawer = ({
  user,
  profile,
  userEmail,
  dashboardLinks,
  onClose,
  onSignOut,
}: MobileMenuDrawerProps) => {
  return (
    <div className="md:hidden fixed inset-0 top-[68px] z-[60] bg-background">
      <ScrollArea className="h-full">
        <nav className="container py-6 pb-24" aria-label="Site navigation">

          {/* ── Account Section (top priority) ── */}
          <div className="mb-6">
            {user ? (
              <div className="space-y-1">
                {/* User info card */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted/50 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {profile?.full_name
                      ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                      : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </div>

                {/* Profile link */}
                <NavLinkItem href="/buyer" label="My Profile" onClick={onClose} />

                {/* Role-specific dashboard links */}
                {dashboardLinks.map((dl) => (
                  <Link
                    key={dl.path}
                    to={dl.path}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    <dl.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{dl.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}

                {/* Sign out */}
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/auth"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  to="/auth?tab=register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="h-px bg-border mb-6" />

          {/* ── Quick Links ── */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              Navigate
            </p>
            <div className="space-y-0.5">
              {quickLinks.map((link) => (
                <NavLinkItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-border mb-6" />

          {/* ── Business Centre (separate, bottom) ── */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              Affiliate Program
            </p>
            <NavLinkItem
              href="/business-centre/auth"
              label="Business Centre"
              onClick={onClose}
            />
            <p className="text-xs text-muted-foreground px-3 mt-1">
              Separate login required for affiliates
            </p>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default MobileMenuDrawer;
