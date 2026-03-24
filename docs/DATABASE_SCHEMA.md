# Terra Digital Platform - Database Schema

## Overview
This document defines the complete MongoDB database schema for the Terra platform. All collections use UUID strings as primary identifiers (not MongoDB ObjectIDs) for easier serialization and cross-platform compatibility.

## Design Principles
- Use UUIDs as primary keys (string format)
- Timestamps: `created_at`, `updated_at` (ISO 8601)
- Soft deletes: `deleted_at` field where applicable
- Audit fields: `created_by`, `updated_by` for admin actions
- Status enums: consistent naming conventions
- No foreign key constraints (document DB), but logical references

---

## Collections

### 1. users
**Purpose**: Core user authentication and profile data

```javascript
{
  "_id": "uuid-string",
  "email": "user@example.com",           // unique, lowercase
  "phone": "+639171234567",              // E.164 format, optional
  "password_hash": "bcrypt-hash",
  "roles": ["buyer", "farmer"],          // Array of roles
  "status": "active",                    // active | suspended | deleted
  "email_verified": true,
  "phone_verified": false,
  "kyc_status": "pending",               // pending | submitted | approved | rejected
  "kyc_submitted_at": "2025-07-15T10:00:00Z",
  "kyc_approved_at": null,
  "profile": {
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "display_name": "Juan D.",
    "avatar_url": "https://cdn.terra.com/avatars/...",
    "bio": "Organic farmer from Baguio",
    "date_of_birth": "1990-05-15",
    "gender": "male"
  },
  "preferences": {
    "language": "en",
    "currency": "PHP",
    "notifications": {
      "push_enabled": true,
      "email_enabled": true,
      "sms_enabled": false
    }
  },
  "metadata": {
    "device_tokens": ["fcm-token-1", "apns-token-2"],
    "last_login_at": "2025-07-15T10:00:00Z",
    "last_login_ip": "192.168.1.1",
    "signup_source": "mobile_ios",
    "referral_code": "JUAN123"           // User's own referral code
  },
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z",
  "deleted_at": null
}

// Indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 }, { unique: true, sparse: true })
db.users.createIndex({ "metadata.referral_code": 1 }, { unique: true, sparse: true })
db.users.createIndex({ "roles": 1 })
db.users.createIndex({ "status": 1 })
db.users.createIndex({ "created_at": -1 })
```

### 2. refresh_tokens
**Purpose**: JWT refresh token management

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "token_hash": "sha256-hash",
  "device_info": {
    "platform": "ios",                   // ios | android | web
    "device_id": "device-uuid",
    "app_version": "1.0.0",
    "os_version": "iOS 17.0"
  },
  "expires_at": "2025-08-15T10:00:00Z",
  "revoked": false,
  "revoked_at": null,
  "created_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.refresh_tokens.createIndex({ "token_hash": 1 }, { unique: true })
db.refresh_tokens.createIndex({ "user_id": 1 })
db.refresh_tokens.createIndex({ "expires_at": 1 })
```

### 3. addresses
**Purpose**: User delivery/pickup addresses

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "type": "delivery",                    // delivery | pickup | billing
  "label": "Home",                       // Home | Office | Farm | Custom
  "is_default": true,
  "contact_name": "Juan Dela Cruz",
  "contact_phone": "+639171234567",
  "street_address": "123 Magsaysay Ave",
  "barangay": "Baguio",
  "city": "Baguio City",
  "province": "Benguet",
  "postal_code": "2600",
  "country": "PH",
  "coordinates": {
    "latitude": 16.4023,
    "longitude": 120.5960
  },
  "delivery_instructions": "Gate code: 1234",
  "verified": false,
  "created_at": "2025-07-15T10:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.addresses.createIndex({ "user_id": 1 })
db.addresses.createIndex({ "coordinates": "2dsphere" })
```

### 4. categories
**Purpose**: Product categories

```javascript
{
  "_id": "uuid-string",
  "name": "Vegetables",
  "slug": "vegetables",
  "parent_id": null,                     // null for root categories
  "description": "Fresh vegetables",
  "icon_url": "https://cdn.terra.com/icons/vegetables.svg",
  "image_url": "https://cdn.terra.com/categories/vegetables.jpg",
  "order": 1,                            // Display order
  "status": "active",                    // active | inactive
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.categories.createIndex({ "slug": 1 }, { unique: true })
db.categories.createIndex({ "parent_id": 1 })
db.categories.createIndex({ "status": 1, "order": 1 })
```

### 5. farmer_profiles
**Purpose**: Farmer-specific profile data

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "farm_name": "Dela Cruz Organic Farm",
  "farm_slug": "delacruz-organic-farm",
  "farm_description": "Family-owned organic farm...",
  "farm_story": "Our farm has been...",
  "farm_images": [
    "https://cdn.terra.com/farms/farm1.jpg",
    "https://cdn.terra.com/farms/farm2.jpg"
  ],
  "farm_size_hectares": 5.0,
  "farming_methods": ["organic", "sustainable"],
  "certifications": [
    {
      "name": "Organic Certification",
      "issuer": "PCC",
      "number": "CERT-12345",
      "issued_date": "2024-01-15",
      "expiry_date": "2026-01-15",
      "document_url": "https://cdn.terra.com/certs/..."
    }
  ],
  "address": {
    "street": "KM 5 Halsema Highway",
    "barangay": "Atok",
    "city": "Benguet",
    "province": "Benguet",
    "postal_code": "2611",
    "coordinates": {
      "latitude": 16.5872,
      "longitude": 120.6884
    }
  },
  "payout_info": {
    "method": "gcash",                   // gcash | bank | cash
    "gcash_number": "+639171234567",
    "bank_name": null,
    "bank_account": null,
    "bank_account_name": null
  },
  "stats": {
    "total_products": 15,
    "total_sales": 50000.00,
    "rating": 4.8,
    "total_reviews": 120
  },
  "status": "approved",                  // pending | approved | suspended
  "verified": true,
  "featured": false,
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.farmer_profiles.createIndex({ "user_id": 1 }, { unique: true })
db.farmer_profiles.createIndex({ "farm_slug": 1 }, { unique: true })
db.farmer_profiles.createIndex({ "status": 1 })
db.farmer_profiles.createIndex({ "featured": 1, "stats.rating": -1 })
db.farmer_profiles.createIndex({ "address.coordinates": "2dsphere" })
```

### 6. products
**Purpose**: Product catalog

```javascript
{
  "_id": "uuid-string",
  "farmer_id": "user-uuid",
  "category_id": "category-uuid",
  "name": "Organic Strawberries",
  "slug": "organic-strawberries-delacruz",
  "description": "Fresh organic strawberries...",
  "unit": "kg",                          // kg | pack | piece | bunch
  "base_price": 350.00,                  // PHP per unit
  "stock_quantity": 100,
  "min_order_quantity": 1,
  "max_order_quantity": 50,
  "images": [
    {
      "url": "https://cdn.terra.com/products/strawberry1.jpg",
      "order": 1,
      "is_primary": true
    },
    {
      "url": "https://cdn.terra.com/products/strawberry2.jpg",
      "order": 2,
      "is_primary": false
    }
  ],
  "attributes": {
    "weight_per_unit": "1kg",
    "harvest_method": "Hand-picked",
    "storage": "Refrigerate",
    "shelf_life": "3-5 days"
  },
  "availability": {
    "status": "in_stock",                // in_stock | out_of_stock | seasonal
    "seasonal": true,
    "available_from": "2025-01-15",
    "available_until": "2025-06-30"
  },
  "moderation": {
    "status": "approved",                // pending | approved | rejected
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2025-01-16T10:00:00Z",
    "rejection_reason": null
  },
  "featured": false,
  "tags": ["organic", "fresh", "strawberry", "baguio"],
  "stats": {
    "views": 1500,
    "orders": 120,
    "rating": 4.9,
    "reviews": 45
  },
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z",
  "deleted_at": null
}

// Indexes
db.products.createIndex({ "slug": 1 }, { unique: true })
db.products.createIndex({ "farmer_id": 1 })
db.products.createIndex({ "category_id": 1 })
db.products.createIndex({ "moderation.status": 1 })
db.products.createIndex({ "availability.status": 1 })
db.products.createIndex({ "featured": 1, "stats.rating": -1 })
db.products.createIndex({ "tags": 1 })
db.products.createIndex({ "created_at": -1 })
```

### 7. carts
**Purpose**: Shopping cart management

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 5,
      "unit_price": 350.00,              // Snapshot at add time
      "added_at": "2025-07-15T10:00:00Z"
    }
  ],
  "totals": {
    "subtotal": 1750.00,
    "items_count": 5
  },
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.carts.createIndex({ "user_id": 1 }, { unique: true })
```

### 8. orders
**Purpose**: Customer orders

```javascript
{
  "_id": "uuid-string",
  "order_number": "ORD-20250715-001",    // Human-readable order number
  "buyer_id": "user-uuid",
  "items": [
    {
      "product_id": "product-uuid",
      "farmer_id": "user-uuid",
      "product_name": "Organic Strawberries",
      "quantity": 5,
      "unit": "kg",
      "unit_price": 350.00,              // Price snapshot
      "subtotal": 1750.00
    }
  ],
  "pricing": {
    "subtotal": 1750.00,
    "platform_fee": 87.50,               // 5% configurable
    "platform_fee_rate": 0.05,
    "tax": 140.00,                       // 8% VAT configurable
    "tax_rate": 0.08,
    "logistics_fee": 150.00,
    "total": 2127.50
  },
  "delivery_address": {
    // Snapshot of address at order time
    "contact_name": "Juan Dela Cruz",
    "contact_phone": "+639171234567",
    "street_address": "123 Magsaysay Ave",
    "barangay": "Baguio",
    "city": "Baguio City",
    "province": "Benguet",
    "postal_code": "2600",
    "coordinates": {
      "latitude": 16.4023,
      "longitude": 120.5960
    }
  },
  "delivery_instructions": "Call upon arrival",
  "delivery_window": {
    "start": "2025-07-16T08:00:00Z",
    "end": "2025-07-16T12:00:00Z"
  },
  "status": "confirmed",                 // pending | confirmed | preparing | pickup_assigned | picked_up | in_transit | delivered | completed | cancelled | disputed | refunded
  "status_history": [
    {
      "status": "pending",
      "timestamp": "2025-07-15T10:00:00Z",
      "note": "Order created"
    },
    {
      "status": "confirmed",
      "timestamp": "2025-07-15T10:05:00Z",
      "note": "Payment confirmed"
    }
  ],
  "payment_id": "payment-uuid",
  "delivery_assignment_id": "assignment-uuid",
  "notes": {
    "buyer_notes": "Please handle with care",
    "admin_notes": "Priority delivery"
  },
  "metadata": {
    "source": "mobile_ios",
    "ip_address": "192.168.1.1"
  },
  "created_at": "2025-07-15T10:00:00Z",
  "updated_at": "2025-07-15T10:05:00Z",
  "cancelled_at": null,
  "completed_at": null
}

// Indexes
db.orders.createIndex({ "order_number": 1 }, { unique: true })
db.orders.createIndex({ "buyer_id": 1, "created_at": -1 })
db.orders.createIndex({ "items.farmer_id": 1 })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "created_at": -1 })
```

### 9. payments
**Purpose**: Payment transactions

```javascript
{
  "_id": "uuid-string",
  "order_id": "order-uuid",
  "user_id": "user-uuid",
  "amount": 2127.50,
  "currency": "PHP",
  "method": "gcash",                     // gcash | card | bank | cod
  "status": "completed",                 // pending | processing | completed | failed | refunded
  "provider": "gcash",
  "provider_reference": "GCASH-TXN-123456",
  "provider_response": {
    // Raw provider response
  },
  "metadata": {
    "gcash_number": "+639171234567",
    "source_type": "mobile"
  },
  "events": [
    {
      "event": "created",
      "timestamp": "2025-07-15T10:00:00Z",
      "data": {}
    },
    {
      "event": "completed",
      "timestamp": "2025-07-15T10:01:00Z",
      "data": {}
    }
  ],
  "refund_id": null,
  "created_at": "2025-07-15T10:00:00Z",
  "updated_at": "2025-07-15T10:01:00Z"
}

// Indexes
db.payments.createIndex({ "order_id": 1 })
db.payments.createIndex({ "user_id": 1 })
db.payments.createIndex({ "status": 1 })
db.payments.createIndex({ "created_at": -1 })
db.payments.createIndex({ "provider_reference": 1 })
```

### 10. refunds
**Purpose**: Refund transactions

```javascript
{
  "_id": "uuid-string",
  "payment_id": "payment-uuid",
  "order_id": "order-uuid",
  "amount": 2127.50,
  "reason": "cancelled_by_buyer",        // cancelled_by_buyer | cancelled_by_farmer | out_of_stock | quality_issue | other
  "reason_note": "Customer changed mind",
  "status": "completed",                 // pending | processing | completed | failed
  "processed_by": "admin-uuid",
  "provider_reference": "GCASH-REFUND-123",
  "created_at": "2025-07-15T11:00:00Z",
  "updated_at": "2025-07-15T11:05:00Z",
  "completed_at": "2025-07-15T11:05:00Z"
}

// Indexes
db.refunds.createIndex({ "payment_id": 1 })
db.refunds.createIndex({ "order_id": 1 })
db.refunds.createIndex({ "status": 1 })
```

### 11. payouts
**Purpose**: Farmer payouts

```javascript
{
  "_id": "uuid-string",
  "farmer_id": "user-uuid",
  "period": {
    "start": "2025-07-01T00:00:00Z",
    "end": "2025-07-15T23:59:59Z"
  },
  "orders": [
    {
      "order_id": "order-uuid",
      "order_number": "ORD-20250715-001",
      "amount": 1750.00,                 // Farmer's share
      "date": "2025-07-15T10:00:00Z"
    }
  ],
  "amount": 5250.00,                     // Total payout
  "method": "gcash",
  "destination": "+639171234567",
  "status": "pending",                   // pending | processing | completed | failed
  "processed_by": "admin-uuid",
  "provider_reference": "GCASH-PAYOUT-789",
  "notes": "Bi-weekly payout",
  "created_at": "2025-07-16T09:00:00Z",
  "updated_at": "2025-07-16T09:00:00Z",
  "completed_at": null
}

// Indexes
db.payouts.createIndex({ "farmer_id": 1, "created_at": -1 })
db.payouts.createIndex({ "status": 1 })
db.payouts.createIndex({ "period.start": 1, "period.end": 1 })
```

### 12. delivery_zones
**Purpose**: Delivery area configuration

```javascript
{
  "_id": "uuid-string",
  "name": "Baguio City",
  "slug": "baguio-city",
  "polygon": {
    "type": "Polygon",
    "coordinates": [
      [
        [120.5960, 16.4023],
        [120.6000, 16.4023],
        [120.6000, 16.4100],
        [120.5960, 16.4100],
        [120.5960, 16.4023]
      ]
    ]
  },
  "base_fee": 50.00,
  "per_km_fee": 10.00,
  "min_fee": 50.00,
  "max_fee": 300.00,
  "estimated_time_minutes": 60,
  "status": "active",
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.delivery_zones.createIndex({ "slug": 1 }, { unique: true })
db.delivery_zones.createIndex({ "polygon": "2dsphere" })
db.delivery_zones.createIndex({ "status": 1 })
```

### 13. delivery_assignments
**Purpose**: Driver delivery assignments

```javascript
{
  "_id": "uuid-string",
  "order_id": "order-uuid",
  "driver_id": "user-uuid",
  "type": "full",                        // pickup_only | delivery_only | full
  "pickup": {
    "farmer_id": "user-uuid",
    "location": {
      "name": "Dela Cruz Farm",
      "address": "KM 5 Halsema Highway",
      "coordinates": {
        "latitude": 16.5872,
        "longitude": 120.6884
      }
    },
    "scheduled_at": "2025-07-16T08:00:00Z",
    "arrived_at": null,
    "completed_at": null,
    "notes": "Call farmer before arrival"
  },
  "delivery": {
    "location": {
      "name": "Juan's Home",
      "address": "123 Magsaysay Ave",
      "coordinates": {
        "latitude": 16.4023,
        "longitude": 120.5960
      }
    },
    "scheduled_at": "2025-07-16T10:00:00Z",
    "arrived_at": null,
    "completed_at": null,
    "notes": "Call upon arrival"
  },
  "route": {
    "distance_km": 25.5,
    "estimated_duration_minutes": 45,
    "polyline": "encoded-polyline-string"
  },
  "status": "assigned",                  // assigned | en_route_pickup | picked_up | en_route_delivery | delivered | completed | cancelled
  "proof_of_pickup": {
    "photos": [],
    "signature_url": null,
    "timestamp": null,
    "notes": null
  },
  "proof_of_delivery": {
    "photos": ["https://cdn.terra.com/pod/photo1.jpg"],
    "signature_url": "https://cdn.terra.com/pod/sig.png",
    "timestamp": "2025-07-16T10:30:00Z",
    "notes": "Delivered to recipient",
    "recipient_name": "Juan Dela Cruz"
  },
  "driver_earnings": 150.00,             // From logistics_fee
  "assigned_at": "2025-07-15T10:10:00Z",
  "completed_at": null,
  "created_at": "2025-07-15T10:10:00Z",
  "updated_at": "2025-07-15T10:10:00Z"
}

// Indexes
db.delivery_assignments.createIndex({ "order_id": 1 })
db.delivery_assignments.createIndex({ "driver_id": 1, "status": 1 })
db.delivery_assignments.createIndex({ "status": 1 })
db.delivery_assignments.createIndex({ "pickup.scheduled_at": 1 })
db.delivery_assignments.createIndex({ "delivery.scheduled_at": 1 })
```

### 14. driver_profiles
**Purpose**: Driver-specific data

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "vehicle": {
    "type": "motorcycle",                // motorcycle | tricycle | van | truck
    "make": "Honda",
    "model": "TMX 155",
    "year": 2022,
    "plate_number": "ABC-1234",
    "color": "Red"
  },
  "license": {
    "number": "N01-12-345678",
    "expiry_date": "2027-05-15",
    "photo_url": "https://cdn.terra.com/licenses/..."
  },
  "status": "active",                    // active | inactive | suspended
  "verified": true,
  "availability": {
    "is_available": true,
    "last_updated": "2025-07-15T10:00:00Z"
  },
  "stats": {
    "total_deliveries": 250,
    "completed_deliveries": 245,
    "cancelled_deliveries": 5,
    "rating": 4.9,
    "total_reviews": 180
  },
  "payout_info": {
    "method": "gcash",
    "gcash_number": "+639171234567"
  },
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.driver_profiles.createIndex({ "user_id": 1 }, { unique: true })
db.driver_profiles.createIndex({ "status": 1 })
db.driver_profiles.createIndex({ "availability.is_available": 1 })
```

### 15. token_ledger
**Purpose**: Token/rewards accounting

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "type": "credit",                      // credit | debit
  "amount": 100.00,
  "balance_after": 1500.00,
  "reason": "order_reward",              // order_reward | referral_bonus | admin_adjustment | redemption
  "reference_id": "order-uuid",          // Related entity ID
  "reference_type": "order",             // order | referral | adjustment
  "description": "Reward for order ORD-20250715-001",
  "metadata": {
    "order_number": "ORD-20250715-001",
    "order_amount": 2127.50
  },
  "admin_adjusted_by": null,             // admin-uuid if manual
  "admin_note": null,
  "created_at": "2025-07-15T10:30:00Z"
}

// Indexes
db.token_ledger.createIndex({ "user_id": 1, "created_at": -1 })
db.token_ledger.createIndex({ "reference_id": 1 })
db.token_ledger.createIndex({ "created_at": -1 })
```

### 16. referrals
**Purpose**: Referral tracking

```javascript
{
  "_id": "uuid-string",
  "referrer_id": "user-uuid",            // User who referred
  "referee_id": "user-uuid",             // User who was referred
  "referral_code": "JUAN123",
  "status": "active",                    // pending | active | inactive
  "first_order_at": "2025-07-20T10:00:00Z",
  "total_orders": 5,
  "total_volume": 10000.00,              // Total purchase value
  "created_at": "2025-07-15T08:00:00Z"
}

// Indexes
db.referrals.createIndex({ "referrer_id": 1 })
db.referrals.createIndex({ "referee_id": 1 }, { unique: true })
db.referrals.createIndex({ "referral_code": 1 })
```

### 17. binary_tree
**Purpose**: MLM binary tree structure

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "parent_id": "user-uuid",
  "sponsor_id": "user-uuid",             // Who recruited them
  "position": "left",                    // left | right
  "left_child_id": "user-uuid",
  "right_child_id": "user-uuid",
  "level": 3,                            // Distance from root
  "path": "/root-id/parent-id/user-id", // For genealogy queries
  "created_at": "2025-07-15T08:00:00Z"
}

// Indexes
db.binary_tree.createIndex({ "user_id": 1 }, { unique: true })
db.binary_tree.createIndex({ "parent_id": 1 })
db.binary_tree.createIndex({ "sponsor_id": 1 })
db.binary_tree.createIndex({ "path": 1 })
```

### 18. business_volume
**Purpose**: Track sales volume for commission calculations

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "period": "2025-07",                   // YYYY-MM format
  "left_volume": 25000.00,
  "right_volume": 18000.00,
  "personal_volume": 5000.00,
  "carry_forward_left": 5000.00,
  "carry_forward_right": 2000.00,
  "created_at": "2025-07-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.business_volume.createIndex({ "user_id": 1, "period": 1 }, { unique: true })
db.business_volume.createIndex({ "period": 1 })
```

### 19. commission_runs
**Purpose**: Commission calculation batch runs

```javascript
{
  "_id": "uuid-string",
  "period": {
    "start": "2025-07-01T00:00:00Z",
    "end": "2025-07-15T23:59:59Z"
  },
  "run_type": "bi_weekly",               // daily | weekly | bi_weekly | monthly
  "status": "completed",                 // pending | processing | completed | failed
  "stats": {
    "total_members": 1500,
    "total_commissions": 250000.00,
    "total_pairs": 3200
  },
  "started_at": "2025-07-16T01:00:00Z",
  "completed_at": "2025-07-16T01:15:00Z",
  "created_at": "2025-07-16T01:00:00Z"
}

// Indexes
db.commission_runs.createIndex({ "period.start": 1, "period.end": 1 })
db.commission_runs.createIndex({ "status": 1 })
```

### 20. commission_lines
**Purpose**: Individual commission entries

```javascript
{
  "_id": "uuid-string",
  "run_id": "run-uuid",
  "user_id": "user-uuid",
  "type": "pairing_bonus",               // direct_bonus | pairing_bonus | matching_bonus | rank_bonus
  "amount": 500.00,
  "calculation": {
    "left_volume": 10000.00,
    "right_volume": 8000.00,
    "paired_volume": 8000.00,
    "rate": 0.10,
    "cap": 10000.00
  },
  "status": "approved",                  // pending | approved | paid
  "paid_at": null,
  "created_at": "2025-07-16T01:10:00Z"
}

// Indexes
db.commission_lines.createIndex({ "run_id": 1 })
db.commission_lines.createIndex({ "user_id": 1, "created_at": -1 })
db.commission_lines.createIndex({ "status": 1 })
```

### 21. ranks
**Purpose**: MLM rank definitions

```javascript
{
  "_id": "uuid-string",
  "name": "Bronze",
  "slug": "bronze",
  "level": 1,
  "requirements": {
    "personal_volume": 10000.00,
    "left_volume": 25000.00,
    "right_volume": 25000.00,
    "direct_referrals": 2
  },
  "benefits": {
    "commission_rate": 0.10,
    "matching_levels": 1,
    "rank_bonus": 1000.00
  },
  "icon_url": "https://cdn.terra.com/ranks/bronze.png",
  "created_at": "2025-01-15T08:00:00Z"
}

// Indexes
db.ranks.createIndex({ "slug": 1 }, { unique: true })
db.ranks.createIndex({ "level": 1 })
```

### 22. user_ranks
**Purpose**: User rank history

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "rank_id": "rank-uuid",
  "rank_name": "Bronze",
  "achieved_at": "2025-07-15T10:00:00Z",
  "is_current": true,
  "created_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.user_ranks.createIndex({ "user_id": 1, "is_current": 1 })
db.user_ranks.createIndex({ "rank_id": 1 })
```

### 23. support_tickets
**Purpose**: Customer support tickets

```javascript
{
  "_id": "uuid-string",
  "ticket_number": "TICKET-20250715-001",
  "user_id": "user-uuid",
  "type": "order_issue",                 // order_issue | product_quality | payment | delivery | account | other
  "subject": "Late delivery",
  "description": "My order is delayed...",
  "status": "open",                      // open | in_progress | resolved | closed
  "priority": "medium",                  // low | medium | high | urgent
  "assigned_to": "admin-uuid",
  "related_order_id": "order-uuid",
  "attachments": [
    "https://cdn.terra.com/tickets/photo1.jpg"
  ],
  "created_at": "2025-07-15T10:00:00Z",
  "updated_at": "2025-07-15T11:00:00Z",
  "resolved_at": null,
  "closed_at": null
}

// Indexes
db.support_tickets.createIndex({ "ticket_number": 1 }, { unique: true })
db.support_tickets.createIndex({ "user_id": 1, "created_at": -1 })
db.support_tickets.createIndex({ "status": 1 })
db.support_tickets.createIndex({ "assigned_to": 1 })
```

### 24. ticket_messages
**Purpose**: Ticket conversation thread

```javascript
{
  "_id": "uuid-string",
  "ticket_id": "ticket-uuid",
  "sender_id": "user-uuid",
  "sender_type": "user",                 // user | admin
  "message": "The driver called and said...",
  "attachments": [],
  "is_internal": false,                  // Internal admin notes
  "created_at": "2025-07-15T11:00:00Z"
}

// Indexes
db.ticket_messages.createIndex({ "ticket_id": 1, "created_at": 1 })
```

### 25. disputes
**Purpose**: Order disputes

```javascript
{
  "_id": "uuid-string",
  "order_id": "order-uuid",
  "raised_by": "user-uuid",
  "reason": "product_quality",           // product_quality | wrong_item | missing_items | damaged | not_delivered | other
  "description": "Product was spoiled",
  "evidence": [
    "https://cdn.terra.com/disputes/photo1.jpg"
  ],
  "status": "pending",                   // pending | investigating | resolved | rejected
  "resolution": null,
  "resolved_by": "admin-uuid",
  "refund_amount": null,
  "created_at": "2025-07-15T10:00:00Z",
  "resolved_at": null
}

// Indexes
db.disputes.createIndex({ "order_id": 1 })
db.disputes.createIndex({ "raised_by": 1 })
db.disputes.createIndex({ "status": 1 })
```

### 26. notifications
**Purpose**: In-app notifications

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "type": "order_update",                // order_update | payment | delivery | reward | commission | support | announcement
  "title": "Order Confirmed",
  "message": "Your order ORD-20250715-001 has been confirmed",
  "data": {
    "order_id": "order-uuid",
    "order_number": "ORD-20250715-001"
  },
  "read": false,
  "read_at": null,
  "action_url": "/orders/order-uuid",
  "created_at": "2025-07-15T10:05:00Z"
}

// Indexes
db.notifications.createIndex({ "user_id": 1, "read": 1, "created_at": -1 })
db.notifications.createIndex({ "created_at": -1 })
```

### 27. system_config
**Purpose**: System-wide configuration

```javascript
{
  "_id": "uuid-string",
  "key": "platform_fee_rate",
  "value": 0.05,
  "type": "float",                       // string | int | float | boolean | json
  "description": "Platform fee percentage (5%)",
  "category": "pricing",
  "editable": true,
  "updated_by": "admin-uuid",
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.system_config.createIndex({ "key": 1 }, { unique: true })
db.system_config.createIndex({ "category": 1 })
```

### 28. audit_logs
**Purpose**: Admin action audit trail

```javascript
{
  "_id": "uuid-string",
  "admin_id": "user-uuid",
  "action": "update_product_status",
  "resource_type": "product",
  "resource_id": "product-uuid",
  "before": {
    "moderation.status": "pending"
  },
  "after": {
    "moderation.status": "approved"
  },
  "reason": "Product meets quality standards",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2025-07-15T10:00:00Z"
}

// Indexes
db.audit_logs.createIndex({ "admin_id": 1, "created_at": -1 })
db.audit_logs.createIndex({ "resource_type": 1, "resource_id": 1 })
db.audit_logs.createIndex({ "created_at": -1 })
```

### 29. kyc_submissions
**Purpose**: KYC verification submissions

```javascript
{
  "_id": "uuid-string",
  "user_id": "user-uuid",
  "submission_type": "individual",       // individual | business
  "documents": {
    "id_type": "drivers_license",        // drivers_license | passport | national_id
    "id_number": "N01-12-345678",
    "id_front_url": "https://cdn.terra.com/kyc/id-front.jpg",
    "id_back_url": "https://cdn.terra.com/kyc/id-back.jpg",
    "selfie_url": "https://cdn.terra.com/kyc/selfie.jpg",
    "address_proof_url": "https://cdn.terra.com/kyc/utility-bill.jpg"
  },
  "personal_info": {
    "full_name": "Juan Dela Cruz",
    "date_of_birth": "1990-05-15",
    "nationality": "Filipino",
    "address": "123 Magsaysay Ave, Baguio City"
  },
  "status": "pending",                   // pending | approved | rejected | resubmit_required
  "reviewed_by": "admin-uuid",
  "reviewed_at": null,
  "rejection_reason": null,
  "created_at": "2025-07-15T08:00:00Z",
  "updated_at": "2025-07-15T08:00:00Z"
}

// Indexes
db.kyc_submissions.createIndex({ "user_id": 1 })
db.kyc_submissions.createIndex({ "status": 1 })
```

---

## Schema Summary

### Total Collections: 29

1. users
2. refresh_tokens
3. addresses
4. categories
5. farmer_profiles
6. products
7. carts
8. orders
9. payments
10. refunds
11. payouts
12. delivery_zones
13. delivery_assignments
14. driver_profiles
15. token_ledger
16. referrals
17. binary_tree
18. business_volume
19. commission_runs
20. commission_lines
21. ranks
22. user_ranks
23. support_tickets
24. ticket_messages
25. disputes
26. notifications
27. system_config
28. audit_logs
29. kyc_submissions

---

## Configuration Data (Seed Data)

### System Config Keys
```javascript
// Pricing
platform_fee_rate: 0.05 (5%)
tax_rate: 0.08 (8% VAT)
logistics_base_fee: 50.00
logistics_per_km_fee: 10.00

// Rewards
reward_per_order_rate: 0.01 (1% of order)
referral_bonus_first_order: 100.00
referral_bonus_ongoing_rate: 0.005 (0.5%)

// MLM
mlm_enabled: true
pairing_bonus_rate: 0.10 (10%)
pairing_bonus_cap_daily: 10000.00
matching_levels: 3
direct_bonus_rate: 0.05 (5%)

// Payments
gcash_enabled: true
card_payment_enabled: false
cod_enabled: false
```

### Default Ranks
```javascript
[
  { name: "Bronze", level: 1, personal_volume: 10000, commission_rate: 0.10 },
  { name: "Silver", level: 2, personal_volume: 25000, commission_rate: 0.12 },
  { name: "Gold", level: 3, personal_volume: 50000, commission_rate: 0.15 },
  { name: "Platinum", level: 4, personal_volume: 100000, commission_rate: 0.18 },
  { name: "Diamond", level: 5, personal_volume: 250000, commission_rate: 0.20 }
]
```

---

## Migration Strategy

Since MongoDB is schema-less, we don't need formal migrations, but:

1. **Document versions**: Add `_schema_version` field for major changes
2. **Backward compatibility**: Always add new fields, rarely remove
3. **Data scripts**: Create Python scripts for data transformations
4. **Validation**: Use Pydantic models for runtime validation

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-XX  
**Status**: Schema Approved
