import type { NavSection as NavSectionType } from "@/config/navigation";
import NavLinkItem from "./NavLinkItem";

interface NavSectionProps {
  section: NavSectionType;
  onNavigate?: () => void;
}

const NavSection = ({ section, onNavigate }: NavSectionProps) => (
  <div className="mb-6">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
      {section.section}
    </p>
    <div className="space-y-0.5">
      {section.links.map((link) => (
        <NavLinkItem
          key={link.href}
          href={link.href}
          label={link.label}
          onClick={onNavigate}
        />
      ))}
    </div>
    <div className="h-px bg-border mt-4" />
  </div>
);

export default NavSection;
