# Backend Development - Next Steps

Now that the database schema is complete and documented, here's your roadmap for building the backend API.

## 📚 Reference Documentation

Before you start coding, familiarize yourself with:

1. **Database Schema**: `backend/database/schema.sql`
   - Complete 14-table database structure
   - All indexes, views, procedures, and triggers
   - Production-ready SQL

2. **Schema Changelog**: `SCHEMA_UPDATE.md`
   - Details about what changed
   - All new tables explained
   - Migration guide

3. **Developer Reference**: `backend/DATABASE_REFERENCE.md` ⭐ START HERE
   - Quick overview of all tables
   - 50+ SQL query examples
   - Common patterns for each table
   - Performance tips

## 🏗️ Architecture Overview

```
API Layer (Express Routes)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (MySQL)
```

## 📋 Development Phases

### Phase 1: Foundation (Data Access Layer)

**Goal**: Build TypeScript models and database access layer

**Tasks**:
- [ ] Create TypeScript interfaces for all 14 tables
- [ ] Build repository classes for each table
- [ ] Implement query helper functions
- [ ] Add database error handling

**Example Structure**:
```
src/
├── models/
│   ├── user.model.ts
│   ├── product.model.ts
│   ├── order.model.ts
│   └── ... (one per table)
├── repositories/
│   ├── user.repository.ts
│   ├── product.repository.ts
│   ├── order.repository.ts
│   └── ... (one per table)
└── database/
    └── query-helpers.ts
```

**Key Interfaces to Create**:
- User, Buyer, Seller, Address
- SaffronProduct, ProductVariant
- Order, OrderItem, PaymentTransaction
- Review, SellerReview
- ShoppingCart

### Phase 2: API Routes (Authentication)

**Goal**: Implement authentication and user management endpoints

**Status**: ALREADY DONE ✅
- POST /api/auth/register - Buyer & Seller registration
- POST /api/auth/login - User login
- GET /api/health - Health check

**To Enhance**:
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/refresh-token
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password
- [ ] GET /api/users/profile
- [ ] PUT /api/users/profile
- [ ] GET /api/users/addresses
- [ ] POST /api/users/addresses
- [ ] PUT /api/users/addresses/:id
- [ ] DELETE /api/users/addresses/:id

### Phase 3: Product Management API

**Goal**: Build product catalog endpoints

**Endpoints**:
- GET /api/products - List all products (with pagination, filtering)
- GET /api/products/:id - Get product details with variants and reviews
- POST /api/products - Create product (seller only)
- PUT /api/products/:id - Update product (seller only)
- DELETE /api/products/:id - Delete product (seller only)
- GET /api/products/:id/variants - Get all variants
- POST /api/products/:id/variants - Create variant
- PUT /api/products/variants/:id - Update variant
- GET /api/products/search - Search with filters (origin, grade, rating, etc.)
- GET /api/sellers/:id/products - Get seller's products
- GET /api/sellers/:id/reviews - Get seller reviews

**Database Queries** (see DATABASE_REFERENCE.md):
- Query saffron_products with JOIN to product_variants
- Get products with review counts and ratings
- Search by origin, grade, price range
- Filter by seller verification status

### Phase 4: Shopping & Cart Management

**Goal**: Implement shopping cart functionality

**Endpoints**:
- GET /api/carts - Get buyer's cart
- POST /api/carts - Add item to cart
- PUT /api/carts/:itemId - Update cart item quantity
- DELETE /api/carts/:itemId - Remove item from cart
- DELETE /api/carts - Clear cart
- GET /api/carts/total - Get cart total with tax/shipping

**Considerations**:
- Use shopping_carts table
- Validate stock via product_variants.stock_quantity
- Calculate totals from product_variants.price
- Handle quantity constraints

### Phase 5: Order Processing

**Goal**: Implement complete order workflow

**Endpoints**:
- POST /api/orders - Create order from cart
- GET /api/orders - Get buyer's orders
- GET /api/orders/:id - Get order details with items
- PUT /api/orders/:id/status - Update order status
- GET /api/orders/:id/items - Get order items
- GET /api/sellers/:id/orders - Get seller's orders (multi-seller)
- PUT /api/orders/:id/items/:itemId/status - Update item status

**Workflow**:
1. Create order record with order_number (unique)
2. Create order_items from cart
3. Clear shopping cart
4. Initialize payment transaction
5. Track order and item status

**Database Queries**:
- Get orders with buyer, addresses, and items
- Get seller's items across all orders
- Track multi-seller fulfillment

### Phase 6: Payment Integration

**Goal**: Implement payment processing

**Endpoints**:
- POST /api/payments - Initialize payment
- POST /api/payments/webhook - Handle payment gateway webhooks
- GET /api/payments/:orderId - Get payment details
- GET /api/sellers/:id/revenue - Get seller revenue

**Implementation**:
- Integrate Stripe or PayPal
- Store transaction details in payment_transactions
- Update order payment_status
- Track transaction reference from gateway
- Handle payment failures

### Phase 7: Reviews & Ratings

**Goal**: Implement review system

**Endpoints**:
- POST /api/reviews - Create product review
- GET /api/reviews/:productId - Get product reviews
- GET /api/sellers/:id/reviews - Get seller reviews
- POST /api/reviews/:id/helpful - Mark review as helpful
- DELETE /api/reviews/:id - Delete own review (verification)

**Features**:
- 1-5 star ratings with constraints
- Authenticity verification flag
- Helpful count tracking
- Review aggregation (average rating)
- Both product and seller reviews

### Phase 8: Seller Management

**Goal**: Implement seller verification and management

**Endpoints**:
- GET /api/sellers/:id - Get seller profile with stats
- POST /api/sellers/verify - Submit for verification
- POST /api/sellers/certifications - Upload certificate
- GET /api/sellers/:id/certifications - Get seller certs
- POST /api/admin/sellers/:id/verify - Admin verification
- GET /api/sellers/stats - Get seller statistics

**Admin Features**:
- Verify sellers (update verification_status)
- Review certifications
- Access seller statistics via stored procedure

### Phase 9: Advanced Features

**Goal**: Add search, filters, analytics

**Endpoints**:
- GET /api/search - Global product search
- GET /api/filters - Get available filters
- GET /api/admin/analytics - Platform analytics
- GET /api/dashboard - Seller dashboard stats

**Implementation**:
- Use database views for complex queries
- Implement full-text search
- Cache frequently accessed data
- Generate reports from views

## 🗄️ Database-First Development Tips

### 1. Use the Reference Guide
Every endpoint should start with the SQL query in `DATABASE_REFERENCE.md`:
```
// From guide:
SELECT * FROM saffron_products WHERE seller_id = ? AND status = 'active';

// Becomes:
public async getSellerProducts(sellerId: number) {
  return await query(
    'SELECT * FROM saffron_products WHERE seller_id = ? AND status = ?',
    [sellerId, 'active']
  );
}
```

### 2. Use Database Views
Don't write complex JOINs in code - use the built-in views:
```
// Instead of multiple JOINs:
SELECT * FROM buyer_profiles WHERE id = ?;
SELECT * FROM seller_profiles WHERE id = ?;
SELECT * FROM order_summary WHERE buyer_id = ?;
```

### 3. Use Stored Procedures
For complex operations:
```
CALL verify_seller(?);
CALL get_seller_stats(?);
CALL complete_order(?);
```

### 4. Leverage Triggers
- Inventory automatically decremented on cart add
- Inventory restored on cart remove
- Order status auto-updates when all items delivered

### 5. Follow Constraints
- CHECK constraints enforce rating 1-5
- UNIQUE constraints prevent duplicates
- FOREIGN KEY constraints maintain data integrity

## 📊 Testing Strategy

For each endpoint:

1. **Unit Tests**
   - Repository method functionality
   - Input validation
   - Error handling

2. **Integration Tests**
   - API endpoint behavior
   - Database transaction handling
   - Multi-seller order workflow

3. **Manual Tests (Postman)**
   - Happy path scenarios
   - Error cases
   - Edge cases (empty results, invalid IDs, etc.)

## 🔒 Security Considerations

1. **Authentication**
   - All routes except /register and /login require JWT
   - Use authenticateToken middleware

2. **Authorization**
   - Buyers can only access their own data
   - Sellers can only manage their products
   - Admins can verify sellers

3. **Data Validation**
   - Validate input on every endpoint
   - Use express-validator
   - Sanitize user inputs

4. **SQL Injection**
   - Always use parameterized queries (already using mysql2)
   - Never concatenate user input into SQL

5. **Rate Limiting**
   - Implement on auth endpoints
   - Implement on resource-heavy endpoints

## 📝 Code Example

Here's a pattern to follow:

```typescript
// repository/product.repository.ts
export async function getProductWithVariants(productId: number) {
  const sql = `
    SELECT sp.*, pv.*, ROUND(AVG(r.rating), 2) as avg_rating
    FROM saffron_products sp
    LEFT JOIN product_variants pv ON sp.id = pv.product_id
    LEFT JOIN reviews r ON sp.id = r.product_id
    WHERE sp.id = ?
    GROUP BY pv.id
  `;
  return await query(sql, [productId]);
}

// service/product.service.ts
export async function getProductDetails(productId: number) {
  const product = await getProductWithVariants(productId);
  if (!product.length) throw new NotFoundError('Product not found');
  return product;
}

// routes/product.routes.ts
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductDetails(parseInt(req.params.id));
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});
```

## 🎯 Priority Order

1. **HIGH PRIORITY**
   - Phase 1: Data access layer
   - Phase 3: Product management
   - Phase 4: Shopping cart
   - Phase 5: Orders

2. **MEDIUM PRIORITY**
   - Phase 6: Payments
   - Phase 7: Reviews

3. **LOWER PRIORITY**
   - Phase 2: Auth enhancements
   - Phase 8: Seller management
   - Phase 9: Advanced features

## ✅ Completion Checklist

- [ ] All TypeScript models created
- [ ] All repositories implemented
- [ ] Product endpoints complete
- [ ] Cart endpoints complete
- [ ] Order endpoints complete
- [ ] Payment integration done
- [ ] Review system working
- [ ] Seller verification working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing in Postman complete
- [ ] Error handling for all endpoints
- [ ] API documentation generated (Swagger)

## 📚 Additional Resources

- **MySQL**: backend/database/schema.sql
- **Queries**: backend/DATABASE_REFERENCE.md
- **Changelog**: SCHEMA_UPDATE.md
- **Backend Setup**: backend/README.md
- **API Docs**: backend/README.md (section: API Documentation)

---

**Status**: Ready for Phase 1 - Data Access Layer Development

**Next**: Create TypeScript models for all tables in `src/models/`

