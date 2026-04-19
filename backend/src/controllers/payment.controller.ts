import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { paymentService, CardDetails } from '../services/payment.service';
import { orderService } from '../services/order.service';
import { successResponse, BadRequestError } from '../utils/api-response';
import { pool } from '../config/database';

export const paymentController = {
  initiatePayment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount, currency = 'INR', metadata } = req.body;

    if (!amount || amount <= 0) {
      throw new BadRequestError('Valid amount is required');
    }

    const [buyerRows] = await pool.query(
      'SELECT id FROM buyers WHERE user_id = ?',
      [userId]
    );
    const buyer = (buyerRows as any[])[0];
    if (!buyer) {
      throw new BadRequestError('Buyer profile not found');
    }

    const paymentIntent = await paymentService.createPaymentIntent(
      buyer.id,
      amount,
      currency,
      metadata
    );

    successResponse(res, paymentIntent, 'Payment intent created successfully', 201);
  }),

  confirmPayment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { 
      paymentId, 
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      cardHolderName,
      orderId,
      amount 
    } = req.body;

    if (!paymentId) {
      throw new BadRequestError('Payment ID is required');
    }

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardHolderName) {
      throw new BadRequestError('Complete card details are required');
    }

    const cardDetails: CardDetails = {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolderName,
    };

    const confirmation = await paymentService.confirmPayment(paymentId, cardDetails);

    if (confirmation.success && orderId) {
        const [buyerRows] = await pool.query(
        'SELECT id FROM buyers WHERE user_id = ?',
        [userId]
      );
      const buyer = (buyerRows as any[])[0];

      if (buyer && amount) {
        await paymentService.recordTransaction(
          orderId,
          buyer.id,
          amount,
          confirmation
        );

        await paymentService.updateOrderPaymentStatus(orderId, 'completed');
      }
    }

    const message = confirmation.success 
      ? 'Payment confirmed successfully' 
      : `Payment failed: ${confirmation.error}`;

    successResponse(res, confirmation, message, confirmation.success ? 200 : 400);
  }),

  getPaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.paymentId as string;

    if (!paymentId) {
      throw new BadRequestError('Payment ID is required');
    }

    const status = await paymentService.getPaymentStatus(paymentId);
    successResponse(res, status, 'Payment status retrieved successfully');
  }),

  getOrderTransactions: asyncHandler(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId as string, 10);

    if (!orderId) {
      throw new BadRequestError('Order ID is required');
    }

    const transactions = await paymentService.getOrderTransactions(orderId);
    successResponse(res, transactions, 'Payment transactions retrieved successfully');
  }),

  processOrderPayment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      shippingAddressId,
      shippingCost,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolderName,
      amount,
    } = req.body;

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardHolderName) {
      throw new BadRequestError('Complete card details are required');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestError('Valid amount is required');
    }

    const [buyerRows] = await pool.query(
      'SELECT id FROM buyers WHERE user_id = ?',
      [userId]
    );
    const buyer = (buyerRows as any[])[0];
    if (!buyer) {
      throw new BadRequestError('Buyer profile not found');
    }

    const paymentIntent = await paymentService.createPaymentIntent(
      buyer.id,
      amount,
      'INR',
      { description: 'Order payment' }
    );

    const cardDetails: CardDetails = {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardHolderName,
    };

    const confirmation = await paymentService.confirmPayment(
      paymentIntent.paymentId,
      cardDetails
    );

    if (!confirmation.success) {
      successResponse(res, {
        success: false,
        paymentFailed: true,
        error: confirmation.error,
        errorCode: confirmation.errorCode,
      }, `Payment failed: ${confirmation.error}`, 400);
      return;
    }

    const order = await orderService.createOrder(userId, {
      shipping_address_id: shippingAddressId,
      shipping_cost: shippingCost,
    });

    await paymentService.recordTransaction(
      order.order.id,
      buyer.id,
      amount,
      confirmation
    );

    await paymentService.updateOrderPaymentStatus(order.order.id, 'completed');

    successResponse(res, {
      success: true,
      payment: confirmation,
      order: order,
    }, 'Payment processed and order created successfully', 201);
  }),
};
