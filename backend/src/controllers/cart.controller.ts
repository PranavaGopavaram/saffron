import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { cartService } from '../services/cart.service';
import { successResponse } from '../utils/api-response';
export const cartController = {
  addToCart: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const item = await cartService.addToCart(userId, req.body);
    successResponse(res, item, 'Item added to cart', 201);
  }),
  getCart: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);
    successResponse(res, cart, 'Cart retrieved successfully');
  }),
  updateCartItem: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cartItemId = parseInt(req.params.cartItemId as string, 10);
    const item = await cartService.updateCartItem(userId, cartItemId, req.body);
    successResponse(res, item, 'Cart item updated');
  }),
  removeCartItem: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cartItemId = parseInt(req.params.cartItemId as string, 10);
    await cartService.removeCartItem(userId, cartItemId);
    successResponse(res, null, 'Item removed from cart');
  }),
  clearCart: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await cartService.clearCart(userId);
    successResponse(res, null, 'Cart cleared');
  }),
  cleanupStaleItems: asyncHandler(async (req: Request, res: Response) => {
    const maxAgeHours = parseInt(req.query.maxAgeHours as string, 10) || 24;
    const deletedCount = await cartService.cleanupStaleCartItems(maxAgeHours);
    successResponse(res, { deletedCount }, 'Stale cart items cleaned up');
  }),
};
