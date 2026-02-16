export enum SellerVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export interface SellerProfile {
  id: number;
  user_id: number;
  business_name: string;
  tax_id: string;
  saffron_source: string;
  verification_status: SellerVerificationStatus;
  created_at: Date;
}

export interface SellerStats {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
}

export interface SellerDashboard {
  profile: SellerProfile;
  stats: SellerStats;
  recent_orders: Array<{
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    order_date: Date;
  }>;
  recent_reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    buyer_name: string;
    created_at: Date;
  }>;
}

export interface BuyerProfile {
  id: number;
  user_id: number;
  company_name?: string;
  full_name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  default_shipping_address_id?: number;
  created_at: Date;
}

export interface PlatformStats {
  total_users: number;
  total_sellers: number;
  total_buyers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'business';
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
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

export interface UpdateBuyerProfileRequest {
  company_name?: string;
}

export interface UpdateSellerProfileRequest {
  business_name?: string;
  saffron_source?: string;
}
