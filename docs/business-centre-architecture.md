# Terra Business Centre — Architecture & Implementation Plan

## 1. Database Schema

### Existing Tables (no changes needed)
| Table | Purpose |
|---|---|
| `profiles` | User profiles, referral codes, token balances |
| `user_roles` | Role assignments (app_role enum) |
| `permissions` | Permission definitions (key, label, category) |
| `role_permissions` | User ↔ permission grants |
| `admin_scopes` | Scoped admin access (e.g. region, farmer subset) |
| `system_toggles` | Global feature flags |
| `memberships` | MLM tier, sponsor, binary placement, BV |
| `ranks` | Rank definitions, caps, match %, requirements |
| `binary_ledger` | Per-period binary BV snapshots |
| `bv_ledger` | BV transaction log (append-only) |
| `payout_ledger` | Commission payouts (append-only) |
| `compensation_pools` | Period pool amounts, fail-safe ratios |
| `wallets` | User wallet balances |
| `wallet_transactions` | Wallet ledger (append-only) |
| `withdrawal_requests` | Withdrawal lifecycle |
| `manual_adjustments` | Admin credit/debit with reason |
| `payout_runs` | Batch payout processing |
| `payout_entries` | Individual payout items |
| `token_ledger` | Token issuance log (append-only) |
| `coupon_packages` | Coupon definitions |
| `coupon_purchases` | Coupon purchase records |
| `orders` | Marketplace orders |
| `order_items` | Line items |
| `farmers` | Farm profiles |
| `farm_products` | Farm ↔ product linking |
| `products` | Product catalog |
| `drivers` | Driver profiles |
| `delivery_bookings` | Delivery lifecycle |
| `delivery_zones` | Zone-based pricing |
| `support_tickets` | Support tickets |
| `ticket_messages` | Ticket conversation |
| `audit_log` | Immutable audit trail |
| `kyc_profiles` | KYC verification |
| `kyc_documents` | KYC document uploads |
| `platform_settings` | Configurable platform params |
| `member_transfers` | P2P transfers |
| `digital_assets` | Digital product assets |
| `notifications` | User notifications |

### Audit Fields (enforced)
- All tables: `created_at` (auto), `updated_at` (trigger)
- Financial tables: append-only (prevent_ledger_mutation trigger)
- `audit_log`: actor_id, action, entity_type, entity_id, ip_address, details
- `manual_adjustments`: created_by_user_id, reason (required)
- No hard deletes on financial data

---

## 2. Role/Permission Matrix

### Roles (app_role enum)
| Role | Access Level |
|---|---|
| `admin` | Super Admin — full platform access |
| `admin_readonly` | Read-only admin — view all, modify nothing |
| `farmer` | Farm management, products, orders |
| `buyer` | Marketplace shopping, orders |
| `driver` | Delivery queue, earnings |
| `member` | MLM network, commissions |
| `affiliate` | Referrals, Business Centre |
| `business_buyer` | Wholesale buyer |

### Permission Keys (20 granular permissions)
| Key | Category | Description |
|---|---|---|
| `view_farmer_dashboard` | Dashboards | View farmer data |
| `manage_farmers` | Dashboards | CRUD farmer profiles |
| `view_buyer_dashboard` | Dashboards | View buyer data |
| `manage_buyers` | Dashboards | Manage buyer accounts |
| `view_driver_dashboard` | Dashboards | View driver data |
| `manage_drivers` | Dashboards | Manage driver accounts |
| `manage_orders` | Operations | Order management |
| `manage_payouts` | Finance | Payout processing |
| `manage_coupons` | Coupons | Coupon CRUD |
| `manage_tokens` | Tokens | Token admin tools |
| `manage_binary_tree` | MLM | Tree placement/fixes |
| `manage_members` | MLM | Member management |
| `view_reports` | Reports | View analytics |
| `export_reports` | Reports | Export data |
| `manage_settings` | System | Platform config |
| `manage_admins` | System | Admin account mgmt |
| `manage_wallets` | Finance | Wallet adjustments |
| `view_audit_logs` | Compliance | View audit trail |
| `manage_compliance` | Compliance | KYC/fraud tools |
| `manage_roles` | System | Role assignment |

### Access Matrix
| Module | Super Admin | Delegated Admin | Read-Only Admin | Member/Affiliate |
|---|---|---|---|---|
| 1. Overview | ✅ System-wide | ✅ System-wide | ✅ View only | ✅ Personal |
| 2. Users & Roles | ✅ Full | ✅ If permitted | ✅ View only | ❌ |
| 3. Marketplace | ✅ Full | ✅ If permitted | ✅ View only | ❌ |
| 4. Logistics | ✅ Full | ✅ If permitted | ✅ View only | ❌ |
| 5. Finance | ✅ Full | ✅ If permitted | ✅ View only | ✅ Personal wallet |
| 6. MLM System | ✅ Full + tools | ✅ If permitted | ✅ View only | ✅ Personal tree |
| 7. Tokenomics | ✅ Full + mint/burn | ✅ If permitted | ✅ View only | ✅ Personal balance |
| 8. Coupons | ✅ Full | ✅ If permitted | ✅ View only | ✅ Own coupons |
| 9. Support | ✅ All tickets | ✅ If permitted | ✅ View only | ✅ Own tickets |
| 10. Reports | ✅ Full + export | ✅ If permitted | ✅ View only | ❌ |
| 11. Compliance | ✅ Full | ✅ If permitted | ✅ View only | ❌ |
| 12. Settings & Audit | ✅ Full | ❌ | ❌ | ❌ |

---

## 3. Routes

### Business Centre Routes (`/business-centre/*`)
| Route | Component | Module | Access |
|---|---|---|---|
| `/business-centre` | `BCOverview` | 1. Overview | All BC users |
| `/business-centre/overview` | `BCOverview` | 1. Overview | All BC users |
| `/business-centre/users` | `BCUsersRoles` | 2. Users & Roles | Admin |
| `/business-centre/marketplace` | `BCMarketplace` | 3. Marketplace | Admin |
| `/business-centre/logistics` | `BCLogistics` | 4. Logistics | Admin |
| `/business-centre/wallet` | `BCWallet` | 5. Finance | All (scoped) |
| `/business-centre/earnings` | `BCEarnings` | 5. Finance | All (scoped) |
| `/business-centre/withdrawals` | `BCWithdrawals` | 5. Finance | All (scoped) |
| `/business-centre/statements` | `BCStatements` | 5. Finance | All (scoped) |
| `/business-centre/payout-oversight` | `BCPayoutOversight` | 5. Finance | Admin |
| `/business-centre/wallet-controls` | `BCWalletControls` | 5. Finance | Super Admin |
| `/business-centre/binary-tree` | `BCBinaryTree` | 6. MLM | All (scoped) |
| `/business-centre/network` | `BCNetwork` | 6. MLM | All (scoped) |
| `/business-centre/referrals` | `BCReferrals` | 6. MLM | All (scoped) |
| `/business-centre/commissions` | `BCCommissions` | 6. MLM | All (scoped) |
| `/business-centre/commission-runs` | `BCCommissionRuns` | 6. MLM | Admin |
| `/business-centre/rank-activation` | `BCRankActivation` | 6. MLM | All (scoped) |
| `/business-centre/rank-manager` | `BCRankManager` | 6. MLM | Admin |
| `/business-centre/package-manager` | `BCPackageManager` | 6. MLM | Admin |
| `/business-centre/manual-placement` | `BCManualPlacement` | 6. MLM | Super Admin |
| `/business-centre/member-search` | `BCMemberSearch` | 6. MLM | Admin |
| `/business-centre/genealogy-explorer` | `BCBinaryTree` | 6. MLM | Admin |
| `/business-centre/token-rewards` | `BCTokenRewards` | 7. Tokenomics | All (scoped) |
| `/business-centre/coupons` | `BCCoupons` | 8. Coupons | All (scoped) |
| `/business-centre/marketing` | `BCMarketing` | 8. Coupons | All (scoped) |
| `/business-centre/support` | `BCSupport` | 9. Support | All (scoped) |
| `/business-centre/reports` | `BCReports` | 10. Reports | Admin |
| `/business-centre/compliance` | `BCCompliance` | 11. Compliance | Admin |
| `/business-centre/security-roles` | `BCSecurity` | 11. Compliance | Super Admin |
| `/business-centre/control-center` | `BCControlCenter` | 12. Settings | Super Admin |
| `/business-centre/system-settings` | `BCSystemSettings` | 12. Settings | Super Admin |
| `/business-centre/global-config` | `BCGlobalConfig` | 12. Settings | Super Admin |
| `/business-centre/audit-logs` | `BCAuditLogs` | 12. Settings | Super Admin |

---

## 4. Sidebar Navigation Map

### Member View (affiliate/member roles)
```
📊 Overview
  └ Overview

🌐 My Network
  ├ Binary Tree
  ├ Network
  └ Referrals

💰 Finance
  ├ Earnings
  ├ Commissions
  ├ Wallet
  ├ Withdrawals
  └ Statements

🚀 Growth
  ├ Rank & Activation
  ├ Token Rewards
  ├ Coupons
  └ Marketing

🎧 Support
  └ Support
```

### Admin View (admin/admin_readonly roles)
```
📊 1. Overview
  └ Overview

👥 2. Users & Roles
  └ User Management

🏪 3. Marketplace
  └ Marketplace Operations

🚚 4. Logistics
  └ Logistics & Delivery

💰 5. Financial Management
  ├ Earnings Overview
  ├ Wallet Overview
  ├ Withdrawals
  ├ Statements
  ├ Payout Oversight
  └ Wallet Controls ★

🔗 6. MLM System
  ├ Binary Tree
  ├ Network
  ├ Referrals
  ├ Commissions
  ├ Commission Runs
  ├ Rank & Activation
  ├ Rank Manager
  ├ Package Manager
  ├ Member Search
  ├ Genealogy Explorer
  └ Manual Placement ★

🪙 7. Tokenomics
  └ Token Rewards

🎟️ 8. Coupons & Promotions
  ├ Coupons
  └ Marketing

🎧 9. Customer Service
  └ Support Queue

📈 10. Reports & Analytics
  └ Reports

🛡️ 11. Compliance & Security
  ├ Compliance
  └ Security & Roles ★

⚙️ 12. Settings & Audit
  ├ Control Center ★
  ├ System Settings ★
  ├ Global Config ★
  └ Audit Logs ★

★ = Super Admin only
```

---

## 5. Compensation Rules (Exact Implementation)

### BV Generation
- **Only Terra Fee generates BV** (1:1 ratio: ₱1 Terra Fee = 1 BV)
- Farmer base price → NO BV
- Delivery fees → NO BV
- BV type tracked: `product` or `membership`

### Binary Commission
- Structure: 1:1 binary (left/right legs)
- Match rate: **10% of lesser leg** (weak leg)
- 500 BV increments for pairing
- **Only paid members** earn binary + matching
- **Free members**: earn direct product sales only (15-25%), NO binary, NO matching, NO membership sales bonus

### Daily Binary Caps (by tier)
| Tier | Price | BV | Daily Cap |
|---|---|---|---|
| Starter | ₱500 | 500 | ₱5,000/day |
| Basic | ₱1,000 | 1,000 | ₱15,000/day |
| Pro | ₱3,000 | 3,000 | ₱50,000/day |
| Elite | ₱5,000 | 5,000 | ₱250,000/day |

### Commission Types
| Type | Rate | Eligibility |
|---|---|---|
| Direct Product Sales | 15-25% | All members |
| Direct Membership Sales | 4-10% | Paid members only |
| Binary Pairing | 10% of lesser leg | Paid members only |
| Matching Bonus | Up to 5 levels deep | Paid members, rank ≥ downline |

### Fail-Safe Mechanism
- Applies **only to membership-BV binary payouts**
- Compensation pool = 33% of Terra Fees
- Fail-safe threshold: **75%** — membership-BV binary payouts can never exceed 75% of the compensation pool
- If exceeded: cycle value adjusts downward (base ₱50 per 500 BV)
- Product-BV binary payouts: NO fail-safe, always paid at face value

### Processing Order
1. Calculate direct product sales commissions
2. Calculate direct membership sales commissions
3. Calculate binary pairing (lesser leg × 10%)
4. Apply daily binary caps by tier
5. Apply fail-safe to membership-BV binary portion
6. Calculate matching bonuses (post fail-safe, post cap)
7. Post to payout_ledger
8. Credit wallets

---

## 6. Token Rules (Exact Implementation)

| Parameter | Value |
|---|---|
| Total Supply | 250,000,000,000 AGRI |
| Decimals | 18 |
| Inflation | None (fixed supply) |
| Minting | Permanently disabled |
| Burning | Enabled |
| Compatibility | EVM-compatible |
| Nature | Non-cash reward (never reduces cash pool) |

### Issuance Formula
```
tokens_issued = reward_php / token_market_price
```

### Allocation Buckets (per whitepaper)
Track via `platform_settings` table:
- Farming Rewards
- Staking Rewards
- Team/Advisors
- Community/Ecosystem
- Liquidity
- Reserve

---

## 7. API Contracts (Edge Functions)

| Function | Method | Auth | Purpose |
|---|---|---|---|
| `shop-checkout` | POST | User | Process marketplace orders |
| `create-order` | POST | User | Create order with price validation |
| `get-orders` | GET | User | Fetch user orders |
| `purchase-coupon` | POST | User | Buy coupon package |
| `process-upgrade` | POST | User | Tier upgrade |
| `process-withdrawal` | POST | User | Submit withdrawal |
| `wallet-ledger` | POST | Service | Post wallet entry |
| `run-payout-cycle` | POST | Admin | Execute commission cycle |
| `binary-tree` | GET | User | Fetch tree data |
| `bv-expiry-job` | POST | Cron | Expire stale BV |
| `delivery-estimate` | POST | User | Get delivery quote |
| `delivery-booking` | POST | User | Book delivery |
| `gemini-chat` | POST | User | AI chat support |
| `webhook-gcash` | POST | HMAC | GCash payment callback |
| `webhook-bank` | POST | HMAC | Bank transfer callback |
| `webhook-grab` | POST | HMAC | Grab delivery callback |
| `webhook-lalamove` | POST | HMAC | Lalamove delivery callback |

---

## 8. Phase Checklist

### Phase 1: Access & Overview ✅
- [x] Authentication (Supabase Auth)
- [x] Role-based access control (user_roles, has_role)
- [x] Permission system (permissions, role_permissions, has_permission)
- [x] System toggles
- [x] Business Centre shell with sidebar
- [x] Overview page with role-aware KPIs
- [x] View-as-Member mode for admins
- [x] Admin Control Center
- [ ] **Restructure sidebar to 12-module layout** ← THIS PR

### Phase 2: Marketplace & Logistics
- [x] Product catalog (products, farm_products)
- [x] Farmer profiles & management
- [x] Order creation (create-order edge function)
- [x] Delivery zones & estimation
- [x] Delivery booking (Grab/Lalamove)
- [x] Webhook handlers for delivery status
- [ ] BC Marketplace Operations module (admin view of orders, products, farmers)
- [ ] BC Logistics module (admin view of deliveries, drivers, zones)

### Phase 3: MLM Foundation
- [x] Membership tiers (Starter/Basic/Pro/Elite)
- [x] Binary tree placement (left/right legs)
- [x] Sponsor relationships
- [x] get_subtree_flat recursive CTE
- [x] Referral code generation
- [x] Binary Tree Explorer (SVG visualization)
- [x] Network page
- [x] Referrals page

### Phase 4: Commissions & Fail-Safe
- [x] run-payout-cycle edge function
- [x] BV ledger (append-only)
- [x] Binary ledger with carry-forward
- [x] Payout ledger (append-only)
- [x] Compensation pools with fail-safe ratio
- [x] Commission Runs admin page
- [ ] Verify: fail-safe applies ONLY to membership-BV binary
- [ ] Verify: matching computed AFTER fail-safe and caps
- [ ] Verify: free members blocked from binary/matching

### Phase 5: Wallets & Withdrawals
- [x] Wallet system (post_wallet_entry atomic function)
- [x] Wallet transactions ledger
- [x] Withdrawal requests with lifecycle
- [x] Manual adjustments with audit
- [x] Payout runs & entries
- [x] Wallet Controls (super admin)
- [ ] Dual-approval for money edits

### Phase 6: Tokenomics
- [x] Token ledger (append-only)
- [x] Token balance on profiles
- [x] Token issuance in coupon purchases
- [x] Token Rewards page (BC)
- [ ] Fixed supply tracker (250B)
- [ ] Allocation bucket tracking
- [ ] Burn mechanism
- [ ] Admin mint/adjust with audit

### Phase 7: Coupons & Campaigns
- [x] Coupon packages (Starter/Basic/Pro/Elite)
- [x] Purchase flow (purchase-coupon edge function)
- [x] BV generation from Terra Fee portion
- [x] Token reward issuance
- [x] Coupons page (BC)
- [ ] Usage limits & stackability
- [ ] Role-specific coupon eligibility
- [ ] Admin coupon analytics

### Phase 8: Reports & Compliance
- [x] Audit log table (append-only, service-role insert)
- [x] KYC profiles & documents
- [x] Reports page (admin)
- [x] Compliance page (admin)
- [ ] Exportable reports (CSV/PDF)
- [ ] Country rules
- [ ] Fraud detection flags
- [ ] KYC workflow integration in admin
