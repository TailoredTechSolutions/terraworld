import StandardPageShell from "@/templates/StandardPageShell";

// ── Terra / Company ──────────────────────────────────────────
export const AboutPage = () => (
  <StandardPageShell
    category="Company"
    title="About Terra"
    description="Learn about our mission to connect Filipino farmers directly with buyers through a transparent, technology-driven marketplace."
    contentBlocks={[
      { heading: "Our Mission", body: "Terra Farming bridges the gap between highland farmers and urban buyers, ensuring fair pricing and fresh produce at every step." },
      { heading: "Transparency First", body: "Every transaction on Terra shows a full pricing breakdown — base price, platform fees, taxes, and transport — so you know exactly where your money goes." },
      { heading: "Built for the Philippines", body: "Designed from the ground up for Filipino agriculture, starting with Baguio highland farms and expanding across Luzon." },
    ]}
    cta={{ label: "Browse Products", href: "/shop" }}
  />
);

export const HowItWorksPage = () => (
  <StandardPageShell
    category="Company"
    title="How Terra Works"
    description="Discover the farm-to-buyer process — from product uploads and transparent pricing to real-time delivery tracking."
    contentBlocks={[
      { heading: "1. Farmers List Products", body: "Farmers upload their produce with real photos, set prices, and manage stock directly from their dashboard." },
      { heading: "2. Buyers Browse & Order", body: "Buyers search by category, compare offerings from multiple farms, and check out with transparent pricing." },
      { heading: "3. Delivery & Fulfillment", body: "Orders are assigned to Terra drivers or partner logistics. Track your delivery in real-time from farm to door." },
      { heading: "4. Settlement & Payouts", body: "Farmers receive payouts after delivery confirmation. All fees and deductions are shown transparently." },
    ]}
    cta={{ label: "Start Shopping", href: "/shop" }}
  />
);

export const ImpactPage = () => (
  <StandardPageShell
    category="Company"
    title="Mission & Impact"
    description="Discover how Terra Farming is transforming agricultural commerce in the Philippines — empowering farmers, reducing waste, and building sustainable supply chains."
    contentBlocks={[
      { heading: "Fair Farmer Access", body: "We eliminate middlemen so farmers receive fair prices for their harvest and connect directly with end buyers." },
      { heading: "Transparent Commerce", body: "Every transaction is visible — from farm gate price to final delivery cost — building trust across the supply chain." },
      { heading: "Rural Economic Uplift", body: "By digitizing farm-to-market operations, we help rural communities access broader markets and grow sustainably." },
      { heading: "Sustainability", body: "Shorter supply chains mean less food waste, lower carbon footprint, and fresher produce for buyers." },
    ]}
  />
);

export const CareersPage = () => (
  <StandardPageShell
    category="Company"
    title="Careers at Terra"
    description="Join our growing team and help build the future of farm-to-table commerce in the Philippines. Open positions will be listed here soon."
    contentBlocks={[
      { heading: "Mission-Driven Work", body: "Work on technology that directly improves livelihoods for Filipino farmers and food access for buyers." },
      { heading: "Growing Team", body: "We're building a small but mighty team across engineering, operations, and community growth." },
      { heading: "Get in Touch", body: "Interested? Send us your resume at careers@terrafarming.io and tell us how you'd contribute." },
    ]}
  />
);

export const PilotBaguioPage = () => (
  <StandardPageShell
    category="Pilot Program"
    title="Baguio Pilot Program"
    description="Terra's pilot program in Baguio City connects highland farmers with buyers across Luzon. Learn about our progress and expansion plans."
    contentBlocks={[
      { heading: "Why Baguio", body: "Baguio and the Cordillera highlands produce some of the Philippines' finest vegetables, strawberries, and specialty crops." },
      { heading: "Onboarding Farmers", body: "We're actively onboarding highland farmers, helping them digitize their inventory and reach new markets." },
      { heading: "Logistics Network", body: "Building a reliable cold-chain and driver network to ensure produce arrives fresh across Luzon." },
      { heading: "Expansion Plans", body: "After validating the Baguio corridor, Terra will expand to additional agricultural regions across the Philippines." },
    ]}
    cta={{ label: "Become a Partner Farmer", href: "/farmers/onboarding" }}
  />
);

// ── Marketplace ──────────────────────────────────────────────
export const PricingPage = () => (
  <StandardPageShell
    category="Marketplace"
    title="Pricing Breakdown"
    description="Understand how Terra's transparent pricing works — base price, platform fees, taxes, and transportation costs all displayed at checkout."
  >
    <div className="max-w-md rounded-xl border border-border bg-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Price Formula</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Base Price (Farmer)</span><span className="text-foreground font-medium">₱ XX.XX</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">+ Platform Fee</span><span className="text-foreground font-medium">₱ X.XX</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">+ Tax / VAT</span><span className="text-foreground font-medium">₱ X.XX</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">+ Transportation Fee</span><span className="text-foreground font-medium">₱ X.XX</span></div>
        <div className="h-px bg-border" />
        <div className="flex justify-between font-semibold"><span className="text-foreground">= Total Amount</span><span className="text-primary">₱ XX.XX</span></div>
      </div>
    </div>
  </StandardPageShell>
);

export const CategoriesPage = () => (
  <StandardPageShell
    category="Marketplace"
    title="Product Categories"
    description="Browse our marketplace by category — vegetables, fruits, grains, dairy, meat, specialty items, and more from verified highland farms."
    contentBlocks={[
      { heading: "Vegetables", body: "Highland-grown lettuce, cabbage, carrots, potatoes, beans, and more — harvested fresh from Baguio farms." },
      { heading: "Fruits", body: "Strawberries, avocados, dragon fruit, calamansi, and seasonal tropical fruits direct from the farm." },
      { heading: "Grains & Staples", body: "Brown rice, muscovado sugar, and specialty grains from sustainable Philippine farms." },
      { heading: "Dairy & Eggs", body: "Fresh eggs, carabao milk, kesong puti, and artisanal dairy from local producers." },
      { heading: "Meat & Poultry", body: "Native chicken, pork, and beef from verified farms with quality-assured handling." },
      { heading: "Specialty & Processed", body: "Wild honey, tablea, ube jam, peanut butter, dried herbs, and artisanal food products." },
    ]}
    cta={{ label: "Browse All Products", href: "/shop" }}
  />
);

export const OrderTrackPage = () => (
  <StandardPageShell
    category="Marketplace"
    title="Order Tracking"
    description="Track your orders in real-time from farm to your doorstep. Sign in to view your active deliveries and order history."
    contentBlocks={[
      { heading: "Real-Time Updates", body: "Get live status updates as your order moves from confirmed → preparing → in transit → delivered." },
      { heading: "Driver Tracking", body: "See your driver's location on the map and estimated arrival time for active deliveries." },
      { heading: "Order History", body: "Access your full purchase history with receipts and delivery details from your dashboard." },
    ]}
    cta={{ label: "Sign In to Track", href: "/auth" }}
  />
);

export const QualityPolicyPage = () => (
  <StandardPageShell
    category="Policies"
    title="Quality Policy"
    description="Our commitment to quality: replacement and refund policies for produce that doesn't meet our freshness standards. Your satisfaction is guaranteed."
    contentBlocks={[
      { heading: "Freshness Guarantee", body: "If produce arrives damaged or below quality standards, report within 24 hours for a full replacement or refund." },
      { heading: "Photo Verification", body: "All product listings require real photos. What you see on Terra is what arrives at your door." },
      { heading: "Dispute Resolution", body: "Our support team reviews disputes fairly, protecting both buyer and farmer interests." },
    ]}
  />
);

// ── For Farmers ──────────────────────────────────────────────
export const FarmerOnboardingPage = () => (
  <StandardPageShell
    category="For Farmers"
    title="Farmer Onboarding"
    description="Ready to sell on Terra? Learn how to register your farm, upload products with photos and pricing, and start reaching buyers directly."
    contentBlocks={[
      { heading: "Step 1: Register", body: "Create your Terra account and select 'Farmer' as your role. Provide basic farm information and location." },
      { heading: "Step 2: Verify", body: "Complete KYC verification with a valid ID and proof of farm ownership or operation." },
      { heading: "Step 3: List Products", body: "Upload your produce with real photos, set prices per unit, and manage your available stock." },
      { heading: "Step 4: Start Selling", body: "Once approved, your products go live on the marketplace. Receive orders and get paid after delivery." },
    ]}
    cta={{ label: "Register as Farmer", href: "/auth?role=farmer" }}
  />
);

export const FarmerUploadPage = () => (
  <StandardPageShell
    category="For Farmers"
    title="Upload Products"
    description="Upload your produce with real product photos, set your prices, and manage inventory. Sign in to your farmer dashboard to get started."
    contentBlocks={[
      { heading: "Multiple Photos", body: "Upload up to 5 photos per product showing quality, size, and packaging." },
      { heading: "Set Your Price", body: "You set the base price. Terra adds transparent platform fees and transport costs separately." },
      { heading: "Stock Management", body: "Update available quantities in real-time. Pause or unpause listings as needed." },
    ]}
    cta={{ label: "Go to Farmer Dashboard", href: "/farmer" }}
  />
);

export const FarmerPayoutsPage = () => (
  <StandardPageShell
    category="For Farmers"
    title="Payouts & Settlement"
    description="Learn about Terra's payout schedule, settlement process, and how earnings are transferred to your preferred payment method."
    contentBlocks={[
      { heading: "Settlement Timing", body: "Payouts are processed after delivery confirmation. Typical settlement within 3-5 business days." },
      { heading: "Payment Methods", body: "Receive payouts via GCash, bank transfer, or other supported payment channels." },
      { heading: "Transparent Fees", body: "Platform commission and any applicable fees are clearly shown before you list each product." },
    ]}
  />
);

export const FarmerLogisticsPage = () => (
  <StandardPageShell
    category="For Farmers"
    title="Logistics Options"
    description="Explore delivery and logistics options available to farmers — from our partner drivers to third-party services like Lalamove and Grab."
    contentBlocks={[
      { heading: "Terra Drivers", body: "Our in-house driver network handles pickup from your farm and delivery to buyers." },
      { heading: "Partner Services", body: "Integration with Lalamove and Grab for additional delivery coverage and flexibility." },
      { heading: "Scheduling", body: "Set pickup windows and cutoff times so drivers arrive when your harvest is ready." },
    ]}
  />
);

export const FarmerFAQPage = () => (
  <StandardPageShell
    category="For Farmers"
    title="Farmer FAQ"
    description="Frequently asked questions about selling on Terra, managing your farm profile, pricing, payouts, and delivery logistics."
    contentBlocks={[
      { heading: "How do I get started?", body: "Register on Terra, complete verification, and upload your first products. Our team will guide you through the process." },
      { heading: "When do I get paid?", body: "Payouts are processed after successful delivery confirmation, typically within 3-5 business days." },
      { heading: "What are the fees?", body: "Terra charges a transparent platform commission shown before you list. There are no hidden fees." },
      { heading: "Can I pause my listings?", body: "Yes — pause or unpause individual products anytime from your farmer dashboard." },
    ]}
  />
);

// ── For Buyers ───────────────────────────────────────────────
export const BuyerOnboardingPage = () => (
  <StandardPageShell
    category="For Buyers"
    title="Buyer Onboarding"
    description="Start buying fresh produce directly from local farmers. Learn how to create an account, browse products, and place your first order."
    cta={{ label: "Create Account", href: "/auth" }}
  />
);

export const BuyerWholesalePage = () => (
  <StandardPageShell
    category="For Buyers"
    title="Wholesale & Restaurant Supply"
    description="Need large volumes? Terra connects restaurants, hotels, and food businesses with reliable farm-fresh supply at competitive wholesale pricing."
    cta={{ label: "Contact Us", href: "/contact" }}
  />
);

export const AccountTransactionsPage = () => (
  <StandardPageShell category="For Buyers" title="Receipts & Transaction History" description="View your complete purchase history, download receipts, and track spending. Sign in to access your transaction records." />
);

export const SupportDisputesPage = () => (
  <StandardPageShell category="Support" title="Support & Disputes" description="Need help with an order? Submit a dispute or request assistance. Our team is here to ensure a fair resolution for both farmers and buyers." />
);

export const BuyerFAQPage = () => (
  <StandardPageShell category="For Buyers" title="Buyer FAQ" description="Frequently asked questions about ordering on Terra, delivery options, payment methods, and return policies." />
);

// ── For Drivers ──────────────────────────────────────────────
export const DriverOverviewPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Driver Overview"
    description="Join the Terra driver network. Deliver fresh farm produce from highland farms to buyers across Luzon with flexible schedules and competitive pay."
    contentBlocks={[
      { heading: "Flexible Schedule", body: "Choose your own hours. Accept delivery assignments that fit your availability and location." },
      { heading: "Competitive Pay", body: "Earn per-delivery rates with distance-based bonuses and performance incentives." },
      { heading: "Support & Tools", body: "GPS routing, real-time order details, and dedicated driver support from the Terra team." },
    ]}
    cta={{ label: "Register as Driver", href: "/drivers/register" }}
  />
);

export const DriverRegisterPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Driver Registration"
    description="Sign up as a Terra delivery partner. Requirements: valid license, registered vehicle (motorcycle, van, or truck), and smartphone with GPS."
    contentBlocks={[
      { heading: "Requirements", body: "Valid driver's license, vehicle registration (motorcycle, van, or truck), smartphone with GPS capability." },
      { heading: "Verification", body: "Submit your documents for verification. Approval typically takes 1-3 business days." },
      { heading: "Get Started", body: "Once approved, download the driver app, set your availability, and start accepting deliveries." },
    ]}
    cta={{ label: "Apply Now", href: "/auth?role=driver" }}
  />
);

export const DriverAssignmentsPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Delivery Assignments"
    description="How delivery assignments work — automatic matching based on proximity, vehicle type, and availability. Accept jobs from your driver dashboard."
    contentBlocks={[
      { heading: "Smart Matching", body: "Orders are matched to nearby drivers based on location, vehicle type, and current availability." },
      { heading: "Accept or Pass", body: "Review delivery details including pickup, dropoff, and estimated earnings before accepting." },
      { heading: "Real-Time Updates", body: "Get instant notifications for new assignments and communicate with buyers through the platform." },
    ]}
  />
);

export const DriverRouteTrackingPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Route Tracking"
    description="Real-time GPS tracking for active deliveries. Navigate pickup and delivery points with optimized routing for efficient farm-to-door logistics."
    contentBlocks={[
      { heading: "GPS Navigation", body: "Integrated maps with turn-by-turn directions from farm pickup to buyer delivery address." },
      { heading: "Live Tracking", body: "Buyers and the platform can track your location in real-time during active deliveries." },
      { heading: "Route Optimization", body: "Multi-stop routes are optimized for the shortest path when handling batch deliveries." },
    ]}
  />
);

export const DriverEarningsPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Earnings & Payouts"
    description="Track your delivery earnings, view payout history, and manage withdrawal methods. Competitive per-delivery rates with distance-based bonuses."
    contentBlocks={[
      { heading: "Per-Delivery Rates", body: "Earn a base fee per delivery plus distance-based compensation. Rates vary by vehicle type and zone." },
      { heading: "Payout Schedule", body: "Weekly payouts via GCash or bank transfer. View your complete earnings history anytime." },
      { heading: "Bonuses", body: "Earn performance bonuses for delivery volume, customer ratings, and peak-hour availability." },
    ]}
  />
);

export const DriverGuidelinesPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Delivery Guidelines"
    description="Standard operating procedures for Terra drivers — produce handling, proof of delivery, customer interaction guidelines, and safety protocols."
    contentBlocks={[
      { heading: "Produce Handling", body: "Handle fresh produce with care. Use insulated bags for temperature-sensitive items. Avoid stacking heavy items on fragile goods." },
      { heading: "Proof of Delivery", body: "Take a photo at delivery for confirmation. Get buyer acknowledgment through the app for every successful delivery." },
      { heading: "Customer Interaction", body: "Be professional and courteous. Communicate delays promptly. Follow contactless delivery protocols when requested." },
      { heading: "Safety First", body: "Follow traffic laws, wear safety gear, and maintain your vehicle. Report any incidents to the support team immediately." },
    ]}
  />
);

export const DriverFAQPage = () => (
  <StandardPageShell
    category="For Drivers"
    title="Driver FAQ"
    description="Frequently asked questions about driving for Terra — vehicle requirements, payment schedule, insurance, and support contacts."
    contentBlocks={[
      { heading: "What vehicles are accepted?", body: "Motorcycles, vans, and trucks with valid registration. Vehicle must be in good working condition." },
      { heading: "How often are payouts?", body: "Weekly payouts processed every Monday for the previous week's completed deliveries." },
      { heading: "Is insurance provided?", body: "Terra provides supplemental delivery insurance. Drivers must maintain their own vehicle insurance." },
      { heading: "How do I get support?", body: "Contact the driver support team through your dashboard or call our dedicated driver hotline." },
    ]}
  />
);

// ── Rewards & Network ────────────────────────────────────────
export const RewardsPage = () => (
  <StandardPageShell category="Rewards" title="Rewards Overview" description="Earn Terra tokens for your participation in our marketplace ecosystem. Learn how token rewards work and how to redeem them." />
);

export const CompensationPage = () => (
  <StandardPageShell category="Rewards" title="Compensation Rules" description="Understand our referral and earnings structure — commission rates, matching bonuses, rank requirements, and payout schedules." />
);

// ── Resources ────────────────────────────────────────────────
export const BlogPage = () => (
  <StandardPageShell category="Resources" title="Blog & Updates" description="Stay up to date with Terra news, farming tips, marketplace updates, and stories from our farmer and buyer community." />
);

export const HelpPage = () => (
  <StandardPageShell category="Resources" title="Help Center" description="Find answers to common questions, guides for using the platform, and troubleshooting tips for farmers and buyers." />
);

export const StatusPage = () => (
  <StandardPageShell category="Resources" title="System Status" description="Check the current operational status of Terra's platform, API services, and payment systems. All systems operational." />
);

export const SupportPage = () => (
  <StandardPageShell category="Resources" title="Contact Support" description="Get in touch with our support team. Email us at support@terrafarming.io or submit a ticket through your dashboard." />
);

export const ContactPage = () => (
  <StandardPageShell category="Resources" title="Contact Us" description="Reach out to Terra Farming — whether you're a farmer, buyer, or partner. We're based in Baguio City, Philippines." />
);

// ── Legal ────────────────────────────────────────────────────
export const TermsPage = () => (
  <StandardPageShell category="Legal" title="Terms of Service" description="Read our Terms of Service governing the use of the Terra Farming platform, marketplace transactions, and user responsibilities." />
);

export const PrivacyPage = () => (
  <StandardPageShell category="Legal" title="Privacy Policy" description="Learn how Terra Farming collects, uses, and protects your personal information in compliance with Philippine data privacy laws." />
);

export const CookiePolicyPage = () => (
  <StandardPageShell category="Legal" title="Cookie Policy" description="Information about how Terra uses cookies and similar technologies to improve your experience on our platform." />
);

export const RefundPolicyPage = () => (
  <StandardPageShell category="Legal" title="Refund & Dispute Policy" description="Our policies on refunds, returns, and dispute resolution for marketplace transactions between farmers and buyers." />
);

export const RiskDisclosurePage = () => (
  <StandardPageShell category="Legal" title="Risk Disclosure" description="Important disclosures about Terra's token rewards program, including the nature of utility tokens and potential risks." />
);

export const AMLKYCPolicyPage = () => (
  <StandardPageShell category="Legal" title="AML/KYC Policy" description="Terra's Anti-Money Laundering and Know Your Customer policies to ensure platform integrity and regulatory compliance." />
);
