import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplace.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createAddressValidator,
  updateAddressValidator,
  updateBuyerProfileValidator,
  updateSellerProfileValidator,
} from '../utils/marketplace-validators';

const router = Router();
router.get(
  '/profile/buyer',
  authMiddleware,
  requireRole(['buyer']),
  marketplaceController.getBuyerProfile
);

router.put(
  '/profile/buyer',
  authMiddleware,
  requireRole(['buyer']),
  updateBuyerProfileValidator,
  validate,
  marketplaceController.updateBuyerProfile
);

router.get(
  '/profile/seller',
  authMiddleware,
  requireRole(['seller']),
  marketplaceController.getSellerProfile
);

router.put(
  '/profile/seller',
  authMiddleware,
  requireRole(['seller']),
  updateSellerProfileValidator,
  validate,
  marketplaceController.updateSellerProfile
);

router.get(
  '/profile/seller/stats',
  authMiddleware,
  requireRole(['seller']),
  marketplaceController.getSellerStats
);
router.get(
  '/profile/seller/dashboard',
  authMiddleware,
  requireRole(['seller']),
  marketplaceController.getSellerDashboard
);

router.get(
  '/addresses',
  authMiddleware,
  marketplaceController.listAddresses
);

router.post(
  '/addresses',
  authMiddleware,
  createAddressValidator,
  validate,
  marketplaceController.createAddress
);

router.get(
  '/addresses/:addressId',
  authMiddleware,
  marketplaceController.getAddress
);

router.put(
  '/addresses/:addressId',
  authMiddleware,
  updateAddressValidator,
  validate,
  marketplaceController.updateAddress
);

router.delete(
  '/addresses/:addressId',
  authMiddleware,
  marketplaceController.deleteAddress
);

export default router;
