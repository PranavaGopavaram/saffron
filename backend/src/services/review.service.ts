import { pool } from '../config/database';
import { MarketplaceBaseService } from './marketplace.base';
import {
  ProductReview,
  ProductReviewWithBuyer,
  SellerReview,
  SellerReviewWithBuyer,
  ReviewSummary,
  CreateProductReviewRequest,
  UpdateProductReviewRequest,
  CreateSellerReviewRequest,
} from '../models/review.model';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/api-response';

class ReviewService extends MarketplaceBaseService {
  async createProductReview(
    userId: number,
    productId: number,
    data: CreateProductReviewRequest
  ): Promise<ProductReview> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
    const [productRows] = await pool.query(
      'SELECT id, seller_id FROM saffron_products WHERE id = ?',
      [productId]
    );
    const product = (productRows as any[])[0];
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    const [orderRows] = await pool.query(
      `SELECT o.id AS order_id
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE o.buyer_id = ?
         AND pv.product_id = ?
         AND oi.item_status = 'delivered'
       LIMIT 1`,
      [buyerId, productId]
    );
    const deliveredOrder = (orderRows as any[])[0];
    if (!deliveredOrder) {
      throw new ForbiddenError('You can only review products from delivered orders');
    }
    const [existingRows] = await pool.query(
      'SELECT id FROM reviews WHERE buyer_id = ? AND product_id = ?',
      [buyerId, productId]
    );
    if ((existingRows as any[]).length > 0) {
      throw new ConflictError('You have already reviewed this product');
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (order_id, product_id, buyer_id, seller_id, rating, title, comment, authenticity_verified, would_recommend)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deliveredOrder.order_id,
        productId,
        buyerId,
        product.seller_id,
        data.rating,
        data.title || null,
        data.comment || null,
        data.authenticity_verified || false,
        data.would_recommend || false,
      ]
    );
    const insertId = (result as any).insertId;

    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE id = ?',
      [insertId]
    );
    return (rows as any[])[0] as ProductReview;
  }
  async getProductReviews(
    productId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: ProductReviewWithBuyer[]; total: number; page: number; limit: number }> {
    const { page: p, limit: l } = this.validatePagination(page, limit);
    const [productRows] = await pool.query(
      'SELECT id FROM saffron_products WHERE id = ?',
      [productId]
    );
    if ((productRows as any[]).length === 0) {
      throw new NotFoundError('Product not found');
    }

    return this.getPaginatedResults(
      `SELECT r.*, u.full_name AS buyer_name
       FROM reviews r
       JOIN buyers b ON r.buyer_id = b.id
       JOIN users u ON b.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId],
      p,
      l
    );
  }
  async getProductReviewSummary(productId: number): Promise<ReviewSummary> {
    const [rows] = await pool.query(
      `SELECT
         COALESCE(AVG(rating), 0) AS average_rating,
         COUNT(*) AS total_reviews,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS r1,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS r2,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS r3,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS r4,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS r5
       FROM reviews
       WHERE product_id = ?`,
      [productId]
    );
    const row = (rows as any[])[0];

    return {
      average_rating: parseFloat(row.average_rating) || 0,
      total_reviews: row.total_reviews || 0,
      rating_breakdown: {
        1: row.r1 || 0,
        2: row.r2 || 0,
        3: row.r3 || 0,
        4: row.r4 || 0,
        5: row.r5 || 0,
      },
    };
  }
  async getMyProductReviews(userId: number): Promise<ProductReviewWithBuyer[]> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    const [rows] = await pool.query(
      `SELECT r.*, u.full_name AS buyer_name, sp.product_name
       FROM reviews r
       JOIN buyers b ON r.buyer_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN saffron_products sp ON r.product_id = sp.id
       WHERE r.buyer_id = ?
       ORDER BY r.created_at DESC`,
      [buyerId]
    );
    return rows as ProductReviewWithBuyer[];
  }
  async updateProductReview(
    userId: number,
    reviewId: number,
    data: UpdateProductReviewRequest
  ): Promise<ProductReview> {
    const buyerId = await this.getBuyerIdFromUserId(userId);
    const [existingRows] = await pool.query(
      'SELECT * FROM reviews WHERE id = ?',
      [reviewId]
    );
    const existing = (existingRows as any[])[0];
    if (!existing) {
      throw new NotFoundError('Review not found');
    }
    if (existing.buyer_id !== buyerId) {
      throw new ForbiddenError('You can only update your own reviews');
    }

    const setClauses: string[] = [];
    const params: any[] = [];

    const allowedFields = ['rating', 'title', 'comment', 'authenticity_verified', 'would_recommend'];
    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        params.push((data as any)[field]);
      }
    }

    if (setClauses.length === 0) {
      return existing as ProductReview;
    }

    params.push(reviewId);
    await pool.query(
      `UPDATE reviews SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );

    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE id = ?',
      [reviewId]
    );
    return (rows as any[])[0] as ProductReview;
  }
  async deleteProductReview(userId: number, reviewId: number): Promise<void> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    const [existingRows] = await pool.query(
      'SELECT * FROM reviews WHERE id = ?',
      [reviewId]
    );
    const existing = (existingRows as any[])[0];
    if (!existing) {
      throw new NotFoundError('Review not found');
    }
    if (existing.buyer_id !== buyerId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
  }
  async createSellerReview(
    userId: number,
    sellerId: number,
    data: CreateSellerReviewRequest
  ): Promise<SellerReview> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    const [sellerRows] = await pool.query(
      'SELECT id FROM sellers WHERE id = ?',
      [sellerId]
    );
    if ((sellerRows as any[]).length === 0) {
      throw new NotFoundError('Seller not found');
    }
    const [orderRows] = await pool.query(
      `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.buyer_id = ?
         AND oi.seller_id = ?
         AND oi.item_status = 'delivered'
       LIMIT 1`,
      [buyerId, sellerId]
    );
    if ((orderRows as any[]).length === 0) {
      throw new ForbiddenError('You can only review sellers you have received deliveries from');
    }
    const [existingRows] = await pool.query(
      'SELECT id FROM seller_reviews WHERE buyer_id = ? AND seller_id = ?',
      [buyerId, sellerId]
    );
    if ((existingRows as any[]).length > 0) {
      throw new ConflictError('You have already reviewed this seller');
    }

    const [result] = await pool.query(
      `INSERT INTO seller_reviews (seller_id, buyer_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [sellerId, buyerId, data.rating, data.comment || null]
    );
    const insertId = (result as any).insertId;

    const [rows] = await pool.query(
      'SELECT * FROM seller_reviews WHERE id = ?',
      [insertId]
    );
    return (rows as any[])[0] as SellerReview;
  }

  async getSellerReviews(
    sellerId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: SellerReviewWithBuyer[]; total: number; page: number; limit: number }> {
    const { page: p, limit: l } = this.validatePagination(page, limit);

    const [sellerRows] = await pool.query(
      'SELECT id FROM sellers WHERE id = ?',
      [sellerId]
    );
    if ((sellerRows as any[]).length === 0) {
      throw new NotFoundError('Seller not found');
    }

    return this.getPaginatedResults(
      `SELECT sr.*, u.full_name AS buyer_name
       FROM seller_reviews sr
       JOIN buyers b ON sr.buyer_id = b.id
       JOIN users u ON b.user_id = u.id
       WHERE sr.seller_id = ?
       ORDER BY sr.created_at DESC`,
      [sellerId],
      p,
      l
    );
  }

  async deleteSellerReview(userId: number, reviewId: number): Promise<void> {
    const buyerId = await this.getBuyerIdFromUserId(userId);

    const [existingRows] = await pool.query(
      'SELECT * FROM seller_reviews WHERE id = ?',
      [reviewId]
    );
    const existing = (existingRows as any[])[0];
    if (!existing) {
      throw new NotFoundError('Seller review not found');
    }
    if (existing.buyer_id !== buyerId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await pool.query('DELETE FROM seller_reviews WHERE id = ?', [reviewId]);
  }
}

export const reviewService = new ReviewService();
