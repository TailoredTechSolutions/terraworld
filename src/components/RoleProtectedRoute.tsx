import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type AppRole = 'farmer' | 'business_buyer' | 'member' | 'driver' | 'admin';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallbackPath?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles,
  fallbackPath = "/" 
}: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, isAdmin } = useUserRoles();
  const location = useLocation();

  // Show loading while checking auth and roles
  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has any of the allowed roles (admins always have access)
  const hasAccess = isAdmin || allowedRoles.some(role => roles.includes(role));

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-6 p-8">
          <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. This area is restricted to users with{" "}
            {allowedRoles.map((role, i) => (
              <span key={role}>
                <span className="font-medium text-foreground">{role}</span>
                {i < allowedRoles.length - 1 ? (i === allowedRoles.length - 2 ? " or " : ", ") : ""}
              </span>
            ))}{" "}
            role.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to={fallbackPath}>Go Back</Link>
            </Button>
            <Button asChild>
              <Link to="/member">Member Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
