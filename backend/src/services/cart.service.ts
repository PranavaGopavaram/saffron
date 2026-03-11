import { pool } from '../config/database';
import { MarketplaceBaseService } from './marketplace.base';
import {
  CartItemWithDetails,
  AddToCartRequest,
  UpdateCartRequest,
  CartSummary,
} from '../models/cart.model';
import {
  NotFoundError,
  ForbiddenError,
  InsufficientStockError,
} from '../utils/api-response';

class CartService extends MarketplaceBaseService {
  async addToCart(
    userId: number,
    data: AddToCartRequest
  ): Promise<CartItemWithDetails> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    const [variantRows] = await pool.query(
      'SELECT * FROM product_variants WHERE id = ?',
      [data.variant_id]
    );
    const variant = (variantRows as any[])[0];
    if (!variant) {
      throw new NotFoundError('Product variant not found');
    }
    const [existingRows] = await pool.query(
      'SELECT * FROM shopping_carts WHERE buyer_id = ? AND variant_id = ?',
      [buyerId, data.variant_id]
    );
    const existingItem = (existingRows as any[])[0];
    if (existingItem) {
     
      const newQuantity = existingItem.quantity + data.quantity;
     
      if (variant.stock_quantity < data.quantity) {
        throw new InsufficientStockError(
          `Insufficient stock. Available: ${variant.stock_quantity + existingItem.quantity}, requested total: ${newQuantity}`
        );
      }
  
      await this.withTransaction(async (connection) => {
        await connection.query(
          'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [data.quantity, data.variant_id]
        );
        // Updating the cart item quantity
        await connection.query(
          'UPDATE shopping_carts SET quantity = ? WHERE id = ?',
          [newQuantity, existingItem.id]
        );
      });
      return this.getCartItemWithDetails(existingItem.id, buyerId);
    } else {
      // inserting new item ino cart and check if requested quantity is available
     
      if (!(await this.checkStockAvailability(data.variant_id, data.quantity))) {
        throw new InsufficientStockError(
          `Insufficient stock. Available: ${variant.stock_quantity}, requested: ${data.quantity}`
        );
      }
     
      const [result] = await pool.query(
        'INSERT INTO shopping_carts (buyer_id, variant_id, quantity) VALUES (?, ?, ?)',
        [buyerId, data.variant_id, data.quantity]
      );
      const insertId = (result as any).insertId;
      return this.getCartItemWithDetails(insertId, buyerId);
    }
  }

  async getCart(userId: number): Promise<CartSummary> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
    const [rows] = await pool.query(
      `SELECT sc.id, sc.buyer_id AS user_id, sc.variant_id, sc.quantity,
              sc.added_at, sc.updated_at,
              pv.product_id, sp.product_name, pv.sku, pv.weight_grams,
              pv.price, 'INR' AS currency, pv.stock_quantity,
              sp.seller_id, s.business_name AS seller_name
       FROM shopping_carts sc
       JOIN product_variants pv ON sc.variant_id = pv.id
       JOIN saffron_products sp ON pv.product_id = sp.id
       JOIN sellers s ON sp.seller_id = s.id
       WHERE sc.buyer_id = ?`,
      [buyerId]
    );
    const items = rows as CartItemWithDetails[];

    let totalItems = 0;
    let totalPrice = 0;
    const totalBySeller: CartSummary['total_by_seller'] = {};
    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      totalItems += item.quantity;
      totalPrice += itemTotal;
      if (!totalBySeller[item.seller_id]) {
        totalBySeller[item.seller_id] = {
          seller_name: item.seller_name,
          subtotal: 0,
          item_count: 0,
        };
      }
      totalBySeller[item.seller_id].subtotal += itemTotal;
      totalBySeller[item.seller_id].item_count += item.quantity;
    }
    return {
      items,
      total_items: totalItems,
      total_price: this.roundPrice(totalPrice),
      total_by_seller: totalBySeller,
    };
  }

  async updateCartItem(
    userId: number,
    cartItemId: number,
    data: UpdateCartRequest
  ): Promise<CartItemWithDetails> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
   
    const [rows] = await pool.query(
      'SELECT * FROM shopping_carts WHERE id = ? AND buyer_id = ?',
      [cartItemId, buyerId]
    );
    const cartItem = (rows as any[])[0];
    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }
   
    const delta = data.quantity - cartItem.quantity;
    if (delta === 0) {
      return this.getCartItemWithDetails(cartItemId, buyerId);
    }
    if (delta > 0) {
     
      const available = await this.getAvailableStock(cartItem.variant_id);
      if (available < delta) {
        throw new InsufficientStockError(
          `Insufficient stock. Available to add: ${available}, requested increase: ${delta}`
        );
      }
    }
    
    await this.withTransaction(async (connection) => {
      
      await connection.query(
        'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [delta, cartItem.variant_id]
      );
      await connection.query(
        'UPDATE shopping_carts SET quantity = ? WHERE id = ?',
        [data.quantity, cartItemId]
      );
    });
    return this.getCartItemWithDetails(cartItemId, buyerId);
  }
 
  async removeCartItem(userId: number, cartItemId: number): Promise<void> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    const [rows] = await pool.query(
      'SELECT * FROM shopping_carts WHERE id = ? AND buyer_id = ?',
      [cartItemId, buyerId]
    );
    if ((rows as any[]).length === 0) {
      throw new NotFoundError('Cart item not found');
    }
    await pool.query('DELETE FROM shopping_carts WHERE id = ?', [cartItemId]);
  }
  async clearCart(userId: number): Promise<void> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
    
    await pool.query('DELETE FROM shopping_carts WHERE buyer_id = ?', [buyerId]);
  }

  async cleanupStaleCartItems(maxAgeHours: number = 24): Promise<number> {
    const [result] = await pool.query(
      'DELETE FROM shopping_carts WHERE added_at < NOW() - INTERVAL ? HOUR',
      [maxAgeHours]
    );
    return (result as any).affectedRows;
  }

  private async getCartItemWithDetails(
    cartItemId: number,
    buyerId: number
  ): Promise<CartItemWithDetails> {
    const [rows] = await pool.query(
      `SELECT sc.id, sc.buyer_id AS user_id, sc.variant_id, sc.quantity,
              sc.added_at, sc.updated_at,
              pv.product_id, sp.product_name, pv.sku, pv.weight_grams,
              pv.price, 'INR' AS currency, pv.stock_quantity,
              sp.seller_id, s.business_name AS seller_name
       FROM shopping_carts sc
       JOIN product_variants pv ON sc.variant_id = pv.id
       JOIN saffron_products sp ON pv.product_id = sp.id
       JOIN sellers s ON sp.seller_id = s.id
       WHERE sc.id = ? AND sc.buyer_id = ?`,
      [cartItemId, buyerId]
    );
    const item = (rows as any[])[0];
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }
    return item as CartItemWithDetails;
  }
}
export const cartService = new CartService();