# Terra Digital Platform - Product Requirements Document

## Original Problem Statement
Build a production-ready, cross-platform mobile app (iOS and Android) for the "Terra Digital Platform" - a comprehensive farm-to-market system that connects farmers directly with buyers.

## Product Overview
Terra Digital Platform is a farm-to-table marketplace connecting highland farmers in the Philippines with buyers, featuring:
- Native-quality iOS and Android mobile apps
- Multi-role system (Buyer, Farmer, Driver, Admin)
- Product listing and inventory management
- Shopping cart and checkout system
- Multiple payment options (COD, GCash, Card, Wallet)
- Token-based rewards and MLM referral system
- Real-time delivery tracking

## Tech Stack
- **Backend**: FastAPI (Python), MongoDB, JWT Auth
- **Mobile App**: React Native, TypeScript, Zustand, React Navigation
- **Web Frontend**: React, Vite, Tailwind CSS, Shadcn/UI

---

## ✅ Completed Work

### Phase 1-6: Backend Development (COMPLETE)
- [x] Database Schema Design
- [x] Auth APIs (Register, Login, Refresh, Logout)
- [x] User Management APIs (Profile, Addresses)
- [x] Product Catalog APIs (Categories, Products, CRUD)
- [x] Cart Management APIs
- [x] Order Management APIs
- [x] Payment APIs (Mocked payment provider)
- [x] Logistics & Delivery APIs
- [x] Rewards & MLM System APIs

### Phase 7: Mobile App Development (IN PROGRESS)
**Completed:**
- [x] React Native project setup
- [x] Navigation structure (Root, Buyer, Farmer, Driver navigators)
- [x] Theme and styling system
- [x] Auth screens (Login, Register, Role Selection)
- [x] Reusable components (Button, Input, ProductCard)
- [x] API service layer (auth, products, cart, orders, addresses, wallet)
- [x] State management stores (auth, cart)
- [x] **Buyer Flow Screens:**
  - [x] HomeScreen - Dashboard with categories, featured products
  - [x] BrowseScreen - Product grid view with search/filters
  - [x] ProductDetailScreen - Product details with add to cart
  - [x] CartScreen - Shopping cart management
  - [x] CheckoutScreen - Multiple payment options (COD, GCash, Card, Wallet)
  - [x] OrdersScreen - Order history with status tabs
  - [x] OrderDetailScreen - Full order details and tracking
  - [x] ProfileScreen - User profile and settings
  - [x] RewardsScreen - Points and referral system
- [x] FarmerNavigator placeholder
- [x] DriverNavigator placeholder

---

## 🔄 In Progress / Next Steps

### P1: Farmer Role UI
- [ ] Dashboard with sales overview
- [ ] Product management (Add, Edit, Delete)
- [ ] Inventory management
- [ ] Order fulfillment screens
- [ ] Earnings and payout views

### P1: Driver Role UI
- [ ] Delivery assignments view
- [ ] Route navigation
- [ ] Proof of delivery upload
- [ ] Earnings tracking

---

## 📋 Backlog

### P2 Features
- [ ] File uploads for product images, profile pictures
- [ ] Real payment gateway integration (GCash API)
- [ ] Push notifications (FCM/APNs)
- [ ] Google Maps integration for logistics

### P3 Features
- [ ] Admin Panel web frontend
- [ ] Advanced analytics dashboard
- [ ] In-app chat/messaging
- [ ] App Store & Play Store submission prep

---

## API Documentation
Complete API documentation available at: `/app/docs/API_DOCUMENTATION.md`

## Architecture Documentation
System architecture details at: `/app/docs/ARCHITECTURE.md`

## Database Schema
Full schema documentation at: `/app/docs/DATABASE_SCHEMA.md`

---

## Key Files Reference

### Backend
- `/app/backend/server.py` - Main FastAPI application
- `/app/backend/routes/` - API route handlers
- `/app/backend/services/` - Business logic
- `/app/backend/models/` - Pydantic models

### Mobile App
- `/app/mobile/src/navigation/` - Navigation setup
- `/app/mobile/src/screens/buyer/` - Buyer UI screens
- `/app/mobile/src/services/` - API services
- `/app/mobile/src/store/` - Zustand stores
- `/app/mobile/src/components/` - Reusable components
- `/app/mobile/src/theme/` - Styling and theming

### Web Frontend
- `/app/frontend/` - React Vite application

---

## Notes
- Payment gateway is currently MOCKED - needs real GCash integration
- Farmer and Driver navigators have placeholder screens
- Mobile app requires Metro bundler to run (not available in preview environment)
- All backend APIs are tested and functional

Last Updated: December 2025
