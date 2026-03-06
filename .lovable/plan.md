

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

### Implementation Plan

#### A. Farmer Dashboard - Add Sidebar Navigation (Highest Priority)
- Create `FarmerSidebar.tsx` following the same pattern as `BuyerSidebar.tsx` and `MemberSidebar.tsx`
- On mobile: floating menu button that opens a Sheet with all 12 tabs
- On desktop: collapsible sidebar
- Update `FarmerDashboard.tsx` to use sidebar layout instead of `TabsList`

#### B. Map Page Mobile Fixes
- Refactor location banner: stack text and button vertically on mobile with `flex-col sm:flex-row`
- Increase mobile map height from `aspect-[4/3]` to `aspect-[3/4]` or a fixed `min-h-[400px]` on mobile
- Limit farm sidebar to a horizontal scroll card strip on mobile

#### C. Product Detail Mobile Fixes
- Reduce gap: `gap-6 lg:gap-12` instead of `gap-12`
- Reduce breadcrumb margin: `mb-4 lg:mb-8`
- Make price section more compact on mobile

#### D. Admin Tables - Horizontal Scroll
- Wrap all `<Table>` components in admin panels with `overflow-x-auto` containers
- This affects: `renderFarmersTab()`, `renderDriversTab()`, `renderOrdersTab()`, and sub-panels

#### E. Index Page - How It Works Grid
- Change from `grid-cols-1 md:grid-cols-4` to `grid-cols-2 md:grid-cols-4` for a tighter mobile layout

#### F. Footer - Mobile 2-Column Links
- Change link sections from `grid-cols-1 md:grid-cols-4` to `grid-cols-2 md:grid-cols-4` so the three link columns (Shop, For Farmers, Support) display in a 2-column grid on mobile

#### G. Checkout Page - Mobile Summary
- Add a sticky bottom bar on mobile showing the total and "Place Order" button, so users always see the total without scrolling

---

### Technical Details

**Files to create:**
- `src/components/farmer/FarmerSidebar.tsx` (new, based on BuyerSidebar pattern)

**Files to modify:**
- `src/pages/FarmerDashboard.tsx` - Replace TabsList with FarmerSidebar layout
- `src/pages/MapPage.tsx` - Fix location banner and map height on mobile
- `src/pages/ProductDetail.tsx` - Reduce spacing for mobile
- `src/pages/Index.tsx` - 2-col "How It Works" grid on mobile
- `src/pages/AdminDashboard.tsx` - Add overflow-x-auto to table containers
- `src/components/Footer.tsx` - 2-col mobile grid for link sections
- `src/pages/CheckoutPage.tsx` - Mobile-friendly order summary

**No database changes required.**

