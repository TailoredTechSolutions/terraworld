import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useActivePath } from "@/hooks/useActivePath";

interface NavLinkItemProps {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

const NavLinkItem = ({ href, label, onClick, className }: NavLinkItemProps) => {
  const { isExact } = useActivePath();
  const active = isExact(href);

  return (
    <Link
      to={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted",
        className
      )}
    >
      {label}
    </Link>
  );
};

export default NavLinkItem;
