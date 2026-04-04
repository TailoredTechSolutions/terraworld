# Terra Farming - Product Requirements Document

## Original Problem Statement
Build a full-stack farm-to-consumer marketplace platform called "Terra" — Philippines' first farm-to-table marketplace connecting consumers directly with highland farmers.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn/UI, Zustand, React Query, Recharts, Framer Motion
- **Backend**: FastAPI (Python), Motor (async MongoDB), WebSockets
- **Database**: MongoDB
- **Auth**: Supabase Authentication
- **Deployment**: Kubernetes container

## Core Features (All Implemented)

### Phase 1 — MVP (Complete)
- Product listings with search, filter, categories
- Shopping cart (Zustand + localStorage + backend sync)
- Checkout flow with delivery address form
- User authentication via Supabase

### Phase 2 — Advanced Features (Complete)
- Order History with status tracking and cancellation
- Farmer Dashboard (stats, products, orders)
- Admin Dashboard / Back Office
- Map-based farm discovery (MapPage)
- Driver Dashboard with delivery management
- WebSocket notifications and live tracking

### Phase 3 — Payments (Complete - MOCKED)
- GCash mock payment modal
- Maya mock payment modal
- Cash on Delivery, Card, Bank Transfer options

### Phase 4 — Reviews, Coupons, Analytics, Emails (Complete)
- **Coupon System**: Backend CRUD + validation. Frontend coupon input in Checkout with real-time discount calculation. Seeded codes: WELCOME10, SAVE50, FREEDELIVERY
- **Product Reviews**: Backend create/read with rating aggregation. Frontend review display + submission form on Product Detail page
- **Analytics Dashboard**: Revenue charts, top products/farms, order status distribution at /analytics
- **Farmer Management**: Full product CRUD, order view at /farmer/manage
- **Live Order Tracking**: Step-by-step order progress with WebSocket driver location at /tracking/:orderId
- **Email Notifications**: Backend mock endpoints for order confirmation, status updates

## Key Routes
| Route | Page | Access |
|-------|------|--------|
| / | Landing page | Public |
| /shop | Product listings | Public |
| /product/:id | Product detail + reviews | Public |
| /map | Farm map discovery | Public |
| /checkout | Cart checkout + coupon input | Public |
| /orders | Order history + track links | Auth |
| /tracking/:orderId | Live order tracking | Auth |
| /farmer/manage | Farmer product management | Public (demo) |
| /analytics | Analytics dashboard | Public (admin) |
| /admin | Admin back office | Admin role |
| /driver-portal | Driver dashboard | Auth |

## Mocked Integrations
- **Payments**: GCash/Maya are simulated (no real payment gateway)
- **Email**: Mock endpoints that log emails to database

## Database Collections
- users, products, farms, orders, coupons, reviews, emails, drivers, deliveries, notifications, categories, cart, payments

## API Endpoints (Key)
- Products: GET/POST /api/products, GET /api/products/:id
- Farms: GET /api/farms, GET /api/farms/:id
- Orders: POST /api/orders, GET /api/orders/:userId
- Payments: POST /api/payments/initiate, POST /api/payments/:id/confirm
- Reviews: POST /api/reviews, GET /api/reviews/product/:id
- Coupons: GET /api/coupons, POST /api/coupons/validate
- Analytics: GET /api/analytics/overview, /revenue-chart, /top-products, /top-farms
- Farmer: GET /api/farmer/:farmId/stats, /products, /orders

## What's Next (Backlog)
- P2: Verify email notification logic triggers proper UI feedback
- P3: Split server.py (~2000 lines) into modular FastAPI routers
- P3: Real payment gateway integration (Stripe/PayMongo)
- P3: Real email service integration (SendGrid/Resend)
- P3: Image upload for products and reviews
