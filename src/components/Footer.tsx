import React from "react";
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

const FooterLink = React.forwardRef<HTMLLIElement, { to: string; children: React.ReactNode; external?: boolean }>(
  ({ to, children, external }, ref) => {
    if (external || to.startsWith("mailto:") || to.startsWith("http")) {
      return (
        <li ref={ref}>
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
      <li ref={ref}>
        <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {children}
        </Link>
      </li>
    );
  }
);
FooterLink.displayName = "FooterLink";

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
      <div className="container py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 md:gap-y-8">
          {/* Column A — Terra */}
          <FooterAccordion title="Terra">
            <FooterLink to="/about">About Terra</FooterLink>
            <FooterLink to="/how-it-works">How Terra Works</FooterLink>
            <FooterLink to="/mission-impact">Mission / Impact</FooterLink>
            <FooterLink to="/pilot-program-baguio">Pilot Program (Baguio)</FooterLink>
            <FooterLink to="/careers">Careers</FooterLink>
          </FooterAccordion>

          {/* Column B — Marketplace */}
          <FooterAccordion title="Marketplace">
            <FooterLink to="/shop">Browse Products</FooterLink>
            <FooterLink to="/marketplace/categories">Categories</FooterLink>
            <FooterLink to="/marketplace/pricing-breakdown">Pricing Breakdown</FooterLink>
            <FooterLink to="/marketplace/order-tracking">Order Tracking</FooterLink>
            <FooterLink to="/marketplace/quality-policy">Quality Policy</FooterLink>
          </FooterAccordion>

          {/* Column C — For Farmers */}
          <FooterAccordion title="For Farmers">
            <FooterLink to="/farmers/onboarding">Farmer Onboarding</FooterLink>
            <FooterLink to="/farmers/upload-products">Upload Products</FooterLink>
            <FooterLink to="/farmers/payouts-settlement">Payouts & Settlement</FooterLink>
            <FooterLink to="/farmers/logistics-options">Logistics Options</FooterLink>
            <FooterLink to="/farmers/faq">Farmer FAQ</FooterLink>
          </FooterAccordion>

          {/* Column D — For Drivers */}
          <FooterAccordion title="For Drivers">
            <FooterLink to="/drivers">Driver Overview</FooterLink>
            <FooterLink to="/drivers/register">Driver Registration</FooterLink>
            <FooterLink to="/drivers/assignments">Delivery Assignments</FooterLink>
            <FooterLink to="/drivers/earnings-payouts">Earnings & Payouts</FooterLink>
            <FooterLink to="/drivers/guidelines">Delivery Guidelines</FooterLink>
            <FooterLink to="/drivers/faq">Driver FAQ</FooterLink>
          </FooterAccordion>

          {/* Column E — Resources */}
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
            <a href="mailto:andrew@tailoredtechsolutions.com" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" /> andrew@tailoredtechsolutions.com
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> NCR — National Capital Region
            </span>
          </div>
          {/* Social icons */}
          <nav className="flex items-center gap-2" aria-label="Social media links">
            <a href="https://facebook.com/terrafarming" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80" style={{ backgroundColor: '#1877F2' }}>
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://instagram.com/terrafarming" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://x.com/terrafarming" target="_blank" rel="noopener noreferrer" aria-label="X"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80" style={{ backgroundColor: '#000000' }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com/company/terrafarming" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80" style={{ backgroundColor: '#0A66C2' }}>
              <Linkedin className="h-4 w-4" />
            </a>
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
