import { pool } from '../config/database';
import { MarketplaceBaseService } from './marketplace.base';
import {
  Order,
  OrderItem,
  OrderDetail,
  OrderItemDetail,
  OrderSummary,
  CreateOrderRequest,
  UpdateItemStatusRequest,
} from '../models/order.model';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/api-response';
class OrderService extends MarketplaceBaseService {
 
    
  private async getBuyerIdFromUserId(userId: number): Promise<number> {
    const [rows] = await pool.query(
      'SELECT id FROM buyers WHERE user_id = ?',
      [userId]
    );
    const buyer = (rows as any[])[0];
    if (!buyer) {
      throw new NotFoundError('Buyer profile not found for this user');
    }
    return buyer.id;
  }

  
  private async getSellerIdFromUserId(userId: number): Promise<number> {
    const [rows] = await pool.query(
      'SELECT id FROM sellers WHERE user_id = ?',
      [userId]
    );
    const seller = (rows as any[])[0];
    if (!seller) {
      throw new NotFoundError('Seller profile not found for this user');
    }
    return seller.id;
  }
 
  
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SAF-${timestamp}-${random}`;
  }

  
  private readonly STATUS_ORDER: string[] = ['pending', 'confirmed', 'shipped', 'delivered'];
  private isValidStatusTransition(current: string, next: string): boolean {
    const currentIndex = this.STATUS_ORDER.indexOf(current);
    const nextIndex = this.STATUS_ORDER.indexOf(next);

    return currentIndex >= 0 && nextIndex > currentIndex;
  }
 

  async createOrder(userId: number, data: CreateOrderRequest): Promise<OrderDetail> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
  
    const [cartRows] = await pool.query(
      `SELECT sc.id, sc.variant_id, sc.quantity,
              pv.price, pv.stock_quantity,
              sp.seller_id
       FROM shopping_carts sc
       JOIN product_variants pv ON sc.variant_id = pv.id
       JOIN saffron_products sp ON pv.product_id = sp.id
       WHERE sc.buyer_id = ?`,
      [buyerId]
    );
    const cartItems = cartRows as any[];
    if (cartItems.length === 0) {
      throw new NotFoundError('Cart is empty. Add items before placing an order.');
    }
    
    let addressId = data.shipping_address_id;
    if (addressId) {
      
        
      const [addrRows] = await pool.query(
        "SELECT id FROM addresses WHERE id = ? AND user_id = ? AND type = 'shipping'",
        [addressId, userId]
      );
      if ((addrRows as any[]).length === 0) {
        throw new NotFoundError('Shipping address not found for this user');
      }
    } else {
     
      const [addrRows] = await pool.query(
        "SELECT id FROM addresses WHERE user_id = ? AND type = 'shipping' AND is_default = TRUE LIMIT 1",
        [userId]
      );
      const defaultAddr = (addrRows as any[])[0];
      if (!defaultAddr) {
        throw new NotFoundError('No shipping address found. Please add one before placing an order.');
      }
      addressId = defaultAddr.id;
    }
    
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += item.price * item.quantity;
    }
    totalAmount = this.roundPrice(totalAmount);
    const orderNumber = this.generateOrderNumber();
    
    const orderId = await this.withTransaction(async (connection) => {
      
      const [orderResult] = await connection.query(
        `INSERT INTO orders (buyer_id, order_number, total_amount, shipping_address_id, order_status, payment_status)
         VALUES (?, ?, ?, ?, 'pending', 'pending')`,
        [buyerId, orderNumber, totalAmount, addressId]
      );
      const newOrderId = (orderResult as any).insertId;
     
      for (const item of cartItems) {
        const subtotal = this.roundPrice(item.price * item.quantity);
        await connection.query(
          `INSERT INTO order_items (order_id, variant_id, seller_id, quantity, unit_price, subtotal, item_status)
           VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [newOrderId, item.variant_id, item.seller_id, item.quantity, item.price, subtotal]
        );
      }
     

      await connection.query(
        'DELETE FROM shopping_carts WHERE buyer_id = ?',
        [buyerId]
      );
      
      for (const item of cartItems) {
        await connection.query(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }
      return newOrderId;
    });
   
    return this.getOrderDetail(orderId, buyerId);
  }
  
  
  async getOrder(userId: number, orderId: number, role: string): Promise<OrderDetail> {
    if (role === 'seller') {
     

      const sellerId = await this.getSellerIdFromUserId(userId);
      const [check] = await pool.query(
        'SELECT 1 FROM order_items WHERE order_id = ? AND seller_id = ? LIMIT 1',
        [orderId, sellerId]
      );
      if ((check as any[]).length === 0) {
        throw new NotFoundError('Order not found or you have no items in this order');
      }
      return this.getOrderDetail(orderId);
    } else {
      
      const buyerId = await this.getBuyerIdFromUserId(userId);
      return this.getOrderDetail(orderId, buyerId);
    }
  }
  

  async listBuyerOrders(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: OrderSummary[]; total: number; page: number; limit: number }> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
    const { page: validPage, limit: validLimit } = this.validatePagination(page, limit);
    const query = `
      SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
             o.created_at,
             COUNT(oi.id) AS item_count,
             COUNT(DISTINCT oi.seller_id) AS seller_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.buyer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`;
    return this.getPaginatedResults(query, [buyerId], validPage, validLimit) as Promise<{
      data: OrderSummary[];
      total: number;
      page: number;
      limit: number;
    }>;
  }
 

  async listSellerOrders(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: OrderSummary[]; total: number; page: number; limit: number }> {
    const sellerId = await this.getSellerIdFromUserId(userId);
    const { page: validPage, limit: validLimit } = this.validatePagination(page, limit);
    const query = `
      SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
             o.created_at,
             COUNT(oi.id) AS item_count,
             COUNT(DISTINCT oi.seller_id) AS seller_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.seller_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`;
    return this.getPaginatedResults(query, [sellerId], validPage, validLimit) as Promise<{
      data: OrderSummary[];
      total: number;
      page: number;
      limit: number;
    }>;
  }
 
  
  async cancelOrder(userId: number, orderId: number): Promise<Order> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
  
    const [orderRows] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
      [orderId, buyerId]
    );
    const order = (orderRows as any[])[0];
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.order_status !== 'pending') {
      throw new ForbiddenError(
        `Cannot cancel order with status '${order.order_status}'. Only pending orders can be cancelled.`
      );
    }
   
    const [itemRows] = await pool.query(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );
    const items = itemRows as any[];
    await this.withTransaction(async (connection) => {
      await connection.query(
        "UPDATE orders SET order_status = 'cancelled' WHERE id = ?",
        [orderId]
      );
      await connection.query(
        "UPDATE order_items SET item_status = 'cancelled' WHERE order_id = ?",
        [orderId]
      );
      for (const item of items) {
        await connection.query(
          'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }
    });
    const [updatedRows] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    return (updatedRows as any[])[0] as Order;
  }

  
  async updateItemStatus(
    userId: number,
    orderId: number,
    itemId: number,
    data: UpdateItemStatusRequest
  ): Promise<OrderItemDetail> {
    const sellerId = await this.getSellerIdFromUserId(userId);
    const [itemRows] = await pool.query(
      'SELECT * FROM order_items WHERE id = ? AND order_id = ? AND seller_id = ?',
      [itemId, orderId, sellerId]
    );
    const orderItem = (itemRows as any[])[0];
    if (!orderItem) {
      throw new NotFoundError('Order item not found or does not belong to you');
    }
    if (!this.isValidStatusTransition(orderItem.item_status, data.item_status)) {
      throw new ForbiddenError(
        `Cannot transition item status from '${orderItem.item_status}' to '${data.item_status}'`
      );
    }
    await this.withTransaction(async (connection) => {
      await connection.query(
        'UPDATE order_items SET item_status = ? WHERE id = ?',
        [data.item_status, itemId]
      );
      if (data.item_status === 'confirmed') {
        await connection.query(
          "UPDATE orders SET order_status = 'confirmed' WHERE id = ? AND order_status = 'pending'",
          [orderId]
        );
      }
      if (data.item_status === 'shipped') {
        const [countRows] = await connection.query(
          `SELECT 
             COUNT(*) AS total,
             SUM(CASE WHEN item_status IN ('shipped', 'delivered') OR id = ? THEN 1 ELSE 0 END) AS shipped_or_above
           FROM order_items WHERE order_id = ?`,
          [itemId, orderId]
        );
        const counts = (countRows as any[])[0];
        if (counts.total === counts.shipped_or_above) {
          await connection.query(
            "UPDATE orders SET order_status = 'shipped' WHERE id = ?",
            [orderId]
          );
        }
      }
    });


    return this.getOrderItemDetail(itemId, orderId);
  }
  private async getOrderDetail(orderId: number, buyerId?: number): Promise<OrderDetail> {
    let orderQuery = 'SELECT * FROM orders WHERE id = ?';
    const orderParams: any[] = [orderId];
    if (buyerId !== undefined) {
      orderQuery += ' AND buyer_id = ?';
      orderParams.push(buyerId);
    }
    const [orderRows] = await pool.query(orderQuery, orderParams);
    const order = (orderRows as any[])[0];
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    const [itemRows] = await pool.query(
      `SELECT oi.id, oi.order_id, oi.variant_id, oi.seller_id, oi.quantity,
              oi.unit_price, oi.subtotal, oi.item_status,
              oi.created_at, oi.updated_at,
              sp.product_name, pv.sku, pv.weight_grams,
              s.business_name AS seller_name
       FROM order_items oi
       JOIN product_variants pv ON oi.variant_id = pv.id
       JOIN saffron_products sp ON pv.product_id = sp.id
       JOIN sellers s ON oi.seller_id = s.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const [buyerRows] = await pool.query(
      `SELECT b.id, u.full_name, u.email
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [order.buyer_id]
    );

    const [addrRows] = await pool.query(
      'SELECT street, city, state, zip_code, country FROM addresses WHERE id = ?',
      [order.shipping_address_id]
    );
    return {
      order: order as Order,
      items: itemRows as OrderItemDetail[],
      buyer: (buyerRows as any[])[0] || { id: order.buyer_id, full_name: 'Unknown', email: '' },
      shipping_address: (addrRows as any[])[0] || {
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
      },
    };
  }
  private async getOrderItemDetail(itemId: number, orderId: number): Promise<OrderItemDetail> {
    const [rows] = await pool.query(
      `SELECT oi.id, oi.order_id, oi.variant_id, oi.seller_id, oi.quantity,
              oi.unit_price, oi.subtotal, oi.item_status,
              oi.created_at, oi.updated_at,
              sp.product_name, pv.sku, pv.weight_grams,
              s.business_name AS seller_name
       FROM order_items oi
       JOIN product_variants pv ON oi.variant_id = pv.id
       JOIN saffron_products sp ON pv.product_id = sp.id
       JOIN sellers s ON oi.seller_id = s.id
       WHERE oi.id = ? AND oi.order_id = ?`,
      [itemId, orderId]
    );
    const item = (rows as any[])[0];
    if (!item) {
      throw new NotFoundError('Order item not found');
    }
    return item as OrderItemDetail;
  }
}
export const orderService = new OrderService();