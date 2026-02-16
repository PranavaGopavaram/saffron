import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { reviewService } from '../services/review.service';
import { successResponse } from '../utils/api-response';

export const reviewController = {

//product reviews

  createProductReview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const productId = parseInt(req.params.productId as string, 10);
    const review = await reviewService.createProductReview(userId, productId, req.body);
    successResponse(res, review, 'Product review created successfully', 201);
  }),

  getProductReviews: asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId as string, 10);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const reviews = await reviewService.getProductReviews(productId, page, limit);
    successResponse(res, reviews, 'Product reviews retrieved successfully');
  }),

  getProductReviewSummary: asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId as string, 10);
    const summary = await reviewService.getProductReviewSummary(productId);
    successResponse(res, summary, 'Product review summary retrieved successfully');
  }),

  getMyProductReviews: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const reviews = await reviewService.getMyProductReviews(userId);
    successResponse(res, reviews, 'Your product reviews retrieved successfully');
  }),

  updateProductReview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const reviewId = parseInt(req.params.reviewId as string, 10);
    const review = await reviewService.updateProductReview(userId, reviewId, req.body);
    successResponse(res, review, 'Product review updated successfully');
  }),

  deleteProductReview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const reviewId = parseInt(req.params.reviewId as string, 10);
    await reviewService.deleteProductReview(userId, reviewId);
    successResponse(res, null, 'Product review deleted successfully');
  }),

//seller reviews

  createSellerReview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sellerId = parseInt(req.params.sellerId as string, 10);
    const review = await reviewService.createSellerReview(userId, sellerId, req.body);
    successResponse(res, review, 'Seller review created successfully', 201);
  }),

  getSellerReviews: asyncHandler(async (req: Request, res: Response) => {
    const sellerId = parseInt(req.params.sellerId as string, 10);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const reviews = await reviewService.getSellerReviews(sellerId, page, limit);
    successResponse(res, reviews, 'Seller reviews retrieved successfully');
  }),

  deleteSellerReview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const reviewId = parseInt(req.params.reviewId as string, 10);
    await reviewService.deleteSellerReview(userId, reviewId);
    successResponse(res, null, 'Seller review deleted successfully');
  }),
};
