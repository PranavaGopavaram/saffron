export type { User, AddressInput } from './auth.model';
import { AddressInput } from './auth.model';

// Base registration fields
interface BaseRegistration {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

// Buyer registration
export interface BuyerRegistration extends BaseRegistration {
  role: 'buyer';
  companyName?: string;
  shippingAddress: AddressInput;
}

// Seller registration
export interface SellerRegistration extends BaseRegistration {
  role: 'seller';
  businessName: string;
  businessAddress: AddressInput;
  taxId: string;
  saffronSource: string;
  certifications?: File[];
}

export type RegistrationData = BuyerRegistration | SellerRegistration;
