# Marketplace Frontend Implementation Guide

## Phase 1: Foundation

### Step 1: Create Marketplace Data Models
**File:** `frontend/src/app/features/landing/models/marketplace.model.ts`

Create TypeScript interfaces matching backend API structure:

- **Enums:**
  - `ProductGrade` (PREMIUM, FIRST, SECOND, THIRD)
  - `ProductStatus` (ACTIVE, INACTIVE, ARCHIVED)
  - `OrderStatus` (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REFUNDED)
  - `PaymentStatus` (PENDING, COMPLETED, FAILED, REFUNDED)
  - `SellerVerificationStatus` (PENDING, VERIFIED, REJECTED, SUSPENDED)

- **Product Interfaces:**
  - `Product` - Product with camelCase fields
  - `ProductVariant` - Product variant (size, weight, price)
  - `ProductResponse` - Full product with seller info
  - `CreateProductRequest` - POST request (snake_case)
  - `CreateVariantRequest` - POST variant request

- **Cart Interfaces:**
  - `CartItem` - Basic cart item
  - `CartItemWithDetails` - Cart item with product details
  - `CartSummary` - Full cart with totals
  - `AddToCartRequest` - POST cart (snake_case)
  - `UpdateCartRequest` - PUT cart (snake_case)

- **Order Interfaces:**
  - `Order` - Order details
  - `OrderItem` - Individual order item
  - `OrderItemDetail` - Order item with product info
  - `OrderDetail` - Full order with buyer/shipping info
  - `OrderSummary` - Order list item
  - `CreateOrderRequest` - POST order
  - `UpdateItemStatusRequest` - PATCH item status

- **Review Interfaces:**
  - `ProductReview` - Product review
  - `ProductReviewWithBuyer` - Review with buyer name
  - `SellerReview` - Seller review
  - `ReviewSummary` - Rating breakdown
  - `CreateProductReviewRequest` - POST product review
  - `CreateSellerReviewRequest` - POST seller review

- **Marketplace/Profile Interfaces:**
  - `SellerProfile` - Seller business info
  - `SellerStats` - Seller dashboard stats
  - `SellerDashboard` - Full seller dashboard
  - `BuyerProfile` - Buyer profile
  - `PlatformStats` - Admin platform stats

- **Address Interfaces:**
  - `Address` - Address (camelCase)
  - `CreateAddressRequest` - POST address (snake_case)
  - `UpdateAddressRequest` - PUT address (snake_case)

---

### Step 2: Create Product Service
**File:** `frontend/src/app/features/buyer/services/product.service.ts`

| Method | HTTP | Endpoint | Auth |
|--------|------|----------|------|
| `getProducts(filters?)` | GET | `/products?grade=&min_price=&max_price=&origin=&page=&limit=` | Any |
| `getProductById(id)` | GET | `/products/:id` | Any |
| `createProduct(data)` | POST | `/products` | Seller |
| `updateProduct(id, data)` | PUT | `/products/:id` | Seller |
| `deleteProduct(id)` | DELETE | `/products/:id` | Seller |
| `addVariant(productId, data)` | POST | `/products/:productId/variants` | Seller |

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  
  getProducts(filters?: { grade?: ProductGrade; minPrice?: number; maxPrice?: number; origin?: string; page?: number; limit?: number; }): Observable<ApiResponse<ProductResponse[]>>
  getProductById(id: number): Observable<ApiResponse<ProductResponse>>
  createProduct(data: CreateProductRequest): Observable<ApiResponse<ProductResponse>>
  updateProduct(id: number, data: Partial<CreateProductRequest>): Observable<ApiResponse<ProductResponse>>
  deleteProduct(id: number): Observable<ApiResponse<void>>
  addVariant(productId: number, data: CreateVariantRequest): Observable<ApiResponse<ProductVariant>>
}
```

---

### Step 3: Create Cart Service
**File:** `frontend/src/app/features/buyer/services/cart.service.ts`

| Method | HTTP | Endpoint | Auth |
|--------|------|----------|------|
| `getCart()` | GET | `/cart` | Buyer |
| `addItem(variantId, quantity)` | POST | `/cart` | Buyer |
| `updateItemQuantity(cartItemId, quantity)` | PUT | `/cart/:cartItemId` | Buyer |
| `removeItem(cartItemId)` | DELETE | `/cart/:cartItemId` | Buyer |
| `clearCart()` | DELETE | `/cart` | Buyer |
| `cleanupStaleItems()` | POST | `/cart/cleanup` | Seller |

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  
  getCart(): Observable<ApiResponse<CartSummary>>
  addItem(variantId: number, quantity: number): Observable<ApiResponse<CartSummary>>
  updateItemQuantity(cartItemId: number, quantity: number): Observable<ApiResponse<CartSummary>>
  removeItem(cartItemId: number): Observable<ApiResponse<CartSummary>>
  clearCart(): Observable<ApiResponse<void>>
  cleanupStaleItems(): Observable<ApiResponse<{ removedCount: number }>>
}
```

---

### Step 4: Create Order Service
**File:** `frontend/src/app/features/buyer/services/order.service.ts`

| Method | HTTP | Endpoint | Auth |
|--------|------|----------|------|
| `createOrder(shippingAddressId?)` | POST | `/orders` | Buyer |
| `getMyOrders()` | GET | `/orders/my-orders` | Buyer |
| `getSellerOrders()` | GET | `/orders/seller-orders` | Seller |
| `getOrderById(orderId)` | GET | `/orders/:orderId` | Any |
| `cancelOrder(orderId)` | PATCH | `/orders/:orderId/cancel` | Buyer |
| `updateItemStatus(orderId, itemId, status)` | PATCH | `/orders/:orderId/items/:itemId/status` | Seller |

```typescript
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;
  
  createOrder(shippingAddressId?: number): Observable<ApiResponse<OrderDetail>>
  getMyOrders(): Observable<ApiResponse<OrderSummary[]>>
  getSellerOrders(): Observable<ApiResponse<OrderSummary[]>>
  getOrderById(orderId: number): Observable<ApiResponse<OrderDetail>>
  cancelOrder(orderId: number): Observable<ApiResponse<Order>>
  updateItemStatus(orderId: number, itemId: number, status: 'confirmed' | 'shipped' | 'delivered'): Observable<ApiResponse<OrderItem>>
}
```

---

### Step 5: Create Review Service
**File:** `frontend/src/app/features/buyer/services/review.service.ts`

| Method | HTTP | Endpoint | Auth |
|--------|------|----------|------|
| `getMyReviews()` | GET | `/reviews/my` | Buyer |
| `getProductReviews(productId)` | GET | `/reviews/products/:productId` | Any |
| `getProductReviewSummary(productId)` | GET | `/reviews/products/:productId/summary` | Any |
| `createProductReview(productId, data)` | POST | `/reviews/products/:productId` | Buyer |
| `updateProductReview(reviewId, data)` | PUT | `/reviews/:reviewId` | Buyer |
| `deleteProductReview(reviewId)` | DELETE | `/reviews/:reviewId` | Buyer |
| `createSellerReview(sellerId, data)` | POST | `/reviews/sellers/:sellerId` | Buyer |
| `getSellerReviews(sellerId)` | GET | `/reviews/sellers/:sellerId` | Any |
| `deleteSellerReview(reviewId)` | DELETE | `/reviews/sellers/:reviewId` | Buyer |

```typescript
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;
  
  getMyReviews(): Observable<ApiResponse<ProductReviewWithBuyer[]>>
  getProductReviews(productId: number): Observable<ApiResponse<ProductReviewWithBuyer[]>>
  getProductReviewSummary(productId: number): Observable<ApiResponse<ReviewSummary>>
  createProductReview(productId: number, data: CreateProductReviewRequest): Observable<ApiResponse<ProductReview>>
  updateProductReview(reviewId: number, data: Partial<CreateProductReviewRequest>): Observable<ApiResponse<ProductReview>>
  deleteProductReview(reviewId: number): Observable<ApiResponse<void>>
  createSellerReview(sellerId: number, data: CreateSellerReviewRequest): Observable<ApiResponse<SellerReview>>
  getSellerReviews(sellerId: number): Observable<ApiResponse<SellerReviewWithBuyer[]>>
  deleteSellerReview(reviewId: number): Observable<ApiResponse<void>>
}
```

---

### Step 6: Create Marketplace/Address Service
**File:** `frontend/src/app/features/buyer/services/marketplace.service.ts`

| Method | HTTP | Endpoint | Auth |
|--------|------|----------|------|
| `getBuyerProfile()` | GET | `/marketplace/profile/buyer` | Buyer |
| `updateBuyerProfile(data)` | PUT | `/marketplace/profile/buyer` | Buyer |
| `getSellerProfile()` | GET | `/marketplace/profile/seller` | Seller |
| `updateSellerProfile(data)` | PUT | `/marketplace/profile/seller` | Seller |
| `getSellerStats()` | GET | `/marketplace/profile/seller/stats` | Seller |
| `getSellerDashboard()` | GET | `/marketplace/profile/seller/dashboard` | Seller |
| `getAddresses()` | GET | `/marketplace/addresses` | Any |
| `createAddress(data)` | POST | `/marketplace/addresses` | Any |
| `getAddressById(id)` | GET | `/marketplace/addresses/:id` | Any |
| `updateAddress(id, data)` | PUT | `/marketplace/addresses/:id` | Any |
| `deleteAddress(id)` | DELETE | `/marketplace/addresses/:id` | Any |

```typescript
@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly apiUrl = `${environment.apiUrl}/marketplace`;
  
  // Buyer
  getBuyerProfile(): Observable<ApiResponse<BuyerProfile>>
  updateBuyerProfile(data: { companyName?: string }): Observable<ApiResponse<BuyerProfile>>
  
  // Seller
  getSellerProfile(): Observable<ApiResponse<SellerProfile>>
  updateSellerProfile(data: { businessName?: string; saffronSource?: string }): Observable<ApiResponse<SellerProfile>>
  getSellerStats(): Observable<ApiResponse<SellerStats>>
  getSellerDashboard(): Observable<ApiResponse<SellerDashboard>>
  
  // Addresses
  getAddresses(): Observable<ApiResponse<Address[]>>
  createAddress(data: CreateAddressRequest): Observable<ApiResponse<Address>>
  getAddressById(id: number): Observable<ApiResponse<Address>>
  updateAddress(id: number, data: UpdateAddressRequest): Observable<ApiResponse<Address>>
  deleteAddress(id: number): Observable<ApiResponse<void>>
}
```

---

### Step 7: Register Services in Providers
**File:** `frontend/src/app/app.config.ts`

Services are already provided via `providedIn: 'root'`, so no changes needed.

If using feature providers, add to app.config.ts:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

---

### Step 8: Add Buyer Routes
**File:** `frontend/src/app/app.routes.ts`

Add these routes:

```typescript
{
  path: 'buyer',
  canActivate: [authGuard],
  children: [
    { path: 'products', loadComponent: () => import('./features/buyer/products/product-list/product-list.component').then(m => m.ProductListComponent) },
    { path: 'products/:id', loadComponent: () => import('./features/buyer/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
    { path: 'cart', loadComponent: () => import('./features/buyer/cart/cart.component').then(m => m.CartComponent) },
    { path: 'checkout', loadComponent: () => import('./features/buyer/checkout/checkout.component').then(m => m.CheckoutComponent) },
    { path: 'orders', loadComponent: () => import('./features/buyer/orders/order-list/order-list.component').then(m => m.OrderListComponent) },
    { path: 'orders/:id', loadComponent: () => import('./features/buyer/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
    { path: 'addresses', loadComponent: () => import('./features/buyer/addresses/address-list/address-list.component').then(m => m.AddressListComponent) }
  ]
}
```

---

### Step 9: Create UI Components

Create the following components in `frontend/src/app/features/buyer/`:

#### Product Components
| Component | Path | Description |
|-----------|------|-------------|
| `ProductListComponent` | `buyer/products/product-list/` | Grid of products with filters |
| `ProductDetailComponent` | `buyer/products/product-detail/` | Full product view with variants |

#### Cart Components
| Component | Path | Description |
|-----------|------|-------------|
| `CartComponent` | `buyer/cart/` | Cart items with quantity controls |

#### Checkout Components
| Component | Path | Description |
|-----------|------|-------------|
| `CheckoutComponent` | `buyer/checkout/` | Address selection + order placement |

#### Order Components
| Component | Path | Description |
|-----------|------|-------------|
| `OrderListComponent` | `buyer/orders/order-list/` | Buyer's order history |
| `OrderDetailComponent` | `buyer/orders/order-detail/` | Single order details |

#### Address Components
| Component | Path | Description |
|-----------|------|-------------|
| `AddressListComponent` | `buyer/addresses/address-list/` | Manage saved addresses |
| `AddressFormComponent` | `buyer/addresses/address-form/` | Add/edit address form |

---

## Files Summary

| Step | File | Status |
|------|------|--------|
| 1 | `frontend/src/app/features/landing/models/marketplace.model.ts` | ✅ Done |
| 2 | `frontend/src/app/features/buyer/services/product.service.ts` | ✅ Done |
| 3 | `frontend/src/app/features/buyer/services/cart.service.ts` | Pending |
| 4 | `frontend/src/app/features/buyer/services/order.service.ts` | Pending |
| 5 | `frontend/src/app/features/buyer/services/review.service.ts` | Pending |
| 6 | `frontend/src/app/features/buyer/services/marketplace.service.ts` | Pending |
| 7 | `app.config.ts` | N/A (providedIn: 'root') |
| 8 | `app.routes.ts` | Pending |
| 9 | UI Components | Pending |

---

## API Endpoints Reference

### Products
- `POST /products` - Create product
- `GET /products` - List products
- `GET /products/:id` - Get product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:productId/variants` - Add variant

### Cart
- `POST /cart` - Add item
- `GET /cart` - Get cart
- `DELETE /cart` - Clear cart
- `PUT /cart/:cartItemId` - Update quantity
- `DELETE /cart/:cartItemId` - Remove item

### Orders
- `POST /orders` - Create order
- `GET /orders/my-orders` - Buyer's orders
- `GET /orders/seller-orders` - Seller's orders
- `GET /orders/:orderId` - Order details
- `PATCH /orders/:orderId/cancel` - Cancel order
- `PATCH /orders/:orderId/items/:itemId/status` - Update item status

### Reviews
- `GET /reviews/my` - My reviews
- `POST /reviews/products/:productId` - Create product review
- `GET /reviews/products/:productId` - Get product reviews
- `GET /reviews/products/:productId/summary` - Get review summary
- `PUT /reviews/:reviewId` - Update review
- `DELETE /reviews/:reviewId` - Delete review
- `POST /reviews/sellers/:sellerId` - Create seller review
- `GET /reviews/sellers/:sellerId` - Get seller reviews

### Marketplace
- `GET /marketplace/profile/buyer` - Get buyer profile
- `PUT /marketplace/profile/buyer` - Update buyer profile
- `GET /marketplace/profile/seller` - Get seller profile
- `PUT /marketplace/profile/seller` - Update seller profile
- `GET /marketplace/profile/seller/stats` - Seller stats
- `GET /marketplace/profile/seller/dashboard` - Seller dashboard
- `GET /marketplace/addresses` - List addresses
- `POST /marketplace/addresses` - Create address
- `GET /marketplace/addresses/:id` - Get address
- `PUT /marketplace/addresses/:id` - Update address
- `DELETE /marketplace/addresses/:id` - Delete address
