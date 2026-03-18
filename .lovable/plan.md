## Mobile Responsiveness Audit & Fix Plan

### Current State Assessment

After auditing every major page on a 390x844 mobile viewport, the project is **already well-structured for mobile** in most areas. However, there are specific issues that need fixing to achieve a professional mobile experience:

### Issues Found

**1. Farmer Dashboard - Tab Overflow (Critical)**
The `FarmerDashboard.tsx` uses a horizontal `TabsList` with 12 tabs. On mobile, these wrap awkwardly and overflow. This needs to be converted to a sidebar/sheet pattern (like Buyer and Admin dashboards already use) or a scrollable tab bar.

**2. Map Page - Location Banner Layout Break**
The location status banner on `/map` has text wrapping poorly on mobile. The "Using default location (Manila)" text and "Update Location" button stack awkwardly. The banner needs better mobile flex layout.

**3. Map Page - Map + Sidebar Stacking**
When in map view on mobile, the `lg:grid-cols-3` layout correctly stacks, but the map's `aspect-[4/3]` creates a very short map on narrow screens, and the farm sidebar below gets no height constraint, creating a very long scroll.

**4. Product Detail Page - Gap Too Large**
The `gap-12` between image and details on `/product/:id` is excessive on mobile. The breadcrumb "Back to Marketplace" also has `mb-8` which wastes space.

**5. Index Page - "How It Works" 4-Column Grid**
The `md:grid-cols-4` layout drops to single column on mobile, which is fine, but the step cards could use a 2-column layout on small screens for a tighter look.

**6. Checkout Page - Order Summary Overlap**
The `lg:grid-cols-2` layout stacks on mobile correctly, but the order summary panel (right column) lacks a sticky behavior on mobile, making it hard to review totals when the form is long.

**7. Admin Dashboard - Tables Overflow**
Admin tables (Farmers, Drivers, Orders) don't have horizontal scroll containers on mobile, causing content to get clipped or overflow.

**8. Footer - Single Column on Mobile**
The footer grid `md:grid-cols-4` drops to single column. This is functional but takes excessive vertical space. A 2-column mobile layout for the link sections would be more compact.

---

## 🔒 Business Centre Architecture Lock

The Business Centre (`/business-centre/*`) is the **single unified application shell** for Affiliates, Admins, and Super Admins. This structure is locked.

### Non-Negotiable Rules
- **ONE Business Centre** — no duplicates, no replacements, no parallel dashboards
- All roles (Member, Admin, Super Admin) share the **same layout** — differences are data visibility and permissions only
- New features **must plug into** the existing Main Content Area via the sidebar navigation
- Never move pages outside `/business-centre/`
- Never remove existing pages when adding features

### Locked Sidebar Structure

| Section | Pages |
|---------|-------|
| Overview | Overview |
| Network | Binary Tree, Network, Referrals |
| Earnings & Finance | Commissions, Wallet, Token Rewards, Marketing |
| Growth & Access | Rank & Activation, Coupons |
| Support | Support |
| Admin (admin only) | Member Search, Genealogy Explorer, Commission Runs, Payout Oversight, Reports |
| Super Admin (super_admin only) | Wallet Controls, Manual Placement, Audit Logs, Security & Roles, System Settings |

### Locked Layout
- Left Sidebar (navigation)
- Top Header (role badge, search for admins)
- Main Content Area (page content renders here via `<Outlet />`)
- Optional Right Panel (detail drawers)

### Safe Update Rule
When modifying or adding features:
1. Preserve ALL existing pages and navigation
2. Only extend functionality — never restructure
3. New pages get a route under `/business-centre/` and a sidebar entry
4. If a change risks breaking the shell — **do not apply it**

### Key Files
- `src/components/business-centre/BusinessCentreShell.tsx` — shell layout + sidebar nav
- `src/components/AnimatedRoutes.tsx` — route definitions
- `src/contexts/BusinessCentreContext.tsx` — shared state
- `src/pages/business-centre/*` — individual page components
