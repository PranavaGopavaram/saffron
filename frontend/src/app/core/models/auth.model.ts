/**
 * Auth Models
 * TypeScript interfaces matching backend API structure
 */

// ==================== USER MODELS ====================

/**
 * User object returned from backend
 */
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: Date | string;
  phone?: string;
}

/**
 * Address structure
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;  // Frontend uses camelCase
  country: string;
}

/**
 * Address for backend (snake_case)
 */
export interface AddressBackend {
  street: string;
  city: string;
  state: string;
  zip_code: string;  // Backend uses snake_case
  country: string;
}

// ==================== REQUEST MODELS ====================

/**
 * Login request (frontend → backend)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Buyer registration request
 */
export interface BuyerRegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'buyer';
  companyName?: string;
  shippingAddress: Address;
}

/**
 * Seller registration request
 */
export interface SellerRegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: 'seller';
  businessName: string;
  businessAddress: Address;
  taxId: string;
  saffronSource: string;
}

// ==================== RESPONSE MODELS ====================

/**
 * Generic API response wrapper from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
}

/**
 * API error structure
 */
export interface ApiError {
  field?: string;
  message: string;
}

/**
 * Auth response from login/register
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * JWT Token Payload (decoded)
 */
export interface JWTPayload {
  id: number;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  iat?: number;  // Issued at (timestamp)
  exp?: number;  // Expiration (timestamp)
}

// ==================== STATE MODELS ====================

/**
 * Auth state for managing current user
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
