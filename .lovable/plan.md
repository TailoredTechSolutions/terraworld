

# Security Review Results

The scan found **4 vulnerabilities** (2 critical, 2 warnings) plus architectural observations. No database linter issues were found.

---

## Critical Findings

### 1. Farmer PII Exposed to Anonymous Users
**Severity: Critical**

The `farmers` table policy "Public can view active farmers via view" grants `anon` access to all columns including `email`, `phone`, `owner`, and exact GPS coordinates. Any unauthenticated user can query this data directly.

**Fix:** Replace the `anon` role on this policy with a narrower policy or restrict anonymous access to only use the existing `farmers_public` view (which already strips PII). The current policy should be scoped to `authenticated` only, while a new `anon` SELECT policy should expose only `id`, `name`, `location`, `latitude`, `longitude`, `rating`, `image_url`, `description`, `status`.

### 2. Delivery Bookings Leak Across Farmers
**Severity: Critical**

The "Farmers can view assigned order bookings" policy on `delivery_bookings` only checks `has_role(auth.uid(), 'farmer')` -- it does NOT verify the farmer owns the order. Any farmer can read driver contact details (`driver_phone`, `driver_name`, `driver_plate`), delivery addresses, and booking info for ALL orders.

**Fix:** Update the policy to also verify the order's `farmer_id` matches the authenticated farmer's profile, mirroring the pattern used on the `orders` table:
```sql
EXISTS (
  SELECT 1 FROM orders o
  WHERE o.id = delivery_bookings.order_id
  AND EXISTS (
    SELECT 1 FROM farmers f
    WHERE f.id = o.farmer_id
    AND f.email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid() LIMIT 1)
  )
)
```

---

## Warnings

### 3. Product Images: Cross-Farmer Manipulation
**Severity: Warning**

The INSERT and DELETE policies on `product_images` check `has_role(auth.uid(), 'farmer')` but do NOT verify product ownership. Any farmer can attach or remove images from another farmer's products.

**Fix:** Add ownership verification to match the `products` table pattern -- check that `products.farmer_id` corresponds to the authenticated farmer's record.

### 4. Platform Settings Over-Exposure
**Severity: Warning**

The authenticated user policy on `platform_settings` uses an exclusion list (`setting_key <> 'google_maps_api_key'`). Any new sensitive setting added in the future is automatically exposed to all users.

**Fix:** Switch to an allowlist approach matching the public policy pattern:
```sql
setting_key = ANY (ARRAY[
  'terra_fee_percent', 'tax_rate_percent', 'token_market_price',
  'min_withdrawal', 'max_daily_withdrawal', 'withdrawal_fee_percent',
  'bv_expiry_days'
])
```

---

## Additional Observations

### Edge Functions: All Have `verify_jwt = false`
All 14 edge functions disable JWT verification at the gateway level. This is acceptable **only if** each function validates the JWT internally (which most do via `supabase.auth.getUser(token)`). The webhook functions correctly use HMAC signature validation instead. No action needed, but worth documenting.

### Auth Configuration
- Email auto-confirm status should be verified -- the codebase expects email verification before sign-in
- Password reset flow is properly implemented with a dedicated `/reset-password` route

---

## Recommended Fix Priority

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | Farmer PII anonymous exposure | 1 migration |
| 2 | Delivery bookings cross-farmer leak | 1 migration |
| 3 | Product images cross-farmer manipulation | 1 migration |
| 4 | Platform settings allowlist | 1 migration |

All four fixes can be applied in a single SQL migration. Shall I proceed with the implementation?

