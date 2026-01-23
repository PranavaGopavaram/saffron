/**
 * User Model - TypeScript Interfaces
 * Defines types for User, Address, and related data structures
 */

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'buyer' | 'seller';
  full_name: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Address {
  id?: number;
  user_id?: number;
  type: 'shipping' | 'business';
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default?: boolean;
}

export interface Buyer {
  id: number;
  user_id: number;
  company_name?: string;
  created_at: Date;
}

export interface Seller {
  id: number;
  user_id: number;
  business_name: string;
  tax_id: string;
  saffron_source: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: Date;
}

export interface SellerCertification {
  id: number;
  seller_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: Date;
}

/**
 * Registration Data - Received from frontend
 */
export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'buyer' | 'seller';
  
  // Buyer-specific
  companyName?: string;
  shippingAddress?: Address;
  
  // Seller-specific
  businessName?: string;
  businessAddress?: Address;
  taxId?: string;
  saffronSource?: string;
}

/**
 * Login Data - Received from frontend
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Auth Response - Sent to frontend
 */
export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: 'buyer' | 'seller';
    createdAt: Date;
  };
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  id: number;
  email: string;
  role: 'buyer' | 'seller';
  iat?: number;
  exp?: number;
}

/**
 * Express Request with User
 * Used by auth middleware to attach user to request
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
