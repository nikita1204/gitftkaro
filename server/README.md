# GIFT KRO — Backend API Server

Backend API service for **GIFT KRO**, powering custom 24-hour express t-shirt printing and personalized gifting in Raipur, Chhattisgarh.

---

## 1. Authentication Architecture

The authentication module supports two distinct roles:
- `customer`: Default role for all public registrations.
- `admin`: Elevated role for platform operators with access to administrative routes and telemetry.

### Security Highlights
- **Passwords**: Salted and hashed using `bcryptjs` (cost factor 12) via Mongoose pre-save hook.
- **JWT Tokens**: Signed with `JWT_SECRET`, expiring according to `JWT_EXPIRES_IN` (default 7 days).
- **Token Storage Strategy**: Delivered via HTTP-only, SameSite cookies (`token`) with fallback support for `Authorization: Bearer <token>` headers.
- **CSRF & Origin Security**: CORS origin whitelist (`CLIENT_URL`), credentials enabled, preflight checks (`OPTIONS`), and SameSite cookie protections.
- **Rate Limiting**: `authRateLimiter` restricts login and registration attempts (15 req/15 min per IP) to prevent brute-force attacks.

---

## 2. API Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Customer registration (forces role: `customer`) |
| `POST` | `/api/v1/auth/login` | Public | Authenticates customer or admin; sets HTTP-only cookie |
| `POST` | `/api/v1/auth/logout` | Public | Clears session cookie |
| `GET` | `/api/v1/auth/me` | Private | Returns currently authenticated user session |
| `GET` | `/api/v1/auth/admin-metrics` | Private (Admin only) | Restricted operational probe for administrators |

---

## 3. Secure Administrator Provisioning Process

Initial administrator accounts are provisioned via a dedicated, secure CLI script without hardcoded secrets:

```bash
# In production or local environment:
ADMIN_NAME="Raipur Admin" \
ADMIN_EMAIL="admin@giftkro.com" \
ADMIN_PASSWORD="YourStrongPassword123!" \
npm run seed:admin
```

The script:
1. Validates input credentials using Zod schemas.
2. Connects to MongoDB Atlas cluster via `MONGODB_URI`.
3. Checks if an admin account with that email already exists.
4. Securely hashes the password with bcrypt and sets `role: 'admin'`.
5. Closes the database connection cleanly without logging sensitive credentials.

---

## 4. Product Catalogue Architecture

The Product Catalogue powers express 24-hour custom merchandise across 4 primary categories:
- **Customized T-shirts** (`customized-t-shirts`): Individual, couple, milestone, and personalized prints.
- **Event T-shirts** (`event-t-shirts`): Marathons, tech fests, college reunions, and concerts.
- **Group T-shirts** (`group-t-shirts`): Bachelor parties, sports squads, and friend circles.
- **Corporate T-shirts** (`corporate-t-shirts`): Startup uniforms, executive pique polo workwear, and onboarding kits.

### Key Schema Fields
- **Product**: `name`, `slug`, `description`, `shortDescription`, `images` (array with `url`, `alt`, `isPrimary`), `basePrice`, `compareAtPrice`, `minOrderQuantity` (default 10), `availableSizes` (`XS`, `S`, `M`, `L`, `XL`, `2XL`, `3XL`, `4XL`), `availableColors` (array of `{ name, hex }`), `category` (ref `Category`), `isActive`, `isArchived`, `isFeatured`, `isExpressEligible`, `turnaroundHours` (default 24), `stockStatus` (`in_stock`, `made_to_order`, `out_of_stock`), `specifications` (fabric, GSM, printTechnique, fit, origin), and `tags`.
- **Category**: `name`, `slug`, `description`, `imageUrl`, `badge`, `turnaroundHours`, `minOrderQuantity`, `displayOrder`, `isActive`.
- **Database Indexes**: Compound index on `{ category: 1, isActive: 1, isArchived: 1, basePrice: 1 }`, unique index on `slug`, and compound text index on `{ name: 'text', description: 'text', tags: 'text' }`.

---

## 5. Product & Category API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/categories` | List active product categories with active product count |
| `GET` | `/api/v1/categories/:slug` | Get single category details by slug |
| `GET` | `/api/v1/products` | Paginated product listing with filtering and sorting |
| `GET` | `/api/v1/products/featured` | Fetch top featured products for homepage showcase |
| `GET` | `/api/v1/products/:slugOrId` | Get detailed product by slug or MongoDB ObjectId, with related products |

#### Filtering, Searching & Sorting Query Parameters for `GET /api/v1/products`:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)
- `category`: Category slug filter (e.g. `corporate-t-shirts`)
- `search`: Full-text search on product title, description, and tags
- `minPrice` / `maxPrice`: Numeric price range filters
- `size`: Size filter (e.g. `M`, `XL`, `3XL`)
- `color`: Color name filter (e.g. `Black`, `Navy`)
- `expressOnly`: Filter for express 24h eligible (`true`/`false`)
- `sort`: `price_asc`, `price_desc`, `name_asc`, `name_desc`, `popular`, or `newest` (default)

### Admin Endpoints (Require `role: 'admin'`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/products` | Create a new product (validates schema via Zod) |
| `PUT` | `/api/v1/products/:id` | Update product details |
| `PATCH` | `/api/v1/products/:id/status` | Toggle active status (`isActive: true/false`) |
| `DELETE` | `/api/v1/products/:id` | Soft-deletes/archives product (`isArchived: true`) |
| `POST` | `/api/v1/categories` | Create a new product category |

---

## 6. Development Seed Data

To populate the database with the 4 default categories and 8 realistic Raipur 24-hour custom t-shirt products:

```bash
# From the /server directory:
npm run seed:products
```

The seed script:
1. Safely connects to the MongoDB Atlas cluster.
2. Inserts or updates the 4 core categories (`Customized T-shirts`, `Event T-shirts`, `Group T-shirts`, `Corporate T-shirts`).
3. Seeds high-quality products complete with fabric specs, Raipur 24h express turnaround badges, MOQ (10 pcs), sizes XS-4XL, hex color swatches, and responsive images.
4. Leaves existing user accounts and admin credentials untouched.

---

## 7. Customization & Pricing Engine Architecture

The customization module handles custom t-shirt orders (Event, Group, Corporate, Personalized) with server-calculated price locks, volume discount tiers, size surcharges, and validated artwork file uploads.

### Pricing Business Rules (Configurable in `src/modules/customizations/pricing.config.js`):
1. **Minimum Order Quantity (MOQ)**: 10 T-shirts total across all selected sizes.
2. **Base Garment Price**: Governed by the product `basePrice` from MongoDB.
3. **Print Locations**: Base price includes all selected print locations (`front_chest`, `full_front`, `back_top`, `full_back`, `left_sleeve`, `right_sleeve`) without extra location fees.
4. **Size Surcharges**:
   - `XS`, `S`, `M`, `L`, `XL`: ₹0 (Standard)
   - `2XL`, `3XL`, `4XL`: +₹30 per piece (Plus-size fabric surcharge)
5. **Volume Discount Tiers**:
   - `100+ pcs`: **15% OFF** (Mega Bulk Tier)
   - `50–99 pcs`: **10% OFF** (Wholesale Tier)
   - `25–49 pcs`: **5% OFF** (Team Tier)
   - `10–24 pcs`: **0% OFF** (Standard Tier, MOQ Met)
6. **Price Formula**:
   $$\text{Subtotal} = (\text{Base Price} \times \text{Total Qty}) + \sum (\text{Size Qty} \times \text{Surcharge})$$
   $$\text{Discount} = \text{Subtotal} \times \text{Discount Tier \%}$$
   $$\text{Total Price} = \text{Subtotal} - \text{Discount}$$
   $$\text{Effective Unit Price} = \text{Total Price} / \text{Total Qty}$$

---

## 8. Customization API Endpoints (`/api/v1/customizations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/customizations/pricing-rules` | Public | Returns active pricing rules, volume discount tiers, and sizes |
| `POST` | `/api/v1/customizations/calculate-quote` | Public | Real-time quote calculation with MOQ & tier evaluation |
| `POST` | `/api/v1/customizations/upload-artwork` | Public | Multipart artwork upload (10MB limit, PNG/JPG/WEBP/SVG/PDF) |
| `POST` | `/api/v1/customizations` | Public | Saves full customization specification with unique code (`GK-CUST-...`) |
| `GET` | `/api/v1/customizations/:codeOrId` | Public | Retrieves saved customization specification and quote by code |
| `GET` | `/api/v1/customizations` | Admin | Lists all customization inquiries with filters and pagination |
| `PATCH` | `/api/v1/customizations/:id/status` | Admin | Updates status (`in_review`, `converted_to_order`, etc.) |

---

## 9. Shopping Cart & Checkout Preparation Architecture

The shopping cart module manages user and guest shopping sessions, enforces MOQ rules on custom t-shirt configurations, recalculates server-side prices on every request, and prepares orders for checkout.

### Architecture Highlights:
- **Guest & User Cart Management**:
  - Logged-in customers: Tied to `req.user._id` in MongoDB (`Cart` collection).
  - Guests: Identified via `guestToken` (cookie or `x-cart-token` header).
  - Merging: Guest items are merged into the user account upon login (`POST /api/v1/cart/merge`).
- **Resilient Server-Side Revalidation**:
  - Live product status (`isActive`, `!isArchived`) is revalidated on every retrieval.
  - Changes in product base prices are recalculated dynamically using `PricingService`.
  - Stale pricing alerts are returned in `summary.warnings` to keep customers informed.
- **MOQ Enforcement**:
  - Minimum 10 pieces enforced across the size distribution for each custom t-shirt item.
  - Adding or updating an item with total quantity < 10 rejects with a 422 validation error.
- **Checkout Preparation Flow**:
  - Validates contact details (Name, Email, 10-digit Phone).
  - Validates delivery address in Raipur (Area, PIN Code 492001–492015, Street).
  - Computes 24-hour express fulfillment schedule and reserves slot with reference token `GK-CHECKOUT-XXXXXXXX`.
  - Strictly prepares checkout without finalizing confirmed orders or collecting payment.

---

## 10. Cart & Checkout API Endpoints (`/api/v1/cart`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/cart` | Public | Retrieves current cart with live server revalidation |
| `POST` | `/api/v1/cart/items` | Public | Adds custom T-shirt configuration (enforces MOQ 10) |
| `PUT` | `/api/v1/cart/items/:itemId` | Public | Updates size distribution or customization options |
| `DELETE` | `/api/v1/cart/items/:itemId` | Public | Removes a configuration from cart |
| `DELETE` | `/api/v1/cart` | Public | Empties all items in cart |
| `POST` | `/api/v1/cart/merge` | Authenticated | Merges guest cart into authenticated user cart |
| `POST` | `/api/v1/cart/checkout-prep` | Public | Revalidates order and validates Raipur shipping address |

---

## 11. Delivery Eligibility & 24-Hour Express Architecture

GIFT KRO guarantees 24-hour express production and doorstep delivery for customized t-shirt orders across all serviceable areas in Raipur, Chhattisgarh.

### Architectural Rules & Constraints
1. **Configurable Serviceable Zones (`DeliveryZone` Model)**:
   - All Raipur postal divisions (`492001` through `492015`) are seeded and managed in MongoDB with locality metadata.
   - Outer regions (e.g., `491001` Durg/Bhilai, `495001` Bilaspur, or outside Chhattisgarh) fall back cleanly to `out_of_express_zone` with a standard 3–5 business day courier transit timeline.
   - Administrators can add, edit, or toggle PIN codes (`isActive`) dynamically in case of localized transit disruptions.
2. **Production Capacity Limits**:
   - Single-batch express printing is verified for orders between 10 (MOQ) and 100 garments.
   - Orders exceeding 100 pieces transition automatically to `capacity_exceeded` status with an estimated delivery window of 48–72 hours (2–3 business days) to account for multi-stage screen preparation, drying, and heat-curing cycles.
3. **Artwork Proof Confirmation Condition**:
   - For orders submitted without confirmed print-ready artwork, the 24-hour turnaround explicitly communicates the condition: *"24-hour turnaround begins once artwork or proof is confirmed by customer."*
4. **Order Cut-Off Time Configuration**:
   - By default, orders operate on a rolling 24-hour SLA from the exact moment of order confirmation.
   - Platform administrators can toggle `isCutOffActive` and configure a daily production cut-off time (e.g. `14:00` IST). Orders confirmed after the cut-off roll over into the next day's production batch (+24h) with an explicit notice.
5. **Operating Schedule**:
   - Operates 7 days a week (including Sunday express printing and local Raipur doorstep delivery).
6. **Cart & Checkout Preparation Integration**:
   - In Step 4/5, checkout preparation (`POST /api/v1/cart/checkout-prep`) invokes `DeliveryService.checkEligibility` to bind verified delivery estimates, hubs, and condition notices directly to the prepared order summary.

---

## 12. Delivery Module API Endpoints (`/api/v1/delivery`)

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/delivery/check-eligibility` | Evaluates PIN code, total quantity, and artwork readiness; returns dynamic delivery window, status code, and condition notes |
| `GET` | `/api/v1/delivery/pincodes` | Returns list of all active serviceable Raipur PIN codes and primary localities |
| `GET` | `/api/v1/delivery/config` | Retrieves current public delivery rules and turnaround SLA parameters |

### Administrator Endpoints (Require `role: 'admin'`)
| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/api/v1/delivery/config` | Updates global delivery turnaround SLA, capacity limits (MOQ, max express pcs), daily cut-off time, and artwork approval toggles |
| `GET` | `/api/v1/delivery/zones` | Lists all delivery zones (active & inactive) with locality and SLA details |
| `POST` | `/api/v1/delivery/zones` | Adds a new postal PIN code / zone with customizable express and standard hours |
| `PUT` | `/api/v1/delivery/zones/:id` | Updates area details, SLA hours, or notes for a zone |
| `PATCH` | `/api/v1/delivery/zones/:id/status`| Toggles zone active status (`isActive: true/false`) |
| `DELETE` | `/api/v1/delivery/zones/:id` | Removes a delivery zone from the system |



