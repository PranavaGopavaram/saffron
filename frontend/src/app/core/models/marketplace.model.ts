export type { ApiResponse, ApiError } from './auth.model';

export enum ProductGrade {
  PREMIUM = 'premium',
  FIRST = 'first',
  SECOND = 'second',
  THIRD = 'third',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum SellerVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface Product {
  id: number;
  sellerId: number;
  productName: string;
  description: string;
  origin: string;
  grade: ProductGrade;
  colorRating: number;
  aromaScore: number;
  isoCertification: boolean;
  moistureLevel: number;
  images?: string[];
  status: ProductStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  weightGrams: number;
  price: number;
  packageType?: string;
  stockQuantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProductResponse {
  product: Product;
  variants: ProductVariant[];
  sellerInfo: {
    id: number;
    businessName: string;
    averageRating: number;
  };
}

export interface CreateProductRequest {
  product_name: string;
  description: string;
  origin: string;
  grade: ProductGrade;
  color_rating: number;
  aroma_score: number;
  iso_certification: boolean;
  moisture_level: number;
}

export interface CreateVariantRequest {
  sku: string;
  weight_grams: number;
  price: number;
  package_type?: string;
  stock_quantity: number;
}

export interface CartItem {
  id: number;
  userId: number;
  variantId: number;
  quantity: number;
  addedAt: Date | string;
  updatedAt: Date | string;
}

export interface CartItemWithDetails extends CartItem {
  productId: number;
  productName: string;
  sku: string;
  weightGrams: number;
  price: number;
  currency: string;
  stockQuantity: number;
  sellerId: number;
  sellerName: string;
}

export interface CartSummary {
  items: CartItemWithDetails[];
  totalItems: number;
  totalPrice: number;
  totalBySeller: {
    [sellerId: number]: {
      sellerName: string;
      subtotal: number;
      itemCount: number;
    };
  };
}

export interface AddToCartRequest {
  variant_id: number;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export interface Order {
  id: number;
  buyerId: number;
  orderNumber: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddressId: number;
  shippingCost: number;
  deliveryDateEstimated?: Date;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  sellerId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  itemStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDetail extends OrderItem {
  productId: number;
  productName: string;
  sku: string;
  weightGrams: number;
  sellerName: string;
  image: string | null;
}

export interface OrderDetail {
  order: Order;
  items: OrderItemDetail[];
  buyer: {
    id: number;
    fullName: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  sellerCount: number;
  firstItemImage: string | null;
  firstItemId: number | null;
  createdAt: Date;
}

export interface CreateOrderRequest {
  shipping_address_id?: number;
  shipping_cost?: number;
}

export interface UpdateItemStatusRequest {
  item_status: 'confirmed' | 'shipped' | 'delivered';
}

export interface ProductReview {
  id: number;
  orderId: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  rating: number;
  title?: string;
  comment?: string;
  authenticityVerified: boolean;
  wouldRecommend: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReviewWithBuyer extends ProductReview {
  buyerName: string;
  productName?: string;
}

export interface SellerReview {
  id: number;
  sellerId: number;
  buyerId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface SellerReviewWithBuyer extends SellerReview {
  buyerName: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    [key: number]: number;
  };
}

export interface CreateProductReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
  authenticity_verified?: boolean;
  would_recommend?: boolean;
}

export interface CreateSellerReviewRequest {
  rating: number;
  comment?: string;
}

export interface SellerProfile {
  id: number;
  userId: number;
  businessName: string;
  taxId: string;
  saffronSource: string;
  verificationStatus: SellerVerificationStatus;
  createdAt: Date;
}

export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface SellerDashboard {
  profile: SellerProfile;
  stats: SellerStats;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: string;
    orderDate: Date;
  }>;
  recentReviews: Array<{
    id: number;
    rating: number;
    comment: string;
    buyerName: string;
    createdAt: Date;
  }>;
}

export interface BuyerProfile {
  id: number;
  userId: number;
  companyName?: string;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  defaultShippingAddressId?: number;
  createdAt: Date;
}

export interface PlatformStats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface Address {
  id: number;
  userId: number;
  type: 'shipping' | 'business';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressRequest {
  type: 'shipping' | 'business';
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}
