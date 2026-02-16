import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProductReviewValidator,
  updateProductReviewValidator,
  createSellerReviewValidator,
  reviewIdValidator,
} from '../utils/marketplace-validators';

const router = Router();

router.get(
  '/my',
  authMiddleware,
  requireRole(['buyer']),
  reviewController.getMyProductReviews
);

router.post(
  '/products/:productId',
  authMiddleware,
  requireRole(['buyer']),
  createProductReviewValidator,
  validate,
  reviewController.createProductReview
);

router.get(
  '/products/:productId',
  reviewController.getProductReviews
);

router.get(
  '/products/:productId/summary',
  reviewController.getProductReviewSummary
);

router.put(
  '/:reviewId',
  authMiddleware,
  requireRole(['buyer']),
  updateProductReviewValidator,
  validate,
  reviewController.updateProductReview
);

router.delete(
  '/:reviewId',
  authMiddleware,
  requireRole(['buyer']),
  reviewIdValidator,
  validate,
  reviewController.deleteProductReview
);

router.post(
  '/sellers/:sellerId',
  authMiddleware,
  requireRole(['buyer']),
  createSellerReviewValidator,
  validate,
  reviewController.createSellerReview
);

router.get(
  '/sellers/:sellerId',
  reviewController.getSellerReviews
);

router.delete(
  '/sellers/:reviewId',
  authMiddleware,
  requireRole(['buyer']),
  reviewIdValidator,
  validate,
  reviewController.deleteSellerReview
);

export default router;
