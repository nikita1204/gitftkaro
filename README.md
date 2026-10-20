# GIFT KRO — Production Architecture (Next.js App Router + Express + MongoDB)

> **Business USP**: 24-Hour Custom T-shirt Printing in selected areas of Raipur, Chhattisgarh.  
> **Minimum Order Quantity (MOQ)**: 10 Pieces.  
> **Initial Products**: Customized T-shirts, Event T-shirts, Group T-shirts, Corporate T-shirts.  
> **Future Scalability**: Caps, Hoodies, Gift Hampers, Personalized Jewellery, 3D Crystal Statues, Hologram Gifts.

---

## 1. Project Overview & Architecture

GIFT KRO is engineered using a scalable monorepo structure with decoupled frontend (Next.js App Router) and backend (Express.js REST API) applications:

```text
c:/giftkaro/
├── client/                     # Next.js 14 App Router Frontend Application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── app/                # Next.js App Router Directory
│   │   │   ├── globals.css     # Global Tailwind directives & glassmorphism utilities
│   │   │   ├── layout.jsx      # Server root layout with Google Font (Inter) & Redux provider
│   │   │   ├── loading.jsx     # Streaming suspense loading skeleton
│   │   │   ├── not-found.jsx   # Custom 404 page with navigation
│   │   │   ├── page.jsx        # Landing page with USP, launch products & live probe
│   │   │   └── providers.jsx   # Client-side Redux Provider wrapper ('use client')
│   │   ├── assets/             # Brand logos and static icons
│   │   ├── components/         # Reusable UI components & layouts
│   │   │   ├── layout/         # Header, MobileNav, AnnouncementBar, Footer
│   │   │   ├── modals/         # Interactive QuoteModal dialog
│   │   │   ├── ui/             # Design System: Button, Input, Loader, Modal, Badge, EmptyState, ErrorState
│   │   │   └── health/         # HealthDashboard telemetry probe
│   │   ├── constants/          # Brand constants, launch products, roadmap categories
│   │   ├── features/           # Feature-sliced domains (ready for Step 4+)
│   │   ├── hooks/              # Custom React hooks (useRedux, useHealthCheck)
│   │   ├── redux/              # Redux store and slices (uiSlice, healthSlice)
│   │   ├── services/           # Axios HTTP client and API services
│   │   ├── utils/              # Formatting and helper utilities
│   │   └── validations/        # Zod environment validation for NEXT_PUBLIC_ variables
│   ├── .env                    # Local client environment variables (NEXT_PUBLIC_*)
│   ├── .env.example            # Client env template
│   ├── .eslintrc.json          # Next.js Core Web Vitals ESLint configuration
│   ├── jsconfig.json           # Path alias configuration (@/* -> ./src/*)
│   ├── next.config.mjs         # Next.js production configuration
│   ├── package.json            # Next.js dependencies & scripts
│   ├── postcss.config.js       # PostCSS config for Tailwind
│   └── tailwind.config.js      # Tailwind design system configuration
│
├── server/                     # Express.js REST API & Node.js Engine
│   ├── src/
│   │   ├── config/             # DB resilience connection & Zod env loader
│   │   ├── constants/          # HTTP status codes & response messages
│   │   ├── middleware/         # Error handler, rate limiter, notFound, validator
│   │   ├── modules/            # Modular feature domains (health module)
│   │   │   └── health/         # Controller, service, routes for /api/health
│   │   ├── routes/             # Master router registering API versioning
│   │   ├── utils/              # Logger and unified ApiResponse wrapper
│   │   ├── validators/         # Common Zod validation schemas
│   │   ├── app.js              # Express app definition & CORS policy
│   │   └── server.js           # Server lifecycle & graceful shutdown
│   ├── .env                    # Local server environment variables
│   ├── .env.example            # Server env template
│   ├── eslint.config.js        # Backend ESLint 9 configuration
│   └── package.json            # Server dependencies & scripts
│
├── .gitignore                  # Git ignore rules for dependencies, env, .next, dist
├── .prettierignore             # Prettier ignore file
├── .prettierrc                 # Code formatting standards
├── package.json                # Root orchestration scripts (concurrently)
└── README.md                   # Complete architectural documentation
```

---

## 2. Technology Stack & Installed Dependencies

### Client (`/client`)

| Dependency            | Version    | Purpose                                                                                    |
| :-------------------- | :--------- | :----------------------------------------------------------------------------------------- |
| `next`                | `^14.2.24` | Next.js App Router framework providing SSR, SSG, image/font optimization, and fast routing |
| `react` & `react-dom` | `^18.3.1`  | Core React engine utilizing functional components and hooks                                |
| `@reduxjs/toolkit`    | `^2.3.0`   | Scalable global state management, async thunks                                             |
| `react-redux`         | `^9.1.2`   | Official React bindings for Redux store                                                    |
| `axios`               | `^1.7.9`   | Promise-based HTTP client with request/response interceptors                               |
| `react-hook-form`     | `^7.53.2`  | High-performance, declarative form state management                                        |
| `@hookform/resolvers` | `^3.9.1`   | Seamless integration between React Hook Form and Zod schemas                               |
| `zod`                 | `^3.23.8`  | Schema validation for forms, API responses, and client environment                         |
| `lucide-react`        | `^0.460.0` | Clean, modern SVG icon library                                                             |
| `tailwindcss`         | `^3.4.15`  | Utility-first CSS framework tailored for modern aesthetics                                 |
| `eslint-config-next`  | `^14.2.24` | Next.js recommended ESLint rules with Core Web Vitals                                      |

### Server (`/server`)

| Dependency           | Version   | Purpose                                                                   |
| :------------------- | :-------- | :------------------------------------------------------------------------ |
| `express`            | `^4.21.1` | Minimalist, fast web framework for Node.js REST API                       |
| `mongoose`           | `^8.8.2`  | MongoDB Object Data Modeling (ODM) with resilient non-blocking connection |
| `dotenv`             | `^16.4.5` | Loads environment variables from `.env` file                              |
| `cors`               | `^2.8.5`  | Strict Cross-Origin Resource Sharing control matching frontend URL        |
| `helmet`             | `^8.0.0`  | Secures Express apps by setting various HTTP headers                      |
| `express-rate-limit` | `^7.4.1`  | Rate-limiting middleware to protect against DDoS and brute force          |
| `cookie-parser`      | `^1.4.7`  | Parses cookie headers for secure JWT session tokens                       |
| `jsonwebtoken`       | `^9.0.2`  | JWT generation and verification infrastructure for upcoming auth          |
| `bcryptjs`           | `^2.4.3`  | Password hashing library (pure JS, 100% reliable across OS)               |
| `zod`                | `^3.23.8` | Request schema validation middleware and environment variable checks      |
| `nodemon`            | `^3.1.7`  | Development tool that automatically restarts node on file changes         |

### Root Workspace

| Dependency     | Version  | Purpose                                                           |
| :------------- | :------- | :---------------------------------------------------------------- |
| `concurrently` | `^9.1.0` | Executes both client and server development processes in parallel |
| `prettier`     | `^3.3.3` | Opinionated code formatter ensuring uniform formatting            |

---

## 3. Environment Variables Reference

### Client (`client/.env`)

| Variable                   | Default Value               | Description                                                    |
| :------------------------- | :-------------------------- | :------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api` | Base URL pointing to the Express backend API                   |
| `NEXT_PUBLIC_APP_NAME`     | `GIFT KRO`                  | Display name of the platform                                   |
| `NEXT_PUBLIC_APP_ENV`      | `development`               | Active client build environment (`development` / `production`) |

> **Security Rule**: In Next.js, only variables prefixed with `NEXT_PUBLIC_` are exposed to the client bundle. Private API secrets or credentials must never be prefixed with `NEXT_PUBLIC_`.

### Server (`server/.env`)

| Variable               | Default Value                            | Description                                            |
| :--------------------- | :--------------------------------------- | :----------------------------------------------------- |
| `PORT`                 | `5000`                                   | Port on which the Express server listens               |
| `NODE_ENV`             | `development`                            | Node environment (`development`, `production`, `test`) |
| `MONGODB_URI`          | `mongodb://127.0.0.1:27017/gift_kro_dev` | MongoDB connection URI (server starts even if offline) |
| `CLIENT_URL`           | `http://localhost:3000`                  | Allowed CORS origin (Next.js frontend)                 |
| `JWT_SECRET`           | _(Random 32+ char secret)_               | Secret key for signing JSON Web Tokens                 |
| `JWT_EXPIRES_IN`       | `7d`                                     | Token expiration duration                              |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 mins)                       | Window time frame for rate limiter in ms               |
| `RATE_LIMIT_MAX`       | `100`                                    | Max API requests permitted per IP per window           |

---

## 4. Installation & Startup Commands

### Step A: Install All Dependencies

From the project root (`c:/giftkaro`):

```bash
npm run install:all
```

### Step B: Start Both Servers Concurrently

From the project root:

```bash
npm run dev
```

This boots:

- **Server API**: [http://localhost:5000](http://localhost:5000)
- **Next.js Client**: [http://localhost:3000](http://localhost:3000)

### Step C: Run Independent Services

```bash
# Backend only:
npm run dev:server

# Frontend only:
npm run dev:client

# Production client build:
npm run build:client

# Start production client server:
npm run start:client

# Linting:
npm run lint

# Code Formatting:
npm run format
```

---

## 5. Health Check Endpoint Specification

### `GET /api/health`

- **Access**: Public
- **Description**: Probes API server readiness, uptime, database connection state, and USP parameters.

#### Live Response Example

```json
{
  "success": true,
  "statusCode": 200,
  "message": "GIFT KRO Service is operational.",
  "data": {
    "service": "GIFT KRO API Server",
    "status": "healthy",
    "environment": "development",
    "uptimeSeconds": 120,
    "timestamp": "2026-10-18T07:45:00.000Z",
    "database": {
      "status": "disconnected",
      "readyState": 0,
      "connected": false,
      "host": null,
      "name": null
    },
    "usp": {
      "headline": "24-Hour Custom T-shirt Printing",
      "region": "Raipur, Chhattisgarh",
      "minimumOrderQuantity": 10
    }
  }
}
```

---

## 6. How Next.js Frontend Communicates with Express Backend

1. **Service Layer Isolation**: The UI components never make direct fetch or axios calls.
2. **Centralized Axios Client**: `client/src/services/apiClient.js` configures the base URL (`NEXT_PUBLIC_API_BASE_URL`), sets standard timeouts, attaches credentials, and parses uniform response/error envelopes.
3. **Dedicated Domain Services**: `client/src/services/productService.js` and `healthService.js` wrap API endpoints into clean async methods.
4. **Redux Toolkit Integration**: `client/src/redux/slices/productSlice.js` triggers asynchronous thunks (`fetchProducts`, `fetchFeaturedProducts`, `fetchProductBySlug`, `fetchCategories`) and stores pagination, active filters, and items.
5. **Server & Client Component Architecture**:
   - `src/app/layout.jsx`: Server Component with Next.js Google Font (`Inter`) optimization and SEO metadata.
   - `src/app/providers.jsx`: Client Component providing Redux store context.
   - `src/app/products/page.jsx`: Responsive Client Component for real-time catalogue exploration and filtering.
   - `src/app/products/[slug]/page.jsx`: Rich product view with swatches, express delivery indicators, and specifications.

---

## 7. Phase 1 Product Catalogue Architecture & Seeding

The platform features an express 24-hour custom t-shirt catalogue across 4 distinct categories:
- **Customized T-shirts**
- **Event T-shirts**
- **Group T-shirts**
- **Corporate T-shirts**

### Features:
- **Mongoose Data Models**: Strict schema validation with sizes (`XS`-`4XL`), color swatches (`name`, `hex`), fabric specifications, turnaround hours (24h), MOQ (10 pcs), and compound text/filter indexes.
- **RESTful Endpoints (`/api/v1/products`, `/api/v1/categories`)**: Supports pagination, real-time search, category filtering, price bounds, size/color filtering, and sorting (`price_asc`, `popular`, `newest`).
- **Admin Management**: Secured endpoints for creating, editing, activating/deactivating, and soft-deleting products.
- **Frontend Pages**:
  - Home Page (`/`): Dynamic 4-category cards and featured products showcase.
  - Catalogue Listing (`/products`): Live search, filter pills, size buttons, sorting, responsive grid, empty/error states, and pagination.
  - Product Details (`/products/[slug]`): Gallery view, interactive color/size swatches, Raipur 24h express delivery badge, fabric & print specifications, and related products.
  - Admin Dashboard (`/admin`): Live product catalogue table with active status toggle.

### Seeding Development Catalogue:
To seed the 4 categories and 8 realistic Raipur express t-shirt products:
```bash
# In the server directory:
npm run seed:products
```

---

## 8. Customization & Pricing Module (MOQ 10+ Custom T-Shirts)

GIFT KRO features a dedicated customization and pricing engine for group, event, corporate, and individual orders:

### Key Highlights:
- **Server-Side Calculated Pricing**: All rates, volume discounts, and size surcharges are computed by `PricingService.js`; browser-submitted totals are never trusted.
- **Configurable Rules (`pricing.config.js`)**:
  - Minimum Order Quantity (MOQ): 10 pieces.
  - Surcharges: ₹0 for XS–XL; +₹30/piece for plus sizes (2XL, 3XL, 4XL).
  - Volume Discount Tiers: 10–24 pcs (0%), 25–49 pcs (5%), 50–99 pcs (10%), 100+ pcs (15%).
  - Print Locations: All locations (Front Chest, Full Front, Upper Back, Full Back, Left/Right Sleeves) included in base price.
- **Validated File Uploads**: Multer middleware with a 10MB limit and MIME whitelist (`image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`, `application/pdf`), stored in `server/uploads/artworks/` and served statically.
- **Persistent Storage**: MongoDB `Customization` model saves user/guest orders with unique human-readable reference codes (e.g., `GK-CUST-XXXXXXXX`), ready for future cart and checkout integration.
- **Frontend Pages**:
  - Customization Studio: `/products/[slug]/customize`
  - Saved Quote Viewer: `/customizations/[code]`

---

## 9. Shopping Cart & Checkout Preparation

- **Server-Side Revalidation**: On every access, cart items revalidate against active product status, live base prices, and MOQ 10. Stale price changes trigger warning banners without breaking the session.
- **Guest & User Persistence**: Persistent MongoDB carts for logged-in users with guest token fallback and automatic cart merging upon customer sign-in.
- **Delivery & Address Capture**:
  - Validates contact details and delivery addresses across Raipur localities (Pandri, Telibandha, Shankar Nagar, Tatibandh, VIP Road, Samta Colony, etc.).
  - Computes 24-Hour Express delivery schedule with guaranteed dispatch window.
  - Generates unique checkout tokens (`GK-CHECKOUT-XXXXXXXX`).
  - Strict boundary: Prepares checkout without creating confirmed orders or charging payment.
- **Frontend Pages**:
  - Shopping Cart: `/cart` (interactive size adjustments, price revalidation, order breakdown)
  - Checkout Preparation: `/checkout` (address capture, order review, preparation confirmation)

---

## 10. Delivery Eligibility & 24-Hour Express Module

GIFT KRO provides guaranteed 24-hour express production and doorstep delivery for eligible custom t-shirt orders across Raipur, Chhattisgarh.

### Core Features & Architectural Rules:
- **Serviceable Postal Zones (`DeliveryZone` Model)**:
  - Configurable database repository of all 15 Raipur postal PIN codes (`492001` through `492015`) with primary locality metadata (Telibandha, Pandri, Shankar Nagar, Tatibandh, VIP Road, Naya Raipur, etc.).
  - Non-serviceable outer locations (e.g. `491001` Durg/Bhilai, `495001` Bilaspur, or other Indian states) cleanly fall back to `out_of_express_zone` with a 3–5 day standard transit estimate and explanatory notes.
- **Production Capacity Thresholds**:
  - 24-hour express SLA is valid for orders between 10 pieces (MOQ) and 100 pieces with print-ready artwork.
  - High-volume bulk orders (> 100 pieces) automatically switch to `capacity_exceeded` with a 48–72 hour production window, explaining the physical drying, multi-stage screen printing, and curing requirements.
- **Artwork Approval Clock Condition**:
  - Orders submitted without artwork or requiring custom design assistance display an explicit condition: *"24-hour turnaround begins once artwork or proof is confirmed by customer."*
- **Configurable Cut-Off Times (`DeliveryConfig` Model)**:
  - Administrators can toggle and set a daily production cut-off time (e.g., `14:00` IST). Orders confirmed after the cut-off roll over into the next day's batch (+24h) with clear customer notification.
- **Administrator Command Console (`/admin`)**:
  - Live management interface to view all zones, add new postal PIN codes, toggle active/inactive status, adjust SLA hours, and configure global delivery rules.
- **Interactive UI Estimator (`DeliveryEstimator.jsx`)**:
  - Embedded across the store: Product Details (`/products/[slug]`), Customization Studio (`/products/[slug]/customize`), Cart (`/cart`), and Checkout (`/checkout`).
  - Features quick-select chips for popular Raipur localities and immediate visual feedback (Green 24h Express, Amber Bulk Capacity, Blue Standard Courier, Rose MOQ warning).

---

## 11. Order Management & Razorpay Payment Integration

- **Server-Side Order Generation**:
  - Created directly from server-validated cart items and live prices.
  - Generates unique serial order numbers: `GK-ORD-YYYYMMDD-XXXX`.
  - Captures shipping address, coordinator contact, size breakdown, print locations, customer uploaded artworks, server-calculated totals, and delivery estimate.
- **Cryptographic Payment Verification**:
  - Integrates Razorpay with server-side order initialization and HMAC-SHA256 signature verification.
  - Implements timing-safe signature comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
  - Idempotent callback handling ensures duplicate webhooks or network retries do not double-process or alter confirmed order state.
  - Client checkout cleanly opens the official Razorpay modal and transitions to live order tracking.
- **Frontend Tracking Pages**:
  - Customer Order Tracking: `/orders/[id]` (5-stage visual SLA tracker, garments breakdown, delivery estimate, pre-press artwork proof status).
  - Customer Order History: `/account/orders`.

---

## 12. Administrator Command Console (`/admin`)

- **Secure Role-Based Access Control**:
  - Privileged backend endpoints protected with `authenticate` and `authorize('admin')`.
  - Frontend protected with route guards redirecting unauthorized users.
- **Live Database Telemetry (No Fabricated Metrics)**:
  - Real-time MongoDB aggregations for captured revenue, total orders, 24-hour express SLA counts, active catalogue products, and registered customers.
- **Strict Order Status Finite State Machine**:
  - Transition flow: `pending_payment` $\rightarrow$ `confirmed`/`payment_failed`/`cancelled`; `confirmed` $\rightarrow$ `in_production`/`cancelled`; `in_production` $\rightarrow$ `quality_check`/`cancelled`; `quality_check` $\rightarrow$ `dispatched`/`in_production`; `dispatched` $\rightarrow$ `delivered`.
  - Direct status bypasses (e.g. `confirmed` directly to `delivered`) are rejected with descriptive HTTP 400 errors.
  - `delivered` and `cancelled` are protected as terminal states.
- **Pre-Press Artwork Proof Review Gallery**:
  - Review queue for customer-submitted artwork files with `pending`, `approved`, and `revision_requested` states, complete with admin feedback notes.
- **Catalogue & Delivery Hub Management**:
  - Active status toggle and archival for products.
  - Global cut-off time, batch capacity thresholds, and serviceable postal code configuration.
- **Audit Logging**:
  - Records administrative actions (`ORDER_STATUS_UPDATE`, `ARTWORK_STATUS_UPDATE`, `DELIVERY_CONFIG_UPDATE`, `PRODUCT_STATUS_UPDATE`) with admin identity, client IP, and timestamps.

---

## 13. Production Readiness & Test Suites

The complete Phase 1 application has passed all production audits:
- **Build Verification**: Next.js production build (`npm --prefix client run build`) completed successfully with 12 statically generated and optimized routes.
- **Code Quality**: Zero ESLint warnings or errors on both server and client.
- **Automated Test Suites**:
  ```bash
  # Run Order Management & Admin Console Integration Suite (17 tests)
  node server/test-orders-admin.js

  # Run Comprehensive Production-Readiness Audit Suite (24 tests)
  node server/test-production-readiness.js
  ```
- **Deployment & Operations Guide**: See [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for full deployment instructions, environment variable specifications, database backups, and rollback procedures.
