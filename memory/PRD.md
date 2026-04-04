# Terra Farming - Product Requirements Document

## Original Problem Statement
Build a full-stack farm-to-consumer marketplace platform called "Terra" — Philippines' first farm-to-table marketplace connecting consumers directly with highland farmers.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn/UI, Zustand, React Query, Recharts, Framer Motion
- **Backend**: FastAPI (Python), Motor (async MongoDB), WebSockets
- **Database**: MongoDB
- **Auth**: Supabase Authentication
- **Deployment**: Kubernetes container

## Architecture
Backend refactored into modular structure:
```
/app/backend/
  server.py          -- Main app entry, CORS, WebSocket, static files
  database.py         -- MongoDB connection
  models.py           -- All Pydantic models/enums
  websocket_manager.py -- WebSocket connection manager
  email_service.py    -- Mock email sender + notification helpers
  seed_data.py        -- Seed data for products/farms
  routes/
    products.py       -- Product CRUD
    farms.py          -- Farm CRUD
    cart.py           -- Cart management
    orders.py         -- Order CRUD + email triggers
    payments.py       -- Payment initiation/confirmation
    notifications.py  -- Push notifications
    drivers.py        -- Driver management + delivery
    reviews.py        -- Product/farm reviews
    coupons.py        -- Coupon CRUD + validation
    analytics.py      -- Revenue, top products, top farms
    admin.py          -- Admin stats + order management
    farmer.py         -- Farmer dashboard + product mgmt
    emails.py         -- Email log viewer
    uploads.py        -- Image file upload
  uploads/            -- Uploaded image files
```

## Core Features (All Implemented)

### Phase 1 — MVP (Complete)
- Product listings with search, filter, categories
- Shopping cart (Zustand + localStorage + backend sync)
- Checkout flow with delivery address form
- User authentication via Supabase

### Phase 2 — Advanced Features (Complete)
- Order History with status tracking and cancellation
- Farmer Dashboard + Farmer Management (product CRUD, orders)
- Admin Dashboard / Back Office
- Analytics Dashboard (revenue charts, top products/farms, order status)
- Map-based farm discovery
- Driver Dashboard with delivery management
- WebSocket notifications and live order tracking

### Phase 3 — Payments (Complete - MOCKED)
- GCash/Maya mock payment modals
- Cash on Delivery, Card, Bank Transfer options

### Phase 4 — Reviews, Coupons, Analytics, Emails (Complete)
- Coupon system with validation + discount in checkout
- Product reviews with star ratings + image uploads
- Email notifications (MOCKED - stored in MongoDB)
- Email triggers on: order creation, payment confirmation, status updates

### Phase 5 — Image Upload (Complete)
- Single/multi image upload endpoint (JPG, PNG, WebP, GIF, max 5MB)
- Image upload in Farmer Management product dialog
- Image upload in review submission form
- Static file serving via /api/files/{filename}

## Mocked Integrations
- **Payments**: GCash/Maya simulated (no real gateway)
- **Emails**: Mock endpoints that log to database

## What's Next (Backlog)
- P3: Real payment gateway integration (Stripe/PayMongo)
- P3: Real email service integration (SendGrid/Resend)
- P3: Loyalty points system (earn per order, redeem for discounts)
- P3: User profile management + address book
- P3: Product search with autocomplete
