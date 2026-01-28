// Address interface (shared by buyer and seller)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Base registration fields
interface BaseRegistration {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;  // Added for form validation
  phone: string;
}

// Buyer-specific registration
export interface BuyerRegistration extends BaseRegistration {
  role: 'buyer';
  companyName?: string;
  shippingAddress: Address;
}

// Seller-specific registration
export interface SellerRegistration extends BaseRegistration {
  role: 'seller';
  businessName: string;
  businessAddress: Address;
  taxId: string;
  saffronSource: string;
  certifications?: File[];
}

// Union type for type safety
export type RegistrationData = BuyerRegistration | SellerRegistration;

// User interface for authentication
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  createdAt: Date | string;
}
