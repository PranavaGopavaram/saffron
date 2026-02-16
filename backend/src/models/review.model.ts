export interface ProductReview {
  id: number;
  order_id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  rating: number;
  title?: string;
  comment?: string;
  authenticity_verified: boolean;
  would_recommend: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductReviewWithBuyer extends ProductReview {
  buyer_name: string;
  product_name?: string;
}

export interface SellerReview {
  id: number;
  seller_id: number;
  buyer_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
}

export interface SellerReviewWithBuyer extends SellerReview {
  buyer_name: string;
}


export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}


export interface CreateProductReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
  authenticity_verified?: boolean;
  would_recommend?: boolean;
}

export interface UpdateProductReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  authenticity_verified?: boolean;
  would_recommend?: boolean;
}

export interface CreateSellerReviewRequest {
  rating: number;
  comment?: string;
}
