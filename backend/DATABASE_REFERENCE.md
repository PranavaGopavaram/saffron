# Database Reference Guide

Quick reference for all 14 tables and their purposes in the Saffron Marketplace backend.

## Table Overview

### Authentication & Users (3 tables)

#### **users**
Core user authentication table for all platform users.
- Primary: `id`
- Unique: `email`
- Roles: `buyer`, `seller`
- Status: `active`, `pending`, `suspended`

**Common Queries:**
```sql
-- Get user by email
SELECT * FROM users WHERE email = ?;

-- Get all active sellers
SELECT * FROM users WHERE role = 'seller' AND status = 'active';

-- Update last login
UPDATE users SET last_login = NOW() WHERE id = ?;
```

#### **buyers**
Buyer-specific profile data.
- Links to: `users` (user_id)
- Fields: company_name

**Common Queries:**
```sql
-- Get buyer profile
SELECT b.*, u.email, u.full_name FROM buyers b
JOIN users u ON b.user_id = u.id WHERE b.id = ?;
```

#### **sellers**
Seller/merchant profile data with verification status.
- Links to: `users` (user_id)
- Verification: `pending`, `verified`, `rejected`

**Common Queries:**
```sql
-- Get verified sellers only
SELECT s.*, u.full_name, u.email FROM sellers s
JOIN users u ON s.user_id = u.id
WHERE s.verification_status = 'verified';
```

---

### Products & Inventory (4 tables)

#### **saffron_products** ⭐ Main Product Table
Specialized saffron product catalog with quality metrics.
- Links to: `sellers` (seller_id)
- Quality Metrics: color_rating (1-10), aroma_score (1-10)
- Special Fields: iso_certification, moisture_level, images (JSON)

**Common Queries:**
```sql
-- Get products by seller
SELECT * FROM saffron_products WHERE seller_id = ? AND status = 'active';

-- Search by origin and grade
SELECT * FROM saffron_products 
WHERE origin = ? AND grade = ? AND status = 'active'
ORDER BY color_rating DESC;

-- Get products with best ratings
SELECT sp.*, ROUND(AVG(r.rating), 2) AS avg_rating
FROM saffron_products sp
LEFT JOIN reviews r ON sp.id = r.product_id
GROUP BY sp.id
ORDER BY avg_rating DESC;
```

#### **product_variants**
Different package sizes/weights for the same product.
- Links to: `saffron_products` (product_id)
- Unique: `sku` (product code)
- Inventory: `stock_quantity`

**Common Queries:**
```sql
-- Get all variants for a product
SELECT * FROM product_variants WHERE product_id = ?;

-- Get variant by SKU
SELECT * FROM product_variants WHERE sku = ?;

-- Get low stock items
SELECT * FROM product_variants 
WHERE stock_quantity < 100
ORDER BY stock_quantity ASC;
```

#### **products** (Legacy)
Generic product table (deprecated in favor of saffron_products).
- Use for: backward compatibility only
- Prefer: Use `saffron_products` for new products

#### **seller_certifications**
Seller verification documents and certifications.
- Links to: `sellers` (seller_id)
- Fields: file_path, certification_type, issuing_body, issue_date
- Verification: verification_status, verified_by_admin, verification_date

**Common Queries:**
```sql
-- Get pending certifications for review
SELECT * FROM seller_certifications 
WHERE verification_status = 'pending'
ORDER BY uploaded_at ASC;

-- Get all certifications for a seller
SELECT * FROM seller_certifications 
WHERE seller_id = ? 
ORDER BY uploaded_at DESC;
```

---

### Shopping & Orders (4 tables)

#### **shopping_carts**
Active shopping carts for buyers.
- Links to: `buyers` (buyer_id), `product_variants` (variant_id)
- Constraint: Unique (buyer_id, variant_id) - one item per variant per buyer
- Auto timestamps: added_at, updated_at

**Common Queries:**
```sql
-- Get buyer's cart
SELECT sc.*, pv.sku, pv.price, pv.weight_grams,
       sp.product_name
FROM shopping_carts sc
JOIN product_variants pv ON sc.variant_id = pv.id
JOIN saffron_products sp ON pv.product_id = sp.id
WHERE sc.buyer_id = ?;

-- Get cart total
SELECT SUM(pv.price * sc.quantity) AS total
FROM shopping_carts sc
JOIN product_variants pv ON sc.variant_id = pv.id
WHERE sc.buyer_id = ?;

-- Clear cart
DELETE FROM shopping_carts WHERE buyer_id = ?;
```

#### **orders**
Customer orders with status tracking.
- Links to: `buyers` (buyer_id), `addresses` (shipping_address_id)
- Statuses: order_status, payment_status
- Unique: `order_number`

**Common Queries:**
```sql
-- Get buyer's orders
SELECT * FROM orders WHERE buyer_id = ? 
ORDER BY created_at DESC;

-- Get pending orders
SELECT * FROM orders 
WHERE order_status = 'pending' 
ORDER BY created_at ASC;

-- Get orders by status
SELECT * FROM orders 
WHERE order_status = ? AND payment_status = ?
LIMIT 50;
```

#### **order_items**
Individual items in each order (multi-seller support).
- Links to: `orders`, `product_variants`, `sellers`
- Fields: quantity, unit_price, subtotal, item_status
- Tracks each seller per item

**Common Queries:**
```sql
-- Get items for an order
SELECT oi.*, pv.sku, sp.product_name, s.business_name
FROM order_items oi
JOIN product_variants pv ON oi.variant_id = pv.id
JOIN saffron_products sp ON pv.product_id = sp.id
JOIN sellers s ON oi.seller_id = s.id
WHERE oi.order_id = ?;

-- Get all items from a seller
SELECT * FROM order_items WHERE seller_id = ? 
ORDER BY created_at DESC;

-- Get seller's revenue
SELECT SUM(subtotal) AS revenue
FROM order_items 
WHERE seller_id = ? 
  AND item_status = 'delivered';
```

#### **payment_transactions**
Payment processing and transaction history.
- Links to: `orders`, `buyers`
- Gateway: Stripe, PayPal, etc.
- Status: `pending`, `success`, `failed`

**Common Queries:**
```sql
-- Get transaction for order
SELECT * FROM payment_transactions WHERE order_id = ?;

-- Get successful transactions
SELECT * FROM payment_transactions 
WHERE status = 'success' 
ORDER BY created_at DESC;

-- Get failed transactions
SELECT * FROM payment_transactions 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

### Reviews & Ratings (2 tables)

#### **reviews**
Product reviews and ratings from buyers.
- Links to: `orders`, `saffron_products`, `buyers`, `sellers`
- Rating: 1-5 stars
- Fields: authenticity_verified, would_recommend, helpful_count

**Common Queries:**
```sql
-- Get product reviews
SELECT r.*, u.full_name AS buyer_name
FROM reviews r
JOIN buyers b ON r.buyer_id = b.id
JOIN users u ON b.user_id = u.id
WHERE r.product_id = ?
ORDER BY r.created_at DESC;

-- Get average rating for product
SELECT 
  ROUND(AVG(r.rating), 2) AS avg_rating,
  COUNT(*) AS review_count,
  SUM(CASE WHEN r.would_recommend = 1 THEN 1 ELSE 0 END) AS would_recommend_count
FROM reviews r
WHERE r.product_id = ?;

-- Get helpful reviews
SELECT * FROM reviews 
WHERE product_id = ? AND helpful_count > 10
ORDER BY helpful_count DESC;
```

#### **seller_reviews**
Seller/merchant ratings from buyers.
- Links to: `sellers`, `buyers`
- Rating: 1-5 stars

**Common Queries:**
```sql
-- Get seller reviews
SELECT sr.*, u.full_name AS buyer_name
FROM seller_reviews sr
JOIN buyers b ON sr.buyer_id = b.id
JOIN users u ON b.user_id = u.id
WHERE sr.seller_id = ?
ORDER BY sr.created_at DESC;

-- Get seller rating
SELECT 
  ROUND(AVG(sr.rating), 2) AS avg_rating,
  COUNT(*) AS review_count
FROM seller_reviews
WHERE seller_id = ?;
```

---

### User Data (1 table)

#### **addresses**
Shipping and business addresses.
- Links to: `users` (user_id)
- Types: `shipping`, `business`
- Multiple addresses per user with is_default flag

**Common Queries:**
```sql
-- Get user's addresses
SELECT * FROM addresses WHERE user_id = ?;

-- Get default shipping address
SELECT * FROM addresses 
WHERE user_id = ? AND type = 'shipping' AND is_default = TRUE;

-- Get business address
SELECT * FROM addresses 
WHERE user_id = ? AND type = 'business' LIMIT 1;

-- Update default address
UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND type = ?;
UPDATE addresses SET is_default = TRUE WHERE id = ?;
```

---

## Database Views (Recommended for API Use)

### **buyer_profiles**
Denormalized view for buyer profile data with addresses.
```sql
SELECT * FROM buyer_profiles WHERE id = ?;
```

### **seller_profiles**
Denormalized view for seller profile with stats.
```sql
SELECT * FROM seller_profiles WHERE id = ?;
-- Includes: certification_count, product_count, average_rating
```

### **order_summary**
Order overview with counts.
```sql
SELECT * FROM order_summary WHERE buyer_id = ?;
-- Includes: seller_count, item_count per order
```

### **product_availability**
Product info with ratings and inventory.
```sql
SELECT * FROM product_availability WHERE id = ?;
-- Includes: price, stock_quantity, average_rating, review_count
```

---

## Stored Procedures

### **verify_seller(seller_user_id)**
Mark a seller as verified.
```sql
CALL verify_seller(5);
```

### **get_seller_stats(seller_id)**
Get seller statistics.
```sql
CALL get_seller_stats(3);
-- Returns: total_products, total_orders, total_reviews, average_rating, total_revenue
```

### **get_user_stats()**
Get platform user statistics.
```sql
CALL get_user_stats();
-- Returns: total_users, total_buyers, total_sellers, verified_users, active_users
```

### **complete_order(order_id)**
Mark order as delivered and completed.
```sql
CALL complete_order(123);
```

---

## Key Constraints & Relationships

```
users (1) ──┬─→ (M) buyers
            ├─→ (M) sellers
            └─→ (M) addresses

sellers (1) ─┬─→ (M) saffron_products
             ├─→ (M) seller_certifications
             └─→ (M) order_items

saffron_products (1) ─→ (M) product_variants

product_variants (1) ─┬─→ (M) shopping_carts
                      └─→ (M) order_items

buyers (1) ─┬─→ (M) shopping_carts
            ├─→ (M) orders
            ├─→ (M) reviews
            ├─→ (M) seller_reviews
            └─→ (M) payment_transactions

orders (1) ─┬─→ (M) order_items
            ├─→ (1) payment_transactions
            └─→ (M) reviews

saffron_products (1) ─→ (M) reviews
```

---

## Performance Tips

1. **Always index on frequently queried fields:**
   - user_id, product_id, order_id, seller_id
   - status fields (order_status, verification_status)

2. **Use views for complex queries:**
   - Avoid repeated JOINs in application code
   - Let database handle aggregations

3. **Monitor slow queries:**
   - Check indexes on filter conditions
   - Use EXPLAIN to analyze query plans

4. **Batch operations when possible:**
   - Insert/update multiple records in single query
   - Use transactions for consistency

5. **Cache frequently accessed data:**
   - Product details (rarely change)
   - Seller profiles (change occasionally)
   - User info (changes on user action)

---

**Last Updated:** February 5, 2026
**Commit:** fa3b79c
