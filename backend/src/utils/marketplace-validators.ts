import { body, param, query, validationResult } from 'express-validator';

export const createProductValidator = [
  body('product_name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Origin must be between 2 and 100 characters'),

  body('grade')
    .isIn(['premium', 'first', 'second', 'third'])
    .withMessage('Grade must be one of: premium, first, second, third'),

  body('color_rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Color rating must be between 1 and 10'),

  body('aroma_score')
    .isInt({ min: 1, max: 10 })
    .withMessage('Aroma score must be between 1 and 10'),

  body('iso_certification')
    .isBoolean()
    .withMessage('ISO certification must be a boolean'),

  body('moisture_level')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Moisture level must be between 0 and 100 percent'),
];

export const createVariantValidator = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .matches(/^[A-Z0-9\-]+$/)
    .withMessage('SKU must contain only uppercase letters, numbers, and hyphens'),

  body('weight_grams')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Weight must be between 1 and 10000 grams'),

  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),

  body('package_type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Package type must be between 1 and 50 characters'),

  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be 0 or greater'),
];


export const addToCartValidator = [
  body('variant_id')
    .isInt({ min: 1 })
    .withMessage('Variant ID must be a positive integer'),

  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
];


export const updateCartValidator = [
  param('cartItemId')
    .isInt({ min: 1 })
    .withMessage('Cart item ID must be a positive integer'),

  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
];


export const createOrderValidator = [
  body('shipping_address_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Shipping address ID must be a positive integer'),
];

export const cancelOrderValidator = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
];

export const updateItemStatusValidator = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  param('itemId')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer'),
  body('item_status')
    .isIn(['confirmed', 'shipped', 'delivered'])
    .withMessage('Item status must be one of: confirmed, shipped, delivered'),
];


export const createProductReviewValidator = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Review title must be between 3 and 255 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),

  body('authenticity_verified')
    .optional()
    .isBoolean()
    .withMessage('authenticity_verified must be a boolean'),

  body('would_recommend')
    .optional()
    .isBoolean()
    .withMessage('would_recommend must be a boolean'),
];

export const updateProductReviewValidator = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Review title must be between 3 and 255 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),

  body('authenticity_verified')
    .optional()
    .isBoolean()
    .withMessage('authenticity_verified must be a boolean'),

  body('would_recommend')
    .optional()
    .isBoolean()
    .withMessage('would_recommend must be a boolean'),
];

export const createSellerReviewValidator = [
  param('sellerId')
    .isInt({ min: 1 })
    .withMessage('Seller ID must be a positive integer'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
];

export const reviewIdValidator = [
  param('reviewId')
    .isInt({ min: 1 })
    .withMessage('Review ID must be a positive integer'),
];


export const productSearchValidator = [
  query('grade')
    .optional()
    .isIn(['premium', 'first', 'second', 'third'])
    .withMessage('Invalid grade'),

  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),

  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),

  query('origin')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Origin must be between 1 and 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];



export const idValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
];


// ─── Marketplace validators ───

export const createAddressValidator = [
  body('type')
    .isIn(['shipping', 'business'])
    .withMessage('Address type must be either shipping or business'),

  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Street must be between 2 and 255 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('zip_code')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Zip code must be between 2 and 20 characters'),

  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean'),
];

export const updateAddressValidator = [
  param('addressId')
    .isInt({ min: 1 })
    .withMessage('Address ID must be a positive integer'),

  body('street')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Street must be between 2 and 255 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),

  body('zip_code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Zip code must be between 2 and 20 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),

  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean'),
];

export const updateBuyerProfileValidator = [
  body('company_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),
];

export const updateSellerProfileValidator = [
  body('business_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Business name must be between 2 and 255 characters'),

  body('saffron_source')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Saffron source must be between 10 and 1000 characters'),
];
