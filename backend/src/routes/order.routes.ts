import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createOrderValidator,
  cancelOrderValidator,
  updateItemStatusValidator,
} from '../utils/marketplace-validators';
const router = Router();


router.post(
  '/',
  authMiddleware,
  requireRole(['buyer']),
  createOrderValidator,
  validate,
  orderController.createOrder
);
router.get(
    '/my-orders',
    authMiddleware,
    requireRole(['buyer']),
    orderController.getBuyerOrders
  );

router.get(
    '/seller-orders',
    authMiddleware,
    requireRole(['seller']),
    orderController.getSellerOrders
  );

router.get(
    '/:orderId',
    authMiddleware,
    orderController.getOrder
  );

router.patch(
    '/:orderId/cancel',
    authMiddleware,
    requireRole(['buyer']),
    cancelOrderValidator,
    validate,
    orderController.cancelOrder
  );

  router.patch(
    '/:orderId/items/:itemId/cancel',
    authMiddleware,
    requireRole(['buyer']),
    orderController.cancelItem
  );

  router.patch(
    '/:orderId/items/:itemId/status',
    authMiddleware,
    requireRole(['seller']),
    updateItemStatusValidator,
    validate,
    orderController.updateItemStatus
  );
  export default router;