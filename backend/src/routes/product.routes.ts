import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProductValidator,
  createVariantValidator,
  productSearchValidator,
} from '../utils/marketplace-validators';

const router = Router();


router.post(
  '/',
  authMiddleware,
  requireRole(['seller']),
  createProductValidator,
  validate,
  productController.createProduct
);

router.get('/', productSearchValidator, validate, productController.listProducts);

router.get('/:id', productController.getProduct);
router.put(
  '/:id',
  authMiddleware,
  requireRole(['seller']),
  createProductValidator,
  validate,
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['seller']),
  productController.deleteProduct
);

router.post(
  '/:productId/variants',
  authMiddleware,
  requireRole(['seller']),
  createVariantValidator,
  validate,
  productController.createVariant
);

export default router;
