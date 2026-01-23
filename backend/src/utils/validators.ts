import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

/**
 * Registration Validation Rules
 */
export const validateRegistration = [
  // Basic fields
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be either buyer or seller'),
  
  // Buyer-specific fields
  body('companyName')
    .optional()
    .trim(),
  
  body('shippingAddress.street')
    .if(body('role').equals('buyer'))
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('shippingAddress.city')
    .if(body('role').equals('buyer'))
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.state')
    .if(body('role').equals('buyer'))
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('shippingAddress.zip_code')
    .if(body('role').equals('buyer'))
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('shippingAddress.country')
    .if(body('role').equals('buyer'))
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  // Seller-specific fields
  body('businessName')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Business name is required for sellers'),
  
  body('businessAddress.street')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('businessAddress.city')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('businessAddress.state')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('businessAddress.zip_code')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('businessAddress.country')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('taxId')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Tax ID is required for sellers'),
  
  body('saffronSource')
    .if(body('role').equals('seller'))
    .trim()
    .notEmpty()
    .withMessage('Saffron source information is required for sellers')
    .isLength({ min: 10 })
    .withMessage('Saffron source description must be at least 10 characters'),
  
  // Run validation
  validate
];

/**
 * Login Validation Rules
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  // Run validation
  validate
];
