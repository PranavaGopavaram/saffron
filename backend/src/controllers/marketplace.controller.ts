import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { marketplaceService } from '../services/marketplace.service';
import { successResponse } from '../utils/api-response';

export const marketplaceController = {

  //buyer profile

  getBuyerProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await marketplaceService.getBuyerProfile(userId);
    successResponse(res, profile, 'Buyer profile retrieved successfully');
  }),

  updateBuyerProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await marketplaceService.updateBuyerProfile(userId, req.body);
    successResponse(res, profile, 'Buyer profile updated successfully');
  }),

  // seller profile and dashboard

  getSellerProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await marketplaceService.getSellerProfile(userId);
    successResponse(res, profile, 'Seller profile retrieved successfully');
  }),

  updateSellerProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await marketplaceService.updateSellerProfile(userId, req.body);
    successResponse(res, profile, 'Seller profile updated successfully');
  }),

  getSellerStats: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await marketplaceService.getSellerStats(userId);
    successResponse(res, stats, 'Seller stats retrieved successfully');
  }),

  getSellerDashboard: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const dashboard = await marketplaceService.getSellerDashboard(userId);
    successResponse(res, dashboard, 'Seller dashboard retrieved successfully');
  }),

  listAddresses: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const addresses = await marketplaceService.listAddresses(userId);
    successResponse(res, addresses, 'Addresses retrieved successfully');
  }),

  getAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const addressId = parseInt(req.params.addressId as string, 10);
    const address = await marketplaceService.getAddress(userId, addressId);
    successResponse(res, address, 'Address retrieved successfully');
  }),

  createAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const address = await marketplaceService.createAddress(userId, req.body);
    successResponse(res, address, 'Address created successfully', 201);
  }),

  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const addressId = parseInt(req.params.addressId as string, 10);
    const address = await marketplaceService.updateAddress(userId, addressId, req.body);
    successResponse(res, address, 'Address updated successfully');
  }),

  deleteAddress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const addressId = parseInt(req.params.addressId as string, 10);
    await marketplaceService.deleteAddress(userId, addressId);
    successResponse(res, null, 'Address deleted successfully');
  }),
};
