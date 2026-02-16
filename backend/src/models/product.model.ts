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

export interface SaffronProduct {
  id: number;
  seller_id: number;
  product_name: string;
  description: string;
  origin: string;
  grade: ProductGrade;
  color_rating: number; 
  aroma_score: number; 
  iso_certification: boolean;
  moisture_level: number;
  images?: string[];
  status: ProductStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  weight_grams: number;
  price: number;
  package_type?: string;
  stock_quantity: number;
  created_at: Date;
  updated_at: Date;
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

export interface ProductResponse {
  product: SaffronProduct;
  variants: ProductVariant[];
  seller_info: {
    id: number;
    business_name: string;
    average_rating: number;
  };
}
