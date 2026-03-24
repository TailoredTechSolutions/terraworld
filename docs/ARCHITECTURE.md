# Terra Digital Platform - System Architecture

## Overview
Terra is a production-ready farm-to-market digital platform connecting farmers directly with buyers, featuring transparent pricing, delivery management, and configurable rewards/referral systems.

## Architecture Style
**Modular Monolith with Service-Oriented Design**
- Clear domain boundaries
- Easy to scale horizontally
- Can be split into microservices if needed
- Shared database with logical separation

## Technology Stack

### Mobile Applications
- **Framework**: React Native 0.73+
- **State Management**: Zustand + React Query
- **Navigation**: React Navigation 6
- **UI Components**: Custom component library + React Native Paper
- **Maps**: React Native Maps (Google Maps / Apple Maps)
- **Push Notifications**: React Native Firebase (FCM + APNs)
- **Local Storage**: AsyncStorage + MMKV
- **Image Handling**: React Native Fast Image
- **Camera**: React Native Camera / Image Picker
- **Payment**: Platform-specific SDKs (GCash, Stripe)

### Backend
- **Runtime**: Python 3.11+
- **Framework**: FastAPI 0.110+
- **Database**: MongoDB 6.0+ (Motor async driver)
- **Caching**: Redis 7+
- **Queue**: Redis Queue (RQ) or Celery
- **Authentication**: JWT + Refresh Tokens
- **File Storage**: S3-compatible (AWS S3 / MinIO)
- **API Documentation**: OpenAPI 3.0 (auto-generated)

### Admin Web Interface
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Tables**: TanStack Table

### Infrastructure
- **Deployment**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Structured logging + error tracking
- **Analytics**: Event streaming architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   iOS App    │  │ Android App  │  │  Admin Web   │    │
│  │ React Native │  │ React Native │  │   React +    │    │
│  │              │  │              │  │  Tailwind    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   /api prefix   │
                    └────────┬────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                    BACKEND LAYER                            │
├────────────────────────────┼────────────────────────────────┤
│                            │                                │
│  ┌─────────────────────────▼──────────────────────────┐   │
│  │            FastAPI Application                      │   │
│  │                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │   │
│  │  │   Auth   │ │  Users   │ │ Products │ │Orders │ │   │
│  │  │  Module  │ │  Module  │ │  Module  │ │Module │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────┘ │   │
│  │                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │   │
│  │  │ Payment  │ │Logistics │ │ Rewards  │ │  MLM  │ │   │
│  │  │  Module  │ │  Module  │ │  Module  │ │Module │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────┘ │   │
│  │                                                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │ Support  │ │  Admin   │ │ Reports  │           │   │
│  │  │  Module  │ │  Module  │ │  Module  │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘           │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                     DATA LAYER                              │
├────────────────────────────┼────────────────────────────────┤
│                            │                                │
│  ┌────────────┐   ┌───────▼────────┐   ┌──────────────┐  │
│  │   Redis    │   │    MongoDB     │   │  S3 Storage  │  │
│  │   Cache    │   │   Database     │   │    Files     │  │
│  │   Queue    │   │                │   │   Images     │  │
│  └────────────┘   └────────────────┘   └──────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                          │
├────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ GCash   │ │  Maps   │ │   FCM   │ │   SMS   │        │
│  │ Payment │ │   API   │ │  Push   │ │  Email  │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
└────────────────────────────────────────────────────────────┘
```

## Domain Modules

### 1. Authentication & Authorization Module
**Responsibilities:**
- User registration (email/phone)
- Login (password, OTP, social)
- JWT token generation & validation
- Refresh token rotation
- Password reset flow
- Session management
- 2FA (optional)

**Key Entities:**
- Users
- Sessions
- RefreshTokens
- PasswordResets

### 2. User Management Module
**Responsibilities:**
- User profiles (Buyer, Farmer, Driver, Admin)
- Role assignment
- KYC verification workflow
- Address management
- Profile updates
- Account deletion

**Key Entities:**
- Users
- UserProfiles
- FarmerProfiles
- BuyerProfiles
- DriverProfiles
- Addresses
- KYCSubmissions

### 3. Marketplace Module
**Responsibilities:**
- Product catalog
- Categories & subcategories
- Product search & filtering
- Product listing (farmers)
- Inventory management
- Product moderation
- Featured products
- Product reviews (future)

**Key Entities:**
- Products
- Categories
- ProductImages
- Inventory
- FarmProfiles

### 4. Order Management Module
**Responsibilities:**
- Shopping cart
- Checkout process
- Order creation
- Order state management
- Price calculation engine
- Order history
- Order tracking
- Cancellations

**Key Entities:**
- Carts
- CartItems
- Orders
- OrderItems
- OrderTimeline
- PricingBreakdown

### 5. Payment Module
**Responsibilities:**
- Payment method management
- Payment processing (GCash, cards, etc.)
- Payment status tracking
- Refund processing
- Payment reconciliation
- Transaction history
- Payout management (farmers)

**Key Entities:**
- Payments
- PaymentMethods
- PaymentEvents
- Refunds
- Payouts
- PayoutSchedules
- WalletLedger

### 6. Logistics & Delivery Module
**Responsibilities:**
- Delivery zone management
- Route optimization
- Driver assignment
- Pickup & delivery tracking
- Proof of delivery
- Delivery fee calculation
- Real-time location tracking

**Key Entities:**
- DeliveryZones
- DeliveryAssignments
- Routes
- DeliveryEvents
- ProofOfDelivery
- LocationHistory

### 7. Rewards Module
**Responsibilities:**
- Token/points accounting
- Reward issuance rules
- Reward history
- Reward redemption (if enabled)
- Admin adjustments
- Audit trail

**Key Entities:**
- TokenLedger
- RewardRules
- RewardEvents
- RewardAdjustments

### 8. MLM / Referral Module
**Responsibilities:**
- Referral tracking
- Binary tree management
- Business volume calculation
- Commission calculation engine
- Matching bonus logic
- Rank management
- Genealogy queries
- Commission payouts

**Key Entities:**
- Referrals
- BinaryTree
- BusinessVolume
- CommissionRuns
- CommissionLines
- Ranks
- RankHistory

### 9. Support & Disputes Module
**Responsibilities:**
- Support ticket creation
- Ticket assignment
- Ticket thread/messaging
- Dispute management
- Refund requests
- Issue escalation

**Key Entities:**
- SupportTickets
- TicketMessages
- Disputes
- RefundRequests

### 10. Admin & Back Office Module
**Responsibilities:**
- User management dashboard
- Product moderation
- Order monitoring
- Payment reconciliation
- Payout processing
- System configuration
- Audit logs
- Analytics & reporting

**Key Entities:**
- AdminUsers
- AuditLogs
- SystemConfig
- Reports

### 11. Notification Module
**Responsibilities:**
- Push notification delivery
- In-app notifications
- Email notifications (future)
- SMS notifications (future)
- Notification preferences

**Key Entities:**
- Notifications
- NotificationPreferences
- PushTokens

## Data Flow Examples

### Order Creation Flow
```
1. User adds items to cart
2. User proceeds to checkout
3. System validates inventory
4. System calculates pricing:
   - Product base price (farmer)
   - Platform fee
   - Tax/VAT
   - Logistics fee
5. User selects payment method
6. Payment processed
7. Order created (status: pending)
8. Inventory reserved
9. Farmer notified
10. Order confirmed (status: confirmed)
11. Driver assignment
12. Delivery tracking begins
```

### MLM Commission Calculation Flow
```
1. Order completed & paid
2. Business volume calculated
3. Volume propagated up binary tree
4. Pairing check (left + right legs)
5. Commission calculation:
   - Direct bonus
   - Matching bonus
   - Rank bonus
6. Caps & limits applied
7. Commission ledger entry
8. Member notified
9. Next payout schedule
```

## Security Architecture

### Authentication Flow
- JWT access tokens (15 min expiry)
- Refresh tokens (30 days, rotating)
- HttpOnly cookies for web
- Secure storage for mobile

### Authorization
- Role-Based Access Control (RBAC)
- Permission matrix per role
- Resource-level permissions

### Data Security
- Passwords: bcrypt hashing
- PII: encryption at rest
- API: HTTPS only
- File uploads: validation & scanning
- Rate limiting on all endpoints

### Audit Trail
- All financial transactions logged
- Admin actions logged
- Before/after state capture
- No hard deletes on financial records

## Performance Considerations

### Database Indexes
- User email, phone (unique)
- Product category, status
- Order user_id, status, created_at
- Payment order_id, status
- Referral codes (unique)
- Binary tree left/right pointers

### Caching Strategy
- User sessions: Redis
- Product catalog: Redis (5 min TTL)
- Category list: Redis (1 hour TTL)
- Config values: Redis
- Genealogy queries: cached

### Background Jobs
- Commission calculations (nightly)
- Payout processing (scheduled)
- Email/SMS sending (queued)
- Analytics aggregation (hourly)
- Report generation (on-demand)

## Scalability Plan

### Horizontal Scaling
- Stateless API servers
- Load balancer (Kubernetes ingress)
- Database read replicas
- Redis cluster
- CDN for static assets

### Vertical Scaling
- Database: MongoDB sharding
- Separate read/write endpoints
- Archive old data

## Monitoring & Observability

### Metrics
- API response times
- Error rates
- Order conversion funnel
- Payment success rate
- User activity

### Logging
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Request IDs for tracing
- Sensitive data redaction

### Alerts
- High error rate
- Payment failures
- Database connection issues
- Queue backlog

## Compliance & Store Readiness

### App Store Requirements
- Privacy policy accessible
- Account deletion flow
- Permission explanations
- No deceptive practices
- Real utility (not just recruitment)
- Native-quality UX

### Data Privacy
- GDPR-ready data export
- Right to deletion
- Consent management
- Data retention policies

### MLM Compliance
- Legitimate product sales
- No income guarantees
- Clear terms & conditions
- Transparent compensation plan
- Configurable by jurisdiction

## Deployment Architecture

### Environments
- **Development**: Local Docker Compose
- **Staging**: Kubernetes cluster (preview)
- **Production**: Kubernetes cluster (HA)

### CI/CD Pipeline
1. Code push to GitHub
2. Automated tests run
3. Docker images built
4. Deploy to staging
5. Smoke tests
6. Manual approval
7. Deploy to production
8. Health checks

### Database Migrations
- Alembic for schema changes
- Backward-compatible migrations
- Rollback capability

## API Design Principles

- RESTful conventions
- Consistent naming (snake_case)
- Pagination for lists
- Proper HTTP status codes
- Error responses with codes
- API versioning (/api/v1)
- OpenAPI documentation
- Rate limiting headers

## Mobile App Architecture

### Navigation Structure
```
App Root
├── Auth Stack (not logged in)
│   ├── Login
│   ├── Register
│   └── Role Selection
│
├── Buyer Stack
│   ├── Home (Featured Products)
│   ├── Browse (Category/Search)
│   ├── Product Detail
│   ├── Cart
│   ├── Checkout
│   ├── Orders
│   ├── Rewards
│   └── Profile
│
├── Farmer Stack
│   ├── Dashboard
│   ├── My Products
│   ├── Add/Edit Product
│   ├── Orders
│   ├── Earnings
│   ├── Rewards
│   └── Profile
│
├── Driver Stack
│   ├── Jobs
│   ├── Route Map
│   ├── Delivery Detail
│   ├── History
│   └── Profile
│
└── Member/Affiliate Stack
    ├── Dashboard
    ├── Referrals
    ├── Genealogy
    ├── Commissions
    └── Profile
```

### State Management
- **Local State**: useState for component-level
- **Global State**: Zustand for app-wide (cart, auth)
- **Server State**: React Query for API data
- **Persistent**: AsyncStorage for tokens, prefs

### Offline Support
- Cart cached locally
- Order history cached
- Optimistic UI updates
- Queue failed requests
- Sync when online

## File Structure

### Backend
```
/app/backend
├── server.py                 # FastAPI app entry
├── requirements.txt
├── .env
├── models/                   # Pydantic models
│   ├── __init__.py
│   ├── user.py
│   ├── product.py
│   ├── order.py
│   └── ...
├── routes/                   # API endpoints
│   ├── __init__.py
│   ├── auth.py
│   ├── users.py
│   ├── products.py
│   ├── orders.py
│   └── ...
├── services/                 # Business logic
│   ├── __init__.py
│   ├── auth_service.py
│   ├── order_service.py
│   ├── pricing_service.py
│   ├── commission_service.py
│   └── ...
├── middleware/               # Auth, logging, etc.
├── utils/                    # Helpers
├── config/                   # Configuration
└── tests/                    # Backend tests
```

### Mobile App
```
/app/mobile
├── package.json
├── App.tsx
├── app.json
├── index.js
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/              # Screen components
│   │   ├── auth/
│   │   ├── buyer/
│   │   ├── farmer/
│   │   ├── driver/
│   │   └── member/
│   ├── navigation/           # Navigation config
│   ├── services/             # API clients
│   ├── store/                # Zustand stores
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Helpers
│   ├── constants/            # Constants
│   ├── types/                # TypeScript types
│   └── theme/                # Design tokens
├── ios/                      # iOS native code
└── android/                  # Android native code
```

## Next Steps

This architecture document serves as the blueprint. The implementation will proceed in phases:

1. ✅ Architecture defined
2. ⏭️ Database schema design
3. ⏭️ Core backend APIs
4. ⏭️ Mobile app foundation
5. ⏭️ Feature implementation
6. ⏭️ Testing & compliance
7. ⏭️ Submission readiness

---
**Document Version**: 1.0  
**Last Updated**: 2025-07-XX  
**Status**: Architecture Approved
