import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { orderService } from '../services/order.service';
import { successResponse } from '../utils/api-response';
export const orderController = {
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const order = await orderService.createOrder(userId, req.body);
    successResponse(res, order, 'Order placed successfully', 201);
  }),
  getBuyerOrders: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orders = await orderService.listBuyerOrders(userId, page, limit);
    successResponse(res, orders, 'Buyer orders retrieved successfully');
  }),
  getSellerOrders: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orders = await orderService.listSellerOrders(userId, page, limit);
    successResponse(res, orders, 'Seller orders retrieved successfully');
  }),


  getOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;
    const orderId = parseInt(req.params.orderId as string, 10);
    const order = await orderService.getOrder(userId, orderId, role);
    successResponse(res, order, 'Order retrieved successfully');
  }),

  cancelOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const orderId = parseInt(req.params.orderId as string, 10);
    const order = await orderService.cancelOrder(userId, orderId);
    successResponse(res, order, 'Order cancelled successfully');
  }),

  updateItemStatus: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const orderId = parseInt(req.params.orderId as string, 10);
    const itemId = parseInt(req.params.itemId as string, 10);
    const item = await orderService.updateItemStatus(userId, orderId, itemId, req.body);
    successResponse(res, item, 'Order item status updated');
  }),
};