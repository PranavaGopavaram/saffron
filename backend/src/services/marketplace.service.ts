import { pool } from '../config/database';
import { MarketplaceBaseService } from './marketplace.base';
import {
  SellerProfile,
  SellerStats,
  SellerDashboard,
  BuyerProfile,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  UpdateBuyerProfileRequest,
  UpdateSellerProfileRequest,
} from '../models/marketplace.model';
import { getSellerStats as getSellerStatsProc } from '../utils/database-helpers';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/api-response';

class MarketplaceService extends MarketplaceBaseService {

  async getBuyerProfile(userId: number): Promise<BuyerProfile> {
    const [rows] = await pool.query(
      `SELECT b.id, b.user_id, b.company_name, b.created_at,
              u.full_name, u.email, u.phone
       FROM buyers b
       JOIN users u ON b.user_id = u.id
       WHERE b.user_id = ?`,
      [userId]
    );
    const buyer = (rows as any[])[0];
    if (!buyer) {
      throw new NotFoundError('Buyer profile not found');
    }

    // Compute order stats
    const [statsRows] = await pool.query(
      `SELECT COUNT(*) AS total_orders,
              COALESCE(SUM(total_amount), 0) AS total_spent
       FROM orders
       WHERE buyer_id = ? AND order_status != 'cancelled'`,
      [buyer.id]
    );
    const stats = (statsRows as any[])[0];

    // Fetch default shipping address ID
    const [addrRows] = await pool.query(
      "SELECT id FROM addresses WHERE user_id = ? AND type = 'shipping' AND is_default = TRUE LIMIT 1",
      [userId]
    );
    const defaultAddr = (addrRows as any[])[0];

    const totalOrders = stats.total_orders || 0;
    const totalSpent = parseFloat(stats.total_spent) || 0;

    return {
      id: buyer.id,
      user_id: buyer.user_id,
      company_name: buyer.company_name || undefined,
      full_name: buyer.full_name,
      email: buyer.email,
      phone: buyer.phone,
      total_orders: totalOrders,
      total_spent: this.roundPrice(totalSpent),
      average_order_value: totalOrders > 0 ? this.roundPrice(totalSpent / totalOrders) : 0,
      default_shipping_address_id: defaultAddr?.id || undefined,
      created_at: buyer.created_at,
    };
  }

  async updateBuyerProfile(
    userId: number,
    data: UpdateBuyerProfileRequest
  ): Promise<BuyerProfile> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    if (data.company_name !== undefined) {
      await pool.query(
        'UPDATE buyers SET company_name = ? WHERE id = ?',
        [data.company_name, buyerId]
      );
    }

    return this.getBuyerProfile(userId);
  }


  async getSellerProfile(userId: number): Promise<SellerProfile> {
    const [rows] = await pool.query(
      `SELECT s.id, s.user_id, s.business_name, s.tax_id,
              s.saffron_source, s.verification_status, s.created_at
       FROM sellers s
       WHERE s.user_id = ?`,
      [userId]
    );
    const seller = (rows as any[])[0];
    if (!seller) {
      throw new NotFoundError('Seller profile not found');
    }
    return seller as SellerProfile;
  }

  async getSellerStats(userId: number): Promise<SellerStats> {
    const sellerId = await this.getSellerIdFromUserId(userId);

    const procResult = await getSellerStatsProc(sellerId);

    return {
      total_products: procResult?.total_products || 0,
      total_orders: procResult?.total_orders || 0,
      total_revenue: parseFloat(procResult?.total_revenue) || 0,
      average_rating: parseFloat(procResult?.average_rating) || 0,
      total_reviews: procResult?.total_reviews || 0,
    };
  }

  async getSellerDashboard(userId: number): Promise<SellerDashboard> {
    const profile = await this.getSellerProfile(userId);
    const stats = await this.getSellerStats(userId);

    const [orderRows] = await pool.query(
      `SELECT DISTINCT o.id, o.order_number, o.total_amount,
              o.order_status AS status, o.created_at AS order_date
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.seller_id = ?
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [profile.id]
    );

    const [reviewRows] = await pool.query(
      `SELECT sr.id, sr.rating, sr.comment,
              u.full_name AS buyer_name, sr.created_at
       FROM seller_reviews sr
       JOIN buyers b ON sr.buyer_id = b.id
       JOIN users u ON b.user_id = u.id
       WHERE sr.seller_id = ?
       ORDER BY sr.created_at DESC
       LIMIT 5`,
      [profile.id]
    );

    return {
      profile,
      stats,
      recent_orders: orderRows as SellerDashboard['recent_orders'],
      recent_reviews: reviewRows as SellerDashboard['recent_reviews'],
    };
  }

  async updateSellerProfile(
    userId: number,
    data: UpdateSellerProfileRequest
  ): Promise<SellerProfile> {
    const sellerId = await this.getSellerIdFromUserId(userId);

    const setClauses: string[] = [];
    const params: any[] = [];

    if (data.business_name !== undefined) {
      setClauses.push('business_name = ?');
      params.push(data.business_name);
    }
    if (data.saffron_source !== undefined) {
      setClauses.push('saffron_source = ?');
      params.push(data.saffron_source);
    }

    if (setClauses.length === 0) {
      return this.getSellerProfile(userId);
    }

    params.push(sellerId);
    await pool.query(
      `UPDATE sellers SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );

    return this.getSellerProfile(userId);
  }


  async listAddresses(userId: number): Promise<Address[]> {
    const [rows] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return rows as Address[];
  }

  async getAddress(userId: number, addressId: number): Promise<Address> {
    const [rows] = await pool.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );
    const address = (rows as any[])[0];
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    return address as Address;
  }

  async createAddress(userId: number, data: CreateAddressRequest): Promise<Address> {
    return this.withTransaction(async (connection) => {
      if (data.is_default) {
        await connection.query(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND type = ?',
          [userId, data.type]
        );
      }
      const [existingRows] = await connection.query(
        'SELECT COUNT(*) AS count FROM addresses WHERE user_id = ? AND type = ?',
        [userId, data.type]
      );
      const isFirst = (existingRows as any[])[0].count === 0;
      const shouldBeDefault = data.is_default || isFirst;

      const [result] = await connection.query(
        `INSERT INTO addresses (user_id, type, street, city, state, zip_code, country, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, data.type, data.street, data.city, data.state, data.zip_code, data.country, shouldBeDefault]
      );
      const insertId = (result as any).insertId;

      const [rows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [insertId]
      );
      return (rows as any[])[0] as Address;
    });
  }

  async updateAddress(
    userId: number,
    addressId: number,
    data: UpdateAddressRequest
  ): Promise<Address> {
    const existing = await this.getAddress(userId, addressId);

    return this.withTransaction(async (connection) => {
      if (data.is_default === true) {
        await connection.query(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND type = ? AND id != ?',
          [userId, existing.type, addressId]
        );
      }

      const setClauses: string[] = [];
      const params: any[] = [];

      const allowedFields = ['street', 'city', 'state', 'zip_code', 'country', 'is_default'];
      for (const field of allowedFields) {
        if ((data as any)[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          params.push((data as any)[field]);
        }
      }

      if (setClauses.length === 0) {
        return existing;
      }

      params.push(addressId);
      await connection.query(
        `UPDATE addresses SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );

      const [rows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [addressId]
      );
      return (rows as any[])[0] as Address;
    });
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    const existing = await this.getAddress(userId, addressId);

    await pool.query('DELETE FROM addresses WHERE id = ?', [addressId]);

    if (existing.is_default) {
      const [rows] = await pool.query(
        'SELECT id FROM addresses WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [userId, existing.type]
      );
      const next = (rows as any[])[0];
      if (next) {
        await pool.query(
          'UPDATE addresses SET is_default = TRUE WHERE id = ?',
          [next.id]
        );
      }
    }
  }
}

export const marketplaceService = new MarketplaceService();
