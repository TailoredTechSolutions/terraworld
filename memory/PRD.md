# Terra Farming - Product Requirements Document

## Original Problem Statement
Build a full-stack agricultural marketplace app called Terra Farming that connects:
- **Farmers** who list produce for sale
- **Buyers** who purchase produce
- **Drivers** who handle delivery
- **Admin/Affiliate** roles for management and referral system

The app must comply with Apple App Store (12+ rating) and Google Play Store guidelines.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (Auth, Database, RLS, Edge Functions, RPCs)
- **Auth**: Supabase Auth with Email/Password + Sign In with Apple OAuth
- **Deployment**: Web app (PWA-ready for App Store wrapping)

---

## ✅ Completed Work

### Authentication & Security
- [x] Email/Password authentication
- [x] **Sign In with Apple** - Added to login page (black Apple-branded button)
- [x] **Sign Up with Apple (Driver)** - Added to registration for driver quick signup
- [x] **Password policy updated to 12 characters** minimum with strength indicator
- [x] Password must include: uppercase, lowercase, number, symbol
- [x] Role-based routing (Buyer, Farmer, Driver, Admin, Affiliate)
- [x] MFA support for Admin/Affiliate roles

### Privacy & Compliance (Apple/Google Store Requirements)
- [x] **Privacy Policy page** at `/privacy` - Public, no login required
- [x] Covers: data collection, Sign In with Apple, security measures, children's privacy (12+)
- [x] Footer links to Privacy Policy across all pages
- [x] App Store rating: 12+ noted in policy

### Account Deletion (REQUIRED by App Stores)
- [x] **Delete Account component** - Reusable Danger Zone section
- [x] Confirmation requires typing "DELETE" to proceed
- [x] Integrated into:
  - [x] Buyer Dashboard → Profile Panel
  - [x] Farmer Dashboard → Profile Panel
  - [x] Driver Dashboard → Profile section
  - [x] Admin Back Office → System Settings → My Account tab
  - [x] Business Centre → Account Settings (for Affiliates)

### Production Security
- [x] **Console logs stripped** from production builds via Vite terser config
- [x] Row Level Security enabled on database tables
- [x] Audit logging for admin impersonation
- [x] Supabase SQL setup script created

### User Dashboards
- [x] Buyer Dashboard with orders, profile, delete account
- [x] Farmer Dashboard with listings, orders, profile, delete account
- [x] Driver Dashboard with deliveries, earnings, profile, delete account
- [x] Admin Back Office with system settings and delete account
- [x] Business Centre for Affiliates with account settings and delete account

---

## 📋 Pending Setup (User Action Required)

### Supabase Configuration
Run the SQL script at `/app/docs/SUPABASE_SETUP.sql` in your Supabase SQL Editor to create:
1. `audit_log` table for admin activity logging
2. `admin_impersonation_log` view
3. `log_admin_impersonation()` RPC
4. `privacy_policy_versions` table
5. `get_current_privacy_policy()` RPC
6. `delete_user_account()` RPC

### Supabase Auth Settings (Dashboard)
1. Go to Authentication → Settings
2. Set minimum password length to **12**
3. Enable **Apple** OAuth provider
4. Configure Apple OAuth credentials from Apple Developer account

### Apple Developer Setup (for Sign In with Apple)
1. Create App ID with "Sign In with Apple" capability
2. Create Service ID for web authentication
3. Configure redirect URLs
4. Add credentials to Supabase Auth

---

## 🔄 In Progress / Next Steps

### P1: Admin Impersonation Audit Integration
- [ ] Wire `log_admin_impersonation()` RPC to admin "View Dashboard" clicks
- [ ] Display audit log in Business Centre → Compliance & Audit tab

### P1: MFA Enforcement
- [ ] Create `MFAGuard` wrapper component
- [ ] Enforce MFA setup for Admin and Affiliate on first login
- [ ] `MFAChallenge` component for subsequent logins

### P2: PWA Manifest
- [ ] Add `manifest.json` for PWA support
- [ ] Add service worker for offline capability
- [ ] Configure icons (192x192 and 512x512)

---

## 📂 Key Files Reference

### Frontend
- `/app/frontend/src/pages/PrivacyPolicyPage.tsx` - Privacy Policy
- `/app/frontend/src/components/DeleteAccountSection.tsx` - Reusable delete account
- `/app/frontend/src/pages/AuthPage.tsx` - Auth with Apple Sign In
- `/app/frontend/vite.config.ts` - Production security (console stripping)

### Database Setup
- `/app/docs/SUPABASE_SETUP.sql` - All required SQL for Supabase

### Supabase Credentials
- Project URL: `https://dkqkncczhpusknstlzrn.supabase.co`
- Configured in: `/app/frontend/.env`

---

## Notes

- Payment processing uses external processor (exempt from Apple IAP for physical goods)
- App rated 12+ - no gambling, mature content, or children under 12
- Sign In with Apple required alongside email/password per Apple guidelines
- Account deletion required per both Apple and Google store policies

Last Updated: December 2025
