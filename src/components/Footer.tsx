import { 
  Facebook, Instagram, Twitter, Linkedin, 
  Mail, MapPin, Smartphone, ChevronDown,
  Shield, Truck, Gift, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import terraLogo from "@/assets/terra-logo.png";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Accordion for mobile footer columns
const FooterAccordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border md:border-none">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 md:hidden text-sm font-semibold text-foreground"
        aria-expanded={open}
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <h4 className="hidden md:block font-display font-semibold text-foreground text-sm mb-4">{title}</h4>
      <ul className={cn(
        "space-y-2 pb-3 md:pb-0",
        "md:block",
        open ? "block" : "hidden"
      )}>
        {children}
      </ul>
    </div>
  );
};

const FooterLink = ({ to, children, external }: { to: string; children: React.ReactNode; external?: boolean }) => {
  if (external || to.startsWith("mailto:") || to.startsWith("http")) {
    return (
      <li>
        <a
          href={to}
          target={to.startsWith("http") ? "_blank" : undefined}
          rel={to.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40" role="contentinfo">
      {/* ===== 1) TOP STRIP — Trust + Quick Actions ===== */}
      <div className="border-b border-border">
        <div className="container py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Farm-to-business marketplace</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Transparent pricing + tracked deliveries</span>
            <span className="inline-flex items-center gap-1.5"><Gift className="h-3.5 w-3.5 text-primary" /> Rewards for participation (utility token)</span>
          </div>
          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/#download" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <Smartphone className="h-3 w-3" /> Download App
            </Link>
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
              Become a Farmer <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
              Become a Buyer <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 2) MAIN FOOTER GRID ===== */}
      <div className="container py-12 md:py-12 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 md:gap-y-8">
          {/* Column A — Terra */}
          <FooterAccordion title="Terra">
            <FooterLink to="/about">About Terra</FooterLink>
            <FooterLink to="/#how-it-works">How Terra Works</FooterLink>
            <FooterLink to="/impact">Mission / Impact</FooterLink>
            <FooterLink to="/pilot/baguio">Pilot Program (Baguio)</FooterLink>
            <FooterLink to="/careers">Careers</FooterLink>
          </FooterAccordion>

          {/* Column B — Marketplace */}
          <FooterAccordion title="Marketplace">
            <FooterLink to="/shop">Browse Products</FooterLink>
            <FooterLink to="/shop#categories">Categories</FooterLink>
            <FooterLink to="/shop#pricing-breakdown">Pricing Breakdown</FooterLink>
            <FooterLink to="/orders/track">Order Tracking</FooterLink>
            <FooterLink to="/policies/quality">Quality Policy</FooterLink>
          </FooterAccordion>

          {/* Column C — For Farmers */}
          <FooterAccordion title="For Farmers">
            <FooterLink to="/farmers/onboarding">Farmer Onboarding</FooterLink>
            <FooterLink to="/farmers/upload">Upload Products</FooterLink>
            <FooterLink to="/farmers/payouts">Payouts & Settlement</FooterLink>
            <FooterLink to="/farmers/logistics">Logistics Options</FooterLink>
            <FooterLink to="/faq/farmers">Farmer FAQ</FooterLink>
          </FooterAccordion>

          {/* Column D — For Buyers */}
          <FooterAccordion title="For Buyers">
            <FooterLink to="/buyers/onboarding">Buyer Onboarding</FooterLink>
            <FooterLink to="/buyers/wholesale">Wholesale / Restaurant Supply</FooterLink>
            <FooterLink to="/account/transactions">Receipts & History</FooterLink>
            <FooterLink to="/support/disputes">Support / Disputes</FooterLink>
            <FooterLink to="/faq/buyers">Buyer FAQ</FooterLink>
          </FooterAccordion>


          {/* Column F — Resources */}
          <FooterAccordion title="Resources">
            <FooterLink to="/blog">Blog / Updates</FooterLink>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/status">System Status</FooterLink>
            <FooterLink to="/support">Contact Support</FooterLink>
          </FooterAccordion>
        </div>
      </div>

      {/* ===== 3) CONTACT + SOCIAL BAR ===== */}
      <div className="border-t border-border">
        <div className="container py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Contact info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="mailto:support@terrafarming.io" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" /> support@terrafarming.io
            </a>
            <Link to="/contact" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <MapPin className="h-4 w-4" /> Baguio City, Philippines
            </Link>
          </div>
          {/* Social icons */}
          <nav className="flex items-center gap-2" aria-label="Social media links">
            {[
              { icon: Facebook, href: "https://facebook.com/terrafarming", label: "Facebook" },
              { icon: Instagram, href: "https://instagram.com/terrafarming", label: "Instagram" },
              { icon: Twitter, href: "https://x.com/terrafarming", label: "X (Twitter)" },
              { icon: Linkedin, href: "https://linkedin.com/company/terrafarming", label: "LinkedIn" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ===== 4) LEGAL + COMPLIANCE BAR ===== */}
      <div className="border-t border-border">
        <div className="container py-4">
          {/* Legal links */}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3" aria-label="Legal links">
            {[
              { label: "Terms of Service", to: "/legal/terms" },
              { label: "Privacy Policy", to: "/legal/privacy" },
              { label: "Cookie Policy", to: "/legal/cookies" },
              { label: "Refund & Dispute Policy", to: "/legal/refunds" },
              { label: "Risk Disclosure", to: "/legal/risk-disclosure" },
              { label: "AML/KYC Policy", to: "/legal/aml-kyc" },
            ].map(({ label, to }) => (
              <Link key={to} to={to} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          {/* Micro-disclaimers */}
          <div className="space-y-1 text-[10px] leading-relaxed text-muted-foreground/70">
            <p>Tokens are utility/reward units for use within the Terra ecosystem and do not represent equity or ownership.</p>
            <p>Rewards, discounts, and program features may change based on governance, policy, and applicable regulations.</p>
            <p>Earnings depend on verified activity and plan rules; not all participants earn income.</p>
          </div>
        </div>
      </div>

      {/* ===== 5) BOTTOM BAR ===== */}
      <div className="border-t border-border">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left — Copyright + logo */}
          <div className="flex items-center gap-2">
            <img src={terraLogo} alt="Terra Farming" className="h-6 w-6 rounded" />
            <p className="text-xs text-muted-foreground">© {currentYear} Terra Farming. All rights reserved.</p>
          </div>
          {/* Right — Business Centre link */}
          <Link
            to="/business-centre/auth"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-foreground transition-colors"
          >
            Business Centre <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
