# Marketplace Frontend Setup Guide

## Goal
Get the marketplace frontend running locally so you can see each component as it's built, with real data visible in the browser.

---

## Prerequisites

- [x] MySQL database running with `saffron_marketplace` schema
- [x] Node.js installed
- [x] Backend dependencies installed (`cd backend && npm install`)
- [x] Frontend dependencies installed (`cd frontend && npm install`)

---

## Step 1: Create Seed Data for Testing

**Why:** You need products in the database to see anything on the frontend.

### Run the seed script:
```bash
cd backend/database
mysql -u root -p saffron_marketplace < seed.sql
```

### What gets created:
| Data | Details |
|------|---------|
| **Test Buyer** | `buyer@test.com` / `Test123!` |
| **Test Seller** | `seller@test.com` / `Test123!` |
| **Seller Profile** | "Kashmir Saffron Co." - Verified seller |
| **6 Products** | Various grades (Premium, Grade I, II, III) |
| **Product Variants** | Different weights (1g, 5g, 10g, 25g) with prices |
| **Sample Reviews** | 5 reviews with ratings |
| **Sample Address** | Shipping address for buyer |

---

## Step 2: Start Backend Server

Open a terminal and run:
```bash
cd /Users/pranavagopavaram/work/Saffron/backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connected successfully
```

**Verify it works:**
- Open browser: `http://localhost:3000/api/products`
- Should return JSON with product data

---

## Step 3: Start Frontend Dev Server

Open a **new terminal** and run:
```bash
cd /Users/pranavagopavaram/work/Saffron/frontend
npm start
```

**Expected output:**
```
Angular Live Development Server is listening on localhost:4200
```

**Verify it works:**
- Open browser: `http://localhost:4200`
- Should show login page

---

## Step 4: Login and Navigate

### Login with test credentials:
1. Go to `http://localhost:4200/auth/login`
2. Enter: `buyer@test.com` / `Test123!`
3. Click Login

### After login, you'll be at the Dashboard
The dashboard now has navigation links to:
- **Browse Products** → `/buyer/products`
- **My Cart** → `/buyer/cart`
- **My Orders** → `/buyer/orders`
- **My Addresses** → `/buyer/addresses`

---

## Step 5: Test Each Component

### 5.1 Product List Page
**URL:** `http://localhost:4200/buyer/products`

**What you'll see:**
- Header with "Saffron Marketplace" title
- Filter sidebar (grade, price range, origin)
- Product grid showing 6 products from seed data
- Each product card shows:
  - Product image (placeholder)
  - Grade badge (Premium, Grade I, etc.)
  - Product name and origin
  - Seller name with rating
  - Quality badges (ISO Certified, Color, Aroma)
  - Price range
  - "Add to Cart" button

**Test the filters:**
- Select "Premium" grade → shows only premium products
- Enter price range → filters by price
- Type origin (e.g., "Kashmir") → filters by origin

---

### 5.2 Product Detail Page
**URL:** Click on any product card, or go to `http://localhost:4200/buyer/products/1`

**What you'll see:**
- Breadcrumb navigation
- Product image gallery
- Grade badge
- Seller info with rating
- Quality attributes with visual bars:
  - Color Rating (orange bar)
  - Aroma Score (yellow bar)
  - Moisture Level (blue bar)
- ISO Certification badge (if certified)
- **Variant Selection:** Buttons for different weights (1g, 5g, 10g, 25g)
- **Quantity Picker:** +/- buttons
- **Add to Cart** button (shows success animation)
- **Buy Now** button
- **Tabs:**
  - Description tab with specifications table
  - Reviews tab with ratings breakdown and individual reviews

**Test interactions:**
- Click different variant buttons → price updates
- Change quantity with +/- buttons
- Click "Add to Cart" → shows green checkmark animation
- Switch between Description and Reviews tabs

---

### 5.3 Cart Page (Placeholder)
**URL:** `http://localhost:4200/buyer/cart`

**Current state:** Placeholder with "Coming in Phase 3" message

---

### 5.4 Checkout Page (Placeholder)
**URL:** `http://localhost:4200/buyer/checkout`

**Current state:** Placeholder with "Coming in Phase 4" message

---

### 5.5 Orders Page (Placeholder)
**URL:** `http://localhost:4200/buyer/orders`

**Current state:** Placeholder with "Coming in Phase 5" message

---

### 5.6 Addresses Page (Placeholder)
**URL:** `http://localhost:4200/buyer/addresses`

**Current state:** Placeholder with "Coming in Phase 6" message

---

## Component Implementation Status

| Component | Status | URL |
|-----------|--------|-----|
| Login | ✅ Complete | `/auth/login` |
| Registration | ✅ Complete | `/auth/register` |
| Buyer Dashboard | ✅ Complete | `/buyer/dashboard` |
| Product List | ✅ Complete | `/buyer/products` |
| Product Detail | ✅ Complete | `/buyer/products/:id` |
| Cart | ⏳ Placeholder | `/buyer/cart` |
| Checkout | ⏳ Placeholder | `/buyer/checkout` |
| Order List | ⏳ Placeholder | `/buyer/orders` |
| Order Detail | ⏳ Placeholder | `/buyer/orders/:id` |
| Address List | ⏳ Placeholder | `/buyer/addresses` |

---

## Shared Components Created

| Component | Location | Purpose |
|-----------|----------|---------|
| LoadingSpinner | `shared/components/loading-spinner/` | Loading states |
| ProductCard | `shared/components/product-card/` | Product grid cards |
| StarRating | `shared/components/star-rating/` | Rating display/input |
| QuantityInput | `shared/components/quantity-input/` | +/- quantity selector |
| EmptyState | `shared/components/empty-state/` | Empty list states |
| Pagination | `shared/components/pagination/` | Page navigation |

---

## Next Steps (Implementation Order)

Each step builds on the previous and will be immediately visible:

### Phase 3: Shopping Cart
```
/buyer/cart
```
- Display cart items with product details
- Quantity adjustment per item
- Remove item functionality
- Cart totals (subtotal, items count)
- "Proceed to Checkout" button

### Phase 4: Checkout Flow
```
/buyer/checkout
```
- Address selection from saved addresses
- Add new address form
- Order summary
- Place order button
- Order confirmation

### Phase 5: Order Management
```
/buyer/orders
/buyer/orders/:id
```
- Order history list
- Order status badges
- Order detail view
- Cancel order (if pending)

### Phase 6: Address Management
```
/buyer/addresses
```
- List saved addresses
- Add/Edit/Delete addresses
- Set default address

---

## Troubleshooting

### Backend won't start
```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT 1"

# Check .env file exists
cat backend/.env

# Check port 3000 is free
lsof -i :3000
```

### Frontend won't start
```bash
# Check port 4200 is free
lsof -i :4200

# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend && npm install
```

### No products showing
```bash
# Verify seed data was inserted
mysql -u root -p saffron_marketplace -e "SELECT COUNT(*) FROM saffron_products"

# Should return 6
```

### Login fails
```bash
# Verify test user exists
mysql -u root -p saffron_marketplace -e "SELECT email FROM users"

# Should show buyer@test.com and seller@test.com
```

### CORS errors in browser console
- Make sure backend is running on port 3000
- Check `backend/.env` has correct `FRONTEND_URL=http://localhost:4200`

---

## Development Workflow

1. **Make changes** to frontend code
2. **Save file** → Angular auto-reloads
3. **Check browser** → See changes immediately
4. **Test interactions** → Verify functionality
5. **Check console** → Debug any errors

---

## Files Reference

### Seed Data
```
backend/database/seed.sql
```

### Frontend Routes
```
frontend/src/app/app.routes.ts
```

### Product Components
```
frontend/src/app/features/buyer/products/product-list/
frontend/src/app/features/buyer/products/product-detail/
```

### Shared Components
```
frontend/src/app/shared/components/
```

### Services (API calls)
```
frontend/src/app/core/services/product.service.ts
frontend/src/app/core/services/cart.service.ts
frontend/src/app/core/services/order.service.ts
frontend/src/app/core/services/review.service.ts
frontend/src/app/core/services/marketplace.service.ts
```
