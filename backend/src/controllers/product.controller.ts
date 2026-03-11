import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { productService } from '../services/product.service';
import { successResponse } from '../utils/api-response';
import { NotFoundError } from '../utils/api-response';

export const productController = {

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const product = await productService.createProduct(userId, req.body);
    successResponse(res, product, 'Product created successfully', 201);
  }),

  getProduct: asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id as string, 10);
    const product = await productService.getProduct(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    successResponse(res, product, 'Product retrieved successfully');
  }),

  listProducts: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const filters = {
      grade: req.query.grade as string | undefined,
      origin: req.query.origin as string | undefined,
      min_price: req.query.min_price
        ? parseFloat(req.query.min_price as string)
        : undefined,
      max_price: req.query.max_price
        ? parseFloat(req.query.max_price as string)
        : undefined,
      search: req.query.search as string | undefined,
      sort: req.query.sort as string | undefined,
    };

    const result = await productService.listProducts(filters, page, limit);
    successResponse(res, result, 'Products retrieved successfully');
  }),
  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id as string, 10);
    const userId = req.user!.id;
    const product = await productService.updateProduct(
      productId,
      userId,
      req.body
    );
    successResponse(res, product, 'Product updated successfully');
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id as string, 10);
    const userId = req.user!.id;
    await productService.deleteProduct(productId, userId);
    successResponse(res, null, 'Product archived successfully');
  }),

  createVariant: asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId as string, 10);
    const userId = req.user!.id;
    const variant = await productService.createVariant(
      productId,
      userId,
      req.body
    );
    successResponse(res, variant, 'Variant created successfully', 201);
  }),
};
