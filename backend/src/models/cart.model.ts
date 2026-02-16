export interface CartItem {
  id: number;
  user_id: number;
  variant_id: number;
  quantity: number;
  added_at: Date;
  updated_at: Date;
}
export interface CartItemWithDetails extends CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  weight_grams: number;
  price: number;
  currency: string;
  stock_quantity: number;
  seller_id: number;
  seller_name: string;
}


export interface AddToCartRequest {
  variant_id: number;
  quantity: number;
}


export interface UpdateCartRequest {
  quantity: number;
}

export interface CartSummary {
  items: CartItemWithDetails[];
  total_items: number;
  total_price: number;
  total_by_seller: {
    [seller_id: number]: {
      seller_name: string;
      subtotal: number;
      item_count: number;
    };
  };
}
