// ── Terra Platform Navigation Config ──────────────────────────
// Single source of truth for all navigation across desktop, mobile, and footer.

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavSection {
  section: string;
  links: NavLink[];
}

export const navigation: NavSection[] = [
  {
    section: "Terra",
    links: [
      { label: "Home", href: "/" },
      { label: "About Terra", href: "/about", description: "Our mission and values" },
      { label: "How Terra Works", href: "/how-it-works", description: "Farm-to-buyer process" },
      { label: "Mission / Impact", href: "/mission-impact", description: "Empowering farmers" },
      { label: "Pilot Program (Baguio)", href: "/pilot-program-baguio", description: "Our first pilot region" },
      { label: "Careers", href: "/careers", description: "Join our team" },
    ],
  },
  {
    section: "Marketplace",
    links: [
      { label: "Browse Products", href: "/shop", description: "Fresh farm produce" },
      { label: "Categories", href: "/marketplace/categories", description: "Browse by type" },
      { label: "Pricing Breakdown", href: "/marketplace/pricing-breakdown", description: "Transparent pricing" },
      { label: "Order Tracking", href: "/marketplace/order-tracking", description: "Track your delivery" },
      { label: "Quality Policy", href: "/marketplace/quality-policy", description: "Freshness guarantee" },
    ],
  },
  {
    section: "For Farmers",
    links: [
      { label: "Farmer Onboarding", href: "/farmers/onboarding", description: "Start selling on Terra" },
      { label: "Upload Products", href: "/farmers/upload-products", description: "List your produce" },
      { label: "Payouts & Settlement", href: "/farmers/payouts-settlement", description: "Earnings and payouts" },
      { label: "Logistics Options", href: "/farmers/logistics-options", description: "Delivery coordination" },
      { label: "Farmer FAQ", href: "/farmers/faq", description: "Common questions" },
    ],
  },
  {
    section: "For Drivers",
    links: [
      { label: "Driver Overview", href: "/drivers", description: "Join our driver network" },
      { label: "Driver Registration", href: "/drivers/register", description: "Sign up requirements" },
      { label: "Delivery Assignments", href: "/drivers/assignments", description: "How jobs work" },
      { label: "Route Tracking", href: "/drivers/route-tracking", description: "GPS and navigation" },
      { label: "Earnings & Payouts", href: "/drivers/earnings-payouts", description: "Payment schedule" },
      { label: "Delivery Guidelines", href: "/drivers/guidelines", description: "SOPs and conduct" },
      { label: "Driver FAQ", href: "/drivers/faq", description: "Common questions" },
    ],
  },
  {
    section: "For Buyers",
    links: [
      { label: "Buyer Onboarding", href: "/buyers/onboarding", description: "Start buying fresh" },
      { label: "Wholesale / Restaurant Supply", href: "/buyers/wholesale", description: "Bulk orders" },
      { label: "Buyer FAQ", href: "/faq/buyers", description: "Common questions" },
    ],
  },
];

// Account links are separated since they depend on auth state
export const accountLinks: NavLink[] = [
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
  { label: "Login", href: "/auth" },
  { label: "Register", href: "/auth?tab=register" },
];

// Desktop top-bar quick links
export const topNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Find Farms", href: "/map" },
];
