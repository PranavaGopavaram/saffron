import { pool } from '../config/database';
import {
  getTransactionConnection,
  commitTransaction,
  rollbackTransaction,
} from '../utils/database-helpers';
import { NotFoundError } from '../utils/api-response';


export abstract class MarketplaceBaseService {
 
  protected async getBuyerIdFromUserId(userId: number): Promise<number> {
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


  protected async getSellerIdFromUserId(userId: number): Promise<number> {
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


  protected async isOwner(
    userId: number,
    resourceOwnerId: number
  ): Promise<boolean> {
    return userId === resourceOwnerId;
  }

  protected async getPaginatedResults(
    query: string,
    params: any[],
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const baseQuery = query.split('ORDER BY')[0].split('LIMIT')[0];
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_table`;

    const connection = await pool.getConnection();
    try {
      const [countRows] = await connection.query(countQuery, params);
      const total = (countRows as any[])[0]?.total || 0;
      const offset = (page - 1) * limit;
      const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
      const [data] = await connection.query(paginatedQuery, [
        ...params,
        limit,
        offset,
      ]);

      return {
        data: data as any[],
        total,
        page,
        limit,
      };
    } finally {
      connection.release();
    }
  }


  protected async checkStockAvailability(
    variantId: number,
    quantity: number
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT stock_quantity FROM product_variants WHERE id = ?',
      [variantId]
    );
    connection.release();

    const variant = (rows as any[])[0];
    return variant && variant.stock_quantity >= quantity;
  }

  protected async getAvailableStock(variantId: number): Promise<number> {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT stock_quantity FROM product_variants WHERE id = ?',
      [variantId]
    );
    connection.release();

    const variant = (rows as any[])[0];
    return variant ? variant.stock_quantity : 0;
  }


  protected async withTransaction<T>(
    callback: (connection: any) => Promise<T>
  ): Promise<T> {
    const connection = await getTransactionConnection();
    try {
      const result = await callback(connection);
      await commitTransaction(connection);
      return result;
    } catch (error) {
      await rollbackTransaction(connection);
      throw error;
    }
  }

 
  protected roundPrice(price: number): number {
    return Math.round(price * 100) / 100;
  }

 
  protected validatePagination(
    page: number,
    limit: number
  ): { page: number; limit: number } {
    const validPage = Math.max(1, page || 1);
    const validLimit = Math.min(100, Math.max(1, limit || 20));
    return { page: validPage, limit: validLimit };
  }
}
