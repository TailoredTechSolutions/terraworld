import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { topNavLinks } from "@/config/navigation";

interface DesktopNavProps {
  extraLinks?: {path: string;label: string;}[];
}

const DesktopNav = ({ extraLinks = [] }: DesktopNavProps) => {
  const { pathname } = useLocation();
  const allLinks = [...topNavLinks.map((l) => ({ path: l.href, label: l.label })), ...extraLinks];

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
      {allLinks.map((link) =>
      <Link
        key={link.path}
        to={link.path}
        aria-current={pathname === link.path ? "page" : undefined}
        className={cn("nav-link-animated text-xs font-extrabold", pathname === link.path && "active")}>
        
          {link.label}
        </Link>
      )}
    </nav>);

};

export default DesktopNav;