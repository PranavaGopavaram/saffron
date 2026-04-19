import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/process-order',
  authMiddleware,
  requireRole(['buyer']),
  paymentController.processOrderPayment
);

router.post(
  '/initiate',
  authMiddleware,
  requireRole(['buyer']),
  paymentController.initiatePayment
);

router.post(
  '/confirm',
  authMiddleware,
  requireRole(['buyer']),
  paymentController.confirmPayment
);

router.get(
  '/order/:orderId/transactions',
  authMiddleware,
  paymentController.getOrderTransactions
);

router.get(
  '/:paymentId/status',
  authMiddleware,
  paymentController.getPaymentStatus
);

export default router;
