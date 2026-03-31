## Mobile Responsiveness Audit & Fix Plan

(Existing mobile audit items preserved — see git history for details)

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

| Section | Pages | Route |
|---------|-------|-------|
| **Overview** | Overview | `/business-centre/overview` |
| **Network** | Binary Tree | `/business-centre/binary-tree` |
| | Network | `/business-centre/network` |
| | Referrals | `/business-centre/referrals` |
| **Earnings & Finance** | Earnings | `/business-centre/earnings` |
| | Commissions | `/business-centre/commissions` |
| | Wallet | `/business-centre/wallet` |
| | Withdrawals | `/business-centre/withdrawals` |
| | Statements | `/business-centre/statements` |
| | Token Rewards | `/business-centre/token-rewards` |
| **Growth & Access** | Rank & Activation | `/business-centre/rank-activation` |
| | Coupons | `/business-centre/coupons` |
| | Marketing | `/business-centre/marketing` |
| **Support** | Support | `/business-centre/support` |
| **Admin Tools** *(admin only)* | Member Search | `/business-centre/member-search` |
| | Genealogy Explorer | `/business-centre/genealogy-explorer` |
| | Commission Runs | `/business-centre/commission-runs` |
| | Payout Oversight | `/business-centre/payout-oversight` |
| | Reports | `/business-centre/reports` |
| | Package Manager | `/business-centre/package-manager` |
| | Rank Manager | `/business-centre/rank-manager` |
| **Super Admin** *(super admin only)* | Wallet Controls | `/business-centre/wallet-controls` |
| | Manual Placement | `/business-centre/manual-placement` |
| | Audit Logs | `/business-centre/audit-logs` |
| | Security & Roles | `/business-centre/security-roles` |
| | System Settings | `/business-centre/system-settings` |
| | Compliance | `/business-centre/compliance` |
| | Global Config | `/business-centre/global-config` |

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
- `src/pages/business-centre/BCAdminPages.tsx` — admin page components
- `src/pages/business-centre/BCAdminExtended.tsx` — extended admin + super admin pages
