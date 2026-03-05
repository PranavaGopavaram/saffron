import { pool } from '../config/database';
import { MarketplaceBaseService } from './marketplace.base';


import {
  SaffronProduct,
  ProductVariant,
  CreateProductRequest,
  CreateVariantRequest,
  ProductResponse,
} from '../models/product.model';


import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
} from '../utils/api-response';

interface ProductFilters {
  grade?: string;
  origin?: string;
  min_price?: number;
  max_price?: number;
}

class ProductService extends MarketplaceBaseService {
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

  async createProduct(
    userId: number,
    data: CreateProductRequest
  ): Promise<SaffronProduct> 
    {
    const sellerId = await this.getSellerIdFromUserId(userId);

    const product = await this.withTransaction(async (connection) => {
      const [result] = await connection.query(
        `INSERT INTO saffron_products 
          (seller_id, product_name, description, origin, grade, color_rating, aroma_score, iso_certification, moisture_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId,
          data.product_name,
          data.description,
          data.origin,
          data.grade,
          data.color_rating,
          data.aroma_score,
          data.iso_certification,
          data.moisture_level,
        ]
      );

      const insertId = (result as any).insertId;

  
      const [rows] = await connection.query(
        'SELECT * FROM saffron_products WHERE id = ?',
        [insertId]
      );

      return (rows as any[])[0] as SaffronProduct;
    });

    return product;
  }

  async getProduct(productId: number): Promise<ProductResponse | null> {
    const [productRows] = await pool.query(
      'SELECT * FROM saffron_products WHERE id = ? AND status != ?',
      [productId, 'archived']
    );
    const product = (productRows as any[])[0];
    if (!product) {
      return null;
    }

    if (product.images && typeof product.images === 'string') {
      product.images = JSON.parse(product.images);
    }
    const [variantRows] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [productId]
    );



    //info of seller with avg ratigns
    const [sellerRows] = await pool.query(
      `SELECT s.id, s.business_name, ROUND(AVG(sr.rating), 1) AS average_rating
       FROM sellers s
       LEFT JOIN seller_reviews sr ON s.id = sr.seller_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [product.seller_id]
    );
    const seller = (sellerRows as any[])[0];

    return {
      product: product as SaffronProduct,
      variants: variantRows as ProductVariant[],
      seller_info: {
        id: seller?.id || product.seller_id,
        business_name: seller?.business_name || 'Unknown',
        average_rating: seller?.average_rating || 0,
      },
    };
  }


  async listProducts(
    filters: ProductFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { page: validPage, limit: validLimit } = this.validatePagination(
      page,
      limit
    );

    const conditions: string[] = ['sp.status = ?'];
    const params: any[] = ['active'];

    // Apply filters
    if (filters.grade) {
      conditions.push('sp.grade = ?');
      params.push(filters.grade);
    }

    if (filters.origin) {
      conditions.push('sp.origin LIKE ?');
      params.push(`%${filters.origin}%`);
    }

    if (filters.min_price !== undefined) {
      conditions.push('pv.price >= ?');
      params.push(filters.min_price);
    }

    if (filters.max_price !== undefined) {
      conditions.push('pv.price <= ?');
      params.push(filters.max_price);
    }

    const whereClause = conditions.join(' AND ');

    const query = `SELECT sp.*, 
        s.business_name AS seller_name,
        MIN(pv.price) AS min_price,
        MAX(pv.price) AS max_price,
        SUM(pv.stock_quantity) AS total_stock,
        ROUND(AVG(r.rating), 1) AS average_rating,
        COUNT(DISTINCT r.id) AS review_count
      FROM saffron_products sp
      JOIN sellers s ON sp.seller_id = s.id
      LEFT JOIN product_variants pv ON sp.id = pv.product_id
      LEFT JOIN reviews r ON sp.id = r.product_id
      WHERE ${whereClause}
      GROUP BY sp.id
      ORDER BY sp.created_at DESC`;

    return this.getPaginatedResults(query, params, validPage, validLimit);
  }
//product update 
  async updateProduct(
    productId: number,
    userId: number,
    data: Partial<CreateProductRequest>
  ): Promise<SaffronProduct> {
    const sellerId = await this.getSellerIdFromUserId(userId);

    const [existingRows] = await pool.query(
      'SELECT * FROM saffron_products WHERE id = ?',
      [productId]
    );
    const existing = (existingRows as any[])[0];

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (!(await this.isOwner(sellerId, existing.seller_id))) {
      throw new ForbiddenError('You can only update your own products');
    }

    const allowedFields = [
      'product_name',
      'description',
      'origin',
      'grade',
      'color_rating',
      'aroma_score',
      'iso_certification',
      'moisture_level',
    ];

    // Type coercion map to ensure correct types for MySQL
    const typeCoercions: Record<string, (val: any) => any> = {
      color_rating: (v) => parseInt(v, 10),
      aroma_score: (v) => parseInt(v, 10),
      iso_certification: (v) =>
        typeof v === 'string' ? v === 'true' || v === '1' : Boolean(v),
      moisture_level: (v) => parseFloat(v),
    };

    const setClauses: string[] = [];
    const updateParams: any[] = [];

    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        let value = (data as any)[field];
        if (typeCoercions[field]) {
          value = typeCoercions[field](value);
        }
        setClauses.push(`${field} = ?`);
        updateParams.push(value);
      }
    }

    if (setClauses.length === 0) {
      throw new NotFoundError('No fields to update');
    }

    // Execute update within a transaction
    const updated = await this.withTransaction(async (connection) => {
      await connection.query(
        `UPDATE saffron_products SET ${setClauses.join(', ')} WHERE id = ?`,
        [...updateParams, productId]
      );

      const [rows] = await connection.query(
        'SELECT * FROM saffron_products WHERE id = ?',
        [productId]
      );

      return (rows as any[])[0] as SaffronProduct;
    });

    return updated;
  }


  async deleteProduct(productId: number, userId: number): Promise<void> {

    const sellerId = await this.getSellerIdFromUserId(userId);
    const [existingRows] = await pool.query(
      'SELECT * FROM saffron_products WHERE id = ?',
      [productId]
    );
    const existing = (existingRows as any[])[0];

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (!(await this.isOwner(sellerId, existing.seller_id))) {
      throw new ForbiddenError('You can only delete your own products');
    }

    await pool.query(
      "UPDATE saffron_products SET status = 'archived' WHERE id = ?",
      [productId]
    );
  }

  async createVariant(
    productId: number,
    userId: number,
    data: CreateVariantRequest
  ): Promise<ProductVariant> {
    const sellerId = await this.getSellerIdFromUserId(userId);
    const [existingRows] = await pool.query(
      'SELECT * FROM saffron_products WHERE id = ?',
      [productId]
    );
    const existing = (existingRows as any[])[0];

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (!(await this.isOwner(sellerId, existing.seller_id))) {
      throw new ForbiddenError('You can only add variants to your own products');
    }
    const [skuRows] = await pool.query(
      'SELECT id FROM product_variants WHERE sku = ?',
      [data.sku]
    );
    if ((skuRows as any[]).length > 0) {
      throw new ConflictError(`SKU '${data.sku}' already exists`);
    }
    const variant = await this.withTransaction(async (connection) => {
      const [result] = await connection.query(
        `INSERT INTO product_variants 
          (product_id, sku, weight_grams, price, package_type, stock_quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productId,
          data.sku,
          data.weight_grams,
          data.price,
          data.package_type || null,
          data.stock_quantity,
        ]
      );

      const insertId = (result as any).insertId;

      const [rows] = await connection.query(
        'SELECT * FROM product_variants WHERE id = ?',
        [insertId]
      );

      return (rows as any[])[0] as ProductVariant;
    });

    return variant;
  }
}
export const productService = new ProductService();
