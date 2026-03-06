# Terra Digital Platform — Complete Breakdown

This is the full architectural and UI wireframe breakdown of every area of the Terra Digital Platform, organized by role/surface for use as a reference document.

---

## 1. GLOBAL SHARED COMPONENTS

### Header (`src/components/Header.tsx`)
- Sticky top bar with Terra logo
- Desktop nav links: Home, Shop, Map
- Theme toggle (light/dark)
- Cart icon with badge (item count)
- Auth-aware: shows avatar dropdown when logged in (initials, dashboard links by role, sign out) or "Sign In" button
- Role-gated links: Business Centre only visible to admin/affiliate
- Mobile: hamburger menu with full nav + auth sections

### Footer (`src/components/Footer.tsx`)
- 5-section wireframe:
  1. **Trust strip**: trust signals + "Become a Farmer/Buyer" CTAs
  2. **5-column grid**: Terra, Marketplace, For Farmers, For Buyers, Resources — each column has clickable links
  3. **Contact & Social bar**: mailto links, Facebook/Instagram/Twitter/LinkedIn icons
  4. **Legal bar**: Terms, Privacy, Cookies, Refund Policy, Risk Disclosure, AML/KYC Policy + utility token micro-disclaimer
  5. **Bottom bar**: Copyright + Business Centre access link (bottom-right)
- Mobile: columns collapse into accordion

### Cart Drawer (`src/components/CartDrawer.tsx`)
- Slide-out right drawer showing cart items, quantities, subtotals
- Checkout button linking to `/checkout`

### Auth Page (`src/pages/AuthPage.tsx` — route: `/auth`)
- Tabs: Login / Register
- Login: email + password, "Forgot Password" link, password visibility toggle
- Register: role dropdown (Buyer or Farmer), full name, email, password, optional referral code
- Zod validation on all fields
- Redirects to role-appropriate dashboard on success

### Reset Password (`src/pages/ResetPasswordPage.tsx` — route: `/reset-password`)

### KYC Page (`src/pages/KYCPage.tsx` — route: `/kyc`)
- KYC verification form, document upload, document list, status badge

---

## 2. PUBLIC PAGES (No auth required)

### Landing / Home (`src/pages/Index.tsx` — route: `/`)
- Hero section with video background, CTA buttons
- Features grid (6 cards): Farm-Fresh Marketplace, Logistics, Community, Wallet, Map, Trust
- Featured farms carousel (FarmCard components)
- Testimonials section (farmer + customer testimonials with photos)
- Stats section
- CTA banner

### Shop (`src/pages/ShopPage.tsx` — route: `/shop`)
- Search bar + category filter sidebar/sheet
- Filters: organic only, multi-farm only, price range slider
- Sort: name A-Z/Z-A, price low-high/high-low, most farms
- Grid toggle (small/large)
- AggregatedProductCard: shows product image, name, "From ₱X", farm count badge, organic badge
- Server-side data from `farm_products` + `farmers_public` view

### Product Detail (`src/pages/ProductDetail.tsx` — route: `/product/:id`)
- Product images, description, pricing
- Add to cart functionality

### Product Offers (`src/pages/ProductOffersPage.tsx` — route: `/product/:id/offers`)
- Compare all farms selling the same product
- Sort by price, distance, ETA
- DetailedFarmCard with delivery fee/ETA calculations based on user geolocation

### Map Page (`src/pages/MapPage.tsx` — route: `/map`)
- Google Maps integration showing farm locations
- FarmMap component

### Checkout (`src/pages/CheckoutPage.tsx` — route: `/checkout`)
- Form: first name, last name, email, phone, address, city, zip (Zod validated)
- Payment method selector: Card, GCash (Smartphone icon), Crypto
- DeliveryProviderSelector: fetches estimates from `/delivery-estimate` edge function (Lalamove, Grab, etc.)
- Transparent pricing breakdown: subtotal, platform fee, tax, transport fee = total
- Order placement via `shop-checkout` edge function

### Order Confirmation (`src/pages/OrderConfirmation.tsx` — route: `/order-confirmation`)

### Placeholder/Info Pages (all under `src/pages/placeholders.tsx`):
- About, Impact, Careers, Pilot Baguio
- Pricing, Order Track, Quality Policy
- Farmer pages: Onboarding, Upload, Payouts, Logistics, FAQ
- Buyer pages: Onboarding, Wholesale, Transactions, Disputes, FAQ
- Rewards, Compensation
- Blog, Help, Status, Support, Contact
- Legal: Terms, Privacy, Cookies, Refund, Risk Disclosure, AML/KYC

---

## 3. BUYER DASHBOARD (`src/pages/BuyerDashboard.tsx` — route: `/buyer`)
**Access**: `buyer` role required
**Layout**: Header + left sidebar + main content + Footer
**Sidebar** (`src/components/buyer/BuyerSidebar.tsx`): collapsible on desktop, sheet on mobile

### Tabs/Panels:
| Tab | Component | Description |
|-----|-----------|-------------|
| Home | `BuyerOverviewPanel` | KPI cards (orders, pending, tokens, referral earnings), wallet balance, unread notifications, quick actions |
| Shop | `BuyerShopPanel` | CTA linking to `/shop` marketplace |
| Orders | `BuyerOrdersPanel` | Order list with search/status filter, expandable order details (items, pricing breakdown, delivery tracking, payment info, status timeline) |
| Wallet | `BuyerWalletPanel` | Wallet balances (available, pending) |
| Tokens | `BuyerTokensPanel` | AGRI token balance and history |
| Referrals | `BuyerReferralsPanel` | Referral code, referral tracking, earnings |
| Profile | `BuyerProfilePanel` | Edit profile, manage delivery addresses (CRUD), change password |
| Notifications | `BuyerNotificationsPanel` | Notification center |
| Support | `BuyerSupportPanel` | Support ticket submission |

---

## 4. FARMER DASHBOARD (`src/pages/FarmerDashboard.tsx` — route: `/farmer`)
**Access**: `farmer` role required, must have entry in `farmers` table
**Layout**: Header + left sidebar + main content (farm header with image/status/location) + Footer
**Sidebar** (`src/components/farmer/FarmerSidebar.tsx`): collapsible, sheet on mobile

### Tabs/Panels:
| Tab | Component | Description |
|-----|-----------|-------------|
| Home | `FarmerOverviewPanel` | Today's orders, pending count, 30-day earnings, token balance, wallet card, low-stock alerts, quick actions |
| Products | `FarmerProductsPanel` | Product CRUD, image upload (`ProductImageUploader`), stock management |
| Orders | `FarmerOrdersPanel` | Incoming orders, status management |
| Earnings | `FarmerEarningsPanel` | Earnings breakdown, history |
| Pricing | `FarmerPricingPanel` | Base price management (platform cannot override) |
| Delivery | `FarmerDeliveryPanel` | Delivery settings, logistics |
| Withdrawal | `FarmerWithdrawalPanel` | Request payouts |
| Referrals | `FarmerReferralsPanel` | Referral program |
| Tokens | `FarmerTokensPanel` | AGRI token balance |
| Profile | `FarmerProfilePanel` | Farm profile editing |
| Notifications | `FarmerNotificationsPanel` | Notification center |
| Support | `FarmerSupportPanel` | Support tickets |

---

## 5. MEMBER DASHBOARD (`src/pages/MemberDashboard.tsx` — route: `/member`)
**Access**: `member` role required
**Layout**: Header + left sidebar + main content + Footer
**Sidebar** (`src/components/member/MemberSidebar.tsx`): collapsible, sheet on mobile

### Tabs/Panels:
| Tab | Component | Description |
|-----|-----------|-------------|
| Dashboard | `MemberOverviewPanel` | Membership tier, BV totals, wallet, recent activity |
| Genealogy | `BinaryTreeVisualization` | Binary tree viewer (left/right legs) |
| Earnings | `MemberEarningsPanel` | Commission breakdown, payout history |
| Withdraw | `MemberWithdrawPanel` | Withdrawal requests |
| Upgrade | `MemberUpgradePanel` | Package upgrades |
| Support | `MemberSupportPanel` | Support tickets |
| Shop | `MemberShopPanel` | MLM product shop |
| KYC | KYC verification flow | `KYCVerificationForm`, `KYCDocumentUpload`, `KYCDocumentsList` |
| Settings | Profile settings | (via query param) |

### Supporting Components:
- `src/components/rank/RankProgress.tsx` — rank progression display
- `src/components/wallet/AgriTokenCard.tsx`, `WalletCard.tsx` — wallet UI

---

## 6. DRIVER DASHBOARD (`src/pages/DriverDashboard.tsx` — route: `/driver`)
**Access**: `driver` role required (hidden from public nav)
**Layout**: Self-contained, no sidebar — uses Tabs component

### Tabs:
| Tab | Description |
|-----|-------------|
| Available | Pending pickup orders with customer/farm details, items, distance, earnings, accept button |
| Active | Currently active deliveries with status progression (pending → picked_up → in_transit → delivered) |
| Completed | Delivery history |

### Per-Order Card:
- Customer name, phone
- Pickup address + farm name
- Delivery address
- Item list with quantities
- Distance, estimated time, earnings
- Status badge, action buttons (Accept, Navigate, Confirm Pickup, Mark Delivered)

---

## 7. BUSINESS CENTRE (`src/pages/BusinessCentreLanding.tsx` — route: `/business-centre`)
**Access**: `affiliate` or `admin` role required
**Auth**: Separate auth flow at `/business-centre/auth` (`src/pages/BusinessCentreAuth.tsx`)
**Layout**: Single-page scrollable, sticky section nav bar (no sidebar)

### Sections (scroll-to navigation):
| Section | ID | Description |
|---------|----|-------------|
| Dashboard | `dashboard` | Welcome card (package, status, qualification), KPI cards (earnings, downline, binary BV, tokens) |
| Network | `network` | Network stats, team overview |
| Binary Tree | `binary` | Binary tree visualization (left/right legs, volume counters, carryover) |
| Commissions | `commissions` | 4 commission types: Direct Product Sales (15-25%), Direct Membership Sales (4-10%), Binary Pairing (10%), 5-level Matching Bonuses (up to 10%) |
| Referrals | `referral` | Referral link/code, sharing tools |
| Rank | `rank` | Rank progression, criteria, benefits |
| Wallet | `payout` | Wallet balances, payout settings, withdrawal |
| Marketing | `marketing` | Marketing materials, promotional tools |
| Support | `support` | Support contact, FAQ |

### Design:
- Deep Green (#1E5631) + Gold (#C9A227) on Off-white (#F8F6F1)
- Professional SaaS aesthetic, soft-shadowed cards, 12px rounded corners

---

## 8. ADMIN BACK OFFICE (`src/pages/AdminBackOffice.tsx` — route: `/admin`)
**Access**: `admin` role required
**Layout**: Single-page, NO sidebar. Sticky top nav with tabs + smooth-scroll anchors.

### Top Bar (`src/components/backoffice/BackOfficeTopBar.tsx`):
- Row 1: Terra logo + DEV badge, global search, notifications bell, "Create" dropdown, admin profile menu
- Row 2: 12 navigation tabs (scroll-to-section, highlight on scroll)

### Reusable Components:
- `KPICard` — metric card with title, value, change indicator
- `DataTable` — server-side pagination, column renderers, bulk actions
- `StatusChip` — colored status badges
- `DetailDrawer` — right-side sheet for User/Order/Ticket/Audit detail views
- `BackOfficeSection` — collapsible section wrapper with header + KPI chips

### Sections (12 modules):

#### A) Overview (`OverviewSection.tsx`)
- KPI cards: GMV, service fees, orders, active farmers/buyers/drivers, open tickets, pending withdrawals
- Charts (Recharts): orders over time, revenue/fee over time, delivery success rate
- "Attention needed" queue: flagged orders, failed payments, overdue deliveries, KYC pending

#### B) Users & Roles (`UsersRolesSection.tsx`)
- Searchable user table: type, status, region, KYC flag, created date
- User detail drawer: profile, verification, activity timeline, linked entities
- Admin actions: suspend/reactivate, reset password, role assignment (Super Admin only)
- Driver subpanel: availability, assigned route, performance

#### C) Marketplace (`MarketplaceSection.tsx`)
- Pending approvals queue: product photos, farmer, proposed price, category
- Approve/Reject with required reason + auto audit log
- Category manager (CRUD)
- Inventory flags: low stock, out of stock, seasonal

#### D) Orders (`OrdersSection.tsx`)
- Orders table: filters (status, payment, delivery window, zone, buyer, farmer)
- Order drawer: full pricing breakdown, payment status + provider ref, delivery tracking, support timeline + refund/return controls

#### E) Logistics (`LogisticsSection.tsx`)
- Dispatch board: unassigned orders, available drivers, SLA timers
- "Assign driver" modal
- Live delivery table: driver, route, stops, ETA, status
- Delivery confirmation: timestamp, proof, notes

#### F) Payments & Finance (`PaymentsFinanceSection.tsx`)
- Reconciliation: transactions list with provider IDs, mismatches queue + resolution
- Payouts: batch management, statuses, totals, export
- Tax config: VAT/sales tax rules by jurisdiction
- Platform fees: configurable rules + effective dates
- All edits require reason + audit trail

#### G) MLM & Commissions (`MLMCommissionsSection.tsx`)
- Genealogy viewer (tree view) with volume counters + carryover
- Commission run console: freeze period, lock transactions, run matching (1:1), caps, FIFO expiry, generate lines, rollback via reversals
- Wallet & Ledger: append-only, every balance change creates new record
- Withdrawals console: requested → approved → paid → closed
- Dual approval for money edits (Finance Admin + Super Admin)
- Binary math: matched volume = min(left, right), commission = matched × 10%

#### H) Token Rewards (`TokenRewardsSection.tsx`)
- Configure reward rules by activity type
- Distribution monitoring: issued, pending, failed
- Token ledger per user (append-only)

#### I) Support & Disputes (`SupportDisputesSection.tsx`)
- Ticket queue: SLA timers, tags, assignment
- Ticket drawer: conversation log, linked order, actions (refund/replace/close)
- Refund actions trigger finance + audit logs

#### J) Reports & Analytics (`ReportsAnalyticsSection.tsx`)
- Saved report templates
- Export CSV/PDF
- Scheduled email export option (UI)

#### K) Compliance & Audit (`ComplianceAuditSection.tsx`)
- Audit log viewer: actor, timestamp, before/after JSON, reason
- Filters: actor, action type, entity type, date range
- "View change diff" drawer per event
- No hard deletes for financial data

#### L) System Settings (`SystemSettingsSection.tsx`)
- Packages & ranks configuration
- Fee/tax configuration
- Regions/zones and delivery windows
- Feature flags (KYC enabled, token payouts enabled, etc.)

### Admin Roles (RBAC):
| Role | Permissions |
|------|-------------|
| Support Admin | Member lookup, limited profile edits, handle tickets, view genealogy |
| Finance Admin | Run commissions, approve withdrawals, dual-approval wallet adjustments, payout reports |
| Super Admin | Full control: system settings, packages/ranks, audit logs, manual placement override, role assignment |

### Legacy Admin Dashboard (`src/pages/AdminDashboard.tsx` — route: `/admin/legacy`)
- Old sidebar-based admin with panels: `AdminSidebar`, `AdminOverviewPanel`, `UserManagementPanel`, `ProductApprovalPanel`, `MembershipsPanel`, `GenealogyPanel`, `BVLedgerPanel`, `PayoutCyclePanel`, `PayoutsLedgerPanel`, `WithdrawalsPanel`, `TokenRewardsPanel`, `CustomerServicePanel`, `AuditLogPanel`, `ReportsPanel`, `IntegrationManagerPanel`, `PlatformSettingsPanel`

---

## 9. EDGE FUNCTIONS (Backend — `supabase/functions/`)

| Function | Purpose |
|----------|---------|
| `create-order` | Order creation |
| `shop-checkout` | Checkout processing |
| `get-orders` | Order retrieval |
| `delivery-estimate` | Delivery fee/ETA calculation (JWT auth, PH geo-fence, coordinate validation) |
| `delivery-booking` | Book delivery with provider |
| `process-withdrawal` | Process withdrawal requests |
| `run-payout-cycle` | Execute payout batches |
| `wallet-ledger` | Wallet ledger operations |
| `bv-expiry-job` | BV volume expiry cron |
| `gemini-chat` | AI chat via Gemini |
| `webhook-gcash` | GCash payment webhook |
| `webhook-bank` | Bank payment webhook |
| `webhook-grab` | Grab delivery webhook |
| `webhook-lalamove` | Lalamove delivery webhook |

---

## 10. STATE MANAGEMENT & HOOKS

| File | Purpose |
|------|---------|
| `src/store/cartStore.ts` | Zustand cart store (items, add/remove, totals) |
| `src/hooks/useAuth.tsx` | Auth context (user, session, profile, signUp/signIn/signOut) |
| `src/hooks/useUserRoles.ts` | Role checking (isAdmin, isFarmer, isBuyer, isMember, isDriver, isAffiliate) |
| `src/hooks/useAggregatedProducts.ts` | Multi-farm product aggregation |
| `src/hooks/useUserLocation.ts` | Browser geolocation |
| `src/hooks/useMapProvider.ts` | Google Maps provider |
| `src/hooks/use-mobile.tsx` | Mobile breakpoint detection |

---

## 11. ROUTE MAP SUMMARY

```text
PUBLIC ROUTES
/                    Landing page (hero, features, farms, testimonials)
/shop                Marketplace (aggregated products, filters, sort)
/product/:id         Product detail
/product/:id/offers  Multi-farm comparison
/map                 Farm locations map
/auth                Login / Register (buyer or farmer)
/reset-password      Password reset
/checkout            Cart checkout (pricing breakdown, delivery, payment)
/order-confirmation  Order success page
/affiliate           Affiliate info page
/kyc                 KYC verification
/about, /impact, /careers, /pilot/baguio
/pricing, /orders/track, /policies/quality
/farmers/onboarding, /farmers/upload, /farmers/payouts, /farmers/logistics, /faq/farmers
/buyers/onboarding, /buyers/wholesale, /account/transactions, /support/disputes, /faq/buyers
/rewards, /rewards/compensation
/blog, /help, /status, /support, /contact
/legal/terms, /legal/privacy, /legal/cookies, /legal/refunds, /legal/risk-disclosure, /legal/aml-kyc

ROLE-PROTECTED ROUTES
/buyer               Buyer Dashboard (role: buyer)
/farmer              Farmer Dashboard (role: farmer)
/member              Member Dashboard (role: member)
/driver              Driver Dashboard (role: driver)
/admin               Admin Back Office (role: admin)
/admin/legacy        Legacy Admin Dashboard (role: admin)
/business-centre     Business Centre portal (role: affiliate, admin)
/business-centre/auth  Affiliate login
/business-centre/dashboard  (redirects to /business-centre)
```

---

## 12. DESIGN SYSTEM

- **Framework**: React 18 + Vite + TypeScript + Tailwind CSS
- **UI Library**: shadcn/ui (Radix primitives) — full component set
- **Charts**: Recharts
- **Animation**: Framer Motion (page transitions)
- **Icons**: Lucide React
- **Theme**: next-themes (light/dark toggle)
- **State**: Zustand (cart), React Query (server state), React Context (auth)
- **Routing**: React Router DOM v6 with animated transitions
- **Backend**: Supabase (Lovable Cloud) — Auth, PostgreSQL, Edge Functions, Realtime
- **Maps**: Google Maps via @react-google-maps/api
