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

export interface Order {
  id: number;
  buyer_id: number;
  order_number: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address_id: number;
  shipping_cost: number;
  delivery_date_estimated?: Date;
  created_at: Date;
  completed_at?: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  seller_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}
export interface OrderDetail {
  order: Order;
  items: OrderItemDetail[];
  buyer: {
    id: number;
    full_name: string;
    email: string;
  };
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}
export interface OrderItemDetail extends OrderItem {
  product_id: number;
  product_name: string;
  sku: string;
  weight_grams: number;
  seller_name: string;
  image: string | null;
}
export interface CreateOrderRequest {
  shipping_address_id?: number;
  shipping_cost?: number;
  shipping_method?: string;
}



export interface UpdateOrderStatusRequest {
  status: 'cancelled';
}

export interface UpdateItemStatusRequest {
  item_status: 'confirmed' | 'shipped' | 'delivered';
}
export interface OrderSummary {
  id: number;
  order_number: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  item_count: number;
  seller_count: number;
  first_item_image: string | null;
  first_item_id: number | null;
  created_at: Date;
}