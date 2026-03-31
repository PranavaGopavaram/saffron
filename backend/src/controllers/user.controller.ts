import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { successResponse } from '../utils/api-response';
import { asyncHandler } from '../middleware/error.middleware';

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await userService.getProfile(userId);
    successResponse(res, profile, 'Profile retrieved successfully');
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await userService.updateProfile(userId, req.body);
    successResponse(res, profile, 'Profile updated successfully');
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
      return;
    }
    
    await userService.changePassword(userId, currentPassword, newPassword);
    successResponse(res, null, 'Password changed successfully');
  }),
};