import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  addToCartValidator,
  updateCartValidator,
} from '../utils/marketplace-validators';
const router = Router();

router.post(
  '/',
  authMiddleware,
  requireRole(['buyer']),
  addToCartValidator,
  validate,
  cartController.addToCart
);

router.get(
  '/',
  authMiddleware,
  requireRole(['buyer']),
  cartController.getCart
);

router.delete(
  '/',
  authMiddleware,
  requireRole(['buyer']),
  cartController.clearCart
);


router.post(
  '/cleanup',
  authMiddleware,
  requireRole(['seller']),
  cartController.cleanupStaleItems
);


router.put(
  '/:cartItemId',
  authMiddleware,
  requireRole(['buyer']),
  updateCartValidator,
  validate,
  cartController.updateCartItem
);




router.delete(
  '/:cartItemId',
  authMiddleware,
  requireRole(['buyer']),
  cartController.removeCartItem
);
export default router;