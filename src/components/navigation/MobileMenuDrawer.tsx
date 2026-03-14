import { Link } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigation } from "@/config/navigation";
import NavSection from "./NavSection";
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
          {/* All site sections — flat, no accordions */}
          {navigation.map((section) => (
            <NavSection key={section.section} section={section} onNavigate={onClose} />
          ))}

          {/* Account section */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
              Account
            </p>
            {user ? (
              <div className="space-y-0.5">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                {dashboardLinks.map((dl) => (
                  <NavLinkItem
                    key={dl.path}
                    href={dl.path}
                    label={dl.label}
                    onClick={onClose}
                  />
                ))}
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={onClose}
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
  );
};

export default MobileMenuDrawer;
